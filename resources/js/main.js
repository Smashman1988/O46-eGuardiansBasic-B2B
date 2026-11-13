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
        this.facetFilter = function(_this){
               
                //var queryUrl = $('[data-eg-facets]').data('eg-queryurl')
                var facetIdParams = "";
                $('[data-eg-facets] input:checked').each(function(index){
                    facetIdParams+=$(this).data('eg-facetvalueid') + ",";
                });
                facetIdParams = facetIdParams.slice(0,-1)
                
                var priceMin = isNaN($('.facet-input-price-min').val()) ? 0 : $('.facet-input-price-min').val();
                var priceMax = isNaN($('.facet-input-price-max').val()) ? 0 : $('.facet-input-price-max').val();
                if($(_this).hasClass('facet-remove-price')){
                    priceMin = 0;
                    priceMax = 0;
                    $('.facet-input-price-min').val('');
                    $('.facet-input-price-max').val('');
                }
                
                var searchParams = {
                    query: $("[data-eg-facets]").data('eg-searchstring'),
                    facets: facetIdParams,
                    priceMin: priceMin,
                    priceMax: priceMax,
                    categoryId: $('[data-eg-facets]').data('eg-catid')
                }
                $('[data-eg-btnfilter]').show().addClass('btn-load');
                $(_this).closest('.eg-dropdown-content').addClass('isLoading');
                if($('.forRemove').length>0){
                        $('.forRemove').remove()
                }
                eGuardians.apiservice.get('/rest/io/facet/', searchParams, function(response){
                    $('.ffix li').attr('data-eg-facet-itemcount', 0)
                    $('.ffix .chk-count').html(0);
                    $(response.data.facets).each(function(i, facetGroup){
                        $(facetGroup.values).each(function(i, facetValue){
                            $('#facet-item-'+facetValue.id).closest('li').attr('data-eg-facet-itemcount',facetValue.count)
                            $('#facet-item-'+facetValue.id).closest('li').find('.chk-count').html(facetValue.count); 
                        })
                    });
                  
                    $('[data-eg-btnfilter] span').html(response.data.itemList.total);
                    
                    
                    var facetUrl = "";
                    var urlParam = {};
                    var priceUrl = "";
                    if(priceMin>0 || priceMax>0){
                        urlParam["priceMin"] = priceMin;
                        urlParam["priceMax"] = priceMax;
                    }
                    if($('[data-eg-searchstring]').length>0){
                        urlParam["query"] = $("[data-eg-facets]").data('eg-searchstring');
                    }
                    if($('[data-eg-facets] input:checked').length>0){
                        urlParam["facets"] = facetIdParams;//encodeURIComponent(facetIdParams);
                    }
                    if($('.eg-dropdown-sort').data('eg-activesorting')!=$('.eg-dropdown-sort').data('eg-defaultsorting')){
                        urlParam["sorting"] = $('.eg-dropdown-sort').data('eg-activesorting');
                    }
                    var targetSearchUrl = ""
                    if($.param(urlParam)!=""){
                        targetSearchUrl = window.location.pathname+'?'+$.param(urlParam);
                    }else{
                        targetSearchUrl = window.location.pathname
                    }
                    $('[data-eg-btnfilter]').attr('onclick',"document.location.href='"+targetSearchUrl+"'");
                    $(_this).closest('.eg-dropdown-content').removeClass('isLoading');
                   
                    $('[data-eg-btnfilter]').removeClass('btn-load');
                    if($(_this).hasClass('pricefilter')){
                        document.location.href = targetSearchUrl;
                    }
                });
            
        }
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
        this.initLiveSearch = function(_this){
            $(document).on('click','.btn-search', function(){
                $('html').toggleClass('search-open');
                  setTimeout(function(){
                    $(".input-ff-search").focus();
                }, 100);
                
            });
            $(document).mouseup(function(e) 
            {
                var container = $("[data-eg-search]");
                if (!container.is(e.target) && container.has(e.target).length === 0) 
                {
                    if($(".row-search-wrap").length>0){
                        $(".row-search-wrap").hide();
                    }
                }
            });
            var currentFocus = -1;
            $(document).on('focus','[data-eg-livesearch]', function(){
                if($(".row-search-wrap").length>0){
                    $(".row-search-wrap").show();
                }
            });
            // Fokusverhalten bleibt gleich
            var currentFocus = -1;
            var useEnglishSearchIndex = activeLang === 'it' || activeLang === 'es';
            let searchInputVersion = 0;
            $(document).on('focus', '[data-eg-livesearch]', function () {
                if ($(".row-search-wrap").length > 0) {
                    $(".row-search-wrap").show();
                }
            });

            // debounce Funktion (einmal definiert, wiederverwendbar)
            function debounce(func, delay) {
                let timer;
                return function (...args) {
                    const context = this;
                    clearTimeout(timer);
                    timer = setTimeout(() => func.apply(context, args), delay);
                };
            }

            // Input-Handler (ausgelagert)
            function handleLiveSearchInput(event, inputVersion) {
                const $input = $(event.currentTarget);
                const query = $.trim($input.val());

                if (query.length > 3) {
                    $('[data-eg-search]').addClass('search-loading');
                    $('.related-search').hide();

                    const types = ["item", "category", "suggestion"];
                    const searchParams = {
                        template: "Ceres::ItemList.Components.ItemSearch",
                        query: query,
                        types: types,
                        templateType: "home"
                    };

                    const autocompleteUrl = useEnglishSearchIndex
                        ? '/rest/guardiansbasicb2b/item/search/autocomplete/'
                        : '/rest/io/item/search/autocomplete/';
                    eGuardians.apiservice.get(autocompleteUrl, searchParams, function (response) {
                        // Ignore responses for an older input, including A → B → A changes.
                        if (inputVersion !== searchInputVersion || query !== $.trim($input.val())) return;
                        renderAutocompleteResults(response, $input);
                    });

                } else {
                    $('.row-search-wrap').remove();
                    $('.related-search').show();
                    $('[data-eg-search]').removeClass('search-active-results search-loading');
                }
            }

            // Rendering-Funktion (ausgelagert für Performance & Klarheit)
            function renderAutocompleteResults(response, $input) {
                $('.row-search-wrap').remove();

                const $row = $("<div />").addClass('row row-search-wrap');
                const $left = $("<div />").addClass('col-12 col-md-7 item-suggestion');
                const $right = $("<div />").addClass('col-12 col-md-5 cat-suggestion');

                $right.append('<p class="h3" style="margin-top: 0.2rem;margin-bottom: 0.2rem;">' + messageServiceTranslations["searchexample"] + '</p>');
                const $ulSuggestion = $("<ul/>").addClass('list-autocomplete-suggestion list-no-style');

                let suggestionCount = 0;
                $(response.data.suggestion).each(function (key, suggestion) {
                    if (suggestionCount === 5) return false;
                    const label = String(suggestion?.label ?? '');
                    if (!label) return;

                    const $link = $('<a>').attr({
                        href: $input[0].form.action + '?query=' + encodeURIComponent(label),
                        title: label
                    });
                    $link.append(eGuardians.helper.autoCompleteReg($input, label));
                    $ulSuggestion.append($('<li>').append($link));
                    suggestionCount++;
                });
                $right.append($ulSuggestion);

                const $ulItem = $("<ul/>").addClass('list-autocomplete list-no-style');
                $(response.data.item).each(function (key, item) {
                    const label = String(item?.label ?? '');
                    if (!label) return;

                    const $link = $('<a>').attr({ href: item.url, title: label });
                    const $image = $('<img>').attr({ src: item.image || '', alt: label });
                    $link.append($('<span>').append($image), eGuardians.helper.autoCompleteReg($input, label));
                    $ulItem.append($('<li>').append($link));
                });
                $left.append($ulItem);

                $row.append($left).append($right);
                $input.closest('[data-eg-search], .searchbox-404').find('.search-wrap, [data-eg-search]').first().append($row).ready(function () {
                    console.log("APPEND READY");
                });

                $('[data-eg-search]').toggleClass('search-active-results', suggestionCount > 0 || $ulItem.children().length > 0);
                $('[data-eg-search]').removeClass('search-loading');
            }

            // Jetzt debounce aktivieren
            const loadSuggestions = debounce(handleLiveSearchInput, 400);
            $(_this).on('input', function (event) {
                currentFocus = -1;
                $(this).closest('[data-eg-search], .searchbox-404').find('.autocomplete-active').removeClass('autocomplete-active');
                loadSuggestions.call(this, event, ++searchInputVersion);
            });
            
            $(_this).keydown(function(e){
                var x = $(this).closest('[data-eg-search], .searchbox-404').find('.list-autocomplete li').get();
                if (e.keyCode == 40 || e.keyCode == 38) {
                    if (!x.length) return;
                    currentFocus += e.keyCode == 40 ? 1 : -1;
                    addAutocompleteItemActive(x);
                    $(this).val($(x[currentFocus]).find('a').attr('title'));
                } else if (e.keyCode == 13 && useEnglishSearchIndex && $(x).is('.autocomplete-active')) {
                    e.preventDefault();
                    $(x).filter('.autocomplete-active').find('a')[0].click();
                } else if (e.keyCode == 13 && !$(x).is('.autocomplete-active') && $.trim(this.value).length <= 2) {
                    e.preventDefault();
                }
                // Unselected Enter and DE/EN/FR retain their localized GET form behavior.
            });
            var addAutocompleteItemActive = function(x){
                    /*a function to classify an item as "active":*/
                if (!x) return false;
                /*start by removing the "active" class on all items:*/
                removeAutocompleteItemActive(x);
                if (currentFocus >= x.length) currentFocus = 0;
                if (currentFocus < 0) currentFocus = (x.length - 1);
                /*add class "autocomplete-active":*/
                x[currentFocus].classList.add("autocomplete-active");
                
     
                $('.list-autocomplete').scrollTop(0)
                $('.list-autocomplete').scrollTop($('.autocomplete-active').position().top - ($('.list-autocomplete').height()/2))
            }
            var removeAutocompleteItemActive = function(x) {
                /*a function to remove the "active" class from all autocomplete items:*/
                for (var i = 0; i < x.length; i++) {
                  x[i].classList.remove("autocomplete-active");
                }
            }
        }
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
O46Core.shopMode.call(window);
// Matrix-EAN-BESTAND Feature
O46Core.matrix.call(window);
