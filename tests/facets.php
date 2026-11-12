<?php
// Actual theme helper + Twig, explicit IO/Request fixtures. Never contacts a shop.
// php tests/facets.php <Twig autoload> <report.json> | --render (JSON on stdin)
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Plugin\Templates\Factories { class TwigFactory {} }
namespace Plenty\Plugin\Templates { class Twig {} }
namespace Plenty\Plugin\Http {
    class Request {
        public $params = [], $path = '/';
        public function get($key, $default = null) { return $this->params[$key] ?? $default; }
        public function getRequestUri() { return $this->path . '?' . http_build_query($this->params); }
    }
}
namespace {
    $deprecations = [];
    set_error_handler(function ($level, $message, $file, $line) use (&$deprecations) {
        if (in_array($level, [E_DEPRECATED,E_USER_DEPRECATED],true)) { $deprecations[$message] = true; return true; }
        throw new \ErrorException($message, 0, $level, $file, $line);
    });
    require $argv[1];
    require dirname(__DIR__) . '/src/Helper/SeoPage.php';
    require dirname(__DIR__) . '/src/Extensions/Base_Extension.php';
    function pluginApp($class) { throw new RuntimeException('Unexpected service/search call: ' . $class); }
    class FacetCallbacks {
        public $request, $labels, $routes, $lang, $canonicalOverride;
        public function trans($key) { return $this->labels[explode('::Template.', $key)[1]] ?? $key; }
        public function queryString($replace) {
            $q = array_replace($this->request->params, $replace);
            $query = http_build_query($q, '', '&', PHP_QUERY_RFC3986);
            return $query === '' ? '' : '?' . $query;
        }
        public function getLanguageURLs() { return $this->routes; }
        public function getCanonicalURL($lang = null, $ignore = false) {
            if (!$ignore && $this->canonicalOverride !== null) return $this->canonicalOverride;
            return $this->routes[$lang ?? $this->lang] ?? '';
        }
    }
    function renderFacets(array $options): array {
        $root = dirname(__DIR__);
        $fixtures = json_decode(file_get_contents(__DIR__ . '/fixtures/facets.json'), true);
        $fixture = $fixtures[$options['kind'] ?? 'women'];
        $lang = $options['lang'] ?? 'de';
        $request = new \Plenty\Plugin\Http\Request();
        $request->params = $options['params'] ?? [];
        $request->path = $options['path'] ?? parse_url($fixture['languages'][$lang], PHP_URL_PATH);
        // Native Plenty evidence: the routed Request URI can omit the language prefix.
        if ($lang !== 'de' && str_starts_with($request->path, '/' . $lang . '/')) {
            $request->path = substr($request->path, strlen('/' . $lang));
        }
        $request->path = $options['requestPath'] ?? $request->path;
        $callback = new FacetCallbacks(); $callback->request = $request; $callback->labels = [];
        $callback->lang = $lang;
        $callback->canonicalOverride = $options['canonicalOverride'] ?? null;
        foreach (file($root . '/resources/lang/' . $lang . '/Template.properties') as $line) {
            if (preg_match('/^([a-zA-Z0-9]+)\s*=\s*(.*)$/u', trim($line), $m)) $callback->labels[$m[1]] = $m[2];
        }
        $callback->routes = $options['languages'] ?? $fixture['languages'];
        $helper = new \GuardiansBasicB2B\Extensions\Base_Extension(new \Plenty\Plugin\Templates\Factories\TwigFactory(), new \Plenty\Plugin\Templates\Twig(), $request);
        $templates = [];
        foreach (['FacetFilter','FacetFilter2','FacetFilter3','check-icon'] as $name) {
            $templates['GuardiansBasicB2B::Category.Item.Partials.' . $name] = file_get_contents($root . '/resources/views/Category/Item/Partials/' . $name . '.twig');
        }
        $twig = new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates), ['cache'=>false, 'autoescape'=>'html']);
        $twig->addFunction(new \Twig\TwigFunction('getFacetView', [$helper, 'getFacetView']));
        $twig->addFunction(new \Twig\TwigFunction('trans', [$callback, 'trans']));
        $twig->addFunction(new \Twig\TwigFunction('queryString', [$callback, 'queryString']));
        $groups = $options['groups'] ?? $fixture['groups'];
        $context = ['request'=>$request, 'facets'=>$groups, 'selectedFacets'=>$options['selectedFacets'] ?? [],
            'services'=>['url'=>$callback], 'category'=>['id'=>$fixture['categoryId'] ?: null],
            'searchOptions'=>['defaultItemsPerPage'=>24], 'currencyData'=>['symbol'=>'€'], 'currencyFormat'=>'symbol'];
        $html = $twig->render('GuardiansBasicB2B::Category.Item.Partials.' . ($options['template'] ?? 'FacetFilter2'), $context);
        $seo = new \GuardiansBasicB2B\Helper\SeoPage($request->params, ($options['kind'] ?? '') === 'search' ? 'tpl.search' : 'tpl.category.item', 10, 1, 240);
        return ['html'=>$html, 'model'=>$helper->getFacetView($groups, $context['selectedFacets']), 'requestPath'=>$request->path, 'languageUnavailable'=>$callback->labels['facetLanguageUnavailable'],
            'robots'=>$seo->getRobots('', $options['robots'] ?? 'INDEX,FOLLOW', false)];
    }
    if ($argv[2] === '--library') return;
    if ($argv[2] === '--render') {
        echo json_encode(renderFacets(json_decode(stream_get_contents(STDIN), true)), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
        exit;
    }
    $report = ['twig'=>\Twig\Environment::VERSION, 'cases'=>[], 'failures'=>[]];
    function check($condition, $message) { if (!$condition) throw new RuntimeException($message); }
    function testCase($name, $callback) {
        global $report;
        try { $report['cases'][$name] = $callback(); }
        catch (\Throwable $e) { $report['failures'][$name] = $e->getMessage(); }
    }
    foreach (['de','en','fr','it','es'] as $lang) {
        foreach (['few','women','all','children','search','filtered'] as $kind) {
            testCase("compact/$lang/$kind", function () use ($lang, $kind) {
                $r = renderFacets(['lang'=>$lang, 'kind'=>$kind]);
                check(strpos($r['html'], 'type="checkbox"') === false, 'Eager checkbox rendering');
                check(count($r['model']['values']) > 0, 'Missing data groups');
                preg_match('~data-eg-facet-data>(.*?)</script>~s', $r['html'], $m);
                $data = json_decode($m[1], true, 512, JSON_THROW_ON_ERROR);
                check($data['values'] === $r['model']['values'], 'JSON values altered');
                check(!array_key_exists('languages',$data), 'Duplicate language routes in facet JSON');
                return ['htmlBytes'=>strlen($r['html']), 'jsonBytes'=>strlen($m[1]), 'values'=>array_sum(array_map('count', $data['values']))];
            });
        }
        for ($i=0; $i<10; $i++) {
            testCase("zero/$lang/$i", function () use ($lang,$i) {
                $ids = [(string)(2247+$i), (string)(3118+$i)];
                $r = renderFacets(['lang'=>$lang, 'groups'=>[], 'params'=>['facets'=>implode(',',$ids), 'query'=>$i%2 ? 'empty & +?' : '', 'priceMax'=>$i%3 ? '1' : null]]);
                check(array_column($r['model']['active'],'id') === $ids, 'Selection lost without buckets');
                check(substr_count($r['html'],'data-eg-remove-facet=') === 2, 'Missing removal links');
                check(strpos($r['html'],'facet-remove-all') !== false, 'Missing reset');
                check($r['robots'] === 'NOINDEX,FOLLOW', 'Filtered page indexed');
                return 'PASS';
            });
            testCase("price/$lang/$i", function () use ($lang,$i) {
                $params = $i%3 === 0 ? ['priceMin'=>'2'] : ($i%3 === 1 ? ['priceMax'=>'10'] : ['priceMin'=>'2','priceMax'=>'10']);
                if ($i%2) $params['facets'] = '3118,659';
                $r = renderFacets(['lang'=>$lang, 'params'=>$params, 'kind'=>$i%2 ? 'search' : 'women', 'robots'=>'INDEX,NOFOLLOW,NOARCHIVE']);
                check($r['robots'] === 'NOINDEX,NOFOLLOW,NOARCHIVE', 'Price restriction or pre-existing restriction lost');
                check(strpos($r['html'],'facet-remove-price') !== false, 'Price cannot be removed');
                return 'PASS';
            });
        }
    }
    testCase('selection/normalize-and-configured',function () {
        $r = renderFacets(['params'=>['facets'=>'3118,3118,659,,bad,0,-1,<script>'], 'selectedFacets'=>[2247,'659']]);
        check($r['model']['selected'] === ['3118','659','2247'], 'Unsafe or duplicate IDs');
        check($r['model']['active'][0]['remaining'] === '659,2247', 'Wrong removal set');
        return 'PASS';
    });
    testCase('escaping/labels-and-json',function () {
        $evil = '</script><img src=x onerror=alert(1)> & "quoted"';
        $r = renderFacets(['groups'=>[['id'=>1,'name'=>$evil,'cssClass'=>'ffix','values'=>[['id'=>1,'name'=>$evil,'count'=>1]]]],'params'=>['facets'=>'1']]);
        check(strpos($r['html'],'<img src=x') === false, 'Unescaped label');
        check(substr_count($r['html'],'</script>') === 1, 'JSON script breakout');
        check($r['model']['active'][0]['name'] === $evil, 'Lossy label data');
        return 'PASS';
    });
    testCase('compatibility/shared-templates',function () {
        $a = renderFacets([])['html'];
        foreach (['FacetFilter','FacetFilter3'] as $template) check(trim(renderFacets(['template'=>$template])['html']) === trim($a), 'Divergent template');
        return 'PASS';
    });
    $report['deprecations'] = array_keys($deprecations);
    $report['pass'] = count($report['cases']); $report['fail'] = count($report['failures']);
    file_put_contents($argv[2],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));
    echo json_encode(['twig'=>$report['twig'],'pass'=>$report['pass'],'failures'=>$report['failures']]) . "\n";
    exit($report['fail'] ? 1 : 0);
}
