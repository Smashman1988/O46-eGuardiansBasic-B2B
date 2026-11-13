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
       
        this.watchListTrigger = function(_this){
            var variationId = $(_this).parents('[data-item]').data('eg-active-variation');
            ///rest/io/itemWishList/5903
            eGuardians.helper.btnShowLoader(_this);
            var countWish = parseInt($('.wishlist-count').html());
            var countWishNew = 0;
            if(!$(_this).hasClass('item-in-wishlist')){
                eGuardians.item.watchList.add(variationId,function(response){
                    
                    $(_this).addClass('item-in-wishlist');
                    eGuardians.ui.message.success.show({
                        'message'        : messageServiceTranslations["wishlistplus"],
                        'insertElement'  : '.item-actions-wrap',
                        'closeTimer'     : 2500
                    });
                    eGuardians.helper.btnHideLoader(_this);
                    countWishNew = countWish+1;
                    $('.wishlist-count').html(countWishNew);
                    if(countWishNew<=0){
                        $('.wishlist-link').addClass('noWishListItems');
                    }else{
                        $('.wishlist-link').removeClass('noWishListItems');
                    }
                }); 
               
            }else{
                eGuardians.item.watchList.remove(variationId,function(){
                    $(_this).removeClass('item-in-wishlist');
                    eGuardians.ui.message.success.show({
                        'message'        : messageServiceTranslations["wishlistminus"],
                        'insertElement'  : '.item-actions-wrap',
                        'closeTimer'     : 1500
                    });
                    eGuardians.helper.btnHideLoader(_this);
                    countWishNew = countWish-1;
                    $('.wishlist-count').html(countWishNew);
                    if(countWishNew<=0){
                        $('.wishlist-link').addClass('noWishListItems');
                    }else{
                        $('.wishlist-link').removeClass('noWishListItems');
                    }
                }); 
                
            }
            
            
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
(function () {
    eGuardians.item = new function () {
        this.variations = new function (){
      
            var attributeList;// = $('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
           
            //var itemVariations;// = $('[data-item-variation]').data('eg-variations');//$(attributeList).data('eg-variations'), pressedActiveParent;
            var variations = this;

            this.init = function(mainContainer){
                attributeList = $(mainContainer).find('[data-eg-attributes]');//.sort(eGuardians.helper.sort_li);
                //itemVariations = $(mainContainer).data('eg-variations');
                var itemVariations = $(mainContainer).data('eg-variations');
                variations = this;
                $(attributeList).each(function(){
                    //var variationForObject = [];
                   // var _this = this;
                    var attributeId = $(this).data('eg-attributes');
                    var indexOfAttribute = 0;//DELETE NEED? $(this).data('eg-index');

                    $(this).find('[data-eg-value]').each(function(){
                        var attributesFormat = {'attributeId':attributeId,'attributeValueId':$(this).data('eg-value')};  
                     
                        if(typeof this.variation == "undefined"){
                             this.variation = [];
                        }
        
                        /* Set Variations Data Attribute with infos to Element */
                        $(this).data('variation',variations.findVariation(attributesFormat,indexOfAttribute,mainContainer));
                    });
                });
                /** Bind Events **/


                /*if($('.modal-cross').hasClass('show')){
                    $(mainContainer).on('touchend click','.modal-cross [data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute);
                }else{
                     
                }*/
                $(mainContainer).on('touchend click','[data-eg-attributes]:not(select) [data-eg-value]:not([data-selected]):not([data-novariations])', selectAttribute); 
            };
            var selectAttribute = function(attributes, searchIndex){
                if($(this).find("img").length>0){
                    var imgUrlNewPrev = $(this).find("img").attr('src').replace('/preview/','/preview/')
                    var imgUrlNewMiddle = $(this).find("img").attr('src').replace('/preview/','/middle/');
                    var imgUrlNewBig = $(this).find("img").attr('src').replace('/preview/','/full/')
                    //$('.single-prev-images img[src="'+imgUrlNew+'"]');
                    if($('.single-prev-images img[src="'+imgUrlNewPrev+'"]').length>0){
                        MagicZoom.update('ItemImgZoom', imgUrlNewBig, imgUrlNewMiddle);
                    }
                }
                $(this).closest('.attribute-box').removeClass('errorVariationSelect');
                pressedActiveParent = $(this).parents('[data-eg-attributes]');
                //pressedActiveParent = $(this).parents('[data-item-variation]');
                $(this).parents('[data-eg-attributes]').find('[data-eg-value]').removeAttr('data-selected');
                $(this).attr('data-selected','');
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                variations.setVarition(this);
                
                /*
                
                console.log($(pressedActiveParent));
                $(pressedActiveParent).parents('[data-item-variation-select]').find('[data-eg-selected-attribute]').html($(this).data('eg-attrname'));
                $(this).attr('data-selected','');
                variations.setVarition(this);*/
                //$(pressedActiveParent).hide();
            };         
            /**
             * 
             * @param {type} attributes
             * @param {type} searchIndex
             * @returns {unresolved}
             */
            this.findVariation = function(attributes, searchIndex,_this){
                var foundedVariation = null;
                var selectedVariation = [];
                var itemVariations = $(_this).data('eg-variations');
                $(itemVariations).each(function(key, valVariation){
                        foundedVariation = valVariation.attributes.filter(function (el) { 
                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); 
                        /*if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                        }
                        var reverseAttr = valVariation.attributes.reverse();
                        foundedVariation = reverseAttr.filter(function (el) { 

                            if(JSON.stringify(attributes) === JSON.stringify(el)){
                                return valVariation;
                            } 
                        }); */
                        
                        if(foundedVariation!=null&&foundedVariation.length>0){
                            selectedVariation.push(valVariation);
                            //return false; 
                        }
                    //})
                });
                return selectedVariation;
            };
            this.getVariation = function(attributes,_this){
           
                /*var selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                 Wenn keine Variante gefunden wurde dann drehe array und prüfe erneut 
                if(selectedVariation.length==0){
                    attributes = attributes.reverse();
                    selectedVariation = itemVariations.filter(function (el) { return JSON.stringify(attributes) === JSON.stringify(el.attributes) }); 
                }*/
                var selectedVariation = null;
                var foundLength = 0;
                var hasLength = attributes.length;
                var itemVariations = $(_this).closest('[data-item-variation]').data('eg-variations');
                console.log(_this)
                $(itemVariations).each(function(key, variationVal){
                    foundLength = 0;
                    $(variationVal.attributes).each(function(key, attrVal){
                        $(attributes).each(function(key, selectAttrVal){
                            if(JSON.stringify(selectAttrVal) === JSON.stringify(attrVal)){
                                foundLength++;
                            }
                        })
                        
                    });
                    if(foundLength==hasLength){
                        selectedVariation = variationVal;
                        return true;
                    }
                    
                });
   
                return selectedVariation;
            };
            this.setVarition = function(_this){
                var attributesFormat = [];
                var activeAttributeBox = null;
                $itemElement = $(_this).parents('[data-item]');
                attributeList = $itemElement.find('[data-eg-attributes]');
                
               
                $(attributeList).each(function(){
                    
                    var selectedAttributeValue = 0; 

                    if($("option:selected", this).length>0){
                        /* if element is select box */
                        selectedAttributeValue = $("option:selected", this).val();
                    }else{
                        /* custom elements */
                        selectedAttributeValue = $(this).find('[data-selected]').data('eg-value');
                    }
                    if($(this).attr('data-eg-attributes')) {   
                        /* custom elements */
                        activeAttributeBox = $(this).data('eg-attributes'); 
                        
                    }else{
                       /* if element is select box */
                        activeAttributeBox = $(_this).parentsUntil(attributeList).data('eg-attribute'); 
                    }
                    attributesFormat.push({'attributeId':activeAttributeBox,'attributeValueId':parseInt(selectedAttributeValue)});                             
                });

                //checkVariation(attributesFormat);
                this.findInactiveAttributes(_this);

                var activeVariation = this.getVariation(attributesFormat,_this);
       
                if(activeVariation != null){
                    $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').tooltip('dispose');
                 
                    /* Get active VariationId and store to variation */
                    $(_this).parents('[data-item]').find('[data-item-variation]').data().activeVariationId = activeVariation.variationId;
                    $(_this).parents('[data-item]').attr('data-eg-active-variation',activeVariation.variationId);
                    /*$.get("/rest/io/variations/" + activeVariation[0].variationId+'?template='+encodeURI('Ceres::Item.SingleItem'), function(response) {
                        var responseData = JSON.parse(response).data;
                        console.log("data");
                        //console.log(getImages(responseData.documents[0].data.images));
                    });*/
                    var searchParams = {
                        template: encodeURI('Ceres::Item.SingleItem')
                    }
                    $('[data-eg-loading-attr]').addClass('isLoading');
                    eGuardians.apiservice.get('/rest/io/variations/' + activeVariation.variationId, searchParams, function(response){    
                      
                        var variationData = response.data.documents[0].data;
                        if(variationData.stock.net<7 && variationData.stock.net>0){
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn1"]+' '+variationData.stock.net+' '+messageServiceTranslations["stockWarn2"])
                        }else{
                            $('.data-stock-warn').html(messageServiceTranslations["stockWarn3"])
                        }
                        if(variationData.images.variation.length>0){
                            var prevImagesHtml = '';
                            //MagicZoom.update('ItemImgZoom',  variationData.images.variation[0].url,  variationData.images.variation[0].urlMiddle);
                            var sortImages = variationData.images.variation.sort(function(a, b) {
                                return a.position - b.position;
                            });
                            
                            var zoomid = "ItemImgZoom";
                            var prevImg = ".single-prev-images";
                            if($('.modal-cross').hasClass('show')){
                                //MagicZoom.update('ItemImgZoom2',  variationData.images.variation[0].url,  variationData.images.variation[0].urlMiddle);
                                zoomid = "ItemImgZoom2";
                                prevImg = ".modal-cross .single-prev-images";
                            }
                            MagicZoom.stop(zoomid);
                            
                            $('#'+zoomid).attr('href', sortImages[0].url);
                            $('#'+zoomid+' img').attr('src', sortImages[0].urlMiddle)


                            $(sortImages).each(function(tests, value){
                                prevImagesHtml = '<a href="'+value["url"]+'" rel="zoom-id:'+zoomid+'" data-image="'+value["urlMiddle"]+'" title="">';
                                prevImagesHtml += '<img src="'+value["urlPreview"]+'" alt="" />';
                                prevImagesHtml += '</a>';
                            });
                            setTimeout(function(){
                                 MagicZoom.start(zoomid);
                            }, 50);
                        }
                        const pricenumber = variationData.prices.default.unitPrice.value;
                        const uvpnumber = variationData.prices.rrp.unitPrice.value;

                        $itemElement.find('[data-eg-item-price]').html(
                            new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(pricenumber)
                        );

                        if(variationData.prices.rrp != null){
                            $itemElement.find('[data-eg-item-rrp]').html(
                                new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(uvpnumber)
                            );
                            var rrppercent = (1 - variationData.prices.default.unitPrice.value / variationData.prices.rrp.unitPrice.value ) * -100;
                            $itemElement.find('[data-eg-item-rrp-percent]').html(Math.round(rrppercent).toFixed(0));
                            var rrpspar = ( variationData.prices.rrp.unitPrice.value - variationData.prices.default.unitPrice.value );
                            $itemElement.find('[data-eg-item-rrp-spar]').html(
                                new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rrpspar)
                            );
                        }

                        
                        
                        
                        $itemElement.find('[data-eg-item-nr]').html(variationData.variation.number);
                        
                        $itemElement.find('[data-eg-item-availbility]').html(variationData.variation.availability.names.name).attr('data-availibilityid',variationData.variation.availability.id);
                        if(variationData.variation.availability.id>=7){
                            
                            $itemElement.find('[data-item-tobasket]').attr('title','Der Artikel ist momentan leider vergriffen');
                            $itemElement.find('[data-item-tobasket]').tooltip();
                            $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                        }else{
                           $itemElement.find('[data-item-tobasket]').removeClass('inBasketBtnDisabled')
                        }
                        var event = document.createEvent("Event");
                        event.initEvent("submit", false, true); 
                        document.dispatchEvent(event,response);
                        //document.dispatchEvent(new CustomEvent("variationChanged",response));
                        $('[data-eg-loading-attr]').removeClass('isLoading');
                        
                        if(variationData.prices.graduatedPrices.length>0){
                            $('.table-gruaded-head').html('');
                            $('.table-gruaded-content').html('');
                            $(variationData.prices.graduatedPrices.reverse()).each(function(i,gruadedData){
                                
                                if(gruadedData.minimumOrderQuantity>1){
                                    $('.table-gruaded-head').append('<div class="table-cell table-head">ab <span>'+gruadedData.minimumOrderQuantity+'</span></div>');
                                    $('.table-gruaded-content').append('<div class="table-cell table-content"> <span class="bold">'+gruadedData.price.formatted+'</span></div>');
                                    /*$('.table-head[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.minimumOrderQuantity);
                                    $('.table-content[data-gruadetquantity="'+gruadedData.minimumOrderQuantity+'"] > span').html(gruadedData.price.formatted);*/
                                }
                            })
                        }
                        
                    });
                }else{
                    $itemElement.find('[data-item-tobasket]').addClass('inBasketBtnDisabled');
                    $itemElement.find('[data-item-tobasket]').attr('title','Diese Variante ist leider nicht mehr verfügbar.');
                    //$('[data-item-tobasket]').attr('data-toggle','tooltip');
                    $itemElement.find('[data-item-tobasket]').tooltip();
                }
            };
            this.findInactiveAttributes = function(activeElement){
                /* 
                 * Wählt man ein Attribute finde andere Attribute die nicht zu dem Attribut gehören 
                 * pressedActiveParent ist das Element was gerade angeklickt wurde
                 */
                $itemElement = $(activeElement).parents('[data-item]');
                $itemElement.find('[data-eg-value]').removeClass('disabled');
                var selectedAttributeData = $("[data-selected]", pressedActiveParent).data();
                $itemElement.find('[data-eg-value]').each(function(){
                   
                    if(!$(this).parents('[data-eg-attributes]').is(pressedActiveParent)){
                        var foundaAttribute = false;
                        if($(this).data().variation!=null){
                            $($(this).data().variation).each(function(varKey,varVal){
                                 $(varVal.attributes).each(function(key, attributeValue){
                                    if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                        foundaAttribute = true;
                                    }
                                });
                                if(!foundaAttribute){
                                    $(varVal.attributes.reverse()).each(function(key, attributeValue){
                                        if(attributeValue.attributeValueId==selectedAttributeData.egValue){
                                            foundaAttribute = true;
                                        }
                                    });
                                }
                            });
                        }
                        if(!foundaAttribute){
                            $(this).addClass('disabled');
                        }
                    }
                });
            };
        };
        this.images = {
            getImages: function(images){
                return images.variation.length>0 ? images.variation : images.all;
            }
        };
        this.quantity = {
            change: function(images){
                return images.variation.length>0 ? images.variation : images.all;
            }
        };
        this.watchList = {
            add: function(variationId, callback){
                 var searchParams = {
                    variationId: variationId,
                    templateEvent: "tpl.item"
                }
                eGuardians.apiservice.post('/rest/io/itemWishList/', searchParams, function(response){
                    if(typeof callback === 'function') {
                        callback(response);
                    }
                });
            },
            remove: function(variationId, callback){
                 var searchParams = {
                    variationId: variationId,
                    templateEvent: "tpl.item"
                }
                eGuardians.apiservice.delete('/rest/io/itemWishList/'+variationId, searchParams, function(response){
                    if(typeof callback === 'function') {
                        callback(response);
                    }
                });
            }
        };
    };
})(eGuardians);
/**
 * @module UI
 */
