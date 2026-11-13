<?php
// php tests/live_shopping_grid.php <Twig autoload> <report.json>
// Real theme templates and existing attribute batch helper; explicit data fixtures, no shop requests.
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class VariationAttributeMap {
        public static function getSearchFactory($options) {
            if (array_keys($options) !== ['itemId', 'afterKey'] || $options['afterKey'] !== null) {
                throw new \RuntimeException('Changed attribute search options');
            }
            return $options;
        }
    }
}
namespace {
require $argv[1];
require __DIR__.'/../src/Extensions/Base_Extension.php';
$deprecations = [];
set_error_handler(function ($level, $message) use (&$deprecations) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) { $deprecations[$message] = true; return true; }
    throw new \ErrorException($message, 0, $level);
});
function check($ok, $message) { if (!$ok) throw new \RuntimeException($message); }
function pluginApp($class, $params = []) {
    if ($class === \UnexpectedValueException::class) return new \UnexpectedValueException($params['message']);
    check($class === \Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService::class, 'Unexpected service '.$class);
    return $GLOBALS['attributeService'];
}
class AttributeFixture {
    public $singles = [], $batches = [], $omit = false;
    function result($id) { return ['attributes' => $id % 2 ? [['type'=>'box','values'=>[['position'=>2,'name'=>'L'],['position'=>1,'name'=>'M']]]] : [], 'documents'=>[['id'=>$id,'ignored'=>'same source payload']]]; }
    function getResult($factory) { $this->singles[]=$factory; return $this->result($factory['itemId']); }
    function getResults($factories) {
        $this->batches[]=$factories; $results=[];
        foreach (array_reverse($factories,true) as $key=>$factory) if (!$this->omit) $results[$key]=$this->result($factory['itemId']);
        return $results;
    }
}
class CardFixture {
    public $lang, $dictionary=[], $translationCalls=[], $pluginPathCalls=0;
    function __construct($lang) {
        $this->lang=$lang;
        foreach (['de',$lang] as $l) foreach (file(__DIR__.'/../resources/lang/'.$l.'/Template.properties') as $line) {
            if (preg_match('/^([\w.-]+)\s*=\s*(.*)$/u',trim($line),$m)) $this->dictionary[$m[1]]=$m[2];
        }
    }
    function trans($key) { $this->translationCalls[]=$key; $parts=explode('.',$key); return $this->dictionary[end($parts)] ?? $key; }
    function path($name) { $this->pluginPathCalls++; return '/fixture/plugin/'.$name; }
    function url($data) { return ($this->lang==='de'?'':'/'.$this->lang).'/product-'.$data['variation']['itemId'].'/'; }
    function name($data) { return $data['texts']['name1']; }
    function order($rows,$key) { usort($rows,function($a,$b)use($key){return $a[$key]<=>$b[$key];}); return $rows; }
}
class CurrencyFixture {
    public $calls=0, $underlyingPreparations=0, $currency, $cached;
    function __construct($currency) { $this->currency=$currency; }
    function getCurrencyData() {
        $this->calls++;
        if ($this->cached===null) { $this->underlyingPreparations++; $this->cached=['name'=>$this->currency,'symbol'=>$this->currency]; }
        return $this->cached;
    }
}
class LiveDataFixture {
    public $calls=[], $lang, $currency, $scenario, $visibleIds=[];
    function __construct($lang,$currency,$scenario) { $this->lang=$lang;$this->currency=$currency;$this->scenario=$scenario; }
    function getLiveShoppingData($id) {
        $this->calls[]=$id;
        if ($this->scenario==='throw'&&$id===3) throw new \RuntimeException('Live data failure');
        if ($this->scenario==='no-offer'||($this->scenario==='mixed'&&$id===2)) return null;
        $itemId=10000+($this->scenario==='duplicates'&&$id===2?1:$id);
        $item=['variation'=>['id'=>20000+$id,'itemId'=>$itemId,'stockLimitation'=>1],
            'item'=>['id'=>$itemId,'flagTwo'=>0,'feedbackCount'=>2,'feedbackDecimal'=>4.5,'manufacturer'=>['name'=>'Fixture manufacturer','logo'=>'https://cdn02.outlet46.de/frontend/vendor/test.png']],
            'images'=>['all'=>[['urlPreview'=>'https://images.example.test/'.$itemId.'.jpg']]],
            'texts'=>['name1'=>$this->lang.' Product '.$itemId], 'tags'=>[['id'=>284]], 'stock'=>['net'=>$id+4],
            'prices'=>['default'=>['unitPrice'=>['value'=>10+$id,'formatted'=>($id+10).'.00 '.$this->currency]],'rrp'=>['unitPrice'=>['value'=>30+$id,'formatted'=>($id+30).'.00 '.$this->currency]]]];
        $empty=$this->scenario==='no-item'||($this->scenario==='mixed'&&$id===4);
        $expired=$this->scenario==='expired'||($this->scenario==='expired-first'&&$id===1)||($this->scenario==='mixed'&&$id===5);
        if ($this->scenario==='no-first-image'&&$id===1) $item['images']['all']=[];
        if ($this->scenario==='no-images') $item['images']['all']=[];
        if (!$empty&&!$expired) $this->visibleIds[]=$itemId;
        return ['item'=>$empty?[]:$item,'liveShopping'=>['toTime'=>$expired?1:4102444800]];
    }
}
function cardFragments($html) {
    preg_match_all('/<\/?div\b[^>]*>/s',$html,$tokens,PREG_OFFSET_CAPTURE); $cards=[];$start=null;$depth=0;
    foreach ($tokens[0] as [$tag,$offset]) {
        if ($start===null) {
            if (strpos($tag,'class="cat-item has-rrp has-variations"')===false) continue;
            $start=$offset;$depth=0;
        }
        $depth+=strpos($tag,'</')===0?-1:1;
        if ($depth===0) { $cards[]=preg_replace('/>\s+</','><',trim(substr($html,$start,$offset+strlen($tag)-$start)));$start=null; }
    }
    check($start===null,'Unclosed card markup');return $cards;
}
function imageAttributes($picture,$tag) {
    check(preg_match('/<'.$tag.'\b[^>]*>/', $picture,$match)===1,'Missing '.$tag.' tag');
    preg_match_all('/([\w-]+)="([^"]*)"/',$match[0],$attributes,PREG_SET_ORDER);$result=[];
    foreach ($attributes as $attribute) $result[$attribute[1]]=$attribute[2];
    return $result;
}
function compareCardImages($oldCards,$newCards,$priorityExpected) {
    check(count($oldCards)===count($newCards),'Different card count');
    foreach ($oldCards as $index=>$old) {
        $new=$newCards[$index];
        if (!$priorityExpected||$index!==0) { check($new===$old,'Nonpriority card changed');continue; }
        check(preg_match('/<picture>[\s\S]*?<\/picture>/',$old,$oldPicture)===1,'Old picture missing');
        check(preg_match('/<picture>[\s\S]*?<\/picture>/',$new,$newPicture)===1,'New picture missing');
        check(str_replace($oldPicture[0],'__PICTURE__',$old)===str_replace($newPicture[0],'__PICTURE__',$new),'Content outside first product picture changed');
        $oldSource=imageAttributes($oldPicture[0],'source');$newSource=imageAttributes($newPicture[0],'source');
        $oldImage=imageAttributes($oldPicture[0],'img');$newImage=imageAttributes($newPicture[0],'img');
        check($newSource===['srcset'=>$oldSource['data-srcset'],'type'=>$oldSource['type']],'AVIF URL/type changed or lazy source remains');
        $expected=['src'=>$oldImage['data-src'],'decoding'=>$oldImage['decoding'],'loading'=>'eager','fetchpriority'=>'high','width'=>$oldImage['width'],'height'=>$oldImage['height'],'alt'=>$oldImage['alt'],'title'=>$oldImage['title']];
        check($newImage===$expected,'Priority image URL/dimensions/text changed or lazy attributes remain');
        check($newImage['width']==='225px'&&$newImage['height']==='300px','Existing dimensions changed');
    }
}
$prefix='GuardiansBasicB2B::Category.Item.Partials.';$templates=[];
foreach (['LiveShoppingItem','LiveShoppingGrid','CategoryGridOnly','CategoryListItem','CategoryAttributes'] as $name) $templates[$prefix.$name]=file_get_contents(__DIR__.'/../resources/views/Category/Item/Partials/'.$name.'.twig');
$templates['GuardiansBasicB2B::Category.Macros.render-rating']=file_get_contents(__DIR__.'/../resources/views/Category/Macros/render-rating.twig');
foreach (['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName'] as $name) $templates[$name]='';
$templates['old']= <<<'TWIG'
{% for liveshoppingid in 1..6 %}
{% set translations = {tSustainability: trans("GuardiansBasicB2B::Template.sustainability"),tAvailSizes: trans("GuardiansBasicB2B::Template.availsizes"),tStatt: trans("GuardiansBasicB2B::Template.statt"),tInBasket: trans("GuardiansBasicB2B::Template.inbasket")} %}
{% set transLabels = {availsizedeal: trans("GuardiansBasicB2B::Template.availsizedeal"),availsizeonesize: trans("GuardiansBasicB2B::Template.availsizeonesize"),morethen18: trans("GuardiansBasicB2B::Template.morethen18")} %}
{% set currencycheck = services.checkout.getCurrencyData.name %}
{% include "GuardiansBasicB2B::Category.Item.Partials.LiveShoppingItem" with {'liveshoppingid':liveshoppingid,'currencycheck':currencycheck,'isShoeCategory':false,'translations':translations,'transLabels':transLabels} %}
{% endfor %}
TWIG;
function runRender($templates,$name,$lang,$currency,$scenario,$omit=false) {
    $GLOBALS['attributeService']=$attributes=new AttributeFixture();$attributes->omit=$omit;
    $extension=(new \ReflectionClass(\GuardiansBasicB2B\Extensions\Base_Extension::class))->newInstanceWithoutConstructor();
    $card=new CardFixture($lang);$checkout=new CurrencyFixture($currency);$live=new LiveDataFixture($lang,$currency,$scenario);
    $twig=new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates),['cache'=>false,'strict_variables'=>false]);
    foreach (['trans'=>'trans','plugin_path'=>'path'] as $fn=>$method) $twig->addFunction(new \Twig\TwigFunction($fn,[$card,$method]));
    foreach (['getAttributesWithImages','getCardAttributeMaps'] as $fn) $twig->addFunction(new \Twig\TwigFunction($fn,[$extension,$fn]));
    foreach (['itemURL'=>'url','itemName'=>'name','orderByKey'=>'order'] as $fn=>$method) $twig->addFilter(new \Twig\TwigFilter($fn,[$card,$method]));
    $html=$twig->render($name,['services'=>['checkout'=>$checkout,'LiveShopping'=>$live],'category'=>['id'=>60,'parentCategoryId'=>0]]);
    return ['html'=>$html,'cards'=>cardFragments($html),'liveCalls'=>$live->calls,'visibleIds'=>$live->visibleIds,'singleFactories'=>$attributes->singles,'batches'=>$attributes->batches,'translations'=>count($card->translationCalls),'currencyGetters'=>$checkout->calls,'currencyPreparations'=>$checkout->underlyingPreparations,'pluginPaths'=>$card->pluginPathCalls];
}
$rows=[];
foreach (['de','en','fr','it','es'] as $lang) foreach (['EUR','USD','CHF'] as $currency) foreach (['active','no-offer','no-item','expired','mixed','duplicates','expired-first','no-first-image','no-images'] as $scenario) {
    $old=runRender($templates,'old',$lang,$currency,$scenario);$new=runRender($templates,$prefix.'LiveShoppingGrid',$lang,$currency,$scenario);
    $priorityExpected=count($new['cards'])>0&&!in_array($scenario,['no-first-image','no-images'],true);
    compareCardImages($old['cards'],$new['cards'],$priorityExpected);
    check($old['liveCalls']===range(1,6)&&$new['liveCalls']===range(1,6),'Live data calls must remain exactly IDs1..6 once');
    check($old['visibleIds']===$new['visibleIds']&&count($new['cards'])===count($new['visibleIds']),'Active/expired/empty gating changed');
    check($old['translations']===42&&$new['translations']===7,'Translation preparation not shared');
    check($old['currencyGetters']===6&&$new['currencyGetters']===1,'Currency getter not shared');
    check($old['currencyPreparations']===1&&$new['currencyPreparations']===1,'Existing cached currency work was miscounted');
    check(!$new['singleFactories'],'Unexpected per-card fallback after batch');
    $uniqueIds=array_values(array_unique($new['visibleIds']));
    check(count($new['batches'])===($uniqueIds?1:0),'Expected one existing batch or no query for empty grid');
    if ($uniqueIds) {
        check(array_values(array_column($new['batches'][0],'itemId'))===$uniqueIds,'Batch altered item IDs/order');
        foreach ($new['batches'][0] as $factory) check(in_array($factory,$old['singleFactories'],true),'New or changed search factory');
    }
    check($old['pluginPaths']===count($old['cards'])&&$new['pluginPaths']===($uniqueIds?1:0),'Manufacturer path preparation changed unexpectedly');
    check(substr_count($new['html'],'class="col-6 col-sm-6 col-md-3 col-lg-3 col-xl-2 col-xlg-2 col-xxlg-2"')===count($new['cards']),'Normal responsive six-column grid missing');
    $missingImages=$scenario==='no-images'?count($new['cards']):($scenario==='no-first-image'?1:0);
    check(substr_count($new['html'],'data-src="https://images.example.test/')===count($new['cards'])-$missingImages-($priorityExpected?1:0),'Other product images no longer lazy');
    check(substr_count($new['html'],'loading="eager"')===($priorityExpected?1:0)&&substr_count($new['html'],'fetchpriority="high"')===($priorityExpected?1:0),'Only the first existing LS image may have eager/high priority');
    check(substr_count($new['html'],'class="lozad cat-logo"')===count($new['cards']),'Manufacturer logos no longer lazy');
    if ($scenario==='expired-first') check($new['visibleIds'][0]===10002&&strpos($new['html'],'src="https://images.example.test/10002.jpg"')!==false,'Expired first slot must not consume image priority');
    check(substr_count($new['html'],'quickViewItem=true')===count($new['cards']),'Quickview links lost');
    $rows[]=['lang'=>$lang,'currency'=>$currency,'scenario'=>$scenario,'status'=>'PASS','ids'=>$new['visibleIds'],'cards'=>count($new['cards']),'priorityImages'=>$priorityExpected?1:0,'cardContentIdenticalExceptOptInPicture'=>true,'cardSha256'=>array_map(function($s){return hash('sha256',$s);},$new['cards']),
      'before'=>['htmlBytes'=>strlen($old['html']),'translations'=>$old['translations'],'currencyGetters'=>$old['currencyGetters'],'currencyPreparations'=>$old['currencyPreparations'],'liveCalls'=>count($old['liveCalls']),'attributeSingleCalls'=>count($old['singleFactories']),'attributeFactories'=>count($old['singleFactories']),'pluginPaths'=>$old['pluginPaths']],
      'after'=>['htmlBytes'=>strlen($new['html']),'translations'=>$new['translations'],'currencyGetters'=>$new['currencyGetters'],'currencyPreparations'=>$new['currencyPreparations'],'liveCalls'=>count($new['liveCalls']),'attributeBatchCalls'=>count($new['batches']),'attributeFactories'=>count($uniqueIds),'pluginPaths'=>$new['pluginPaths']]];
}
$errors=[];
foreach (['missing-batch','live-service'] as $case) {
    $expected=$case==='missing-batch'?'Missing card attribute result':'Live data failure';
    try { runRender($templates,$prefix.'LiveShoppingGrid','de','EUR',$case==='live-service'?'throw':'active',$case==='missing-batch');throw new \LogicException('Failure swallowed'); }
    catch (\Throwable $error) { check(strpos($error->getMessage(),$expected)!==false,'Unexpected failure: '.$error->getMessage());$errors[]=['case'=>$case,'status'=>'PASS','errorPropagated'=>true]; }
}
$report=['status'=>'PASS','mode'=>'LOCAL_REAL_TWIG_AND_EXISTING_BATCH_HELPER_WITH_EXPLICIT_SERVICE_FIXTURES','twig'=>\Twig\Environment::VERSION,'php'=>PHP_VERSION,'cases'=>$rows,'errorPropagation'=>$errors,'deprecations'=>array_keys($deprecations),
  'limitations'=>['No native PHP/DB/TTFB measurement; service data and currency memory cache are explicit fixtures.', 'Old six-call configuration uses supplied block1 structure with user-authorized IDs1..6; existing live blocks2-6 were not individually exported.', 'Normalized card fragments are identical except the explicitly checked first-picture priority attributes; new wrapper deliberately uses the existing normal grid.', 'Missing first image keeps the existing fallback and does not prioritize another card.', 'A prepared ShopBuilder replacement is required to activate the new partial. No live configuration changed.']];
file_put_contents($argv[2],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' LiveShopping grid comparisons and '.count($errors).' error-propagation checks PASS; Twig '.$report['twig'].PHP_EOL;
}
