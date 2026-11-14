<?php

namespace GuardiansBasicB2B\Extensions;

use Plenty\Plugin\Templates\Extensions\Twig_Extension;
use Plenty\Plugin\Templates\Factories\TwigFactory;
use Plenty\Modules\Item\Attribute\Contracts\AttributeValueImageRepositoryContract;
use Plenty\Modules\Authorization\Services\AuthHelper;
use Plenty\Modules\Item\ItemImage\Contracts\ItemImageRepositoryContract;
use Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract;
use Plenty\Modules\Feedback\Contracts\FeedbackAverageRepositoryContract;
use Plenty\Modules\Feedback\Models\FeedbackAverage;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\CategoryItems;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\Facets;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\SearchItems;
use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\CrossSellingItems;
use IO\Services\BasketService;
use Plenty\Modules\Item\Manufacturer\Contracts\ManufacturerExternalRepositoryContract;
use Plenty\Modules\Plugin\Libs\Contracts\LibraryCallContract;
use Plenty\Plugin\Http\Request;
use IO\Services\CategoryService;
use Ceres\Helper\SearchOptions;
use Plenty\Plugin\Templates\Twig;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\VariationAttributeMap;
use GuardiansBasicB2B\Helper\SeoPage;

class Base_Extension extends Twig_Extension
{

    /**
     * @var TwigFactory
     */
    private $factory;
    private $req;
    private $twig;
    /** Active only inside prepareSeoContent(); restored even if rendering fails. */
    private $seoPageCapture = null;
    /**
     * BlogTwigExtension constructor.
     * @param TwigFactory $factory
     */
    public function __construct(TwigFactory $factory, Twig $twig, Request $request)
    {
        $this->factory = $factory;
        $this->twig = $twig;
        $this->req = $request;
    }
    /**
     * @return string
     */
    public function getName():string
    {
        return "base_extension";
    }
    /**
     * @return array
     */
    public function getFunctions():array
    {
        return [
            $this->factory->createSimpleFunction('getImageAttributeList', [$this, 'getImageAttributeList']),
            $this->factory->createSimpleFunction('getFeedbackItemList', [$this, 'getFeedbackItemList']),
            $this->factory->createSimpleFunction('getListFeedbackAverages', [$this, 'getListFeedbackAverages']),
            $this->factory->createSimpleFunction('getFacetsFromCat', [$this, 'getFacetsFromCat']),
            $this->factory->createSimpleFunction('getFacetView', [$this, 'getFacetView']),
            $this->factory->createSimpleFunction('sortCatByKey', [$this, 'sortCatByKey']),
            $this->factory->createSimpleFunction('getCrossSeller', [$this, 'getCrossSeller']),
            $this->factory->createSimpleFunction('restGetContent', [$this, 'restGetContent']),
            $this->factory->createSimpleFunction('getItemsFromCat', [$this, 'getItemsFromCat']),
            $this->factory->createSimpleFunction('getItemsFromCatSimple', [$this, 'getItemsFromCatSimple']),
            $this->factory->createSimpleFunction('createSeoPage', [$this, 'createSeoPage']),
            $this->factory->createSimpleFunction('prepareSeoContent', [$this, 'prepareSeoContent']),
            $this->factory->createSimpleFunction('sortSizes', [$this, 'sortSizes']),
            $this->factory->createSimpleFunction('getAttributesWithImages', [$this, 'getAttributesWithImages']),
            $this->factory->createSimpleFunction('getCardAttributeMaps', [$this, 'getCardAttributeMaps']),
            $this->factory->createSimpleFunction('getItemPropertiesById', [$this, 'getItemPropertiesById']),
        ];
    }

    private function requestedFacetIds(): array
    {
        $raw = $this->req->get('facets');
        $values = is_string($raw) ? explode(',', $raw) : (is_array($raw) ? $raw : [$raw]);
        $ids = [];
        foreach ($values as $value) {
            $id = SeoPage::positiveInteger($value, true);
            if ($id !== null) {
                $ids[$id] = $id;
            }
        }
        return array_values($ids);
    }

