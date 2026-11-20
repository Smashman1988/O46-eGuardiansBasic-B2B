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
// Project the approved card layout changes on historical expected markup only.
// Preserve link targets, live images, text, prices, badges, control attributes and order.
function projectHistoricalCardLayout($dom) {
    $xpath = new DOMXPath($dom);
    foreach ($xpath->query('//picture') as $picture) {
        $image = $xpath->query('.//img', $picture)->item(0);
        if (!$image || trim($image->getAttribute('src').$image->getAttribute('data-src')) !== '') continue;
        $invalid = false;
        foreach ($xpath->query('.//source', $picture) as $source) {
            $url = $source->getAttribute('srcset').$source->getAttribute('data-srcset');
            if ($url === '.avif') $invalid = true;
            elseif ($url !== '') continue 2;
        }
        if ($invalid) $picture->parentNode->removeChild($picture);
    }
    foreach ($xpath->query('//*[@data-eg-item]') as $card) {
        $header = $xpath->query('./div[contains(@class,"cat-article-header-info")]', $card)->item(0);
        $body = $xpath->query('./div[contains(@class,"cat-item-image")]', $card)->item(0);
        if (!$header || !$body) continue;
        $badges = $dom->createElement('span');
        $badges->setAttribute('class','cat-badges');
        foreach ($xpath->query('.//span[contains(@class,"i-action-")]', $header) as $badge) $badges->appendChild($badge);
        if ($badges->hasChildNodes()) $body->appendChild($badges);
        foreach ($xpath->query('.//img[contains(@class,"cat-logo")]', $header) as $logo) $body->appendChild($logo);
        foreach ($xpath->query('.//span[@class="item-action2"]', $header) as $rating) $body->appendChild($rating);
        if (trim(str_replace("\xc2\xa0",'',$header->textContent)) !== '' || $xpath->query('.//a|.//button|.//img',$header)->length)
            throw new RuntimeException('Unexpected content in historical card header');
        $card->removeChild($header);
        $footer = $xpath->query('./div[contains(@class,"cat-item-data")]', $card)->item(0);
        if (!$footer) continue;
        $footer->setAttribute('class',str_replace(' ptpb','',$footer->getAttribute('class')));
        foreach ($xpath->query('./hr[@class="m-0"]',$footer) as $hr) $footer->removeChild($hr);
        foreach ($xpath->query('./div[@class="tcenter" or @class="tcenter cat-item-sizes"]',$footer) as $sizes) $sizes->setAttribute('class','cat-item-sizes');
        foreach ($xpath->query('.//div[@class="no-cat-at"]',$footer) as $wrapper) {
            while ($wrapper->firstChild) $wrapper->parentNode->insertBefore($wrapper->firstChild,$wrapper);
            $wrapper->parentNode->removeChild($wrapper);
        }
        foreach ($xpath->query('./div[@class="col-12 paddinlr"]',$footer) as $prices) $prices->setAttribute('class','cat-card-price');
    }
}
// Responsive candidates are asserted by card_image_loading.php for each index,
// viewport, page and image state. Keep the original fallback in full DOM comparisons.
function withoutCardResponsiveSources($html) {
    $html = preg_replace('/<source\b[^>]*\bmedia="\(min-width: (?:768|1200)px\)"[^>]*>/', '', $html);
    return preg_replace('/(<img\b[^>]*?)\sloading="lazy"/', '$1', $html);
}
function cardProjectedHtml($html) {
    $dom = cardMarkupDocument($html);
    projectHistoricalCardLayout($dom);
    $out = '';
    foreach ($dom->getElementById('card-contract-root')->childNodes as $child) $out .= $dom->saveHTML($child);
    return $out;
}
function cardHelperContract($before, $after, $key) {
    // The logo path is now resolved once for a shared base or for an actual vendor image.
    if (($after[$key] ?? 0) > ($before[$key] ?? 0)) return false;
    unset($before[$key], $after[$key]);
    return $before === $after;
}
function cardMarkupContract($html, $oldMarkup = false) {
    $dom = cardMarkupDocument($html);
    $xpath = new \DOMXPath($dom);
    if ($oldMarkup) projectHistoricalCardLayout($dom);
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
