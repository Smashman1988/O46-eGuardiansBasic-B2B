<?php
// php tests/product_card.php <Twig autoload> <ac1138b-card-template-directory> <report.json>
require $argv[1];
require __DIR__.'/card_markup_contract.php';
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
class ProductCardFixture {
    public $language, $dictionary = [], $maps = [], $lookups = 0, $pluginCalls = 0;
    function __construct($language) {
        $this->language = $language;
        foreach (['de', $language] as $lang) foreach (file(__DIR__.'/../resources/lang/'.$lang.'/Template.properties') as $line) {
            if (preg_match('/^([\w.-]+)\s*=\s*(.*)$/u', trim($line), $match)) $this->dictionary[$match[1]] = $match[2];
        }
    }
    function trans($key) { $parts = explode('.', $key); return $this->dictionary[end($parts)] ?? $key; }
    function path($plugin) { $this->pluginCalls++; return '/fixture/plugin/'.$plugin; }
    function url($data) { return ($this->language==='de'?'':'/'.$this->language).'/product-'.$data['variation']['itemId'].'/'; }
    function name($data) { return $data['texts']['name1']; }
    function attributes($id) { $this->lookups++; return $this->maps[$id]; }
    function batch($ids) { $out=[]; foreach ($ids as $id) $out[$id]=$this->maps[$id]; return $out; }
    function order($rows, $key) { usort($rows, function($a,$b) use($key) { return $a[$key]<=>$b[$key]; }); return $rows; }
}
class ProductCardCurrency { public $currency; function getCurrencyData() { return ['name'=>$this->currency]; } }
function cardCheck($condition, $message) { if (!$condition) throw new \RuntimeException($message); }
function cardEnvironment($version, $fixture) {
    $prefix='GuardiansBasicB2B::Category.Item.Partials.'; $templates=[];
    foreach (['CategoryListItem','CategoryListItem2','CategoryAttributes','CategoryGridOnly'] as $name) {
        $file=$version==='before'?$GLOBALS['argv'][2].'/'.$name.'.twig':__DIR__.'/../resources/views/Category/Item/Partials/'.$name.'.twig';
        $templates[$prefix.$name]=file_get_contents($file);
    }
    $templates['GuardiansBasicB2B::Category.Macros.render-rating']=file_get_contents(__DIR__.'/../resources/views/Category/Macros/render-rating.twig');
    $templates['Ceres::PageDesign.Macros.LayoutContainer']=$templates['Ceres::PageDesign.Macros.ItemName']='';
    $twig=new \Twig\Environment(new \Twig\Loader\ArrayLoader($templates));
    foreach (['trans'=>'trans','plugin_path'=>'path','getAttributesWithImages'=>'attributes','getCardAttributeMaps'=>'batch'] as $name=>$method) $twig->addFunction(new \Twig\TwigFunction($name,[$fixture,$method]));
    foreach (['itemURL'=>'url','itemName'=>'name','orderByKey'=>'order'] as $name=>$method) $twig->addFilter(new \Twig\TwigFilter($name,[$fixture,$method]));
    return $twig;
}
$rows=[]; $grids=[]; $dir=dirname($argv[3]);
foreach (['de','en','fr','it','es'] as $language) {
    $fixture=new ProductCardFixture($language); $twig=[];
    foreach (['before','after'] as $version) $twig[$version]=cardEnvironment($version,$fixture);
    $items=[];
    for ($i=0;$i<60;$i++) {
        $id=100+$i;
        $items[]=['data'=>['item'=>['id'=>$id,'flagTwo'=>0,'manufacturer'=>['name'=>'Brand "A" & B','logo'=>['https://cdn02.outlet46.de/frontend/vendor/brand.svg','https://other.example/logo.png',''][$i%3]],'feedbackCount'=>$i%2,'feedbackDecimal'=>($i%5)+0.3],
            'variation'=>['id'=>10000+$id,'itemId'=>$id], 'texts'=>['name1'=>$language.' Product "'.$id.'" & Größen / tailles'],
            'images'=>['all'=>$i%7?[['urlPreview'=>'/images/product-'.$id.'.jpg']]:[]], 'tags'=>$i%3===0?[['id'=>284]]:[],
            'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4,99 €']],'rrp'=>['unitPrice'=>['value'=>$i%11?19.99:null,'formatted'=>'19,99 €']]]]];
        $fixture->maps[$id]=['attributes'=>[$i%4===0?['type'=>'image','values'=>[['position'=>1,'name'=>'Blue']]]:['type'=>'box','values'=>$i%4===1?[]:[['position'=>2,'name'=>'L & XL'],['position'=>1,'name'=>'M']]]]];
    }
    $translations=[]; foreach (['tSustainability'=>'sustainability','tAvailSizes'=>'availsizes','tStatt'=>'statt','tInBasket'=>'inbasket'] as $key=>$source) $translations[$key]=$fixture->trans('GuardiansBasicB2B::Template.'.$source);
    foreach (['EUR','USD'] as $currency) foreach (['lazy','priority','eager'] as $mode) foreach (array_slice($items,0,12) as $item) {
        $id=$item['data']['variation']['itemId'];
        $context=['item'=>$item,'currencycheck'=>$currency,'translations'=>$translations,'transLabels'=>['availsizeonesize'=>$fixture->trans('GuardiansBasicB2B::Template.availsizeonesize')],'isShoeCategory'=>$id%2===0,'cardPriorityImage'=>$mode==='priority','percent'=>17,'cardAttributeMap'=>$fixture->maps[$id]];
        $template='GuardiansBasicB2B::Category.Item.Partials.CategoryListItem'.($mode==='eager'?'2':'');
        $html=[]; $calls=[];
        foreach (['before','after'] as $version) { $fixture->pluginCalls=$fixture->lookups=0; $html[$version]=$twig[$version]->render($template,$context); $calls[$version]=[$fixture->pluginCalls,$fixture->lookups]; }
        cardCheck(cardMarkupContract($html['before'],true)===cardMarkupContract($html['after']), 'Card semantics differ '.$language.'/'.$currency.'/'.$mode.'/'.$id);
        cardCheck($calls['before']===$calls['after'], 'Card service/helper calls changed');
        $before=cardMarkupCounts($html['before']); $after=cardMarkupCounts($html['after']);
        cardCheck($before['elements']-$after['elements']===2+($item['data']['item']['feedbackCount']?0:1),'Unexpected element delta');
        $rows[]=['language'=>$language,'currency'=>$currency,'mode'=>$mode,'itemId'=>$id,'before'=>$before,'after'=>$after,'semantics'=>'PASS','helperCalls'=>$calls['after']];
    }
    $checkout=new ProductCardCurrency(); $checkout->currency='EUR';
    $context=['itemList'=>$items,'services'=>['checkout'=>$checkout],'category'=>['id'=>60],'prioritizeFirstCardImage'=>true];
    $html=[];
    foreach (['before','after'] as $version) {
        $html[$version]=$twig[$version]->render('GuardiansBasicB2B::Category.Item.Partials.CategoryGridOnly',$context);
        file_put_contents($dir.'/cards-'.$language.'-'.$version.'.html',$html[$version]);
    }
    cardCheck(cardMarkupContract($html['before'],true)===cardMarkupContract($html['after']), '60-card grid semantics differ');
    cardCheck(substr_count($html['after'],'data-eg-item="')===60,'Lost homepage cards');
    cardCheck(substr_count($html['after'],'fetchpriority="high"')===0,'Empty first image must not gain priority');
    $grids[]=['language'=>$language,'cards'=>60,'before'=>cardMarkupCounts($html['before']),'after'=>cardMarkupCounts($html['after']),'semantics'=>'PASS'];
}
$samples=['before'=>[],'after'=>[]];
// Both compiled environments have already rendered the same last-language grid.
for ($i=0;$i<40;$i++) foreach ($i%2?['after','before']:['before','after'] as $version) {
    $start=hrtime(true);
    $twig[$version]->render('GuardiansBasicB2B::Category.Item.Partials.CategoryGridOnly',$context);
    $samples[$version][]=(hrtime(true)-$start)/1e6;
}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>\Twig\Environment::VERSION,'mode'=>'LOCAL_REAL_TWIG_WITH_FIXTURES','cards'=>$rows,'grids'=>$grids,
    'benchmark'=>['state'=>'warm compiled templates','iterationsPerVersion'=>40,'cards'=>60,'language'=>'es','milliseconds'=>$samples,'limit'=>'Alternating local in-memory fixture renders only; not Plenty PHP/search/database time, not native TTFB.'],
    'limits'=>['Semantic text normalization ignores indentation. Separate browser geometry checks cover inline whitespace and decorative CSS borders.','No native server timing or CWV claim.']],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' direct card contracts and '.count($grids).' 60-card five-language grids PASS'.PHP_EOL;
