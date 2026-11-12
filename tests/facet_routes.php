<?php
// Regression for the native language-prefix loss. Real helper/Twig, explicit routing fixtures.
// php tests/facet_routes.php <Twig autoload> <report.json>
$reportPath = $argv[2];
$argv[2] = '--library';
require __DIR__ . '/facets.php';
$fixtures = json_decode(file_get_contents(__DIR__ . '/fixtures/facets.json'), true);
$report = ['mode'=>'LOCAL_TWIG_ROUTING_FIXTURES', 'twig'=>\Twig\Environment::VERSION, 'cases'=>[], 'failures'=>[]];
$scenarios = [
    ['size', ['facets'=>'3118'], '3118'],
    ['brand', ['facets'=>'155'], '155'],
    ['color', ['facets'=>'9'], '9'],
    ['price', ['priceMin'=>'2','priceMax'=>'10'], 'price'],
    ['combined-size', ['facets'=>'3118,155,9','priceMin'=>'2','priceMax'=>'10'], '3118'],
    ['combined-brand', ['facets'=>'3118,155,9','priceMin'=>'2'], '155'],
    ['combined-price', ['facets'=>'3118,155,9','priceMax'=>'10'], 'price'],
    ['reset', ['facets'=>'3118,155,9','priceMin'=>'2','priceMax'=>'10'], 'all'],
    ['zero-remove', ['facets'=>'2247,3118','priceMin'=>'999999'], '2247'],
    ['zero-reset', ['facets'=>'2247,3118','priceMin'=>'999999'], 'all'],
];
foreach (['de','en','fr','it','es'] as $lang) foreach (['women','search'] as $kind) foreach ($scenarios as [$name,$selected,$action]) {
    $key = "$lang/$kind/$name";
    try {
        $params = array_merge(['sorting'=>'sorting.price.avg_asc','page'=>'3','itemsPerPage'=>'24','currency'=>'EUR','ShipToCountry'=>'1','campaign'=>'Keep & + Ü % / ?','custom'=>['a','b']], $selected);
        if ($kind === 'search') $params['query'] = 'Nike & + Größe / été?';
        $options = ['lang'=>$lang,'kind'=>$kind,'params'=>$params,'canonicalOverride'=>'https://unrelated.example/seo-target/'];
        if (str_starts_with($name,'zero')) $options['groups'] = [];
        $r = renderFacets($options);
        preg_match_all('~<a\s+href="([^"]*)"([^>]*)>~', $r['html'], $matches, PREG_SET_ORDER);
        $href = null;
        foreach ($matches as $m) {
            if (($action === 'all' && str_contains($m[2],'facet-remove-all')) ||
                ($action === 'price' && str_contains($m[2],'facet-remove-price')) ||
                str_contains($m[2], 'data-eg-remove-facet="' . $action . '"')) {
                $href = html_entity_decode($m[1], ENT_QUOTES | ENT_HTML5, 'UTF-8'); break;
            }
        }
        if ($href === null) throw new RuntimeException('Removal anchor missing');
        $expected = $params; unset($expected['page']);
        if ($action === 'all') unset($expected['facets'],$expected['priceMin'],$expected['priceMax']);
        elseif ($action === 'price') unset($expected['priceMin'],$expected['priceMax']);
        else {
            $remaining = array_values(array_diff(explode(',',$params['facets']),[$action]));
            if ($remaining) $expected['facets'] = implode(',',$remaining); else unset($expected['facets']);
        }
        $expectedPath = parse_url($fixtures[$kind]['languages'][$lang], PHP_URL_PATH);
        $actualPath = parse_url($href, PHP_URL_PATH);
        if ($actualPath !== $expectedPath) throw new RuntimeException("Wrong route: $actualPath; expected $expectedPath");
        parse_str(parse_url($href, PHP_URL_QUERY) ?? '', $actual);
        ksort($actual); ksort($expected);
        if ($actual !== $expected) throw new RuntimeException('Unrelated parameters changed or wrong removal');
        $host = parse_url($href,PHP_URL_HOST);
        if ($host !== null && $host !== 'b2b.outlet46.de') throw new RuntimeException('Followed SEO canonical override');
        $prefixed = renderFacets(array_merge($options,['requestPath'=>$expectedPath]));
        if ($prefixed['html'] !== $r['html']) throw new RuntimeException('Result depends on already-prefixed Request URI');
        $report['cases'][$key] = ['status'=>'PASS','requestPath'=>$r['requestPath'],'url'=>$href,'parameters'=>$actual,'zero'=>str_starts_with($name,'zero')];
    } catch (\Throwable $e) { $report['failures'][$key] = $e->getMessage(); }
}
$report['pass'] = count($report['cases']); $report['fail'] = count($report['failures']);
file_put_contents($reportPath,json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
echo json_encode(['pass'=>$report['pass'],'fail'=>$report['fail'],'firstFailure'=>array_slice($report['failures'],0,1)]) . "\n";
exit($report['fail'] ? 1 : 0);
