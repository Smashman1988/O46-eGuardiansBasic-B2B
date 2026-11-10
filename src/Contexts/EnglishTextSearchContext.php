<?php

namespace GuardiansBasicB2B\Contexts;

use Ceres\Contexts\CategoryContext;
use Ceres\Contexts\ItemListContext;
use Ceres\Helper\SearchOptions;
use GuardiansBasicB2B\Services\EnglishTextSearch;
use Plenty\Modules\ContentCache\CacheBlocks\Contracts\CacheTagRepositoryContract;

class EnglishTextSearchContext extends CategoryContext
{
    use ItemListContext;

    public $isSearch = true;
    public $searchString;

    public function init($params)
    {
        parent::init($params);
        // getParam reads the query sanitized by GlobalContext.
        $this->searchString = $this->getParam('query', '');
        $options = SearchOptions::validateItemListOptions([
            'query' => $this->searchString,
            'facets' => $this->getParam('facets', ''),
            'sorting' => $this->getParam('sorting', ''),
            'page' => $this->getParam('page', 1),
            'itemsPerPage' => $this->getParam('itemsPerPage', ''),
            'priceMin' => $this->request->get('priceMin', 0),
            'priceMax' => $this->request->get('priceMax', 0),
            'searchOperator' => $this->webstoreConfig->itemSearchOperator
        ], SearchOptions::SCOPE_SEARCH);

        $result = pluginApp(CacheTagRepositoryContract::class)->makeTaggable(
            'itemList',
            function () use ($options) {
                return pluginApp(EnglishTextSearch::class)->getPage($options);
            },
            'item'
        );

        $this->currentPage = (int)$options['page'];
        $this->itemsPerPage = (int)$options['itemsPerPage'];
        $this->itemSorting = $options['sorting'];
        $this->query = ['items' => $this->itemsPerPage, 'sorting' => $this->itemSorting];
        $this->searchOptions = SearchOptions::get(SearchOptions::SCOPE_SEARCH);
        $this->itemList = $result['itemList']['documents'];
        $this->facets = $result['facets'];
        $this->suggestionString = $result['suggestionString'] ?? null;
        $this->itemCountTotal = min(10000, (int)$result['itemList']['total']);
        $this->itemCountPage = count($this->itemList);
        $this->pageMax = $this->itemsPerPage > 0 ? ceil($this->itemCountTotal / $this->itemsPerPage) : 1;
    }
}
