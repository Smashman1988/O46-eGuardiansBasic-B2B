var tseElem =  document.getElementById('isVueView');

O46Core.vendors.call(window);
var eGuardians = (function(eGuardians) {

  // Constructor
  function eGuardians() {
    this.initialize();
  }
function _getBasketCacheKey() {
    const sessionData = window.egSessionData || {}; // Annahme: wir speichern die Session-Daten global
    const lang = $('html').attr('lang') || 'de';
    const currency = sessionData.basket?.currency || 'EUR';
    const shippingCountryId = sessionData.basket?.shippingCountryId || 1;
    const customerId = sessionData.basket?.customerId > 0 ? sessionData.basket.customerId : 'guest';
    return `${lang}_${currency}_${shippingCountryId}_${customerId}`;
}
eGuardians.getBasketCacheKey = _getBasketCacheKey;

(function () {
  function updateBasketFromCache() {
    try {
      let basket;
            try {
              basket = JSON.parse(localStorage.getItem('basketCache_' + eGuardians.getBasketCacheKey()))?.data?.basket;
            } catch (e) {
              localStorage.removeItem('basketCache_' + eGuardians.getBasketCacheKey());
            }

      if (!basket) return;

      const elQuantity = document.querySelector('[data-eg-basket-quantity]');
      const elSum = document.querySelector('[data-basket-sum]');

      if (elQuantity) {
        elQuantity.setAttribute('data-eg-basket-quantity', basket.itemQuantity);
        elQuantity.innerHTML = basket.itemQuantity;
      }

      if (elSum) {
        elSum.innerHTML = basket.itemSum.toFixed(2).replace('.', ',');
      }

      if (basket.itemWishListIds?.length > 0) {
        document.querySelector('.wishlist-link')?.classList.remove('noWishListItems');
      }
    } catch (e) {
      // optional: Fehler ignorieren oder Monitoring
    }
  }

  window.addEventListener('pageshow', function () {
    setTimeout(updateBasketFromCache, 100);
  });

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      setTimeout(updateBasketFromCache, 100);
    }
  });
})();


    
eGuardians.initialize = function () {
    // 🛡 quickViewItem-Fallback für kaputte URLs
    try {
        if (typeof URLSearchParams !== 'undefined' && typeof URL !== 'undefined') {
            const url = new URL(window.location.href);
            const params = url.searchParams;
            const isQuickView = params.get('quickViewItem') === 'true';
            const isExpectedContext = document.querySelector('.category-product-list');

            if (isQuickView && !isExpectedContext) {
                params.delete('quickViewItem');
                const cleanUrl = url.origin + url.pathname + (params.toString() ? '?' + params.toString() : '');
                window.location.replace(cleanUrl);
                return; // Kein weiterer Init!
            }
        }
    } catch (err) {
        console.warn('[Failsafe] quickViewItem-Check fehlgeschlagen:', err);
    }

    // 🔁 Event-Bindings aktivieren
    this.events.bindEvents();

    // 🔐 Watchdog prüft initial Cache & Sessiondaten
    this.events.watchdogInit();

    // 📦 Aktuelle URL-Parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlCurrency = urlParams.get('currency')?.toUpperCase() || null;
    const urlLang = $('html').attr('lang')?.toLowerCase() || 'de';

    // 🧹 Cache prüfen
    const cacheKeyPrefix = 'basketCache_';
    const currentCacheKey = Object.keys(localStorage).find(key => key.startsWith(cacheKeyPrefix));

    if (currentCacheKey) {
        const cacheParts = currentCacheKey.replace(cacheKeyPrefix, '').split('_');
        const cachedLang = cacheParts[0]?.toLowerCase() || 'de';
        const cachedCurrency = cacheParts[1]?.toUpperCase() || 'EUR';

        let mustReload = false;

        if (urlCurrency && urlCurrency !== cachedCurrency) mustReload = true;
        if (urlLang !== cachedLang) mustReload = true;

        if (mustReload) {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(cacheKeyPrefix)) localStorage.removeItem(key);
            });
            this.events.initShopData();
        }
    } else {
        this.events.initShopData();
    }

    // 🔄 Lokale Updates via storage-Event
    window.addEventListener('storage', function (event) {
        if (event.key && event.key.startsWith('basketCache_')) {
            try {
                const newData = JSON.parse(event.newValue || '{}');
                const basket = newData?.data?.basket;

                if (basket) {
                    $('[data-eg-basket-quantity]').attr('data-eg-basket-quantity', basket.itemQuantity).html(basket.itemQuantity);
                    $('[data-basket-sum]').html(basket.itemSum.toFixed(2).replace('.', ','));
                    if (basket.currency) $('[data-currency-symbol]').html(basket.currency);
                    if (basket.itemWishListIds?.length > 0) $('.wishlist-link').removeClass('noWishListItems');
                }
            } catch (e) {
                console.error('Error parsing basketCache_ data:', e);
            }
        }
    });

    // 🧠 Zusätzlicher Cache-Watchdog bei Sichtbarkeitswechsel & bfcache
    function recheckBasketCacheIfNeeded() {
        const cacheKey = 'basketCache_' + eGuardians.getBasketCacheKey();
        const cacheRaw = localStorage.getItem(cacheKey);

        if (!cacheRaw) {
            eGuardians.events.initShopData();
            return;
        }

        try {
            const cache = JSON.parse(cacheRaw);
            const now = Date.now();
            const maxAge = 30 * 60 * 1000;
            if (!cache.timestamp || (now - cache.timestamp) > maxAge) {
                eGuardians.events.initShopData();
            }
        } catch (e) {
            eGuardians.events.initShopData();
        }
    }

    window.addEventListener('pageshow', function (event) {
        if (event.persisted || performance.getEntriesByType("navigation")[0]?.type === "back_forward") {
            setTimeout(recheckBasketCacheIfNeeded, 100);
        }
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
            setTimeout(recheckBasketCacheIfNeeded, 100);
        }
    });
};

  eGuardians.events = new function() {
        var events = this;
        var timoutSave = null;
        this.observeLazyImages = function () {
            if (this.lazyObserver && this.lazyObserver.observer) {
                this.lazyObserver.observer.disconnect();
            }
            // Recreate to apply placeholders to new nodes; release the previous targets.
            this.lazyObserver = lozad();
            this.lazyObserver.observe();
        };
        this.bindEvents = function(bindWrapper){
           
            bindWrapper = bindWrapper || '[data-eg-event]';
            eGuardians.events.observeLazyImages();
            
            $(bindWrapper).each(function(){
                var target = this;
                if($(this).attr('data-eg-target')){
                    target = $(this).data('eg-target');
                }
                $(target).unbind($(this).data('eg-event'));
                  if($(this).data('eg-event')=="load"){
                      var extecuteFunction = eGuardians.events[$(this).data('eg-handler')];
                      if (!!extecuteFunction && typeof extecuteFunction == "function" ){
                          extecuteFunction(this);
                      }else{
                          console.error("Undefined function "+$(this).data('eg-handler'))
                      }
                  }else{
              
                      $(target).on($(this).data('eg-event'), function(event){
                          event.stopPropagation();
                          event.preventDefault();
                          var extecuteFunction = eGuardians.events[$(this).data('eg-handler')];

                          if (!!extecuteFunction && typeof extecuteFunction == "function" ){
                              extecuteFunction(this);
                          }else{
                              console.error("Undefined function "+$(this).data('eg-handler'))
                          }
                      });
                  }
            });
           
        }
this.addItemToBasket = function (_this) {
    const $btn = $(_this);

    if ($btn.hasClass('inBasketBtnDisabled')) {
        $('.attribute-box').each(function () {
            if ($(this).find('li[data-selected]').length === 0) {
                $(this).addClass('errorVariationSelect');
            }
        });
        return;
    }

    const $item = $btn.closest('[data-item]');
    const variationId = $item.attr('data-eg-active-variation');
    const $qtyInput = $item.find('[data-item-quantity]');
    const quantity = parseInt($qtyInput.val(), 10);

    eGuardians.helper.btnShowLoader(_this);

    eGuardians.basket.addItem(variationId, quantity, function (response) {
        if (response?.data?.exceptionCode) {
            eGuardians.ui.message.error.show({
                message: messageServiceTranslations[response.data.exceptionCode],
                insertElement: '.item-actions-wrap'
            });
            eGuardians.helper.btnHideLoader(_this);
            return;
        }

        const basket = response?.events?.AfterBasketChanged?.basket;

        if (basket) {
            const $basketQty = $('[data-eg-basket-quantity]');
            const $basketSum = $('[data-basket-sum]');
            const formattedSum = basket.itemSum.toFixed(2).replace('.', ',');

            if ($basketQty.text() !== String(basket.itemQuantity)) {
                $basketQty.attr('data-eg-basket-quantity', basket.itemQuantity).html(basket.itemQuantity);
            }

            if ($basketSum.text() !== formattedSum) {
                $basketSum.html(formattedSum);
            }
        }

        const $modal = $('.modal-cross');
        if ($modal.hasClass('show')) {
            $modal.modal('hide');
        }

        eGuardians.basket.openBasketPreviewSmall(() => {
            $('html').addClass('basket-prev-small-open');
            setTimeout(() => {
                $('html').removeClass('basket-prev-small-open');
            }, 3000);
        });

        eGuardians.helper.btnHideLoader(_this);
    });
};


        this.initVariation = function(_this){
            eGuardians.item.variations.init(_this);

        };
        this.openBasket = function(){
            console.log('open wh')
        };
        this.tgClass = function(_this){
            var arr = $(_this).data('eg-param').split(',');
        
            $(arr[0]).toggleClass(arr[1]);
            if(arr[1]=="search-open"){
                setTimeout(function(){
                    $('.input-ff-search').focus()
                }, 100);
                
            }
        };
        this.closeBackdrop = function(_this){
            $('html').removeClass('menu-open');
            $('html').removeClass('basket-preview-open');
            $('html').removeClass('filter-open');
        };
        this.ddownOpen = function(_this){
            $(_this).closest('.eg-ddown').addClass('ddown-open')
        };
        this.ddownBack = function(_this){
            $(_this).closest('.eg-ddown').removeClass('ddown-open')
        };
        this.modalContent = function(_this){
            eGuardians.ui.modal.modalRestContent($(_this).data('eg-href'),$(_this).data('eg-params'),$(_this).data('eg-title'),$(_this).data('eg-type'),
                _this.hasAttribute('data-eg-language-switch') ? _this.getAttribute('data-eg-language-unavailable') : undefined);
        };
        this.openBasketPreview = function(_this){
            eGuardians.basket.openBasketPreview()
        };
        this.initBasketPreview = function(_this){
            if($('html').hasClass('mobile-magic')){
                // $(_this).on('click', function(){
                 //   eGuardians.basket.openBasketPreview();
                // }); 
            }else{
                $(_this).on('mouseover', function(){
                    if(!$(_this).hasClass('basketPrevIsLoaded')){
                        eGuardians.basket.openBasketPreviewSmall();
                        $(_this).addClass('basketPrevIsLoaded')
                    }
                }); 
                $(_this).on('mouseleave', function(){
                   $('html').removeClass('basket-prev-small-open');
                });
            }
        };
        this.closeBasketPreview = function(_this){
      
            eGuardians.basket.closeBasketPreview();

        }
this.initShopData = function () {
    if (window._egInitShopDataRunning) return;
    window._egInitShopDataRunning = true;

    setTimeout(() => {
        window._egInitShopDataRunning = false;
    }, 5000);

    const cacheKeyPrefix = 'basketCache_';
    const cacheTTL = 30 * 60 * 1000;
    const now = Date.now();
    const existingCacheKey = Object.keys(localStorage).find(key => key.startsWith(cacheKeyPrefix));

    if (existingCacheKey) {
        const cached = JSON.parse(localStorage.getItem(existingCacheKey) || '{}');
        if (cached.timestamp && now - cached.timestamp < cacheTTL) {
            renderFromData(cached.data);
            window._egInitShopDataRunning = false;
            return;
        }
    }

    const templateData = JSON.parse(document.getElementById('app-data-custom').textContent);
    const searchParams = {
        templateType: templateData.templateType,
        _: Math.floor(Date.now() / 1000)
    };

    eGuardians.apiservice.get('/rest/io/session/', searchParams, function (response) {
        const basket = response.data?.basket || {};

        window.egSessionData = { basket: {
            itemQuantity: basket.itemQuantity,
            itemSum: basket.itemSum,
            currency: basket.currency,
            itemWishListIds: basket.itemWishListIds,
            shippingCountryId: basket.shippingCountryId,
            customerId: basket.customerId
        }};

        Object.keys(localStorage).forEach(function (key) {
            if (key.startsWith(cacheKeyPrefix)) {
                localStorage.removeItem(key);
            }
        });

        localStorage.setItem('basketCache_' + eGuardians.getBasketCacheKey(), JSON.stringify({
            timestamp: Date.now(),
            data: {
                basket: window.egSessionData.basket
            }
        }));

        renderFromData({ basket: window.egSessionData.basket });
        window._egInitShopDataRunning = false;
    });

    function renderFromData(response) {
        const basketData = response.basket;
        const wishlistData = basketData?.itemWishListIds || [];

        $('[data-eg-basket-quantity]')
            .attr('data-eg-basket-quantity', basketData.itemQuantity)
            .html(basketData.itemQuantity);

        $('[data-basket-sum]')
            .html(basketData.itemSum.toFixed(2).replace('.', ','));

        if (wishlistData.length > 0) {
            $('.wishlist-link').removeClass('noWishListItems');
            if ($('.single[data-item]').length > 0) {
                const aktivItemId = $('.single[data-item]').attr('data-eg-active-variation');
                wishlistData.forEach(itemId => {
                    if (aktivItemId == itemId) {
                        $('.btn-watch').addClass('item-in-wishlist');
                    }
                });
            }
        }
    }
};


this.watchdogInit = function () {
    const cacheKey = 'basketCache_' + eGuardians.getBasketCacheKey();
    const cacheRaw = localStorage.getItem(cacheKey);

    if (!window.egSessionData || !cacheRaw) {
        eGuardians.events.initShopData();
        return;
    }

    try {
        const cache = JSON.parse(cacheRaw);
        const now = Date.now();
        const maxAge = 30 * 60 * 1000;
        if (!cache.timestamp || (now - cache.timestamp) > maxAge) {
            eGuardians.events.initShopData();
        }
    } catch (e) {
        eGuardians.events.initShopData();
    }
};

        this.initCustomerLoggedStatus = function(){
            eGuardians.apiservice.get('/rest/io/customer/', '', function(response){
                if(response.data!="null" && response.data!=null){
                   $('.btn-login-open').addClass('isLoggedIn')
                   $('.loggedInName').html(response.data.firstName);
                }
                
            });
            
        }
// Globale Initialisierung
let lastFacetParams = '';
const facetDebounceDelay = 300;
let currentFacetRequest = null;
let isFacetLoading = false;
let facetRequestToken = 0;
let pendingFacetTimeout = null;

const lang = $('html').attr('lang') || 'de';
const facetTexts = {
  de: {
    loading: 'Produkte werden geladen…',
    result: count => `${count} Produkte anzeigen`
  },
  en: {
    loading: 'Loading products…',
    result: count => `Show ${count} products`
  },
  fr: {
    loading: 'Chargement des produits…',
    result: count => `Afficher ${count} produits`
  },
  it: {
    loading: 'Caricamento dei prodotti…',
    result: count => `Mostra ${count} prodotti`
  },
  es: {
    loading: 'Cargando productos…',
    result: count => `Mostrar ${count} productos`
  }
};


function setButtonLoading($btn, token) {
  if ($btn.length) {
    $btn.removeClass('display-none').css('display', 'inline-block');
    $btn
      .addClass('btn-load')
      .prop('disabled', true)
      .data('eg-targeturl', null)
      .attr('data-token', token)
      .html('<span data-state="loading">' + (facetTexts[lang]?.loading || facetTexts.de.loading) + '</span>');
  }
}

function setButtonDone($btn, token, count) {
  if ($btn.length && $btn.attr('data-token') == token) {
    $btn.removeClass('display-none').css('display', 'inline-block');
    $btn
      .removeClass('btn-load')
      .prop('disabled', !$btn.data('eg-targeturl'))
      .html('<span>' + (facetTexts[lang]?.result(count) || facetTexts.de.result(count)) + '</span>');
  }
}

$(document).off('click', '[data-eg-btnfilter]').on('click', '[data-eg-btnfilter]', function () {
  if (!window.isFacetLoading) {
    const target = $(this).data('eg-targeturl');
    if (target) document.location.href = target;
  }
});

const debounce = (func, delay) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      pendingFacetTimeout = null;
      func.apply(this, args);
    }, delay);
    pendingFacetTimeout = timer;
  };
};

