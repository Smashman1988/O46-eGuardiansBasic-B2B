<?php
// Render the actual trailing item tracking block with both supported Twig engines.
require $argv[1];
$source = file_get_contents(__DIR__ . '/../resources/views/Item/SingleItem.twig');
$start = strrpos($source, '{% if isQuickView %}');
$end = strpos($source, '{% endblock %}', $start);
if ($start === false || $end === false) { throw new RuntimeException('Tracking block missing'); }
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader(['tracking' => substr($source, $start, $end - $start)]));
$out = [];
foreach ([true, false] as $fullPage) {
    $html = $twig->render('tracking', ['isQuickView' => $fullPage, 'itemData' => ['item' => ['id' => 2350256]]]);
    if ((strpos($html, 'dataLayer') !== false) !== $fullPage) { throw new RuntimeException('Tracking must be scoped to full PDP'); }
    $out[$fullPage ? 'pdp' : 'quickview'] = $html;
}
file_put_contents($argv[2], json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
echo "PDP tracking retained; Quickview registers no tracking listener\n";
