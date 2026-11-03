<?php

namespace GuardiansBasicB2B\Resources;

use IO\Api\ApiResource;
use IO\Api\ApiResponse;
use IO\Api\ResponseCode;
use Plenty\Plugin\Http\Request;
use Plenty\Plugin\Http\Response;

use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
use Plenty\Modules\Webshop\ItemSearch\SearchPresets\SingleItem;

class VariationBatchResource extends ApiResource
{
    public function __construct(Request $request, ApiResponse $response)
    {
        parent::__construct($request, $response);
    }

    public function index(): Response
    {
        // ids kann sein:
        // - ids=1,2,3
        // - ids[]=1&ids[]=2
        $idsParam = $this->request->get('ids', '');
        $ids = [];

        if (is_array($idsParam)) {
            $ids = $idsParam;
        } else {
            $ids = preg_split('/[,\s]+/', (string)$idsParam, -1, PREG_SPLIT_NO_EMPTY);
        }

        $ids = array_values(array_unique(array_filter(array_map(function ($v) {
            $n = (int)$v;
            return $n > 0 ? $n : null;
        }, $ids))));

        if (!count($ids)) {
            return $this->response->create([
                'items'   => (object)[],
                'missing' => [],
                'count'   => 0
            ], ResponseCode::BAD_REQUEST);
        }

        // optional: Hard-Limit gegen Abuse
        if (count($ids) > 300) {
            $ids = array_slice($ids, 0, 300);
        }

        // wichtig: template (ResultFields) vom Request übernehmen, sonst fehlen häufig stock/images/barcodes
        $template = (string)$this->request->get('template', '');
        $template = trim($template);

        /** @var ItemSearchService $itemSearchService */
        $itemSearchService = pluginApp(ItemSearchService::class);

        // Viele Variationen in EINEM Server-Call abfragen (getResults)
        $searches = [];

        foreach ($ids as $id) {
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

        foreach ($ids as $id) {
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

                    $t = strtolower(
                        (string)($b['type'] ?? '') . ' ' .
                        (string)($b['barcodeType'] ?? '') . ' ' .
                        (string)($b['name'] ?? '')
                    );

                    if (strpos($t, 'ean') !== false) {
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
        }

        return $this->response->create([
            'items'   => $items,
            'missing' => $missing,
            'count'   => count($items)
        ], ResponseCode::OK);
    }
}
