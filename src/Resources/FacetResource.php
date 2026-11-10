<?php //strict

namespace GuardiansBasicB2B\Resources;

use Ceres\Helper\SearchOptions;
use GuardiansBasicB2B\Services\EnglishTextSearch;
use Plenty\Modules\Webshop\Contracts\WebstoreConfigurationRepositoryContract;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\CategoryItems;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\Facets;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\SearchItems;
use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
use Plenty\Plugin\Http\Response;
use Plenty\Plugin\Http\Request;
use IO\Api\ApiResource;
use IO\Api\ApiResponse;
use IO\Api\ResponseCode;

/**
 * Class FacetResource
 * @package IO\Api\Resources
 * 
 * @deprecated since 4.4.0
 * this class will be removed with IO 5.0.0 -> nope plenty, not with me
 */

class FacetResource extends ApiResource
{
    /**
     * FacetResource constructor.
     * @param Request $request
     * @param ApiResponse $response
     */
    public function __construct(Request $request, ApiResponse $response)
    {
        parent::__construct($request, $response);
    }

    /**
     * Get Facets
     * @return Response
     * 
     * @deprecated since 4.4.0
     */
    public function index():Response
    {
        $categoryId   = (int)$this->request->get('categoryId', 0);
        $searchString = $this->request->get('query', '');
        if (is_numeric($searchString)) {
            $searchString = (string)$searchString;
        }

        if($categoryId > 0 || (is_string($searchString) && strlen($searchString)))
        {
            $itemListOptions = [
                'page'         => 1,
                'itemsPerPage' => 0,
                'sorting'      => '',
                'facets'       => $this->request->get('facets', '' ),
                'priceMin'     => $this->request->get('priceMin', 0),
                'priceMax'     => $this->request->get('priceMax', 0)
            ];

            if($categoryId > 0)
            {
                $itemListOptions['categoryId'] = $categoryId;
            }
            else
            {
                $itemListOptions['query'] = $searchString;
            }
            $itemListOptions['page'] = 1;
            $itemListOptions['itemsPerPage'] = 50;

            if ($categoryId <= 0 && EnglishTextSearch::applies()) {
                $config = pluginApp(WebstoreConfigurationRepositoryContract::class)->getWebstoreConfiguration();
                $itemListOptions['searchOperator'] = $config->itemSearchOperator;
                $options = SearchOptions::validateItemListOptions($itemListOptions, SearchOptions::SCOPE_SEARCH);
                $response = pluginApp(EnglishTextSearch::class)->getPage($options);
                return $this->response->create([
                    'facets' => $response['facets'],
                    'itemList' => $response['itemList']
                ], ResponseCode::OK);
            }
            
            $searchParams = [
                'facets'   => Facets::getSearchFactory( $itemListOptions ),
                'itemList' => $categoryId > 0 ? CategoryItems::getSearchFactory( $itemListOptions ) : SearchItems::getSearchFactory( $itemListOptions )
            ];

            /** @var ItemSearchService $itemSearchService */
            $itemSearchService = pluginApp( ItemSearchService::class );
            $response = $itemSearchService->getResults($searchParams);

            return $this->response->create($response, ResponseCode::OK);
        }
        else
        {
            return $this->response->create( null, ResponseCode::BAD_REQUEST );
        }
    }
}
