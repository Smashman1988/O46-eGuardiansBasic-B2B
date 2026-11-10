<?php

namespace GuardiansBasicB2B\Services;

use Ceres\Helper\SearchOptions;
use IO\Services\ItemSearchAutocompleteService;
use Plenty\Modules\Webshop\Contracts\WebstoreConfigurationRepositoryContract;

class SearchAutocompleteService extends ItemSearchAutocompleteService
{
    public function getResults($searchString, $searchTypes)
    {
        if (!EnglishTextSearch::applies()) {
            return parent::getResults($searchString, $searchTypes);
        }
        $config = pluginApp(WebstoreConfigurationRepositoryContract::class)->getWebstoreConfiguration();
        $options = SearchOptions::validateItemListOptions([
            'query' => $searchString,
            'page' => 1,
            'itemsPerPage' => 20,
            'sorting' => '',
            'facets' => '',
            'priceMin' => 0,
            'priceMax' => 0,
            'searchOperator' => $config->itemAutocompleteSearchOperator
        ], SearchOptions::SCOPE_SEARCH);
        return pluginApp(EnglishTextSearch::class)->getAutocomplete($options, $searchTypes);
    }
}
