<?php
namespace GuardiansBasicB2B\Providers;

use Plenty\Plugin\RouteServiceProvider;
use Plenty\Plugin\Routing\Router;
use Plenty\Plugin\Routing\ApiRouter;

class GuardiansBasicRouteServiceProvider extends RouteServiceProvider
{
    public function map(Router $router, ApiRouter $api)
    {
        $router->get('loginPreview', 'GuardiansBasicB2B\Controllers\ContentController@dynamicLogin');
        $router->get('basketPreview', 'GuardiansBasicB2B\Controllers\ContentController@dynamicBasketPreview');
        $router->get('basketPreviewSmall', 'GuardiansBasicB2B\Controllers\ContentController@dynamicBasketPreviewSmall');
        $router->get('catPreviewImages', 'GuardiansBasicB2B\Controllers\ContentController@dynamicCatPreviewImages');
        $router->get('getFeedbacks', 'GuardiansBasicB2B\Controllers\ContentController@dynamicGetFeedbacks');
        $router->get('getShopBuilderContent', 'GuardiansBasicB2B\Controllers\ContentController@getShopBuilderContent');
        $router->get('trackings', 'GuardiansBasicB2B\Controllers\ContentController@getTrackings');
        $api->version(['v1'], ['namespace' => 'GuardiansBasicB2B\Resources'], function ($api) {
            $api->resource('io/facet', 'FacetResource');
            // Keep IO's route untouched; plugin registration order must not select the adapter.
            $api->get('guardiansbasicb2b/item/search/autocomplete', 'SearchAutocompleteResource@index');

            // NEU: Batch-Endpoint für Variationsdaten (stock/price/ean/images)
            $api->get('io/variations/batch', 'VariationBatchResource@index');
        });
    }
}

