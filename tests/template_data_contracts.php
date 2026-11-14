<?php
// Run with the local Twig 2 or 3 autoloader. Uses the real checkout/review templates.
require $argv[1];
error_reporting(E_ALL & ~E_DEPRECATED & ~E_USER_DEPRECATED);
$views = dirname(__DIR__).'/resources/views/';
$templates = [
    'checkout'=>file_get_contents($views.'Checkout/CheckoutView.twig'),
    'feedback'=>file_get_contents($views.'DynamicContent/DynamicFeedbacks.twig'),
    'all-items'=>file_get_contents($views.'Category/Item/Partials/AllItemsLink.twig'),
    'name'=>'{% macro get(name,bundle) %}{{ name }}{% endmacro %}',
    'GuardiansBasicB2B::Category.Macros.render-rating'=>file_get_contents($views.'Category/Macros/render-rating.twig'),
    'layout'=>'{% block PageBody %}{% endblock %}',
    'Ceres::PageDesign.Macros.LayoutContainer'=>'{% macro show(name) %}{% endmacro %}',
];
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates), ['autoescape'=>'html']);
function dataContractLayout($name) { return 'layout'; }
function dataContractComponent($name) { return ''; }
function dataContractTranslation($key) { return $key; }
function dataContractName($data) { return $data['texts']['name1']; }
$twig->addFunction(new Twig\TwigFunction('getPartial', 'dataContractLayout'));
$twig->addFunction(new Twig\TwigFunction('component', 'dataContractComponent'));
$twig->addFunction(new Twig\TwigFunction('trans', 'dataContractTranslation'));
$twig->addFilter(new Twig\TwigFilter('itemName', 'dataContractName'));
$twig->addFilter(new Twig\TwigFilter('filterTabs', 'trim'));
function checkTemplate($condition, $message) {
    if (!$condition) throw new RuntimeException($message);
}
// The list-end target must agree with the existing navigation route, including case.
foreach (['de','en','fr','it','es'] as $language) {
    $menu = file_get_contents($views.'Category/Macros/CategoryTree'.strtoupper($language).'.twig');
    checkTemplate(preg_match("/id: 5618, url: '([^']+)'/", $menu, $entry), 'Missing category 5618 in '.$language);
    foreach (['EUR','USD'] as $currency) {
        $expected = $entry[1].($currency === 'EUR' ? '' : '?currency='.$currency);
        $html = $twig->render('all-items', compact('language','currency'));
        checkTemplate(strpos($html,'href="'.$expected.'"')!==false, 'All-items link differs from '.$language.' menu');
    }
}
$addresses = [];
foreach (['billing', 'delivery'] as $type) {
    foreach (['Require', 'Show'] as $group) {
        foreach (['', '_en'] as $region) {
            $key = $type.'Address'.$group.$region;
            $addresses[$key] = [$key];
        }
    }
}
$twigServices = new class {
    function getAddresses($type) {return [];}
    function getBillingAddressId() {return null;}
    function getDeliveryAddressId() {return null;}
};
$checkout = $twig->render('checkout', ['ceresConfig'=>['addresses'=>$addresses],
    'services'=>['checkout'=>$twigServices, 'customer'=>$twigServices]]);
