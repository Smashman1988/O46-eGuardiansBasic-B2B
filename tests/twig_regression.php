<?php
// Run with an external Twig autoloader; no test dependencies are shipped to PlentyONE.
// php tests/twig_regression.php <autoload.php> <report.json> [--baseline] [--compare=<baseline-report.json>]
const BASELINE = '0342310d2b4cb6e915b662557aa445bbef916934';
$root = dirname(__DIR__);
$baseline = in_array('--baseline', $argv, true);
$notices = [];
// Record legacy-engine deprecations separately; warnings/errors still fail the run.
set_error_handler(function ($level, $message, $file, $line) use (&$notices) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) {
        $notices[$message] = ['file' => $file, 'line' => $line];
        return true;
    }
    throw new ErrorException($message, 0, $level, $file, $line);
});
if (count($argv) < 3) { throw new RuntimeException('Expected external autoloader and report path'); }
require $argv[1];
function source(string $file): string {
    global $root, $baseline;
    if (!$baseline) { return file_get_contents($root . '/' . $file); }
    $process = proc_open(['git', 'show', BASELINE . ':' . $file], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $root);
    $text = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($error); }
    return $text;
}
function ensure(bool $condition, string $message): void {
    if (!$condition) { throw new RuntimeException($message); }
}
function loopSource(string $text, string $variable): string {
    preg_match_all('/\{%\s*(for\s+.*?|endfor)\s*%\}/s', $text, $tags, PREG_OFFSET_CAPTURE);
    $start = null; $depth = 0;
    foreach ($tags[0] as [$tag, $offset]) {
        if ($start === null) {
            if (!preg_match('/\{%\s*for\s+' . preg_quote($variable, '/') . '\s+in\b/', $tag)) { continue; }
            $start = $offset;
        }
        $depth += preg_match('/\{%\s*endfor/', $tag) ? -1 : 1;
        if ($depth === 0) { return substr($text, $start, $offset + strlen($tag) - $start); }
    }
    throw new RuntimeException('Loop not found: ' . $variable);
}
function instrument(string $text, string $marker, string $expression): string {
    $offset = strpos($text, $marker);
    ensure($offset !== false, 'Instrumentation marker not found: ' . $marker);
    return substr_replace($text, '{{ trace(' . $expression . ') }}', $offset, 0);
}
function environment(array $templates = []): Twig\Environment {
    $twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['cache' => false, 'strict_variables' => false]);
    return $twig;
}

$report = ['baseline' => BASELINE, 'source' => $baseline ? 'baseline' : 'working-tree',
    'php' => PHP_VERSION, 'twig' => Twig\Environment::VERSION, 'syntax' => [], 'cases' => [], 'failures' => []];
$syntax = environment();
// Explicit syntax-only registry: Plenty/IO/Ceres and Base_Extension functions used here.
// Unknown functions/filters are NOT accepted automatically. These callbacks must never render.
$functions = ['component','config','csrf_token','getAttributesWithImages','getCardAttributeMaps','getBasePriceList',
    'getFacetsFromCat','getFacetView','getFeedbackItemList','getImageAttributeList','getListFeedbackAverages',
    'getPartial','get_additional_scripts','get_additional_styles','get_consent_scripts',
    'get_filtered_tags','get_json_data','get_shop_builder_scripts','plugin_path','queryString',
    'shop_builder_category_template','ssr_entry','trans','createSeoPage','prepareSeoContent'];
$filters = ['addressOptionType','filterFields','filterTabs','formatDateTime','formatMonetary',
    'getObjectValue','int','itemName','itemURL','orderByKey','specialOffer','trimNewlines'];
