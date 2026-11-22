<?php
// Render the real outer layout on representative routes. Unrelated services and partials are fixtures.
require $argv[1];
$views = dirname(__DIR__) . '/resources/views/';
$page = file_get_contents($views . 'PageDesign/PageDesign.twig');
$partials = ['layout' => $page, 'empty' => ''];
preg_match_all('/(?:include|import)\s+"((?:Ceres|GuardiansBasicB2B)::[^"]+)"/', $page, $names);
foreach ($names[1] as $name) {
    $partials[$name] = str_starts_with($name, 'GuardiansBasicB2B::WishList.')
        ? file_get_contents($views . str_replace('.', '/', substr($name, strlen('GuardiansBasicB2B::'))) . '.twig')
        : '';
    $partials[$name . 'DE'] = '';
}
$partials['Ceres::PageDesign.Macros.IncludeComponents'] = '{% macro include_components() %}<!-- fixture:components -->{% endmacro %}';
$partials['Ceres::PageDesign.Macros.LayoutContainer'] = '{% macro show(name) %}{% if name == "Ceres::Script.Loader" %}<!-- fixture:loader -->{% endif %}{% endmacro %}';
$partials['Ceres::PageDesign.Macros.Translations'] = '{% macro add(plugin, name) %}{% endmacro %}';
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($partials));
// Named functions also compile on Twig 2 when tests run with PHP 8.4.
function fixtureEmpty() { return ''; }
function fixtureArray() { return []; }
function fixturePartial() { return 'empty'; }
function fixtureConfig($key) { return $key === 'IO.routing.category_wish-list' ? 713 : null; }
foreach (['createSeoPage', 'component', 'get_consent_scripts', 'trans', 'ssr_entry', 'get_json_data',
          'get_shop_builder_scripts', 'csrf_token', 'get_filtered_tags', 'plugin_path'] as $name) {
    $twig->addFunction(new Twig\TwigFunction($name, 'fixtureEmpty'));
}
foreach (['get_additional_styles', 'get_additional_scripts'] as $name) {
    $twig->addFunction(new Twig\TwigFunction($name, 'fixtureArray'));
}
$twig->addFunction(new Twig\TwigFunction('getPartial', 'fixturePartial'));
$twig->addFunction(new Twig\TwigFunction('config', 'fixtureConfig'));
$twig->addFilter(new Twig\TwigFilter('filterFields', 'fixtureArray'));
$cases = [
    'canonical' => ['tpl.wish-list', 0, false, false, true],
    'linked' => ['tpl.category.content', 713, false, false, true],
    'ordinary-content' => ['tpl.category.content', 999, true, false, false],
    'unset-category' => ['tpl.category.content', 0, true, false, false],
    'basket' => ['tpl.basket', 5482, false, false, false],
    'pdp' => ['tpl.item', 713, false, false, false],
    'quickview' => ['tpl.item', 713, true, true, false],
    'header-home' => ['tpl.home', 0, false, false, false],
];
$results = [];
foreach ($cases as $name => [$route, $id, $builder, $quick, $expected]) {
    $request = new class($quick) {
        public function __construct(private bool $quick) {}
        public function get($key) { return $key === 'quickViewItem' && $this->quick ? 100 : null; }
        public function getRequestUri() { return '/fixture/'; }
    };
    $template = new class($route) {
        private bool $cache = true;
        public function __construct(private string $route) {}
        public function getCurrentTemplate() { return $this->route; }
        public function isItem() { return $this->route === 'tpl.item'; }
        public function disableCacheForTemplate() { $this->cache = false; }
        public function shouldBeCached() { return $this->cache; }
    };
    $services = ['template' => $template, 'localizationRepository' => new class {
        public function getLanguage() { return 'de'; }
    }];
    $html = $twig->render('layout', ['request' => $request, 'services' => $services,
        'category' => ['id' => $id], 'isShopBuilder' => $builder, 'assetName' => 'ceres-base']);
    $count = substr_count($html, 'data-component="wish-list"');
    if ($count !== (int) $expected) throw new RuntimeException("Wrong override count on $name ($count)");
    if (str_contains($html, '/wish-list/check-stock') || str_contains($html, 'id="csrf-token"') || !$template->shouldBeCached()) {
        throw new RuntimeException("Wrong token, caching or stock check on $name");
    }
    if ($expected) {
        $offset = strpos($html, '<!-- SSR:template(wish-list) -->');
        foreach (['<!-- SSR:entry(', 'ceres-client.min.js', 'ceres-base.min.js', 'window.createApp("#vue-app")', 'vueApp.$mount('] as $entry) {
            if ($offset === false || strpos($html, $entry) === false || $offset >= strpos($html, $entry)) {
                throw new RuntimeException("Override out of order for $entry ($name)");
            }
        }
        if (!preg_match('~<!-- SSR:template\(wish-list\) -->\s*<script type="x/template" data-component="wish-list">(.*?)</script>\s*<!-- /SSR -->~s', $html, $m)) {
            throw new RuntimeException("Invalid SSR boundaries on $name");
        }
        if (!preg_match('~<!-- fixture:components -->(.*?)<!-- fixture:loader -->~s', $html, $block) ||
            trim($block[1]) !== $m[0] || substr_count($block[1], '<script') !== 1) {
            throw new RuntimeException("Expected only the inert Ceres template on $name");
        }
        $results['markup'] = trim($block[1]);
        $results['template'] = trim($m[1]);
    }
    $results['routes'][$name] = $count;
}
echo json_encode($results, JSON_THROW_ON_ERROR);
