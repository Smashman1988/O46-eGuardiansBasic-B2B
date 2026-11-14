<?php
// Recording platform doubles. Optional output feeds the same raw documents and actual
// resource response into the matrix browser test: php tests/variation_batch.php <file>.
namespace Plenty\Plugin\Http {
    class Request {
        public function get($key, $default) {
            return $key === 'ids' ? '1,2,3,4,5,6,7,8,1' : $default;
        }
    }
    class Response { public $data; }
}
namespace IO\Api {
    class ResponseCode { const OK = 200; }
    class ApiResource {
        protected $request, $response;
        public function __construct($request, $response) {
            $this->request = $request;
            $this->response = $response;
        }
    }
    class ApiResponse {
        public function create($body, $status) {
            if ($status !== 200) { throw new \RuntimeException('Unexpected status'); }
            $response = new \Plenty\Plugin\Http\Response();
            $response->data = $body;
            return $response;
        }
    }
}
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class SingleItem {
        public static function getSearchFactory(array $options) {
            return $options;
        }
    }
}
namespace Plenty\Modules\Webshop\ItemSearch\Services {
    class ItemSearchService {
        public $calls = 0;
        public function getResults($factories) {
            $this->calls++;
            $results = [];
            foreach (range(1, 8) as $id) {
                if ($factories['v' . $id] !== ['variationId' => $id, 'setCategory' => false]) {
                    throw new \RuntimeException('Changed SingleItem options');
                }
                $results['v' . $id] = ['documents' => [['data' => $GLOBALS['docs'][$id]]]];
            }
            if (count($factories) !== 8) { throw new \RuntimeException('Unexpected search count'); }
            return $results;
        }
    }
}
namespace {
    require dirname(__DIR__) . '/src/Resources/VariationBatchResource.php';
    use GuardiansBasicB2B\Resources\VariationBatchResource;
    use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;

    function pluginApp($class) {
        if ($class !== ItemSearchService::class) { throw new \RuntimeException('Unexpected service'); }
        return $GLOBALS['service'];
    }
    $service = new ItemSearchService();
    $maxima = [1 => 3, 2 => '4', 3 => 0, 4 => null, 6 => -2, 7 => 'bad', 8 => 44];
    $docs = [];
    foreach (range(1, 8) as $id) {
        $variation = ['id' => $id];
        if (array_key_exists($id, $maxima)) { $variation['maximumOrderQuantity'] = $maxima[$id]; }
        $images = [['url' => '#last-' . $id, 'position' => 4], ['url' => '#first-' . $id, 'position' => 1]];
        $docs[$id] = [
            'variation' => $variation, 'prices' => ['default' => ['unitPrice' => ['value' => 2.5 + $id]]],
            'stock' => ['net' => $id + 10],
            'barcodes' => [['code' => 'internal'], ['type' => 'EAN', 'code' => '001' . $id]],
            'images' => $id % 2 === 0 ? ['all' => $images] : ['variation' => $images, 'all' => []]
        ];
    }
    $resource = new VariationBatchResource(new \Plenty\Plugin\Http\Request(), new \IO\Api\ApiResponse());
    $response = $resource->index()->data;
    if ($service->calls !== 1 || $response['missing'] !== [] || $response['count'] !== 8) {
        throw new \RuntimeException('Expected one multi-search and eight results');
    }
    foreach ($docs as $id => $doc) {
        $row = $response['items'][$id];
        $expectedMax = [1 => 3, 2 => '4', 8 => 44];
        if (array_key_exists('orderMax', $row) !== array_key_exists($id, $expectedMax) ||
            ($row['orderMax'] ?? null) !== ($expectedMax[$id] ?? null) ||
            $row['stock'] !== $doc['stock']['net'] || $row['price'] !== $doc['prices']['default']['unitPrice']['value'] ||
            $row['ean'] !== '001' . $id || array_column($row['images'], 'url') !== ['#first-' . $id, '#last-' . $id]) {
            throw new \RuntimeException('Wrong matrix projection for ' . $id);
        }
    }
    if (isset($argv[1])) {
        file_put_contents($argv[1], json_encode(['docs' => $docs, 'batch' => $response], JSON_THROW_ON_ERROR));
    }
    echo '8 variation projections, 1 multi-search, 8 unique SingleItem factories PASS' . PHP_EOL;
}
