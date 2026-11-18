/* Existing matrix implementation, loaded by the shared core asset boundary. */
O46Core.matrix = function () {
    if (O46Core.installed.matrix) return;
(function () {
  // === SETTINGS ===
  var STOCK_CAP = 200;                  // Anzeige + Kauf/Clamp Maximum
  var FETCH_TIMEOUT_MS = 6000;          // Fallback for one variation
  var BATCH_TIMEOUT_MS = 30000;         // Transport timeout for the more expensive multi-search
  var BATCH_MAX_IDS = 300;              // VariationBatchResource limit per request
  var CONCURRENCY = 6;                  // nur für Fallback-Einzelcalls bei Varianten-Daten

  // Add-to-basket: EIN Batch-POST statt mehrere Einzel-POSTs
  var ADD_TIMEOUT_MS = 90000;           // max. Wartezeit auf den Batch-Add
  var BASKET_BATCH_ENDPOINT = "/rest/io/basket/items/";

  // Vorprüfung + Fehlerfall-Absicherung
  var BASKET_GET_TIMEOUT_MS = 12000;

  // Notice Box
  var EG_NOTICE_FORCE = true;
  var EG_NOTICE_TTL_MS = 6000;
  var EG_NOTICE_OFFSET_Y = 10;
  var EG_NOTICE_GAP_Y = 10;
  var EG_NOTICE_MAX = 3;

  // === PERF SAFETY: Script nur 1x laden ===
  if (window.__egSizeMatrixLoaded) return;
  window.__egSizeMatrixLoaded = true;

  // One observer per loaded matrix module, not per row or quickview opening.
  var matrixStickyFrame = null;
  function updateMatrixStickyOffset() {
    if (matrixStickyFrame != null) return;
    matrixStickyFrame = window.requestAnimationFrame(function () {
      matrixStickyFrame = null;
      var header = document.querySelector(".stickyhead");
      var offset = 0;
      if (header) {
        var style = window.getComputedStyle(header);
        if (style.position === "sticky" || style.position === "fixed") {
          offset = Math.ceil(header.getBoundingClientRect().height) + Math.max(0, parseFloat(style.top) || 0);
        }
      }
      var value = offset + "px";
      if (document.documentElement.style.getPropertyValue("--eg-matrix-sticky-top") !== value) {
        document.documentElement.style.setProperty("--eg-matrix-sticky-top", value);
      }
    });
  }
  updateMatrixStickyOffset();
  window.addEventListener("resize", updateMatrixStickyOffset, { passive: true });
  var matrixStickyHeader = document.querySelector(".stickyhead");
  if (matrixStickyHeader && window.ResizeObserver) {
    new ResizeObserver(updateMatrixStickyOffset).observe(matrixStickyHeader);
  }

  // One shared observer fits headings to their actual cells, without row listeners.
  function fitMatrixHeadingLabels(head) {
    if (!head || !head.isConnected || !head.getBoundingClientRect().width) return;
    var choices = [];
    var cells = head.querySelectorAll("[data-eg-col]");
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      if (!cell.clientWidth) continue;
      var full = cell.querySelector(".eg-label-full");
      if (!full) continue;
      var style = window.getComputedStyle(cell);
      var available = cell.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      // Resolved CSS widths share clientWidth's coordinate space, including CSS zoom.
      var fullWidth = parseFloat(window.getComputedStyle(full).width);
      choices.push({ cell: cell, short: fullWidth > available + 0.25 });
    }
    choices.forEach(function (choice) {
      choice.cell.classList.toggle("eg-use-short-label", choice.short);
    });
    head.setAttribute("data-eg-labels-ready", "");
  }
  function refreshMatrixHeadingLabels() {
    document.querySelectorAll(".eg-size-matrix-head").forEach(fitMatrixHeadingLabels);
  }
  var matrixHeadingObserver = window.ResizeObserver ? new ResizeObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.target.isConnected) matrixHeadingObserver.unobserve(entry.target);
      else fitMatrixHeadingLabels(entry.target);
    });
  }) : null;
  function initMatrixHeadingLabels(matrix) {
    var head = matrix.querySelector(".eg-size-matrix-head");
    if (!head) return;
    if (matrixHeadingObserver) matrixHeadingObserver.observe(head);
    fitMatrixHeadingLabels(head);
  }
  function releaseMatrixHeadingLabels(root) {
    if (!matrixHeadingObserver || !root || root.nodeType !== 1 || root.isConnected) return;
    if (root.matches(".eg-size-matrix-head")) matrixHeadingObserver.unobserve(root);
    root.querySelectorAll(".eg-size-matrix-head").forEach(function (head) { matrixHeadingObserver.unobserve(head); });
  }
  if (!matrixHeadingObserver) window.addEventListener("resize", refreshMatrixHeadingLabels, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refreshMatrixHeadingLabels);

  // === CURRENCY / LOCALE ===
  function detectLocale() {
    var l = (document.documentElement.getAttribute("lang") || "").trim();
    if (!l) return "de-DE";
    if (l.indexOf("-") !== -1) return l;
    if (l === "de") return "de-DE";
    if (l === "en") return "en-US";
    if (l === "fr") return "fr-FR";
    if (l === "it") return "it-IT";
    if (l === "es") return "es-ES";
    return l;
  }

  function detectLangShort() {
    var l = (document.documentElement.getAttribute("lang") || "").trim().toLowerCase();
    if (!l) return "de";
    if (l.indexOf("-") !== -1) l = l.split("-")[0];
    if (l === "de" || l === "en" || l === "fr" || l === "it" || l === "es") return l;
    return "de";
  }

  function extractCurrencySymbol(text) {
    text = (text == null) ? "" : String(text);
    text = text.replace(/\s+/g, " ").trim();
    if (!text) return "";

    var m = text.match(/[€$£¥₺₽₩₪₹₫฿₴₦]/);
    if (m && m[0]) return m[0];

    var iso = text.toUpperCase().match(/\b([A-Z]{3})\b/);
    if (iso && iso[1]) {
      var map = {
        EUR: "€",
        USD: "$",
        GBP: "£",
        JPY: "¥",
        CNY: "¥",
        CHF: "CHF",
        PLN: "PLN",
        SEK: "SEK",
        NOK: "NOK",
        DKK: "DKK"
      };
      return map[iso[1]] || iso[1];
    }

    return "";
  }

  function detectCurrencySymbolFromHeader() {
    var selectors = [
      '[data-eg-title="Currency"]',
      '[data-eg-handler="modalContent"][data-eg-title="Currency"]',
      '[data-title="Currency"]',
      '[data-eg-currency]',
      '[data-currency]'
    ];

    for (var i = 0; i < selectors.length; i++) {
      var btn = document.querySelector(selectors[i]);
      if (!btn) continue;

      var sym = extractCurrencySymbol(btn.textContent || "");
      if (sym) return sym;
    }

    return "";
  }

  function detectCurrencySymbolFromAnyPrice() {
    var el =
      document.querySelector(".single-item-price") ||
      document.querySelector("[data-eg-item-price]") ||
      document.querySelector("[itemprop='price']") ||
      document.querySelector("[data-price]");

    if (!el) return "";

    var txt = "";
    try {
      txt = (el.closest && el.closest(".single-item-price") ? el.closest(".single-item-price").textContent : el.textContent) || "";
    } catch (e) {
      txt = el.textContent || "";
    }

    return extractCurrencySymbol(txt);
  }

  var EG_LOCALE = detectLocale();
  var EG_LANG = detectLangShort();
  var EG_CURRENCY_SYMBOL = detectCurrencySymbolFromHeader() || detectCurrencySymbolFromAnyPrice() || "€";

  var EG_NUMBER_FORMAT = new Intl.NumberFormat(EG_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  function maybeRefreshCurrencySymbol() {
    var s = detectCurrencySymbolFromHeader() || detectCurrencySymbolFromAnyPrice();
    if (s) EG_CURRENCY_SYMBOL = s;
  }

  // === I18N ===
  var EG_I18N = {
    de: {
      add_start: "Wird hinzugefügt...Bitte warten",
      add_uncertain: "Warenkorb bitte vor dem erneuten Hinzufügen prüfen.",
      added_ok: "Hinzugefügt ✓",
      not_addable: "Nicht verfügbar",
      err_add_fallback: "Fehler beim Hinzufügen.",
      info_some_limited: "Einige Mengen wurden an Bestand/Maximalmenge angepasst.",
      info_nothing_addable: "Nichts hinzugefügt – die gewünschte Menge ist bereits im Warenkorb oder aktuell nicht verfügbar."
    },
    en: {
      add_start: "Adding...Please wait",
      add_uncertain: "Please check your basket before adding again.",
      added_ok: "Added ✓",
      not_addable: "Not available",
      err_add_fallback: "Error adding item.",
      info_some_limited: "Some quantities were adjusted to stock/order limits.",
      info_nothing_addable: "Nothing added – the requested quantity is already in the basket or currently unavailable."
    },
    fr: {
      add_start: "Ajout en cours...Veuillez patienter",
      add_uncertain: "Veuillez vérifier votre panier avant un nouvel ajout.",
      added_ok: "Ajouté ✓",
      not_addable: "Indisponible",
      err_add_fallback: "Erreur lors de l'ajout.",
      info_some_limited: "Certaines quantités ont été ajustées selon le stock/les limites.",
      info_nothing_addable: "Rien n’a été ajouté – la quantité demandée est déjà dans le panier ou indisponible."
    },
    it: {
      add_start: "Aggiunta in corso...attendere",
      add_uncertain: "Controlla il carrello prima di aggiungere di nuovo.",
      added_ok: "Aggiunto ✓",
      not_addable: "Non disponibile",
      err_add_fallback: "Errore durante l'aggiunta.",
      info_some_limited: "Alcune quantità sono state adattate a stock/limiti.",
      info_nothing_addable: "Niente aggiunto – la quantità richiesta è già nel carrello o non disponibile."
    },
    es: {
      add_start: "Añadiendo...Espere",
      add_uncertain: "Comprueba la cesta antes de volver a añadir.",
      added_ok: "Añadido ✓",
      not_addable: "No disponible",
      err_add_fallback: "Error al añadir.",
      info_some_limited: "Algunas cantidades se ajustaron a stock/límites.",
      info_nothing_addable: "No se añadió nada – la cantidad solicitada ya está en el carrito o no está disponible."
    }
  };

  function t(key) {
    var pack = EG_I18N[EG_LANG] || EG_I18N.de;
    return (pack && pack[key]) ? pack[key] : (EG_I18N.de[key] || key);
  }

  (function watchCurrencySymbol() {
    if (!window.MutationObserver) return;

    var btn = document.querySelector('[data-eg-title="Currency"]') ||
              document.querySelector('[data-eg-handler="modalContent"][data-eg-title="Currency"]');

    if (!btn) return;

    var mo = new MutationObserver(function () {
      var sym = extractCurrencySymbol(btn.textContent || "");
      if (sym) EG_CURRENCY_SYMBOL = sym;
    });

    mo.observe(btn, { childList: true, subtree: true, characterData: true });
  })();

  // === HELPERS ===
  function formatEuro(n) {
    n = (typeof n === "number" && isFinite(n)) ? n : 0;
    return EG_NUMBER_FORMAT.format(n) + " " + EG_CURRENCY_SYMBOL;
  }

  function toInt(v) {
    var n = parseInt(v, 10);
    return isFinite(n) ? n : 0;
  }

  function getVariationsJson(matrix) {
    var wrap = matrix.closest("[data-item-variation][data-eg-variations]");
    if (!wrap) return null;

    var raw = wrap.getAttribute("data-eg-variations");
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function safeParseJsonAttr(el, attrName, fallback) {
    fallback = fallback || [];
    if (!el) return fallback;

    var raw = el.getAttribute(attrName);
    if (!raw) return fallback;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function getAttrValueId(v, attrId) {
    if (!v || !v.attributes) return null;

    for (var i = 0; i < v.attributes.length; i++) {
      var a = v.attributes[i];
      if (String(a.attributeId) === String(attrId)) {
        return a.attributeValueId != null ? String(a.attributeValueId) : null;
      }
    }

    return null;
  }

  function buildValueNameMap(values) {
    var map = {};

    (values || []).forEach(function (v) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = v.name != null ? String(v.name) : "";
    });

    return map;
  }

  function buildValueImageMap(values) {
    var map = {};

    (values || []).forEach(function (v) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = v.imageUrl != null ? String(v.imageUrl) : "";
    });

    return map;
  }

  function normalizeImgUrl(u) {
    u = (u == null) ? "" : String(u);
    u = u.trim();
    if (!u) return "";

    u = u.replace(/\\/g, "/");

    if (/^https?:\/\//i.test(u)) return u;

    if (u.charAt(0) !== "/") u = "/" + u;
    u = u.replace(/\/{2,}/g, "/");

    return u;
  }

  function buildOrderMap(values) {
    var map = {};

    (values || []).forEach(function (v, idx) {
      var id = v && (v.attributeValueId != null ? v.attributeValueId : v.id);
      if (id == null) return;

      map[String(id)] = idx;
    });

    return map;
  }

  function capStockNumber(n) {
    n = (typeof n === "number" && isFinite(n)) ? n : 0;
    if (n < 0) n = 0;
    if (n > STOCK_CAP) return STOCK_CAP;
    return n;
  }

  function isQtyInput(el) {
    return !!(el && el.matches && el.matches("[data-eg-qty]"));
  }

  function selectQtyInput(el) {
    if (!el) return;

    setTimeout(function () {
      try {
        el.focus({ preventScroll: true });
      } catch (e0) {}

      try {
        el.select();
      } catch (e1) {}

      try {
        var v = String(el.value || "");
        el.setSelectionRange(0, v.length);
      } catch (e2) {}
    }, 0);
  }

  // === NOTICE BOX ===
  function egResolveInsertEl(insertSelector) {
    try {
      if (!insertSelector) return document.querySelector("[data-eg-size-matrix]") || document.body;
      if (insertSelector && insertSelector.nodeType === 1) return insertSelector;
      if (typeof insertSelector === "string") {
        return document.querySelector(insertSelector) || document.querySelector("[data-eg-size-matrix]") || document.body;
      }
    } catch (e) {}

    return document.body;
  }

  function egEnsureNoticeRoot() {
    var id = "eg-matrix-notice-root";
    var root = document.getElementById(id);

    if (root) return root;

    root = document.createElement("div");
    root.id = id;
    root.style.position = "fixed";
    root.style.left = "0";
    root.style.top = "0";
    root.style.width = "0";
    root.style.height = "0";
    root.style.zIndex = "2147483647";
    root.style.pointerEvents = "none";

    (document.body || document.documentElement).appendChild(root);

    return root;
  }

  function egCreateNoticeEl(type, message) {
    type = (type || "warning").toLowerCase();
    if (type !== "success" && type !== "error") type = "warning";

    var el = document.createElement("div");
    el.className = "eg-notice eg-notice--" + type;

    try { el.style.all = "initial"; } catch (e0) {}

    el.style.position = "fixed";
    el.style.boxSizing = "border-box";
    el.style.display = "flex";
    el.style.alignItems = "flex-start";
    el.style.gap = "10px";
    el.style.padding = "10px 12px";
    el.style.borderRadius = "10px";
    el.style.background = "#fff";
    el.style.color = "#111";
    el.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    el.style.fontSize = "14px";
    el.style.lineHeight = "1.35";
    el.style.boxShadow = "0 10px 28px rgba(0,0,0,0.18)";
    el.style.border = "1px solid rgba(0,0,0,0.18)";
    el.style.pointerEvents = "auto";
    el.style.maxWidth = "520px";
    el.style.width = "auto";
    el.style.zIndex = "2147483647";

    var bar = "#f0b429";
    if (type === "success") bar = "#1f9d55";
    if (type === "error") bar = "#d64545";

    el.style.borderLeft = "4px solid " + bar;

    var icon = document.createElement("div");
    try { icon.style.all = "initial"; } catch (e1) {}

    icon.style.marginTop = "1px";
    icon.style.flex = "0 0 auto";
    icon.style.width = "18px";
    icon.style.height = "18px";
    icon.style.borderRadius = "50%";
    icon.style.display = "inline-flex";
    icon.style.alignItems = "center";
    icon.style.justifyContent = "center";
    icon.style.fontFamily = "inherit";
    icon.style.fontSize = "12px";
    icon.style.lineHeight = "1";
    icon.style.color = "#fff";
    icon.style.background = bar;
    icon.textContent = type === "success" ? "✓" : (type === "error" ? "!" : "i");

    el.appendChild(icon);

    var txt = document.createElement("div");
    try { txt.style.all = "initial"; } catch (e2) {}

    txt.style.fontFamily = "inherit";
    txt.style.fontSize = "inherit";
    txt.style.lineHeight = "inherit";
    txt.style.color = "inherit";
    txt.style.flex = "1 1 auto";
    txt.textContent = String(message || "");

    el.appendChild(txt);

    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("aria-label", "Close");

    try { btn.style.all = "initial"; } catch (e3) {}

    btn.style.cursor = "pointer";
    btn.style.flex = "0 0 auto";
    btn.style.width = "22px";
    btn.style.height = "22px";
    btn.style.lineHeight = "22px";
    btn.style.textAlign = "center";
    btn.style.borderRadius = "6px";
    btn.style.border = "1px solid rgba(0,0,0,0.18)";
    btn.style.background = "transparent";
    btn.style.color = "#333";
    btn.style.fontFamily = "inherit";
    btn.style.fontSize = "14px";
    btn.textContent = "×";

    btn.addEventListener("click", function () {
      try {
        el.remove();
      } catch (e) {
        if (el.parentNode) el.parentNode.removeChild(el);
      }

      egRelayoutNotices((el && el.__egAnchorEl) ? el.__egAnchorEl : null);
    });

    el.appendChild(btn);

    return el;
  }

  function egRelayoutNotices(anchorEl) {
    var root = egEnsureNoticeRoot();
    var anchor = anchorEl || root.__egLastAnchorEl || document.querySelector("[data-eg-size-matrix]") || document.body;

    var rect = null;

    try {
      rect = anchor.getBoundingClientRect();
    } catch (e) {
      rect = null;
    }

    if (!rect) {
      rect = {
        top: 12,
        left: 12,
        bottom: 12,
        width: (window.innerWidth || 1024) - 24,
        height: 0
      };
    }

    var vw = window.innerWidth || 1024;
    var vh = window.innerHeight || 768;

    var maxW = Math.min(520, Math.max(260, vw - 24));
    var left = Math.round(rect.left + (rect.width / 2) - (maxW / 2));

    left = Math.max(12, Math.min(left, vw - maxW - 12));

    var nodes = root.querySelectorAll(".eg-notice");
    if (!nodes || !nodes.length) return;

    for (var i = 0; i < nodes.length; i++) {
      nodes[i].style.maxWidth = maxW + "px";
      nodes[i].style.left = left + "px";
    }

    var totalH = 0;

    for (var j = 0; j < nodes.length; j++) {
      totalH += (nodes[j].offsetHeight || 0) + (j ? EG_NOTICE_GAP_Y : 0);
    }

    var baseBottomTop = Math.round(rect.bottom + EG_NOTICE_OFFSET_Y);
    var preferBottom = (baseBottomTop + totalH <= vh - 12);

    var y = preferBottom
      ? baseBottomTop
      : Math.round(rect.top - EG_NOTICE_OFFSET_Y - totalH);

    if (y < 12) y = 12;

    var curY = y;

    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      n.style.top = curY + "px";
      curY += (n.offsetHeight || 0) + EG_NOTICE_GAP_Y;
    }
  }

  function egShowNotice(type, message, insertSelector, ttlMs) {
    ttlMs = toInt(ttlMs) || EG_NOTICE_TTL_MS;

    var root = egEnsureNoticeRoot();
    var anchorEl = egResolveInsertEl(insertSelector);

    root.__egLastAnchorEl = anchorEl;

    try {
      var existing = root.querySelectorAll(".eg-notice");
      if (existing && existing.length >= EG_NOTICE_MAX) {
        try {
          existing[0].remove();
        } catch (e0) {
          if (existing[0] && existing[0].parentNode) existing[0].parentNode.removeChild(existing[0]);
        }
      }
    } catch (e1) {}

    var el = egCreateNoticeEl(type, message);
    el.__egAnchorEl = anchorEl;

    root.appendChild(el);
    egRelayoutNotices(anchorEl);

    try {
      if (!root.__egBound) {
        root.__egBound = true;

        window.addEventListener("resize", function () {
          egRelayoutNotices(root.__egLastAnchorEl || null);
        }, { passive: true });

        window.addEventListener("scroll", function () {
          egRelayoutNotices(root.__egLastAnchorEl || null);
        }, { passive: true });
      }
    } catch (e2) {}

    if (ttlMs > 0) {
      setTimeout(function () {
        if (!el || !el.parentNode) return;

        try {
          el.remove();
        } catch (e) {
          if (el.parentNode) el.parentNode.removeChild(el);
        }

        egRelayoutNotices(anchorEl);
      }, ttlMs);
    }

    return el;
  }

  function showInfoToast(message, insertSelector, msgType) {
    insertSelector = insertSelector || "[data-eg-size-matrix]";
    msgType = (msgType == null) ? 1 : toInt(msgType);

    var type = "warning";
    if (msgType === 0) type = "success";
    else if (msgType === 2) type = "error";

    if (!EG_NOTICE_FORCE) {
      try {
        var ui = (window.eGuardians && eGuardians.ui && eGuardians.ui.message) ? eGuardians.ui.message : null;
        var insertEl = egResolveInsertEl(insertSelector);
        var target = ui ? ((type === "success") ? ui.success : ((type === "error") ? ui.error : ui.warning)) : null;

        if (target && target.show) {
          target.show({
            message: message,
            insertElement: insertEl
          });
          return;
        }
      } catch (e0) {}
    }

    egShowNotice(type, message, insertSelector, EG_NOTICE_TTL_MS);
  }

  function showErrorToast(message, insertSelector) {
    insertSelector = insertSelector || "[data-eg-size-matrix]";

    try {
      var ui = (window.eGuardians && eGuardians.ui && eGuardians.ui.message) ? eGuardians.ui.message : null;
      var insertEl = egResolveInsertEl(insertSelector);

      if (ui && ui.error && typeof ui.error.show === "function") {
        ui.error.show({
          message: message || t("err_add_fallback"),
          insertElement: insertEl
        });
        return;
      }
    } catch (e) {}

    showInfoToast(message || t("err_add_fallback"), insertSelector, 2);
  }

  // === ORDER MAX HELPERS ===
  function extractOrderMaxFromObj(obj) {
    try {
      if (!obj) return null;

      var candidates = [
        obj.maximumOrderQuantity,
        obj.maxOrderQuantity,
        obj.orderMaxQuantity,
        obj.orderMax,
        obj.maxOrder,
        obj.orderQuantityMaximum,
        obj.orderQuantityMax
      ];

      if (obj.variation) {
        candidates.push(
          obj.variation.maximumOrderQuantity,
          obj.variation.maxOrderQuantity,
          obj.variation.orderMaxQuantity,
          obj.variation.orderMax,
          obj.variation.maxOrder,
          obj.variation.orderQuantityMaximum,
          obj.variation.orderQuantityMax
        );
      }

      if (obj.data && obj.data.variation) {
        candidates.push(
          obj.data.variation.maximumOrderQuantity,
          obj.data.variation.maxOrderQuantity,
          obj.data.variation.orderMaxQuantity,
          obj.data.variation.orderMax,
          obj.data.variation.maxOrder
        );
      }

      if (obj.variation && obj.variation.data && obj.variation.data.variation) {
        var vv = obj.variation.data.variation;
        candidates.push(
          vv.maximumOrderQuantity,
          vv.maxOrderQuantity,
          vv.orderMaxQuantity,
          vv.orderMax,
          vv.maxOrder,
          vv.orderQuantityMaximum,
          vv.orderQuantityMax
        );
      }

      for (var i = 0; i < candidates.length; i++) {
        var v = candidates[i];
        if (v == null) continue;

        var n = parseInt(v, 10);
        if (isFinite(n) && n > 0) return n;
      }
    } catch (e) {}

    return null;
  }

  // === REQUEST CACHE ===
  var vCache = {};
  var vInflight = {};
  // Cache only confirmed results: an object is a variation, null is explicitly missing.
  // An omitted result / failed transport remains undefined and can be retried.
  function finishVariation(id, listeners, value) {
    if (vInflight[id] !== listeners) return;
    delete vInflight[id];
    if (value !== undefined) vCache[id] = value;
    listeners.forEach(function (callback) { callback(value); });
  }

  function pickEanFromBarcodes(barcodes) {
    if (!barcodes || !barcodes.length) return null;

    for (var i = 0; i < barcodes.length; i++) {
      var b = barcodes[i];
      if (!b) continue;

      var code = b.code != null ? String(b.code) : "";
      if (!code) continue;

      var txt = "";
      if (b.type != null) txt += " " + String(b.type);
      if (b.barcodeType != null) txt += " " + String(b.barcodeType);
      if (b.name != null) txt += " " + String(b.name);
      if (b.barcode != null) txt += " " + String(b.barcode);

      txt = txt.toLowerCase();

      if (txt.indexOf("ean") !== -1 || [b.type, b.barcodeType].some(function (type) {
        return /^gtin_(?:8|13|14|128)$/i.test(String(type ?? "").trim());
      })) return code;
    }

    for (var j = 0; j < barcodes.length; j++) {
      var bb = barcodes[j];
      if (bb && bb.code) return String(bb.code);
    }

    return null;
  }

  function pickImages(images) {
    if (!images) return [];

    var arr = (images.variation && images.variation.length)
      ? images.variation
      : (images.all && images.all.length ? images.all : []);

    if (!arr || !arr.length) return [];

    var out = [];

    for (var i = 0; i < arr.length; i++) {
      var im = arr[i];
      if (!im) continue;

      out.push({
        url: im.url || im.urlLarge || null,
        urlMiddle: im.urlMiddle || im.url || null,
        urlPreview: im.urlPreview || im.urlMiddle || im.url || null,
        position: (typeof im.position === "number") ? im.position : 9999
      });
    }

    out.sort(function (a, b) {
      return a.position - b.position;
    });

    return out;
  }

  function fetchVariationsBatch(variationIds, cb) {
    cb = cb || function () {};

    variationIds = Array.from(new Set((variationIds || []).map(toInt).filter(Boolean)));

    var missingIds = [];

    for (var i = 0; i < variationIds.length; i++) {
      var id = variationIds[i];

      if (!Object.prototype.hasOwnProperty.call(vCache, id)) {
        missingIds.push(id);
      }
    }

    if (!missingIds.length) return cb();

    missingIds.sort(function (a, b) {
      return a - b;
    });

    if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.get) return cb();

    // Process at most one chunk at a time. Missing rows in completed chunks
    // retain the usual bounded single-item fallback after all chunks finish.
    var offset = 0;
    function nextChunk() {
      if (offset >= missingIds.length) return cb();
      var ids = missingIds.slice(offset, offset + BATCH_MAX_IDS);
      offset += ids.length;
      fetchVariationChunk(ids, nextChunk);
    }
    nextChunk();
  }

  function fetchVariationChunk(ids, done) {
    // A PDP and a Quickview may request overlapping (not necessarily identical) batches.
    var pending = ids.length;
    var requests = {};
    function settled() { if (--pending === 0) done(); }
    ids.forEach(function (id) {
      if (Object.prototype.hasOwnProperty.call(vCache, id)) settled();
      else if (vInflight[id]) vInflight[id].push(settled);
      else requests[id] = vInflight[id] = [settled];
    });
    var fresh = Object.keys(requests);
    if (!fresh.length) return;

    eGuardians.apiservice.get("/rest/io/variations/batch", { ids: fresh.join(",") }, function (response, status) {
      var top = (status == null || status === 200) && !response?.error && response?.data;
      var payload = top && (top.data || top);
      var items = (payload && payload.items) || {};
      var missing = new Set((payload && Array.isArray(payload.missing) ? payload.missing : []).map(toInt));
      fresh.forEach(function (id) {
        var item = items[id];
        if (missing.has(toInt(id))) item = null;
        else if (!item || typeof item !== "object" || Array.isArray(item) ||
            (item.id != null ? toInt(item.id) !== toInt(id) : !Object.keys(item).length)) item = undefined;
        finishVariation(id, requests[id], item);
      });
    }, "json", BATCH_TIMEOUT_MS);
  }

  function fetchVariationDetailsSingle(variationId, cb) {
    variationId = toInt(variationId);
    if (!variationId) return cb();
    if (Object.prototype.hasOwnProperty.call(vCache, variationId)) return cb(vCache[variationId]);
    if (vInflight[variationId]) {
      vInflight[variationId].push(cb);
      return;
    }

    if (!window.eGuardians || !eGuardians.apiservice || !eGuardians.apiservice.get) return cb();
    var listeners = vInflight[variationId] = [cb];
    var params = {
      template: encodeURI("Ceres::Item.SingleItem")
    };

    eGuardians.apiservice.get("/rest/io/variations/" + variationId, params, function (response, status) {
      if ((status != null && status !== 200) || response?.error) return finishVariation(variationId, listeners, undefined);
      var out;

      try {
        var d = response &&
          response.data &&
          response.data.documents &&
          response.data.documents[0] &&
          response.data.documents[0].data;

        if (Array.isArray(response?.data?.documents) && response.data.documents.length === 0 && !Number(response.data.total)) out = null;
        if (d && typeof d === "object" && !Array.isArray(d) && Object.keys(d).length &&
            (d.variation?.id == null || toInt(d.variation.id) === variationId)) {
          var orderMax = extractOrderMaxFromObj(d);

          out = {
            id: variationId,
            stock: (d.stock && typeof d.stock.net !== "undefined") ? d.stock.net : null,
            price: (d.prices && d.prices.default && d.prices.default.unitPrice && typeof d.prices.default.unitPrice.value !== "undefined")
              ? d.prices.default.unitPrice.value
              : null,
            ean: pickEanFromBarcodes(d.barcodes),
            images: pickImages(d.images),
            orderMax: orderMax
          };
        }
      } catch (e) {
        out = undefined;
      }
      finishVariation(variationId, listeners, out);
    }, "json", FETCH_TIMEOUT_MS);
  }

  function runQueue(tasks, concurrency, done) {
    concurrency = concurrency || 4;

    var i = 0;
    var running = 0;
    var finished = 0;

    function next() {
      if (finished >= tasks.length) {
        if (done) done();
        return;
      }

      while (running < concurrency && i < tasks.length) {
        (function (task) {
          running++;

          task(function () {
            running--;
            finished++;
            next();
          });
        })(tasks[i++]);
      }
    }

    next();
  }

  // === ROW / QTY / TOTALS ===
  function setRowStock(row, rawStock, allowFallback) {
    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));
    if (!stockEl) return;

    if (rawStock == null || !isFinite(rawStock)) {
      stockEl.textContent = "–";
      stockEl.removeAttribute("data-eg-stock-net");

      if (allowFallback) {
        stockEl.setAttribute("data-eg-stock-raw", String(STOCK_CAP));
      } else {
        stockEl.removeAttribute("data-eg-stock-raw");
      }

      return;
    }

    rawStock = parseInt(rawStock, 10);
    if (!isFinite(rawStock)) rawStock = 0;
    if (rawStock < 0) rawStock = 0;

    stockEl.setAttribute("data-eg-stock-net", String(rawStock));

    var capped = capStockNumber(rawStock);
    stockEl.setAttribute("data-eg-stock-raw", String(capped));
    stockEl.textContent = (rawStock > STOCK_CAP) ? ("+" + STOCK_CAP) : String(capped);
  }

  function getRowStockCap(row) {
    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));

    var stock = STOCK_CAP;

    if (stockEl) {
      var raw = stockEl.getAttribute("data-eg-stock-raw");

      if (raw != null && raw !== "") {
        stock = parseInt(raw, 10);
        if (!isFinite(stock) || stock < 0) stock = 0;
      } else {
        var txt = (stockEl.textContent || "").trim();

        if (txt.indexOf("+") === 0) {
          stock = STOCK_CAP;
        } else {
          var parsed = parseInt(txt.replace(/[^\d-]/g, ""), 10);
          stock = (isFinite(parsed) && parsed >= 0) ? parsed : STOCK_CAP;
        }
      }
    }

    return capStockNumber(stock);
  }

  function getRowStockNet(row) {
    if (!row) return null;

    var stockEl = row._egStockEl || (row._egStockEl = row.querySelector("[data-eg-stock]"));
    if (!stockEl) return null;

    var raw = stockEl.getAttribute("data-eg-stock-net");
    if (raw != null && raw !== "") {
      var n = parseInt(raw, 10);
      if (isFinite(n)) return n;
    }

    return null;
  }

  function getRowOrderMaxReal(row) {
    if (!row) return null;

    var raw = row.getAttribute("data-eg-ordermax-raw");
    if (raw != null && raw !== "") {
      var n = parseInt(raw, 10);
      if (isFinite(n) && n > 0) return n;
    }

    return null;
  }

  function setQtyByVariationId(matrix, variationId, qty) {
    if (!matrix) return;

    try {
      var row = matrix.querySelector('.eg-row[data-eg-variation-id="' + String(variationId) + '"]');
      if (!row) return;

      var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
      if (!qtyEl) return;

      qtyEl.value = String(Math.max(0, toInt(qty)));
      clampQtyToStock(row);
    } catch (e) {}
  }

  function preClampItemsAgainstBasket(items, basketQtyMap, matrix) {
    basketQtyMap = basketQtyMap || {};

    var out = [];
    var adjusted = 0;
    var blocked = 0;
    var requested = 0;

    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      if (!it) continue;

      var vid = String(toInt(it.variationId));
      if (!vid || vid === "0") continue;

      var want = toInt(it.quantity);
      if (!isFinite(want) || want <= 0) continue;

      requested++;

      var inBasket = toInt(basketQtyMap[vid] || 0);
      if (!isFinite(inBasket) || inBasket < 0) inBasket = 0;

      var row = matrix.querySelector('.eg-row[data-eg-variation-id="' + vid + '"]');
      if (!row || row.dataset.egVariationState !== "available") {
        blocked++;
        continue;
      }
      var stockNet = getRowStockNet(row);
      var orderMaxReal = getRowOrderMaxReal(row);

      var remainingStock = Infinity;
      if (typeof stockNet === "number" && isFinite(stockNet)) {
        remainingStock = stockNet - inBasket;
        if (!isFinite(remainingStock) || remainingStock < 0) remainingStock = 0;
      }

      var remainingOrder = Infinity;
      if (typeof orderMaxReal === "number" && isFinite(orderMaxReal)) {
        remainingOrder = orderMaxReal - inBasket;
        if (!isFinite(remainingOrder) || remainingOrder < 0) remainingOrder = 0;
      }

      var allowed = Math.min(STOCK_CAP, remainingStock, remainingOrder);

      if (!isFinite(allowed) || allowed < 0) allowed = 0;
      allowed = capStockNumber(allowed);

      if (allowed <= 0) {
        blocked++;
        setQtyByVariationId(matrix, vid, 0);
        it.quantity = 0;
        continue;
      }

      if (want > allowed) {
        adjusted++;
        want = allowed;
      }

      it.quantity = want;
      setQtyByVariationId(matrix, vid, want);

      out.push({
        variationId: vid,
        quantity: want
      });
    }

    return {
      items: out,
      adjusted: adjusted,
      blocked: blocked,
      requested: requested
    };
  }

  function clampQtyToStock(row) {
    var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
    if (!qtyEl) return;

    var stock = row.dataset.egVariationState === "available" ? getRowStockCap(row) : 0;
    var orderMaxReal = getRowOrderMaxReal(row);

    var limit = STOCK_CAP;

    if (isFinite(stock)) limit = Math.min(limit, stock);
    if (orderMaxReal != null && isFinite(orderMaxReal)) limit = Math.min(limit, orderMaxReal);

    limit = capStockNumber(limit);

    qtyEl.max = String(limit);

    var rawVal = (qtyEl.value == null) ? "" : String(qtyEl.value);
    var cleaned = rawVal.replace(/[^\d]/g, "");

    if (cleaned !== rawVal) {
      qtyEl.value = cleaned;
      rawVal = cleaned;
    }

    // Leer erlauben, damit Backspace sauber funktioniert
    if (rawVal === "") return;

    var q = toInt(rawVal);

    if (q > limit) q = limit;
    if (q < 0) q = 0;

    qtyEl.value = String(q);
  }

  function scheduleRecalc(matrix) {
    if (!matrix) return;
    if (matrix._egRecalcScheduled) return;

    matrix._egRecalcScheduled = true;

    (window.requestAnimationFrame || function (fn) {
      return setTimeout(fn, 16);
    })(function () {
      matrix._egRecalcScheduled = false;
      recalcMatrixTotals(matrix);
    });
  }

  function recalcMatrixTotals(matrix) {
    maybeRefreshCurrencySymbol();
    var totalQty = 0;
    var totalSum = 0;

    var rows = matrix.querySelectorAll(".eg-row");

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];

      clampQtyToStock(row);

      var qtyEl = row._egQtyEl || (row._egQtyEl = row.querySelector("[data-eg-qty]"));
      var q = qtyEl ? toInt(qtyEl.value) : 0;

      var priceEl = row._egPriceEl || (row._egPriceEl = row.querySelector("[data-eg-price]"));
      var pv = priceEl ? parseFloat(priceEl.getAttribute("data-eg-price-value") || "0") : 0;
      if (!isFinite(pv)) pv = 0;

      var sub = q * pv;

      var subEl = row._egSubEl || (row._egSubEl = row.querySelector("[data-eg-subtotal]"));
      if (subEl) subEl.textContent = formatEuro(sub);

      totalQty += q;
      totalSum += sub;
    }

    var tq = matrix.querySelector("[data-eg-total-qty]");
    var ts = matrix.querySelector("[data-eg-total-sum]");

    if (tq) tq.textContent = String(totalQty);
    if (ts) ts.textContent = formatEuro(totalSum);
  }

  // === BASKET UI ===
  function addItemsToBasketBatch(items) {
    var basketItems = items.map(function (item) {
      return { variationId: toInt(item.variationId), quantity: toInt(item.quantity) };
    });
    return new Promise(function (resolve, reject) {
      eGuardians.apiservice.post(BASKET_BATCH_ENDPOINT, { basketItems: basketItems }, function (response, status) {
        var error = O46Core.basketAddError(response, status);
        if (error === null) return resolve(response);
        var failure = new Error(error);
        // IO can reject a row after other rows/bundle components have been added.
        if (status === 400 && /^(110|111|112|113|114)$/.test(error)) {
          var reason = window.messageServiceTranslations?.[error];
          var stock = response?.data?.placeholder?.stock;
          if (reason && reason.includes(":stock")) {
            reason = (typeof stock === "number" || typeof stock === "string") && /^\d+(?:\.\d+)?$/.test(String(stock))
              ? reason.replace(":stock", String(stock)) : "";
          }
          failure.basketReason = reason;
        }
        reject(failure);
      }, "json", ADD_TIMEOUT_MS);
    });
  }

  // === BASKET SNAPSHOT / DELTA CHECK ===
  function getBasketSnapshot() {
    return new Promise(function (resolve, reject) {
      function receive(response, status) {
        var rows = response?.data?.data ?? response?.data ?? response;
        if ((status != null && (status < 200 || status >= 300)) || !Array.isArray(rows)) {
          return reject(new Error("Invalid basket items response"));
        }

        var qtyMap = {};
        for (var row of rows) {
          var id = row?.variationId ?? row?.variation?.data?.variation?.id;
          var quantity = row?.quantity;
          if (id == null || !/^\d+$/.test(String(id)) || !Number.isSafeInteger(Number(id)) ||
              (typeof quantity !== "number" && typeof quantity !== "string") ||
              String(quantity).trim() === "" || !Number.isFinite(Number(quantity)) || Number(quantity) < 0) {
            return reject(new Error("Invalid basket item"));
          }
          if (Number(id) > 0) qtyMap[id] = (qtyMap[id] || 0) + Number(quantity);
        }
        resolve({ qtyMap: qtyMap });
      }
      if (window.eGuardians?.apiservice?.get) {
        eGuardians.apiservice.get(BASKET_BATCH_ENDPOINT, {}, receive, "json", BASKET_GET_TIMEOUT_MS);
        return;
      }
      var controller = new AbortController();
      var timer = setTimeout(function () { controller.abort(); }, BASKET_GET_TIMEOUT_MS);
      fetch(BASKET_BATCH_ENDPOINT, { credentials: "same-origin", cache: "no-store", signal: controller.signal })
        .then(async function (response) { receive(await response.json(), response.status); })
        .catch(reject)
        .finally(function () { clearTimeout(timer); });
    });
  }

  // === MAGICZOOM / PREVIEW ===
  function getZoomContextFromMatrix(matrix) {
    var inModal = false;

    try {
      inModal = !!(matrix && matrix.closest && matrix.closest(".modal-cross.show"));
    } catch (e) {
      inModal = false;
    }

    return {
      zoomId: inModal ? "ItemImgZoom2" : "ItemImgZoom",
      inModal: inModal
    };
  }

  function escapeHtml(s) {
    s = (s == null) ? "" : String(s);

    return s.replace(/[&<>"']/g, function (ch) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[ch];
    });
  }

  function getProductTitleForGallery(matrix) {
    var scope = matrix && matrix.closest("article");
    var h1 = (scope || document).querySelector("h1");
    var t2 = (h1 && h1.textContent) ? h1.textContent : document.title;
    return String(t2 || "").trim();
  }

  function normalizeThumbUrl(u) {
    u = (u == null) ? "" : String(u);

    if (u.indexOf("/preview/") > -1) {
      u = u.replace("/preview/", "/secondPreview/");
    }

    return u;
  }

  function ensureZoomAnchor(zoomId) {
    var a = document.getElementById(zoomId);
    if (!a) return null;

    if (!a.id) a.id = zoomId;

    if (a.classList && !a.classList.contains("MagicZoom")) {
      a.classList.add("MagicZoom");
    }

    return a;
  }

  function setMainImageNow(zoomId, full, middle, title) {
    var a = ensureZoomAnchor(zoomId);
    if (!a) return;

    a.setAttribute("href", full);
    a.setAttribute("title", title || "");
    a.setAttribute("data-image", middle);
    a.setAttribute("data-zoom-image", full);

    var img = a.querySelector("img");

    if (img) {
      img.setAttribute("src", middle);
      img.setAttribute("alt", title || "");
      img.setAttribute("title", title || "");
    }
  }

  // One readiness callback for the existing vendor instance, never one per opening.
  var matrixZoomCallbacksReady = false;
  function initMatrixZoomCallbacks() {
    if (matrixZoomCallbacksReady) return true;
    if (!window.MagicZoom || typeof MagicZoom.registerCallback !== "function") return false;
    MagicZoom.registerCallback("onZoomReady", function (id) {
      var anchor = document.getElementById(id);
      var pending = anchor && anchor._egMatrixExpand;
      if (!pending) return;
      if (!pending.matrix.isConnected || !anchor.isConnected) return;
      var modal = pending.matrix.closest(".modal-cross");
      if (modal && !modal.classList.contains("show")) return;
      // v5.3.5 cannot safely stop an instance during its asynchronous image setup.
      // Coalesce taps until readiness, then build only the most recent gallery.
      var next = anchor._egMatrixNext;
      anchor._egMatrixNext = null;
      if (next) {
        updateMagicZoomWithGallery(next.matrix, id, next.images, next);
        return;
      }
      anchor._egMatrixExpand = null;
      if (toInt(pending.matrix.getAttribute("data-eg-preview-token")) !== pending.token) return;
      anchor._egMatrixExpanded = true;
      MagicZoom.expand(anchor);
    });
    MagicZoom.registerCallback("onExpandClose", function (id) {
      var anchor = document.getElementById(id);
      if (anchor) anchor._egMatrixExpanded = false;
    });
    matrixZoomCallbacksReady = true;
    return true;
  }

  function releaseMatrixZoom(root) {
    if (!root || root.nodeType !== 1) return;
    var matrices = root.matches("[data-eg-size-matrix]") ? [root] : root.querySelectorAll("[data-eg-size-matrix]");
    for (var i = 0; i < matrices.length; i++) {
      var anchor = matrices[i]._egMatrixZoomAnchor;
      if (!anchor) continue;
      anchor._egMatrixExpand = null;
      anchor._egMatrixNext = null;
      anchor._egMatrixExpanded = false;
      if (window.MagicZoom) MagicZoom.stop(anchor);
      matrices[i]._egMatrixZoomAnchor = null;
    }
  }

  function ensureQuickviewZoom(matrix) {
    var modal = matrix.closest(".modal-cross.show");
    var article = matrix.closest("article");
    if (!modal || !article) return;
    if (!article.querySelector("#ItemImgZoom2")) {
      // Quickview omits the PDP gallery markup. Keep one native gallery source
      // outside the matrix layout; the vendor renders its dialog on document.body.
      var host = document.createElement("div");
      host.className = "sr-only";
      host.setAttribute("aria-hidden", "true");
      host.innerHTML = '<a id="ItemImgZoom2" class="MagicZoom" tabindex="-1" data-options="zoomMode: off; transitionEffect: false; lazyZoom: true; cssClass: white-bg; hint: off;"><img width="44" height="36"></a><div class="single-prev-images"></div>';
      article.appendChild(host);
    }
    var jq = window.jQuery || window.$;
    if (jq && !modal._egMatrixZoomBound) {
      modal._egMatrixZoomBound = true;
      jq(modal).on("hide.bs.modal.egMatrixZoom", function () { releaseMatrixZoom(modal); });
    }
  }

  function updateMagicZoomWithGallery(matrix, zoomId, images, expandRequest) {
    if (!zoomId || !images || !images.length) return;
    if (!document.getElementById(zoomId)) return;
    if (!window.MagicZoom) return;

    var a = ensureZoomAnchor(zoomId);
    if (!a) return;

    var first = images[0] || null;
    if (!first) return;

    var firstFull = first.url || first.urlLarge || first.urlMiddle || first.urlPreview || null;
    var firstMiddle = first.urlMiddle || first.url || first.urlLarge || first.urlPreview || null;

    if (!firstFull || !firstMiddle) return;

    var scope = matrix.closest("article") || document;
    var prev = scope.querySelector(".single-prev-images");

    // Dispose selector handlers before replacing their elements.
    a._egMatrixExpand = null;
    MagicZoom.stop(zoomId);

    var ttl = getProductTitleForGallery(matrix);
    var ttlEsc = escapeHtml(ttl);

    if (prev) {
      var html = "";

      for (var i = 0; i < images.length; i++) {
        var im = images[i];
        if (!im) continue;

        var full = im.url || im.urlLarge || im.urlMiddle || im.urlPreview || null;
        var mid = im.urlMiddle || im.url || im.urlLarge || im.urlPreview || null;
        var th = im.urlPreview || im.urlMiddle || im.url || im.urlLarge || null;

        if (!full || !mid || !th) continue;

        th = normalizeThumbUrl(th);

        var cls = "white-bg mz-thumb" + (i === 0 ? " mz-thumb-selected" : "");

        html += '<a href="' + escapeHtml(full) + '" rel="zoom-id:' + escapeHtml(zoomId) + '" data-image="' + escapeHtml(mid) + '" title="' + ttlEsc + '" data-stepindex="' + String(i) + '" class="' + cls + '">'
          + '<img src="' + escapeHtml(th) + '" data-src="' + escapeHtml(th) + '" alt="' + ttlEsc + '" title="' + ttlEsc + '" class="lozad" width="100%" height="100%" data-loaded="true" />'
          + "</a>";
      }

      if (html) prev.innerHTML = html;
      if (prev.closest('[aria-hidden="true"]')) {
        prev.querySelectorAll("a").forEach(function (selector) { selector.tabIndex = -1; });
      }
    }

    setMainImageNow(zoomId, firstFull, firstMiddle, ttl);

    // Rebuild this gallery from the current anchor and selectors without a click.
    a._egMatrixExpand = expandRequest || null;
    matrix._egMatrixZoomAnchor = a;
    var options = a.getAttribute("data-options");
    // v5.3.5's lazy readiness only covers the small image. For an explicit
    // expansion request load the selected large image, then use onZoomReady.
    if (expandRequest) a.setAttribute("data-options", (options || "").replace(/lazyZoom\s*:[^;]*/gi, "") + "; lazyZoom: false;");
    try {
      MagicZoom.start(zoomId);
    } finally {
      if (expandRequest) {
        if (options == null) a.removeAttribute("data-options");
        else a.setAttribute("data-options", options);
      }
    }
  }

  function setActiveRow(matrix, row) {
    if (!matrix || !row) return;

    var old = matrix.querySelector(".eg-row.eg-active");

    if (old && old !== row) {
      old.classList.remove("eg-active");
    }

    row.classList.add("eg-active");
  }

  function previewVariationFromRow(matrix, row, force, expand) {
    if (!matrix || !row) return;

    var vid = row.getAttribute("data-eg-variation-id");
    if (!vid) return;

    // The row already obtained these images from the existing variation batch.
    // A tap must not trigger a new detail/image service request or show an old image.
    var cached = expand && vCache[toInt(vid)];
    if (expand && (!cached || !cached.images || !cached.images.length || !initMatrixZoomCallbacks())) return;
    var ctx = getZoomContextFromMatrix(matrix);
    var anchor = document.getElementById(ctx.zoomId);
    if (expand && anchor && anchor._egMatrixExpanded) return;

    if (!force) {
      var last = matrix.getAttribute("data-eg-preview-vid");
      if (last && String(last) === String(vid)) return;
    }

    matrix.setAttribute("data-eg-preview-vid", String(vid));

    var token = (toInt(matrix.getAttribute("data-eg-preview-token")) || 0) + 1;
    matrix.setAttribute("data-eg-preview-token", String(token));

    matrix._egPendingPreview = null;
    if (expand) {
      if (ctx.inModal) ensureQuickviewZoom(matrix);
      anchor = document.getElementById(ctx.zoomId);
      var request = { matrix: matrix, token: token, images: cached.images };
      if (anchor && anchor._egMatrixExpand) anchor._egMatrixNext = request;
      else updateMagicZoomWithGallery(matrix, ctx.zoomId, cached.images, request);
      return;
    }

    matrix._egPendingPreview = row.dataset.egVariationState === "loading" ? row : null;
    var variation = vCache[toInt(vid)];
    if (variation && variation.images && variation.images.length && matrix.isConnected) {
      updateMagicZoomWithGallery(matrix, ctx.zoomId, variation.images);
    }
  }

  // === ROW BUILDING ===
  function buildZoomSpan() {
    var z = document.createElement("span");

    z.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="s-icon s-icon-icon-zoom-in" viewBox="0 0 16 16">' +
      '<path fill-rule="evenodd" d="m14.473 13.526-2.453-2.453a5.975 5.975 0 0 0 1.314-3.74 6 6 0 1 0-6 6 5.975 5.975 0 0 0 3.74-1.313l2.453 2.453c.26.26.687.26.947 0a.672.672 0 0 0 0-.947ZM2.668 7.333a4.663 4.663 0 0 1 4.667-4.667A4.663 4.663 0 0 1 12 7.333a4.673 4.673 0 0 1-1.34 3.273.142.142 0 0 1-.033.02l-.007.007c-.006.007-.013.02-.02.027a4.663 4.663 0 0 1-7.933-3.327Zm7.333 0A.67.67 0 0 1 9.334 8H8v1.333C8 9.7 7.7 10 7.333 10a.669.669 0 0 1-.666-.667V8H5.334a.669.669 0 0 1-.667-.667c0-.367.3-.667.667-.667h1.333V5.333c0-.367.3-.667.667-.667.366 0 .666.3.666.667v1.333h1.334c.366 0 .666.3.666.667Z"></path>' +
      "</svg>";

    return z;
  }

  function buildColorLink(textFallback, imgUrl) {
    var span = document.createElement("span");

    span.className = "eg-color-link";
    span.setAttribute("data-eg-color-preview", "1");
    span.title = textFallback || "";

    if (imgUrl) {
      var img = document.createElement("img");
      img.src = imgUrl;
      img.alt = textFallback || "";
      img.loading = "lazy";
      img.decoding = "async";

      span.appendChild(img);
      span.appendChild(buildZoomSpan());
    } else {
      span.textContent = textFallback || "–";
    }

    return span;
  }

  function createRow(columnLabels, mode, labelA, labelB, colorImgUrl) {
    var row = document.createElement("div");
    row.className = "col-12 eg-row";
    row.dataset.egVariationState = "loading";

    function cell(text, colKey) {
      var d = document.createElement("div");
      d.className = "eg-cell";
      d.textContent = text;

      if (colKey) {
        d.setAttribute("data-eg-col", colKey);
        d.setAttribute("data-eg-label", columnLabels[colKey]);
      }

      return d;
    }

    if (mode === "size_color") {
      row.appendChild(cell(labelA || "–", "size"));

      var colorCell = document.createElement("div");
      colorCell.className = "eg-cell";
      colorCell.setAttribute("data-eg-col", "color");
      colorCell.appendChild(buildColorLink(labelB || "–", colorImgUrl || ""));
      row.appendChild(colorCell);
    } else if (mode === "size") {
      row.appendChild(cell(labelA || "–", "size"));
    } else if (mode === "color") {
      var onlyColorCell = document.createElement("div");
      onlyColorCell.className = "eg-cell";
      onlyColorCell.setAttribute("data-eg-col", "color");
      onlyColorCell.appendChild(buildColorLink(labelA || "–", colorImgUrl || ""));
      row.appendChild(onlyColorCell);
    }

    var stockCell = cell("–", "stock");
    stockCell.setAttribute("data-eg-stock", "");
    row.appendChild(stockCell);

    var priceCell = cell("–", "price");
    priceCell.setAttribute("data-eg-price", "");
    priceCell.setAttribute("data-eg-price-value", "0");
    row.appendChild(priceCell);

    var details = document.createElement("div");
    details.className = "eg-row-details";
    var eanCell = cell("", "ean");
    var eanValue = document.createElement("span");
    eanValue.setAttribute("data-eg-ean", "");
    eanValue.textContent = "–";
    eanCell.appendChild(eanValue);
    details.appendChild(eanCell);
    var subCell = cell(formatEuro(0), "sub");
    subCell.setAttribute("data-eg-subtotal", "");
    details.appendChild(subCell);
    row.appendChild(details);

    var qtyWrap = document.createElement("div");
    qtyWrap.className = "eg-cell eg-qty-wrap";
    var qtyLabel = columnLabels.qty;
    qtyWrap.setAttribute("data-eg-label", qtyLabel);
    qtyWrap.setAttribute("data-eg-col", "qty");

    var qty = document.createElement("input");
    qty.type = "text";
    qty.setAttribute("pattern", "[0-9]*");
    qty.setAttribute("autocomplete", "off");
    qty.setAttribute("min", "0");
    qty.setAttribute("max", "0");
    qty.disabled = true;
    qty.setAttribute("step", "1");
    qty.value = "0";
    qty.setAttribute("data-eg-qty", "");
    qty.setAttribute("inputmode", "numeric");
    qty.setAttribute("aria-label", qtyLabel + " " + [labelA, labelB].filter(Boolean).join(" / "));

    qtyWrap.appendChild(qty);
    row.appendChild(qtyWrap);

    return row;
  }

  function buildRows(matrix, variations) {
    var body = matrix.querySelector(".eg-size-matrix-body");
    if (!body) return [];
    maybeRefreshCurrencySymbol();

    body.innerHTML = "";

    var mode = (matrix.getAttribute("data-eg-mode") || "none").trim();
    var sizeAttrId = (matrix.getAttribute("data-eg-size-attribute-id") || "").trim();
    var colorAttrId = (matrix.getAttribute("data-eg-color-attribute-id") || "").trim();

    var sizeValues = safeParseJsonAttr(matrix, "data-eg-size-values", []);
    var colorValues = safeParseJsonAttr(matrix, "data-eg-color-values", []);

    var sizeName = buildValueNameMap(sizeValues);
    var colorName = buildValueNameMap(colorValues);

    var colorImg = buildValueImageMap(colorValues);

    var sizeOrder = buildOrderMap(sizeValues);
    var colorOrder = buildOrderMap(colorValues);

    var items = [];

    (variations || []).forEach(function (v) {
      if (!v || !v.variationId) return;

      var sId = sizeAttrId ? getAttrValueId(v, sizeAttrId) : null;
      var cId = colorAttrId ? getAttrValueId(v, colorAttrId) : null;

      items.push({
        variationId: String(v.variationId),
        sizeId: sId,
        colorId: cId,
        sizeLabel: sId && sizeName[sId] ? sizeName[sId] : (mode === "size" || mode === "size_color" ? "–" : ""),
        colorLabel: cId && colorName[cId] ? colorName[cId] : (mode === "color" || mode === "size_color" ? "–" : ""),
        colorImgUrl: (cId && colorImg[cId]) ? normalizeImgUrl(colorImg[cId]) : "",
        so: (sId != null && sizeOrder[String(sId)] != null) ? sizeOrder[String(sId)] : 9999,
        co: (cId != null && colorOrder[String(cId)] != null) ? colorOrder[String(cId)] : 9999
      });
    });

    if (mode === "size_color") {
      items.sort(function (a, b) {
        if (a.co !== b.co) return a.co - b.co;
        if (a.so !== b.so) return a.so - b.so;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    } else if (mode === "size") {
      items.sort(function (a, b) {
        if (a.so !== b.so) return a.so - b.so;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    } else if (mode === "color") {
      items.sort(function (a, b) {
        if (a.co !== b.co) return a.co - b.co;
        return toInt(a.variationId) - toInt(b.variationId);
      });
    }

    var rows = [];

    // Headings are constant during this build; keep labels local to this matrix.
    var columnLabels = { stock: "stock", price: "price", ean: "ean", sub: "sub", qty: "Quantity" };
    if (mode === "size" || mode === "size_color") columnLabels.size = "size";
    if (items.length) Object.keys(columnLabels).forEach(function (key) {
      var heading = matrix.querySelector('.eg-size-matrix-head [data-eg-col="' + key + '"]');
      if (heading) columnLabels[key] = heading.getAttribute("data-eg-label") || heading.textContent.trim();
    });

    items.forEach(function (it) {
      var r;

      if (mode === "size_color") {
        r = createRow(columnLabels, mode, it.sizeLabel, it.colorLabel, it.colorImgUrl);
      } else if (mode === "size") {
        r = createRow(columnLabels, mode, it.sizeLabel, null, "");
      } else if (mode === "color") {
        r = createRow(columnLabels, mode, it.colorLabel, null, it.colorImgUrl);
      } else {
        r = createRow(columnLabels, "none", null, null, "");
      }

      r.setAttribute("data-eg-variation-id", it.variationId);

      body.appendChild(r);

      r._egStockEl = r.querySelector("[data-eg-stock]");
      r._egPriceEl = r.querySelector("[data-eg-price]");
      r._egEanEl = r.querySelector("[data-eg-ean]");
      r._egSubEl = r.querySelector("[data-eg-subtotal]");
      r._egQtyEl = r.querySelector("[data-eg-qty]");

      rows.push(r);
    });

    return rows;
  }

  // === INIT ===
  function initMatrix(matrix) {
    if (matrix) initMatrixHeadingLabels(matrix);
    if (!matrix) return;
    if (matrix.getAttribute("data-eg-matrix-initialized") === "1") {
      if (matrix._egRetryRows) matrix._egRetryRows();
      return;
    }

    matrix.setAttribute("data-eg-matrix-initialized", "1");

    var variations = getVariationsJson(matrix);
    var rows = buildRows(matrix, Array.isArray(variations) ? variations : []);
    var status = matrix.querySelector("[data-eg-matrix-status]");
    var errorToggle = matrix.querySelector("[data-eg-matrix-error-toggle]");
    var table = matrix.querySelector(".eg-size-matrix-table");
    function finishLoading(message) {
      if (table) table.setAttribute("aria-busy", "false");
      if (status) status.textContent = message || "";
      if (errorToggle) errorToggle.hidden = !message;
    }
    if (errorToggle && status) {
      errorToggle.addEventListener("click", function () {
        var open = status.classList.toggle("eg-matrix-error-open");
        errorToggle.setAttribute("aria-expanded", String(open));
      });
    }
    if (!rows.length) {
      finishLoading(status && status.dataset.unavailable);
      return;
    }
    var missingRows = 0;
    function loadRows(pendingRows) {
      matrix._egRetryRows = null;
      if (table) table.setAttribute("aria-busy", "true");
      var retryRows = [];

      var ids = [];

      for (var i = 0; i < pendingRows.length; i++) {
        var vid = toInt(pendingRows[i].getAttribute("data-eg-variation-id"));
        if (vid) ids.push(vid);
      }

      fetchVariationsBatch(ids, function () {
        maybeRefreshCurrencySymbol();
        var tasks = [];

        for (var r = 0; r < pendingRows.length; r++) {
          (function (row) {
            var vid2 = toInt(row.getAttribute("data-eg-variation-id"));
            var priceEl2 = row._egPriceEl;
            var eanEl2 = row._egEanEl;

            function apply(v2) {
              if (!v2) {
                row.dataset.egVariationState = v2 === null ? "missing" : "error";
                if (v2 === null) missingRows++;
                else retryRows.push(row);
                if (priceEl2) {
                  priceEl2.textContent = "–";
                  priceEl2.setAttribute("data-eg-price-value", "0");
                }

                if (eanEl2) eanEl2.textContent = "–";

                row.removeAttribute("data-eg-ordermax-raw");

                setRowStock(row, null, false);
                row._egQtyEl.disabled = true;
                if (v2 === null) row._egStockEl.textContent = t("not_addable");
                clampQtyToStock(row);
                return;
              }

              var net = v2.stock?.net ?? v2.stock;
              var rawStock2 = (typeof net === "number" || (typeof net === "string" && net.trim())) && isFinite(net)
                ? Number(net) : null;

              setRowStock(row, rawStock2, true);
              row._egQtyEl.value = "0";
              row.dataset.egVariationState = rawStock2 != null && rawStock2 <= 0 ? "unavailable" : "available";
              row._egQtyEl.disabled = row.dataset.egVariationState !== "available";
              if (!row._egQtyEl.disabled && matrix._egWriteInputs) {
                row._egQtyEl.disabled = true;
                matrix._egWriteInputs.push(row._egQtyEl);
              }
              if (matrix._egPendingPreview === row && matrix.isConnected) previewVariationFromRow(matrix, row, true, false);

              if (priceEl2) {
                if (typeof v2.price === "number" && isFinite(v2.price)) {
                  priceEl2.textContent = formatEuro(v2.price);
                  priceEl2.setAttribute("data-eg-price-value", String(v2.price));
                } else if (v2.prices && v2.prices.default && v2.prices.default.unitPrice && typeof v2.prices.default.unitPrice.value !== "undefined") {
                  var pv2 = parseFloat(v2.prices.default.unitPrice.value);
                  if (isFinite(pv2)) {
                    priceEl2.textContent = formatEuro(pv2);
                    priceEl2.setAttribute("data-eg-price-value", String(pv2));
                  } else {
                    priceEl2.textContent = "–";
                    priceEl2.setAttribute("data-eg-price-value", "0");
                  }
                } else {
                  priceEl2.textContent = "–";
                  priceEl2.setAttribute("data-eg-price-value", "0");
                }
              }

              if (eanEl2) {
                var ean = v2.ean == null ? "" : String(v2.ean).trim();
                eanEl2.textContent = ean || "–";
              }

              var maxO = null;

              try {
                if (v2.orderMax != null) maxO = toInt(v2.orderMax);
                if (!maxO) {
                  var om2 = extractOrderMaxFromObj(v2);
                  if (om2 != null) maxO = toInt(om2);
                }
              } catch (e0) {
                maxO = null;
              }

              if (maxO && isFinite(maxO) && maxO > 0) {
                row.setAttribute("data-eg-ordermax-raw", String(maxO));
              } else {
                row.removeAttribute("data-eg-ordermax-raw");
              }

              clampQtyToStock(row);
            }

            if (vid2 && Object.prototype.hasOwnProperty.call(vCache, vid2)) {
              apply(vCache[vid2]);
            } else if (vid2) {
              tasks.push(function (done) {
                fetchVariationDetailsSingle(vid2, function (vx) {
                  maybeRefreshCurrencySymbol();
                  apply(vx);
                  done();
                });
              });
            } else {
              apply(undefined);
            }
          })(pendingRows[r]);
        }

        runQueue(tasks, CONCURRENCY, function () {
          recalcMatrixTotals(matrix);
          var unavailableRows = missingRows + retryRows.length;
          finishLoading(status && unavailableRows ? (unavailableRows === rows.length ? status.dataset.unavailable : status.dataset.partial) : "");

          var firstRow = matrix.querySelector(".eg-row");
          if (firstRow && !matrix.querySelector(".eg-row.eg-active")) setActiveRow(matrix, firstRow);
          if (retryRows.length) matrix._egRetryRows = function () {
            retryRows.forEach(function (row) { row.dataset.egVariationState = "loading"; });
            loadRows(retryRows);
          };
        });
      });
    }
    loadRows(rows);

    matrix.addEventListener("click", function (e) {
      var link = e.target && e.target.closest ? e.target.closest("[data-eg-color-preview]") : null;
      if (!link || !matrix.contains(link)) return;

      e.preventDefault();
      e.stopPropagation();

      var row = link.closest(".eg-row");
      if (!row) return;

      var touch = window.matchMedia && window.matchMedia("(max-width: 991px)").matches &&
        (e.pointerType === "touch" || window.matchMedia("(hover: none) and (pointer: coarse)").matches);
      if (!touch) setActiveRow(matrix, row);
      previewVariationFromRow(matrix, row, true, touch);
    }, true);

    matrix.addEventListener("pointerdown", function (e) {
      if (!isQtyInput(e.target)) return;
      selectQtyInput(e.target);
    }, true);

    matrix.addEventListener("focusin", function (e) {
      if (!e.target) return;

      if (isQtyInput(e.target)) {
        var row0 = e.target.closest(".eg-row");
        if (row0) setActiveRow(matrix, row0);

        selectQtyInput(e.target);
      }
    }, true);

    matrix.addEventListener("input", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-eg-qty]")) {
        e.stopPropagation();

        var row = e.target.closest(".eg-row");
        if (row) clampQtyToStock(row);

        scheduleRecalc(matrix);
      }
    }, true);

    matrix.addEventListener("change", function (e) {
      if (e.target && e.target.matches && e.target.matches("[data-eg-qty]")) {
        e.stopPropagation();

        var row = e.target.closest(".eg-row");
        if (row) clampQtyToStock(row);

        scheduleRecalc(matrix);
      }
    }, true);

    matrix.addEventListener("click", function (e) {
      var btn = e.target && e.target.closest ? e.target.closest("[data-eg-matrix-add]") : null;
      if (!btn || btn.disabled) return;

      if (!btn.getAttribute("data-eg-base-text")) {
        btn.setAttribute("data-eg-base-text", btn.textContent || "");
      }

      var baseText = btn.getAttribute("data-eg-base-text") || (btn.textContent || "");

      var items = [];
      var allRows = matrix.querySelectorAll(".eg-row");

      for (var i = 0; i < allRows.length; i++) {
        var row = allRows[i];

        if (row.dataset.egVariationState !== "available") continue;
        var qtyEl = row._egQtyEl || row.querySelector("[data-eg-qty]");
        if (!qtyEl || qtyEl.disabled) continue;
        var q = toInt(qtyEl.value);

        if (q <= 0) continue;

        clampQtyToStock(row);

        q = toInt(qtyEl.value);
        if (q <= 0) continue;

        var vId = row.getAttribute("data-eg-variation-id");
        if (!vId) continue;

        if (q > STOCK_CAP) q = STOCK_CAP;

        items.push({
          variationId: vId,
          quantity: q
        });
      }

      if (!items.length) return;

      // The pre-clamp and the POST operate on this selection. Do not let a
      // later edit be cleared as if it had been included in the same write.
      var writeInputs = Array.from(matrix.querySelectorAll('[data-eg-qty]:not(:disabled)'));
      matrix._egWriteInputs = writeInputs;
      writeInputs.forEach(function (input) { input.disabled = true; });
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.setAttribute("data-eg-busy", "1");
      btn.textContent = t("add_start");

      (async function () {
        var snapBefore = null;
        var hadAdjustments = false;

        try {
          try {
            snapBefore = await getBasketSnapshot();
          } catch (eBefore) {
            snapBefore = null;
          }

          // Vor dem eigentlichen Add prüfen, was schon im Warenkorb liegt.
          // Mengen, die nicht mehr addbar sind, werden vorher auf 0 gesetzt und nicht gepostet.
          var pre = preClampItemsAgainstBasket(items, snapBefore && snapBefore.qtyMap, matrix);
          items = pre.items;
          hadAdjustments = pre.adjusted > 0 || pre.blocked > 0;
          recalcMatrixTotals(matrix);

          if (!items.length) {
            showInfoToast(t("info_nothing_addable"), "[data-eg-size-matrix]", 1);

            btn.textContent = t("not_addable");

            setTimeout(function () {
              btn.textContent = baseText;
              btn.disabled = false;
              btn.removeAttribute("aria-busy");
              btn.removeAttribute("data-eg-busy");
            }, 1200);

            return;
          }

          // Normalfall: genau EIN Batch-POST.
          var response = await addItemsToBasketBatch(items);

          var basket = response?.events?.AfterBasketChanged?.basket || response?.data?.basket;
          // A confirmed write is complete even if the separate header GET stalls.
          O46Core.basketHeader.accept(basket).then(function (accepted) {
            if (!accepted) return O46Core.basketHeader.refreshAfterWrite();
          });

          var qInputs = matrix.querySelectorAll("[data-eg-qty]");
          for (var j = 0; j < qInputs.length; j++) {
            qInputs[j].value = "0";
          }

          recalcMatrixTotals(matrix);

          if (hadAdjustments) {
            showInfoToast(t("info_some_limited"), "[data-eg-size-matrix]", 1);
          }

          btn.textContent = t("added_ok");
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.removeAttribute("data-eg-busy");

          if (window.eGuardians && eGuardians.basket && typeof eGuardians.basket.openBasketPreviewSmall === "function") {
            eGuardians.basket.openBasketPreviewSmall(function () {
              var $jq = window.jQuery || window.$;

              if ($jq) {
                $jq("html").addClass("basket-prev-small-open");

                setTimeout(function () {
                  $jq("html").removeClass("basket-prev-small-open");
                }, 3000);
              }
            });
          }

          return;
        } catch (err) {
          // Bundles can partially add other variation IDs, and another tab can
          // change quantities. A later basket snapshot cannot identify this write.
          O46Core.basketHeader.refreshAfterWrite();
          showErrorToast((err?.basketReason ? err.basketReason + " " : "") + t("add_uncertain"), matrix);
          btn.textContent = t("add_uncertain");
          btn.disabled = false;
          btn.removeAttribute("aria-busy");
          btn.removeAttribute("data-eg-busy");
        } finally {
          matrix._egWriteInputs = null;
          writeInputs.forEach(function (input) {
            input.disabled = input.closest(".eg-row").dataset.egVariationState !== "available";
          });
        }
      })();
    });
  }

  window.egInitSizeMatrices = function (root) {
    root = root || document;

    var matrices = root.matches && root.matches("[data-eg-size-matrix]") ? [root] : root.querySelectorAll("[data-eg-size-matrix]");
    if (!matrices || !matrices.length) return;

    for (var i = 0; i < matrices.length; i++) {
      initMatrix(matrices[i]);
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.egInitSizeMatrices(document);
  });

  document.addEventListener("shown.bs.modal", function (e) {
    window.egInitSizeMatrices(e.target);
  });

  // MutationObserver throttled
  if (!window.MutationObserver) return;

  var moScheduled = false;
  var moScanRoots = [];

  function scheduleMoScan() {
    if (moScheduled) return;

    moScheduled = true;

    (window.requestAnimationFrame || function (fn) {
      return setTimeout(fn, 16);
    })(function () {
      moScheduled = false;

      for (var i = 0; i < moScanRoots.length; i++) {
        window.egInitSizeMatrices(moScanRoots[i]);
      }

      moScanRoots.length = 0;
    });
  }

  var mo = new MutationObserver(function (mutations) {
    for (var i = 0; i < mutations.length; i++) {
      var m = mutations[i];
      if (m.removedNodes) m.removedNodes.forEach(function (node) {
        releaseMatrixHeadingLabels(node);
        if (!node.isConnected) releaseMatrixZoom(node);
      });

      if (!m.addedNodes || !m.addedNodes.length) continue;

      for (var j = 0; j < m.addedNodes.length; j++) {
        var node = m.addedNodes[j];

        if (!node || node.nodeType !== 1) continue;

        if (node.matches && node.matches("[data-eg-size-matrix]")) {
          moScanRoots.push(node);
          scheduleMoScan();
          continue;
        }

        if (node.querySelector && node.querySelector("[data-eg-size-matrix]")) {
          moScanRoots.push(node);
          scheduleMoScan();
        }
      }
    }
  });

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
    O46Core.installed.matrix = true;
};
