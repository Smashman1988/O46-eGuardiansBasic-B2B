<?php
// Render the application's own Twig with storefront services replaced by deterministic inputs.
require $argv[1];
$root = dirname(__DIR__, 2);
$templates = [];
$views = $root.'/resources/views/';
foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($views)) as $file) {
    if ($file->getExtension() !== 'twig') continue;
    $name = 'GuardiansBasicB2B::'.str_replace(['/', '\\'], '.', substr($file->getPathname(), strlen($views), -5));
    $templates[$name] = $templates[$name.'.twig'] = file_get_contents($file->getPathname());
}
$twig = new Twig\Environment(new Twig\Loader\ArrayLoader($templates));
$service = new class {
    function getLanguage() { return 'de'; }
    function getCurrencyData() { return ['name'=>'EUR','symbol'=>'€']; }
    function shouldBeCached() { return true; }
    function getURLById($id) { return '/category-'.$id.'/'; }
    function get($id, $lang) { return ['id'=>$id,'details'=>[['name'=>'Information '.$id]]]; }
    function getURL($category) { return '/category-'.$category['id'].'/'; }
};
$labels = parse_ini_file($root.'/resources/lang/de/Template.properties', false, INI_SCANNER_RAW);
$twig->addFunction(new Twig\TwigFunction('trans', fn($key) => $labels[substr(strrchr($key,'.'),1)] ?? $key));
$twig->addFunction(new Twig\TwigFunction('plugin_path', fn($name) => '/plugin/'.$name));
$twig->addFunction(new Twig\TwigFunction('config', fn($key) => ''));
$twig->addFilter(new Twig\TwigFilter('itemName', fn($item) => 'Laufschuh'));
$context = ['services'=>array_fill_keys(['localizationRepository','checkout','template','category'], $service),
    'lang'=>'de','pdpBasketForHeader'=>[],'vuejs'=>[],'category'=>['id'=>1],'newsletterUrl'=>'/newsletter/','consentRequired'=>false];
$twig->addGlobal('services', $context['services']);
function fragment($source, $start, $end) {
    $a=strpos($source,$start);
    $b=$a===false ? false : strpos($source,$end,$a+strlen($start));
    if ($a===false || $b===false) throw new RuntimeException('Theme fragment changed: '.$start);
    return substr($source,$a,$b-$a);
}
$result=[];
foreach (['header'=>'PageDesign.Partials.Header.Header','footer'=>'PageDesign.Partials.Footer','contact'=>'PageDesign.Components.ContactWidget','newsletter'=>'PageDesign.Components.NewsletterPopup'] as $key=>$name)
    $result[$key]=$twig->render('GuardiansBasicB2B::'.$name,$context);
$category=$templates['GuardiansBasicB2B::Category.Item.CategoryItemContent'];
$result['controls']=$twig->createTemplate(fragment($category,'<div class="row d-lg-none">','{% include'))->render($context);
$layout=$templates['GuardiansBasicB2B::PageDesign.PageDesign'];
// Include the complete nested modal body up to the matching closing div.
function divSource($source, $opening) {
    $start = strpos($source, $opening);
    if ($start === false) throw new RuntimeException($opening);
    $offset = $start;
    $depth = 0;
    do {
        if (!preg_match('~</?div\b[^>]*>~i', $source, $tag, PREG_OFFSET_CAPTURE, $offset)) {
            throw new RuntimeException('Unbalanced div in '.$opening);
        }
        [$text, $position] = $tag[0];
        $depth += str_starts_with($text, '</') ? -1 : 1;
        $offset = $position + strlen($text);
    } while ($depth > 0);
    return substr($source, $start, $offset-$start);
}
foreach (['modal-cross','dynamicModal'] as $dialog) {
    $source = divSource($layout, '<div class="modal fade '.$dialog.'"');
    $result[$dialog] = $twig->createTemplate($source)->render($context);
}
preg_match('~<div class="eg-backdrop transition"[^>]+></div>~',$layout,$match);
$result['backdrop']=$match[0];
$pdp=$templates['GuardiansBasicB2B::Item.SingleItem'];
$gallery=fragment($pdp,'<div class="col-12 col-xl-6 pull-lg-left stickyarticle','{% endif %}' . "\n" . '           {% if isQuickView');
$images=[];
foreach (['blue','green','red'] as $color) {
    $url='/image/'.$color.'.svg';
    $images[]=array_fill_keys(['url','urlMiddle','urlSecondPreview','urlPreview'],$url);
}
$result['gallery']=$twig->createTemplate($gallery)->render(['sortedItemImages'=>$images,'mainImg'=>$images[0],'galleryCount'=>count($images),'itemData'=>[]]);
$matrix = divSource($pdp, '<div class="eg-size-matrix"');
$colors = [['id'=>1,'name'=>'Grün','imageUrl'=>'/image/green.svg'],['id'=>2,'name'=>'Rot','imageUrl'=>'/image/red.svg']];
$result['variations'] = array_map(fn($c) => ['variationId'=>100+$c['id'],'attributes'=>[['attributeId'=>9,'attributeValueId'=>$c['id']]]], $colors);
$result['matrix'] = $twig->createTemplate($matrix)->render(['mode'=>'color','hasColor'=>true,'colorAttr'=>['attributeId'=>9,'values'=>$colors], 'variationsWithAttributes'=>$result['variations']]);
echo json_encode($result,JSON_THROW_ON_ERROR);

