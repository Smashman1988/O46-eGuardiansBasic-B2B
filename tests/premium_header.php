<?php
// php tests/premium_header.php <external-twig-autoload.php> <output-directory> [--baseline]
// Executes the real B2B Head/Header and language macros. Plenty/Ceres services are
// explicit local doubles: these renders are not a PlentyONE storefront acceptance.
require $argv[1];
$root = dirname(__DIR__);
$output = $argv[2];
$baseline = in_array('--baseline', $argv, true);
$baselineRef = '8eeb24f7732c2cb5558b2dbf148eb85182708f0d';
foreach ($argv as $argument) {
    if (strpos($argument, '--baseline=') === 0) {
        $baseline = true;
        $baselineRef = substr($argument, strlen('--baseline='));
        if (!preg_match('/^[a-f0-9]{7,40}$/', $baselineRef)) { throw new RuntimeException('Expected a Git commit ID'); }
    }
}
$notices = [];
set_error_handler(function ($level, $message) use (&$notices) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) { $notices[$message] = true; return true; }
    throw new ErrorException($message, 0, $level);
});
if (!is_dir($output)) { mkdir($output, 0777, true); }
function headerSource($file) {
    global $root, $baseline, $baselineRef;
    if (!$baseline) { return file_get_contents($root . '/' . $file); }
    $process = proc_open(['git', 'show', $baselineRef . ':' . $file], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $root);
    $text = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process)) { throw new RuntimeException($error); }
    return $text;
}
class HeaderCallback {
    private $callback;
    public function __construct($callback) { $this->callback = $callback; }
    public function invoke(...$args) { return ($this->callback)(...$args); }
}
class HeaderServices {
    public $language = 'de';
    public $currency = 'EUR';
    public $mode = 'home';
    public function getLanguage() { return $this->language; }
    public function getCurrencyData() { return ['name' => $this->currency, 'symbol' => $this->currency === 'EUR' ? '€' : '$']; }
    public function getBasketForTemplate() { return ['itemQuantity' => 12]; }
    public function getCurrentTemplate() { return 'tpl.' . $this->mode; }
    public function isCheckout() { return $this->mode === 'checkout'; }
    public function getURLById($id) { return ($this->language === 'de' ? '' : '/' . $this->language) . '/fixture-category/' . $id . '/'; }
    public function getCanonicalURL() { return 'http://localhost/'; }
    public function getLanguageURLs() { return []; }
    public function get($key) { return null; }
}
$templates = [];
foreach (['PageDesign/Partials/Head', 'PageDesign/Partials/Header/Header', 'Category/Macros/CategoryTreeDE', 'Category/Macros/CategoryTreeEN', 'Category/Macros/CategoryTreeFR', 'Category/Macros/CategoryTreeIT', 'Category/Macros/CategoryTreeES'] as $name) {
    $templates['GuardiansBasicB2B::' . str_replace('/', '.', $name) . '.twig'] = headerSource('resources/views/' . $name . '.twig');
}
$templates['container'] = '{% macro show(name) %}{% endmacro %}';
$templates['head'] = '{% import "container" as LayoutContainer %}{% include "GuardiansBasicB2B::PageDesign.Partials.Head.twig" %}';
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['autoescape' => 'html', 'cache' => false]);
$twig->addFunction(new Twig\TwigFunction('plugin_path', [new HeaderCallback(function ($plugin) { return $plugin === 'GuardiansBasicB2B' ? '/resources' : '/fixture-ceres'; }), 'invoke']));
$translations = [];
$twig->addFunction(new Twig\TwigFunction('trans', [new HeaderCallback(function ($key) use (&$translations) {
    $short = substr($key, strlen('GuardiansBasicB2B::Template.'));
    if (!isset($translations[$short])) { throw new RuntimeException('Missing header translation: ' . $key); }
    return $translations[$short];
}), 'invoke']));
$twig->addFilter(new Twig\TwigFilter('int', 'intval'));
$services = new HeaderServices();
$twig->addGlobal('services', array_fill_keys(['localizationRepository', 'checkout', 'basket', 'category', 'template', 'url'], $services));
$twig->addGlobal('request', $services);
$cases = [];
// The unchanged production bundles' scroll handler requires the real footer control.
preg_match('~<button onclick="topFunction\(\)"[^>]*id="totop"[^>]*>.*?</button>~s', headerSource('resources/views/PageDesign/Partials/Footer.twig'), $footerMatch);
if (!$footerMatch) { throw new RuntimeException('Missing production back-to-top control'); }
$footerButton = $footerMatch[0];
foreach (['de', 'en', 'fr', 'it', 'es'] as $language) {
    $services->language = $language;
    preg_match_all('/^([^#\s][^=]*?)\s*=\s*(.*)$/mu', headerSource('resources/lang/' . $language . '/Template.properties'), $matches, PREG_SET_ORDER);
    $translations = [];
    foreach ($matches as $match) { $translations[trim($match[1])] = trim($match[2]); }
    foreach (['home', 'category', 'item', 'checkout', 'vue-category'] as $mode) {
        $services->mode = $mode;
        foreach (['EUR', 'USD'] as $currency) {
            $services->currency = $currency;
            $context = ['category' => ['id' => $mode === 'category' ? 52 : ($mode === 'vue-category' ? 5482 : 0)], 'vuejs' => [5482, 5041, 5484, 5171], 'categories' => [], 'isQuickView' => true, 'isItem' => $mode === 'item', 'isVueView' => $mode === 'checkout', 'buildHash' => 'local-header-test'];
            $head = $twig->render('head', $context);
            // Keep production style ordering, while suppressing external DNS hints.
            $head = preg_replace('~<link rel="(?:dns-prefetch|preconnect)"[^>]*>~', '', $head);
            if ($baseline) { $head = str_replace('/resources/css/main-211025.min.css', '/before-main.css', $head); }
            $header = $twig->render('GuardiansBasicB2B::PageDesign.Partials.Header.Header.twig', $context);
            $name = "$language-$mode-$currency";
            $script = ['home' => 'main', 'category' => 'cat', 'item' => 'item', 'checkout' => 'main', 'vue-category' => 'vue'][$mode];
            $html = '<!doctype html><html lang="' . $language . '"><head>' . $head . '</head><body><div class="main">' . $header . '<main style="height:1800px;padding:30px"><h1>Outlet46 B2B · local header preview</h1><p>Real Twig and production assets; PlentyONE services are test doubles.</p></main></div><div class="modal dynamicModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h2 class="modal-title"></h2><button data-dismiss="modal">Close fixture</button></div><div class="modal-body"></div></div></div></div><script>window.messageServiceTranslations = {searchexample: "Search"}; window.activeLang = "' . $language . '";</script><script src="/resources/js/jquery-3.7.1.min.js"></script><script src="/resources/js/' . $script . '-020726.min.js"></script><script>eGuardians.events.bindEvents();</script></body></html>';
            $html = str_replace('<div class="modal dynamicModal"', $footerButton . '<div class="modal dynamicModal"', $html);
            file_put_contents($output . '/' . $name . '.html', $html);
            $cases[] = $name;
        }
    }
}
if ($baseline) { file_put_contents($output . '/before-main.css', headerSource('resources/css/main-211025.min.css')); }
file_put_contents($output . '/render-report.json', json_encode(['cases' => $cases, 'passed' => count($cases), 'twig' => Twig\Environment::VERSION, 'deprecations' => array_keys($notices), 'plentyONE' => 'NOT_RUN'], JSON_PRETTY_PRINT));
echo count($cases) . " actual-template renders PASS; PlentyONE NOT_RUN\n";
