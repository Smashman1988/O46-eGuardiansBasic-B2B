<?php
// php tests/homepage_category.php <Twig autoloader> <before-template-dir> <report.json>
// Real theme helper and Twig; explicit dependency fixtures, never native timings.
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Plugin\Templates\Factories { class TwigFactory {} }
namespace Plenty\Plugin\Http {
    class Request { public $params = []; public function get($key, $default = null) { return $this->params[$key] ?? $default; } }
}
namespace Plenty\Plugin\Templates {
    class Twig {
        public $environment, $calls = [];
        public function render($name, $params = []) { $this->calls[] = [$name, $params]; return $this->environment->render($name, $params); }
    }
}
namespace Ceres\Helper {
    class SearchOptions {
        const SCOPE_CATEGORY = 'category';
        public static function validateItemListOptions($options, $scope) {
            if ($options['itemsPerPage'] < 1) { throw new \InvalidArgumentException('Invalid page size'); }
            return $options;
        }
    }
}
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class CategoryItems { public static function getSearchFactory($options) { return ['category' => $options]; } }
    class VariationAttributeMap { public static function getSearchFactory($options) { return ['attribute' => $options]; } }
}
namespace Plenty\Modules\Webshop\ItemSearch\Services {
    class ItemSearchService {
        public $documents = [], $calls = [], $fail = false, $omit = false;
        public function getResults($factories) {
            if ($this->fail) { throw new \RuntimeException('Search unavailable'); }
            $this->calls[] = $factories;
            if (isset($factories['itemList'])) { return ['itemList' => ['documents' => $this->documents]]; }
            $out = [];
            foreach (array_reverse($factories, true) as $key => $factory) {
                if ($this->omit) { continue; }
                $id = $factory['attribute']['itemId'];
                $out[$key] = ['attributes' => $id % 3 ? [['type'=>'box','values'=>[['position'=>2,'name'=>'L'],['position'=>1,'name'=>'M']]]] : []];
            }
            return $out;
        }
        public function getResult($factory) { throw new \RuntimeException('Unexpected per-card search'); }
    }
}
namespace {
require $argv[1];
require __DIR__.'/card_markup_contract.php';
require dirname(__DIR__) . '/src/Extensions/Base_Extension.php';
$deprecations = [];
set_error_handler(function ($level, $message, $file, $line) use (&$deprecations) {
    if (in_array($level, [E_DEPRECATED,E_USER_DEPRECATED], true)) { $deprecations[$message] = ['file'=>$file,'line'=>$line]; return true; }
    throw new \ErrorException($message, 0, $level, $file, $line);
});
class HomepageCallback {
    private $fn;
    public function __construct($fn) { $this->fn = $fn; }
    public function invoke(...$args) { return ($this->fn)(...$args); }
}
function callback($fn) { return [new HomepageCallback($fn),'invoke']; }
function pluginApp($class, $params = []) {
    if ($class === \UnexpectedValueException::class) { return new \UnexpectedValueException($params['message']); }
    if ($class !== \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService::class) { throw new \RuntimeException('Unexpected service ' . $class); }
    return $GLOBALS['activeSearch'];
}
$assertions = 0;
function check($condition, $message) { $GLOBALS['assertions']++; if (!$condition) { throw new \RuntimeException($message); } }
class CheckoutFixture {
    public $reads = 0, $currency;
    public function __construct($currency) { $this->currency = $currency; }
    public function getCurrencyData() { $this->reads++; return ['name'=>$this->currency]; }
}
function build($version, $language, $currency, $ids, $query) {
    $root = dirname(__DIR__); $partial = 'GuardiansBasicB2B::Category.Item.Partials.';
    $templates = [];
    foreach (['CategoryGridOnly','CategoryListItem','CategoryAttributes'] as $name) {
        $path = $version === 'before' && $name !== 'CategoryAttributes' ? $GLOBALS['argv'][2].'/'.$name.'.twig' : $root.'/resources/views/Category/Item/Partials/'.$name.'.twig';
        $templates[$partial.$name] = file_get_contents($path);
    }
    $templates['GuardiansBasicB2B::Category.Macros.render-rating'] = file_get_contents($root.'/resources/views/Category/Macros/render-rating.twig');
    $templates['Ceres::PageDesign.Macros.LayoutContainer'] = '';
    $templates['Ceres::PageDesign.Macros.ItemName'] = '';
    $search = new \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService();
    foreach ($ids as $i=>$id) {
        $search->documents[] = ['data'=>[
            'item'=>['id'=>$id,'flagTwo'=>0,'manufacturer'=>['name'=>'Brand '.$id,'logo'=>[$i%3===0?'':'https://cdn02.outlet46.de/frontend/vendor/logo-'.$id.'.svg','https://other.example/brand-'.$id.'.png'][$i%2]],'feedbackCount'=>$i%2,'feedbackDecimal'=>4.3],
            'variation'=>['id'=>$id+10000,'itemId'=>$id],
            'images'=>['all'=>[['urlPreview'=>'/images/'.$id.'.jpg']]],
            'tags'=>[['id'=>$i%2 ? 284 : 5]],
            'prices'=>['default'=>['unitPrice'=>['value'=>5.123456,'formatted'=>'5,12 '.$currency]],'rrp'=>['unitPrice'=>['value'=>10,'formatted'=>'10,00 '.$currency]]]
        ]];
    }
    $request = new \Plenty\Plugin\Http\Request(); $request->params = $query;
    $renderer = new \Plenty\Plugin\Templates\Twig();
    $renderer->environment = new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates));
    $extension = new \GuardiansBasicB2B\Extensions\Base_Extension(new \Plenty\Plugin\Templates\Factories\TwigFactory(), $renderer, $request);
    $twig = $renderer->environment; $calls = (object)['pluginPath'=>0,'translations'=>0]; $checkout = new CheckoutFixture($currency);
    $twig->addGlobal('services',['checkout'=>$checkout]);
    $twig->addFunction(new \Twig\TwigFunction('getCardAttributeMaps',[$extension,'getCardAttributeMaps']));
    $twig->addFunction(new \Twig\TwigFunction('getAttributesWithImages',[$extension,'getAttributesWithImages']));
    $twig->addFunction(new \Twig\TwigFunction('trans',callback(function ($key) use ($language,$calls) { $calls->translations++; return $language.':'.$key; })));
    $twig->addFunction(new \Twig\TwigFunction('plugin_path',callback(function ($plugin) use ($calls) { check($plugin==='GuardiansBasicB2B','Unexpected plugin'); $calls->pluginPath++; return '/plugins/426/guardiansbasicb2b'; })));
    $twig->addFilter(new \Twig\TwigFilter('itemURL',callback(function ($data) use ($language) { return ($language==='de'?'':'/'.$language).'/product/'.$data['item']['id'].'/'; })));
    $twig->addFilter(new \Twig\TwigFilter('itemName',callback(function ($data) use ($language) { return $language.' Product '.$data['item']['id'].' & details'; })));
    $twig->addFilter(new \Twig\TwigFilter('orderByKey',callback(function ($rows,$key) { usort($rows,function($a,$b)use($key){return $a[$key]<=>$b[$key];}); return $rows; })));
    return compact('extension','renderer','search','request','calls','checkout');
}
function render(&$fixture, $size=60) {
    $GLOBALS['activeSearch'] = $fixture['search'];
    $fixture['search']->calls = $fixture['renderer']->calls = [];
    $fixture['calls']->pluginPath = $fixture['calls']->translations = $fixture['checkout']->reads = 0;
    return $fixture['extension']->getItemsFromCatSimple(60,$size,[8855]);
}
$rows = [];
foreach (['de','en','fr','it','es'] as $language) foreach (['EUR','USD'] as $currency) foreach ([0,1,24,60,'duplicates'] as $n) foreach ([[],['priceMin'=>9,'priceMax'=>2,'page'=>7,'sorting'=>'texts.name1_asc','facets'=>'123']] as $query) {
    $ids = $n === 'duplicates' ? [100,101,100,102] : ($n ? range(100,99+$n) : []);
    $before = build('before',$language,$currency,$ids,$query); $after = build('after',$language,$currency,$ids,$query);
    $old = render($before); $new = render($after);
    if (cardMarkupContract($old, true) !== cardMarkupContract($new)) {
        file_put_contents(dirname($argv[3]).'/mismatch-before.html',$old);
        file_put_contents(dirname($argv[3]).'/mismatch-after.html',$new);
    }
    check(cardMarkupContract($old, true)===cardMarkupContract($new),'Card content/attribute contract differs '.$language.'/'.$currency.'/'.$n);
    check($before['search']->calls===$after['search']->calls,'Search arguments/order differ');
    check($before['renderer']->calls===$after['renderer']->calls,'Render context differs');
    check(count($after['search']->calls)===1+(int)ceil(count(array_unique($ids))/24),'Wrong batch count');
    check($after['search']->calls[0]['itemList']['category'] === ['page'=>1,'itemsPerPage'=>60,'sorting'=>'variation.createdAt_desc','facets'=>[8855],'categoryId'=>60,'priceMin'=>$query?2.0:0.0,'priceMax'=>$query?9.0:0.0],'Parameter contract changed');
    check($before['calls']->pluginPath===count($ids),'Wrong baseline plugin path count');
    check($after['calls']->pluginPath===($ids?1:0),'Wrong reused plugin path count');
    check($after['calls']->translations===5 && $before['calls']->translations===7,'Unexpected card translation preparation');
    check($after['checkout']->reads===1 && $before['checkout']->reads===1,'Currency read changed');
    check(substr_count($new,'data-eg-item="')===count($ids),'Card count differs');
    $rows[] = ['language'=>$language,'currency'=>$currency,'cards'=>count($ids),'ids'=>$ids,'query'=>$query,'htmlBytes'=>strlen($new),'cardMarkupContractEqual'=>true,'sha256'=>hash('sha256',$new),'serviceCalls'=>count($after['search']->calls),'attributeFactories'=>count(array_unique($ids)),'pluginPathBefore'=>$before['calls']->pluginPath,'pluginPathAfter'=>$after['calls']->pluginPath,'currencyReads'=>1,'translations'=>$after['calls']->translations];
}
// CategoryListItem still works outside the simple grid, without its prepared path.
$standalone = [];
foreach (['de','en','fr','it','es'] as $language) foreach (['EUR','USD'] as $currency) {
    $html=[];
    foreach (['before','after'] as $version) {
        $fixture=build($version,$language,$currency,[101],[]); $GLOBALS['activeSearch']=$fixture['search'];
        $ctx=['item'=>$fixture['search']->documents[0],'cardAttributeMap'=>['attributes'=>[]],'currencycheck'=>$currency,'translations'=>['tSustainability'=>'s','tAvailSizes'=>'sizes','tStatt'=>'rrp','tInBasket'=>'basket'],'transLabels'=>['availsizeonesize'=>'onesize']];
        $html[$version]=$fixture['renderer']->environment->render('GuardiansBasicB2B::Category.Item.Partials.CategoryListItem',$ctx);
        check($fixture['calls']->pluginPath===1,'Standalone fallback lookup changed');
    }
    check(cardMarkupContract($html['before'], true)===cardMarkupContract($html['after']),'Standalone card contract differs'); $standalone[]=['language'=>$language,'currency'=>$currency,'cardMarkupContractEqual'=>true];
}
// Existing validation and incomplete batch failures must remain visible.
$failures=[];
foreach (['validation','search','attributes'] as $kind) {
    $fixture=build('after','de','EUR',[100],[]); $fixture['search']->fail=$kind==='search'; $fixture['search']->omit=$kind==='attributes';
    $expected=['validation'=>'Invalid page size','search'=>'Search unavailable','attributes'=>'Missing card attribute result for 100'][$kind];
    try { render($fixture,$kind==='validation'?0:60); throw new \LogicException('Failure swallowed'); }
    catch (\Throwable $error) { check(strpos($error->getMessage(),$expected)!==false,'Wrong error '.$kind); }
    $failures[]=$kind;
}
$samples=['before'=>[],'after'=>[]]; $fixtures=[];
foreach (['before','after'] as $version) { $fixtures[$version]=build($version,'de','EUR',range(100,159),[]); render($fixtures[$version]); }
for($i=0;$i<40;$i++) foreach ($i%2 ? ['after','before']:['before','after'] as $version) {
    $start=hrtime(true); $html=render($fixtures[$version]); $samples[$version][]=(hrtime(true)-$start)/1e6;
}
$report=['mode'=>'LOCAL_REAL_PHP_TWIG_WITH_EXPLICIT_SERVICE_FIXTURES_NOT_NATIVE','twig'=>\Twig\Environment::VERSION,'comparisons'=>$rows,'standalone'=>$standalone,'failurePropagation'=>$failures,'assertions'=>$assertions,'benchmark'=>['iterationsEach'=>40,'cards'=>60,'timingsMs'=>$samples,'note'=>'Warm compiled template, in-memory data/search doubles; includes rendering and fixture service processing. Not native search time, TTFB or server HTML-generation attribution.'],'dependencyDeprecations'=>$deprecations];
file_put_contents($argv[3],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' grid + '.count($standalone).' standalone comparisons and '.count($failures).' failure propagation cases PASS; '.$assertions.' assertions.'.PHP_EOL;
}
