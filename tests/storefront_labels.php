<?php
// Resolve the actual labels used by the PDP, recommendation partial and age filter.
$root = dirname(__DIR__);
$template = file_get_contents($root . '/resources/views/Item/SingleItem.twig');
$pattern = '~\{\{\s*trans\(["\']GuardiansBasicB2B::Template\.([\w]+)["\']\)\s*\}\}\s*<div><span[^>]*>\{\{\s*itemData\.item\.manufacturer\.name\s*\}\}~';
if (!preg_match($pattern, $template, $match)) {
    throw new RuntimeException('Manufacturer heading missing before the name');
}
$recommendations = file_get_contents($root . '/resources/views/Item/Partials/CrossSelling.twig');
if (!preg_match('~<h3[^>]*>\s*\{\{\s*trans\("GuardiansBasicB2B::Template\.([\w.]+)"\)~', $recommendations, $heading)) {
    throw new RuntimeException('Recommendation heading missing');
}
$adviser = file_get_contents($root . '/resources/views/StaticPages/Ballberater.twig');
preg_match_all('~trans\("GuardiansBasicB2B::Config\.([a-g]_jugend)"\)~', $adviser, $ages);
if (count(array_unique($ages[1])) !== 7) { throw new RuntimeException('Expected seven youth age groups'); }
foreach (['de', 'en', 'fr', 'it', 'es'] as $language) {
    foreach (['Template' => [$match[1], $heading[1]], 'Config' => $ages[1]] as $catalog => $keys) {
        $file = $root . '/resources/lang/' . $language . '/' . $catalog . '.properties';
        $text = str_replace("\r\n", "\n", file_get_contents($file));
        foreach ($keys as $key) {
            $value = $catalog === 'Config' ? '[^\r\n]+\(U\d+\)' : '\S[^\r\n]*';
            if (preg_match_all('/^' . preg_quote($key, '/') . '[ \t]*=[ \t]*' . $value . '[ \t]*$/m', $text) !== 1) {
                throw new RuntimeException("Missing, malformed or duplicate label $language/$key");
            }
        }
    }
}
echo "45 storefront label lookups passed.\n";