$syntaxOnly = function () { throw new RuntimeException('Syntax-only Plenty placeholder was executed'); };
foreach ($functions as $name) { $syntax->addFunction(new Twig\TwigFunction($name, $syntaxOnly)); }
foreach ($filters as $name) { $syntax->addFilter(new Twig\TwigFilter($name, $syntaxOnly)); }
$files = [];
if ($baseline) {
    // New components need not exist in the historical regression baseline.
    $process = proc_open(['git', 'ls-tree', '-r', '--name-only', BASELINE, '--', 'resources/views'], [1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes, $root);
    $inventory = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($process) !== 0) { throw new RuntimeException($error); }
    $files = array_values(array_filter(explode("\n", trim($inventory)), function ($file) { return substr($file, -5) === '.twig'; }));
} else {
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root . '/resources/views')) as $file) {
        if ($file->getExtension() === 'twig') { $files[] = str_replace('\\', '/', substr($file->getPathname(), strlen($root) + 1)); }
    }
}
sort($files); ensure(count($files) === ($baseline ? 168 : 173), 'Unexpected Twig inventory');
foreach ($files as $file) {
    try { $syntax->parse($syntax->tokenize(new Twig\Source(source($file), $file))); $report['syntax'][$file] = 'PASS'; }
    catch (Throwable $e) { $report['syntax'][$file] = $e->getMessage(); }
}
function test(string $name, callable $run): void {
    global $report;
    try { $report['cases'][$name] = $run(); }
    catch (Throwable $e) { $report['failures'][$name] = $e->getMessage(); }
}
// Twig 2 predates PHP 8.4's changed Closure reflection names. Ordinary method
// callbacks work on both engines without patching either parser or production code.
class FixtureCallback {
    private $callback;
    public function __construct(callable $callback) { $this->callback = $callback; }
    public function invoke(...$arguments) { return ($this->callback)(...$arguments); }
}
function renderCase(string $text, array $context, array &$trace, array $templates = [], array $functions = []): string {
    $twig = environment($templates);
    $functions['trace'] = function ($value) use (&$trace) { $trace[] = $value; return ''; };
    $functions['trans'] = function ($key) { return $key; };
    foreach ($functions as $name => $callback) { $twig->addFunction(new Twig\TwigFunction($name, [new FixtureCallback($callback), 'invoke'])); }
    return $twig->createTemplate($text)->render($context);
}
function compactHtml(string $html): string { return preg_replace('/>\s+</', '><', trim($html)); }
$views = 'resources/views/';

$category = function ($id, $valid = true) { return ['id' => $id, 'details' => $valid ? [['name' => 'Category ' . $id]] : []]; };
$breadcrumbCases = [
    'empty' => [[], []], 'single' => [[$category(3)], []],
    'normal' => [[$category(1), $category(2), $category(3)], [1, 2]],
    'first-missing' => [[$category(1, false), $category(2), $category(3)], []],
    'gap-stops' => [[$category(1), $category(2, false), $category(3), $category(4)], [1]]
];
foreach ($breadcrumbCases as $name => [$items, $expected]) {
    test('breadcrumbs/' . $name, function () use ($views, $items, $expected) {
        $trace = [];
        $service = new class { public function getURLById($id) { return '/c/' . $id; } };
        $html = renderCase(source($views . 'Category/Components/CategoryBreadcrumbs.twig'),
            ['categoryBreadcrumbs' => $items, 'homepageURL' => '/', 'services' => ['category' => $service]], $trace);
        preg_match_all('~href="/c/(\d+)"~', $html, $links);
        ensure(array_map('intval', $links[1]) === $expected, 'Breadcrumb order/early-stop changed');
        return ['links' => $expected, 'html' => compactHtml($html)];
    });
}

foreach ([[], [$category(1)], [$category(1, false), $category(2), $category(3, false), $category(4)],
    [4 => $category(9), 8 => $category(7)], [$category(1, false)]] as $case => $children) {
    test('brands/' . $case, function () use ($views, $children) {
        $loop = loopSource(source($views . 'Category/Item/CategoryItemBrands.twig'), 'children');
        ensure(strpos($loop, 'loop.') === false, 'New loop-variable dependency requires review');
        $loop = instrument($loop, '{% set translatedChildren', 'children.id'); $trace = [];
        $result = trim(renderCase('{% set translatedChildren = 0 %}' . $loop . '{{ translatedChildren }}', ['category' => ['children' => $children]], $trace));
        $expected = array_values(array_map(function ($v) { return $v['id']; }, array_filter($children, function ($v) { return !empty($v['details'][0]); })));
        ensure($trace === $expected && (int)$result === count($expected), 'Brand selection/count changed');
        return ['selected' => $trace, 'count' => (int)$result];
    });
}