O46Core.ui.call(window, 10000);
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
$(document).on('click', '.wish-list-remove', function(event){   
    if((window.ceresStore.getters.wishListCount-1)<=0){
        $('.wishlist-link').addClass('noWishListItems');
    }else{
       $('.wishlist-link .wishlist-count').html((window.ceresStore.getters.wishListCount-1)) 
    }
});

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

$(document).on('click', '.zoom-nav-list > button', function(event){  
    event.stopPropagation();
    event.preventDefault();             
    if(event.handled !== true) {
        if($('.modal-cross').hasClass('show')){
            MagicZoom.switchTo('ItemImgZoom2',$(this).index())
        }else{
            MagicZoom.switchTo('ItemImgZoom',$(this).index()) 
        }
        event.handled = true;
    } else {
        return false;
    }
});
$(document).on( "click", ".zoomnavleft",function(){
    if($('.modal-cross').hasClass('show')){
        MagicZoom.prev('ItemImgZoom2');
    }else{
        MagicZoom.prev('ItemImgZoom');
    }
    setTimeout(function(){ 
        var stepIndex = $('.mz-thumb-selected').data('stepindex');
        console.log(stepIndex)
        /*if($('.mz-thumb-selected').prev().length<=0){
            stepIndex = $('.single-prev-img .slick-slide:last-child').data('stepindex');
        }*/
    }, 200);
});


