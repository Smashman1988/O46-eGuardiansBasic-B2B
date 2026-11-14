<?php
// Recording platform doubles. Optional output feeds the same raw documents and actual
// resource response into the matrix browser test: php tests/variation_batch.php <file>.
namespace Plenty\Plugin\Http {
    class Request {
        public function __construct(private $params = ['ids' => '1,2,3,4,5,6,7,8,1']) {}
        public function get($key, $default) {
            return $this->params[$key] ?? $default;
        }
    }
    class Response { public $data, $status; }
}
namespace IO\Api {
    class ResponseCode { const OK = 200, BAD_REQUEST = 400; }
    class ApiResource {
        protected $request, $response;
        public function __construct($request, $response) {
            $this->request = $request;
            $this->response = $response;
        }
    }
    class ApiResponse {
        public function create($body, $status) {
            $response = new \Plenty\Plugin\Http\Response();
            $response->data = $body;
            $response->status = $status;
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
        public $lastFactories = [];
        public function getResults($factories) {
            $this->calls++;
            $this->lastFactories = $factories;
            $results = [];
            foreach ($factories as $factory) {
                $id = $factory['variationId'];
                if (!isset($GLOBALS['docs'][$id])) continue;
                $doc = $GLOBALS['docs'][$id];
                // Apply the declared fields to these source properties. Prices and
                // other platform enrichments are supplied separately by the fixture.
                $doc['variation'] = \matrixFields($doc['variation'], 'variation.');
                foreach ($doc['barcodes'] as &$barcode) {
                    $barcode = \matrixFields($barcode, 'barcodes.');
                }
                unset($barcode);
                foreach ($doc['images'] as $group => &$images) {
                    foreach ($images as &$image) {
                        $image = \matrixFields($image, 'images.' . $group . '.');
                    }
                    unset($image);
                }
                unset($images);
                $results['v' . $id] = ['documents' => [['data' => $doc]]];
            }
            return $results;
        }
    }
}
namespace {
    require dirname(__DIR__) . '/src/Helper/SeoPage.php';
    require dirname(__DIR__) . '/src/Resources/VariationBatchResource.php';
    use GuardiansBasicB2B\Resources\VariationBatchResource;
    use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;

    $singleItemFields = json_decode(file_get_contents(dirname(__DIR__) . '/resources/views/ResultFields/SingleItem.fields.json'), true, 512, JSON_THROW_ON_ERROR);
    function matrixFields($row, $prefix) {
        foreach (array_keys($row) as $key) {
            if (!in_array($prefix . $key, $GLOBALS['singleItemFields'], true)) {
                unset($row[$key]);
            }
        }
        return $row;
    }

