<?php
// Expected structural delta for the shared card: two decorative rules move to
// CSS borders and the absolutely positioned, invisible rating placeholder goes.
// All content, element attributes, URLs and remaining element order are compared.
function cardMarkupDocument($html) {
    $dom = new \DOMDocument('1.0', 'UTF-8');
    $dom->loadHTML('<?xml encoding="UTF-8"><main id="card-contract-root">'.$html.'</main>', LIBXML_NOERROR | LIBXML_NOWARNING);
    return $dom;
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
