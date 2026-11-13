// Keep the shared product-card separators identical in source, active CSS and
// all three existing critical-CSS branches. The full CSS builder owns external assets.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const start = '/* B2B card separators */';
const end = '/* End B2B card separators */';

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
