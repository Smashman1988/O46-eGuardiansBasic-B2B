<?php
// php tests/phase11_pagination.php <Twig autoload> <report.json> <before-Pagination.twig>
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
class Phase11PaginationFixture {
    public $labels = [], $calls = [], $queries = [], $params, $language, $canonicalCalls = 0;
    function __construct($language, $params) {
        $this->language=$language; $this->params=$params;
        foreach (file(dirname(__DIR__).'/resources/lang/'.$language.'/Template.properties') as $line) {
            if (preg_match('/^([a-zA-Z0-9]+)\s*=\s*(.*)$/u', trim($line), $m)) $this->labels[$m[1]]=$m[2];
        }
    }
    function trans($key) {
        $this->calls[$key]=($this->calls[$key]??0)+1;
        return $this->labels[explode('::Template.', $key)[1]]??$key;
    }
    function getCanonicalURL() { $this->canonicalCalls++; return '/'.$this->language.'/category/'; }
    function queryString($replacements) {
        $this->queries[]=$replacements;
        $query=http_build_query(array_replace($this->params, $replacements), '', '&', PHP_QUERY_RFC3986);
        return $query===''?'':'?'.$query;
    }
}
$before=file_get_contents($argv[3]);
$after=file_get_contents(dirname(__DIR__).'/resources/views/Category/Item/Partials/Pagination.twig');
$rows=[];
$edgePages=[-1,0,1,2,3,4,5,9,10,11,999];
foreach (['de','en','fr','it','es'] as $language) foreach ([0,1,2,3,5,10] as $pageMax) foreach ($edgePages as $currentPage) {
    $results=[];
    foreach (['before'=>$before,'after'=>$after] as $version=>$source) {
        $fixture=new Phase11PaginationFixture($language, ['facets'=>'7,9','sorting'=>'name_asc','query'=>'a & b','currency'=>'EUR','page'=>$currentPage]);
        $twig=new Twig\Environment(new Twig\Loader\ArrayLoader(['pagination'=>$source]), ['autoescape'=>'html']);
        $twig->addFunction(new Twig\TwigFunction('trans', [$fixture,'trans']));
        $twig->addFunction(new Twig\TwigFunction('queryString', [$fixture,'queryString']));
        $html=$twig->render('pagination', ['currentPage'=>$currentPage,'pageMax'=>$pageMax,'services'=>['url'=>$fixture]]);
        $results[$version]=['html'=>$html,'calls'=>$fixture->calls,'queries'=>$fixture->queries,'canonical'=>$fixture->canonicalCalls];
    }
    // Phase 12 translates the formerly hard-coded active-page title only.
    $label=htmlspecialchars($fixture->labels['page'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $expected=str_replace('<a class="page-link" title="Seite '.$currentPage.'">',
        '<a class="page-link" title="'.$label.' '.$currentPage.'">', $results['before']['html']);
    if ($expected!==$results['after']['html']) throw new RuntimeException("Unexpected HTML change: $language/$pageMax/$currentPage");
    if ($results['before']['queries']!==$results['after']['queries'] || $results['before']['canonical']!==$results['after']['canonical']) throw new RuntimeException('Changed route processing');
    foreach ($results['after']['calls'] as $key=>$count) if ($count!==1) throw new RuntimeException('Repeated translation: '.$key);
    if (($pageMax<=1 || $currentPage<=0) && $results['after']['calls']!==[]) throw new RuntimeException('Unused translation lookup');
    $rows[]=['language'=>$language,'pageMax'=>$pageMax,'currentPage'=>$currentPage,
        'translationsBefore'=>array_sum($results['before']['calls']), 'translationsAfter'=>array_sum($results['after']['calls']),
        'htmlBytes'=>strlen($results['after']['html']), 'byteIdentical'=>$results['before']['html']===$results['after']['html'],
        'htmlDelta'=>strlen($results['after']['html'])-strlen($results['before']['html'])];
}
$report=['status'=>'PASS','twig'=>Twig\Environment::VERSION,'cases'=>count($rows),'rows'=>$rows,
    'sourceBytesBefore'=>strlen($before),'sourceBytesAfter'=>strlen($after),'onlyExpectedTitleChange'=>true,'requestsRemoved'=>0,'runtimeChange'=>'NOT_MEASURED'];
file_put_contents($argv[2],json_encode($report,JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));
echo json_encode(['status'=>'PASS','twig'=>$report['twig'],'cases'=>$report['cases']])."\n";
