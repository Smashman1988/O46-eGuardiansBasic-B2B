<?php
// php tests/asset_page_scope.php <external-twig-autoload.php> <report.json>
// Render the real delivery templates. Plenty services and unrelated UI are fixtures.
// This verifies emitted asset contracts, not native checkout or browser performance.
if (count($argv) !== 3) { throw new RuntimeException('Expected Twig autoloader and JSON report path'); }
require $argv[1];
require __DIR__ . '/asset_manifest.php';
if (!extension_loaded('mbstring')) { throw new RuntimeException('Twig rendering requires the PHP mbstring extension'); }

$root = dirname(__DIR__);
$deprecations = [];
set_error_handler(function ($level, $message) use (&$deprecations) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) {
        $deprecations[$message] = true;
        return true;
    }
    throw new ErrorException($message, 0, $level);
});
$assertions = 0;
function check($condition, $message) {
    $GLOBALS['assertions']++;
    if (!$condition) { throw new RuntimeException($message); }
}
// Ordinary method callbacks keep the same test compatible with Twig 2 and 3 on PHP 8.4.
class AssetScopeCallback {
    private $callback;
    public function __construct($callback) { $this->callback = $callback; }
    public function invoke(...$args) { return ($this->callback)(...$args); }
}
class AssetScopeRequest {
    public $params = [], $uri = '/fixture/';
    public function get($name, $default = null) { return $this->params[$name] ?? $default; }
    public function getRequestUri() { return $this->uri; }
}
class AssetScopeTemplate {
    public $template = 'tpl.home';
    public function getCurrentTemplate() { return $this->template; }
    public function isItem() { return $this->template === 'tpl.item'; }
    public function isSearch() { return $this->template === 'tpl.search'; }
    public function isCategory() { return strpos($this->template, 'tpl.category') === 0; }
    public function isCheckout() { return $this->template === 'tpl.checkout'; }
    public function isMyAccount() { return false; }
    public function shouldBeCached() { return false; }
    public function isCheapestSorting() { return false; }
}
class AssetScopeLocalization {
    public $language = 'de';
    public function getLanguage() { return $this->language; }
}
class AssetScopeServices {
    public function getCurrencyData() { return ['name' => 'EUR']; }
    public function getCanonicalURL(...$args) { return 'https://fixture.invalid/brands/'; }
    public function getURLById($id) { return '/category-' . $id . '/'; }
    public function __call($name, $args) { return null; }
}
class AssetScopeSeo {
    public $pagination = ['valid' => false, 'requestedPage' => 1];
    public function disableCategoryPagination() { $this->pagination['valid'] = false; }
}
function readView($file) {
    return file_get_contents(dirname(__DIR__) . '/resources/views/' . $file . '.twig');
}
$templates = [
    'layout' => readView('PageDesign/PageDesign'),
    'head' => readView('PageDesign/Partials/Head'),
    'metadata' => '', 'empty' => '',
    'fixture' => '{% extends "layout" %}{% block PageBody %}<div class="fixture-body">{{ fixtureBody | raw }}</div>{% endblock %}',
    'brands' => readView('Category/Item/CategoryItem'),
    'GuardiansBasicB2B::Category.Item.CategoryItemBrands' => readView('Category/Item/CategoryItemBrands'),
    'Ceres::PageDesign.Macros.LayoutContainer' => '{% macro show(name) %}{% endmacro %}',
    'Ceres::PageDesign.Macros.IncludeComponents' => '{% macro include_components() %}{% endmacro %}',
    'Ceres::PageDesign.Macros.Translations' => '{% macro add(plugin, file) %}{% endmacro %}'
];
// The complete PageDesign/Head/brand code is real; external components are inert.
foreach (['layout', 'brands'] as $name) {
    preg_match_all('/\{%\s*(?:include|import)\s+"([^"]+)"/', $templates[$name], $matches);
    foreach ($matches[1] as $include) { $templates[$include] = $templates[$include] ?? ''; }
}
foreach (['DE', 'EN', 'FR', 'IT', 'ES'] as $language) {
    $templates['GuardiansBasicB2B::PageDesign.Components.b2babfrage' . $language] = '';
    $templates['GuardiansBasicB2B::PageDesign.Components.nl-element' . $language] = '';
}
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['cache' => false, 'autoescape' => 'html']);
function addFunction($twig, $name, $callback) {
    $twig->addFunction(new Twig\TwigFunction($name, [new AssetScopeCallback($callback), 'invoke']));
}
foreach (['get_consent_scripts', 'get_filtered_tags', 'get_json_data', 'get_shop_builder_scripts',
    'component', 'ssr_entry', 'csrf_token', 'prepareSeoContent'] as $name) {
    addFunction($twig, $name, function () { return ''; });
}
foreach (['get_additional_styles', 'get_additional_scripts'] as $name) {
    addFunction($twig, $name, function () { return []; });
}
addFunction($twig, 'getPartial', function ($name) {
    return ['page-design' => 'layout', 'head' => 'head', 'page-metadata' => 'metadata'][$name] ?? 'empty';
});
addFunction($twig, 'plugin_path', function ($name) { return '/plugins/' . $name; });
addFunction($twig, 'trans', function ($name) { return $name; });
addFunction($twig, 'config', function ($name) {
    return ['IO.routing.category_basket' => 9001, 'Ceres.currency.format' => 'name'][$name] ?? '';
});
addFunction($twig, 'createSeoPage', function () { return new AssetScopeSeo(); });
addFunction($twig, 'queryString', function () { return ''; });
// Twig compiles the entire real CategoryItem template, including the grid branch.
// A brand render must never execute this unrelated product-data lookup.
addFunction($twig, 'getCardAttributeMaps', function () {
    throw new RuntimeException('Brand directory unexpectedly requested product attribute maps');
});
$twig->addFilter(new Twig\TwigFilter('filterFields', [new AssetScopeCallback(function ($value) { return $value; }), 'invoke']));