$defaultAmount = ['id' => 1, 'priceOriginalNet' => 10, 'priceOriginalGross' => 12, 'currency' => 'EUR'];
$otherAmount = ['id' => 2, 'priceOriginalNet' => 20, 'priceOriginalGross' => 24, 'currency' => 'USD'];
foreach ([
    'canonical-only-net' => [[], null, true, 10, []],
    'canonical-only-gross' => [[], null, false, 12, []],
    'legacy-field-last-net' => [[$defaultAmount, $otherAmount], null, true, 20, [1,2]],
    'legacy-field-last-gross' => [[$otherAmount, $defaultAmount], ['isSystemCurrency' => false], false, 12, [2,1]],
    'legacy-global-guard' => [[$otherAmount], ['isSystemCurrency' => true], true, 10, []],
    'legacy-empty' => [[], ['isSystemCurrency' => false], false, 12, []]
] as $name => [$legacyAmounts, $amout, $net, $price, $selected]) {
    test('amounts/' . $name, function () use ($views, $legacyAmounts, $amout, $net, $price, $selected, $defaultAmount) {
        $src = source($views . 'Checkout/OrderDetails.twig');
        $start = strpos($src, '{% set itemAmount = item.amounts[0] %}');
        $end = strpos($src, '<div class="row">', strpos($src, '{% set itemPrice = 0 %}'));
        $snippet = instrument(substr($src, $start, $end - $start), '{% set itemAmount = amount %}', 'amount.id');
        ensure(strpos($snippet, 'loop.') === false, 'New loop-variable dependency requires review');
        $context = ['item' => ['amounts' => [$defaultAmount]], 'orderData' => ['highlightNetPrices' => $net]];
        if ($legacyAmounts) { $context['item']['amouts'] = $legacyAmounts; }
        if ($amout !== null) { $context['amout'] = $amout; }
        $trace = []; $actual = trim(renderCase($snippet . '{{ itemPrice }}', $context, $trace));
        ensure((float)$actual === (float)$price && $trace === $selected, 'Existing amount mapping or net/gross selection changed');
        return ['selected' => $trace, 'price' => (float)$actual];
    });
}

$orders = function ($groups) { $out = []; foreach ($groups as $id => $ids) { $out[] = ['id' => $id, 'order' => ['orderItems' => array_map(function ($id) { return ['itemVariationId' => $id]; }, $ids)]]; } return $out; };
foreach (['FeedbackContainer-backup.twig', 'FeedbackForm-backup.twig'] as $file) {
    foreach ([
        'first-match' => [1, [[100,200]], [100,200], 100],
        'variation-order' => [1, [[200,100], [300]], [100,200,300], 100],
        'later-order' => [1, [[999], [200,300]], [100,200,300], 200],
        'no-match-fallback' => [1, [[999]], [100,200], 100],
        'no-orders-fallback' => [1, [], [100], 100],
        'guest-fallback' => [0, [[200]], [100,200], 100],
        'empty-variants' => [1, [[100]], [], null]
    ] as $name => [$contact, $groups, $ids, $chosen]) {
        test('feedback/' . $file . '/' . $name, function () use ($views, $file, $contact, $groups, $ids, $chosen, $orders) {
            $src = source($views . 'Containers/' . $file);
            $start = strpos($src, '{% set customerHasBuyThisItem = false %}');
            $fallback = strpos($src, '{% if buyedVariationId==');
            $end = strpos($src, '{% endif %}', $fallback) + strlen('{% endif %}');
            $snippet = substr($src, $start, $end - $start);
            ensure(strpos($snippet, 'loop.') === false, 'New loop-variable dependency requires review');
            $snippet = instrument($snippet, '{% if singleOrder.itemVariationId==singleVariation.variationId %}', '[customerOrder.id, singleVariation.variationId, singleOrder.itemVariationId]');
            $customer = new class($contact, $orders($groups)) {
                private $contact; private $entries;
                public function __construct($contact, $entries) { $this->contact = $contact; $this->entries = $entries; }
                public function getContactId() { return $this->contact; }
                public function getOrders() { return new class($this->entries) {
                    private $entries;
                    public function __construct($entries) { $this->entries = $entries; }
                    public function toArray() { return ['entries' => $this->entries]; }
                }; }
            };
            $trace = []; $json = renderCase($snippet . '{{ [customerHasBuyThisItem, buyedVariationId]|json_encode|raw }}',
                ['services' => ['customer' => $customer], 'variationsWithAttributes' => array_map(function ($id) { return ['variationId' => $id]; }, $ids)], $trace);
            $actual = json_decode(trim($json), true, 512, JSON_THROW_ON_ERROR);
            $expectedTrace = []; $found = false;
            if ($contact) { foreach ($groups as $order => $group) { foreach ($ids as $id) { foreach ($group as $item) {
                if (!$found) { $expectedTrace[] = [$order, $id, $item]; if ($item === $id) { $found = true; } }
            } } } }
            ensure($actual === [true, $chosen] && $trace === $expectedTrace, 'Feedback first-match/fallback or nested order changed');
            return ['state' => $actual, 'visited' => $trace];
        });
    }
}

