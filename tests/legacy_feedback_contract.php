<?php
// php tests/legacy_feedback_contract.php [before-Base_Extension.php] [report.json]
// Real helper methods, explicit repository fixtures; no native PlentyONE calls.
namespace Plenty\Plugin\Templates\Extensions { class Twig_Extension {} }
namespace Plenty\Plugin\Templates\Factories { class TwigFactory {} }
namespace Plenty\Plugin\Templates { class Twig {} }
namespace Plenty\Plugin\Http { class Request {} }
namespace Plenty\Modules\Feedback\Contracts {
    class FeedbackRepositoryContract {
        public array $calls = [];
        public $result;
        public bool $fail = false;
        public function listFeedbacks(...$args) {
            $this->calls[] = $args;
            if ($this->fail) { throw new \RuntimeException('Feedback unavailable'); }
            return $this->result;
        }
    }
    class FeedbackAverageRepositoryContract {
        public array $calls = [];
        public $result;
        public bool $fail = false;
        public function getFeedbackAverage(...$args) {
            $this->calls[] = $args;
            if ($this->fail) { throw new \RuntimeException('Feedback unavailable'); }
            return $this->result;
        }
    }
}
namespace {
set_error_handler(function ($level, $message, $file, $line) {
    throw new \ErrorException($message, 0, $level, $file, $line);
});

class LegacyFeedbackData {
    public int $calls = 0;
    private array $data;
    private bool $fail;
    public function __construct(array $data, bool $fail) { $this->data = $data; $this->fail = $fail; }
    public function toArray() {
        $this->calls++;
        if ($this->fail) { throw new \RuntimeException('Feedback conversion failed'); }
        return $this->data;
    }
}
function pluginApp($class, $parameters = []) {
    $GLOBALS['resolutions'][] = $class;
    if (!array_key_exists($class, $GLOBALS['services'])) {
        throw new \LogicException('Unexpected dependency: ' . $class);
    }
    return $GLOBALS['services'][$class];
}
$assertions = 0;
function check($condition, $message) {
    $GLOBALS['assertions']++;
    if (!$condition) { throw new \RuntimeException($message); }
}

$root = dirname(__DIR__);
$currentPath = $root . '/src/Extensions/Base_Extension.php';
require $currentPath;
$baselinePath = $argv[1] ?? null;
$classes = ['current' => \GuardiansBasicB2B\Extensions\Base_Extension::class];
if ($baselinePath !== null) {
    $source = file_get_contents($baselinePath);
    $needle = 'class Base_Extension extends Twig_Extension';
    check(substr_count($source, $needle) === 1, 'Expected one baseline extension class');
    $source = str_replace($needle, 'class LegacyBeforeBaseExtension extends Twig_Extension', $source);
    eval(substr($source, 5));
    $classes = ['before' => \GuardiansBasicB2B\Extensions\LegacyBeforeBaseExtension::class] + $classes;
}

$methods = [
    'getFeedbackItemList' => \Plenty\Modules\Feedback\Contracts\FeedbackRepositoryContract::class,
    'getListFeedbackAverages' => \Plenty\Modules\Feedback\Contracts\FeedbackAverageRepositoryContract::class
];
$cases = ['null', 'empty', 'data', 'repository-error', 'conversion-error'];
$rows = [];
foreach ($methods as $method => $contract) {
    foreach ([42, '42'] as $itemId) {
        foreach ($cases as $case) {
            $data = $case === 'empty' ? [] : ['entries' => [['id' => 7, 'rating' => 5]], 'total' => 1];
            $expectedCalls = $method === 'getFeedbackItemList'
                ? [[2, 20, [], ['itemId' => $itemId, 'ratingValue' => 5]]]
                : [[$itemId]];
            $expectedOutcome = ['return' => $case === 'null' ? null : $data];
            if ($case === 'repository-error') {
                $expectedOutcome = ['exception' => \RuntimeException::class, 'message' => 'Feedback unavailable'];
            } elseif ($case === 'conversion-error') {
                $expectedOutcome = ['exception' => \RuntimeException::class, 'message' => 'Feedback conversion failed'];
            }
            $results = [];
            foreach ($classes as $version => $class) {
                $repo = new $contract();
                $wrapper = new LegacyFeedbackData($data, $case === 'conversion-error');
                $repo->result = $case === 'null' ? null : $wrapper;
                $repo->fail = $case === 'repository-error';
                $GLOBALS['services'] = [$contract => $repo];
                $GLOBALS['resolutions'] = [];
                $helper = new $class(new \Plenty\Plugin\Templates\Factories\TwigFactory(), new \Plenty\Plugin\Templates\Twig(), new \Plenty\Plugin\Http\Request());
                try {
                    $value = $method === 'getFeedbackItemList'
                        ? $helper->$method($itemId, 2, 20)
                        : $helper->$method($itemId);
                    $outcome = ['return' => $value];
                } catch (\RuntimeException $e) {
                    $outcome = ['exception' => get_class($e), 'message' => $e->getMessage()];
                }
                check($repo->calls === $expectedCalls, "$method/$case/$version: repository call contract");
                check($GLOBALS['resolutions'] === [$contract], "$method/$case/$version: one intended dependency resolution");
                check($wrapper->calls === (in_array($case, ['null', 'repository-error'], true) ? 0 : 1), "$method/$case/$version: conversion count");
                check($outcome === $expectedOutcome, "$method/$case/$version: returned value or propagated exception");
                $results[$version] = ['calls' => $repo->calls, 'resolutions' => $GLOBALS['resolutions'], 'conversionCalls' => $wrapper->calls, 'outcome' => $outcome];
            }
            if ($baselinePath !== null) {
                check($results['before'] === $results['current'], "$method/$case: before/current contract equality");
            }
            $rows[] = ['method' => $method, 'itemId' => $itemId, 'case' => $case, 'results' => $results];
        }
    }
}
$report = [
    'mode' => $baselinePath === null ? 'LOCAL_CURRENT_CONTRACT' : 'LOCAL_BEFORE_AFTER_CONTRACT',
    'nativeCalls' => 0,
    'php' => PHP_VERSION,
    'baselineSha256' => $baselinePath === null ? null : hash_file('sha256', $baselinePath),
    'currentSha256' => hash_file('sha256', $currentPath),
    'cases' => count($rows),
    'methodExecutions' => count($rows) * count($classes),
    'assertions' => $assertions,
    'results' => $rows,
    'limits' => 'Explicit service fixtures; no native customer classes, server timings, orders or payments tested.'
];
if (isset($argv[2])) {
    file_put_contents($argv[2], json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR) . PHP_EOL);
}
echo count($rows) . ' cases / ' . $report['methodExecutions'] . ' method executions / ' . $assertions . ' assertions PASS; native calls: 0.' . PHP_EOL;
}
