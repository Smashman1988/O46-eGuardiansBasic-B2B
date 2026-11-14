<?php
// Expected structural delta for the shared card: two decorative rules move to
// CSS borders and the absolutely positioned, invisible rating placeholder goes.
// All content, element attributes, URLs and remaining element order are compared.
function cardMarkupDocument($html) {
    $dom = new \DOMDocument('1.0', 'UTF-8');
    $dom->loadHTML('<?xml encoding="UTF-8"><main id="card-contract-root">'.$html.'</main>', LIBXML_NOERROR | LIBXML_NOWARNING);
    return $dom;
}
// The original fixture includes items with an absent numeric RRP, even when
// their formatted RRP or external percent is still populated. Only these IDs
// may lose the old sale badge, 'statt' label/price and has-rrp class.
function withoutInvalidCardComparisons($html, array $ids) {
    $chunks = preg_split('/(?=<div class="cat-item has-rrp has-variations" data-eg-item=")/', $html);
    foreach ($chunks as &$chunk) {
        if (!preg_match('/^<div class="cat-item has-rrp has-variations" data-eg-item="([0-9]+)"/', $chunk, $id) || !in_array((int)$id[1], $ids, true)) continue;
        $chunk = preg_replace('/^<div class="cat-item has-rrp has-variations"/','<div class="cat-item has-variations"',$chunk);
        $chunk = preg_replace('~<span class="item-action i-action-sale">\s*(?:[+-]?[0-9.,]+)?%\s*</span>~s','',$chunk,1,$badges);
        $chunk = preg_replace('~<span class="bold font-12">[^<]*<span class="cat-rrp-price">[^<]*</span></span>\s*~s','',$chunk,1,$labels);
        if ($badges !== 1 || $labels !== 1) throw new RuntimeException('Missing original comparison for fixture item '.$id[1]);
    }
    return implode('', $chunks);
}
function cardMarkupContract($html, $oldMarkup = false) {
    $dom = cardMarkupDocument($html);
    $xpath = new \DOMXPath($dom);
    if ($oldMarkup) {
        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " cat-item-data ")]/hr[@class="m-0"]') as $rule) $rule->parentNode->removeChild($rule);
        foreach ($xpath->query('//span[@class="item-action2 invisible"]') as $placeholder) {
            if (trim(str_replace("\xc2\xa0", '', $placeholder->textContent)) !== '') throw new \RuntimeException('Rating placeholder unexpectedly contains content');
            $placeholder->parentNode->removeChild($placeholder);
        }
        foreach ($xpath->query('//*[contains(concat(" ", normalize-space(@class), " "), " cat-item-data ")]/div[@class="tcenter"]') as $sizes) $sizes->setAttribute('class', 'tcenter cat-item-sizes');
    }
    $visit = function ($node) use (&$visit) {
        if ($node instanceof \DOMText) {
            $text = trim(preg_replace('/\s+/u', ' ', $node->textContent));
            return $text === '' ? null : ['text', $text];
        }
        if (!($node instanceof \DOMElement)) return null;
        $attributes = [];
        foreach ($node->attributes as $attribute) $attributes[$attribute->name] = $attribute->value;
        ksort($attributes);
        $children = [];
        foreach ($node->childNodes as $child) { $value = $visit($child); if ($value !== null) $children[] = $value; }
        return [$node->tagName, $attributes, $children];
    };
    return $visit($dom->getElementById('card-contract-root'));
}
function cardMarkupCounts($html) {
    $dom = cardMarkupDocument($html); $root = $dom->getElementById('card-contract-root');
    $counts = ['bytes'=>strlen($html), 'elements'=>0, 'textNodes'=>0, 'whitespaceTextNodes'=>0];
    $visit = function ($node) use (&$visit, &$counts) {
        foreach ($node->childNodes as $child) {
            if ($child instanceof \DOMElement) $counts['elements']++;
            if ($child instanceof \DOMText) { $counts['textNodes']++; if (trim($child->textContent) === '') $counts['whitespaceTextNodes']++; }
            $visit($child);
        }
    };
    $visit($root);
    return $counts;
}
