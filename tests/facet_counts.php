<?php
// php tests/facet_counts.php <Ceres-5.0.86-dir> <IO-5.0.86-dir> <report.json>
// Reuse the existing real IO resource/formatter harness and its 758 assertions.
// Search execution is a recording fixture, not the proprietary native engine.
namespace Plenty\Modules\Webshop\ItemSearch\Helpers { trait LoadResultFields {} }
namespace Plenty\Modules\Cloud\ElasticSearch\Lib\Source {
    class IncludeSource {
        public function activateAll() {}
        public function activateList($fields) {}
    }
}
namespace {
require __DIR__ . '/search_index.php';
use Plenty\Modules\Webshop\ItemSearch\Services\ItemSearchService;
use Plenty\Modules\Webshop\Contracts\LocalizationRepositoryContract;
use function SearchTest\check;

$previousAssertions = $assertions;
class CountSearchFixture extends ItemSearchService {
    public $documentVisits = 0;
    public function getResults($factories) {
        $result = parent::getResults($factories);
        $limit = $factories['itemList']->options['itemsPerPage'];
        $result['itemList']['documents'] = array_slice($result['itemList']['documents'], 0, $limit);
        $this->documentVisits += count($result['itemList']['documents']);
        return $result;
    }
}
$engine = new CountSearchFixture();
$objects[ItemSearchService::class] = $engine;
$report = ['mode'=>'LOCAL_FACTORY_AND_RESULT_FIXTURES', 'cases'=>[], 'parameterCases'=>[], 'ioPagination'=>[],
    'limits'=>['No native search engine, SQL, customer prices or HTTP timing measured.',
        'Fixture document visits count returned documents; they are not measured proprietary engine work.']];
$documents = [];
for ($i=0; $i<73; $i++) {
    $documents[] = ['data'=>['variation'=>['id'=>1000+$i], 'prices'=>['default'=>['unitPrice'=>['value'=>5.5+$i]]],
        'texts'=>['name1'=>'Item '.$i], 'images'=>['all'=>[['url'=>'/img/'.$i.'.jpg']]]]];
}
function factorySnapshot($calls) {
    $copy = json_decode(json_encode($calls), true);
    foreach ($copy as &$call) $call['itemList']['options']['itemsPerPage'] = 'ignored-page-size';
    return $copy;
}
function countRequest($params, $responses) {
    global $engine, $req, $facetRoute;
    $req->data = $params;
    $engine->calls = []; $engine->next = $responses; $engine->documentVisits = 0;
    $response = $facetRoute->index();
    return ['status'=>$response->status, 'body'=>$response->body, 'calls'=>$engine->calls,
        'documentVisits'=>$engine->documentVisits];
}
foreach (['de','en','fr','it','es'] as $language) foreach (['category','search'] as $kind) {
    $objects[LocalizationRepositoryContract::class]->lang = $language;
    foreach (['hits','empty','correction'] as $scenario) {
        $params = ['categoryId'=>$kind==='category' ? 60 : 0, 'query'=>'shoess', 'facets'=>'376,727',
            'priceMin'=>3.5, 'priceMax'=>9];
        $hit = ['itemList'=>['total'=>73, 'documents'=>$documents, 'suggestions'=>['didYouMean'=>[]]],
            'facets'=>[['id'=>2, 'values'=>[['id'=>376,'count'=>73]]]]];
        $miss = ['itemList'=>['total'=>0, 'documents'=>[], 'suggestions'=>['didYouMean'=>[]]], 'facets'=>[]];
        if ($scenario==='correction') {
            $miss['itemList']['suggestions']['didYouMean'] = [['text'=>'shoess','suggestions'=>[['text'=>'shoes','score'=>1]]]];
        }
        $correction = $scenario==='correction' && $kind==='search' && in_array($language,['it','es'],true);
        $responses = $scenario==='hits' ? [$hit] : ($correction ? [$miss,$hit] : [$miss]);
        $full = countRequest($params, $responses);
        $counts = countRequest($params+['countsOnly'=>'1'], $responses);
        check($full['status']===200 && $counts['status']===200, 'response status');
        $expected = $full['body']; $expected['itemList']['documents'] = [];
        check($counts['body']===$expected, 'only unconsumed documents omitted');
        check(factorySnapshot($full['calls'])===factorySnapshot($counts['calls']), 'filters, text, suggestions and presets unchanged');
        check(count($counts['calls'])===($correction ? 2 : 1), 'same number of searches including correction');
        foreach ($full['calls'] as $call) check($call['itemList']->options['itemsPerPage']===50, 'default 50 documents retained');
        foreach ($counts['calls'] as $call) {
            check($call['itemList']->options['itemsPerPage']===0 && $call['itemList']->options['page']===1, 'zero document page requested');
            check(count($call)===2 && isset($call['facets']), 'both existing factories retained');
        }
        check($counts['documentVisits']===0, 'no fixture documents prepared');
        $report['cases'][] = ['language'=>$language,'kind'=>$kind,'scenario'=>$scenario,
            'beforeCalls'=>count($full['calls']),'afterCalls'=>count($counts['calls']),
            'beforeDocuments'=>$full['documentVisits'],'afterDocuments'=>$counts['documentVisits'],
            'beforeResponseBytes'=>strlen(json_encode($full['body'])),'afterResponseBytes'=>strlen(json_encode($counts['body'])),
            'total'=>$counts['body']['itemList']['total'],'status'=>'PASS'];
    }
}
foreach (['de','it'] as $language) foreach ([null,'1',1,'0',0,true,false,1.0,'true','01','1 ',['1']] as $parameter) {
    $objects[LocalizationRepositoryContract::class]->lang = $language;
    $params = ['query'=>'shoes'];
    if ($parameter!==null) $params['countsOnly'] = $parameter;
    $row = countRequest($params, [$hit]);
    $enabled = $parameter==='1' || $parameter===1;
    check(count($row['body']['itemList']['documents'])===($enabled ? 0 : 50), 'strict explicit opt-in');
    $report['parameterCases'][] = ['language'=>$language,'value'=>$parameter,'enabled'=>$enabled,'status'=>'PASS'];
}
foreach ([[], ['query'=>[]], ['query'=>false]] as $invalid) {
    $row = countRequest($invalid+['countsOnly'=>'1'], []);
    check($row['status']===400 && !$row['calls'], 'invalid request unchanged and no search');
}
$report['categoryInputCases'] = [];
foreach ([['77'], '12x', '1e3', '92233720368547758080'] as $categoryId) {
    $row = countRequest(['categoryId'=>$categoryId, 'query'=>'shoes'], [$hit]);
    check($row['status']===400 && !$row['calls'], 'Malformed category ID caused an unrelated category or query search');
    $report['categoryInputCases'][] = ['input'=>$categoryId, 'status'=>$row['status'], 'searches'=>count($row['calls'])];
}
foreach (['', 0, '0'] as $categoryId) {
    $row = countRequest(['categoryId'=>$categoryId, 'query'=>'shoes'], [$hit]);
    check($row['status']===200 && count($row['calls'])===1, 'Empty category ID must still allow keyword search');
    $report['categoryInputCases'][] = ['input'=>$categoryId, 'status'=>$row['status'], 'searches'=>count($row['calls'])];
}
$report['filterInputCases'] = [];
foreach (['de','en','fr','it','es'] as $language) {
    $objects[LocalizationRepositoryContract::class]->lang = $language;
    foreach ([['categoryId'=>60], ['query'=>'shoes']] as $route) {
        foreach ([['priceMax'=>['90']], ['priceMin'=>[12]], ['facets'=>[['17'],'19']]] as $badFilter) {
            $row = countRequest($route + $badFilter, [$hit]);
            check($row['status'] === 400 && !$row['calls'], 'Malformed filter reached a search for '.$language);
            $report['filterInputCases'][] = ['language'=>$language, 'route'=>$route, 'input'=>$badFilter, 'status'=>400, 'searches'=>0];
        }
        foreach ([['facets'=>['17','19'], 'priceMin'=>'', 'priceMax'=>'12.50'],
                  ['facets'=>'17,19', 'priceMin'=>0, 'priceMax'=>3.5]] as $validFilter) {
            $row = countRequest($route + $validFilter, [$hit]);
            $opts = $row['calls'][0]['itemList']->options;
            check($row['status'] === 200 && count($row['calls']) === 1 && $opts['facets'] === $validFilter['facets']
                && $opts['priceMin'] === $validFilter['priceMin'] && $opts['priceMax'] === $validFilter['priceMax'],
                'Valid filter or number format changed for '.$language);
            $report['filterInputCases'][] = ['language'=>$language, 'route'=>$route, 'input'=>$validFilter, 'status'=>200, 'searches'=>1];
        }
    }
}

// Execute the available upstream implementation through build(), rather than
// claiming that the stub search proves the platform's setPage contract.
require $argv[2] . '/src/Services/ItemSearch/Factories/BaseSearchFactory.php';
class PaginationProbe extends \IO\Services\ItemSearch\Factories\BaseSearchFactory {
    public $builder;
    protected function prepareSearch($source) { return $this->builder; }
    public function getLogger($class) { return new class { public function debug($key,$data) {} }; }
}
class DocumentSearchProbe {
    public $pagination;
    public function setPage($page,$size) { $this->pagination = [$page,$size]; }
    public function addSource($source) {}
}
foreach ([0,50,-1] as $size) {
    $probe = new PaginationProbe(); $probe->builder = new DocumentSearchProbe();
    $probe->setPage(1,$size)->build();
    $expected = [1, $size < 0 ? 1000 : $size];
    check($probe->builder->pagination===$expected, 'real IO passes zero size without default replacement');
    $report['ioPagination'][] = ['input'=>$size,'documentSearchPagination'=>$probe->builder->pagination,'status'=>'PASS'];
}
$report['existingSearchAssertions'] = $previousAssertions;
$report['newAssertions'] = $assertions-$previousAssertions;
$report['pass'] = count($report['cases']) + count($report['parameterCases']) + 3 + count($report['ioPagination'])
    + count($report['categoryInputCases']) + count($report['filterInputCases']);
$report['status'] = 'PASS';
file_put_contents($argv[3], json_encode($report, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));
echo $report['pass'].' facet cases / '.$report['newAssertions']." new assertions PASS; native engine NOT_TESTED\n";
}
