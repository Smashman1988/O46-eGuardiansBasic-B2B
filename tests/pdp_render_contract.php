<?php
// Actual PDP/Header/PageDesign renders with explicit platform and navigation boundaries.
// php tests/pdp_render_contract.php <Twig autoload> <report.json> <before-dir>
require $argv[1];
$root = dirname(__DIR__);
require $root . '/src/Helper/SeoPage.php';
class GuardTwigExtensionStub {}
class_alias(GuardTwigExtensionStub::class, 'Plenty\\Plugin\\Templates\\Extensions\\Twig_Extension');
require $root . '/src/Extensions/Base_Extension.php';
$propertyExtension = (new ReflectionClass(\GuardiansBasicB2B\Extensions\Base_Extension::class))->newInstanceWithoutConstructor();
$notices = [];
set_error_handler(function ($level,$message,$file,$line) use (&$notices) {
    if (in_array($level,[E_DEPRECATED,E_USER_DEPRECATED],true)) { $notices[$message] = [$file,$line]; return true; }
    throw new ErrorException($message,0,$level,$file,$line);
});
class GuardRequest { public $value; function __construct($v){$this->value=$v;} function get($key){return $key==='quickViewItem'?$this->value:null;} function getRequestUri(){return '/product/?quickViewItem='.(is_scalar($this->value)?(string)$this->value:'');} }
class GuardServices {
    public $calls=[],$lang,$request,$containers=[],$texts=[],$quantity=0,$sorts=0;
    function __construct($lang,$request){$this->lang=$lang;$this->request=$request;}
    function __call($name,$args){
        $this->calls[]=$name;
        switch($name){
            case 'setType': return null;
            case 'getVariationAttributeMap': return [['variationId'=>1011,'attributes'=>[['attributeId'=>1,'attributeValueId'=>1]]],['variationId'=>1012,'attributes'=>[['attributeId'=>1,'attributeValueId'=>2]]]];
            case 'getBasketForTemplate': return ['itemQuantity'=>$this->quantity,'currency'=>'EUR'];
            case 'getBasketQuantity': return $this->quantity;
            case 'getURLById': return '/'.$this->lang.'/category-'.$args[0].'/';
            case 'getItemCrossSellingList': return ['documents'=>[['data'=>['item'=>['id'=>99]]]],'contextProbe'=>'cross-'.$this->lang];
            case 'getAttributeNameMap': return ['attributes'=>[['id'=>1,'name'=>'size-'.$this->lang]],'contextProbe'=>'attrs-'.$this->lang];
            case 'getLanguage': return $this->lang;
            case 'getCurrentTemplate': return 'tpl.item';
            case 'isItem': return true;
            case 'isCheckout': case 'isCategory': case 'isSearch': case 'isMyAccount': case 'isCheapestSorting': case 'isItemInWishList': return false;
            case 'shouldBeCached': return true;
            case 'getCanonicalURL': return '/'.($args[0]??$this->lang).'/product/a-42/';
            case 'getLanguageURLs': return array_combine(['de','en','fr','it','es'],array_map(function($l){return '/'.$l.'/product/a-42/';},['de','en','fr','it','es']));
            case 'getCategoryURL': return new class { function toAbsoluteUrl($v){return '/category/';} };
            case 'getCurrentCategory': return null;
            case 'getCurrencyData': return ['name'=>'EUR','symbol'=>'EUR'];
            case 'getCurrencyPattern': return '#,##0.00';
            case 'getShippingCountryId': return 1;
            case 'getActiveCountriesList': return [['id'=>1,'currLangName'=>'Germany','isoCode2'=>'DE']];
            case 'getPropertyFileUrl': return '/properties';
            case 'getOrderItemPrefix': return '';
            case 'getWebstoreConfig': return ['domainSsl'=>'https://b2b.outlet46.de'];
        }
        throw new RuntimeException('Unexpected platform service '.$name);
    }
    function config($key){$this->calls[]='config:'.$key;return $key==='Ceres.currency.format'?'symbol':($key==='IO.routing.enabled_routes'?'home, category, item':false);}
    function partial($key){return ['page-design'=>'PageDesign','head'=>'Head','page-metadata'=>'Metadata','header'=>'Header','footer'=>'fixture-footer'][$key];}
    function trans($key,$params=[]){$this->texts[]=$key;return $this->lang.':'.$key;}
    function pluginPath($name){return '/plugins/'.$name;}
    function styles(){ $this->calls[]='additionalStyles';return [['path'=>'fixture-external-style','params'=>[]]]; }
    function scripts(){ $this->calls[]='additionalScripts';return [['path'=>'fixture-external-script','params'=>[]]]; }
    function component($name){$this->calls[]='component:'.$name;return '';}
    function noop(...$args){return '';}
    function container($name,$object=null){$this->containers[]=['name'=>$name,'object'=>$object];return '<!--container:'.$name.'-->';}
    function seo($template,$max=null,$page=null,$total=null){return new \GuardiansBasicB2B\Helper\SeoPage([], $template,$max,$page,$total);}
    function maps($ids){if($ids)throw new RuntimeException('Unexpected recommendations query');return [];}
    function identity($v){return $v;}
    function sortImages($v){$this->sorts++;return $v;}
    function integer($v){return (int)$v;}
    function itemName($v){return $v['texts']['name1']??'Product';}
    function itemURL($v){return '/product/a-42/';}
}
function repositoryTemplates($root){$result=[];foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root.'/resources/views')) as $file){if($file->getExtension()!=='twig')continue;$relative=substr(str_replace(DIRECTORY_SEPARATOR,'/',$file->getPathname()),strlen(str_replace(DIRECTORY_SEPARATOR,'/',$root.'/resources/views/')));$name='GuardiansBasicB2B::'.str_replace('/','.',substr($relative,0,-5));$result[$name]=file_get_contents($file->getPathname());$result[$name.'.twig']=$result[$name];}return $result;}
$before=file_get_contents($argv[3].'/SingleItem.twig');
$after=file_get_contents($root.'/resources/views/Item/SingleItem.twig');
$headers=['before'=>file_get_contents($argv[3].'/Header.twig'),'after'=>file_get_contents($root.'/resources/views/PageDesign/Partials/Header/Header.twig')];
$actual=[];
foreach(['PageDesign'=>'PageDesign/PageDesign','Head'=>'PageDesign/Partials/Head','Metadata'=>'PageDesign/Partials/PageMetadata'] as $key=>$relative)$actual[$key]=file_get_contents($root.'/resources/views/'.$relative.'.twig');
// Framework macros/components are boundaries; own rendered main templates remain actual source.
$stubs=[
 'Ceres::PageDesign.Macros.LayoutContainer'=>'{% macro show(name,object) %}{{ recordContainer(name,object)|raw }}{% endmacro %}',
 'Ceres::PageDesign.Macros.ItemName'=>'{% macro get(name,bundle) %}{{ name }}{% endmacro %}',
 'Ceres::PageDesign.Macros.IncludeComponents'=>'{% macro include_components() %}{% endmacro %}',
 'Ceres::PageDesign.Macros.Translations'=>'{% macro add(plugin,type) %}{% endmacro %}',
 'fixture-header'=>'<header>HEADER</header>', 'fixture-footer'=>'<footer>FOOTER</footer>',
 'fixture-external-style'=>'<style data-probe>{{ [crossSellingList,itemAttributes]|json_encode|raw }}</style>',
 'fixture-external-script'=>'<script data-probe>{{ [crossSellingList,itemAttributes]|json_encode|raw }}</script>'
];
foreach(['Ceres::Widgets.WidgetComponents','Ceres::Widgets.ShopBuilderDataStore','GuardiansBasicB2B::PageDesign.Components.cashinadvance','GuardiansBasicB2B::PageDesign.Components.cookiebar','GuardiansBasicB2B::PageDesign.Components.ContactWidget','GuardiansBasicB2B::PageDesign.Components.NewsletterPopup','GuardiansBasicB2B::Containers.FeedbackContainer'] as $name)$stubs[$name]='<!--fixture '.$name.'-->';
foreach(['DE','EN','FR','IT','ES'] as $code)foreach(['nl-element','b2babfrage'] as $prefix)$stubs['GuardiansBasicB2B::PageDesign.Components.'.$prefix.$code]='<!--fixture '.$prefix.$code.'-->';
foreach(['','DE','EN','FR','IT','ES'] as $language)$stubs['GuardiansBasicB2B::Category.Macros.CategoryTree'.$language.'.twig']='{% macro get_nav_bar(categories,ignored) %}<li>NAVIGATION BOUNDARY</li>{% endmacro %}';
$cases=[];
foreach(['de','en','fr','it','es'] as $lang)foreach([null,'true'] as $value)foreach([0,9,10,25] as $quantity)$cases[]=['lang'=>$lang,'value'=>$value,'builder'=>false,'quantity'=>$quantity];
foreach(['',false,0,'0','false',[],['true']] as $value)$cases[]=['lang'=>'de','value'=>$value,'builder'=>false];
$cases[]=['lang'=>'de','value'=>null,'builder'=>true];
foreach([null,'true']as$value)$cases[]=['lang'=>'de','value'=>$value,'builder'=>false,'images'=>1];
$report=['mode'=>'LOCAL_REAL_OWN_TWIG_RENDER_EXPLICIT_PLATFORM_BOUNDARIES_NOT_NATIVE_PHP_TIMING','twig'=>Twig\Environment::VERSION,'cases'=>[],'changedProductSource'=>false,'actualTemplates'=>array_keys($actual),'platformFixtures'=>array_keys($stubs)];
foreach($cases as $case){$pair=[];foreach(['before'=>$before,'after'=>$after] as $version=>$source){
    $req=new GuardRequest($case['value']);$svc=new GuardServices($case['lang'],$req);$svc->quantity=$case['quantity']??0;
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['SingleItem'=>$source,'Header'=>$headers[$version]]+$actual+$stubs+repositoryTemplates($root)),['cache'=>false,'autoescape'=>'html','strict_variables'=>false]);
    foreach(['getPartial'=>'partial','config'=>'config','trans'=>'trans','plugin_path'=>'pluginPath','createSeoPage'=>'seo','get_additional_styles'=>'styles','get_additional_scripts'=>'scripts','component'=>'component','recordContainer'=>'container','getCardAttributeMaps'=>'maps'] as $name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$svc,$method]));
    $twig->addFunction(new Twig\TwigFunction('getItemPropertiesById',[$propertyExtension,'getItemPropertiesById']));
    foreach(['get_consent_scripts','get_json_data','get_filtered_tags','get_shop_builder_scripts','ssr_entry','csrf_token','prepareSeoContent'] as $name)$twig->addFunction(new Twig\TwigFunction($name,[$svc,'noop']));
    foreach(['filterTabs','filterFields','specialOffer'] as $name)$twig->addFilter(new Twig\TwigFilter($name,[$svc,'identity']));
    $twig->addFilter(new Twig\TwigFilter('orderByKey',[$svc,'sortImages']));
    foreach(['int'=>'integer','itemName'=>'itemName','itemURL'=>'itemURL'] as $name=>$method)$twig->addFilter(new Twig\TwigFilter($name,[$svc,$method]));
    $item=['item'=>['id'=>42,'manufacturer'=>['name'=>'Fixture','externalName'=>'Fixture','logo'=>'','url'=>''],'feedbackCount'=>0,'feedbackDecimal'=>0], 'variation'=>['id'=>1011,'bundleType'=>'','availability'=>['id'=>1]],'images'=>['all'=>[['url'=>'/image.jpg','urlMiddle'=>'/image-middle.jpg','urlPreview'=>'/image-preview.jpg','position'=>0]]],'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4.99 EUR'],'currency'=>'EUR'],'rrp'=>['price'=>['value'=>9.99],'unitPrice'=>['value'=>9.99,'formatted'=>'9.99 EUR']]],'texts'=>['name1'=>'Fixture '.$case['lang'],'metaDescription'=>'Description','keywords'=>'Fixture','description'=>'<p>Product</p>','shortDescription'=>'Short','technicalData'=>''],'attributes'=>[],'properties'=>[],'barcodes'=>[['code'=>'123']]];
    for($image=1;$image<($case['images']??3);$image++)$item['images']['all'][]=['url'=>'/image-'.$image.'.jpg','urlMiddle'=>'/image-middle-'.$image.'.jpg','urlPreview'=>'/image-preview-'.$image.'.jpg','position'=>$image];
    $ctx=['request'=>$req,'item'=>['documents'=>[['data'=>$item]]],'services'=>array_fill_keys(['ItemCrossSellingService','item','url','basket','localizationRepository','wishList','template','checkout','propertyFile','order','country','webstoreConfig','category','itemList'],$svc),'isShopBuilder'=>$case['builder'],'category'=>null,'defaultCategory'=>['details'=>[['name'=>'Category']]],'buildHash'=>'fixture','webstoreConfig'=>['defaultLanguage'=>'de','domainSsl'=>'https://b2b.outlet46.de','name'=>'Fixture','browserLanguage'=>[]],'ceresConfig'=>['global'=>['blockCookies'=>false],'log'=>['performanceLevel'=>'live','checkSyntax'=>false],'header'=>['companyLogo'=>'/logo.png']],'context'=>new class {function renderState(){return '';}},'urls'=>['templateType'=>'item','appendTrailingSlash'=>true,'search'=>'/search/'],'currencyData'=>['symbol'=>'EUR'],'locale'=>$case['lang'],'assetName'=>'ceres-base','showNetPrices'=>true,'notifications'=>[]];
    $html=$twig->render('SingleItem',$ctx);$full=$twig->createTemplate("{{ request.get('quickViewItem') is empty ? 'full' : 'quickview' }}")->render(['request'=>$req]);
    $pair[$version]=['html'=>$html,'sha256'=>hash('sha256',$html),'bytes'=>strlen($html),'texts'=>$svc->texts,'calls'=>$svc->calls,'containers'=>$svc->containers,'sorts'=>$svc->sorts,'fullPage'=>$full==='full','externalStyle'=>substr_count($html,'<style data-probe>'),'externalScript'=>substr_count($html,'<script data-probe>')];
}
    $full=$pair['before']['fullPage'];$expected=$pair['before']['calls'];
    if($full){$seen=false;foreach($expected as $index=>$call){if($call==='getBasketForTemplate'){if($seen){unset($expected[$index]);}else{$seen=true;}}}$expected=array_values($expected);}
    $textDelta=count($pair['before']['texts'])-count($pair['after']['texts']);
    $guardAlreadyPresent=strpos($before,'Detail properties and recommendation cards are omitted from Quickview')!==false;
    $matrixReuseAlreadyPresent=strpos($before,'set matrixLabel =')!==false;
    if($textDelta!==(($full||$guardAlreadyPresent?0:32)+($matrixReuseAlreadyPresent?0:10)))throw new RuntimeException('Unexpected translation call change');
    if($pair['before']['sorts']-$pair['after']['sorts']!==($full&&($case['images']??3)>1?1:0))throw new RuntimeException('Unexpected image sorting count');
    if($pair['before']['html']!==$pair['after']['html']||$pair['after']['calls']!==$expected||$pair['before']['containers']!==$pair['after']['containers']){file_put_contents($argv[2].'.failure.json',json_encode(['case'=>$case,'pair'=>$pair],JSON_PRETTY_PRINT));throw new RuntimeException('Render or retained service sequence changed');}
    if(!$full&&($pair['after']['externalStyle']||$pair['after']['externalScript']||$pair['after']['containers']))throw new RuntimeException('Quickview reached external include/container');
    if($full&&$pair['after']['externalStyle']!==1)throw new RuntimeException('Full page inherited external context probe missing');
    if($case['builder']&&$pair['after']['externalScript']!==1)throw new RuntimeException('Builder full-page script context probe missing');
    $report['cases'][]=$case+['status'=>'PASS','fullPage'=>$full,'htmlBytes'=>$pair['after']['bytes'],'sha256'=>$pair['after']['sha256'],'identicalHtml'=>true,'beforeCalls'=>$pair['before']['calls'],'afterCalls'=>$pair['after']['calls'],'translationCallsBefore'=>count($pair['before']['texts']),'translationCallsAfter'=>count($pair['after']['texts']),'imageSortsBefore'=>$pair['before']['sorts'],'imageSortsAfter'=>$pair['after']['sorts'],'removedCalls'=>count($pair['before']['calls'])-count($pair['after']['calls']),'externalStyles'=>$pair['after']['externalStyle'],'externalScripts'=>$pair['after']['externalScript']];
}
// Header alone: retain full basket preparation and the existing PDP snapshot.
foreach(['de','en','fr','it','es']as$lang)foreach([0,9,9.5,10,25]as$quantity)foreach([false,true]as$snapshot){$pair=[];foreach(['before','after']as$version){
    $req=new GuardRequest(null);$svc=new GuardServices($lang,$req);$svc->quantity=$quantity;
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['Header'=>$headers[$version]]+$stubs),['cache'=>false,'autoescape'=>'html']);
    foreach(['trans'=>'trans','plugin_path'=>'pluginPath']as$name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$svc,$method]));
    $hc=$ctx;$hc['services']=array_fill_keys(array_keys($ctx['services']),$svc);$hc['category']=null;
    if($snapshot)$hc['pdpBasketForHeader']=['itemQuantity'=>$quantity,'currency'=>'EUR'];
    $pair[$version]=['html'=>$twig->render('Header',$hc),'calls'=>$svc->calls];
}if($pair['before']['html']!==$pair['after']['html'])throw new RuntimeException('Header quantity output changed');
 $beforeBasket=array_values(array_filter($pair['before']['calls'],fn($x)=>strpos($x,'getBasket')===0));$afterBasket=array_values(array_filter($pair['after']['calls'],fn($x)=>strpos($x,'getBasket')===0));
 if($beforeBasket!==($snapshot?[]:['getBasketForTemplate'])||$afterBasket!==($snapshot?[]:['getBasketForTemplate']))throw new RuntimeException('Header getter side effects changed');
 $report['headers'][]=['lang'=>$lang,'quantity'=>$quantity,'pdpSnapshot'=>$snapshot,'identicalHtml'=>true,'beforeBasketCalls'=>$beforeBasket,'afterBasketCalls'=>$afterBasket];
}
$report['status']='PASS';$report['dependencyDeprecations']=$notices;file_put_contents($argv[2],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));echo count($report['cases']).' actual-own-template ALT/NEU renders PASS, Twig '.Twig\Environment::VERSION.PHP_EOL;
