<?php
// php tests/list_render_preparation.php <Twig autoload> <baseline resources/views> <report.json>
require $argv[1];
require __DIR__.'/card_markup_contract.php';
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
function listCheck($ok, $message) { if (!$ok) throw new RuntimeException($message); }
function blockWhitespace($html) { return preg_replace('/(?<=>)[\t ]*(?:\r?\n[\t ]*)+(?=<)/','',$html); }
class ListPreparationFixture {
    public $language, $dictionary=[], $calls=[], $contexts=[];
    function __construct($language) {
        $this->language=$language;
        foreach (['de',$language] as $lang) foreach (file(__DIR__.'/../resources/lang/'.$lang.'/Template.properties') as $line) {
            if (preg_match('/^([\w.-]+)\s*=\s*(.*)$/u',trim($line),$m)) $this->dictionary[$m[1]]=$m[2];
        }
    }
    function count($name) { $this->calls[$name]=($this->calls[$name]??0)+1; }
    function trans($key) { $this->count('trans'); return $this->dictionary[substr($key,strpos($key,'::Template.')+11)]??$key; }
    function path($plugin) { $this->count('plugin_path'); return '/fixture/'.$plugin; }
    function url($data) { $this->count('itemURL'); return '/'.$this->language.'/product-'.($data['variation']['itemId']??'').'/'; }
    function name($data) { $this->count('itemName'); return $data['texts']['name1']??''; }
    function map($id) { return ['attributes'=>[['type'=>'image','values'=>[]],['type'=>'box','values'=>[['position'=>2,'name'=>'L & XL'],['position'=>1,'name'=>'M']]]]]; }
    function attributes($id) { $this->count('singleAttributes'); return $this->map($id); }
    function batch($ids) { $this->count('batchHelper'); $out=[]; foreach($ids as $id) $out[$id]=$this->map($id); return $out; }
    function order($rows,$key) { $this->count('orderByKey'); usort($rows,function($a,$b)use($key){return $a[$key]<=>$b[$key];});return $rows; }
    function probe($context,$name) { $this->contexts[$name][]=array_keys($context); }
    function config($key) { return ''; }
    function partial($name) { return 'layout'; }
    function noop() { return ''; }
}
class ListPreparationServices {
    public $checkout,$localizationRepository,$url;
    function __construct($lang) { $this->checkout=new class {function getCurrencyData(){return ['name'=>'EUR'];}};$this->localizationRepository=new class($lang){public $lang;function __construct($lang){$this->lang=$lang;}function getLanguage(){return $this->lang;}}; }
}
function preparationEnvironment($base,$fixture,$globals) {
    $files=['Category.Item.CategoryItem','Category.Item.CategoryItemContent','Category.Item.Partials.CategoryGridOnly','Category.Item.Partials.CategoryListItem','Category.Item.Partials.CategoryListItem2','Category.Item.Partials.CategoryAttributes','Category.Macros.render-rating'];$templates=['layout'=>'{% block PageBody %}{% endblock %}'];
    foreach($files as $name){$source=file_get_contents($base.'/'.str_replace('.','/',$name).'.twig');if(in_array($name,['Category.Item.Partials.CategoryListItem','Category.Item.Partials.CategoryAttributes'],true))$source="{% do preparation_probe('".$name."') %}".$source;$templates['GuardiansBasicB2B::'.$name]=$source;}
    foreach(['Pagination','FacetFilter2','FacetFilter3'] as $name)$templates['GuardiansBasicB2B::Category.Item.Partials.'.$name]='';
    $templates['GuardiansBasicB2B::Category.Item.Partials.AllItemsLink'] = file_get_contents(__DIR__.'/../resources/views/Category/Item/Partials/AllItemsLink.twig');
    foreach(['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName'] as $name)$templates[$name]='';
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader($templates));
    foreach(['trans'=>'trans','plugin_path'=>'path','getAttributesWithImages'=>'attributes','getCardAttributeMaps'=>'batch','config'=>'config','getPartial'=>'partial','queryString'=>'noop','createSeoPage'=>'noop'] as $name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$fixture,$method]));
    $twig->addFunction(new Twig\TwigFunction('preparation_probe',[$fixture,'probe'],['needs_context'=>true]));
    foreach(['itemURL'=>'url','itemName'=>'name','orderByKey'=>'order'] as $name=>$method)$twig->addFilter(new Twig\TwigFilter($name,[$fixture,$method]));
    foreach($globals as $name=>$value)$twig->addGlobal($name,$value);
    $profile=new Twig\Profiler\Profile();$twig->addExtension(new Twig\Extension\ProfilerExtension($profile));
    return [$twig,$profile];
}
function profileCounts($profile,&$counts) { foreach($profile->getProfiles() as $child){$key=$child->getType().':'.$child->getName();$counts[$key]=($counts[$key]??0)+1;profileCounts($child,$counts);} }
function fixtureItems($n,$language) { $out=[];for($i=0;$i<$n;$i++){$id=100+$i;$out[]=['data'=>['variation'=>['id'=>$id+10000,'itemId'=>$id],'item'=>['id'=>$id,'flagTwo'=>0,'manufacturer'=>['name'=>'Brand "A" & B','logo'=>$i%3?'https://cdn02.outlet46.de/frontend/vendor/brand.svg':''],'feedbackCount'=>$i%2,'feedbackDecimal'=>3.7],'texts'=>['name1'=>$language.' Item "'.$id.'" & sizes'],'images'=>['all'=>[['urlPreview'=>'/images/'.$id.'.jpg']]],'tags'=>$i%3===0?[['id'=>284]]:[],'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4,99 €']],'rrp'=>['unitPrice'=>['value'=>$i%11?19.99:null,'formatted'=>'19,99 €']]]]];}return $out; }
$rows=[];$root=dirname(__DIR__).'/resources/views';
$scenarios=[['normal',[],[]],['empty',[],[]],['outer-contaminated',[],['cardEagerImages'=>true,'cardPriorityImage'=>true,'dezimalcount'=>3,'percent'=>47,'cardVendorLogoBase'=>'/outer/vendor/']],['true-globals',['cardEagerImages'=>true,'cardPriorityImage'=>true,'dezimalcount'=>2,'percent'=>37,'cardVendorLogoBase'=>'/global/vendor/','globalSentinel'=>'present'],['cardEagerImages'=>false,'cardPriorityImage'=>false,'dezimalcount'=>4,'percent'=>57,'cardVendorLogoBase'=>'/outer/vendor/']]];
foreach(['de','en','fr','it','es'] as $lang)foreach(['category'=>'Category.Item.CategoryItem','content'=>'Category.Item.CategoryItemContent','grid'=>'Category.Item.Partials.CategoryGridOnly'] as $kind=>$name)foreach([1,2] as $page)foreach($scenarios as [$scenario,$globals,$outer]){
    $n=$scenario==='normal'?60:($scenario==='empty'?0:12);$ctx=$outer+['itemList'=>fixtureItems($n,$lang),'services'=>new ListPreparationServices($lang),'category'=>['id'=>44,'parentCategoryId'=>0,'details'=>[['name'=>'Category']]],'currentPage'=>$page,'pageMax'=>3,'itemCountTotal'=>$n,'request'=>new class {function get($key){return null;}},'prioritizeFirstCardImage'=>true];
    // Representative surrounding request payload; only top-level key counts are asserted.
    $ctx['lang'] = $lang; // Ceres GlobalContext supplies this to standalone content lists, too.
    for($i=0;$i<80;$i++)$ctx['unrelatedContext'.$i]=['payload'=>str_repeat('x',50)];
    $result=[];
    foreach(['before'=>$argv[2],'after'=>$root] as $version=>$base){$f=new ListPreparationFixture($lang);[$twig,$profile]=preparationEnvironment($base,$f,$globals);$html=$twig->render('GuardiansBasicB2B::'.$name,$ctx);$counts=[];profileCounts($profile,$counts);$result[$version]=['html'=>$html,'calls'=>$f->calls,'contexts'=>$f->contexts,'profile'=>$counts];}
    $expectedHtml = withoutInvalidCardComparisons($result['before']['html'], range(100,159,11));
    if ($kind !== 'grid') {
        $paths = ['de'=>'/alle-artikel/', 'en'=>'/en/All-Articles/', 'fr'=>'/fr/tous-les-articles/',
                  'it'=>'/it/tutti-gli-articoli/', 'es'=>'/es/todos-los-articulos/'];
        $oldPath = in_array($lang, ['en','fr'], true) ? $paths[$lang] : $paths['de'];
        $expectedHtml = preg_replace('~(<a href=")'.preg_quote($oldPath,'~').'(") title="[^"]*"(?=>)~',
            '$1'.$paths[$lang].'$2', $expectedHtml, 1, $changed);
        listCheck($changed === 1, 'Missing original localized list-end link');
    }
    listCheck(blockWhitespace($expectedHtml)===blockWhitespace($result['after']['html']),'Unexpected list markup difference '.$lang.'/'.$kind.'/'.$page.'/'.$scenario);
    $expectedCalls = $result['before']['calls'];
    if ($kind === 'grid') $expectedCalls['trans'] -= 2; // No lookup of unused labels in the isolated grid.
    if ($kind !== 'grid') $expectedCalls['itemName']--; // Removed unrelated product title from the list-end link.
    if (($expectedCalls['itemName'] ?? null) === 0) unset($expectedCalls['itemName']);
    listCheck($expectedCalls===$result['after']['calls'],'Service/helper calls differ');
    listCheck(substr_count($result['after']['html'],'data-eg-item="')===$n,'Card count');
    $counts=[];foreach(['before','after'] as $version){$counts[$version]=['macroCalls'=>$result[$version]['profile']['macro:categoryItem']??0,'cardContextKeys'=>array_map('count',$result[$version]['contexts']['Category.Item.Partials.CategoryListItem']??[]),'attributeContextKeys'=>array_map('count',$result[$version]['contexts']['Category.Item.Partials.CategoryAttributes']??[])];}
    if($kind!=='grid'){listCheck($counts['before']['macroCalls']===$n,'Baseline macro count');listCheck($counts['after']['macroCalls']===0,'Internal macro calls removed');}
    foreach($result['after']['contexts'] as $contexts)foreach($contexts as $keys){listCheck(!in_array('unrelatedContext0',$keys,true),'Request context leaked into card/attributes');if($scenario==='true-globals')listCheck(in_array('globalSentinel',$keys,true),'Real Twig global disappeared');}
    $rows[]=['language'=>$lang,'entry'=>$kind,'page'=>$page,'scenario'=>$scenario,'cards'=>$n,'beforeBytes'=>strlen($result['before']['html']),'afterBytes'=>strlen($result['after']['html']),'sha256'=>hash('sha256',$result['after']['html']),'calls'=>$result['after']['calls'],'technicalCounts'=>$counts,'byteEqual'=>$result['before']['html']===$result['after']['html'],'equalAfterListLinkAndIndentationComparison'=>true];
}
// Public macro import and standalone card entry points retain their old context boundary.
$compatibility=[];
foreach(['de','en','fr','it','es'] as $lang)foreach([1,2] as $variant){$globals=['dezimalcount'=>2,'percent'=>33,'cardPriorityImage'=>true];$ctx=['item'=>fixtureItems(1,$lang)[0],'variant'=>$variant,'currencycheck'=>'USD','isShoeCategory'=>true,'translations'=>['tAvailSizes'=>'Sizes','tInBasket'=>'Buy'],'transLabels'=>['availsizeonesize'=>'One'],'cardAttributeMap'=>null,'dezimalcount'=>4,'cardEagerImages'=>false,'percent'=>55];$html=[];foreach(['before'=>$argv[2],'after'=>$root]as$v=>$base){$f=new ListPreparationFixture($lang);[$twig]=$pair=preparationEnvironment($base,$f,$globals);$twig->getLoader()->setTemplate('macro',"{% import 'GuardiansBasicB2B::Category.Item.CategoryItem' as c %}{{ c.categoryItem(item,variant,currencycheck,isShoeCategory,translations,transLabels,cardAttributeMap) }}");foreach(['macro','GuardiansBasicB2B::Category.Item.Partials.CategoryListItem','GuardiansBasicB2B::Category.Item.Partials.CategoryListItem2']as$name)$html[$v][$name]=$twig->render($name,$ctx);}foreach ($html['before'] as $entry=>$output) listCheck(withoutInvalidCardComparisons($output,[100])===$html['after'][$entry],'Unexpected public/standalone difference outside invalid comparison price');$compatibility[]=['language'=>$lang,'variant'=>$variant,'equalExceptInvalidComparisonPrice'=>true,'entries'=>3];}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>Twig\Environment::VERSION,'renders'=>$rows,'compatibility'=>$compatibility,'limits'=>['Profiler counts and explicit context widths use real Twig 2/3 with deterministic service fixtures. They are not native PHP/IO timings.','No customer-specific price, stock, tax or basket transformation changed.']],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' list comparisons including the intended list-end link change and '.count($compatibility).' public/standalone price and context comparisons PASS, Twig '.Twig\Environment::VERSION.PHP_EOL;