$request = new AssetScopeRequest();
$template = new AssetScopeTemplate();
$localization = new AssetScopeLocalization();
$services = new AssetScopeServices();
$base = [
    'request' => $request, 'category' => [], 'lang' => 'de', 'isSearch' => false,
    'isShopBuilder' => false, 'bodyClasses' => [], 'fixtureBody' => '',
    'services' => ['template' => $template, 'localizationRepository' => $localization,
        'checkout' => $services, 'url' => $services, 'category' => $services,
        'customer' => $services, 'country' => $services, 'propertyFile' => $services,
        'order' => $services, 'webstoreConfig' => $services],
    'context' => new class { public function renderState() { return ''; } },
    'webstoreConfig' => ['domainSsl' => 'https://fixture.invalid', 'defaultLanguage' => 'de'],
    'ceresConfig' => ['global' => ['blockCookies' => false], 'log' => ['performanceLevel' => 'live']],
    'currencyData' => ['name' => 'EUR'], 'buildHash' => 'fixture', 'notifications' => [],
    'currentPage' => 1, 'categories' => [],
    'urls' => ['templateType' => '', 'includeLanguage' => false, 'trailingSlashSuffix' => '/']
];

// Primary ten rows cover the requested nine page types plus the actual brand page.
// Further rows protect Ceres-jQuery exceptions and content/fragment behavior.
$cases = [
    'homepage' => ['template' => 'tpl.home', 'builder' => true, 'page' => 'main', 'checkoutCss' => true],
    'category' => ['template' => 'tpl.category.item', 'category' => 100, 'grid' => true, 'page' => 'cat', 'facets' => true],
    'search' => ['template' => 'tpl.search', 'grid' => true, 'page' => 'cat', 'facets' => true],
    'product' => ['template' => 'tpl.item', 'page' => 'item', 'matrix' => true, 'zoom' => true],
    'basket' => ['template' => 'tpl.category.content', 'category' => 9001, 'basketClass' => true,
        'page' => 'vue', 'facets' => true, 'checkoutCss' => true, 'jquery' => false],
    'login' => ['template' => 'tpl.login', 'page' => 'main', 'checkoutCss' => true],
    'register' => ['template' => 'tpl.register', 'page' => 'main', 'checkoutCss' => true],
    'checkout' => ['template' => 'tpl.checkout', 'page' => 'main', 'checkoutCss' => true],
    'content' => ['template' => 'tpl.category.content', 'category' => 9000, 'builder' => true,
        'page' => 'cat', 'facets' => true, 'checkoutCss' => true],
    'brands' => ['template' => 'tpl.category.item', 'category' => 60, 'view' => 'brands', 'page' => 'main'],
    'content-embedded-grid' => ['template' => 'tpl.category.content', 'category' => 9000, 'grid' => true,
        'page' => 'cat', 'facets' => true, 'body' => '<section data-eg-compact-facets></section><div class="category-product-list"></div>'],
    'known-main-content' => ['template' => 'tpl.category.content', 'category' => 31, 'page' => 'main', 'facets' => true],
    'linked-login' => ['template' => 'tpl.category.content', 'category' => 5483, 'page' => 'main', 'facets' => true, 'checkoutCss' => true],
    'linked-register' => ['template' => 'tpl.category.content', 'category' => 5482, 'page' => 'vue',
        'facets' => true, 'checkoutCss' => true, 'jquery' => false],
    'linked-checkout' => ['template' => 'tpl.category.content', 'category' => 5484, 'page' => 'vue',
        'facets' => true, 'checkoutCss' => true, 'jquery' => false],
    'direct-basket' => ['template' => 'tpl.basket', 'page' => 'main', 'checkoutCss' => true],
    'express-path-precedence' => ['template' => 'tpl.category.content', 'category' => 5484,
        'uri' => '/amazon/expressCheckoutReview/', 'page' => 'main', 'facets' => true, 'checkoutCss' => true],
    'quickview-fragment' => ['template' => 'tpl.item', 'fragment' => true, 'page' => null,
        'body' => '<article class="single"><div data-eg-size-matrix></div></article>']
];
$report = ['php' => PHP_VERSION, 'twig' => Twig\Environment::VERSION,
    'runtime' => 'Local real Twig delivery templates with explicit Plenty/UI fixtures; native behavior NOT_TESTED',
    'cases' => [], 'failures' => []];

