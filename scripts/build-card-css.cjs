// Keep the shared product-card separators identical in source, active CSS and
// all three existing critical-CSS branches. Other CSS remains byte-for-byte.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const start = '/* B2B card separators */';
const end = '/* End B2B card separators */';

function cardCss() {
    const source = fs.readFileSync('resources/css/main.css', 'utf8');
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

function syncHead(head) {
    let blocks = 0;
    const region = cardCss();
    const output = head.replace(/<style>(@font-face[\s\S]*?)<\/style>/g, (_, css) => {
        blocks++;
        return '<style>' + syncRegion(css, region) + '</style>';
    });
    assert.equal(blocks, 3, 'All three existing critical-CSS branches');
    return output;
}

function build(check = false) {
    const cssFile = 'resources/css/main-211025.min.css';
    const headFile = 'resources/views/PageDesign/Partials/Head.twig';
    const originalCss = fs.readFileSync(cssFile, 'utf8');
    const originalHead = fs.readFileSync(headFile, 'utf8');
    const css = syncRegion(originalCss, cardCss()), head = syncHead(originalHead);
    postcss.parse(css);
    if (check) {
        assert.equal(css, originalCss, 'Build card CSS before committing');
        assert.equal(head, originalHead, 'Build critical card CSS before committing');
    } else {
        fs.writeFileSync(cssFile, css);
        fs.writeFileSync(headFile, head);
    }
    return {status: 'PASS', check, regionBytes: Buffer.byteLength(cardCss()), criticalBranches: 3};
}

if (require.main === module) console.log(JSON.stringify(build(process.argv.includes('--check'))));
module.exports = {cardCss, syncHead, build};
