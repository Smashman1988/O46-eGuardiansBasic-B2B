<?php
// php tests/phase11_facets.php <Twig autoload> <report.json> <before-Base_Extension.php>
// Differential checks use the real prior helper; all service boundaries are local fixtures.
$reportPath = $argv[2];
$beforePath = $argv[3];
$argv[2] = '--library';
require __DIR__ . '/facets.php';
$beforeSource = file_get_contents($beforePath);
$beforeSource = str_replace('class Base_Extension extends', 'class Phase11BeforeExtension extends', $beforeSource);
eval(substr($beforeSource, 5));
$renderFunction = new ReflectionFunction('renderFacets');
$renderLines = file($renderFunction->getFileName());
$beforeRender = implode('', array_slice($renderLines, $renderFunction->getStartLine()-1,
    $renderFunction->getEndLine()-$renderFunction->getStartLine()+1));
$beforeRender = str_replace(['function renderFacets(', '\\Extensions\\Base_Extension('],
    ['function phase11BeforeRenderFacets(', '\\Extensions\\Phase11BeforeExtension('], $beforeRender);
eval($beforeRender);

class Phase11FacetValue implements ArrayAccess {
    public static $nameReads = 0;
    private $value;
    public function __construct(array $value) { $this->value = $value; }
    public function offsetExists(mixed $offset): bool { return isset($this->value[$offset]); }
    public function offsetGet(mixed $offset): mixed {
        if ($offset === 'name') self::$nameReads++;
        return $this->value[$offset];
    }
    public function offsetSet(mixed $offset, mixed $value): void { throw new RuntimeException('Unexpected input mutation'); }
    public function offsetUnset(mixed $offset): void { throw new RuntimeException('Unexpected input mutation'); }
}
function phase11Helper($class, $raw) {
    $request = new \Plenty\Plugin\Http\Request();
    $request->params = ['facets' => $raw];
    return new $class(new \Plenty\Plugin\Templates\Factories\TwigFactory(), new \Plenty\Plugin\Templates\Twig(), $request);
}
function phase11Model($class, $groups, $raw, $own) {
    foreach ($groups as &$group) {
        foreach ($group['values'] as &$value) $value = new Phase11FacetValue($value);
        unset($value);
    }
    unset($group);
    Phase11FacetValue::$nameReads = 0;
    $model = phase11Helper($class, $raw)->getFacetView($groups, $own);
    return ['model'=>$model, 'nameReads'=>Phase11FacetValue::$nameReads];
}
$oldClass = \GuardiansBasicB2B\Extensions\Phase11BeforeExtension::class;
$newClass = \GuardiansBasicB2B\Extensions\Base_Extension::class;
$fixtures = json_decode(file_get_contents(__DIR__ . '/fixtures/facets.json'), true, 512, JSON_THROW_ON_ERROR);
$cases = [];
$inputs = [
    [null, []], ['', []], ['3118', []], ['3118,659,3118', [2247, '659']],
    ['0007, 9 ,0,-1,bad,,', [7, '9', null, false, [], '01']],
    [['0007', ' 9 ', '0', '-1', '', [], false, null], ['3118', '659']],
    ['9999999999999999999999999', [PHP_INT_MAX, (string)PHP_INT_MAX]],
    [true, ['99999999']], [0, [1, '1']], ['8855,726,727,728', []]
];
foreach ($fixtures as $kind => $fixture) {
    foreach ($inputs as $i => [$raw, $own]) {
        $old = phase11Model($oldClass, $fixture['groups'], $raw, $own);
        $new = phase11Model($newClass, $fixture['groups'], $raw, $own);
        if ($old['model'] !== $new['model']) throw new RuntimeException("Changed facet output: $kind/$i");
        $cases[] = ['kind'=>$kind, 'input'=>$i, 'values'=>array_sum(array_map('count', $new['model']['values'])),
            'selected'=>count($new['model']['selected']), 'nameReadsBefore'=>$old['nameReads'], 'nameReadsAfter'=>$new['nameReads'],
            'jsonBytes'=>strlen(json_encode($new['model'], JSON_UNESCAPED_UNICODE))];
    }
}
// Repeated bucket IDs keep the last matching name, including null/empty/escaped names.
$edgeGroups = [['id'=>1, 'values'=>[
    ['id'=>7, 'name'=>'first', 'count'=>4], ['id'=>'7', 'name'=>'<last>&"', 'count'=>'2'],
    ['id'=>9, 'name'=>null, 'count'=>0], ['id'=>10, 'name'=>'', 'count'=>1]
]]];
$edge = phase11Model($newClass, $edgeGroups, '7,9,10,11', []);
if ($edge['model'] !== phase11Model($oldClass, $edgeGroups, '7,9,10,11', [])['model']) throw new RuntimeException('Changed repeated/missing bucket semantics');
if (array_column($edge['model']['active'], 'name') !== ['<last>&"', null, '', null]) throw new RuntimeException('Wrong active labels');
if (array_column($edge['model']['active'], 'remaining') !== ['9,10,11','7,10,11','7,9,11','7,9,10']) throw new RuntimeException('Wrong removal order');

// Complete actual facet markup is rendered with each helper, including the same language routes.
$htmlPairs = 0;
foreach (['de','en','fr','it','es'] as $lang) foreach ($fixtures as $kind=>$fixture) foreach ([null, '3118,659,99999999'] as $raw) {
    $current = renderFacets(['kind'=>$kind, 'lang'=>$lang, 'params'=>['facets'=>$raw]]);
    $before = phase11BeforeRenderFacets(['kind'=>$kind, 'lang'=>$lang, 'params'=>['facets'=>$raw]]);
    if ($current !== $before) throw new RuntimeException('Rendered HTML or context differs');
    $htmlPairs++;
}
$report = ['status'=>'PASS', 'twig'=>\Twig\Environment::VERSION,
    'comparisonCases'=>count($cases)+1, 'htmlComparisons'=>$htmlPairs, 'cases'=>$cases,
    'sourceBytesBefore'=>strlen(file_get_contents($beforePath)), 'sourceBytesAfter'=>filesize(dirname(__DIR__).'/src/Extensions/Base_Extension.php'),
    'requestsRemoved'=>0, 'outputBytesSaved'=>0, 'runtimeChange'=>'NOT_MEASURED',
    'boundary'=>'Local historical facet fixtures and invalid-input cases; no native shop profiling.'];
file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE|JSON_THROW_ON_ERROR));
echo json_encode(['status'=>'PASS','twig'=>$report['twig'],'comparisonCases'=>$report['comparisonCases'],'htmlComparisons'=>$htmlPairs])."\n";
