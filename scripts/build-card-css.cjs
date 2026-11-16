// Keep the shared product-card separators identical in source, active CSS and
// all three existing critical-CSS branches. The full CSS builder owns external assets.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const start = '/* B2B card separators */';
const end = '/* End B2B card separators */';
const baseStart = '/* B2B card base */';
const baseEnd = '/* End B2B card base */';

// The PDP critical branch previously had no listing geometry. Cross-selling
// uses the same cards, so derive its missing base rules from the owning CSS.
function cardBaseCss(source) {
    const selectors = new Set(['.cat-item', '.cat-item a', '.cat-item .cat-item-image',
        '.cat-item .cat-item-image img', 'a.thumb-title.cat-item-name', '.cat-item .cat-item-data',
        '.category-product-list article', '.cat-item .cat-rrp-price', '.cat-attr-sizes', '.cat-item-shoe',
        '.availsize', '.sizebox', '.font-12', '.font-18', '.bold', '.outlet-green', '.linkabso', '.idwk-80',
        '.item-action', '.item-action2', '.item-action.i-action-sale', '.i-action-nachhaltig-cat',
        '.item-ratings-first', '.item-ratings-head', '.rating-fuller', '.rating-fuller-inner',
        '.item-ratings-head > .rating-grey', '.item-ratings-first .rating-fuller-inner',
        '.item-ratings-first.item-ratings-head > .rating-grey', '.f-size12']);
    const root = postcss.parse(source);
    function select(container) {
        const output = container.clone({nodes: []});
        for (const node of container.nodes) {
            if (node.type === 'rule') {
                const selected = node.selectors.filter(selector => selectors.has(selector));
                if (selected.length) output.append(node.clone({selector: selected.join(',')}));
            } else if (node.type === 'atrule' && node.name === 'media') {
                const children = select(node);
                if (children.nodes.length) output.append(children);
            }
        }
        return output;
    }
    const selected = select(root);
    selected.walkComments(node => node.remove());
    selected.walk(node => { node.raws.before = ''; node.raws.after = ''; node.raws.between = node.type === 'decl' ? ':' : ''; });
    selected.raws.after = '';
    return baseStart + selected.toString().trim() + baseEnd;
}

function cardCss(source = fs.readFileSync('resources/css/main.css', 'utf8')) {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from >= 0 && to > from, 'One owned card separator source region');
    const root = postcss.parse(source.slice(from + start.length, to));
    root.walkComments(node => node.remove());
    root.walk(node => {
        node.raws.before = ''; node.raws.after = '';
        node.raws.between = node.type === 'decl' ? ':' : '';
    });
    root.raws.after = '';
    return start + root.toString().trim() + end;
}

function syncRegion(css, region) {
    const from = css.indexOf(start), to = from < 0 ? -1 : css.indexOf(end, from);
    assert.ok(from < 0 || to > from, 'Existing card region has a closing marker');
    return from < 0 ? css + region : css.slice(0, from) + region + css.slice(to + end.length);
}

function syncHead(head, source) {
    let blocks = 0;
    const region = cardCss(source);
    const output = head.replace(/<style>(@font-face[\s\S]*?)<\/style>/g, (_, css) => {
        blocks++;
        // These selectors belonged to the removed header/one-size wrappers;
        // the logo now has its complete scoped overlay rule in cardCss().
        const obsolete = new Set(['.cat-article-header-info', '.cat-logo', '.no-cat-at']);
        const expressions = [];
        const parseable = css.replace(/\{\{[\s\S]*?\}\}/g, expression => {
            expressions.push(expression);
            return 'O46_CARD_TWIG_' + (expressions.length - 1);
        });
        const existing = postcss.parse(parseable);
        existing.walkRules(rule => {
            const kept = rule.selectors.filter(selector => !obsolete.has(selector));
            if (!kept.length) rule.remove();
            else if (kept.length !== rule.selectors.length) rule.selector = kept.join(',');
        });
        css = existing.toString().replace(/O46_CARD_TWIG_(\d+)/g, (_, index) => expressions[Number(index)]);
        if (blocks === 1) {
            const from = css.indexOf(baseStart), to = css.indexOf(baseEnd, from);
            assert.ok(from < 0 || to > from, 'Existing card base has a closing marker');
            if (from >= 0) css = css.slice(0, from) + css.slice(to + baseEnd.length);
            // Insert before the owned overrides, preserving cascade order.
            const cardStart = css.indexOf(start);
            css = cardStart < 0 ? css + cardBaseCss(source) : css.slice(0, cardStart) + cardBaseCss(source) + css.slice(cardStart);
        }
        return '<style>' + syncRegion(css, region) + '</style>';
    });
    assert.equal(blocks, 3, 'All three existing critical-CSS branches');
    return output;
}

function build(check = false) {
    return require('./build-css.cjs').build({check});
}

module.exports = {cardCss, syncHead, build};
if (require.main === module) console.log(JSON.stringify(build(process.argv.includes('--check'))));