this.facetFilter = debounce(function (_this) {
  const $facetsContainer = $('[data-eg-facets]');
  const $checkedInputs = $facetsContainer.find('input:checked');
  let facetIdParams = $checkedInputs.map(function () {
    return $(this).data('eg-facetvalueid');
  }).get().join(',');

  let priceMin = isNaN($('.facet-input-price-min').val()) ? 0 : $('.facet-input-price-min').val();
  let priceMax = isNaN($('.facet-input-price-max').val()) ? 0 : $('.facet-input-price-max').val();

  if ($(_this).hasClass('facet-remove-price')) {
    priceMin = 0;
    priceMax = 0;
    $('.facet-input-price-min, .facet-input-price-max').val('');
  }

  const searchText = $facetsContainer.attr('data-eg-searchstring') ?? '';
  const searchParams = {
    query: searchText,
    facets: facetIdParams,
    priceMin: priceMin,
    priceMax: priceMax,
    categoryId: $facetsContainer.data('eg-catid')
  };

  const currentParams = JSON.stringify(searchParams);
  if (currentParams === lastFacetParams && isFacetLoading) return;
  lastFacetParams = currentParams;

  facetRequestToken++;
  const myToken = facetRequestToken;
  isFacetLoading = true;

  const $btnTop = $('.btnfilter-mobile-top');
  const $btnBottom = $('.btnfilter-mobile-bottom');
  const $btnDesktop = $('.btnfilter-desktop');

  setButtonLoading($btnTop, myToken);
  setButtonLoading($btnBottom, myToken);
  setButtonLoading($btnDesktop, myToken);

  $(_this).closest('.eg-dropdown-content').addClass('isLoading');
  $('.forRemove').remove();

  if (currentFacetRequest && currentFacetRequest.readyState !== 4) {
    currentFacetRequest.abort();
  }

  currentFacetRequest = $.ajax({
    url: '/rest/io/facet/',
    method: 'GET',
    data: searchParams,
    dataType: 'json',
    success: function (response) {
      if (myToken !== facetRequestToken) return;

      $('.ffix li').attr('data-eg-facet-itemcount', 0);
      $('.ffix .chk-count').html(0);

      response.data.facets.forEach(facetGroup => {
        facetGroup.values.forEach(facetValue => {
          const $facetLi = $('#facet-item-' + facetValue.id).closest('li');
          $facetLi.attr('data-eg-facet-itemcount', facetValue.count);
          $facetLi.find('.chk-count').html(facetValue.count);
        });
      });

      const productCount = response.data.itemList.total;
      const urlParam = {};
      if (priceMin > 0 || priceMax > 0) {
        urlParam["priceMin"] = priceMin;
        urlParam["priceMax"] = priceMax;
      }

      const queryString = searchText.trim();
      if (queryString) {
        urlParam["query"] = queryString;
      }

      if ($checkedInputs.length > 0) {
        urlParam["facets"] = facetIdParams;
      }

      const $sort = $('.eg-dropdown-sort');
      if ($sort.data('eg-activesorting') !== $sort.data('eg-defaultsorting')) {
        urlParam["sorting"] = $sort.data('eg-activesorting');
      }

      const targetSearchUrl = $.param(urlParam) !== "" ? window.location.pathname + '?' + $.param(urlParam) : window.location.pathname;

      $btnTop.data('eg-targeturl', targetSearchUrl);
      $btnBottom.data('eg-targeturl', targetSearchUrl);
      $btnDesktop.data('eg-targeturl', targetSearchUrl);

      currentFacetRequest = null;
      isFacetLoading = false;

      if (myToken === facetRequestToken && pendingFacetTimeout === null) {
        setButtonDone($btnTop, myToken, productCount);
        setButtonDone($btnBottom, myToken, productCount);
        setButtonDone($btnDesktop, myToken, productCount);
      }

      $(_this).closest('.eg-dropdown-content').removeClass('isLoading');

      if ($(_this).hasClass('pricefilter')) {
        document.location.href = targetSearchUrl;
      }
    },
    error: function () {
      if (myToken !== facetRequestToken) return;

      currentFacetRequest = null;
      isFacetLoading = false;

      setButtonDone($('.btnfilter-mobile-top'), myToken, 0);
      setButtonDone($('.btnfilter-mobile-bottom'), myToken, 0);
      setButtonDone($('.btnfilter-desktop'), myToken, 0);

      $(_this).closest('.eg-dropdown-content').removeClass('isLoading');
    }
  });
}, facetDebounceDelay);

        this.loginUser = function(_this){
            
            var loginMail = $('#login-mail').val();
            var loginPassword = $('#login-password').val();
            if(eGuardians.validator.checkInputs($('.login-form input'))){
                eGuardians.helper.btnShowLoader(_this);
                eGuardians.user.login(loginMail, loginPassword,function(response){
                    if(response.events.AfterAccountAuthentication.isSuccess){ 
                        
                        eGuardians.ui.message.success.show({
                            'message'        : messageServiceTranslations["login1"]+' '+response.events.AfterAccountAuthentication.accountContact.firstName+' '+messageServiceTranslations["login2"],
                            'insertElement'  : '.login-form-action',
                            'customClass'    : 'alert-login'
                        })
                        setTimeout(function(){ 
                            document.location.reload();
                        }, 3000);
                        
                    }else{
                        var errormsg = "";
                        if(response.error.message=="user is blocked"){
                            errormsg = messageServiceTranslations["banneduser"];
                        }else{
                            errormsg = messageServiceTranslations["wronguserlogindata"];
                        }
                        eGuardians.ui.message.error.show({
                            'message'        : errormsg,
                            'insertElement'  : '.login-form-action',
                            'customClass'    : 'alert-login'
                        })
                    }
                    eGuardians.helper.btnHideLoader(_this);
                });
            }
        }
        this.logoutUser = function(_this){
            
            eGuardians.helper.btnShowLoader(_this);

            eGuardians.user.logout(function(){
                eGuardians.helper.btnHideLoader(_this);
                eGuardians.ui.message.success.show({
                    'message'        : messageServiceTranslations["successlogout"],
                    'insertElement'  : '.loginpreview-register'
                });
                $(_this).removeClass('btn-load');
                setTimeout(function(){ 
                            document.location.href = "https://b2b.outlet46.de";
                }, 3000);
            });
        }
        this.pwdResetUser = function(_this){
            var searchParams = {
                email: $('#pwd-reset-mail').val()
            }
            
            if(eGuardians.validator.checkInputs($('.pwdreset-form input'))){
                eGuardians.helper.btnShowLoader(_this);
                eGuardians.apiservice.post('/rest/io/customer/password_reset/', searchParams, function(response){
                    eGuardians.helper.btnHideLoader(_this);
                    if(response.data==true){
                      eGuardians.ui.message.success.show({
                        'message'        : messageServiceTranslations["successpwdreset"],
                        'insertElement'  : '.pwd-reset-action',
                        'customClass'    : 'alert-login'
                      })  
                    }else{
                        eGuardians.ui.message.error.show({
                            'message'        : messageServiceTranslations["failedpwdreset"],
                            'insertElement'  : '.pwd-reset-action',
                            'customClass'    : 'alert-login'
                        })
                    }
              
                });
            }
        }
        this.openDropDown = function(_this){
            $('.eg-dropdown.isOpen').not($(_this).parents('.eg-dropdown')).removeClass('isOpen');
            $(_this).parents('.eg-dropdown').toggleClass('isOpen');
        }
       
        this.initCatItemEvents = function(){
            
            $('.eg-dropdown-value').click(function(){
                $(this).parents('.eg-dropdown').toggleClass('isOpen');
            });
            $('.eg-dropdown-sort li span').click(function(){
                $('.eg-dropdown-sort').find('.eg-dropdown-value .sort-val').html($(this).html());
                $('.eg-dropdown-sort').removeClass('isOpen');
                document.location.href = $(this).data('eg-href');
            });
            $('body').on('click', '.facet-remove-btn', function(){
                $(this).addClass('forRemove');
            });
        }
        this.initLiveSearch = O46Core.initLiveSearch
  };
  
  return eGuardians;

})();
/**
 * @module Helper
 */
