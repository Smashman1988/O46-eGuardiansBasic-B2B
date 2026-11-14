<?php
// Render the actual shared Twig matrix with explicit local variant fixtures.
// php tests/variant_matrix.php <Twig autoloader> <output.json>
require $argv[1];
$source = file_get_contents(__DIR__ . '/../resources/views/Item/SingleItem.twig');
$start = strpos($source, '    <div class="eg-size-matrix"');
$addButton = strpos($source, 'data-eg-matrix-add>', $start);
if ($addButton === false) { throw new RuntimeException('Matrix basket button missing'); }
$end = strpos($source, '</button>', $addButton);
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
        $context = ['mode' => $mode, 'hasSize' => $hasSize, 'hasColor' => $hasColor,
            'variationsWithAttributes' => $variations,
            'sizeAttr' => ['attributeId' => 1, 'values' => $sizes], 'colorAttr' => ['attributeId' => 2, 'values' => $colors],
            'itemData' => ['variation' => ['id' => 1001]]];
        $html = $twig->render('matrix', $context);
        if (substr_count($html, 'data-eg-matrix-add') !== 1 || substr_count($html, 'data-eg-total-sum') !== 1 ||
            substr_count($html, 'class="eg-size-matrix-table" aria-busy="true"') !== 1 ||
            substr_count($html, 'role="status" aria-atomic="true" data-eg-matrix-status') !== 1 ||
            !preg_match('/<div[^>]*\bdata-eg-matrix-status\b[^>]*><\/div>/', $html) ||
            str_contains($html, 'data-fallback=') ||
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
    // One row needs text measurement. The other uses a short size and an image.
    $context['sizeAttr']['values'] = [['id'=>1,'name'=>'One size'], ['id'=>2,'name'=>'M']];
    $context['colorAttr']['values'] = [['id'=>101,'name'=>'Bleu marine & blanc'], ['id'=>102,'name'=>'Blue','imageUrl'=>'/blue.jpg']];
    $context['variationsWithAttributes'] = [
        ['variationId'=>1,'attributes'=>[['attributeId'=>1,'attributeValueId'=>1], ['attributeId'=>2,'attributeValueId'=>101]]],
        ['variationId'=>2,'attributes'=>[['attributeId'=>1,'attributeValueId'=>2], ['attributeId'=>2,'attributeValueId'=>102]]],
        ['variationId'=>0,'attributes'=>[['attributeId'=>2,'attributeValueId'=>101]]]
    ];
    $doc = new DOMDocument();
    $doc->loadHTML('<meta charset="UTF-8">'.$twig->render('matrix', $context), LIBXML_NOERROR | LIBXML_NOWARNING);
    $xpath = new DOMXPath($doc);
    $footer = '//div[@class="eg-size-matrix-footer"]';
    $toggle = $footer.'/div[@class="eg-matrix-totals"]/div[@class="eg-matrix-error-slot"]/button[@data-eg-matrix-error-toggle and @type="button" and @hidden and @aria-expanded="false"]';
    $status = $footer.'/div[@role="status" and @data-eg-matrix-status and @aria-atomic="true"]';
    if ($xpath->query($toggle)->length !== 1 || $xpath->query($status)->length !== 1 ||
        $xpath->query($status.'/following-sibling::button[@data-eg-matrix-add]')->length !== 1 ||
        $xpath->evaluate('string('.$toggle.'/@aria-label)') !== $translations['matrixMissing'] ||
        $xpath->evaluate('string('.$toggle.'/@title)') !== $translations['matrixMissing']) {
        throw new RuntimeException('Missing localized error disclosure or relocated status: '.$lang);
    }
    $body = '//div[@class="eg-size-matrix-body"]';
    $measure = $body.'/div[contains(concat(" ", normalize-space(@class), " "), " eg-matrix-measure ") and contains(concat(" ", normalize-space(@class), " "), " col-12 ") and @aria-hidden="true"]';
    if ($xpath->query($body.'/*')->length !== 2 || $xpath->query($measure)->length !== 1 ||
        $xpath->evaluate('string('.$measure.'/div[@data-eg-col="size"])') !== 'One size' ||
        $xpath->evaluate('string('.$measure.'/div[@data-eg-col="color"])') !== 'Bleu marine & blanc' ||
        $xpath->query($body.'/div[@class="eg-matrix-base-rows" and @aria-hidden="true" and @style="--eg-matrix-row-count: 1"]')->length !== 1 ||
        $xpath->query($body.'//*[self::button or self::a or self::input or self::img or @tabindex or @data-eg-variation-id]')->length !== 0) {
        throw new RuntimeException('Unexpected long-label measurement content: '.$lang);
    }
}
file_put_contents($argv[2], json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
echo '20 matrix renders and 5 long-label measurement cases PASS, Twig ' . Twig\Environment::VERSION . PHP_EOL;