foreach (['invoice'=>'billing', 'shipping'=>'delivery'] as $tag=>$type) {
    checkTemplate(preg_match('/<'.$tag.'-address-select\s+([^>]+)>/', $checkout, $match), 'Missing '.$tag.' address selector');
    foreach (['required'=>'Require', 'optional'=>'Show'] as $attribute=>$group) {
        checkTemplate(preg_match('/:'.$attribute.'-address-fields="([^"]+)"/', $match[1], $value), 'Missing '.$attribute.' fields');
        $actual = json_decode(html_entity_decode($value[1], ENT_QUOTES), true, 512, JSON_THROW_ON_ERROR);
        checkTemplate($actual === ['de'=>[$type.'Address'.$group], 'gb'=>[$type.'Address'.$group.'_en']], $tag.' '.$attribute.' configuration');
    }
}
$message = "Große Auswahl\n\"Gut\" & </script><script>throw 1</script>\\\nWeiter.";
foreach (['Ada Beispiel'=>'Ada B.', 'Zoë'=>'Zoë'] as $author=>$public) {
    $entry = ['isVisible'=>'true', 'sourceRelation'=>[['sourceRelationLabel'=>$author]], 'title'=>'Test "1"',
        'createdAt'=>'2026-11-14', 'feedbackRating'=>['rating'=>['ratingValue'=>4]],
        'feedbackComment'=>['comment'=>['message'=>$message]]];
    $html = $twig->render('feedback', ['itemData'=>['variation'=>['id'=>15]], 'feedbackItems'=>['entries'=>[$entry,$entry]]]);
    checkTemplate(substr_count($html, '<script')===1, 'Review opens unexpected script element');
    checkTemplate(preg_match('~<script type="application/ld\+json">(.+?)</script>~s', $html, $match), 'Review JSON-LD missing');
    $data = json_decode($match[1], true, 512, JSON_THROW_ON_ERROR);
    $review = $data['review'][0];
    checkTemplate($review['author']['name']===$public && strpos($html,'Beispiel')===false, 'Review author differs from public label');
    checkTemplate($review['reviewBody']===$message && $review['name']===$entry['title'], 'Review fields did not round-trip');
    checkTemplate($data['@id']==='15' && $review['reviewRating']['ratingValue']==='4', 'Structured field types changed');
    $hidden = array_merge($entry, ['isVisible'=>'false', 'title'=>'Private review']);
    checkTemplate(strpos($twig->render('feedback',['feedbackItems'=>['entries'=>[$hidden]]]),'<script')===false, 'Hidden review emitted');
    $mixed = $twig->render('feedback',['feedbackItems'=>['entries'=>[$hidden,$entry,$entry]]]);
    checkTemplate(substr_count($mixed, '<script') === 1 && strpos($mixed, 'Private review') === false, 'First visible review must own the review JSON');
}

$pdp = file_get_contents($views.'Item/SingleItem.twig');
checkTemplate(preg_match('/\{% block schemaOrg %\}(.*?)\{% endblock %\}/s', $pdp, $schema), 'Product schema block missing');
$productSchema = $twig->createTemplate("{% import 'name' as ItemName %}".$schema[1]);
$category = "Sortiment \"A\" </script><script>1</script>";
$item = ['variation'=>['id'=>15], 'texts'=>['name1'=>'A & B "Edition"', 'shortDescription'=>$message],
    'barcodes'=>[['type'=>'CODE_128', 'code'=>'INTERNAL'], ['code'=>'1234567890128'], ['type'=>'GTIN_13', 'code'=>'0123456789012']],
    'prices'=>['default'=>['unitPrice'=>['value'=>4.99], 'baseLot'=>1, 'baseSinglePrice'=>1.25, 'currency'=>'EUR']]];
foreach ([true,false] as $hasPrice) {
    $unitPrice = $hasPrice ? 4.99 : 'N / A';
    $item['prices']['default']['unitPrice']['value'] = $unitPrice;
    $json = $productSchema->render(['itemData'=>$item,'item'=>['documents'=>[['data'=>$item]]],
        'unitPriceValue'=>$unitPrice,'hasUnitPrice'=>$hasPrice,'pricePattern'=>'/^[0-9]+([.][0-9]+)?$/D',
        'defaultCategory'=>['details'=>[['name'=>$category]]]]);
    checkTemplate(stripos($json, '</script') === false, 'Catalog data can close the JSON-LD script');
    $product = json_decode($json, true, 512, JSON_THROW_ON_ERROR);
    checkTemplate($product['name'] === $item['texts']['name1'] && $product['category'] === $category
        && $product['disambiguatingDescription'] === $message, 'Catalog data must round-trip');
    checkTemplate($product['gtin13'] === '0123456789012', 'An internal barcode was published as a GTIN-13');
    checkTemplate($hasPrice ? $product['offers']['price'] === '4.99' : !isset($product['offers']['price']), 'Product schema default price');
    checkTemplate($product['offers']['priceSpecification']['price'] === '1.25', 'Valid base price changed');
}
echo '10 list-end links, 8 checkout field groups, 2 review authors including visibility order, 2 product JSON-LD cases PASS, Twig '.Twig\Environment::VERSION.PHP_EOL;
