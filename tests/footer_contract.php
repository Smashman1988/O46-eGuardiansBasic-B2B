<?php
// Real Twig 2/3 render; explicit local service doubles, no Plenty requests.
// php tests/footer_contract.php <autoload> <before Footer.twig> <report.json>
$notices = [];
set_error_handler(function ($level, $message, $file, $line) use (&$notices) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) { $notices[$message] = ['file' => $file, 'line' => $line]; return true; }
    throw new ErrorException($message, 0, $level, $file, $line);
});
require $argv[1];
class FooterFixture {
    public $language, $currency, $currencyReads = 0, $categoryCalls = [], $texts = [];
    function __construct($language, $currency) {
        $this->language = $language; $this->currency = $currency;
        foreach (file(dirname(__DIR__) . '/resources/lang/' . $language . '/Template.properties') as $line) {
            if (preg_match('/^([A-Za-z0-9_]+)\s*=\s*(.*)$/u', trim($line), $match)) $this->texts[$match[1]] = trim($match[2], "\"'");
        }
    }
    function getCurrencyData() { $this->currencyReads++; return ['name' => $this->currency, 'symbol' => $this->currency]; }
    function get($id, $language) { $this->categoryCalls[] = ['get', $id, $language]; return ['id' => $id, 'details' => [['name' => $language . ' category ' . $id]]]; }
    function getURL($category) { $this->categoryCalls[] = ['url', $category['id']]; return '/' . $this->language . '/category-' . $category['id']; }
    function getURLById($id) { $this->categoryCalls[] = ['urlById', $id]; return '/' . $this->language . '/category-' . $id; }
    function translate($key) { return $this->texts[substr($key, strrpos($key, '.') + 1)] ?? $key; }
    function pluginPath($name) { return '/plugins/' . $name; }
}
$before = file_get_contents($argv[2]);
$after = file_get_contents(dirname(__DIR__) . '/resources/views/PageDesign/Partials/Footer.twig');
$rows = [];
foreach (['de','en','fr','it','es'] as $language) foreach (['EUR','USD','CHF'] as $currency) {
    $pair = [];
    foreach (['before' => $before, 'after' => $after] as $stage => $source) {
        $fixture = new FooterFixture($language, $currency);
        $twig = new Twig\Environment(new Twig\Loader\ArrayLoader(['footer' => $source]), ['strict_variables' => true]);
        $twig->addFunction(new Twig\TwigFunction('trans', [$fixture, 'translate']));
        $twig->addFunction(new Twig\TwigFunction('plugin_path', [$fixture, 'pluginPath']));
        $html = $twig->render('footer', ['lang' => $language, 'services' => ['checkout' => $fixture, 'category' => $fixture]]);
        $pair[$stage] = ['html' => $html, 'bytes' => strlen($html), 'currencyReads' => $fixture->currencyReads, 'categoryCalls' => $fixture->categoryCalls];
    }
    if ($pair['after']['html'] !== $pair['before']['html']) {
        file_put_contents($argv[3] . '.failure.json', json_encode($pair, JSON_PRETTY_PRINT));
        throw new RuntimeException('Unexpected footer output change: ' . $language . '/' . $currency);
    }
    if ($pair['before']['currencyReads'] !== 1 || $pair['after']['currencyReads'] !== 0) throw new RuntimeException('Expected one unused currency getter removed');
    if ($pair['before']['categoryCalls'] !== $pair['after']['categoryCalls']) throw new RuntimeException('Category behavior changed');
    $rows[] = ['lang' => $language, 'currency' => $currency, 'before' => $pair['before'], 'after' => $pair['after'], 'status' => 'PASS'];
}
file_put_contents($argv[3], json_encode(['mode' => 'LOCAL_TWIG_CONTRACT', 'twig' => Twig\Environment::VERSION, 'rows' => $rows, 'legacyEngineDeprecations' => $notices], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo count($rows) . " footer cases PASS; currency getter 1 -> 0, category calls preserved.\n";
