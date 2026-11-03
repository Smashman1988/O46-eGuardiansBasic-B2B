<?php
// php tests/contact_widget.php <external-twig-autoload.php> <output-directory>
// Real B2B templates; unrelated Plenty services/templates are explicitly local fixtures.
if (count($argv) !== 3) { throw new RuntimeException('Expected external Twig autoloader and output directory'); }
$notices = [];
set_error_handler(function ($level, $message) use (&$notices) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) { $notices[$message] = true; return true; }
    throw new ErrorException($message, 0, $level);
});
require $argv[1];
$root = dirname(__DIR__);
$output = $argv[2];
if (!is_dir($output) && !mkdir($output, 0777, true)) { throw new RuntimeException('Cannot create output directory'); }
$resources = htmlspecialchars('file:///' . str_replace(['\\', ' '], ['/', '%20'], $root) . '/resources', ENT_QUOTES, 'UTF-8');
function check($ok, $message) { if (!$ok) { throw new RuntimeException($message); } }
class ContactCallback {
    private $callback;
    public function __construct($callback) { $this->callback = $callback; }
    public function invoke(...$arguments) { return ($this->callback)(...$arguments); }
}
class ContactRequest {
    public $quick = false;
    public $uri = '/';
    public function get($key) { return $key === 'quickViewItem' && $this->quick ? 'true' : null; }
    public function getRequestUri() { return $this->uri; }
}
class ContactTemplateService {
    public $template;
    public function __construct($template) { $this->template = $template; }
    public function getCurrentTemplate() { return $this->template; }
    public function isItem() { return $this->template === 'tpl.item'; }
    public function isCheckout() { return $this->template === 'tpl.checkout'; }
    public function isCategory() { return $this->template === 'tpl.category.item'; }
    public function isSearch() { return $this->template === 'tpl.search'; }
    public function isMyAccount() { return $this->template === 'tpl.my-account'; }
    public function shouldBeCached() { return false; }
    public function isCheapestSorting() { return false; }
}
class ContactEmptyService {
    public function __call($name, $arguments) { return null; }
}
$layout = file_get_contents($root . '/resources/views/PageDesign/PageDesign.twig');
$componentName = 'GuardiansBasicB2B::PageDesign.Components.ContactWidget';
$component = file_get_contents($root . '/resources/views/PageDesign/Components/ContactWidget.twig');
$templates = ['layout' => $layout, $componentName => $component, 'fixture-partial' => ''];
preg_match_all('/\{%\s*(?:include|import)\s+"([^"]+)"/', $layout, $includes);
foreach ($includes[1] as $name) {
    if ($name !== $componentName) { $templates[$name] = ''; }
}
foreach (['DE', 'EN', 'FR', 'IT', 'ES'] as $suffix) {
    $templates['GuardiansBasicB2B::PageDesign.Components.nl-element' . $suffix] = '';
    $templates['GuardiansBasicB2B::PageDesign.Components.b2babfrage' . $suffix] = '';
}
$templates['Ceres::PageDesign.Macros.LayoutContainer'] = '{% macro show(name) %}{% endmacro %}';
$templates['Ceres::PageDesign.Macros.IncludeComponents'] = '{% macro include_components() %}{% endmacro %}';
$templates['Ceres::PageDesign.Macros.Translations'] = '{% macro add(plugin, file) %}{% endmacro %}';
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['cache' => false, 'autoescape' => 'html']);
function twigFunction($twig, $name, $callback) {
    $twig->addFunction(new Twig\TwigFunction($name, [new ContactCallback($callback), 'invoke']));
}
foreach (['get_consent_scripts', 'get_filtered_tags', 'get_json_data', 'get_shop_builder_scripts', 'component', 'ssr_entry', 'csrf_token'] as $name) {
    twigFunction($twig, $name, function () { return ''; });
}
foreach (['get_additional_styles', 'get_additional_scripts'] as $name) {
    twigFunction($twig, $name, function () { return []; });
}
twigFunction($twig, 'getPartial', function () { return 'fixture-partial'; });
twigFunction($twig, 'config', function () { return ''; });
twigFunction($twig, 'plugin_path', function ($plugin) { return '/fixture-plugins/' . $plugin; });
$twig->addFilter(new Twig\TwigFilter('filterFields', [new ContactCallback(function ($value) { return $value; }), 'invoke']));
$translations = [];
twigFunction($twig, 'trans', function ($key) use (&$translations) {
    $short = substr($key, strlen('GuardiansBasicB2B::Template.'));
    if (strpos($short, 'o46B2bContact') === 0) {
        check(isset($translations[$short]), 'Missing widget translation: ' . $key);
        return $translations[$short];
    }
    return $key;
});
$pages = ['home', 'category.item', 'item', 'search', 'basket', 'my-account', 'checkout', 'amazon', 'shopbuilder'];
$cases = [];
$keySet = null;
$head = file_get_contents($root . '/resources/views/PageDesign/Partials/Head.twig');
preg_match_all('~<style[^>]*>(.*?)</style>~s', $head, $criticalStyles);
$modes = ['isolated', 'theme', 'category', 'item', 'checkout'];
foreach (['de', 'en', 'fr', 'it', 'es'] as $language) {
    preg_match_all('/^(o46B2bContact\w+)\s*=\s*(.+)$/mu', file_get_contents($root . '/resources/lang/' . $language . '/Template.properties'), $matches, PREG_SET_ORDER);
    $translations = [];
    foreach ($matches as $match) {
        check(!isset($translations[$match[1]]), 'Duplicate widget key');
        $translations[$match[1]] = trim($match[2]);
    }
    check(count($translations) === 9, 'Expected nine widget keys per language');
    $keys = array_keys($translations); sort($keys);
    check($keySet === null || $keys === $keySet, 'Widget translation keys differ between languages');
    $keySet = $keys;
    $html = $twig->render($componentName);
    check(strpos($html, 'https://whatsapp.com/channel/0029VbDashBBPzjbqTzmQb3m') !== false, 'Wrong WhatsApp channel');
    check(strpos($html, 'mailto:b2b@outlet46.de') !== false, 'Wrong email');
    check(stripos($html, 'telegram') === false, 'Unexpected messenger');
    foreach ($modes as $mode) {
        $criticalIndex = $mode === 'item' ? 0 : ($mode === 'category' ? 1 : 2);
        $themeCss = $mode === 'isolated' ? '' : '<style>' . $criticalStyles[1][$criticalIndex] . '</style>';
        if ($mode === 'checkout') { $themeCss .= '<link rel="stylesheet" href="' . $resources . '/css/checkout-120525.min.css">'; }
        if ($mode !== 'isolated') { $themeCss .= '<link rel="stylesheet" href="' . $resources . '/css/main-211025.min.css">'; }
        $preview = '<!doctype html><html lang="' . $language . '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">' . $themeCss
            . '<style>body{margin:0;font:16px Arial,sans-serif;background:#f6f7f3;color:#20251b}#contact-fixture-shop{padding:32px;max-width:960px}#contact-fixture-shop h1{font-size:28px}#contact-fixture-shop p{max-width:580px}#contact-fixture-outside{padding:12px}#totop{display:block;position:fixed;right:15px;bottom:3.3rem;height:44px;width:44px;z-index:101}#contact-fixture-overlay{display:none;position:fixed;inset:0;z-index:1050;background:white}</style>'
            . '<link rel="stylesheet" href="' . $resources . '/css/contact-widget.css"></head><body class="o46-b2b-contact-page"><main id="contact-fixture-shop"><p>Outlet46 B2B · Lokale Komponentenvorschau</p><h1>Kontakt &amp; Beratung</h1><p>Isolierte Vorschau mit lokalen Theme-Ressourcen. Kein PlentyONE-Shop und keine echte Bestellung.</p><button id="contact-fixture-outside" type="button">Shop-Aktion</button></main><button id="totop" type="button" aria-label="Nach oben">↑</button>'
            . $html . '<div id="contact-fixture-overlay">Shop-Dialog</div><script src="' . $resources . '/js/contact-widget.js" defer></script></body></html>';
        file_put_contents($output . '/preview-' . $language . '-' . $mode . '.html', $preview);
    }
    foreach (array_merge($pages, ['quickview']) as $page) {
        $request = new ContactRequest();
        $request->quick = $page === 'quickview';
        $request->uri = $page === 'amazon' ? '/amazon/expressCheckoutReview' : '/';
        $context = ['request' => $request, 'lang' => $language, 'buildHash' => 'local-review',
            'isShopBuilder' => $page === 'shopbuilder', 'assetName' => $page === 'checkout' ? 'ceres-checkout' : 'ceres-app',
            'category' => ['id' => $page === 'category.item' ? 42 : null],
            'webstoreConfig' => ['defaultLanguage' => 'de'], 'ceresConfig' => [],
            'context' => new ContactEmptyService(), 'services' => [
                'template' => new ContactTemplateService('tpl.' . $page),
                'localizationRepository' => new class($language) {
                    private $language;
                    public function __construct($language) { $this->language = $language; }
                    public function getLanguage() { return $this->language; }
                },
                'checkout' => new ContactEmptyService(), 'propertyFile' => new ContactEmptyService(),
                'order' => new ContactEmptyService(), 'country' => new ContactEmptyService(),
            ]];
        $rendered = $twig->render('layout', $context);
        $expected = $request->quick ? 0 : 1;
        check(substr_count($rendered, 'id="o46-b2b-contact-widget"') === $expected, 'Wrong widget count: ' . $page);
        foreach (['css/contact-widget.css', 'js/contact-widget.js'] as $resource) {
            check(substr_count($rendered, '/fixture-plugins/GuardiansBasicB2B/' . $resource . '?v=local-review') === $expected, 'Wrong dynamic asset inclusion: ' . $page);
        }
        if (!$request->quick) {
            $dom = new DOMDocument();
            $previous = libxml_use_internal_errors(true);
            $dom->loadHTML('<?xml encoding="UTF-8">' . $rendered);
            libxml_clear_errors();
            libxml_use_internal_errors($previous);
            $xpath = new DOMXPath($dom);
            check($xpath->query('//*[@id="vue-app"]//*[@id="o46-b2b-contact-widget"]')->length === 0, 'Widget must live outside Vue');
        }
        $cases[] = $language . '/' . $page;
    }
}
$report = ['twig' => Twig\Environment::VERSION, 'layoutCases' => count($cases), 'cases' => $cases,
    'languages' => 5, 'widgetKeysPerLanguage' => 9, 'previewFiles' => count($modes) * 5, 'deprecations' => array_keys($notices),
    'plentyONE' => 'NOT_RUN: local service/template fixtures only'];
file_put_contents($output . '/render-report.json', json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
