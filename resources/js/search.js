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
                $(".row-search-wrap").hide();
                $('[data-eg-livesearch]').attr('aria-expanded', 'false');
            }
        });
        $(document).on('focus', '[data-eg-livesearch]', function () {
            $(".row-search-wrap").show();
            $('[data-eg-livesearch][aria-controls]').attr('aria-expanded', 'true');
        });
    }
    // Fokusverhalten bleibt gleich
    var currentFocus = -1;
    var useEnglishSearchIndex = activeLang === 'it' || activeLang === 'es';
    const $input = $(_this);
    const listId = 'eg-autocomplete-' + (eGuardians.events._liveSearchId = (eGuardians.events._liveSearchId || 0) + 1);
    $input.attr({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false' });
    const autocompleteUrl = useEnglishSearchIndex
        ? '/rest/guardiansbasicb2b/item/search/autocomplete/'
        : '/rest/io/item/search/autocomplete/';
    let searchInputVersion = 0;
    let searchTimer;
    let searchPending = false;

    // Input-Handler (ausgelagert)
    function handleLiveSearchInput(inputVersion) {
        const query = $.trim($input.val());

        if (query.length > 3) {
            searchPending = true;
            $('[data-eg-search]').addClass('search-loading');
            $('.related-search').hide();

            // Only our IT/ES adapter guarantees categories.all without aggregation.
            const types = useEnglishSearchIndex ? ["item", "suggestion"] : ["item", "category", "suggestion"];
            const searchParams = {
                template: "Ceres::ItemList.Components.ItemSearch",
                query: query,
                types: types,
                templateType: "home"
            };

            eGuardians.apiservice.get(autocompleteUrl, searchParams, function (response, status) {
                // Ignore responses for an older input, including A → B → A changes.
                if (inputVersion !== searchInputVersion || query !== $.trim($input.val())) return;
                searchPending = false;
                if ((status != null && (status < 200 || status >= 300)) ||
                    (!Array.isArray(response?.data?.suggestion) && !Array.isArray(response?.data?.item))) {
                    clearAutocompleteResults();
                    return;
                }
                renderAutocompleteResults(response, $input);
            });

        } else {
            clearAutocompleteResults();
        }
    }

    function removeAutocompleteResults($scope) {
        $scope.find('.row-search-wrap').remove();
        $scope.find('[data-eg-livesearch]').attr('aria-expanded', 'false')
            .removeAttr('aria-controls aria-activedescendant');
    }

    function clearAutocompleteResults($scope = $(document)) {
        searchPending = false;
        removeAutocompleteResults($scope);
        // Existing loading/layout classes are shared by header and 404 search.
        // Do not reset them when another input still owns the visible popup.
        if (!$('.row-search-wrap').length) {
            $('.related-search').show();
            $('[data-eg-search]').removeClass('search-active-results search-loading');
        }
    }

    // Rendering-Funktion (ausgelagert für Performance & Klarheit)
    function renderAutocompleteResults(response, $input) {
        removeAutocompleteResults($(document));
        currentFocus = -1;
        // Prepare on the first displayed label only, shared within this response.
        const highlighting = {};

        const $row = $("<div />").addClass('row row-search-wrap').attr({ id: listId, role: 'listbox' });
        const $left = $("<div />").addClass('col-12 col-md-7 item-suggestion');
        const $right = $("<div />").addClass('col-12 col-md-5 cat-suggestion');

        $right.append('<p class="h3" style="margin-top: 0.2rem;margin-bottom: 0.2rem;">' + messageServiceTranslations["searchexample"] + '</p>');
        const $ulSuggestion = $("<ul/>").addClass('list-autocomplete-suggestion list-no-style').attr('role', 'group');

        let suggestionCount = 0;
        let suggestionUrl;
        // Iterate API arrays directly; retain the existing non-array fallback.
        $.each(Array.isArray(response.data.suggestion) ? response.data.suggestion : $(response.data.suggestion), function (key, suggestion) {
            if (suggestionCount === 5) return false;
            const label = String(suggestion?.label ?? '');
            if (!label) return;
            if (suggestionCount === 0) suggestionUrl = $input[0].form.action + '?query=';

            const $link = $('<a>').attr({
                href: suggestionUrl + encodeURIComponent(label),
                title: label
            });
            $link.append(eGuardians.helper.autoCompleteReg($input, label, highlighting));
            $ulSuggestion.append($('<li>').attr({ role: 'option', 'aria-selected': 'false' }).append($link));
            suggestionCount++;
        });
        $right.append($ulSuggestion);

        const $ulItem = $("<ul/>").addClass('list-autocomplete list-no-style').attr('role', 'group');
        $.each(Array.isArray(response.data.item) ? response.data.item : $(response.data.item), function (key, item) {
            const label = String(item?.label ?? '');
            if (!label) return;

            const $link = $('<a>').attr({ href: item.url, title: label });
            const $image = $('<img>').attr({ src: item.image || '', alt: label });
            $link.append($('<span>').append($image), eGuardians.helper.autoCompleteReg($input, label, highlighting));
            $ulItem.append($('<li>').attr({
                id: listId + '-' + $ulItem[0].childElementCount,
                role: 'option', 'aria-selected': 'false'
            }).append($link));
        });
        $left.append($ulItem);

        $row.append($left).append($right);
        $input.closest('[data-eg-search], .searchbox-404').find('.search-wrap, [data-eg-search]').first().append($row);
        if (suggestionCount > 0 || $ulItem[0].childElementCount > 0) {
            $input.attr({ 'aria-controls': listId, 'aria-expanded': 'true' });
        }

        $('[data-eg-search]').toggleClass('search-active-results', suggestionCount > 0 || $ulItem[0].childElementCount > 0)
            .removeClass('search-loading');
    }

    // Keep 400 ms and invalidate older responses immediately, before debounce.
    $input.on('input', function () {
        currentFocus = -1;
        $input.removeAttr('aria-activedescendant');
        $input.closest('[data-eg-search], .searchbox-404').find('.autocomplete-active')
            .removeClass('autocomplete-active').attr('aria-selected', 'false');
        clearTimeout(searchTimer);
        const inputVersion = ++searchInputVersion;
        searchTimer = setTimeout(function () { handleLiveSearchInput(inputVersion); }, 400);
    });

    $input.keydown(function(e){
        if (e.key === 'Escape' || e.keyCode === 27) {
            // Cancel debounce and invalidate in-flight replies, even for the same text.
            // Keep the event available to modal/Quickview handlers outside this input.
            clearTimeout(searchTimer);
            ++searchInputVersion;
            currentFocus = -1;
            const $scope = $input.closest('[data-eg-search], .searchbox-404');
            if (searchPending || $scope.find('.row-search-wrap').length) clearAutocompleteResults($scope);
            return;
        }
        if (e.keyCode != 40 && e.keyCode != 38 && e.keyCode != 13) return;
        var x = $input.closest('[data-eg-search], .searchbox-404').find('.list-autocomplete li');
        if (e.keyCode == 40 || e.keyCode == 38) {
            if (!x.length) return;
            currentFocus += e.keyCode == 40 ? 1 : -1;
            addAutocompleteItemActive(x);
            $input.val($(x[currentFocus]).find('a').attr('title'));
        } else if (e.keyCode == 13 && useEnglishSearchIndex && x.is('.autocomplete-active')) {
            e.preventDefault();
            x.filter('.autocomplete-active').find('a')[0].click();
        } else if (e.keyCode == 13 && !x.is('.autocomplete-active') && $.trim(this.value).length <= 2) {
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
        x[currentFocus].setAttribute('aria-selected', 'true');
        $input.attr('aria-activedescendant', x[currentFocus].id);

        const $lists = $('.list-autocomplete');
        $lists.scrollTop(0);
        $lists.scrollTop($('.autocomplete-active').position().top - ($lists.height()/2));
    }
    var removeAutocompleteItemActive = function(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
          x[i].classList.remove("autocomplete-active");
          x[i].setAttribute('aria-selected', 'false');
        }
    }
};
