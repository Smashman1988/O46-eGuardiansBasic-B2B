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
        for ($i = 1; $i <= 12; $i++) { $sizes[] = ['attributeValueId' => $i, 'name' => (string) (35 + $i), 'position' => $i]; }
        $colors = [['attributeValueId' => 101, 'name' => 'Black', 'position' => 0], ['attributeValueId' => 102, 'name' => 'White', 'position' => 1]];
        $html = $twig->render('matrix', ['mode' => $mode, 'hasSize' => $hasSize, 'hasColor' => $hasColor,
            'sizeAttr' => ['attributeId' => 1, 'values' => $sizes], 'colorAttr' => ['attributeId' => 2, 'values' => $colors],
            'itemData' => ['variation' => ['id' => 1001]]]);
        if (substr_count($html, 'data-eg-matrix-add') !== 1 || substr_count($html, 'data-eg-total-sum') !== 1 ||
            substr_count($html, 'data-eg-col="ean"') !== 1 || str_contains($html, 'style="display:flex')) {
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
