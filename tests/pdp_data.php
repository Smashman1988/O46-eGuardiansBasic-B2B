<?php
// Compare the real PDP/Quickview preparation block against the pre-change source.
// php tests/pdp_data.php <Twig autoloader> <before-SingleItem.twig> <report.json>
require $argv[1];
class PdpDataFixture {
    public $calls = [], $rows, $lang;
    public function __construct($rows, $lang) { $this->rows = $rows; $this->lang = $lang; }
    public function __call($name, $args) {
        $this->calls[] = $name;
        switch ($name) {
            case 'getVariationAttributeMap': return $this->rows;
            case 'getVariationList': return array_column($this->rows, 'variationId');
            case 'getBasePriceList': return array_fill_keys($args[0], ['price' => 999]);
            case 'getCanonicalURL': return '/' . $this->lang . '/product/';
            case 'getBasketForTemplate': return ['currency' => 'EUR', 'items' => []];
            case 'getItemCrossSellingList': return ['documents' => []];
            case 'getLanguage': return $this->lang;
            case 'getAttributeNameMap': return ['attributes' => [['attributeId' => 1, 'name' => 'Size']]];
            case 'isItemInWishList': return false;
        }
        throw new RuntimeException('Unexpected service call ' . $name);
    }
    public function basePrices($ids) { return $this->__call('getBasePriceList', [$ids]); }
    public function config($key) { return 'home, category, item'; }
}
function preparation($source) {
    $start = strpos($source, '{# === Services & Daten === #}');
    $end = strpos($source, '{% import ', $start);
    if ($start === false || $end === false) { throw new RuntimeException('Preparation block missing'); }
    return substr($source, $start, $end - $start) . '{{ [detailurl, variationsWithAttributes, basketItems, crossSellingList, enabledRoutes, lang, itemAttributes, isInWishList, itemPrices, hasRRP]|json_encode|raw }}';
}
$old = file_get_contents($argv[2]);
$new = file_get_contents(__DIR__ . '/../resources/views/Item/SingleItem.twig');
// These outputs had no consumer in any theme template, including included templates.
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator(__DIR__ . '/../resources/views')) as $file) {
    if ($file->getExtension() === 'twig' && preg_match('/\b(?:variationList|basePriceList)\b/', file_get_contents($file->getPathname()))) {
        throw new RuntimeException('Review new consumer before restoring removed preparation queries: ' . $file);
    }
}
$cases = [];
foreach (['de', 'en', 'fr', 'it', 'es'] as $lang) {
    foreach ([1, 10, 50] as $count) {
        foreach ([true, false] as $fullPage) {
            foreach ([false, true] as $customerFixture) {
                $rows = array_map(function ($id) { return ['variationId' => $id, 'attributes' => [['attributeId' => 1, 'attributeValueId' => $id]]]; }, range(1001, 1000 + $count));
                $results = [];
                foreach (['old' => $old, 'new' => $new] as $version => $source) {
                    $service = new PdpDataFixture($rows, $lang);
                    $twig = new Twig\Environment(new Twig\Loader\ArrayLoader(['preparation' => preparation($source)]), ['strict_variables' => true]);
                    $twig->addFunction(new Twig\TwigFunction('getBasePriceList', [$service, 'basePrices']));
                    $twig->addFunction(new Twig\TwigFunction('config', [$service, 'config']));
                    $prices = ['default' => ['unitPrice' => ['value' => $customerFixture ? 4.123456789 : 5.987654321]], 'rrp' => ['price' => ['value' => 9.99]]];
                    $html = $twig->render('preparation', ['itemId' => 42, 'variationId' => 1001, 'isQuickView' => $fullPage,
                        'services' => array_fill_keys(['item','url','basket','localizationRepository','wishList'], $service), 'itemData' => ['prices' => $prices]]);
                    $results[$version] = ['data' => json_decode(trim($html), true, 512, JSON_THROW_ON_ERROR), 'calls' => $service->calls];
                }
                $kept = array_values(array_filter($results['old']['calls'], function ($name) { return !in_array($name, ['getVariationList','getBasePriceList'], true); }));
                if ($results['old']['data'] !== $results['new']['data'] || $kept !== $results['new']['calls'] || count($results['old']['calls']) - count($kept) !== 2) {
                    throw new RuntimeException('Data or required service sequence changed');
                }
                $cases[] = ['lang' => $lang, 'rows' => $count, 'fullPage' => $fullPage, 'customerFixture' => $customerFixture, 'equal' => true,
                    'beforeCalls' => $results['old']['calls'], 'afterCalls' => $results['new']['calls']];
            }
        }
    }
}
file_put_contents($argv[3], json_encode(['twig' => Twig\Environment::VERSION, 'mode' => 'LOCAL_SERVICE_FIXTURES_NOT_CUSTOMER_ACCEPTANCE', 'cases' => $cases], JSON_PRETTY_PRINT));
echo count($cases) . " preparation comparisons PASS; two unused calls removed; Twig " . Twig\Environment::VERSION . PHP_EOL;
