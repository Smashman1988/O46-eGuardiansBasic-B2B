<?php

namespace GuardiansBasicB2B\Helper;

/** Data for one page render only; never persisted or shared between requests. */
class SeoPage
{
    public $shopBuilderHtml = null;
    private $query;
    private $template;
    private $categoryPagination;
    private $lists = [];

    public function __construct(array $query, $template, $pageMax = null, $currentPage = null, $total = null)
    {
        $this->query = $query;
        $this->template = $template;
        $this->categoryPagination = ['pageMax' => $pageMax, 'currentPage' => $currentPage, 'total' => $total];
    }

    public static function positiveInteger($value)
    {
        if (!is_int($value) && !is_string($value)) {
            return null;
        }
        if (!preg_match('/^[1-9][0-9]*$/D', (string)$value)) {
            return null;
        }
        $integer = filter_var($value, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        return $integer === false ? null : $integer;
    }

    private function nonNegativeInteger($value)
    {
        if ($value === 0 || $value === 0.0 || $value === '0') {
            return 0;
        }
        // Ceres supplies pageMax through ceil(), i.e. as an integral float.
        // Bounds reject NaN and both infinities before floor() or an int cast.
        if (is_float($value) && $value > 0 && $value < PHP_INT_MAX && floor($value) === $value) {
            $value = (int)$value;
        }
        return self::positiveInteger($value);
    }

    public function addList($currentPage, $pageMax, $total, $documentCount = null)
    {
        $this->lists[] = ['currentPage' => $currentPage, 'pageMax' => $pageMax, 'total' => $total, 'documentCount' => $documentCount];
    }

    public function disableCategoryPagination()
    {
        $this->categoryPagination = null;
    }

    public function getPagination(): array
    {
        $hasPage = array_key_exists('page', $this->query);
        $requestedPage = $hasPage ? self::positiveInteger($this->query['page']) : 1;
        $invalidInput = $hasPage && $requestedPage === null;
        $hasList = $this->template === 'tpl.category.item' && $this->categoryPagination !== null;
        $pagination = $hasList ? $this->categoryPagination : [];
        $ambiguous = false;
        if ($this->template === 'tpl.category.content') {
            $hasList = count($this->lists) > 0;
            $ambiguous = count($this->lists) > 1;
            // Only a single full paginated list is an unambiguous main list.
            $pagination = count($this->lists) === 1 ? $this->lists[0] : [];
        }
        $pageMax = $this->nonNegativeInteger($pagination['pageMax'] ?? null);
        $total = $this->nonNegativeInteger($pagination['total'] ?? null);
        $effectivePage = self::positiveInteger($pagination['currentPage'] ?? null);
        $outOfRange = $hasList && $pageMax !== null && $requestedPage !== null
            && $requestedPage > 1 && $requestedPage > $pageMax;
        $documentCount = $pagination['documentCount'] ?? null;
        $empty = $hasList && ($documentCount ?? 0) === 0 && ($total === 0 || $pageMax === 0);
        $valid = $hasList && !$ambiguous && !$invalidInput && !$empty && $pageMax !== null
            && $requestedPage <= $pageMax && $effectivePage === $requestedPage
            && ($requestedPage === 1 || $documentCount !== 0);
        // An empty category is still a real landing page. Keep its first page
        // eligible for the configured robots directives; empty price searches
        // and unproven follow-up pages retain their existing restrictions.
        $emptyFirstCategory = $empty && $this->template === 'tpl.category.item' && $requestedPage === 1
            && !array_key_exists('priceMin', $this->query) && !array_key_exists('priceMax', $this->query);

        return [
            'requestedPage' => $requestedPage,
            'currentPage' => $valid ? $effectivePage : 1,
            'pageMax' => $pageMax,
            'hasList' => $hasList,
            'ambiguous' => $ambiguous,
            'invalidInput' => $invalidInput,
            'outOfRange' => $outOfRange,
            'empty' => $empty,
            'valid' => $valid,
            // Unknown bounds are not an invented one-page list. Unproven follow-up
            // URLs still get a base canonical and noindex as a conservative fallback.
            'noindex' => $invalidInput || ($empty && !$emptyFirstCategory) || ($hasPage && $requestedPage > 1 && !$valid)
        ];
    }

    private function parseRobotsDirectives($value): array
    {
        $tokens = [];
        foreach (explode(',', strtoupper(trim((string)$value))) as $directive) {
            // Preserve directive values (e.g. max-snippet or unavailable_after).
            if (strpos($directive, ':') !== false) {
                $tokens[] = trim($directive);
            } else {
                $tokens = array_merge($tokens, preg_split('/[\s_]+/', trim($directive), -1, PREG_SPLIT_NO_EMPTY));
            }
        }
        if (in_array('NONE', $tokens, true)) {
            $tokens = array_merge($tokens, ['NOINDEX', 'NOFOLLOW']);
        }
        return array_values(array_diff($tokens, ['ALL', 'NONE']));
    }

    public function getRobots($blockRobots, $categoryRobots, $forceNoIndex): string
    {
        $block = $this->parseRobotsDirectives($blockRobots);
        $category = $this->parseRobotsDirectives($categoryRobots);
        $restrictions = array_merge($block, $category);
        $robots = array_values(array_unique($restrictions));
        $noindex = $forceNoIndex || in_array('NOINDEX', $restrictions, true) || $this->getPagination()['noindex'];
        $nofollow = in_array('NOFOLLOW', $restrictions, true);
        foreach (array_keys($this->query) as $key) {
            if (in_array(strtolower($key), ['query', 'currency', 'quickviewitem', 'facets', 'sorting'], true)) {
                $noindex = true;
            }
        }
        if (strpos($this->template, 'tpl.search') === 0 || $this->template === 'tpl.page-not-found') {
            $noindex = true;
        }
        $robots = array_values(array_diff($robots, ['INDEX', 'NOINDEX', 'FOLLOW', 'NOFOLLOW']));
        return implode(',', array_merge([$noindex ? 'NOINDEX' : 'INDEX', $nofollow ? 'NOFOLLOW' : 'FOLLOW'], $robots));
    }
}
