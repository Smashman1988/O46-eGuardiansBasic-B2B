<?php
// php tests/brand_render_preparation.php <Twig autoload> <baseline resources/views> <report.json>
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
function brandCheck($ok,$message){if(!$ok)throw new RuntimeException($message);}
class BrandChildFixture {
    public static $detailReads=0;
    public $itemCount,$detailsValue;
    function __construct($index,$language){$this->itemCount=[['count'=>10+$index]];$this->detailsValue=$index%5===4?[]:[['name'=>chr(65+$index%4).' Brand '.$index.' & Logo','nameUrl'=>'brand-'.$index,'metaTitle'=>'Brand "'.$index.'"','image2Path'=>$index%3?'brands/'.$index.'.png':'','lang'=>$language]];}
    function getDetails(){self::$detailReads++;return $this->detailsValue;}
}
class BrandFixtureFunctions {
    function trans($key){return $key;}
    function path($key){return '/plugin/'.$key;}
}
$base=dirname(__DIR__).'/resources/views/Category/Item/CategoryItemBrands.twig';$rows=[];
foreach(['de','en','fr','it','es']as$lang)foreach([0,1,12,60]as$n)foreach([1,2]as$levels){
    $children=[];for($i=0;$i<$n;$i++)$children[]=new BrandChildFixture($i,$lang);
    $context=['categories'=>[['id'=>61,'details'=>[['name'=>'Other']],'children'=>[]],['id'=>60,'details'=>[['name'=>'Brands','nameUrl'=>'brands','lang'=>$lang]],'children'=>$children]],'megaMenuLevels'=>$levels,'urls'=>['includeLanguage'=>$lang!=='de','trailingSlashSuffix'=>'/'],'services'=>['checkout'=>new class{function getCurrencyData(){return ['name'=>'USD'];}},'category'=>new class{function getURLById($id){brandCheck($id===5618,'Existing category URL ID');return '/all-brands/';}}]];
    $out=[];foreach(['before'=>$argv[2].'/Category/Item/CategoryItemBrands.twig','after'=>$base]as$version=>$file){$twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['brands'=>file_get_contents($file)]));$functions=new BrandFixtureFunctions;foreach(['trans'=>'trans','plugin_path'=>'path']as$name=>$method)$twig->addFunction(new Twig\TwigFunction($name,[$functions,$method]));BrandChildFixture::$detailReads=0;$html=$twig->render('brands',$context);$out[$version]=['html'=>$html,'reads'=>BrandChildFixture::$detailReads,'bytes'=>strlen($html)];}
    $normalize=function($html){return preg_replace('/(?<=>)[\t ]*(?:\r?\n[\t ]*)+(?=<)/','',$html);};
    brandCheck($normalize($out['before']['html'])===$normalize($out['after']['html']),'Brand markup/content/links/order changed');
    brandCheck($out['before']['reads']-$out['after']['reads']===$n,'Exactly one redundant child-details read per child removed');
    $rows[]=['language'=>$lang,'children'=>$n,'megaMenuLevels'=>$levels,'beforeDetailReads'=>$out['before']['reads'],'afterDetailReads'=>$out['after']['reads'],'beforeBytes'=>$out['before']['bytes'],'afterBytes'=>$out['after']['bytes'],'sameExceptInterTagNewlineIndentation'=>true,'sha256'=>hash('sha256',$out['after']['html'])];
}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>Twig\Environment::VERSION,'cases'=>$rows,'limits'=>['One complete unused child traversal removed; count does not imply database calls or native milliseconds.','Missing translations, absent brand logos, eager first four logos, alternate menu level and currency query preserved.']],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));
echo count($rows).' brand comparisons PASS; one redundant details lookup per child removed, Twig '.Twig\Environment::VERSION.PHP_EOL;