var timoutZoomSlider;
$(document).on( "click", ".zoomnavright",function(){
    if($('.modal-cross').hasClass('show')){
        MagicZoom.next('ItemImgZoom2');
    }else{
        MagicZoom.next('ItemImgZoom');
    }
    setTimeout(function(){ 
        var stepIndex = $('.mz-thumb-selected').next().data('stepindex');
        if($('.mz-thumb-selected').next().length<=0){
            stepIndex = $('.single-prev-images').data('stepindex');
        }
        if(stepIndex<0){
            stepIndex = 0;
        }
    }, 200);

});
function setActivePoint(){
    $('.zoom-nav-list').html('')
    $('.single-prev-images').each(function(i){
        if(i==$('.mz-thumb-selected').index()){
            $('.zoom-nav-list').append('<button class="activePoint" aria-label="Slider Pagination" />');
        }
        else{
            $('.zoom-nav-list').append('<button />');
        }
    });
} 
var mzOptions = {};
var zoomCounter = 1;//parseInt($(".single-prev-images .slick-active:first").index());
mzOptions.onZoomReady = function(zoomparams) { 
    setActivePoint();

};

mzOptions.onUpdate = function(zoomparams) { 
    setActivePoint();     
};


$(document).on('click', '.slideToRating, .item-ratings-top', function(event){    
    $('html, body').animate({
        scrollTop: $('.feedback-container').offset().top-$('.main-header').height()
    },500);
    return false;
});


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
    return O46Core.openQuickview(this, 50);
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

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("activesi");
    var content = this.nextElementSibling;
    if (content.style.maxHeight){
      content.style.maxHeight = null;
    } else {
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
}
// Gutschein/NL Pop-UP
O46Core.newsletter.call(window);
O46Core.shopMode.call(window);
// Matrix-EAN-BESTAND Feature
O46Core.matrix.call(window);
