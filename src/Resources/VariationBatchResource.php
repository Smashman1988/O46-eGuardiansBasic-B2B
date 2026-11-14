<?php

namespace GuardiansBasicB2B\Resources;

use GuardiansBasicB2B\Helper\SeoPage;
use IO\Api\ApiResource;
use IO\Api\ApiResponse;
use IO\Api\ResponseCode;
use Plenty\Plugin\Http\Request;
use Plenty\Plugin\Http\Response;

use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\SingleItem;

class VariationBatchResource extends ApiResource
{
    private const GTIN_TYPES = ['gtin_8', 'gtin_13', 'gtin_14', 'gtin_128'];

    public function __construct(Request $request, ApiResponse $response)
    {
        parent::__construct($request, $response);
    }

    public function index(): Response
    {
        $idsParam = $this->request->get('ids', '');
        if (is_string($idsParam)) {
            $ids = preg_split('/[,\s]+/', $idsParam, -1, PREG_SPLIT_NO_EMPTY);
        } else {
            $ids = is_array($idsParam) ? $idsParam : [$idsParam];
        }

        $uniqueIds = [];
        foreach ($ids as $value) {
            // Numeric IDs may be padded by clients. Reject prefixes, overflow
            // and nested values before they can become unrelated variation IDs.
            $id = SeoPage::positiveInteger($value, true);
            if ($id !== null) {
                $uniqueIds[$id] = $id;
                if (count($uniqueIds) === 300) {
                    break;
                }
            }
        }
        $template = $this->request->get('template', '');

        if (!$uniqueIds || !is_string($template)) {
            return $this->response->create([
                'items'   => (object)[],
                'missing' => [],
                'count'   => 0
            ], ResponseCode::BAD_REQUEST);
        }

        $template = trim($template);

        /** @var ItemSearchService $itemSearchService */
        $itemSearchService = pluginApp(ItemSearchService::class);

        // Viele Variationen in EINEM Server-Call abfragen (getResults)
        $searches = [];

        foreach ($uniqueIds as $id) {
            $options = [
                'variationId' => (int)$id,
                'setCategory' => false
            ];

            // template nur setzen, wenn wirklich übergeben (wie beim Einzelcall /rest/io/variations/{id}?template=...)
            if ($template !== '') {
                $options['template'] = $template;
            }

            // SingleItem liefert dir genau die Struktur, die du im Einzelcall siehst (wenn template stimmt)
            $searches['v' . $id] = SingleItem::getSearchFactory($options);
        }

        $results = $itemSearchService->getResults($searches);

        $items = [];
        $missing = [];

        foreach ($uniqueIds as $id) {
            $key = 'v' . $id;
            $res = $results[$key] ?? null;

            $doc = null;
            if (is_array($res) && isset($res['documents'][0]['data']) && is_array($res['documents'][0]['data'])) {
                $doc = $res['documents'][0]['data'];
            }

            if (!$doc) {
                $missing[] = (int)$id;
                $items[(string)$id] = null;
                continue;
            }

            // stock
            $stock = null;
            if (isset($doc['stock']) && is_array($doc['stock']) && array_key_exists('net', $doc['stock'])) {
                $stock = $doc['stock']['net'];
            }

            // price: default.unitPrice.value (so wie du es im JS nutzt)
            $price = null;
            if (isset($doc['prices']['default']['unitPrice']['value'])) {
                $price = $doc['prices']['default']['unitPrice']['value'];
            }

            // ean: best effort
            $ean = null;
            if (!empty($doc['barcodes']) && is_array($doc['barcodes'])) {
                foreach ($doc['barcodes'] as $b) {
                    if (!is_array($b)) continue;
                    $code = $b['code'] ?? null;
                    if (!$code) continue;

                    $type = strtolower(trim((string)($b['type'] ?? '')));
                    $barcodeType = strtolower(trim((string)($b['barcodeType'] ?? '')));
                    $label = $type . ' ' . $barcodeType . ' ' . strtolower((string)($b['name'] ?? ''));
                    if (strpos($label, 'ean') !== false || in_array($type, self::GTIN_TYPES, true)
                        || in_array($barcodeType, self::GTIN_TYPES, true)) {
                        $ean = (string)$code;
                        break;
                    }

                    if ($ean === null) {
                        $ean = (string)$code;
                    }
                }
            }

            // images (optional, aber du nutzt’s fürs Preview)
            $images = [];
            $imgSrc = null;

            if (isset($doc['images']['variation']) && is_array($doc['images']['variation']) && count($doc['images']['variation'])) {
                $imgSrc = $doc['images']['variation'];
            } elseif (isset($doc['images']['all']) && is_array($doc['images']['all']) && count($doc['images']['all'])) {
                $imgSrc = $doc['images']['all'];
            }

            if (is_array($imgSrc)) {
                foreach ($imgSrc as $im) {
                    if (!is_array($im)) continue;
                    $images[] = [
                        'url'        => $im['url'] ?? ($im['urlLarge'] ?? null),
                        'urlMiddle'  => $im['urlMiddle'] ?? ($im['url'] ?? null),
                        'urlPreview' => $im['urlPreview'] ?? ($im['urlMiddle'] ?? ($im['url'] ?? null)),
                        'position'   => isset($im['position']) ? (int)$im['position'] : 9999
                    ];
                }

                usort($images, function ($a, $b) {
                    $pa = isset($a['position']) ? (int)$a['position'] : 9999;
                    $pb = isset($b['position']) ? (int)$b['position'] : 9999;
                    return $pa <=> $pb;
                });
            }

            $items[(string)$id] = [
                'id'     => (int)$id,
                'stock'  => $stock,
                'price'  => $price,
                'ean'    => $ean,
                'images' => $images
            ];
            $orderMax = $doc['variation']['maximumOrderQuantity'] ?? null;
            if (is_numeric($orderMax) && $orderMax > 0) {
                $items[(string)$id]['orderMax'] = $orderMax;
            }
        }

        return $this->response->create([
            'items'   => $items,
            'missing' => $missing,
            'count'   => count($items)
        ], ResponseCode::OK);
    }
}
