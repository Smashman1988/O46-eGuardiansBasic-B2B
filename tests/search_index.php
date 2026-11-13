<?php
// php tests/search_index.php <Ceres-5.0.86-directory> <IO-5.0.86-directory> [browser-fixture.json]
// Tests the theme, real IO resource/formatter and Ceres list callers. Native factories
// are recording doubles: data below verifies the wiring, not the platform's index.
namespace SearchTest {
    class Factory {
        public $text, $completion, $correction, $prices, $fields, $categories=false, $defaultImage=false;
        public function __construct(public string $preset, public array $options) {}
        public function hasSearchString($q, $lang, $operator) { $this->text = [$q,$lang,$operator]; return $this; }
        public function withSuggestions($q, $lang) { $this->completion = [$q,$lang]; return $this; }
        public function withDidYouMeanSuggestions($q) { $this->correction = $q; return $this; }
        public function withResultFields($fields) { $this->fields=$fields; return $this; }
        public function withCategories() { $this->categories=true; return $this; }
        public function withDefaultImage() { $this->defaultImage=true; return $this; }
        public function hasPriceInRange($min, $max) { $this->prices = [$min,$max]; return $this; }
        public function setPage($page, $size) { $this->options['page']=$page; $this->options['itemsPerPage']=$size; return $this; }
    }
    class Application {
        public function register($class) {}
        public function bind($source,$target) { throw new \RuntimeException('Plugin classes must be resolved through pluginApp'); }
    }
    class Url {
        public function __construct(private string $lang, private int $id) {}
        public function append($suffix) { return $this; }
        public function toRelativeUrl($prefix) { return ($prefix ? '/'.$this->lang : '').'/product/a-'.$this->id.'/'; }
    }
    function check($condition,$message) {
        if (!$condition) throw new \RuntimeException($message);
        $GLOBALS['assertions']++;
    }
}
namespace Plenty\Plugin {
    class ServiceProvider { public function getApplication() { return \pluginApp(\SearchTest\Application::class); } }
    class ConfigRepository { public function get($key) { return 'all'; } }
}
namespace Plenty\Plugin\Templates { class Twig { public function addExtension($class) {} } }
namespace Plenty\Plugin\Log { trait Loggable {} }
namespace Plenty\Plugin\Events { class Dispatcher {
    public $listeners=[];
    public function listen($name,$fn,$priority=0) { $this->listeners[$name]=$fn; }
    public function hasListeners($name) { return isset($this->listeners[$name]); }
} }
namespace Plenty\Plugin\Http {
    class Request { public $data=[]; public function get($k,$d=null){return $this->data[$k] ?? $d;} }
    class Response { public function __construct(public $body, public int $status){} }
}
namespace IO\Api {
    class ApiResource { public function __construct(protected $request, protected $response) {} }
    class ApiResponse { public function create($body,$status){return new \Plenty\Plugin\Http\Response($body,$status);} }
    class ResponseCode { const OK=200, BAD_REQUEST=400; }
}
namespace IO\Helper {
    interface ContextInterface {}
    class TemplateContainer { public $context=\Ceres\Contexts\ItemSearchContext::class; public function setContext($class){$this->context=$class;} }
}
namespace IO\Services {
    class TemplateConfigService { public function getInteger($key){return 0;} }
    class CategoryService {}
}
namespace Ceres\Helper { class SearchOptions {
    const SCOPE_SEARCH='search', SCOPE_CATEGORY='category';
    public static function get($scope){return [];}
    public static function validateItemListOptions($o,$scope){return $o;}
} }
namespace Ceres\Contexts { class CategoryContext implements \IO\Helper\ContextInterface {
    protected $request, $params, $webstoreConfig;
    public function init($params){
        $this->params=$params; $this->request=\pluginApp(\Plenty\Plugin\Http\Request::class);
        $this->webstoreConfig=\pluginApp(\Plenty\Modules\Webshop\Contracts\WebstoreConfigurationRepositoryContract::class)->getWebstoreConfiguration();
    }
    protected function getParam($key,$default){return $this->params[$key] ?? $default;}
} }
namespace Plenty\Modules\Webshop\Contracts {
    class LocalizationRepositoryContract { public $lang='de'; public function getLanguage(){return $this->lang;} }
    class UrlBuilderRepositoryContract {
        public function buildVariationUrl($id,$vid,$lang){return new \SearchTest\Url($lang,$id);}
        public function getSuffix($id,$vid,$withVariation){return '';}
    }
    class WebstoreConfigurationRepositoryContract {
        public function getWebstoreConfiguration(){return (object)['itemSearchOperator'=>'and','itemAutocompleteSearchOperator'=>'or','defaultLanguage'=>'de','attributeSelectDefaultOption'=>0];}
    }
}
namespace Plenty\Modules\Webshop\Consent\Contracts { class ConsentRepositoryContract { public function registerConsent($key,$name,$settings) {} } }
namespace Plenty\Modules\Webshop\ItemSearch\Helpers {
    class SortingHelper { public function getUsedItemName(){return 'texts.name1';} }
    class ResultFieldTemplate {
        const TEMPLATE_LIST_ITEM=1,TEMPLATE_SINGLE_ITEM=2,TEMPLATE_BASKET_ITEM=3,TEMPLATE_AUTOCOMPLETE_ITEM_LIST=4,TEMPLATE_CATEGORY_TREE=5,TEMPLATE_VARIATION_ATTRIBUTE_MAP=6;
        public function setTemplates($templates) {}
        public static function load($template) {
            if ($template !== self::TEMPLATE_AUTOCOMPLETE_ITEM_LIST) throw new \RuntimeException('Unexpected result field template');
            return json_decode(file_get_contents(dirname(__DIR__).'/resources/views/ResultFields/AutoCompleteListItem.fields.json'),true,512,JSON_THROW_ON_ERROR);
        }
    }
}
namespace Plenty\Modules\ContentCache\CacheBlocks\Contracts { class CacheTagRepositoryContract {
    public function makeTaggable($key,$fn,$type) { \SearchTest\check([$key,$type]===['itemList','item'],'list cache tag'); return $fn(); }
} }
namespace Plenty\Modules\Webshop\ItemSearch\SearchPresets {
    class Preset { public static function getSearchFactory($o){return new \SearchTest\Factory(static::class,$o);} }
    class SearchItems extends Preset {
        public static function getSearchFactory($o) {
            $factory=parent::getSearchFactory($o);
            // Record IO's autocomplete preset contract, without simulating its native image mutators.
            if (($o['autocomplete'] ?? false) === true) $factory->withResultFields(\Plenty\Modules\Webshop\ItemSearch\Helpers\ResultFieldTemplate::load(4));
            return $factory;
        }
    }
    class SearchSuggestions extends Preset {}
    class Facets extends Preset {}
    class CategoryItems extends Preset {}
}
namespace Plenty\Modules\Webshop\ItemSearch\Services { class ItemSearchService {
    public $calls=[], $next=[];
    public function getResults($factories) {
        $this->calls[]=$factories;
        if (!$this->next) throw new \RuntimeException('Unexpected extra search');
        return array_shift($this->next);
    }
} }
namespace {
    use Ceres\Contexts\ItemSearchContext;
    use GuardiansBasicB2B\Contexts\EnglishTextSearchContext;
    use GuardiansBasicB2B\Services\EnglishTextSearch;
    use IO\Services\ItemSearchAutocompleteService;
    use Plenty\Modules\Webshop\Contracts as Shop;
    use Plenty\Modules\Webshop\ItemSearch\SearchPresets as Presets;
    use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
    use Plenty\Plugin\Http\Request;
    use function SearchTest\check;

