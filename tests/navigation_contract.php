<?php
// php tests/navigation_contract.php <Twig autoloader> <report.json>
// Compare actual rendered navigation with the independent pre-refactor Git source.
// Explicit service fixtures; this is not a native PlentyONE performance benchmark.
require $argv[1];
$root = dirname(__DIR__);
$baselineRef = '96e50ee';
$reports = dirname($argv[2]);
if (!is_dir($reports)) { mkdir($reports, 0777, true); }
$deprecations = [];
set_error_handler(function ($level, $message, $file, $line) use (&$deprecations) {
    if (in_array($level, [E_DEPRECATED, E_USER_DEPRECATED], true)) {
        $deprecations[$message] = ['file' => $file, 'line' => $line];
        return true;
    }
    throw new ErrorException($message, 0, $level, $file, $line);
});
function baselineSource($file) {
    global $root, $baselineRef;
    $proc = proc_open(['git', 'show', $baselineRef . ':' . $file], [1 => ['pipe','w'], 2 => ['pipe','w']], $pipes, $root);
    $source = stream_get_contents($pipes[1]); $error = stream_get_contents($pipes[2]);
    fclose($pipes[1]); fclose($pipes[2]);
    if (proc_close($proc)) { throw new RuntimeException($error); }
    return $source;
}
function ensure($value, $message) { if (!$value) { throw new RuntimeException($message); } }
class NavigationCurrencyFixture {
    public $currency = 'EUR', $calls = 0;
    public function getCurrencyData() { $this->calls++; return ['name' => $this->currency]; }
}
function environment($templates, $service) {
    $twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['cache' => false, 'autoescape' => 'html', 'strict_variables' => true]);
    $twig->addGlobal('services', ['checkout' => $service]);
    return $twig;
}
function semanticNode($node) {
    if ($node instanceof DOMText) {
        $text = trim(preg_replace('/\s+/u', ' ', $node->nodeValue));
        return $text === '' ? null : $text;
    }
    if (!($node instanceof DOMElement)) { return null; }
    $attributes = [];
    foreach ($node->attributes as $attribute) { $attributes[$attribute->nodeName] = $attribute->nodeValue; }
    ksort($attributes);
    $children = [];
    foreach ($node->childNodes as $child) {
        $entry = semanticNode($child);
        if ($entry !== null) { $children[] = $entry; }
    }
    return [$node->tagName, $attributes, $children];
}
function semanticDom($html) {
    $dom = new DOMDocument();
    $previous = libxml_use_internal_errors(true);
    $dom->loadHTML('<?xml encoding="UTF-8"><!doctype html><html><body><ul id="navigation-fixture">' . $html . '</ul></body></html>');
    libxml_clear_errors(); libxml_use_internal_errors($previous);
    return [$dom, semanticNode($dom->getElementById('navigation-fixture'))];
}
function median($values) { sort($values); return $values[intdiv(count($values), 2)]; }
$prefix = 'GuardiansBasicB2B::Category.Macros.';
$before = []; $after = []; $sourceBefore = 0; $sourceAfter = 0;
foreach (['DE','EN','FR','IT','ES'] as $lang) {
    $file = 'resources/views/Category/Macros/CategoryTree' . $lang . '.twig';
    $before[$prefix . 'CategoryTree' . $lang . '.twig'] = baselineSource($file);
    $after[$prefix . 'CategoryTree' . $lang . '.twig'] = file_get_contents($root . '/' . $file);
    $sourceBefore += strlen($before[$prefix . 'CategoryTree' . $lang . '.twig']);
    $sourceAfter += strlen($after[$prefix . 'CategoryTree' . $lang . '.twig']);
}
$shared = file_get_contents($root . '/resources/views/Category/Macros/CategoryNavigation.twig');
$after[$prefix . 'CategoryNavigation.twig'] = $shared;
$sourceAfter += strlen($shared);
$beforeService = new NavigationCurrencyFixture(); $afterService = new NavigationCurrencyFixture();
$old = environment($before, $beforeService); $new = environment($after, $afterService);
$rows = [];
foreach (['DE','EN','FR','IT','ES'] as $lang) {
    $caller = '{% import "' . $prefix . 'CategoryTree' . $lang . '.twig" as Tree %}{{ Tree.get_nav_bar([], "") }}';
    $oldCaller = $old->createTemplate($caller); $newCaller = $new->createTemplate($caller);
    foreach (['EUR','USD','CHF'] as $currency) {
        $beforeService->currency = $afterService->currency = $currency;
        $beforeService->calls = $afterService->calls = 0;
        $oldHtml = $oldCaller->render([]); $newHtml = $newCaller->render([]);
        ensure($beforeService->calls === 1 && $afterService->calls === 1, "$lang/$currency currency service contract");
        [$oldDom, $oldTree] = semanticDom($oldHtml); [$newDom, $newTree] = semanticDom($newHtml);
        ensure($oldTree === $newTree, "$lang/$currency DOM, attributes, texts or order changed");
        $links = $newDom->getElementsByTagName('a');
        ensure($links->length === ($lang === 'DE' ? 142 : 141), "$lang/$currency active link count changed");
        foreach ($links as $link) {
            $href = $link->getAttribute('href');
            if ($href === 'javascript:void(0)') { continue; }
            ensure($currency === 'EUR' ? strpos($href, '?currency=') === false : str_ends_with($href, '?currency=' . $currency), "$lang/$currency currency suffix changed");
        }
        $durationBefore = []; $durationAfter = [];
        // Interleaved warm renders avoid counting compilation as request work.
        for ($i = 0; $i < 25; $i++) {
            $start = hrtime(true); $oldCaller->render([]); $durationBefore[] = (hrtime(true)-$start)/1e6;
            $start = hrtime(true); $newCaller->render([]); $durationAfter[] = (hrtime(true)-$start)/1e6;
        }
        $rows[] = ['language'=>$lang,'currency'=>$currency,'status'=>'PASS','htmlBytesBefore'=>strlen($oldHtml),'htmlBytesAfter'=>strlen($newHtml),
            'savedHtmlBytes'=>strlen($oldHtml)-strlen($newHtml),'activeLinks'=>$links->length,
            'elementsBefore'=>$oldDom->getElementsByTagName('*')->length-3, 'elementsAfter'=>$newDom->getElementsByTagName('*')->length-3,
            'currencyCallsBefore'=>1,'currencyCallsAfter'=>1,
            'warmRenderMsBeforeMedian'=>median($durationBefore),'warmRenderMsAfterMedian'=>median($durationAfter),
            'warmRenderMsBefore'=>$durationBefore,'warmRenderMsAfter'=>$durationAfter];
        file_put_contents($reports . '/navigation-' . strtolower($lang) . '-' . strtolower($currency) . '-before.html', $oldHtml);
        file_put_contents($reports . '/navigation-' . strtolower($lang) . '-' . strtolower($currency) . '-after.html', $newHtml);
    }
    // Keep the pre-existing public helper available, including HTML escaping.
    $helper = '{% import "' . $prefix . 'CategoryTree' . $lang . '.twig" as Tree %}{{ Tree.currencyUrl(url, currency) }}';
    $context = ['url'=>'/unchanged/?a="b"&x=1', 'currency'=>'USD&extra="value"'];
    ensure($old->createTemplate($helper)->render($context) === $new->createTemplate($helper)->render($context), "$lang public currencyUrl helper changed");
}
$report = ['status'=>'PASS','kind'=>'LOCAL_REAL_TWIG_RENDER_WITH_EXPLICIT_CURRENCY_SERVICE_FIXTURE','baseline'=>$baselineRef,
    'php'=>PHP_VERSION,'twig'=>Twig\Environment::VERSION,'cases'=>count($rows),'helperCompatibilityCases'=>5,
    'sourceBytesBefore'=>$sourceBefore,'sourceBytesAfter'=>$sourceAfter,'sourceBytesSaved'=>$sourceBefore-$sourceAfter,
    'rows'=>$rows,'deprecations'=>$deprecations,
    'limits'=>['Whitespace-only text nodes intentionally reduced; element tree, attributes, link order and visible texts compared against independent baseline.',
        'Warm local Twig timings are isolated measurements; no native PHP time, TTFB, compressed transfer, LCP, CLS or INP claim.',
        'Browser layout and mobile event tests are separate. No category lookup or browser data request added.']];
file_put_contents($argv[2], json_encode($report, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE));
echo json_encode(['status'=>'PASS','twig'=>$report['twig'],'cases'=>count($rows),'helperCases'=>5,'sourceBytesSaved'=>$report['sourceBytesSaved'],'savedHtmlBytes'=>$rows[0]['savedHtmlBytes']]), PHP_EOL;
