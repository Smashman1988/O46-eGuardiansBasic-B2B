<?php
// php tests/card_attributes.php <Twig autoloader> <report.json>
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class VariationAttributeMap {
        public static function getSearchFactory($options) {
            if (array_keys($options) !== ['itemId','afterKey'] || $options['afterKey'] !== null) {
                throw new \RuntimeException('Changed attribute search options');
            }
            return $options;
        }
    }
}
namespace {
// Twig 2 on PHP 8.4 cannot compile a closure name as a PHP expression.
class CardCallback {
    private $fn;
    public function __construct($fn) { $this->fn = $fn; }
    public function invoke(...$args) { return ($this->fn)(...$args); }
}
function callback($fn) { return [new CardCallback($fn),'invoke']; }
require $argv[1];
require __DIR__ . '/../src/Extensions/Base_Extension.php';
function check($ok, $msg) { if (!$ok) { throw new \RuntimeException($msg); } }
function pluginApp($class, $params = []) {
    global $service;
    if ($class === \UnexpectedValueException::class) { return new \UnexpectedValueException($params['message']); }
    check($class === \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService::class, $class);
    return $service;
}
class AttributeService {
    public $batches = [], $singles = [], $omit = false, $lang = 'de';
    private function result($id) {
        $values = [['position'=>2,'name'=>$this->lang . '-L-' . $id], ['position'=>1,'name'=>$this->lang . '-M-' . $id]];
        $attributes = [['type'=>'image','values'=>[['position'=>1,'name'=>'blue']]]];
        if ($id % 3 === 1) { $attributes[] = ['type'=>'box','values'=>$values]; }
        if ($id % 3 === 2) { $attributes = []; }
        return ['attributes'=>$attributes, 'documents'=>[['id'=>$id]]];
    }
    public function getResult($factory) {
        $this->singles[] = $factory['itemId'];
        return $this->result($factory['itemId']);
    }
    public function getResults($factories) {
        $ids = array_column($factories,'itemId');
        $this->batches[] = $ids;
        $results = [];
        // The documented contract keys results by factory name, independently of order.
        foreach (array_reverse($factories, true) as $key=>$factory) {
            if (!$this->omit) { $results[$key] = $this->result($factory['itemId']); }
        }
        return $results;
    }
}
$service = new AttributeService();
$ext = (new \ReflectionClass(\GuardiansBasicB2B\Extensions\Base_Extension::class))->newInstanceWithoutConstructor();
$view = dirname(__DIR__) . '/resources/views/Category/Item/';
$prefix = 'GuardiansBasicB2B::Category.Item.Partials.';
$templates = ['layout'=>'{% block PageBody %}{% endblock %}', 'category'=>file_get_contents($view.'CategoryItem.twig'),
    'content'=>file_get_contents($view.'CategoryItemContent.twig'), 'simple'=>file_get_contents($view.'Partials/CategoryGridOnly.twig')];
foreach (['CategoryListItem','CategoryListItem2','CategoryAttributes'] as $name) {
    $templates[$prefix.$name] = file_get_contents($view.'Partials/'.$name.'.twig');
}
foreach (['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName',
    'GuardiansBasicB2B::Category.Macros.render-rating',$prefix.'Pagination',$prefix.'FacetFilter2',$prefix.'FacetFilter3'] as $name) {
    $templates[$name] = '';
}
$twig = new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates));
foreach (['config','plugin_path','queryString','createSeoPage'] as $name) {
    $twig->addFunction(new \Twig\TwigFunction($name, callback(function () { return ''; })));
}
$twig->addFunction(new \Twig\TwigFunction('getPartial', callback(function () { return 'layout'; })));
$twig->addFunction(new \Twig\TwigFunction('trans', callback(function ($key) { return $key; })));
$twig->addFunction(new \Twig\TwigFunction('getAttributesWithImages', [$ext,'getAttributesWithImages']));
$batch = false;
$twig->addFunction(new \Twig\TwigFunction('getCardAttributeMaps', callback(function ($ids) use ($ext,&$batch) {
    return $batch ? $ext->getCardAttributeMaps($ids) : [];
})));
$twig->addFilter(new \Twig\TwigFilter('itemURL', callback(function ($data) { return '/product/'.($data['variation']['itemId'] ?? ''); })));
$twig->addFilter(new \Twig\TwigFilter('itemName', callback(function ($data) { return 'Product '.($data['variation']['itemId'] ?? ''); })));
$twig->addFilter(new \Twig\TwigFilter('orderByKey', callback(function ($rows,$key) {
    usort($rows,function ($a,$b) use ($key) { return $a[$key] <=> $b[$key]; }); return $rows;
})));
$report = [];
foreach (['category','content','simple'] as $template) {
    foreach ([1,2] as $page) {
        foreach ([0,1,12,24,48,'duplicates'] as $n) {
            $ids = $n === 'duplicates' ? [100,101,102,100] : ($n ? range(100,99+$n) : []);
            $items = [];
            foreach ($ids as $id) {
                $items[] = ['data'=>['variation'=>['id'=>10000+$id,'itemId'=>$id],'item'=>['id'=>$id],
                    'images'=>['all'=>[]], 'prices'=>['default'=>['unitPrice'=>['value'=>5,'formatted'=>'5 EUR']]]]];
            }
            $ctx = ['itemList'=>$items,'currentPage'=>$page,'itemCountTotal'=>count($ids),'category'=>['id'=>100]];
            foreach ([false,true] as $batch) {
                $service->batches = $service->singles = [];
                $html = $twig->render($template,$ctx);
                if (!$batch) {
                    check($service->singles === $ids && !$service->batches,'Single-card reference');
                    $reference = $html;
                    continue;
                }
                check($html === $reference,'Different markup in '.$template);
                check(substr_count($html,'data-eg-item="') === count($ids),'Rendered card count');
                if ($ids) {
                    check(strpos($html,'de-M-100') < strpos($html,'de-L-100') && strpos($html,'de-M-100') !== false,'Size order');
                    check(strpos($html,'5 EUR') !== false && strpos($html,'/product/100') !== false,'Price or product link');
                }
                if (count($ids) > 1) {
                    check(strpos($html,'Template.availsizeonesize') !== false,'Missing translated one-size fallback');
                    check(strpos($html,'>blue</span>') === false,'Image or color attribute displayed as a size');
                }
                check(!$service->singles && $service->batches === array_chunk(array_unique($ids),24),'Unexpected calls');
                $report[] = ['template'=>$template,'page'=>$page,'cards'=>count($ids),'before'=>count($ids),
                    'after'=>count($service->batches),'factories'=>count(array_unique($ids)),'sha256'=>hash('sha256',$html)];
            }
        }
    }
}
$service->lang = 'it';
check($ext->getCardAttributeMaps([100])[100]['attributes'][1]['values'][0]['name'] === 'it-L-100','Leaked another render language');
$service->omit = true;
try { $ext->getCardAttributeMaps([100]); throw new \RuntimeException('Missing map silently accepted'); }
catch (\UnexpectedValueException $expected) { check(strpos($expected->getMessage(),'100') !== false,'Wrong missing key'); }
file_put_contents($argv[2],json_encode(['renders'=>$report,'contextIsolation'=>true,'missingResult'=>true],JSON_PRETTY_PRINT));
echo count($report) . " matching renders, language isolation and missing-result check passed.\n";
}