foreach (['empty' => [], 'none' => [false,false], 'first' => [true,false,true], 'late' => [false,true,true], 'last' => [false,false,true]] as $name => $flags) {
    test('images/' . $name, function () use ($views, $flags) {
        $attributes = []; $expectedImages = []; $expectedVisits = [];
        $found = false;
        foreach ($flags as $key => $hasImage) {
            $attributes[$key] = ['values' => [5 => 'value'], 'images' => $hasImage ? [5 => ['urlMiddle' => '/middle/' . $key, 'urlSecondPreview' => '/preview/' . $key]] : []];
            if (!$found) { $expectedVisits[] = $key; $found = $hasImage; }
            if ($hasImage) { $expectedImages[] = '/preview/' . $key; }
        }
        $text = source($views . 'DynamicContent/DynamicCatPreviewImages.twig');
        $text = instrument($text, '{% for itemAttributeValueKey,itemAttributeValue in itemAttribute.values %}', 'itemAttributeKey');
        $item = new class { public function getAttributeNameMap($id) { return ['attributes' => []]; } };
        $trace = []; $html = renderCase($text, ['sItemId' => 1, 'variationKey' => 99, 'services' => ['item' => $item]], $trace, [],
            ['getImageAttributeList' => function () use ($attributes) { return $attributes; }]);
        preg_match_all('~<img src="([^"]+)"~', $html, $images);
        ensure($images[1] === $expectedImages && $trace === $expectedVisits, 'Image order/detection changed');
        if (!$expectedImages) { ensure(trim($html) === 'null', 'Missing image fallback changed'); }
        return ['images' => $images[1], 'visited' => $trace, 'html' => compactHtml($html)];
    });
}

foreach (['undefined' => [], 'null' => ['category' => null], 'linked' => ['category' => ['id' => 42]]] as $name => $context) {
    test('confirmation-title/' . $name, function () use ($views, $context) {
        $src = source($views . 'Checkout/OrderConfirmation.twig');
        $start = strpos($src, '{% embed'); $end = strpos($src, '{% endembed %}') + strlen('{% endembed %}');
        $trace = []; $html = renderCase(substr($src, $start, $end - $start), $context, $trace,
            ['metadata' => '<title>{% block title %}CATEGORY TITLE{% endblock %}</title>'], ['getPartial' => function () { return 'metadata'; }]);
        ensure(trim($html) === '<title>Ceres::Template.orderConfirmation</title>', 'Legacy unconditional title changed');
        return trim($html);
    });
}

$report['syntaxPass'] = count(array_filter($report['syntax'], function ($v) { return $v === 'PASS'; }));
$report['syntaxTotal'] = count($files);
$report['casePass'] = count($report['cases']);
$report['deprecations'] = $notices;
$report['comparison'] = 'NOT_RUN';
foreach ($argv as $argument) {
    if (strpos($argument, '--compare=') !== 0) { continue; }
    $reference = json_decode(file_get_contents(substr($argument, strlen('--compare='))), true, 512, JSON_THROW_ON_ERROR);
    ensure($reference['baseline'] === BASELINE && $reference['source'] === 'baseline' && $reference['twig'] === '2.16.1', 'Wrong reference report');
    ensure($reference['casePass'] === 38 && !$reference['failures'] && $reference['syntaxPass'] === 168, 'Incomplete reference report');
    if (json_decode(json_encode($report['cases']), true) !== $reference['cases']) {
        $report['failures']['baseline-comparison'] = 'Outputs/states/visit order differ from the Twig 2 baseline';
        $report['comparison'] = 'FAIL';
    } else { $report['comparison'] = '38/38 PASS'; }
}
file_put_contents($argv[2], json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo json_encode(['twig' => $report['twig'], 'source' => $report['source'], 'syntaxPass' => $report['syntaxPass'],
    'syntaxTotal' => count($files), 'casePass' => $report['casePass'], 'comparison' => $report['comparison'], 'failures' => $report['failures'], 'deprecations' => count($notices)], JSON_PRETTY_PRINT), PHP_EOL;
exit($report['syntaxPass'] === count($files) && !$report['failures'] ? 0 : 1);