foreach (['de', 'en', 'fr', 'it', 'es'] as $language) {
    foreach ($cases as $name => $case) {
        $key = $language . '/' . $name;
        try {
            $localization->language = $language;
            $template->template = $case['template'];
            $request->params = !empty($case['fragment']) ? ['quickViewItem' => 'true'] : [];
            $request->uri = $case['uri'] ?? '/' . $language . '/fixture/';
            $ctx = $base;
            $ctx['lang'] = $language;
            $ctx['isSearch'] = $case['template'] === 'tpl.search';
            $ctx['isShopBuilder'] = $case['builder'] ?? false;
            $ctx['category'] = isset($case['category']) ? ['id' => $case['category'], 'details' => [['name' => 'Fixture', 'lang' => $language]]] : [];
            $ctx['bodyClasses'] = !empty($case['basketClass']) ? ['category-basket'] : [];
            $ctx['fixtureBody'] = $case['body'] ?? '';
            if (array_key_exists('grid', $case)) { $ctx['rendersItemGrid'] = $case['grid']; }
            if ($name === 'brands') {
                $children = [];
                foreach (range(1, 6) as $i) {
                    $children[] = ['details' => [['name' => chr(64 + $i) . ' Brand', 'nameUrl' => 'brand-' . $i,
                        'metaTitle' => 'Brand ' . $i, 'image2Path' => 'brand-' . $i . '.png']], 'itemCount' => [['count' => $i]]];
                }
                $ctx['categories'] = [['id' => 60, 'details' => [['name' => 'Brands', 'nameUrl' => 'brands', 'lang' => $language]], 'children' => $children]];
                $ctx['urls']['includeLanguage'] = $language !== 'de';
            }
            $html = $twig->render($case['view'] ?? 'fixture', $ctx);
            preg_match_all('~<script\s+src="(/plugins/GuardiansBasicB2B/([^"]+))"([^>]*)>~', $html, $tags, PREG_SET_ORDER);
            $actual = array_map(function ($tag) { return html_entity_decode($tag[2], ENT_QUOTES, 'UTF-8'); }, $tags);
            $expected = [];
            if (empty($case['fragment'])) {
                if (!empty($case['facets'])) { $expected[] = verifiedThemeAssetPath('js/facets.min.js'); }
                if ($case['jquery'] ?? true) { $expected[] = verifiedThemeAssetPath('js/jquery-3.7.1.min.js'); }
                $expected[] = verifiedThemeAssetPath('js/core.min.js');
                if (!empty($case['matrix'])) { $expected[] = verifiedThemeAssetPath('js/matrix.min.js'); }
                $expected[] = verifiedThemeAssetPath('js/' . $case['page'] . '.min.js');
                if (!empty($case['zoom'])) { $expected[] = verifiedThemeAssetPath('js/magiczoom.min.js'); }
            }
            check($actual === $expected, 'Wrong own JS order/count: ' . json_encode($actual));
            foreach ($tags as $tag) {
                if (strpos($tag[2], 'jquery-') === false) { check(strpos($tag[3], 'defer') !== false, 'Own deferred script lost defer'); }
            }
            if (empty($case['fragment'])) {
                $core = array_values(array_filter($tags, function ($tag) { return strpos($tag[2], 'js/core.min.js?') === 0; }))[0];
                foreach (['matrix', 'magiczoom'] as $module) {
                    check(strpos($core[3], 'data-eg-' . $module . '-src="/plugins/GuardiansBasicB2B/' . verifiedThemeAssetPath('js/' . $module . '.min.js') . '"') !== false,
                        'Missing versioned dynamic ' . $module . ' URL');
                }
            }
            preg_match_all('~<link\s+rel="stylesheet"\s+href="/plugins/GuardiansBasicB2B/([^"]+)"([^>]*)>~', $html, $cssTags, PREG_SET_ORDER);
            $css = array_map(function ($tag) { return html_entity_decode($tag[1], ENT_QUOTES, 'UTF-8'); }, $cssTags);
            $expectedCss = [];
            if (empty($case['fragment'])) {
                if (!empty($case['checkoutCss'])) { $expectedCss = array_fill(0, 2, verifiedThemeAssetPath('css/checkout.min.css')); }
                $expectedCss = array_merge($expectedCss, array_fill(0, 2, verifiedThemeAssetPath('css/main.min.css')), [verifiedThemeAssetPath('css/contact-widget.css')]);
            }
            check($css === $expectedCss, 'CSS scope/order or noscript fallback changed: ' . json_encode($css));
            check(strpos($html, '/426/') === false, 'Hard-coded pluginset path');
            if ($name === 'brands') {
                check(strpos($html, 'data-eg-compact-facets') === false, 'Brand directory unexpectedly renders compact facets');
                check(strpos($html, 'class="category-product-list') === false, 'Brand directory unexpectedly renders product grid');
                check(substr_count($html, 'class="brands-box"') === 27, 'A-Z/0-9 anchors changed');
                check(substr_count($html, 'href="' . ($language === 'de' ? '' : '/' . $language) . '/brands/brand-') === 6, 'Localized brand links changed');
                check(substr_count($html, 'data-src="/documents/brand-') === 2, 'Deferred brand images changed');
                foreach (range(1, 4) as $i) { check(strpos($html, 'src="/documents/brand-' . $i . '.png"') !== false, 'Early brand image missing'); }
            }
            if ($name === 'content-embedded-grid') {
                check(strpos($html, 'data-eg-compact-facets') !== false, 'Content fixture lost dynamic facets markup');
            }
            if (!empty($case['fragment'])) {
                check(strpos($html, 'data-eg-size-matrix') !== false, 'Quickview body fragment was suppressed');
                check(strpos($html, 'data-eg-matrix-src') === false, 'Quickview fragment duplicates full-page loader');
            }
            $report['cases'][$key] = ['status' => 'PASS', 'scripts' => $actual,
                'stylesheetsIncludingNoscript' => $css, 'page' => $case['page'],
                'initialMatrix' => $case['matrix'] ?? false, 'fragment' => $case['fragment'] ?? false];
            preg_match_all('~<script\b[^>]*?\ssrc="([^"]+)"~', $html, $allScripts);
            $report['cases'][$key]['otherDeclaredScripts'] = array_values(array_filter($allScripts[1], function ($url) {
                return strpos($url, '/plugins/GuardiansBasicB2B/') !== 0;
            }));
        } catch (Throwable $e) { $report['failures'][$key] = $e->getMessage(); }
    }
}
$report['assertions'] = $assertions;
$report['deprecations'] = array_keys($deprecations);
$report['status'] = $report['failures'] ? 'FAIL' : 'PASS';
file_put_contents($argv[2], json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");
echo json_encode(['status' => $report['status'], 'cases' => count($report['cases']),
    'failures' => $report['failures'], 'assertions' => $assertions, 'twig' => Twig\Environment::VERSION]) . "\n";
exit($report['failures'] ? 1 : 0);
