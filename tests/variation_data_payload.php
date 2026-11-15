<?php
// Render the real PDP/Quickview DOM attribute, with the previous template optional.
// php tests/variation_data_payload.php <Twig autoload> <report.json> [before-SingleItem.twig]
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
$source = file_get_contents(dirname(__DIR__) . '/resources/views/Item/SingleItem.twig');
function variationAttribute($source) {
    if (!preg_match('/data-eg-variations="[\s\S]*?"/', $source, $match)) {
        throw new RuntimeException('Missing actual variation attribute');
    }
    return '<div ' . $match[0] . '></div>';
}
$templates = ['after' => variationAttribute($source)];
$templates['before'] = isset($argv[3]) ? variationAttribute(file_get_contents($argv[3])) :
    '<div data-eg-variations="{{ variationsWithAttributes | json_encode | e(\'html_attr\') }}"></div>';
// Verify the full service result remains available to included templates.
$templates['context'] = $templates['after'] . '{{ variationsWithAttributes | json_encode | raw }}';
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['autoescape' => 'html']);
$cases = [];
foreach (['de', 'en', 'fr', 'it', 'es'] as $language) {
    foreach ([0, 1, 60, 301, 600] as $count) {
        $rows = [];
        for ($i = 1; $i <= $count; $i++) {
            $rows[] = ['variationId' => $i % 2 ? $i : (string)$i,
                'attributes' => $i % 7 ? [
                    ['attributeId' => 1, 'attributeValueId' => $i],
                    ['attributeId' => 2, 'attributeValueId' => 100 + ($i % 3)]] : [],
                'url' => $language . '/product-ä-"<&-description_' . $i,
                'unitId' => $i % 3, 'unitCombinationId' => $i + 10];
        }
        $context = ['variationsWithAttributes' => $rows];
        $pair = [];
        foreach (['before', 'after'] as $version) {
            $html = $twig->render($version, $context);
            $dom = new DOMDocument();
            @$dom->loadHTML('<?xml encoding="UTF-8">' . $html);
            $data = $dom->getElementsByTagName('div')->item(0)->getAttribute('data-eg-variations');
            $pair[$version] = ['htmlBytes' => strlen($html), 'gzipBytes' => strlen(gzencode($html, 6)),
                'jsonBytes' => strlen($data), 'data' => json_decode($data, true, 512, JSON_THROW_ON_ERROR)];
            if ($dom->getElementsByTagName('div')->length !== 1 || $dom->getElementsByTagName('script')->length) {
                throw new RuntimeException('Attribute escaping changed');
            }
        }
        if (count($pair['after']['data']) !== $count) throw new RuntimeException('Variant count changed');
        foreach ($pair['before']['data'] as $key => $row) {
            $actual = $pair['after']['data'][$key];
            if ($actual !== ['variationId' => $row['variationId'], 'attributes' => $row['attributes']]) {
                throw new RuntimeException('Changed IDs, attributes, types, order or excess payload');
            }
        }
        if ($twig->render('context', $context) !== $twig->render('after', $context) . json_encode($rows)) {
            throw new RuntimeException('Full Twig context was changed');
        }
        foreach ($pair as &$result) unset($result['data']);
        unset($result);
        $cases[] = ['language' => $language, 'variants' => $count, 'equalConsumedData' => true] + $pair;
    }
}
file_put_contents($argv[2], json_encode(['twig' => Twig\Environment::VERSION,
    'mode' => 'SYNTHETIC_VARIANTS_REAL_TWIG_NOT_NETWORK_TRANSFER', 'cases' => $cases], JSON_PRETTY_PRINT));
echo count($cases) . ' payload comparisons PASS; IDs/attributes/order/types/escaping/full Twig context retained; Twig ' . Twig\Environment::VERSION . PHP_EOL;