(function () {
    eGuardians.helper = new function () {
        this.sort_li = function(a, b){
            return ($(b).data('eg-index')) < ($(a).data('eg-index')) ? 1 : -1;  
        }
    };
})(eGuardians);
/**
 * @module API Service
 */
O46Core.apiservice.call(window);

/**
 * @module Item
 */
O46Core.item.call(window);
/**
 * @module UI
 */
O46Core.ui.call(window, 5000);
/**
 * @module Basket
 */
O46Core.basket.call(window);

/**
 * @module User
 */
O46Core.user.call(window);
/**
 * @module Validator
 */
O46Core.validator.call(window);
/**
 * @module Helper
 */
O46Core.helper.call(window);
 // return eGuardians = new eGuardians();

/** CUSTOM JS */
var loadJS = function(url, implementationCode, location){
    //url is URL of external file, implementationCode is the code
    //to be called from the file, location is the location to 
    //insert the <script> element
    var scriptTag = document.createElement('script');
    scriptTag.src = url;

    scriptTag.onload = implementationCode;
    scriptTag.onreadystatechange = implementationCode;

    location.appendChild(scriptTag);
};                                                                                               

$(document).on('click', '.related-search button', function(event){   
    if($(this).hasClass('directlink')){
        document.location.href = $(this).data('searchtxt');
    }else{
        document.location.href= "/search/?query="+$(this).data('searchtxt');
    }
});
$(document).on('click', '.mobile-magic .top-menu > .eg-ddown > a', function(event){ 
    $('.top-menu > .eg-ddown').not($(this).closest('.eg-ddown')).removeClass('isOpen');
    if($(window).width()>=992 && !$(this).closest('.eg-ddown').hasClass('isOpen')){
        $(this).closest('.eg-ddown').addClass('isOpen');
        return false;
    }
    
});

