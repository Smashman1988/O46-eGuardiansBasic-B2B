// Only the new facet controller and its scoped accessibility rules are built here.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {minify} = require('terser');
const postcss = require('postcss');
(async () => {
    const result = await minify(fs.readFileSync('resources/js/facets.js', 'utf8'), {
        compress: true, mangle: true, format: {comments: false}
    });
    fs.writeFileSync('resources/js/facets.min.js', result.code + '\n');
    const source = fs.readFileSync('resources/css/main.css', 'utf8');
    const start = '/* B2B compact facets:', end = '/* End B2B compact facets */';
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from >= 0 && to > from);
    const css = postcss.parse(source.slice(from, to));
    css.walkComments(node => node.remove());
    css.walk(node => { node.raws.before = ''; node.raws.after = ''; node.raws.between = node.type === 'decl' ? ':' : ''; });
    const file = 'resources/css/main-211025.min.css';
    const old = fs.readFileSync(file, 'utf8'), marker = '/* B2B compact facets: built */';
    const position = old.indexOf(marker);
    const last = position < 0 ? -1 : old.indexOf(end, position);
    assert.ok(position < 0 || last > position, 'Existing facet block must have its closing marker');
    const prefix = position < 0 ? old : old.slice(0, position);
    const suffix = position < 0 ? '' : old.slice(last + end.length);
    fs.writeFileSync(file, prefix + marker + css.toString().trim() + end + suffix);
    console.log(JSON.stringify({jsBytes: Buffer.byteLength(result.code), cssBytes: Buffer.byteLength(css.toString().trim())}));
})();
