<?php
// Render the production heart, matrix, picker and dialog shells with local IO data.
require $argv[1];
$in = json_decode(stream_get_contents(STDIN), true, 512, JSON_THROW_ON_ERROR);
$root = dirname(__DIR__);
$lang = $in['lang'];
$labels = parse_ini_file("$root/resources/lang/$lang/Template.properties", false, INI_SCANNER_RAW);
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader([]));
$twig->addFunction(new Twig\TwigFunction('trans', fn($k) => $labels[substr(strrchr($k, '.'), 1)] ?? $k));
$item = $in['pdp'];
$section = function ($source, $start, $end) {
    $a = strpos($source, $start);
    $b = $a === false ? false : strpos($source, $end, $a + strlen($start));
    if ($a === false || $b === false) throw new RuntimeException("Missing Twig fragment $start");
    return substr($source, $a, $b - $a);
};
$heart = $section($item, '<span class="wishlist-info1">', '<a {% if galleryCount');
$matrix = $section($item, '<div data-item-variation class="row"', '                {% if isQuickView %}');
$context = [
    'variationId'=>$in['base'], 'itemData'=>['variation'=>['id'=>$in['base']]],
    'variationsWithAttributes'=>$in['rows'], 'attributes'=>$in['attributes'],
    'basketItems'=>['itemWishListIds'=>$in['saved']], 'pdpQuickview'=>false, 'lang'=>$lang
];
$names = [];
foreach ($in['attributes'] as $a) $names[$a['attributeId']] = [
    'name'=>$a['name'], 'values'=>array_column($a['values'], 'name', 'attributeValueId')
];
$context['itemAttributes'] = ['attributes'=>$names, 'units'=>$in['units']];
$prepare = $section($item, '{% set isInWishList', '{% set itemPrices');
$render = fn($s) => $twig->createTemplate($s)->render($context);
$picker = $in['baseline'] ? '' : file_get_contents("$root/resources/views/Item/Partials/WishListPicker.twig");
$dynamic = $section($in['layout'], $in['baseline'] ? '<div class="modal fade dynamicModal"' : '<div class="modal dynamicModal"', '<div data-eg-basket-preview');
$shells = '';
if ($in['dialogShells']) {
    $login = $section($in['layout'], '<div id="login-modal-wrapper">', '{% endif %}');
    $quickview = $section($in['layout'], '<div class="modal fade modal-cross"', '{# The brands directory');
    $shells = $render($login.$quickview);
}
echo json_encode([
    'heart'=>$render($prepare.$heart), 'matrix'=>$render($matrix), 'picker'=>$render($prepare.$picker),
    'dynamic'=>$render($dynamic), 'shop'=>$render(file_get_contents("$root/resources/views/PageDesign/Components/b2babfrage".strtoupper($lang).'.twig')),
    'shells'=>$shells, 'added'=>$labels['wishlistplus'], 'removed'=>$labels['wishlistminus']
], JSON_THROW_ON_ERROR);
