<?php
// Render the actual shared Twig matrix with explicit local variant fixtures.
// php tests/variant_matrix.php <Twig autoloader> <output.json>
require $argv[1];
$source = file_get_contents(__DIR__ . '/../resources/views/Item/SingleItem.twig');
$start = strpos($source, '    <div class="eg-size-matrix"');
$end = strpos($source, '</button>', $start);
$end = strpos($source, '</div>', strpos($source, '</div>', $end) + 6) + 6;
if ($start === false || $end <= $start) { throw new RuntimeException('Matrix template missing'); }
$template = substr($source, $start, $end - $start);
$out = [];
$sizesPerColor = getenv('O46_MATRIX_LARGE') ? 30 : 12;
function matrixTestTranslate($key) {
    $key = substr($key, strrpos($key, '.') + 1);
    if (!isset($GLOBALS['matrixTestTranslations'][$key])) { throw new RuntimeException('Missing translation ' . $key); }
    return $GLOBALS['matrixTestTranslations'][$key];
}
foreach (['de', 'en', 'fr', 'it', 'es'] as $lang) {
    $translations = [];
    foreach (file(__DIR__ . '/../resources/lang/' . $lang . '/Template.properties') as $line) {
        if (preg_match('/^([^#=\s]+)\s*=\s*(.*)$/u', trim($line), $m)) { $translations[$m[1]] = $m[2]; }
    }
    $twig = new Twig\Environment(new Twig\Loader\ArrayLoader(['matrix' => $template]), ['autoescape' => 'html']);
    // Named callable also works with Twig 2's compiler on PHP 8.4.
    $GLOBALS['matrixTestTranslations'] = $translations;
    $twig->addFunction(new Twig\TwigFunction('trans', 'matrixTestTranslate'));
    foreach (['none', 'size', 'color', 'size_color'] as $mode) {
        $hasSize = str_contains($mode, 'size'); $hasColor = str_contains($mode, 'color');
        $sizes = [];
        for ($i = 1; $i <= $sizesPerColor; $i++) { $sizes[] = ['attributeValueId' => $i, 'name' => (string) (35 + $i), 'position' => $i]; }
        $colors = [['attributeValueId' => 101, 'name' => 'Black', 'position' => 0], ['attributeValueId' => 102, 'name' => 'White', 'position' => 1]];
        $rowCount = $hasSize ? ($hasColor ? $sizesPerColor * 2 : 5) : ($hasColor ? 2 : 1);
        $variations = [];
        for ($i = 0; $i < $rowCount; $i++) { $variations[] = ['variationId' => 1001 + $i]; }
        // Match buildRows: incomplete entries must not inflate the reserved table.
        $variations[] = []; $variations[] = ['variationId' => 0];
        $html = $twig->render('matrix', ['mode' => $mode, 'hasSize' => $hasSize, 'hasColor' => $hasColor,
            'variationsWithAttributes' => $variations,
            'sizeAttr' => ['attributeId' => 1, 'values' => $sizes], 'colorAttr' => ['attributeId' => 2, 'values' => $colors],
            'itemData' => ['variation' => ['id' => 1001]]]);
        if (substr_count($html, 'data-eg-matrix-add') !== 1 || substr_count($html, 'data-eg-total-sum') !== 1 ||
            substr_count($html, 'class="eg-size-matrix-table" aria-busy="true"') !== 1 ||
            !str_contains($html, 'role="status" aria-atomic="true" data-eg-matrix-status') ||
            !str_contains($html, '>' . $translations['matrixLoading'] . '</div>') ||
            !str_contains($html, 'data-fallback="' . $translations['matrixFallback'] . '"') ||
            !str_contains($html, 'data-partial="' . $translations['matrixPartial'] . '"') ||
            !str_contains($html, 'data-unavailable="' . $translations['matrixUnavailable'] . '"') ||
            !preg_match('/class="eg-size-matrix-body"><\/div>\s*<\/div>\s*<div class="eg-size-matrix-footer"/', $html) ||
            substr_count($html, 'data-eg-col="ean"') !== 1 || str_contains($html, 'style="display:flex') ||
            !str_contains($html, 'style="--eg-matrix-row-count: ' . $rowCount . '"')) {
            throw new RuntimeException('Unexpected shared matrix markup: ' . $lang . '/' . $mode);
        }
        preg_match('/<div class="eg-size-matrix-head">([\s\S]*?)<div class="eg-size-matrix-body">/', $html, $head);
        preg_match('/<div class="eg-size-matrix-footer">([\s\S]*)<\/div>\s*<\/div>\s*$/', $html, $footer);
        $out[$lang][$mode] = ['html' => $html, 'head' => '<div class="eg-size-matrix-head">' . $head[1],
            'footer' => '<div class="eg-size-matrix-footer">' . $footer[1] . '</div>'];
    }
}
file_put_contents($argv[2], json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo '20 actual Twig matrix render cases PASS, Twig ' . Twig\Environment::VERSION . PHP_EOL;
