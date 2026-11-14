<?php
// php tests/card_image_loading.php <Twig autoload> <baseline views directory> <report.json>
// Real Twig renders: media selection and image fallbacks may change; all other
// card content, prices, URLs, order, attributes and service calls must not.
require $argv[1];
require __DIR__.'/card_markup_contract.php';
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
function imageCheck($condition, $message) { if (!$condition) throw new RuntimeException($message); }
class ImageCardFixture {
    public $lang, $dictionary=[], $calls=[];
    function __construct($lang) {
        $this->lang=$lang;
        foreach (['de',$lang] as $language) foreach (file(__DIR__.'/../resources/lang/'.$language.'/Template.properties') as $line) {
            if (preg_match('/^([\w.-]+)\s*=\s*(.*)$/u',trim($line),$m)) $this->dictionary[$m[1]]=$m[2];
        }
    }
    function count($key) { $this->calls[$key]=($this->calls[$key]??0)+1; }
    function trans($key) { $this->count('trans'); $parts=explode('::Template.',$key);return $this->dictionary[end($parts)]??$key; }
    function path($name) { $this->count('path');return '/fixture/'.$name; }
    function partial($name) { return 'layout'; }
    function noop() { return ''; }
    function url($data) { $this->count('itemURL');return '/'.$this->lang.'/product-'.$data['variation']['itemId'].'/'; }
    function name($data) { $this->count('itemName');return $data['texts']['name1']; }
    function attributes($id) { $this->count('attributes');return ['attributes'=>[['type'=>'box','values'=>[['position'=>1,'name'=>'M'],['position'=>2,'name'=>'L & XL']]]]]; }
    function batch($ids) { $this->count('batch');$maps=[];foreach($ids as $id)$maps[$id]=$this->attributes($id);return $maps; }
    function order($rows,$key) { usort($rows,function($a,$b)use($key){return $a[$key]<=>$b[$key];});return $rows; }
}
class ImageCardServices {
    public $checkout,$localizationRepository;
    function __construct($lang) {
        $this->checkout=new class { function getCurrencyData(){return ['name'=>'EUR'];} };
        $this->localizationRepository=new class($lang) { private $lang;function __construct($lang){$this->lang=$lang;}function getLanguage(){return $this->lang;} };
    }
}
function imageEnvironment($baseline, $fixture) {
    $names=['Category.Item.CategoryItem','Category.Item.CategoryItemContent','Category.Item.Partials.CategoryListItem','Category.Item.Partials.CategoryListItem2','Category.Item.Partials.CategoryGridOnly','Category.Item.Partials.CategoryAttributes','Category.Item.Partials.AllItemsLink','Category.Macros.render-rating'];
    $templates=['layout'=>'{% block PageBody %}{% endblock %}'];
    foreach($names as $name){$relative=str_replace('.','/',$name).'.twig';$file=$baseline.'/'.$relative;if(!is_file($file))$file=__DIR__.'/../resources/views/'.$relative;$templates['GuardiansBasicB2B::'.$name]=file_get_contents($file);}
    foreach(['Category.Item.Partials.Pagination','Category.Item.Partials.FacetFilter2','Category.Item.Partials.FacetFilter3'] as $name)$templates['GuardiansBasicB2B::'.$name]='';
    foreach(['Ceres::PageDesign.Macros.LayoutContainer','Ceres::PageDesign.Macros.ItemName'] as $name)$templates[$name]='';
    $twig=new Twig\Environment(new Twig\Loader\ArrayLoader($templates));
    foreach(['trans'=>'trans','plugin_path'=>'path','getPartial'=>'partial','config'=>'noop','queryString'=>'noop','createSeoPage'=>'noop','getAttributesWithImages'=>'attributes','getCardAttributeMaps'=>'batch'] as $name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$fixture,$method]));
    foreach(['itemURL'=>'url','itemName'=>'name','orderByKey'=>'order'] as $name=>$method)$twig->addFilter(new Twig\TwigFilter($name,[$fixture,$method]));
    return $twig;
}
function imageItems($count,$lang,$missingThird=false) {
    $items=[];
    for($i=0;$i<$count;$i++){$id=100+$i;$items[]=['data'=>['item'=>['id'=>$id,'flagTwo'=>0,'manufacturer'=>['name'=>'Brand "A" & B','logo'=>$i%3?'https://cdn02.outlet46.de/frontend/vendor/brand.svg':''],'feedbackCount'=>$i%2,'feedbackDecimal'=>3.7],'variation'=>['id'=>10000+$id,'itemId'=>$id],'texts'=>['name1'=>$lang.' Product "'.$id.'" & sizes'],'images'=>['all'=>$missingThird&&$i===2?[]:[['urlPreview'=>'/images/product-'.$id.'.jpg']]],'prices'=>['default'=>['unitPrice'=>['value'=>4.99,'formatted'=>'4,99 €']],'rrp'=>['unitPrice'=>['value'=>$i%4?19.99:null,'formatted'=>'19,99 €']]],'tags'=>$i%2?[['id'=>284]]:[]]];}
    return $items;
}
function imageContractWithoutResponsiveSources($html) {
    // libxml's HTML4 parser nests HTML5 <source> elements. Remove only the
    // intended opening tags before parsing, so removing a source cannot also
    // remove its following image or fallback from the invariant comparison.
    $html=preg_replace('/<source\b[^>]*\bmedia="\(min-width: (?:768|1200)px\)"[^>]*>/','',$html);
    $html=preg_replace('/(<img\b[^>]*?)\sloading="lazy"/','$1',$html);
    return cardMarkupContract($html);
}
$rows=[];$current=__DIR__.'/../resources/views';
foreach(['de','en','fr','it','es'] as $lang)foreach(['category'=>'Category.Item.CategoryItem','content'=>'Category.Item.CategoryItemContent','home'=>'Category.Item.Partials.CategoryGridOnly'] as $kind=>$name)foreach([1,2] as $page)foreach([false,true] as $missingThird){
    $count=$kind==='home'?60:12;$items=imageItems($count,$lang,$missingThird);
    $ctx=['lang'=>$lang,'itemList'=>$items,'services'=>new ImageCardServices($lang),'category'=>['id'=>44,'parentCategoryId'=>0,'details'=>[['name'=>'Fixture category']]],'currentPage'=>$page,'pageMax'=>3,'itemCountTotal'=>$count,'request'=>new class {function get($key){return null;}},'prioritizeFirstCardImage'=>true,'isQuickView'=>true];
    $html=[];$calls=[];
    foreach(['before'=>$argv[2],'after'=>$current] as $version=>$base){$fixture=new ImageCardFixture($lang);$twig=imageEnvironment($base,$fixture);$html[$version]=$twig->render('GuardiansBasicB2B::'.$name,$ctx);$calls[$version]=$fixture->calls;}
    imageCheck($calls['before']===$calls['after'],'Service/helper calls changed '.$lang.'/'.$kind.'/'.$page);
    imageCheck(cardMarkupContract($html['before'])===imageContractWithoutResponsiveSources($html['after']),'Business markup or old image fallback changed '.$lang.'/'.$kind.'/'.$page);
    if($kind==='home')imageCheck($html['before']===$html['after'],'Home 60-card HTML must be byte-identical');
    $dom=cardMarkupDocument($html['after']);$xpath=new DOMXPath($dom);$cards=$xpath->query('//*[@data-eg-item]');imageCheck($cards->length===$count,'Card count changed');$mediaSources=0;
    foreach($cards as $index=>$card){
        imageCheck($card->getAttribute('data-eg-item')===(string)(100+$index),'Article order changed');
        $sources=$xpath->query('.//picture//source[@media]',$card);$img=$xpath->query('.//picture//img',$card)->item(0);$url=$items[$index]['data']['images']['all'][0]['urlPreview']??'';
        $eligible=$kind!=='home'&&$index>=2&&$index<=5&&$url!=='';
        imageCheck($sources->length===($eligible?2:0),'Unexpected responsive image scope at card '.($index+1));
        if($eligible){
            $media='(min-width: '.($index<4?768:1200).'px)';
            imageCheck($sources->item(0)->getAttribute('media')===$media&&$sources->item(1)->getAttribute('media')===$media,'Wrong responsive breakpoint');
            imageCheck($sources->item(0)->getAttribute('type')==='image/avif'&&$sources->item(0)->getAttribute('srcset')===$url.'.avif','AVIF candidate changed');
            imageCheck(!$sources->item(1)->hasAttribute('type')&&$sources->item(1)->getAttribute('srcset')===$url,'Original-format fallback missing');
            imageCheck($img->getAttribute('loading')==='lazy'&&$img->getAttribute('src')===''&&$img->getAttribute('data-src')===$url,'Observer and native loading contract changed');
            imageCheck($xpath->query('.//picture//source[@data-srcset]',$card)->item(0)->getAttribute('data-srcset')===$url.'.avif','Original lazy AVIF fallback changed');
            imageCheck($img->getAttribute('fetchpriority')!=='high','New high priority was introduced');
        }
        if($kind!=='home'&&$index<2){imageCheck(!$img->hasAttribute('loading'),'First-two image behavior changed');imageCheck($page===1?$img->getAttribute('src')===$url:$img->getAttribute('data-src')===$url,'First-two eager/page2 lazy contract changed');}
        $mediaSources+=$sources->length;
    }
    $rows[]=['language'=>$lang,'entry'=>$kind,'page'=>$page,'missingThird'=>$missingThird,'cards'=>$count,'mediaSources'=>$mediaSources,'additionalBytes'=>strlen($html['after'])-strlen($html['before']),'businessMarkupAndServiceCalls'=>'PASS','homeByteIdentical'=>$kind==='home'];
}
// Direct shared-card consumers keep their existing lazy, priority and eager modes.
$standalone=[];
foreach(['de','en','fr','it','es'] as $lang)foreach(['lazy','priority','eager'] as $mode){$output=[];foreach(['before'=>$argv[2],'after'=>$current] as $version=>$base){$fixture=new ImageCardFixture($lang);$twig=imageEnvironment($base,$fixture);$output[$version]=$twig->render('GuardiansBasicB2B::Category.Item.Partials.CategoryListItem'.($mode==='eager'?'2':''),['item'=>imageItems(1,$lang)[0],'cardPriorityImage'=>$mode==='priority','translations'=>[],'transLabels'=>[]]);}imageCheck($output['before']===$output['after'],'Standalone card changed '.$lang.'/'.$mode);$standalone[]=['language'=>$lang,'mode'=>$mode,'byteIdentical'=>true];}
$report=['status'=>'PASS','twig'=>Twig\Environment::VERSION,'listCases'=>$rows,'standaloneCases'=>$standalone,'limits'=>['Deterministic service fixtures with real Twig 2/3. No native network, customer-class or live deployment acceptance.','Page 2 first two images intentionally retain their existing Lozad policy.']];
file_put_contents($argv[3],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' list image/markup contracts and '.count($standalone).' unchanged standalone cards PASS; Twig '.Twig\Environment::VERSION.PHP_EOL;
