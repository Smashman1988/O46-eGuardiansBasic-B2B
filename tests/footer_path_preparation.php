<?php
// Local full-footer equivalence and actual Twig function-call counts.
// php tests/footer_path_preparation.php <Twig autoload> <before Footer.twig> <report.json>
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);

class FooterPathFixture
{
    public $calls = 0, $categoryCalls = [], $texts = [], $language, $base;
    function __construct($language, $base)
    {
        $this->language = $language;
        $this->base = $base;
        foreach (file(__DIR__.'/../resources/lang/'.$language.'/Template.properties') as $line) {
            if (preg_match('/^([A-Za-z0-9_]+)\s*=\s*(.*)$/u', trim($line), $match)) {
                $this->texts[$match[1]] = trim($match[2], "\"'");
            }
        }
    }
    function pluginPath($name) { $this->calls++; return $this->base.'/'.$name; }
    function translate($key) { return $this->texts[substr($key, strrpos($key, '.') + 1)] ?? $key; }
    function get($id, $lang) { $this->categoryCalls[] = ['get', $id, $lang]; return ['id'=>$id, 'details'=>[['name'=>$lang.' category "'.$id.'" & more']]]; }
    function getURL($category) { $this->categoryCalls[] = ['url', $category['id']]; return '/'.$this->language.'/category-'.$category['id']; }
    function getURLById($id) { $this->categoryCalls[] = ['urlById', $id]; return '/'.$this->language.'/category-'.$id; }
}

$before = file_get_contents($argv[2]);
$after = file_get_contents(__DIR__.'/../resources/views/PageDesign/Partials/Footer.twig');
$rows = [];
foreach (['de','en','fr','it','es'] as $language) {
    // Distinct pluginsets and a path requiring HTML escaping; no cross-render cache.
    foreach (['/plugins/426', '/plugins/427', 'https://cdn.example.test/p/991', '/plugins/a&b'] as $base) {
        $pair = [];
        foreach (['before'=>$before, 'after'=>$after] as $stage=>$source) {
            $fixture = new FooterPathFixture($language, $base);
            $twig = new Twig\Environment(new Twig\Loader\ArrayLoader(['footer'=>$source]), ['strict_variables'=>true]);
            $twig->addFunction(new Twig\TwigFunction('trans', [$fixture, 'translate']));
            $twig->addFunction(new Twig\TwigFunction('plugin_path', [$fixture, 'pluginPath']));
            $html = $twig->render('footer', ['lang'=>$language, 'services'=>['category'=>$fixture], 'footerAssetPath'=>'/unrelated-context']);
            $pair[$stage] = ['html'=>$html, 'calls'=>$fixture->calls, 'categoryCalls'=>$fixture->categoryCalls];
        }
        if ($pair['before']['html'] !== $pair['after']['html']) throw new RuntimeException('Footer HTML changed: '.$language.'/'.$base);
        if ($pair['before']['categoryCalls'] !== $pair['after']['categoryCalls']) throw new RuntimeException('Footer category calls changed');
        if ($pair['before']['calls'] !== 15 || $pair['after']['calls'] !== 1) throw new RuntimeException('Unexpected plugin path call count');
        $rows[] = ['language'=>$language, 'base'=>$base, 'bytes'=>strlen($pair['after']['html']), 'pluginPathBefore'=>15, 'pluginPathAfter'=>1, 'htmlIdentical'=>true, 'categoryCallsIdentical'=>true];
    }
}
file_put_contents($argv[3], json_encode(['twig'=>Twig\Environment::VERSION, 'status'=>'PASS', 'cases'=>count($rows), 'rows'=>$rows], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo count($rows)." footer renders PASS; plugin_path 15 -> 1, HTML and category calls identical.\n";
