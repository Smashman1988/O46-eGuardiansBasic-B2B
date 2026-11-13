<?php
// php tests/provider_overrides.php <before-provider.php> <report.json>
namespace Plenty\Plugin {
    class ServiceProvider { function getApplication(){return $GLOBALS['providerApp'];} }
    class ConfigRepository { public $value; function __construct($v){$this->value=$v;} function get($key){return $this->value;} }
}
namespace Plenty\Plugin\Templates { class Twig { public $extensions=[]; function addExtension($x){$this->extensions[]=$x;} } }
namespace Plenty\Plugin\Events { class Dispatcher { public $listeners=[]; function listen($e,$f,$p=0){$this->listeners[]=[$e,$f,$p];} } }
namespace IO\Helper { class TemplateContainer { public $data=[]; function setTemplate($x){$this->data['template']=$x;} function setContext($x){$this->data['context']=$x;} } }
namespace IO\Extensions\Functions { class Partial { public $data=[]; function set($k,$v){$this->data[] = [$k,$v];} } }
namespace GuardiansBasicB2B\Services { class EnglishTextSearch { public static $active=false; static function applies(){return self::$active;} } }
namespace Plenty\Modules\Webshop\Consent\Contracts { class ConsentRepositoryContract { public $calls=[]; function registerConsent(...$x){$this->calls[]=$x;} } }
namespace Plenty\Modules\Webshop\ItemSearch\Helpers { class ResultFieldTemplate {
    const TEMPLATE_LIST_ITEM=1,TEMPLATE_SINGLE_ITEM=2,TEMPLATE_BASKET_ITEM=3,TEMPLATE_AUTOCOMPLETE_ITEM_LIST=4,TEMPLATE_CATEGORY_TREE=5,TEMPLATE_VARIATION_ATTRIBUTE_MAP=6;
    public $data=[]; function setTemplates($x){$this->data=$x;}
} }
namespace {
function pluginApp($class){return $GLOBALS['providerServices'][$class]??($GLOBALS['providerServices'][$class]=new $class());}
require dirname(__DIR__).'/src/Providers/GuardiansBasicServiceProvider.php';
$old=file_get_contents($argv[1]);
$old=str_replace('class GuardiansBasicServiceProvider extends','class BeforeProvider extends',$old);
eval(substr($old,5));
$keys=['head','header','page_design','footer','homepage','category_content','category_item','basket','checkout','order_confirmation','login','register','item','category_view','my_account','cancellation_rights','legal_disclosure','privacy_policy','terms_conditions','item_not_found','page_not_found'];
$configs=array_merge(['','all','unknown','all, item','item, head, header','item,head','all, all',implode(', ',$keys)],$keys);
$cases=[];
foreach($configs as $config)foreach([false,true]as$search){$pair=[];foreach(['before'=>'BeforeProvider','after'=>'GuardiansBasicServiceProvider']as$v=>$class){
    $GLOBALS['providerApp']=new class {public $calls=[];function register($x){$this->calls[]=$x;}};
    $GLOBALS['providerServices']=[];
    \GuardiansBasicB2B\Services\EnglishTextSearch::$active=$search;
    $fq='GuardiansBasicB2B\\Providers\\'.$class;$p=new $fq();$p->register();$t=new \Plenty\Plugin\Templates\Twig();$d=new \Plenty\Plugin\Events\Dispatcher();$p->boot($t,$d,new \Plenty\Plugin\ConfigRepository($config));
    $events=[];foreach($d->listeners as[$event,$fn,$priority]){$c=$event==='IO.init.templates'?new \IO\Extensions\Functions\Partial():new \IO\Helper\TemplateContainer();$ret=$fn($c);$events[]=['event'=>$event,'priority'=>$priority,'return'=>$ret,'data'=>$c->data];}
    $pair[$v]=['registration'=>$GLOBALS['providerApp']->calls,'extensions'=>$t->extensions,'events'=>$events,'consents'=>$GLOBALS['providerServices'][\Plenty\Modules\Webshop\Consent\Contracts\ConsentRepositoryContract::class]->calls,'resultFields'=>$GLOBALS['providerServices'][\Plenty\Modules\Webshop\ItemSearch\Helpers\ResultFieldTemplate::class]->data];
}if($pair['before']!==$pair['after'])throw new \RuntimeException('Changed configured provider behavior: '.$config);$cases[]=['config'=>$config,'searchAdapter'=>$search,'listeners'=>count($pair['after']['events']),'status'=>'PASS'];}
file_put_contents($argv[2],json_encode(['status'=>'PASS','cases'=>$cases],JSON_PRETTY_PRINT));echo count($cases)." provider configuration/event-order comparisons PASS\n";
}