    /** Presentation only: reuse this request's IO result, without another search or cache. */
    public function getFacetView(array $facets, array $selectedFacets = []): array
    {
        $selected = [];
        foreach (array_merge($this->requestedFacetIds(), $selectedFacets) as $value) {
            $id = SeoPage::positiveInteger($value);
            if ($id !== null && !in_array((string)$id, $selected, true)) {
                $selected[] = (string)$id;
            }
        }
        $values = [];
        $names = [];
        foreach ($facets as $facet) {
            $rows = [];
            foreach ($facet['values'] ?? [] as $value) {
                $id = (string)$value['id'];
                $rows[] = [$id, $value['name'], (int)$value['count']];
                $names[$id] = $value['name'];
            }
            $values[(string)$facet['id']] = $rows;
        }
        $active = [];
        // Selected IDs belong to the URL/configuration, not to the result buckets.
        // An absent bucket is not proof of an invalid ID or an untranslated facet.
        foreach ($selected as $id) {
            $active[] = ['id' => $id, 'name' => $names[$id] ?? null,
                'remaining' => implode(',', array_values(array_diff($selected, [$id])))];
        }
        return ['values' => $values, 'selected' => $selected, 'active' => $active];
    }

    public function getAttributesWithImages($itemId){
        return pluginApp(ItemSearchService::class)->getResult($this->cardAttributeFactory($itemId));
    }

    /** Index the existing item result once; the first property for an ID wins. */
    public function getItemPropertiesById(iterable $properties): array
    {
        $indexed = [];
        foreach ($properties as $property) {
            $id = $property['property']['id'] ?? null;
            // Result-field property IDs are integers; also retain numeric-string IDs.
            if (!is_int($id) && !is_numeric($id)) {
                continue;
            }
            $key = (int)$id;
            if ($id == $key && !array_key_exists($key, $indexed)) {
                $indexed[$key] = $property;
            }
        }
        return $indexed;
    }

    private function cardAttributeFactory($itemId)
    {
        return VariationAttributeMap::getSearchFactory(['itemId' => $itemId, 'afterKey' => null]);
    }

    public function getCardAttributeMaps(array $itemIds): array
    {
        $mapsByItem = [];
        // Attribute maps can include documents and images. Keep only the attributes
        // after each group, even when a ShopBuilder list has a large page size.
        foreach (array_chunk(array_unique(array_filter($itemIds)), 24) as $ids) {
            $factories = [];
            foreach ($ids as $id) {
                $factories['item' . $id] = $this->cardAttributeFactory($id);
            }
            $results = pluginApp(ItemSearchService::class)->getResults($factories);
            foreach ($ids as $id) {
                $key = 'item' . $id;
                if (!isset($results[$key])) {
                    throw pluginApp(\UnexpectedValueException::class, ['message' => 'Missing card attribute result for ' . $id]);
                }
                $mapsByItem[$id] = ['attributes' => $results[$key]['attributes'] ?? []];
            }
            unset($results);
        }
        return $mapsByItem;
    }