$(document).on('click touchend', '.menuShowAll', function(e){   
    e.stopPropagation(); 
    e.preventDefault();
    document.location.href = $(this).closest('.eg-ddown').find('a').first().attr('href');
});

$('body :not(.checkout) [data-toggle="tooltip"]').tooltip();



O46Core.lazyImages.call(window);


/* Preserve galleries from stored content as well as PDPs and Quickviews. */
O46Core.startInitialGallery();

// Global outside click: bind once, independently of refreshed Quickview elements.
$(document).mouseup(function(e) {
    var container = $(".eg-dropdown").not(".cat-facet");
    if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.removeClass("isOpen");
    }
});

$(document).on('click', '.linkabso', function () {
    return O46Core.openQuickview(this, 10);
});
/*!
 * Infinite Scroll PACKAGED v5.0.0
 * Automatically add next page
 * MIT License
 * https://infinite-scroll.com
 * Copyright 2018-2025 Metafizzy
 */
!function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("jquery")):t.jQueryBridget=e(t,t.jQuery)}(window,(function(t,e){let i=t.console,n=void 0===i?function(){}:function(t){i.error(t)};return function(i,o,s){(s=s||e||t.jQuery)&&(o.prototype.option||(o.prototype.option=function(t){t&&(this.options=Object.assign(this.options||{},t))}),s.fn[i]=function(t,...e){return"string"==typeof t?function(t,e,o){let r,l=`$().${i}("${e}")`;return t.each((function(t,h){let a=s.data(h,i);if(!a)return void n(`${i} not initialized. Cannot call method ${l}`);let c=a[e];if(!c||"_"==e.charAt(0))return void n(`${l} is not a valid method`);let u=c.apply(a,o);r=void 0===r?u:r})),void 0!==r?r:t}(this,t,e):(r=t,this.each((function(t,e){let n=s.data(e,i);n?(n.option(r),n._init()):(n=new o(e,r),s.data(e,i,n))})),this);var r})}})),function(t,e){"object"==typeof module&&module.exports?module.exports=e():t.EvEmitter=e()}("undefined"!=typeof window?window:this,(function(){function t(){}let e=t.prototype;return e.on=function(t,e){if(!t||!e)return this;let i=this._events=this._events||{},n=i[t]=i[t]||[];return n.includes(e)||n.push(e),this},e.once=function(t,e){if(!t||!e)return this;this.on(t,e);let i=this._onceEvents=this._onceEvents||{};return(i[t]=i[t]||{})[e]=!0,this},e.off=function(t,e){let i=this._events&&this._events[t];if(!i||!i.length)return this;let n=i.indexOf(e);return-1!=n&&i.splice(n,1),this},e.emitEvent=function(t,e){let i=this._events&&this._events[t];if(!i||!i.length)return this;i=i.slice(0),e=e||[];let n=this._onceEvents&&this._onceEvents[t];for(let o of i){n&&n[o]&&(this.off(t,o),delete n[o]),o.apply(this,e)}return this},e.allOff=function(){return delete this._events,delete this._onceEvents,this},t})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t):t.fizzyUIUtils=e(t)}(this,(function(t){let e={extend:function(t,e){return Object.assign(t,e)},modulo:function(t,e){return(t%e+e)%e},makeArray:function(t){if(Array.isArray(t))return t;if(null==t)return[];return"object"==typeof t&&"number"==typeof t.length?[...t]:[t]},removeFrom:function(t,e){let i=t.indexOf(e);-1!=i&&t.splice(i,1)},getParent:function(t,e){for(;t.parentNode&&t!=document.body;)if((t=t.parentNode).matches(e))return t},getQueryElement:function(t){return"string"==typeof t?document.querySelector(t):t},handleEvent:function(t){let e="on"+t.type;this[e]&&this[e](t)},filterFindElements:function(t,i){return(t=e.makeArray(t)).filter((t=>t instanceof HTMLElement)).reduce(((t,e)=>{if(!i)return t.push(e),t;e.matches(i)&&t.push(e);let n=e.querySelectorAll(i);return t=t.concat(...n)}),[])},debounceMethod:function(t,e,i){i=i||100;let n=t.prototype[e],o=e+"Timeout";t.prototype[e]=function(){clearTimeout(this[o]);let t=arguments;this[o]=setTimeout((()=>{n.apply(this,t),delete this[o]}),i)}},docReady:function(t){let e=document.readyState;"complete"==e||"interactive"==e?setTimeout(t):document.addEventListener("DOMContentLoaded",t)},toDashed:function(t){return t.replace(/(.)([A-Z])/g,(function(t,e,i){return e+"-"+i})).toLowerCase()}},i=t.console;return e.htmlInit=function(n,o){e.docReady((function(){let s="data-"+e.toDashed(o),r=document.querySelectorAll(`[${s}]`),l=t.jQuery;[...r].forEach((t=>{let e,r=t.getAttribute(s);try{e=r&&JSON.parse(r)}catch(e){return void(i&&i.error(`Error parsing ${s} on ${t.className}: ${e}`))}let h=new n(t,e);l&&l.data(t,o,h)}))}))},e})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter"),require("fizzy-ui-utils")):t.InfiniteScroll=e(t,t.EvEmitter,t.fizzyUIUtils)}(window,(function(t,e,i){let n=t.jQuery,o={};function s(t,e){let r=i.getQueryElement(t);if(r){if((t=r).infiniteScrollGUID){let i=o[t.infiniteScrollGUID];return i.option(e),i}this.element=t,this.options={...s.defaults},this.option(e),n&&(this.$element=n(this.element)),this.create()}else console.error("Bad element for InfiniteScroll: "+(r||t))}s.defaults={},s.create={},s.destroy={};let r=s.prototype;Object.assign(r,e.prototype);let l=0;r.create=function(){let t=this.guid=++l;if(this.element.infiniteScrollGUID=t,o[t]=this,this.pageIndex=1,this.loadCount=0,this.updateGetPath(),this.getPath&&this.getPath()){this.updateGetAbsolutePath(),this.log("initialized",[this.element.className]),this.callOnInit();for(let t in s.create)s.create[t].call(this)}else console.error("Disabling InfiniteScroll")},r.option=function(t){Object.assign(this.options,t)},r.callOnInit=function(){let t=this.options.onInit;t&&t.call(this,this)},r.dispatchEvent=function(t,e,i){this.log(t,i);let o=e?[e].concat(i):i;if(this.emitEvent(t,o),!n||!this.$element)return;let s=t+=".infiniteScroll";if(e){let i=n.Event(e);i.type=t,s=i}this.$element.trigger(s,i)};let h={initialized:t=>`on ${t}`,request:t=>`URL: ${t}`,load:(t,e)=>`${t.title||""}. URL: ${e}`,error:(t,e)=>`${t}. URL: ${e}`,append:(t,e,i)=>`${i.length} items. URL: ${e}`,last:(t,e)=>`URL: ${e}`,history:(t,e)=>`URL: ${e}`,pageIndex:function(t,e){return`current page determined to be: ${t} from ${e}`}};r.log=function(t,e){if(!this.options.debug)return;let i=`[InfiniteScroll] ${t}`,n=h[t];n&&(i+=". "+n.apply(this,e)),console.log(i)},r.updateMeasurements=function(){this.windowHeight=t.innerHeight;let e=this.element.getBoundingClientRect();this.top=e.top+t.scrollY},r.updateScroller=function(){let e=this.options.elementScroll;if(e){if(this.scroller=!0===e?this.element:i.getQueryElement(e),!this.scroller)throw new Error(`Unable to find elementScroll: ${e}`)}else this.scroller=t},r.updateGetPath=function(){let t=this.options.path;if(!t)return void console.error(`InfiniteScroll path option required. Set as: ${t}`);let e=typeof t;"function"!=e?"string"==e&&t.match("{{#}}")?this.updateGetPathTemplate(t):this.updateGetPathSelector(t):this.getPath=t},r.updateGetPathTemplate=function(t){this.getPath=()=>{let e=this.pageIndex+1;return t.replace("{{#}}",e)};let e=t.replace(/(\\\?|\?)/,"\\?").replace("{{#}}","(\\d\\d?\\d?)"),i=new RegExp(e),n=location.href.match(i);n&&(this.pageIndex=parseInt(n[1],10),this.log("pageIndex",[this.pageIndex,"template string"]))};let a=[/^(.*?\/?page\/?)(\d\d?\d?)(.*?$)/,/^(.*?\/?\?page=)(\d\d?\d?)(.*?$)/,/(.*?)(\d\d?\d?)(?!.*\d)(.*?$)/],c=s.getPathParts=function(t){if(t)for(let e of a){let i=t.match(e);if(i){let[,t,e,n]=i;return{begin:t,index:e,end:n}}}};r.updateGetPathSelector=function(t){let e=document.querySelector(t);if(!e)return void console.error(`Bad InfiniteScroll path option. Next link not found: ${t}`);let i=e.getAttribute("href"),n=c(i);if(!n)return void console.error(`InfiniteScroll unable to parse next link href: ${i}`);let{begin:o,index:s,end:r}=n;this.isPathSelector=!0,this.getPath=()=>o+(this.pageIndex+1)+r,this.pageIndex=parseInt(s,10)-1,this.log("pageIndex",[this.pageIndex,"next link"])},r.updateGetAbsolutePath=function(){let t=this.getPath();if(t.match(/^http/)||t.match(/^\//))return void(this.getAbsolutePath=this.getPath);let{pathname:e}=location,i=t.match(/^\?/),n=e.substring(0,e.lastIndexOf("/")),o=i?e:n+"/";this.getAbsolutePath=()=>o+this.getPath()},s.create.hideNav=function(){let t=i.getQueryElement(this.options.hideNav);t&&(t.style.display="none",this.nav=t)},s.destroy.hideNav=function(){this.nav&&(this.nav.style.display="")},r.destroy=function(){this.allOff();for(let t in s.destroy)s.destroy[t].call(this);delete this.element.infiniteScrollGUID,delete o[this.guid],n&&this.$element&&n.removeData(this.element,"infiniteScroll")},s.throttle=function(t,e){let i,n;return e=e||200,function(){let o=+new Date,s=arguments,r=()=>{i=o,t.apply(this,s)};i&&o<i+e?(clearTimeout(n),n=setTimeout(r,e)):r()}},s.data=function(t){let e=(t=i.getQueryElement(t))&&t.infiniteScrollGUID;return e&&o[e]},s.setJQuery=function(t){n=t},i.htmlInit(s,"infinite-scroll"),r._init=function(){};let{jQueryBridget:u}=t;return n&&u&&u("infiniteScroll",s,n),s})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("./core")):e(t,t.InfiniteScroll)}(window,(function(t,e){let i=e.prototype;Object.assign(e.defaults,{loadOnScroll:!0,checkLastPage:!0,responseBody:"text",domParseResponse:!0}),e.create.pageLoad=function(){this.canLoad=!0,this.on("scrollThreshold",this.onScrollThresholdLoad),this.on("load",this.checkLastPage),this.options.outlayer&&this.on("append",this.onAppendOutlayer)},i.onScrollThresholdLoad=function(){this.options.loadOnScroll&&this.loadNextPage()};let n=new DOMParser;function o(t){let e=document.createDocumentFragment();return t&&e.append(...t),e}return i.loadNextPage=function(){if(this.isLoading||!this.canLoad)return;let{responseBody:t,domParseResponse:e,fetchOptions:i}=this.options,o=this.getAbsolutePath();this.isLoading=!0,"function"==typeof i&&(i=i());let s=fetch(o,i).then((i=>{if(!i.ok){let t=new Error(i.statusText);return this.onPageError(t,o,i),{response:i}}return i[t]().then((s=>("text"==t&&e&&(s=n.parseFromString(s,"text/html")),204==i.status?(this.lastPageReached(s,o),{body:s,response:i}):this.onPageLoad(s,o,i))))})).catch((t=>{this.onPageError(t,o)}));return this.dispatchEvent("request",null,[o,s]),s},i.onPageLoad=function(t,e,i){return this.options.append||(this.isLoading=!1),this.pageIndex++,this.loadCount++,this.dispatchEvent("load",null,[t,e,i]),this.appendNextPage(t,e,i)},i.appendNextPage=function(t,e,i){let{append:n,responseBody:s,domParseResponse:r}=this.options;if(!("text"==s&&r)||!n)return{body:t,response:i};let l=t.querySelectorAll(n),h={body:t,response:i,items:l};if(!l||!l.length)return this.lastPageReached(t,e),h;let a=o(l),c=()=>(this.appendItems(l,a),this.isLoading=!1,this.dispatchEvent("append",null,[t,e,l,i]),h);return this.options.outlayer?this.appendOutlayerItems(a,c):c()},i.appendItems=function(t,e){t&&t.length&&(function(t){let e=t.querySelectorAll("script");for(let t of e){let e=document.createElement("script"),i=t.attributes;for(let t of i)e.setAttribute(t.name,t.value);e.innerHTML=t.innerHTML,t.parentNode.replaceChild(e,t)}}(e=e||o(t)),this.element.appendChild(e))},i.appendOutlayerItems=function(i,n){let o=e.imagesLoaded||t.imagesLoaded;return o?new Promise((function(t){o(i,(function(){let e=n();t(e)}))})):(console.error("[InfiniteScroll] imagesLoaded required for outlayer option"),void(this.isLoading=!1))},i.onAppendOutlayer=function(t,e,i){this.options.outlayer.appended(i)},i.checkLastPage=function(t,e){let i,{checkLastPage:n,path:o}=this.options;if(n){if("function"==typeof o){if(!this.getPath())return void this.lastPageReached(t,e)}"string"==typeof n?i=n:this.isPathSelector&&(i=o),i&&t.querySelector&&(t.querySelector(i)||this.lastPageReached(t,e))}},i.lastPageReached=function(t,e){this.canLoad=!1,this.dispatchEvent("last",null,[t,e])},i.onPageError=function(t,e,i){return this.isLoading=!1,this.canLoad=!1,this.dispatchEvent("error",null,[t,e,i]),t},e.create.prefill=function(){if(!this.options.prefill)return;let t=this.options.append;t?(this.updateMeasurements(),this.updateScroller(),this.isPrefilling=!0,this.on("append",this.prefill),this.once("error",this.stopPrefill),this.once("last",this.stopPrefill),this.prefill()):console.error(`append option required for prefill. Set as :${t}`)},i.prefill=function(){let t=this.getPrefillDistance();this.isPrefilling=t>=0,this.isPrefilling?(this.log("prefill"),this.loadNextPage()):this.stopPrefill()},i.getPrefillDistance=function(){return this.options.elementScroll?this.scroller.clientHeight-this.scroller.scrollHeight:this.windowHeight-this.element.clientHeight},i.stopPrefill=function(){this.log("stopPrefill"),this.off("append",this.prefill)},e})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("./core"),require("fizzy-ui-utils")):e(t,t.InfiniteScroll,t.fizzyUIUtils)}(window,(function(t,e,i){let n=e.prototype;return Object.assign(e.defaults,{scrollThreshold:400}),e.create.scrollWatch=function(){this.pageScrollHandler=this.onPageScroll.bind(this),this.resizeHandler=this.onResize.bind(this);let t=this.options.scrollThreshold;(t||0===t)&&this.enableScrollWatch()},e.destroy.scrollWatch=function(){this.disableScrollWatch()},n.enableScrollWatch=function(){this.isScrollWatching||(this.isScrollWatching=!0,this.updateMeasurements(),this.updateScroller(),this.on("last",this.disableScrollWatch),this.bindScrollWatchEvents(!0))},n.disableScrollWatch=function(){this.isScrollWatching&&(this.bindScrollWatchEvents(!1),delete this.isScrollWatching)},n.bindScrollWatchEvents=function(e){let i=e?"addEventListener":"removeEventListener";this.scroller[i]("scroll",this.pageScrollHandler),t[i]("resize",this.resizeHandler)},n.onPageScroll=e.throttle((function(){this.getBottomDistance()<=this.options.scrollThreshold&&this.dispatchEvent("scrollThreshold")})),n.getBottomDistance=function(){let e,i;return this.options.elementScroll?(e=this.scroller.scrollHeight,i=this.scroller.scrollTop+this.scroller.clientHeight):(e=this.top+this.element.clientHeight,i=t.scrollY+this.windowHeight),e-i},n.onResize=function(){this.updateMeasurements()},i.debounceMethod(e,"onResize",150),e})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("./core"),require("fizzy-ui-utils")):e(t,t.InfiniteScroll,t.fizzyUIUtils)}(window,(function(t,e,i){let n=e.prototype;Object.assign(e.defaults,{history:"replace"});let o=document.createElement("a");return e.create.history=function(){if(!this.options.history)return;o.href=this.getAbsolutePath(),(o.origin||o.protocol+"//"+o.host)==location.origin?this.options.append?this.createHistoryAppend():this.createHistoryPageLoad():console.error(`[InfiniteScroll] cannot set history with different origin: ${o.origin} on ${location.origin} . History behavior disabled.`)},n.createHistoryAppend=function(){this.updateMeasurements(),this.updateScroller(),this.scrollPages=[{top:0,path:location.href,title:document.title}],this.scrollPage=this.scrollPages[0],this.scrollHistoryHandler=this.onScrollHistory.bind(this),this.unloadHandler=this.onUnload.bind(this),this.scroller.addEventListener("scroll",this.scrollHistoryHandler),this.on("append",this.onAppendHistory),this.bindHistoryAppendEvents(!0)},n.bindHistoryAppendEvents=function(e){let i=e?"addEventListener":"removeEventListener";this.scroller[i]("scroll",this.scrollHistoryHandler),t[i]("pagehide",this.unloadHandler)},n.createHistoryPageLoad=function(){this.on("load",this.onPageLoadHistory)},e.destroy.history=n.destroyHistory=function(){this.options.history&&this.options.append&&this.bindHistoryAppendEvents(!1)},n.onAppendHistory=function(t,e,i){if(!i||!i.length)return;let n=i[0],s=this.getElementScrollY(n);o.href=e,this.scrollPages.push({top:s,path:o.href,title:t.title})},n.getElementScrollY=function(e){if(this.options.elementScroll)return e.offsetTop-this.top;return e.getBoundingClientRect().top+t.scrollY},n.onScrollHistory=function(){let t=this.getClosestScrollPage();t!=this.scrollPage&&(this.scrollPage=t,this.setHistory(t.title,t.path))},i.debounceMethod(e,"onScrollHistory",150),n.getClosestScrollPage=function(){let e,i;e=this.options.elementScroll?this.scroller.scrollTop+this.scroller.clientHeight/2:t.scrollY+this.windowHeight/2;for(let t of this.scrollPages){if(t.top>=e)break;i=t}return i},n.setHistory=function(t,e){let i=this.options.history;i&&history[i+"State"]&&(history[i+"State"](null,t,e),this.options.historyTitle&&(document.title=t),this.dispatchEvent("history",null,[t,e]))},n.onUnload=function(event){if(event&&event.persisted||0===this.scrollPage.top)return;let e=t.scrollY-this.scrollPage.top+this.top;this.destroyHistory(),scrollTo(0,e)},n.onPageLoadHistory=function(t,e){this.setHistory(t.title,e)},e})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("./core"),require("fizzy-ui-utils")):e(t,t.InfiniteScroll,t.fizzyUIUtils)}(window,(function(t,e,i){class n{constructor(t,e){this.element=t,this.infScroll=e,this.clickHandler=this.onClick.bind(this),this.element.addEventListener("click",this.clickHandler),e.on("request",this.disable.bind(this)),e.on("load",this.enable.bind(this)),e.on("error",this.hide.bind(this)),e.on("last",this.hide.bind(this))}onClick(t){t.preventDefault(),this.infScroll.loadNextPage()}enable(){this.element.removeAttribute("disabled")}disable(){this.element.disabled="disabled"}hide(){this.element.style.display="none"}destroy(){this.element.removeEventListener("click",this.clickHandler)}}return e.create.button=function(){let t=i.getQueryElement(this.options.button);t&&(this.button=new n(t,this))},e.destroy.button=function(){this.button&&this.button.destroy()},e.Button=n,e})),function(t,e){"object"==typeof module&&module.exports?module.exports=e(t,require("./core"),require("fizzy-ui-utils")):e(t,t.InfiniteScroll,t.fizzyUIUtils)}(window,(function(t,e,i){let n=e.prototype;function o(t){r(t,"none")}function s(t){r(t,"block")}function r(t,e){t&&(t.style.display=e)}return e.create.status=function(){let t=i.getQueryElement(this.options.status);t&&(this.statusElement=t,this.statusEventElements={request:t.querySelector(".infinite-scroll-request"),error:t.querySelector(".infinite-scroll-error"),last:t.querySelector(".infinite-scroll-last")},this.on("request",this.showRequestStatus),this.on("error",this.showErrorStatus),this.on("last",this.showLastStatus),this.bindHideStatus("on"))},n.bindHideStatus=function(t){let e=this.options.append?"append":"load";this[t](e,this.hideAllStatus)},n.showRequestStatus=function(){this.showStatus("request")},n.showErrorStatus=function(){this.showStatus("error")},n.showLastStatus=function(){this.showStatus("last"),this.bindHideStatus("off")},n.showStatus=function(t){s(this.statusElement),this.hideStatusEventElements(),s(this.statusEventElements[t])},n.hideAllStatus=function(){o(this.statusElement),this.hideStatusEventElements()},n.hideStatusEventElements=function(){for(let t in this.statusEventElements){o(this.statusEventElements[t])}},e})),

(function () {
    // The bundled history module above uses pagehide. Persisted pages keep their
    // appended items, scroll position and listeners for back/forward-cache restore.
    // A non-persisted departure retains InfiniteScroll's original normalization.
    // Patch 1: updateHistory → initialer Push
    InfiniteScroll.prototype.updateHistory = function (path, title) {
        try {
            const url = new URL(path, window.location.origin);
            url.searchParams.delete('quickViewItem');
            history.pushState({ path: url.href }, title || document.title, url.href);
        } catch (err) {
            // Fehler wird geschluckt, um die Konsole sauber zu halten
        }
    };

    // Patch 2: setHistory → Scroll-Verlauf beim Zurückscrollen
    const originalSetHistory = InfiniteScroll.prototype.setHistory;
    InfiniteScroll.prototype.setHistory = function (title, path) {
        try {
            const url = new URL(path, window.location.origin);
            url.searchParams.delete('quickViewItem');
            history.replaceState({ path: url.href }, title || document.title, url.href);
        } catch (err) {
            // Fehler wird geschluckt, um die Konsole sauber zu halten
        }
    };

    // Infinite Scroll Initialisierung
    if (!$('.pagination__next').length) return;
    $('.category-product-list').infiniteScroll({
        path: '.pagination__next',
        append: '.post',
        history: 'push',
        button: '.view-more-button',
        scrollThreshold: 1200,
        status: '.scroller-status'
    });

    // Lazyload nach Append
    $('.category-product-list').on('append.infiniteScroll', function (event, response, path, items) {
        const $newItems = $(items);
        const $newLazy = $newItems.find('.lozad');

        if ($newLazy.length) {
            eGuardians.events.observeLazyImages();
        } else {
            setTimeout(() => {
                eGuardians.events.observeLazyImages();
            }, 50);
        }
    });
})();


document.addEventListener('DOMContentLoaded', () => {
    const url = new URL(window.location.href);
    if (url.searchParams.has('quickViewItem')) {
        url.searchParams.delete('quickViewItem');
        history.replaceState(null, '', url.pathname + '?' + url.searchParams.toString());
        console.log('[Startup] quickViewItem entfernt');
    }
});

    
//Get the button:
mybutton = document.getElementById("totop");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 2000 || document.documentElement.scrollTop > 2000) {
    mybutton.style.display = "block";
  } else {
    mybutton.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
  document.body.scrollTop = 0; // For Safari
  document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}
// Gutschein/NL Pop-UP
O46Core.newsletter.call(window);

/**
 * BFCACHE-Handling auf Kategorie-Seiten
 *
 * Problem:
 * Wenn ein User von einem Artikel (oder einer anderen Seite) per "Zurück"-Button in die Kategorie zurücknavigiert,
 * kann der Browser (Safari, Chrome, Firefox etc.) die Seite aus dem Back-Forward-Cache (BFCache) laden.
 * In diesem Fall werden keine Skripte neu geladen oder ausgeführt – der DOM ist eingefroren.
 * Dadurch können Artikel fehlen, EventListener nicht mehr funktionieren und die Pagination kaputt sein.
 *
 * Lösung:
 * Wir fangen das `pageshow`-Event ab. Wenn `event.persisted == true` (BFCache), laden wir die Seite sofort neu.
 * Dadurch wird die Seite komplett neu aufgebaut: alle Artikel, Skripte und EventListener sind korrekt aktiv.
 */

function initBFCacheBypass() {
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            window.location.reload();
        }
    });
}

