<?php
// Compare real listing body, card and pagination templates against the saved baseline.
// php tests/list_fragment_render.php <Twig autoload> <baseline views> <report.json>
define('O46_CARD_FIXTURE_ONLY', true);
require __DIR__.'/phase11_cards.php';
require_once __DIR__.'/card_markup_contract.php';
class FragmentRenderQuery {
    private $params;
    function __construct($params) { $this->params=$params; }
    function with($replace) { return '?'.http_build_query(array_filter(array_replace($this->params,$replace),function($v){return $v!==null;})); }
}
$rows=[];
foreach (['de','en','fr','it','es'] as $lang) foreach (['category','search','content'] as $kind) {
    foreach ([['',1,3,6],['true',2,3,60],['true',3,3,6],['true',2,2,0]] as [$flag,$page,$max,$count]) {
        $fragment=$flag==='true'; $params=['sorting'=>'texts.name1_asc','facets'=>'11','page'=>$page];
        if ($kind==='search') $params['query']='Größe & XL';
        if ($fragment) $params['quickViewItem']=$flag;
        $request=new class($params){private $params; function __construct($p){$this->params=$p;} function get($key){return $this->params[$key]??null;}};
        $services=(array)new Phase11CardServices($lang,'EUR'); $services['url']=new class {function getCanonicalURL(){return '/listing/';}};
        $ctx=['itemList'=>phase11Items($count,$lang),'category'=>['id'=>100,'details'=>[['name'=>'Fixture']]],'currentPage'=>$page,'itemCountTotal'=>126,'pageMax'=>$max,'isSearch'=>$kind==='search','isQuickView'=>!$fragment,'searchString'=>'Größe & XL','request'=>$request,'services'=>$services,'lang'=>$lang];
        $row=['lang'=>$lang,'kind'=>$kind,'page'=>$page,'count'=>$count,'fragment'=>$fragment]; $contract=[];
        foreach (['before','after'] as $v) {
            $f=new Phase11CardFixture($lang);$old=$v==='before';$twig=phase11Environment($f,$old,true,[new FragmentRenderQuery($params),'with']);
            $dir=$old?$argv[2]:__DIR__.'/../resources/views'; $twig->getLoader()->setTemplate('GuardiansBasicB2B::Category.Item.Partials.Pagination',file_get_contents($dir.'/Category/Item/Partials/Pagination.twig'));
            $html=$twig->render('GuardiansBasicB2B::Category.Item.'.($kind==='content'?'CategoryItemContent':'CategoryItem'),$ctx);
            $dom=cardMarkupDocument($html); $xp=new DOMXPath($dom); $status=$xp->query('//div[@class="scroller-status"]');
            phase11Check($status->length===($old||!$fragment?1:0),'Status only on the host page after optimization');
            phase11Check($xp->query('//div[@data-eg-item]')->length===$count,'Card count');
            $next=$xp->query('//a[@class="pagination__next"]');phase11Check($next->length===($page<$max?1:0),'Next link follows page boundary');
            if($next->length){parse_str(parse_url($next->item(0)->getAttribute('href'),PHP_URL_QUERY),$query);phase11Check($query['page']==$page+1 && $query['quickViewItem']==='true' && $query['facets']==='11' && $query['sorting']===$params['sorting'] && ($kind!=='search'||$query['query']===$params['query']),'Next URL preserves listing state');}
            $row[$v]=['bytes'=>strlen($html),'gzip9'=>strlen(gzencode($html,9)),'elements'=>cardMarkupCounts($html)['elements'],'calls'=>$f->calls];
            if($old && $fragment)$status->item(0)->parentNode->removeChild($status->item(0));
            $root=$dom->getElementById('card-contract-root');$contract[$v]=cardMarkupContract($dom->saveHTML($root),$old);
        }
        phase11Check($contract['before']===$contract['after'],'Entire markup except unused fragment status: '.$lang.'/'.$kind.'/'.$page);
        $a=$row['before']['calls'];$b=$row['after']['calls'];foreach(['pluginPath','translation'] as $key){phase11Check(($a[$key]??0)>=($b[$key]??0),'No extra helpers');unset($a[$key],$b[$key]);}phase11Check($a===$b,'Identical remaining helper calls');$rows[]=$row;
    }
}
file_put_contents($argv[3],json_encode(['status'=>'PASS','twig'=>Twig\Environment::VERSION,'rows'=>$rows],JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES));echo count($rows)." listing/fragment comparisons PASS (Twig ".Twig\Environment::VERSION.")\n";
