<?php
require_once __DIR__.'/card_markup_contract.php';
// php tests/phase11_cards.php <Twig autoload> <before views directory> <report.json>
// Byte-for-byte real Twig comparisons; platform services are local fixtures.
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
if (version_compare(Twig\Environment::VERSION, '3', '<')) {
    class Phase11Environment extends Twig\Environment {
        public $ratingLoads = 0;
        public function loadTemplate($name, $index = null) {
            if ($name === 'GuardiansBasicB2B::Category.Macros.render-rating') $this->ratingLoads++;
            return parent::loadTemplate($name, $index);
        }
    }
} else {
    class Phase11Environment extends Twig\Environment {
        public $ratingLoads = 0;
        public function loadTemplate(string $cls, string $name, ?int $index = null): Twig\Template {
            if ($name === 'GuardiansBasicB2B::Category.Macros.render-rating') $this->ratingLoads++;
            return parent::loadTemplate($cls, $name, $index);
        }
    }
}
class Phase11CardFixture {
    public $language, $dictionary = [], $calls = [];
    function __construct($language) {
        $this->language = $language;
        foreach (['de', $language] as $lang) foreach (file(__DIR__.'/../resources/lang/'.$lang.'/Template.properties') as $line) {
            if (preg_match('/^([\w.-]+)\s*=\s*(.*)$/u', trim($line), $m)) $this->dictionary[$m[1]] = $m[2];
        }
    }
    function count($key) { $this->calls[$key] = ($this->calls[$key] ?? 0) + 1; }
    function trans($key) { $this->count('translation'); $parts = explode('::Template.', $key); return $this->dictionary[end($parts)] ?? $key; }
    function path($name) { $this->count('pluginPath'); return '/fixture/'.$name; }
    function url($data) { $this->count('itemURL'); return '/'.$this->language.'/product-'.$data['variation']['itemId'].'/'; }
    function name($data) { $this->count('itemName'); return $data['texts']['name1']; }
    function attributes($id) { $this->count('attributes'); return ['attributes' => $id % 3 ? [['type'=>'box', 'values'=>[['position'=>2, 'name'=>'L & XL'], ['position'=>1, 'name'=>'M']]]] : []]; }
    function batch($ids) { $this->count('batchHelper'); $out=[]; foreach ($ids as $id) $out[$id]=$this->attributes($id); return $out; }
    function order($values, $key) { usort($values, function($a,$b) use ($key) { return $a[$key] <=> $b[$key]; }); return $values; }
    function partial($name) { return 'layout'; }
    function noop() { return ''; }
}
class Phase11CardServices {
    public $checkout, $localizationRepository;
    function __construct($language, $currency) {
        $this->checkout = new class($currency) {
            private $currency;
            function __construct($currency) { $this->currency=$currency; }
            function getCurrencyData() { return ['name'=>$this->currency]; }
        };
        $this->localizationRepository = new class($language) {
            private $language;
            function __construct($language) { $this->language=$language; }
            function getLanguage() { return $this->language; }
        };
    }
}
// Supplementary property-access probe. Ordinary array data is used in all
// functional cases; this object only makes the same nested lookups countable.
class Phase11ItemProbe {
    private $values;
    public $reads = [];
    function __construct($values) { $this->values=$values; }
    private function value($name) { $this->reads[$name]=($this->reads[$name]??0)+1; return $this->values[$name]??null; }
    function getManufacturer() { return $this->value('manufacturer'); }
    function getFeedbackDecimal() { return $this->value('feedbackDecimal'); }
    function getFeedbackCount() { return $this->value('feedbackCount'); }
    function getFlagTwo() { return $this->value('flagTwo'); }
}
function phase11Check($ok, $message) { if (!$ok) throw new RuntimeException($message); }
function phase11Environment($fixture, $before = false, $allBefore = false, $queryString = null) {
    $names = ['Category.Item.CategoryItem','Category.Item.CategoryItemContent','Category.Item.Partials.CategoryListItem','Category.Item.Partials.CategoryListItem2','Category.Item.Partials.CategoryAttributes','Category.Item.Partials.CategoryGridOnly','Category.Item.Partials.AllItemsLink','Category.Macros.render-rating'];
    $templates = ['layout'=>'{% block PageBody %}{% endblock %}'];
    foreach ($names as $name) {
        $relative = str_replace('.', '/', $name).'.twig';
        $base = $before && ($allBefore || $name === 'Category.Item.Partials.CategoryListItem') ? $GLOBALS['argv'][2] : __DIR__.'/../resources/views';
        $templates['GuardiansBasicB2B::'.$name] = file_get_contents($base.'/'.$relative);
    }
    foreach (['Pagination','FacetFilter2','FacetFilter3'] as $name) $templates['GuardiansBasicB2B::Category.Item.Partials.'.$name]='';
    foreach (['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName'] as $name) $templates[$name]='';
    $templates['public-macro'] = "{% import 'GuardiansBasicB2B::Category.Item.CategoryItem' as c %}{{ c.categoryItem(item, variant, currencycheck, isShoeCategory, translations, transLabels, cardAttributeMap) }}";
    $twig = new Phase11Environment(new Twig\Loader\ArrayLoader($templates));
    foreach (['trans'=>'trans','plugin_path'=>'path','getAttributesWithImages'=>'attributes','getCardAttributeMaps'=>'batch','getPartial'=>'partial','config'=>'noop','queryString'=>'noop','createSeoPage'=>'noop'] as $name=>$method) $twig->addFunction(new Twig\TwigFunction($name,$name==='queryString' && $queryString!==null ? $queryString : [$fixture,$method]));
    foreach (['itemURL'=>'url','itemName'=>'name','orderByKey'=>'order'] as $name=>$method) $twig->addFilter(new Twig\TwigFilter($name,[$fixture,$method]));
    return $twig;
}
function phase11Items($count, $lang) {
    $items=[];
    for ($i=0;$i<$count;$i++) {
        $id=100+$i;
        $manufacturer=['name'=>'Brand "A" & B', 'logo'=>['https://cdn02.outlet46.de/frontend/vendor/a.svg','https://external.test/a.svg','',null][$i%4]];
        $item=['id'=>$id, 'flagTwo'=>0, 'manufacturer'=>$manufacturer, 'feedbackCount'=>[0,2,null,-1,'3'][($i+1)%5], 'feedbackDecimal'=>[null,0,2.3,4.9,5][$i%5]];
        if ($i%12===10) unset($item['manufacturer']);
        if ($i%12===11) unset($item['feedbackCount'], $item['feedbackDecimal']);
        $items[]=['data'=>['item'=>$item, 'variation'=>['id'=>$id+10000,'itemId'=>$id], 'texts'=>['name1'=>$lang.' Product "'.$id.'" & sizes'], 'images'=>['all'=>$i%7 ? [['urlPreview'=>'/img/'.$id.'.jpg']] : []], 'tags'=>$i%3 ? [] : [['id'=>5],['id'=>284]], 'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4,99 €']], 'rrp'=>['unitPrice'=>['value'=>$i%6 ? 19.99 : null,'formatted'=>'19,99 €']]]]];
    }
    return $items;
}
function phase11Compare($twig, $fixture, $template, $context, $label) {
    $result=[];
    foreach (['before','after'] as $version) {
        $fixture[$version]->calls=[]; $twig[$version]->ratingLoads=0;
        $html=$twig[$version]->render($template,$context);
        $result[$version]=['html'=>$html,'calls'=>$fixture[$version]->calls,'ratingLoads'=>$twig[$version]->ratingLoads];
    }
    phase11Check(cardMarkupContract($result['before']['html'],true)===cardMarkupContract($result['after']['html']),'Card DOM contract changed: '.$label);
    phase11Check(cardHelperContract($result['before']['calls'],$result['after']['calls'],'pluginPath'),'Service/helper calls changed: '.$label);
    return $result;
}
if (defined('O46_CARD_FIXTURE_ONLY')) return;
$cards=[]; $lists=[]; $probes=[];
foreach (['de','en','fr','it','es'] as $lang) {
    $fixture=[];$twig=[];
    foreach (['before','after'] as $version) { $fixture[$version]=new Phase11CardFixture($lang);$twig[$version]=phase11Environment($fixture[$version],$version==='before'); }
    $translations=['tSustainability'=>'Sustainability & "label"','tAvailSizes'=>'Sizes','tStatt'=>'RRP','tInBasket'=>'Buy'];
    foreach (['EUR','USD','X<&"'] as $currency) foreach (['lazy','priority','eager','responsive768','responsive1200','macro1','macro2'] as $mode) foreach (phase11Items(12,$lang) as $item) {
        $ctx=['item'=>$item,'currencycheck'=>$currency,'translations'=>$translations,'transLabels'=>['availsizeonesize'=>'One size'],'isShoeCategory'=>true,'cardPriorityImage'=>$mode==='priority','cardImageMinViewport'=>$mode==='responsive768'?768:($mode==='responsive1200'?1200:null),'variant'=>$mode==='macro1'?1:2];
        $name=strpos($mode,'macro')===0?'public-macro':'GuardiansBasicB2B::Category.Item.Partials.CategoryListItem'.($mode==='eager'?'2':'');
        $r=phase11Compare($twig,$fixture,$name,$ctx,$lang.'/'.$currency.'/'.$mode.'/'.$item['data']['variation']['itemId']);
        $rated=($item['data']['item']['feedbackCount']??0)>0;
        phase11Check($r['before']['ratingLoads']===1 && $r['after']['ratingLoads']===($rated?1:0),'Rating import scope changed');
        $cards[]=['language'=>$lang,'currency'=>$currency,'mode'=>$mode,'itemId'=>$item['data']['variation']['itemId'],'bytes'=>strlen($r['after']['html']),'ratingImportsBefore'=>1,'ratingImportsAfter'=>$rated?1:0];
    }
    foreach (['category'=>'Category.Item.CategoryItem','content'=>'Category.Item.CategoryItemContent','grid'=>'Category.Item.Partials.CategoryGridOnly'] as $kind=>$name) foreach ([0,1,6,60] as $count) foreach ([1,2] as $page) {
        $items=phase11Items($count,$lang);
        $ctx=['lang'=>$lang,'itemList'=>$items,'services'=>new Phase11CardServices($lang,'EUR'),'category'=>['id'=>44,'parentCategoryId'=>0,'details'=>[['name'=>'Fixture category']]],'currentPage'=>$page,'pageMax'=>3,'itemCountTotal'=>$count,'prioritizeFirstCardImage'=>true,'isQuickView'=>true,'request'=>new class { function get($key){return null;} }];
        $r=phase11Compare($twig,$fixture,'GuardiansBasicB2B::'.$name,$ctx,$lang.'/'.$kind.'/'.$count.'/'.$page);
        $rated=count(array_filter($items,function($row){return ($row['data']['item']['feedbackCount']??0)>0;}));
        phase11Check($r['before']['ratingLoads']===$count && $r['after']['ratingLoads']===$rated,'List import count');
        preg_match_all('/data-eg-item="([0-9]+)"/',$r['after']['html'],$matches);
        phase11Check(array_map('intval',$matches[1])===array_column(array_column(array_column($items,'data'),'variation'),'itemId'),'Card order/count changed');
        $lists[]=['language'=>$lang,'entry'=>$kind,'page'=>$page,'cards'=>$count,'bytesBefore'=>strlen($r['before']['html']),'bytesAfter'=>strlen($r['after']['html']),'ratingImportsBefore'=>$count,'ratingImportsAfter'=>$rated,'serviceCalls'=>$r['after']['calls']];
    }
}
foreach ([0,6,60] as $count) {
    $row=['cards'=>$count];$html=[];
    foreach (['before','after'] as $version) {
        $fixture=new Phase11CardFixture('de');$twig=phase11Environment($fixture,$version==='before');
        $items=phase11Items($count,'de');$reads=[];
        foreach ($items as &$item) { $item['data']['item']=new Phase11ItemProbe($item['data']['item']);$reads[]=$item['data']['item']; } unset($item);
        $html[$version]=$twig->render('GuardiansBasicB2B::Category.Item.Partials.CategoryGridOnly',['itemList'=>$items,'services'=>new Phase11CardServices('de','EUR')]);
        $counts=['manufacturer'=>0,'feedbackDecimal'=>0];foreach($reads as $read)foreach($counts as $key=>$value)$counts[$key]+=$read->reads[$key]??0;
        $row[$version]=$counts+['ratingImports'=>$twig->ratingLoads];
    }
    phase11Check(cardMarkupContract($html['before'],true)===cardMarkupContract($html['after']),'Diagnostic property fixture output');
    phase11Check($row['after']['manufacturer']===$count,'Manufacturer parent must be resolved once/card');
    $probes[]=$row;
}
$sourceBefore=file_get_contents($argv[2].'/Category/Item/Partials/CategoryListItem.twig');
$sourceAfter=file_get_contents(__DIR__.'/../resources/views/Category/Item/Partials/CategoryListItem.twig');
$report=['status'=>'PASS','twig'=>Twig\Environment::VERSION,'cards'=>$cards,'lists'=>$lists,'propertyProbes'=>$probes,'sourceBytes'=>['before'=>strlen($sourceBefore),'after'=>strlen($sourceAfter),'saved'=>strlen($sourceBefore)-strlen($sourceAfter)],'limits'=>['All functional pairs use actual theme templates and array data, with local platform fixtures. The optional object probe counts nested property reads only.','No native PHP/SQL/TTFB timing, browser-transfer or customer-class acceptance. Output HTML is byte-identical; HTTP requests and service calls are unchanged.']];
file_put_contents($argv[3],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE));
echo count($cards).' byte-identical cards/public macros, '.count($lists).' byte-identical lists, '.count($probes).' property probes PASS; Twig '.Twig\Environment::VERSION.PHP_EOL;