    function pluginApp($class) {
        if ($class !== ItemSearchService::class) { throw new \RuntimeException('Unexpected service'); }
        return $GLOBALS['service'];
    }
    $service = new ItemSearchService();
    $maxima = [1 => 3, 2 => '4', 3 => 0, 4 => null, 6 => -2, 7 => 'bad', 8 => 44];
    $barcodeTypes = [1=>'GTIN_8', 2=>'GTIN_13', 3=>'GTIN_14', 4=>'GTIN_128', 5=>'EAN_13', 6=>' gtin_13 ', 7=>'EAN_8'];
    $docs = [];
    foreach (range(1, 8) as $id) {
        $variation = ['id' => $id];
        if (array_key_exists($id, $maxima)) { $variation['maximumOrderQuantity'] = $maxima[$id]; }
        $images = [['url' => '#last-' . $id, 'position' => 4, 'urlPreview' => '#last-preview-' . $id],
            ['url' => '#first-' . $id, 'position' => 1, 'urlPreview' => '#first-preview-' . $id]];
        $docs[$id] = [
            'variation' => $variation, 'prices' => ['default' => ['unitPrice' => ['value' => 2.5 + $id]]],
            'stock' => ['net' => $id + 10],
            'barcodes' => [
                ['type'=>'CODE_128', 'name'=>'Kein GTIN', 'code'=>'internal'],
                ['type'=>$barcodeTypes[$id] ?? 'custom', 'name'=>$id === 8 ? 'EAN_13' : 'Standard', 'code'=>'001'.$id],
                ['type'=>'GTIN_13', 'code'=>'other']
            ],
            'images' => $id % 2 === 0 ? ['all' => $images] : ['variation' => $images, 'all' => []]
        ];
    }
    $resource = new VariationBatchResource(new \Plenty\Plugin\Http\Request(), new \IO\Api\ApiResponse());
    $result = $resource->index();
    $response = $result->data;
    $expectedFactories = [];
    foreach (range(1, 8) as $id) {
        $expectedFactories['v' . $id] = ['variationId' => $id, 'setCategory' => false];
    }
    if ($result->status !== 200 || $service->calls !== 1 || $service->lastFactories !== $expectedFactories ||
        $response['missing'] !== [] || $response['count'] !== 8) {
        throw new \RuntimeException('Expected one multi-search and eight results');
    }
    foreach ($docs as $id => $doc) {
        $row = $response['items'][$id];
        $expectedMax = [1 => 3, 2 => '4', 8 => 44];
        if (array_key_exists('orderMax', $row) !== array_key_exists($id, $expectedMax) ||
            ($row['orderMax'] ?? null) !== ($expectedMax[$id] ?? null) ||
            $row['stock'] !== $doc['stock']['net'] || $row['price'] !== $doc['prices']['default']['unitPrice']['value'] ||
            $row['ean'] !== '001' . $id || array_column($row['images'], 'url') !== ['#first-' . $id, '#last-' . $id] ||
            array_column($row['images'], 'urlPreview') !== ['#first-preview-' . $id, '#last-preview-' . $id]) {
            throw new \RuntimeException('Wrong matrix projection for ' . $id);
        }
    }
    if (isset($argv[1])) {
        file_put_contents($argv[1], json_encode(['docs' => $docs, 'batch' => $response], JSON_THROW_ON_ERROR));
    }
    $docs[1]['barcodes'] = [
        ['type'=>'GTIN_13', 'code'=>''],
        ['type'=>'CODE_128', 'code'=>'00internal'],
        ['type'=>'GTIN_1300', 'code'=>'not-a-gtin-type']
    ];
    if ($resource->index()->data['items'][1]['ean'] !== '00internal') {
        throw new \RuntimeException('An unknown barcode type replaced the first nonempty fallback');
    }
    $cases = [
        [['ids' => ['2x', ['8'], '1e3', '3.2', -1]], []],
        [['ids' => [' 002 ', '3', 2, '3e1', ['4'], '9'], 'template' => ' fixture '], [2,3,9]],
        [['ids' => '7,2x,1e3,1.2  4,7,-2'], [7,4]],
        [['ids' => '3', 'template' => ['invalid']], []],
        [['ids' => array_merge([1,1], range(1, 350))], range(1,300)],
        [['ids' => ['92233720368547758080', '8']], [8]],
    ];
    foreach ($cases as [$params, $expected]) {
        $before = $service->calls;
        $result = (new VariationBatchResource(new \Plenty\Plugin\Http\Request($params), new \IO\Api\ApiResponse()))->index();
        if (!$expected) {
            if ($result->status !== 400 || $service->calls !== $before ||
                json_encode($result->data) !== '{"items":{},"missing":[],"count":0}') {
                throw new \RuntimeException('Invalid batch reached a search factory or changed the error envelope');
            }
            continue;
        }
        if ($result->status !== 200 || $service->calls !== $before + 1 ||
            array_keys($result->data['items']) !== $expected || $result->data['missing'] !== array_values(array_diff($expected, array_keys($docs)))) {
            throw new \RuntimeException('Batch IDs, missing entries or request count changed');
        }
        if (isset($params['template']) && $service->lastFactories['v2']['template'] !== 'fixture') {
            throw new \RuntimeException('Valid result field template was lost');
        }
    }
    echo '8 variation projections, 1 multi-search, 8 unique SingleItem factories and 6 input cases PASS' . PHP_EOL;
}
