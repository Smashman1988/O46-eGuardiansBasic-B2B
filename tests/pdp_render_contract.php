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
    public $wishListSnapshot = [], $wishListHit = false;
    function __construct($lang,$request){$this->lang=$lang;$this->request=$request;}
    function __call($name,$args){
        $this->calls[]=$name;
        switch($name){
            case 'setType': return null;
            case 'getVariationAttributeMap': return [['variationId'=>1011,'attributes'=>[['attributeId'=>1,'attributeValueId'=>1]]],['variationId'=>1012,'attributes'=>[['attributeId'=>1,'attributeValueId'=>2]]]];
            case 'getBasketForTemplate': return ['itemQuantity'=>$this->quantity,'currency'=>'EUR'] + $this->wishListSnapshot;
            case 'getBasketQuantity': return $this->quantity;
            case 'getURLById': return '/'.$this->lang.'/category-'.$args[0].'/';
            case 'getItemCrossSellingList': return ['documents'=>[['data'=>['item'=>['id'=>99]]]],'contextProbe'=>'cross-'.$this->lang];
            case 'getAttributeNameMap': return ['attributes'=>[['id'=>1,'name'=>'size-'.$this->lang]],'contextProbe'=>'attrs-'.$this->lang];
            case 'getLanguage': return $this->lang;
            case 'getCurrentTemplate': return 'tpl.item';
            case 'isItem': return true;
            case 'isItemInWishList': return $this->wishListHit;
            case 'isCheckout': case 'isCategory': case 'isSearch': case 'isMyAccount': case 'isCheapestSorting': return false;
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
    function sortImages($v){$this->sorts++;usort($v, fn($a,$b)=>$a['position']<=>$b['position']);return $v;}
    function integer($v){return (int)$v;}
    function itemName($v){return $v['texts']['name1']??'Product';}
    function itemURL($v){return '/product/a-42/';}
}
function repositoryTemplates($root){$result=[];foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root.'/resources/views')) as $file){if($file->getExtension()!=='twig')continue;$relative=substr(str_replace(DIRECTORY_SEPARATOR,'/',$file->getPathname()),strlen(str_replace(DIRECTORY_SEPARATOR,'/',$root.'/resources/views/')));$name='GuardiansBasicB2B::'.str_replace('/','.',substr($relative,0,-5));$result[$name]=file_get_contents($file->getPathname());$result[$name.'.twig']=$result[$name];}return $result;}
// Only two indentation gaps change when removing the unreachable header branch.
function normalizedHeaderIndent($html) {
    return preg_replace('/\s+(?=<div class="container nopadding">|<nav class="d-print-none">|<\/header>)/', "\n", $html);
}
function comparableProductHtml($html, $legacy) {
    $html = preg_replace_callback('~(<script type="application/ld\+json">)(.*?)(</script>)~s',function ($m) use ($legacy) {
        $data=json_decode(trim($m[2]),true,512,JSON_THROW_ON_ERROR);
        if (($data['@type']??null)!=='Product') return $m[0];
        if ($legacy && ($data['gtin13']??null)==='123') unset($data['gtin13']); // Deliberately invalid fixture barcode.
        $sort=function (&$object) use (&$sort) { if(!is_array($object))return; ksort($object); foreach($object as &$value)$sort($value); };
        $sort($data); return $m[1].json_encode($data,JSON_THROW_ON_ERROR).$m[3];
    },$html);
    // All normal controls are discounted. Markers scope the variant callback;
    // indentation before the sale value is the only text whitespace change.
    $html=str_replace(' data-eg-item-discount class=', ' class=', $html);
    return normalizedHeaderIndent(preg_replace('~\s*(<span class="item-action i-action-sale">)\s*(<span data-eg-item-rrp-percent>[^<]+</span>%)\s*(</span>)\s*~','$1$2$3',$html));
}
function assertPriceUi($html,$full,$price,$rrp,$special) {
    $dom = new DOMDocument(); $dom->loadHTML($html,LIBXML_NOERROR|LIBXML_NOWARNING); $xpath=new DOMXPath($dom);
    $root='//article[@data-mainitemid="42"]';
    $q=function($attr)use($xpath,$root){return $xpath->query($root.'//*[@'.$attr.']');};
    $groups=$q('data-eg-item-discount'); $hasPrice=is_numeric($price)&&$price>=0;
    $sale=$hasPrice && is_numeric($rrp) && $rrp>$price;
    if ($groups->length!==($full?3:0)) throw new RuntimeException('Expected 3 PDP sale sections and no Quickview sale block');
    if (!$full) return;
    foreach ($groups as $el) if ((strpos(' '.$el->getAttribute('class').' ',' d-none ')===false)!==$sale) throw new RuntimeException('Invalid visible sale UI');
    $specialNodes=$q('data-eg-item-special');
    if($specialNodes->length!==($special?1:0) || ($special && (trim($specialNodes[0]->textContent)!==$special || (strpos($specialNodes[0]->getAttribute('class'),'d-none')!==false)!==$sale))) throw new RuntimeException('Special badge corrupted');
    foreach (['data-eg-item-price'=>$hasPrice?number_format($price,2,',','.'):'',
              'data-eg-item-rrp'=>$sale?number_format($rrp,2,',','.'):'',
              'data-eg-item-rrp-spar'=>$sale?number_format($rrp-$price,2,',','.'):'',
              'data-eg-item-rrp-percent'=>$sale?number_format((1-$price/$rrp)*-100,0,',','.'):''] as $attr=>$expected) {
        $nodes=$q($attr);
        if ($nodes->length!==1 || trim($nodes[0]->textContent)!==$expected) throw new RuntimeException('Unexpected '.$attr.' for '.json_encode([$price,$rrp]));
        if ($attr==='data-eg-item-price' && (strpos($nodes[0]->parentNode->getAttribute('class'),'d-none')===false)!==$hasPrice) throw new RuntimeException('Invalid default price visibility');
    }
}
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
foreach ([null, 'true'] as $value) {
    foreach ([
        [1011, [], false], [1011, [909, '1011'], true], ['1011', [1011], true],
        [1011, ['10110'], false], [1011, null, true], [1011, '1011', false], [0, [], true]
    ] as [$variation, $snapshot, $hit]) {
        $cases[] = ['lang'=>'de', 'value'=>$value, 'builder'=>false, 'variation'=>$variation,
                    'snapshot'=>$snapshot, 'hit'=>$hit];
    }
}
$report=['mode'=>'LOCAL_REAL_OWN_TWIG_RENDER_EXPLICIT_PLATFORM_BOUNDARIES_NOT_NATIVE_PHP_TIMING','twig'=>Twig\Environment::VERSION,'cases'=>[],'changedProductSource'=>$before !== $after || $headers['before'] !== $headers['after'],'actualTemplates'=>array_keys($actual),'platformFixtures'=>array_keys($stubs)];
foreach($cases as $case){$pair=[];foreach(['before'=>$before,'after'=>$after] as $version=>$source){
    $req=new GuardRequest($case['value']);$svc=new GuardServices($case['lang'],$req);$svc->quantity=$case['quantity']??0;
    if (array_key_exists('snapshot', $case)) {
        $svc->wishListSnapshot = ['itemWishListIds' => $case['snapshot']];
        $svc->wishListHit = $case['hit'];
    }
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['SingleItem'=>$source,'Header'=>$headers[$version]]+$actual+$stubs+repositoryTemplates($root)),['cache'=>false,'autoescape'=>'html','strict_variables'=>false]);
    foreach(['getPartial'=>'partial','config'=>'config','trans'=>'trans','plugin_path'=>'pluginPath','createSeoPage'=>'seo','get_additional_styles'=>'styles','get_additional_scripts'=>'scripts','component'=>'component','recordContainer'=>'container','getCardAttributeMaps'=>'maps'] as $name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$svc,$method]));
    $twig->addFunction(new Twig\TwigFunction('getItemPropertiesById',[$propertyExtension,'getItemPropertiesById']));
    foreach(['get_consent_scripts','get_json_data','get_filtered_tags','get_shop_builder_scripts','ssr_entry','csrf_token','prepareSeoContent'] as $name)$twig->addFunction(new Twig\TwigFunction($name,[$svc,'noop']));
    foreach(['filterTabs','filterFields','specialOffer'] as $name)$twig->addFilter(new Twig\TwigFilter($name,[$svc,'identity']));
    $twig->addFilter(new Twig\TwigFilter('orderByKey',[$svc,'sortImages']));
    foreach(['int'=>'integer','itemName'=>'itemName','itemURL'=>'itemURL'] as $name=>$method)$twig->addFilter(new Twig\TwigFilter($name,[$svc,$method]));
    $item=['item'=>['id'=>42,'manufacturer'=>['name'=>'Fixture','externalName'=>'Fixture','logo'=>'','url'=>''],'feedbackCount'=>0,'feedbackDecimal'=>0], 'variation'=>['id'=>1011,'bundleType'=>'','availability'=>['id'=>1]],'images'=>['all'=>[['url'=>'/image.jpg','urlMiddle'=>'/image-middle.jpg','urlPreview'=>'/image-preview.jpg','position'=>0]]],'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4.99 EUR'],'currency'=>'EUR'],'rrp'=>['price'=>['value'=>9.99],'unitPrice'=>['value'=>9.99,'formatted'=>'9.99 EUR']]],'texts'=>['name1'=>'Fixture '.$case['lang'],'metaDescription'=>'Description','keywords'=>'Fixture','description'=>'<p>Product</p>','shortDescription'=>'Short','technicalData'=>''],'attributes'=>[],'properties'=>[],'barcodes'=>[['code'=>'123']]];
    $item['variation']['id'] = $case['variation'] ?? 1011;
    for($image=1;$image<($case['images']??3);$image++)$item['images']['all'][]=['url'=>'/image-'.$image.'.jpg','urlMiddle'=>'/image-middle-'.$image.'.jpg','urlPreview'=>'/image-preview-'.$image.'.jpg','position'=>$image];
    $ctx=['request'=>$req,'item'=>['documents'=>[['data'=>$item]]],'services'=>array_fill_keys(['ItemCrossSellingService','item','url','basket','localizationRepository','wishList','template','checkout','propertyFile','order','country','webstoreConfig','category','itemList'],$svc),'isShopBuilder'=>$case['builder'],'category'=>null,'defaultCategory'=>['details'=>[['name'=>'Category']]],'buildHash'=>'fixture','webstoreConfig'=>['defaultLanguage'=>'de','domainSsl'=>'https://b2b.outlet46.de','name'=>'Fixture','browserLanguage'=>[]],'ceresConfig'=>['global'=>['blockCookies'=>false],'log'=>['performanceLevel'=>'live','checkSyntax'=>false],'header'=>['companyLogo'=>'/logo.png']],'context'=>new class {function renderState(){return '';}},'urls'=>['templateType'=>'item','appendTrailingSlash'=>true,'search'=>'/search/'],'currencyData'=>['symbol'=>'EUR'],'locale'=>$case['lang'],'assetName'=>'ceres-base','showNetPrices'=>true,'notifications'=>[]];
    $html=$twig->render('SingleItem',$ctx);$full=$twig->createTemplate("{{ request.get('quickViewItem') is empty ? 'full' : 'quickview' }}")->render(['request'=>$req]);
    $pair[$version]=['html'=>$html,'sha256'=>hash('sha256',$html),'bytes'=>strlen($html),'texts'=>$svc->texts,'calls'=>$svc->calls,'containers'=>$svc->containers,'sorts'=>$svc->sorts,'fullPage'=>$full==='full','externalStyle'=>substr_count($html,'<style data-probe>'),'externalScript'=>substr_count($html,'<script data-probe>')];
}
    $full=$pair['before']['fullPage'];$expected=$pair['before']['calls'];
    $shouldUseSnapshot = is_array($case['snapshot'] ?? null) && $case['variation'] > 0;
    if ($shouldUseSnapshot) {
        $expected = array_values(array_filter($expected, fn ($call) => $call !== 'isItemInWishList'));
    }
    if (in_array('isItemInWishList', $pair['after']['calls'], true) === $shouldUseSnapshot) {
        throw new RuntimeException('Unexpected wishlist lookup or missing fallback');
    }
    if($full){$seen=false;foreach($expected as $index=>$call){if($call==='getBasketForTemplate'){if($seen){unset($expected[$index]);}else{$seen=true;}}}$expected=array_values($expected);}
    if ($full && strpos($headers['before'], '{% if isVueView %}') !== false) {
        $old = ['getCurrentTemplate','getCurrentTemplate','isCheckout','getCurrentTemplate','getCurrencyData','getCurrencyData','shouldBeCached','getURLById','getCurrencyData'];
        $at = null;
        for ($i = 0; $i < count($expected); $i++) {
            if (array_slice($expected,$i,count($old)) === $old) { $at=$i; break; }
        }
        if ($at === null) throw new RuntimeException('Baseline header read sequence missing');
        array_splice($expected,$at,count($old),['getCurrencyData','shouldBeCached','getURLById']);
    }
    $textDelta=count($pair['before']['texts'])-count($pair['after']['texts']);
    $guardAlreadyPresent=strpos($before,'Detail properties and recommendation cards are omitted from Quickview')!==false;
    $matrixReuseAlreadyPresent=strpos($before,'set matrixLabel =')!==false;
    if($textDelta!==(($full||$guardAlreadyPresent?0:32)+($matrixReuseAlreadyPresent?0:10)))throw new RuntimeException('Unexpected translation call change');
    $imageSortReuseAlreadyPresent=strpos($before,'for prevImg in sortedItemImages')!==false;
    $expectedBeforeSorts=$full&&($case['images']??3)>1&&!$imageSortReuseAlreadyPresent?2:1;
    if($pair['before']['sorts']!==$expectedBeforeSorts||$pair['after']['sorts']!==1)throw new RuntimeException('Unexpected image sorting count');
    if(comparableProductHtml($pair['before']['html'],true)!==comparableProductHtml($pair['after']['html'],false)||$pair['after']['calls']!==$expected||$pair['before']['containers']!==$pair['after']['containers']){file_put_contents($argv[2].'.failure.json',json_encode(['case'=>$case,'pair'=>$pair],JSON_PRETTY_PRINT));throw new RuntimeException('Render or retained service sequence changed');}
    if(!$full&&($pair['after']['externalStyle']||$pair['after']['externalScript']||$pair['after']['containers']))throw new RuntimeException('Quickview reached external include/container');
    if($full&&$pair['after']['externalStyle']!==1)throw new RuntimeException('Full page inherited external context probe missing');
    if($case['builder']&&$pair['after']['externalScript']!==1)throw new RuntimeException('Builder full-page script context probe missing');
    if ($case['lang'] === 'de' && $full && ($case['quantity'] ?? -1) === 0) {
        $imageContext = $ctx;
        $imageContext['item']['documents'][0]['data']['images']['all'] = array_reverse($item['images']['all']);
        $imageHtml = $twig->render('SingleItem', $imageContext);
        if (strpos($imageHtml, '<link rel="preload" href="/image-middle.jpg" as="image">') === false ||
            strpos($imageHtml, '<img fetchpriority="high" src="/image-middle.jpg"') === false ||
            strpos($imageHtml, '<link rel="preload" href="/image-middle-2.jpg"') !== false) {
            throw new RuntimeException('PDP preload and main gallery must select the same sorted image');
        }
        $imageContext['item']['documents'][0]['data']['images']['all'] = [];
        $imageHtml = $twig->render('SingleItem', $imageContext);
        if (strpos($imageHtml, '<link rel="preload" href="" as="image">') !== false) {
            throw new RuntimeException('PDP must omit empty image preload');
        }
        $report['imagePreload'] = ['unsortedImages'=>'PASS', 'emptyGallery'=>'PASS'];
    }
    if ($case['lang'] === 'de' && ($case['quantity'] ?? -1) === 0) {
        foreach ([0, 0.0, '0', '0.00', null] as $unitRrp) {
            $edgeContext = $ctx;
            $edgeContext['item']['documents'][0]['data']['prices']['rrp']['unitPrice']['value'] = $unitRrp;
            $edgeHtml = $twig->render('SingleItem', $edgeContext);
            assertPriceUi($edgeHtml,$full,4.99,$unitRrp,'');
            $report['zeroUnitRrp'][] = ['fullPage'=>$full, 'value'=>$unitRrp];
        }
        foreach ([[4.99,null,'Neu'],[4.99,2.5,'Top'],[4.99,4.99,''],[4.99,'N / A','Top'],
                  ['N / A',9.99,'Neu'],[null,null,''],['4.99','9.99','Top'],[0,9.99,'Neu']] as [$price,$rrp,$special]) {
            $edgeContext=$ctx; $data=&$edgeContext['item']['documents'][0]['data'];
            if ($rrp===null) unset($data['prices']['rrp']); else $data['prices']['rrp']['unitPrice']['value']=$rrp;
            $data['prices']['default']['unitPrice']['value']=$price;
            $data['item']['storeSpecial']=['id'=>$special==='Top'?2:($special==='Neu'?3:0)];
            assertPriceUi($twig->render('SingleItem',$edgeContext),$full,$price,$rrp,$special); unset($data);
            $report['comparisonPrices'][]=['fullPage'=>$full,'price'=>$price,'rrp'=>$rrp,'special'=>$special];
        }
    }
    $report['cases'][]=$case+['status'=>'PASS','fullPage'=>$full,'htmlBytes'=>$pair['after']['bytes'],'sha256'=>$pair['after']['sha256'],'identicalHtml'=>$pair['before']['html']===$pair['after']['html'],'equalExceptDocumentedHeaderPriceAndSchemaChanges'=>true,'beforeCalls'=>$pair['before']['calls'],'afterCalls'=>$pair['after']['calls'],'translationCallsBefore'=>count($pair['before']['texts']),'translationCallsAfter'=>count($pair['after']['texts']),'imageSortsBefore'=>$pair['before']['sorts'],'imageSortsAfter'=>$pair['after']['sorts'],'removedCalls'=>count($pair['before']['calls'])-count($pair['after']['calls']),'externalStyles'=>$pair['after']['externalStyle'],'externalScripts'=>$pair['after']['externalScript']];
}
// Header alone: retain full basket preparation and the existing PDP snapshot.
foreach(['de','en','fr','it','es']as$lang)foreach([0,9,9.5,10,25]as$quantity)foreach([false,true]as$snapshot){$pair=[];foreach(['before','after']as$version){
    $req=new GuardRequest(null);$svc=new GuardServices($lang,$req);$svc->quantity=$quantity;
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['Header'=>$headers[$version]]+$stubs),['cache'=>false,'autoescape'=>'html']);
    foreach(['trans'=>'trans','plugin_path'=>'pluginPath']as$name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$svc,$method]));
    $hc=$ctx;$hc['services']=array_fill_keys(array_keys($ctx['services']),$svc);$hc['category']=null;
    if($snapshot)$hc['pdpBasketForHeader']=['itemQuantity'=>$quantity,'currency'=>'EUR'];
    $pair[$version]=['html'=>$twig->render('Header',$hc),'calls'=>$svc->calls];
}if(normalizedHeaderIndent($pair['before']['html'])!==normalizedHeaderIndent($pair['after']['html']))throw new RuntimeException('Header quantity output changed');
 $beforeBasket=array_values(array_filter($pair['before']['calls'],fn($x)=>strpos($x,'getBasket')===0));$afterBasket=array_values(array_filter($pair['after']['calls'],fn($x)=>strpos($x,'getBasket')===0));
 if($beforeBasket!==($snapshot?[]:['getBasketForTemplate'])||$afterBasket!==($snapshot?[]:['getBasketForTemplate']))throw new RuntimeException('Header getter side effects changed');
 $report['headers'][]=['lang'=>$lang,'quantity'=>$quantity,'pdpSnapshot'=>$snapshot,'identicalHtml'=>$pair['before']['html']===$pair['after']['html'],'equalExceptHeaderIndent'=>true,'beforeBasketCalls'=>$beforeBasket,'afterBasketCalls'=>$afterBasket];
}
$report['status']='PASS';$report['dependencyDeprecations']=$notices;file_put_contents($argv[2],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE));echo count($report['cases']).' actual-own-template ALT/NEU renders PASS, Twig '.Twig\Environment::VERSION.PHP_EOL;