    public function getImageAttributeList($itemId,$attributeNameMap)
    {
        $attributeImageList = null;

        /** @var \Plenty\Modules\Authorization\Services\AuthHelper $authHelper */
        $authHelper = pluginApp(AuthHelper::class);

        /** @var AttributeValueImageRepositoryContract $AttributeValueImageRepositoryContract */
        $AttributeValueImageRepositoryContract = pluginApp(AttributeValueImageRepositoryContract::class);

        /** @var AttributeValueImageRepositoryContract $AttributeValueImageRepositoryContract */
        $ItemImageRepositoryContract = pluginApp(ItemImageRepositoryContract::class);

        $attributeImageList = $authHelper->processUnguarded(
            function () use ($AttributeValueImageRepositoryContract, $itemId, $attributeNameMap, $ItemImageRepositoryContract) {
                $associativeArray = array();

                foreach ($attributeNameMap as $attrGroupKey => $attrGroupValue){
                    $attrValuesWithImages = array();
                    foreach ($attrGroupValue["values"] as $attrKey => $attrValue){
                        $filters = [
                            "itemId" => $itemId,
                            "attributeId" => $attrGroupKey,
                            "valueId" => $attrKey
                        ];
                        $AttributeValueImageRepositoryContract->setFilters($filters);
                        $attributeValueImages = $AttributeValueImageRepositoryContract->search();

                        if(sizeof($attributeValueImages) > 0){
                            foreach ($attributeValueImages as $attributeValueImage) {
                                if($attributeValueImage["imageId"]!=null){
                                    $attrValuesWithImages[$attrKey] = $ItemImageRepositoryContract->show($attributeValueImage["imageId"]);
                                }else{
                                    $attrValuesWithImages[$attrKey] = "";
                                }
                            }
                        }else{
                            $attrValuesWithImages[$attrKey] = "";
                        }
                    }
                    $attrGroupValue["images"] = $attrValuesWithImages;
                    $associativeArray[$attrGroupKey] = $attrGroupValue;
                }
                return $associativeArray;

            }
        );

        return $attributeImageList;
    }

    public function getFeedbackItemList($itemId, $page, $maxCount)
    {
        /** @var FeedbackRepositoryContract $FeedbackRepositoryContract */
        $FeedbackRepositoryContract = pluginApp(FeedbackRepositoryContract::class);

        $filters = [
            "itemId" => $itemId,
            "ratingValue" => 5
        ];
        $itemColumns = [
            '*'
        ];

        $feedbacksItem = $FeedbackRepositoryContract->listFeedbacks($page, $maxCount, [], $filters);
        $feedbacksReturn = null;
        if($feedbacksItem == null){
            $feedbacksReturn = null;
        }else{
            $feedbacksReturn = $feedbacksItem->toArray();
        }
        return $feedbacksReturn;
    }

    public function getListFeedbackAverages($itemId)
    {
        /** @var FeedbackAverageRepositoryContract $FeedbackAverageRepositoryContract */
        $FeedbackAverageRepositoryContract = pluginApp(FeedbackAverageRepositoryContract::class);
        $filters = [
            "itemId" => $itemId
        ];

        $feedbacksItem = $FeedbackAverageRepositoryContract->getFeedbackAverage($itemId);
        $feedbacksReturn = null;
        if($feedbacksItem == null){
            $feedbacksReturn = null;
        }else{
            $feedbacksReturn = $feedbacksItem->toArray();
        }

        return $feedbacksReturn;
    }

    public function getFacetsFromCat($categoryId)
    {
        $itemListOptions = [
            'page'          => 1,
            'itemsPerPage'  => 0,
            'sorting'       => '',
            'facets'        => '',
            'categoryId'    => 18,
            'priceMin'      => '0',
            'priceMax'      => '1000'
        ];
        $searchParams = [
            'facets'   => Facets::getSearchFactory( $itemListOptions ),
            'itemList' => $categoryId > 0 ? CategoryItems::getSearchFactory( $itemListOptions ) : SearchItems::getSearchFactory( $itemListOptions )
        ];
        /** @var ItemSearchService $itemSearchService */
        $itemSearchService = pluginApp( ItemSearchService::class );
        $response = $itemSearchService->getResults($searchParams);

        return $response;
    }

    /** Kept for stored Twig callers. Its result is always the current basket. */
    public function restGetContent($query_url)
    {
        return pluginApp(BasketService::class)->getBasketForTemplate();
    }

    public function sortCatByKey($array, $sortKey)
    {
        $tmpt = $array->toarray();
        $sorted = $this->arrayOrderBy($tmpt, $sortKey);
        return $sorted;
    }

