<?php
// Compare preserved bootstrap behavior while measuring actual configuration reads.
// php tests/theme_performance.php <provider.php> <report.json>
namespace ThemePerformance {
    class Application { public $registrations=[]; function register($provider){$this->registrations[]=$provider;} }
}
namespace Plenty\Plugin {
    class ServiceProvider { function getApplication(){return $GLOBALS['app'];} }
    class ConfigRepository {
        public $reads=[]; private $value;
        function __construct($value){$this->value=$value;}
        function get($key){$this->reads[]=$key;return $this->value;}
    }
}
namespace Plenty\Plugin\Templates { class Twig {public $extensions=[];function addExtension($name){$this->extensions[]=$name;}} }
namespace Plenty\Plugin\Events {class Dispatcher {public $listeners=[];function listen($event,$listener,$priority=0){$this->listeners[$event]=[$listener,$priority];}}}
namespace Plenty\Modules\Webshop\Consent\Contracts {class ConsentRepositoryContract {function registerConsent(...$args){$GLOBALS['consents'][]=$args;}}}
namespace Plenty\Modules\Webshop\ItemSearch\Helpers {
    class ResultFieldTemplate {
        const TEMPLATE_LIST_ITEM=1,TEMPLATE_SINGLE_ITEM=2,TEMPLATE_BASKET_ITEM=3,TEMPLATE_AUTOCOMPLETE_ITEM_LIST=4,TEMPLATE_CATEGORY_TREE=5,TEMPLATE_VARIATION_ATTRIBUTE_MAP=6;
        function setTemplates($templates){$GLOBALS['fields']=$templates;}
    }
}
namespace IO\Extensions\Functions {class Partial {public $templates=[];function set($name,$template){$this->templates[$name]=$template;}}}
namespace IO\Helper {class TemplateContainer {public $template;function setTemplate($template){$this->template=$template;}function setContext($context){$this->template=$context;}}}
namespace GuardiansBasicB2B\Services {class EnglishTextSearch {static function applies(){return false;}}}
namespace {
    function pluginApp($class){return new $class;}
    require $argv[1];
    $rows=[];
    $options=['','all','head','header','page_design','footer','homepage','category_content','category_item','basket','checkout','order_confirmation','login','register','item','category_view','my_account','cancellation_rights','legal_disclosure','privacy_policy','terms_conditions','item_not_found','page_not_found','head, header, page_design, category_view, item'];
    foreach($options as $option){
        $app=new \ThemePerformance\Application;$consents=[];$fields=[];
        $p=new \GuardiansBasicB2B\Providers\GuardiansBasicServiceProvider;
        $c=new \Plenty\Plugin\ConfigRepository($option);$t=new \Plenty\Plugin\Templates\Twig;$d=new \Plenty\Plugin\Events\Dispatcher;
        $p->register();$p->boot($t,$d,$c);$partial=new \IO\Extensions\Functions\Partial;
        $d->listeners['IO.init.templates'][0]($partial);$templates=[];
        foreach($d->listeners as $name=>[$callback,$priority]){
            if(strpos($name,'IO.tpl.')===0){$tc=new \IO\Helper\TemplateContainer;$result=$callback($tc);$templates[$name]=[$tc->template,$result,$priority];}
        }
        if(count($fields)!==6||count($consents)!==2)throw new \RuntimeException('Bootstrap capabilities changed');
        if(($partial->templates['page-metadata']??'')!=='GuardiansBasicB2B::PageDesign.Partials.PageMetadata')throw new \RuntimeException('Metadata mapping changed');
        $rows[]=['option'=>$option,'reads'=>$c->reads,'behavior'=>['partial'=>$partial->templates,'templates'=>$templates,'fields'=>$fields,'consents'=>$consents,'extensions'=>$t->extensions,'registrations'=>$app->registrations,'eventNames'=>array_keys($d->listeners)]];
    }
    file_put_contents($argv[2],json_encode(['kind'=>'LOCAL_BOOTSTRAP_CONTRACT_EXPLICIT_DOUBLES','rows'=>$rows],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));echo count($rows)." bootstrap configurations captured\n";
}
