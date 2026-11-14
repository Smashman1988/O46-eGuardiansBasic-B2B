<?php

namespace GuardiansBasicB2B\Services;

use IO\Services\ItemSearchAutocompleteService;
use Plenty\Modules\Webshop\Contracts\LocalizationRepositoryContract;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\Facets;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\SearchItems;
use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;

class EnglishTextSearch
{
    public static function applies(): bool
    {
        $language = pluginApp(LocalizationRepositoryContract::class)->getLanguage();
        return $language === 'it' || $language === 'es';
    }

    private function applyText($factory, array $options)
    {
        if ($options['query'] !== '') {
            $factory->hasSearchString($options['query'], 'en', (string)($options['searchOperator'] ?? ''));
        }
        return $factory;
    }

    private function storefrontItems(array $options)
    {
        // Let Plenty assemble all storefront restrictions, grouping and localized
        // result fields. Supply the actual text only once, in the selected index.
        $options['query'] = '';
        return SearchItems::getSearchFactory($options);
    }

    private function listResults(array $options, bool $countsOnly = false)
    {
        $items = $this->applyText($this->storefrontItems($options), $options);
        if ($options['query'] !== '') {
            $items->withDidYouMeanSuggestions($options['query']);
        }
        if ($countsOnly) {
            // Apply after Ceres validation/preset creation: validation replaces
            // a zero page size with the configured storefront default.
            $items->setPage(1, 0);
        }

        $facetOptions = $options;
        unset($facetOptions['query'], $facetOptions['priceMin'], $facetOptions['priceMax']);
        $facets = Facets::getSearchFactory($facetOptions);
        $this->applyText($facets, $options);
        if ((float)$options['priceMin'] > 0 || (float)$options['priceMax'] > 0) {
            $facets->hasPriceInRange((float)$options['priceMin'], (float)$options['priceMax']);
        }

        return pluginApp(ItemSearchService::class)->getResults(['itemList' => $items, 'facets' => $facets]);
    }

    public function getPage(array $options, bool $countsOnly = false): array
    {
        $result = $this->listResults($options, $countsOnly);
        if ((int)$result['itemList']['total'] === 0 && !empty($result['itemList']['suggestions']['didYouMean'])) {
            $corrected = pluginApp(ItemSearchAutocompleteService::class)->getDidYouMeanSuggestionSearchString(
                $options['query'], $result['itemList']['suggestions']
            );
            if ($corrected !== '' && $corrected !== $options['query']) {
                $options['query'] = $corrected;
                $result = $this->listResults($options, $countsOnly);
                $result['suggestionString'] = $corrected;
            }
        }
        return $result;
    }

    public function getAutocomplete(array $options, array $types): array
    {
        // Select IO's autocomplete image pipeline before the preset is assembled.
        // Replacing list result fields afterwards leaves incompatible image mutators active.
        $itemOptions = $options;
        $itemOptions['autocomplete'] = true;
        $items = $this->applyText($this->storefrontItems($itemOptions), $options)->withDefaultImage();
        if (in_array('category', $types)) {
            $items->withCategories();
        }
        $factories = ['items' => $items];
        if (in_array('suggestion', $types)) {
            // Prefixes can have text completions even when the product query has no hits.
            $factories['suggestions'] = $this->storefrontItems($options)
                ->setPage(1, 0)
                ->withSuggestions($options['query'], 'en');
        }
        $results = pluginApp(ItemSearchService::class)->getResults($factories);
        $results['items']['categories.all'] = $results['items']['categories.all'] ?? [];
        $results['suggestions']['searchSuggestions'] = $results['suggestions']['searchSuggestions'] ?? [];
        return $results;
    }
}