    $assertions=0; $objects=[];
    function pluginApp($class) {
        global $objects;
        if ($class===ItemSearchAutocompleteService::class || $class===\GuardiansBasicB2B\Services\SearchAutocompleteService::class) {
            return new $class(pluginApp(Shop\UrlBuilderRepositoryContract::class),pluginApp(Shop\LocalizationRepositoryContract::class),pluginApp(Shop\WebstoreConfigurationRepositoryContract::class));
        }
        return $objects[$class] ??= new $class();
    }
    if ($argc!==3 && $argc!==4) throw new RuntimeException('Expected directories of Ceres and IO 5.0.86 and optional browser fixture path');
    foreach (array_slice($argv,1,2) as $path) check(json_decode(file_get_contents($path.'/plugin.json'),true)['version']==='5.0.86','upstream package version');
    require $argv[1].'/src/Helper/ExternalSearch.php';
    require $argv[1].'/src/Contexts/ItemListContext.php';
    require $argv[1].'/src/Contexts/ItemSearchContext.php';
    require $argv[2].'/src/Extensions/AbstractFilter.php';
    require $argv[2].'/src/Extensions/Filters/ItemImagesFilter.php';
    require $argv[2].'/src/Services/ItemSearchAutocompleteService.php';
    require $argv[2].'/src/Api/Resources/ItemSearchAutocompleteResource.php';
    $src=dirname(__DIR__).'/src/';
    foreach (['Services/EnglishTextSearch','Services/SearchAutocompleteService','Contexts/EnglishTextSearchContext','Providers/GuardiansBasicServiceProvider','Resources/FacetResource','Resources/SearchAutocompleteResource'] as $name) require $src.$name.'.php';
    $provider=new \GuardiansBasicB2B\Providers\GuardiansBasicServiceProvider();
    $provider->register();
    $events=pluginApp(\Plenty\Plugin\Events\Dispatcher::class);
    $provider->boot(new \Plenty\Plugin\Templates\Twig(),$events,new \Plenty\Plugin\ConfigRepository());
    $req=pluginApp(Request::class);
    $facetRoute=new \GuardiansBasicB2B\Resources\FacetResource($req,new \IO\Api\ApiResponse());
    $suggestRoute=new \GuardiansBasicB2B\Resources\SearchAutocompleteResource($req,new \IO\Api\ApiResponse());
    $engine=pluginApp(ItemSearchService::class);
    $locale=pluginApp(Shop\LocalizationRepositoryContract::class);
    $langs=['de','en','fr','it','es'];
    $terms=['adidas','nike','shoes','9885396','2351296','0002','zzqnohits426xyz'];
    $browserFixture=[];
    foreach ($langs as $lang) {
        $locale->lang=$lang; $english=in_array($lang,['it','es'],true);
        $container=new \IO\Helper\TemplateContainer();
        $events->listeners['IO.ctx.search']($container);
        check($container->context===($english?EnglishTextSearchContext::class:ItemSearchContext::class),'context selection '.$lang);
        foreach ($terms as $q) {
            $opts=['query'=>$q,'facets'=>'376,727','page'=>2,'itemsPerPage'=>24,'sorting'=>'sorting.price.avg_asc','priceMin'=>3.50,'priceMax'=>9];
            $req->data=$opts;
            $none=$q==='zzqnohits426xyz';
            $image=['urlPreview'=>'https://images.example/2351296/preview.jpg','url'=>'https://images.example/2351296/original.jpg','position'=>1,'names'=>['alternate'=>$lang.' preview','name'=>'shirt']];
            $doc=['data'=>['item'=>['id'=>2351296],'variation'=>['id'=>9],'texts'=>['name1'=>$lang.' shirt'],'defaultCategories'=>[],'images'=>['all'=>[$image],'variation'=>[]],'prices'=>['price'=>7.31]]];
            $docs=$none?[]:[$doc];
            $reply=['itemList'=>['documents'=>$docs,'total'=>$none?0:25,'suggestions'=>['didYouMean'=>[]]],'facets'=>['brands'=>3,'category'=>2]];
            $engine->calls=[]; $engine->next=[$reply,$reply];
            $contextClass=$container->context;
            $ctx=new $contextClass(); $ctx->init($opts);
            $facet=$facetRoute->index()->body;
            check($ctx->itemList===$docs && $ctx->facets===$facet['facets'] && $ctx->itemCountTotal===$facet['itemList']['total'],'returned documents and facets');
            check($ctx->itemSorting===$opts['sorting'] && $ctx->currentPage===2 && $ctx->pageMax==($none?0:2),'page and sorting');
            check(count($engine->calls)===2,'one batch per HTML or facet request');
            foreach ($engine->calls as $call) {
                check($call['itemList']->preset===Presets\SearchItems::class && $call['facets']->preset===Presets\Facets::class,'native presets');
                check($call['itemList']->options['facets']==='376,727' && $call['facets']->options['facets']==='376,727','active facets');
                check($call['itemList']->options['priceMin']===3.50 && $call['itemList']->options['priceMax']===9,'item price range');
                if ($english) {
                    check($call['itemList']->options['query']==='' && !isset($call['facets']->options['query']),'neutral native bases');
                    check($call['itemList']->text===[$q,'en','and'] && $call['facets']->text===$call['itemList']->text,'matching text and operator');
                    check($call['facets']->prices===[3.5,9.0],'facet price range');
                } else {
                    check($call['itemList']->options['query']===$q && $call['itemList']->text===null,'unchanged native query');
                }
            }
            $req->data=['query'=>$q,'types'=>['item','category','suggestion']];
            $engine->calls=[]; $engine->next=[['items'=>['documents'=>$docs,'categories.all'=>[]],'suggestions'=>['searchSuggestions'=>$none?[]:[$q=>3]]]];
            $ac=$suggestRoute->index()->body;
            $browserFixture[]=['l'=>$lang,'q'=>$q,'ac'=>$ac,'facet'=>['id'=>$opts['facets'],'total'=>$facet['itemList']['total']]];
            check(count($engine->calls)===1 && $locale->lang===$lang,'autocomplete batch and locale');
            $call=$engine->calls[0];
            if ($english) {
                check(($call['items']->options['autocomplete'] ?? false) === true,'autocomplete preset selected before factory construction');
                check($call['items']->defaultImage,'existing native placeholder extension retained');
                check($call['items']->text===[$q,'en','or'] && $call['items']->categories && $call['items']->fields===\Plenty\Modules\Webshop\ItemSearch\Helpers\ResultFieldTemplate::load(4),'product autocomplete');
                check($call['suggestions']->preset===Presets\SearchItems::class && $call['suggestions']->completion===[$q,'en'] && $call['suggestions']->options['itemsPerPage']===0,'protected prefix aggregation');
            } else {
                check($call['suggestions']->preset===Presets\SearchSuggestions::class && $call['items']->options['query']===$q,'native autocomplete');
            }
            if ($none) {
                check($ac['suggestion']===[] && $ac['item']===[],'empty result');
            } else {
                check((string)$ac['suggestion'][0]['label']===$q,'zeroes or numeric label preserved');
                check($ac['item'][0]['url']===($lang==='de'?'':'/'.$lang).'/product/a-2351296/' && $ac['item'][0]['label']===$lang.' shirt','real IO localized transformation');
                check($ac['item'][0]['image']===$image['urlPreview'] && $ac['item'][0]['imageAlt']===$image['names']['alternate'],'real IO preview image and alt retained');
            }
        }
    }
    // The real IO formatter selects the lowest-position variation image, falls back
    // to item images, and forwards the native placeholder for a genuinely empty item.
    foreach ($langs as $lang) {
        $locale->lang=$lang;
        $preview=fn($id,$position)=>['urlPreview'=>"https://images.example/$id/preview.jpg",'url'=>"https://images.example/$id/original.jpg",'position'=>$position,'names'=>['alternate'=>"$lang image $id",'name'=>"image $id"]];
        $placeholder=$preview('placeholder',0);
        $images=[
            ['all'=>[$preview('item-later',3),$preview('item-first',1)],'variation'=>[]],
            ['all'=>[$preview('wrong-item',0)],'variation'=>[$preview('variant-later',9),$preview('variant-first',2)]],
            ['all'=>[$placeholder],'variation'=>[]]
        ];
        $expected=['item-first','variant-first','placeholder'];
        $documents=[];
        foreach ($images as $n=>$imageSet) {
            $record=$doc; $record['data']['item']['id']=100+$n; $record['data']['variation']['id']=200+$n;
            $record['data']['images']=$imageSet; $record['data']['texts']['name1']="$lang product $n";
            $documents[]=$record;
        }
        $req->data=['query'=>'nike','types'=>['item']];
        $engine->calls=[];$engine->next=[['items'=>['documents'=>$documents,'categories.all'=>[]],'suggestions'=>['searchSuggestions'=>[]]]];
        $formatted=$suggestRoute->index()->body;
        check(count($engine->calls)===1 && array_keys($engine->calls[0])===['items'],'no additional image search');
        foreach ($formatted['item'] as $n=>$item) {
            check($item['image']===$preview($expected[$n],0)['urlPreview'],'preview selection, not original');
            check($item['imageAlt']==="$lang image {$expected[$n]}",'selected image alt');
            check($item['url']===($lang==='de'?'':'/'.$lang).'/product/a-'.(100+$n).'/' && $item['label']==="$lang product $n",'image remains associated with localized item');
        }
    }
    $locale->lang='es';
    $opts=['query'=>'shoess','facets'=>'376,727','priceMin'=>4,'priceMax'=>9,'searchOperator'=>'and'];
    $miss=['itemList'=>['total'=>0,'documents'=>[],'suggestions'=>['didYouMean'=>[['text'=>'shoess','suggestions'=>[['text'=>'shoes','score'=>1]]]]]],'facets'=>[]];
    $engine->calls=[]; $engine->next=[$miss,$reply];
    $corrected=pluginApp(EnglishTextSearch::class)->getPage($opts);
    check(count($engine->calls)===2 && $corrected['suggestionString']==='shoes','conditional correction only');
    foreach ($engine->calls[1] as $factory) check($factory->text===['shoes','en','and'] && $factory->options['facets']==='376,727','both corrected factories');
    $req->data=['categoryId'=>60,'query'=>'adidas'];
    $engine->next=[$reply]; $engine->calls=[]; $facetRoute->index();
    check($engine->calls[0]['itemList']->preset===Presets\CategoryItems::class,'category facet path unchanged');
    $req->data=[]; check($facetRoute->index()->status===400 && $suggestRoute->index()->status===400,'empty API request');
    $engine->next=[['items'=>['documents'=>[]]]]; $engine->calls=[];
    $req->data=['query'=>'0002','types'=>['item']]; $only=$suggestRoute->index();
    check(array_keys($engine->calls[0])===['items'] && !$engine->calls[0]['items']->categories && $only->body['suggestion']===[],'optional suggestions');
    foreach (['it','es'] as $language) {
        $locale->lang=$language;
        foreach ([['query'=>['nike']], ['query'=>false], ['query'=>new \stdClass()],
                  ['query'=>'nike','types'=>'item'], ['query'=>'nike','types'=>new \stdClass()]] as $invalid) {
            $req->data=$invalid; $engine->calls=[];
            check($suggestRoute->index()->status===400 && !$engine->calls,'invalid autocomplete types rejected before search');
        }
        $req->data=['query'=>2351296,'types'=>['item']]; $engine->calls=[];
        $engine->next=[['items'=>['documents'=>[]]]];
        check($suggestRoute->index()->status===200 && $engine->calls[0]['items']->text[0]==='2351296','numeric search text preserved');
    }
    if (isset($argv[3])) file_put_contents($argv[3],json_encode($browserFixture,JSON_THROW_ON_ERROR));
    echo "$assertions assertions passed; 35 language / query combinations. Native engine not executed.\n";
}
