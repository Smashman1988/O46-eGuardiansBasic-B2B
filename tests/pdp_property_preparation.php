<?php
// php tests/pdp_property_preparation.php <Twig autoload> <before-SingleItem.twig> <report.json>
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace {
$deprecations=[];
set_error_handler(function($level,$message)use(&$deprecations){if(in_array($level,[E_DEPRECATED,E_USER_DEPRECATED],true)){$deprecations[$message]=true;return true;}throw new \ErrorException($message,0,$level);});
require $argv[1];require dirname(__DIR__).'/src/Extensions/Base_Extension.php';
$ext=(new ReflectionClass(\GuardiansBasicB2B\Extensions\Base_Extension::class))->newInstanceWithoutConstructor();
$inputProperties=[['property'=>['id'=>46],'texts'=>['value'=>'first']],['property'=>['id'=>'046'],'texts'=>['value'=>'duplicate']],['property'=>['id'=>115],'texts'=>['value'=>'']],['property'=>['id'=>'115'],'texts'=>['value'=>'later']],['property'=>['id'=>999],'texts'=>['value'=>'unlisted']]];
$expectedIndex=[46=>$inputProperties[0],115=>$inputProperties[2],999=>$inputProperties[4]];
foreach([$inputProperties,new \ArrayIterator($inputProperties)] as $input){
 if($ext->getItemPropertiesById($input)!==$expectedIndex)throw new \RuntimeException('Array/Traversable property IDs or first-match semantics changed');
}
class PropertyIdProbe implements \ArrayAccess {
    private $id;function __construct($id){$this->id=$id;}
    public function offsetExists($key):bool{return $key==='id';}
    public function offsetGet($key):mixed{$GLOBALS['propertyReads']++;return $this->id;}
    public function offsetSet($key,$value):void{throw new \RuntimeException('Unexpected mutation');}
    public function offsetUnset($key):void{throw new \RuntimeException('Unexpected mutation');}
}
class PropertyRenderCallbacks {
    public $texts=0,$lang;
    function trans($key){$this->texts++;return $this->lang.':'.$key.' & < > "';}
}
$sources=['before'=>file_get_contents($argv[2]),'after'=>file_get_contents(dirname(__DIR__).'/resources/views/Item/SingleItem.twig')];
$keys=[46,115,105,196,197,198,7,107,108,122,111,73,127,110,109,123,124,106,118,119,125,102,103,101,104];
$fragments=[];
foreach($sources as$v=>$s){$start=strpos($s,'{% set orderedKeys =');$end=strpos($s,'{% endfor %}',$start)+strlen('{% endfor %}');$fragments[$v]=substr($s,$start,$end-$start);}
$cases=[];
foreach(['de','en','fr','it','es']as$lang)foreach([0,1,5,25,100,500]as$count)foreach([false,true]as$numericStrings){$pair=[];
 foreach($fragments as$v=>$fragment){$properties=[];for($i=0;$i<$count;$i++){$id=$keys[$i%count($keys)];if($numericStrings)$id=($i%2?'0':'').$id;$properties[]=['property'=>new PropertyIdProbe($id),'texts'=>['value'=>$i%7===0?'':($i%7===1?null:$lang.' & <value> '.$i)],'selection'=>['name'=>$i%7===1?$lang.' selection':null]];}
  $GLOBALS['propertyReads']=0;$twig=new \Twig\Environment(new \Twig\Loader\ArrayLoader(['properties'=>$fragment]),['autoescape'=>'html']);
  $twig->addFunction(new \Twig\TwigFunction('getItemPropertiesById',[$ext,'getItemPropertiesById']));
  $html=$twig->render('properties',['item'=>['documents'=>[['data'=>['properties'=>$properties]]]],'itemData'=>['properties'=>$properties],'attributeCache'=>array_fill_keys($keys,$lang.' label')]);
  $pair[$v]=['html'=>$html,'reads'=>$GLOBALS['propertyReads']];
 }
 if($pair['before']['html']!==$pair['after']['html'])throw new \RuntimeException('Property output changed');
 if($pair['before']['reads']!==25*$count||$pair['after']['reads']!==$count)throw new \RuntimeException('Unexpected property read counts');
 $cases[]=['lang'=>$lang,'properties'=>$count,'numericStringIds'=>$numericStrings,'beforeIdReads'=>$pair['before']['reads'],'afterIdReads'=>$pair['after']['reads'],'identicalHtml'=>true];
}
$matrices=[];foreach($sources as$v=>$s){$start=strpos($s,'    <div class="eg-size-matrix"');$end=strpos($s,'</button>',strpos($s,'data-eg-matrix-add',$start));$end=strpos($s,'</div>',strpos($s,'</div>',$end)+6)+6;$matrices[$v]=substr($s,$start,$end-$start);}
$matrixCases=[];
foreach(['de','en','fr','it','es']as$lang)foreach(['none','size','color','size_color']as$mode){$pair=[];$size=strpos($mode,'size')!==false;$color=strpos($mode,'color')!==false;
 foreach($matrices as$v=>$fragment){$cb=new PropertyRenderCallbacks();$cb->lang=$lang;$twig=new \Twig\Environment(new \Twig\Loader\ArrayLoader(['matrix'=>$fragment]),['autoescape'=>'html']);$twig->addFunction(new \Twig\TwigFunction('trans',[$cb,'trans']));
 $html=$twig->render('matrix',['mode'=>$mode,'hasSize'=>$size,'hasColor'=>$color,'sizeAttr'=>['attributeId'=>1,'values'=>[['attributeValueId'=>1,'name'=>'M']]],'colorAttr'=>['attributeId'=>2,'values'=>[['attributeValueId'=>2,'name'=>'Blue']]],'variationsWithAttributes'=>[['variationId'=>1],['variationId'=>2]],'itemData'=>['variation'=>['id'=>1]]]);$pair[$v]=['html'=>$html,'translations'=>$cb->texts];
 }
 $current=$pair['after']['html'];
 $expectedTitle=htmlspecialchars($lang.':GuardiansBasicB2B::Template.matrixMissing & < > "', ENT_QUOTES);
 $slot='~\s*<div class="eg-matrix-error-slot">\s*<button type="button" data-eg-matrix-error-toggle aria-label="'.preg_quote($expectedTitle,'~').'" title="'.preg_quote($expectedTitle,'~').'" aria-expanded="false" hidden><span aria-hidden="true">⚠</span></button>\s*</div>~';
 $current=preg_replace($slot,'',$current,1,$slots);
 $current=str_replace('class="eg-size-matrix-table" aria-busy="true"','class="eg-size-matrix-table"',$current,$busy);
 if($slots!==1||$busy!==1)throw new \RuntimeException('Matrix loading/error accessibility contract');
 $partial=htmlspecialchars($lang.':GuardiansBasicB2B::Template.matrixPartial & < > "', ENT_QUOTES);
 $unavailable=htmlspecialchars($lang.':GuardiansBasicB2B::Template.matrixUnavailable & < > "', ENT_QUOTES);
 $status='~<div role="status" aria-atomic="true" data-eg-matrix-status\s+data-partial="'.preg_quote($partial,'~').'"\s+data-unavailable="'.preg_quote($unavailable,'~').'">\s*</div>~';
 $current=preg_replace($status,'',$current,1,$statusCount);
 if($statusCount!==1)throw new \RuntimeException('Localized empty live region');
 $markup=function($html){return preg_replace('~>\s+<~','><',trim($html));};
 if($markup($pair['before']['html'])!==$markup($current))throw new \RuntimeException('Matrix output/escaping changed');$columns=5+(int)$size+(int)$color;if($pair['before']['translations']-$pair['after']['translations']!==2*$columns-3)throw new \RuntimeException('Matrix translation count changed');
 $matrixCases[]=['lang'=>$lang,'mode'=>$mode,'beforeTranslations'=>$pair['before']['translations'],'afterTranslations'=>$pair['after']['translations'],'retainedMarkupEqual'=>true];
}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>\Twig\Environment::VERSION,'iterableIndexCases'=>2,'propertyCases'=>$cases,'matrixCases'=>$matrixCases,'scope'=>'Actual template fragments and PHP helper; array/ArrayIterator ID indexes agree; API integer/numeric-string property IDs, first duplicate wins, empty first values and escaping retained; no service calls'],JSON_PRETTY_PRINT));
echo count($cases).' property and '.count($matrixCases)." matrix byte-equivalence/count cases PASS\n";
}