    private function arrayOrderBy(array &$arr, $order = null) {
        if (is_null($order)) {
            return $arr;
        }
        $orders = explode(',', $order);
        usort($arr, function($a, $b) use($orders) {

            $result = array();
            foreach ($orders as $value) {

                list($field, $sort) = array_map('trim', explode(' ', trim($value)));
                if (!(isset($a["details"][0][$field]) && isset($b["details"][0][$field]))) {
                    continue;
                }
                if (strnatcmp($sort, 'desc') === 0) {
                    $tmp = $a;
                    $a = $b;
                    $b = $tmp;
                }
                if (is_numeric($a["details"][0][$field]) && is_numeric($b["details"][0][$field]) ) {
                    $result[] = $a["details"][0][$field] - $b["details"][0][$field];
                } else {
                    $result[] = strnatcmp($a["details"][0][$field], $b["details"][0][$field]);
                }
            }
            return implode('', $result);
        });
        return $arr;
    }

    public function getCrossSeller($itemId, $crossSellerType, $maxItems){
        $options = array(
            "itemId" => $itemId,
            "relation" => $crossSellerType      // Nutze die Liste Zubehoer
        );
        $searchfactory = CrossSellingItems::getSearchFactory( $options );
        $searchfactory->setPage(1, $maxItems); // Begrenze auf 4 Artikel
        $result = pluginApp(ItemSearchService::class)->getResult($searchfactory);
        return $result['documents'];
    }

    // =========================
    // NEU: Preisbereichs-Resolver
    // Priorität: URL > Funktions-Parameter > 0/0
    // =========================
    private function resolvePriceRange(array $priceFilter = [0,0]): array
    {
        $minParam = $this->req->get('priceMin', null);
        $maxParam = $this->req->get('priceMax', null);

        $priceMin = is_numeric($minParam) ? (float)$minParam
                  : (isset($priceFilter[0]) ? (float)$priceFilter[0] : 0.0);

        $priceMax = is_numeric($maxParam) ? (float)$maxParam
                  : (isset($priceFilter[1]) ? (float)$priceFilter[1] : 0.0);

        // Sanity
        if ($priceMin < 0) $priceMin = 0.0;
        if ($priceMax < 0) $priceMax = 0.0;
        if ($priceMax > 0 && $priceMin > $priceMax) {
            $t = $priceMin; $priceMin = $priceMax; $priceMax = $t;
        }

        return [(float)$priceMin, (float)$priceMax];
    }

    public function createSeoPage($template, $pageMax = null, $currentPage = null, $total = null)
    {
        // SeoPage is not a shared container binding: constructor data belongs
        // to this render only, including when another page is rendered later.
        return pluginApp(SeoPage::class, [
            'query' => $this->req->query(),
            'template' => $template,
            'pageMax' => $pageMax,
            'currentPage' => $currentPage,
            'total' => $total
        ]);
    }

    public function prepareSeoContent(SeoPage $page, $categoryId): string
    {
        if ($page->shopBuilderHtml !== null) {
            return '';
        }
        $previousCapture = $this->seoPageCapture;
        $this->seoPageCapture = $page;
        try {
            $page->shopBuilderHtml = $this->twig->render(
                'GuardiansBasicB2B::Category.Content.PreparedShopBuilder',
                ['seoCategoryId' => $categoryId]
            );
        } finally {
            $this->seoPageCapture = $previousCapture;
        }
        return '';
    }