// Direkt ausführen
initBFCacheBypass();



// title and metadaten pages update
(function () {
    const pageTextByLang = {
        de: 'Seite',
        en: 'Page',
        fr: 'Page',
        it: 'Pagina',
        es: 'Página'
    };

    const currentLang = document.documentElement.lang?.substring(0, 2) || 'de';
    const pageText = pageTextByLang[currentLang] || 'Page';

    const initialUrl = new URL(window.location.href);
    let pagination;
    try {
        pagination = JSON.parse(document.querySelector('meta[name="o46-pagination"]')?.getAttribute('content') || 'null');
    } catch {
        // Without server confirmation, preserve the server-rendered metadata.
    }
    if (!pagination || typeof pagination !== 'object') return;
    if (pagination.valid === true && (!Number.isSafeInteger(pagination.pageMax)
        || !Number.isSafeInteger(pagination.currentPage))) return;

    const positiveInteger = value => typeof value === 'string' && /^[1-9][0-9]*$/.test(value)
        && Number.isSafeInteger(Number(value)) ? Number(value) : null;
    const requestedPage = url => {
        const values = url.searchParams.getAll('page');
        return values.length === 0 ? 1 : (values.length === 1 ? positiveInteger(values[0]) : null);
    };
    const listVariant = url => {
        const params = new URLSearchParams(url.search);
        // Infinite Scroll removes quickViewItem from its history URL.
        params.delete('page');
        params.delete('quickViewItem');
        params.sort();
        return url.origin + url.pathname + '?' + params.toString();
    };
    const initialVariant = listVariant(initialUrl);
    const initialPage = requestedPage(initialUrl);
    const appendedPages = new Set();
    // Only remove an actual server-generated suffix, keeping editorial en dashes.
    const serverSuffix = / – (?:Seite|Page|Pagina|Página) [1-9][0-9]*$/;
    const stripServerSuffix = value => pagination.valid === true && pagination.currentPage > 1
        ? value?.replace(serverSuffix, '') : value;
    const baseTitle = stripServerSuffix(document.title);
    const baseDescription = stripServerSuffix(document.querySelector('meta[name="description"]')?.getAttribute('content'));

    const updateMeta = () => {
        const url = new URL(window.location.href);
        // A different route/filter needs its own server render and bounds.
        if (listVariant(url) !== initialVariant) return;
        const requested = requestedPage(url);
        const confirmed = pagination.hasList === true && pagination.ambiguous === false
            && pagination.empty === false && Number.isSafeInteger(pagination.pageMax)
            && pagination.pageMax > 0 && requested !== null && (requested <= pagination.pageMax || appendedPages.has(requested))
            && (requested !== initialPage || pagination.valid === true);
        const page = confirmed ? requested : 1;

        const newTitle = page > 1 ? `${baseTitle} – ${pageText} ${page}` : baseTitle;
        const newDescription = baseDescription === undefined ? undefined
            : (page > 1 ? `${baseDescription} – ${pageText} ${page}` : baseDescription);

        document.title = newTitle;

        const descTag = document.querySelector('meta[name="description"]');
        if (descTag) descTag.setAttribute('content', newDescription);

        // Optional: OG und Twitter tags aktualisieren
        const updateMetaTag = (selector, content) => {
            const el = document.querySelector(selector);
            if (el) el.setAttribute('content', content);
        };

        updateMetaTag('meta[property="og:title"]', newTitle);
        if (newDescription !== undefined) updateMetaTag('meta[property="og:description"]', newDescription);
        updateMetaTag('meta[name="twitter:title"]', newTitle);
        if (newDescription !== undefined) updateMetaTag('meta[name="twitter:description"]', newDescription);
    };

    // Infinite Scroll oder History API → pushState, replaceState, popstate
    const observeNavigation = () => {
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        const triggerUpdate = () => setTimeout(updateMeta, 100);

        history.pushState = function () {
            originalPushState.apply(this, arguments);
            triggerUpdate();
        };

        history.replaceState = function () {
            originalReplaceState.apply(this, arguments);
            triggerUpdate();
        };

        window.addEventListener('popstate', triggerUpdate);
    };

    // A later response can prove a page beyond the initial total. Only remember
    // that exact page after its own list was actually appended on this route.
    window.jQuery?.('.category-product-list').on('append.infiniteScroll', (_event, response, path, items) => {
        if (!items?.length) return;
        const url = new URL(path, initialUrl);
        const page = requestedPage(url);
        if (page === null || page <= pagination.pageMax || listVariant(url) !== initialVariant) return;
        try {
            const state = JSON.parse(response.querySelector('meta[name="o46-pagination"]')?.content || 'null');
            if (state?.valid === true && state.currentPage === page) {
                appendedPages.add(page);
                updateMeta();
            }
        } catch { /* An unconfirmed response supplies no new pagination evidence. */ }
    });
    observeNavigation();
    updateMeta(); // falls die Seite mit ?page=2 direkt geladen wird
})();
O46Core.shopMode.call(window);
// Matrix-EAN-BESTAND Feature
O46Core.matrix.call(window);
