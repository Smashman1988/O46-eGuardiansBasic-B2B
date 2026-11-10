<?php

namespace GuardiansBasicB2B\Resources;

use GuardiansBasicB2B\Services\EnglishTextSearch;
use GuardiansBasicB2B\Services\SearchAutocompleteService;
use IO\Api\Resources\ItemSearchAutocompleteResource;
use IO\Api\ResponseCode;
use Plenty\Plugin\Http\Response;

class SearchAutocompleteResource extends ItemSearchAutocompleteResource
{
    public function index(): Response
    {
        if (!EnglishTextSearch::applies()) {
            return parent::index();
        }

        $searchString = $this->request->get('query', '');
        if (!strlen($searchString)) {
            return $this->response->create(null, ResponseCode::BAD_REQUEST);
        }

        // pluginApp resolves compiled plugin classes in the active plugin set.
        $service = pluginApp(SearchAutocompleteService::class);
        $result = $service->getResults($searchString, $this->request->get('types', []));
        return $this->response->create($service->transformResult($result), ResponseCode::OK);
    }
}