    public function getItemsFromCat($categoryId, $maxItemsPerPage, $ownFacets, $priceFilter = [0,0])
    {
        $categoryService = pluginApp(CategoryService::class);
        $activeCategory = $categoryService->get($categoryId);
        // The source category belongs to the list only. Never re-initialize the
        // routed page's shared CategoryContext (metadata, assets, notifications).

        $facets = array_values(array_unique(array_merge($ownFacets ?: [], $this->requestedFacetIds())));
        $sorting = $this->req->get('sorting', '');
        $sorting = is_string($sorting) ? $sorting : '';

        // --- NEU: Preisspanne flexibel auflösen (URL > Param > 0/0)
        [$priceMin, $priceMax] = $this->resolvePriceRange($priceFilter);

        $itemListOptions = [
            'page'          => SeoPage::positiveInteger($this->req->get('page', 1)) ?? 1,
            'itemsPerPage'  => $maxItemsPerPage,
            'sorting'       => $sorting,
            'facets'        => $facets,
            'categoryId'    => $categoryId,
            'priceMin'      => $priceMin,
            'priceMax'      => $priceMax
        ];

        $itemListOptions = SearchOptions::validateItemListOptions($itemListOptions, SearchOptions::SCOPE_CATEGORY);

        $effectivePage = SeoPage::positiveInteger($itemListOptions['page']);
        $effectiveSize = SeoPage::positiveInteger($itemListOptions['itemsPerPage']);
        if ($effectivePage === null || $effectiveSize === null) {
            throw pluginApp(\UnexpectedValueException::class, [
                'message' => 'Invalid effective category pagination after SearchOptions validation'
            ]);
        }
        $itemListOptions['page'] = $effectivePage;
        $itemListOptions['itemsPerPage'] = $effectiveSize;

        // The infinite-scroll fragment renders cards and pagination without filter controls.
        $listFragment = $this->req->get('quickViewItem') === 'true';
        $searchParams = [];
        if (!$listFragment) {
            $searchParams['facets'] = Facets::getSearchFactory($itemListOptions);
        }
        $searchParams['itemList'] = CategoryItems::getSearchFactory($itemListOptions);
        /** @var ItemSearchService $itemSearchService */
        $itemSearchService = pluginApp( ItemSearchService::class );

        $resultItems = $itemSearchService->getResults($searchParams);
        $total = $resultItems['itemList']['total'];
        $resultItems['itemList'] = $resultItems['itemList']['documents'] ?? null;
        $documentCount = is_array($resultItems['itemList']) ? count($resultItems['itemList']) : null;
        $reportedPages = $total / $effectiveSize;
        $pageMax = ceil($reportedPages);
        if ($documentCount > 0 && $effectivePage > $pageMax) {
            $pageMax = $effectivePage;
        }
        $resultItems['currentPage'] = $effectivePage;
        $resultItems['itemCountTotal'] = $total;
        $resultItems['itemCountPage'] = $effectiveSize;
        // A full page that already exceeds the total can offer one more navigation
        // link. Its destination makes its own SEO decision from its own documents.
        $resultItems['pageMax'] = $documentCount === $effectiveSize && $effectivePage > $reportedPages
            ? $pageMax + 1 : $pageMax;
        $resultItems['pageLimit'] = $resultItems['pageMax'];
        $resultItems['categoryId'] = $categoryId;
        $resultItems['category'] = $activeCategory;
        if (!$listFragment) {
            $resultItems['searchOptions'] = SearchOptions::get(SearchOptions::SCOPE_CATEGORY);
        }
        $resultItems['itemSorting'] = $sorting;
        $resultItems['query'] = ['items' => $effectiveSize, 'sorting' => $itemListOptions['sorting']];
        $resultItems['selectedFacets'] = $ownFacets;

        if ($this->seoPageCapture !== null) {
            $this->seoPageCapture->addList($effectivePage, $pageMax, $total, $documentCount);
        }

        return  $this->twig->render('GuardiansBasicB2B::Category.Item.CategoryItemContent', $resultItems);
    }

