/* One shared autocomplete implementation; existing routes and response ordering retained. */
O46Core.initLiveSearch = O46Core.initLiveSearch || function(_this){
    // Each input keeps its own debounce/selection state; rebinding a
    // refreshed fragment must not duplicate document-wide listeners.
    if (!_this || _this._egLiveSearchBound) return;
    _this._egLiveSearchBound = true;
    if (!eGuardians.events._liveSearchGlobalsBound) {
        eGuardians.events._liveSearchGlobalsBound = true;
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
        $(document).on('focus', '[data-eg-livesearch]', function () {
            if ($(".row-search-wrap").length > 0) $(".row-search-wrap").show();
        });
    }
    // Fokusverhalten bleibt gleich
    var currentFocus = -1;
    var useEnglishSearchIndex = activeLang === 'it' || activeLang === 'es';
    let searchInputVersion = 0;

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
        $input.closest('[data-eg-search], .searchbox-404').find('.search-wrap, [data-eg-search]').first().append($row);

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
};