    public function getItemsFromCatSimple($categoryId, $maxItemsPerPage, $ownFacets, $priceFilter = [0,0])
    {
        // --- NEU: Preisspanne flexibel auflösen (URL > Param > 0/0)
        [$priceMin, $priceMax] = $this->resolvePriceRange($priceFilter);

        $itemListOptions = [
            'page'          => 1,
            'itemsPerPage'  => $maxItemsPerPage,
            'sorting'       => 'variation.createdAt_desc',
            'facets'        => $ownFacets,
            'categoryId'    => $categoryId,
            'priceMin'      => $priceMin,
            'priceMax'      => $priceMax
        ];

        $itemListOptions = SearchOptions::validateItemListOptions($itemListOptions, SearchOptions::SCOPE_CATEGORY);

        $searchParams = [
            'itemList' => CategoryItems::getSearchFactory($itemListOptions)
        ];

        /** @var ItemSearchService $itemSearchService */
        $itemSearchService = pluginApp(ItemSearchService::class);
        $results = $itemSearchService->getResults($searchParams);

        return $this->twig->render('GuardiansBasicB2B::Category.Item.Partials.CategoryGridOnly', [
            'itemList' => $results['itemList']['documents']
        ]);
    }

    public function sortSizes($attrValues){
        if($attrValues != null){
            usort($attrValues, array($this,'cmp'));
        }
        return $attrValues;
    }

    private function cmp($a, $b)
    {
        static $lookup = null;

        if ($lookup === null) {
            $sizeList = [
                "XXS","XXS (47-51)","XXS/XS","XS","XS/34","XS/36","XS/AB","XS/S",
                "S","S (42/44)","S (85 cm)","S-M","S/34","S/36","S/38","S/42","S/CD","S/L","S/M","SM",
                "M","M (46/48)","M (53-56)","M (95 cm)","M/36","M/38","M/40","M/46","M/L",
                "L","L (105 cm)","L/38","L/40","L/42","L/CD","L/XL",
                "XL","XL (54/56)","XL-XXL","XL/40","XL/42","XL/XXL","XLT",
                "XXL","XXL/42","XXL/44","2XL","2XL2","2XLL","2XLT","2XT",
                "XXXL","3XL","3XL2","3XLT","3XT","4XL","4XLL","4XLT","5XL",
                "27","27 1/3","27.5","27 1/2","27 2/3","28","28 1/3","28.5","28 1/2","28 2/3",
                "29","29 1/3","29.5","29 1/2","29 2/3","30","30 1/3","30.5","30 1/2","30 2/3",
                "31","31 1/3","31.5","31 1/2","31 2/3","32","32 1/3","32.5","32 1/2","32 2/3",
                "33","33 1/3","33.5","33 1/2","33 2/3","34","34 1/3","34.5","34 1/2","34 2/3",
                "35","35 1/3","35.5","35 1/2","35 2/3","36","36 1/3","36.5","36 1/2","36 2/3",
                "37","37 1/3","37.5","37 1/2","37 2/3","38","38 1/3","38.5","38 1/2","38 2/3",
                "39","39 1/3","39.5","39 1/2","39 2/3","40","40 1/3","40.5","40 1/2","40 2/3",
                "41","41 1/3","41.5","41 1/2","41 2/3","42","42 1/3","42.5","42 1/2","42 2/3",
                "43","43 1/3","43.5","43 1/2","43 2/3","44","44 1/3","44.5","44 1/2","44 2/3",
                "45","45 1/3","45.5","45 1/2","45 2/3","46","46 1/3","46.5","46 1/2","46 2/3",
                "47","47 1/3","47.5","47 1/2","47 2/3","48","48 1/3","48.5","48 1/2","48 2/3",
                "49","49 1/3","49.5","49 1/2","49 2/3","50","50 1/3","50.5","50 1/2","50 2/3",
                "51","51 1/3","51.5","51 1/2","51 2/3","52","52 1/3","52.5","52 1/2","52 2/3",
                "52-54","53","53 1/3","53.5","53 1/2","53 2/3","54","54 1/3","54.5","54 1/2","54 2/3",
                "55","55 1/3","55.5","55 1/2","55 2/3","56","57","58","58-60","60","61","62"
            ];

            $lookup = array_flip($sizeList); // z. B. ['XS' => 3, 'S' => 8, ...]
        }

        $aKey = $lookup[$a] ?? PHP_INT_MAX; // alles Unbekannte ans Ende
        $bKey = $lookup[$b] ?? PHP_INT_MAX;

        return $aKey <=> $bKey;
    }

}

