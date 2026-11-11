// Rebuild only the shared matrix IIFE and its CSS; preserve all unrelated bytes.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const { minify } = require('terser');
const postcss = require(process.env.O46_POSTCSS_MODULE || 'postcss');
function matrixCall(source) {
    const calls = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'CallExpression' && node.callee.type === 'FunctionExpression' &&
            source.slice(node.start, node.end).includes('window.__egSizeMatrixLoaded')) calls.push(node);
        for (const val of Object.values(node)) {
            if (Array.isArray(val)) val.forEach(visit);
            else if (val?.type) visit(val);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(calls.length, 1, 'Exactly one shared matrix IIFE');
    return calls[0];
}
(async () => {
    const report = { javascript: [], css: {} };
    for (const name of ['cat', 'item', 'main', 'vue']) {
        const source = fs.readFileSync(`resources/js/${name}.js`, 'utf8');
        const file = `resources/js/${name}-020726.min.js`;
        const old = fs.readFileSync(file, 'utf8'), a = matrixCall(source), b = matrixCall(old);
        const result = await minify('window.__matrixBuild=' + source.slice(a.start, a.end), {
            compress: false, mangle: true, format: { comments: false }
        });
        const expr = acorn.parse(result.code, { ecmaVersion: 'latest' }).body[0].expression.right;
        const replacement = '(' + result.code.slice(expr.start, expr.end) + ')';
        // Acorn excludes the IIFE's grouping parentheses. Replace them too so
        // repeated builds do not accumulate another pair around the same call.
        let from = b.start, to = b.end;
        while (old[from - 1] === '(' && old[to] === ')') { from--; to++; }
        const output = old.slice(0, from) + replacement + old.slice(to);
        acorn.parse(output, { ecmaVersion: 'latest' });
        fs.writeFileSync(file, output);
        report.javascript.push({ file, unchangedOutsideMatrix: true, matrixBytes: Buffer.byteLength(replacement) });
    }
    const source = fs.readFileSync('resources/css/main.css', 'utf8');
    const begin = source.indexOf('/* B2B matrix:'), end = source.indexOf('/* End B2B responsive matrix */', begin);
    assert.ok(begin > 0 && end > begin);
    const root = postcss.parse(source.slice(begin, end));
    root.walkComments(c => c.remove());
    root.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
        if (n.type === 'decl') n.raws.important = '!important';
    });
    root.raws.after = '';
    const file = 'resources/css/main-211025.min.css';
    let old = fs.readFileSync(file, 'utf8');
    const startMark = '/* B2B matrix bundle start */', endMark = '/* B2B matrix bundle end */';
    const prior = old.indexOf(startMark);
    const edits = [];
    if (prior >= 0) {
        const last = old.indexOf(endMark, prior);
        assert.ok(last > prior);
        edits.push([prior, last + endMark.length, '']);
    } else {
        // The legacy minifier merged several matrix selectors with unrelated rules.
        // Remove only matrix selectors; keep shared declarations and other selectors.
        postcss.parse(old).walkRules(rule => {
            const selectors = rule.selector.split(',');
            const keep = selectors.filter(s => !/eg-size-matrix|eg-color-link/.test(s));
            if (keep.length === selectors.length) return;
            const from = rule.source.start.offset;
            if (keep.length) edits.push([from, from + rule.selector.length, keep.join(',')]);
            else edits.push([from, from + rule.toString().length, '']);
        });
    }
    for (const [from, to, replacement] of edits.sort((a, b) => b[0] - a[0])) old = old.slice(0, from) + replacement + old.slice(to);
    const output = old + startMark + root.toString().trim() + endMark;
    postcss.parse(output);
    fs.writeFileSync(file, output);
    report.css = { file, editedLegacySelectorSpans: edits.length, unrelatedBytesPreserved: true };
    // main.css loads asynchronously. Reuse its matrix geometry in the existing
    // PDP critical-style path so the new Twig markup never paints unformatted.
    const critical = root.clone();
    critical.walkRules(rule => { if (rule.selector.split(',').every(s => s.trim().startsWith('.modal'))) rule.remove(); });
    const headFile = 'resources/views/PageDesign/Partials/Head.twig';
    const head = fs.readFileSync(headFile, 'utf8');
    assert.equal((head.match(/<style data-eg-matrix-critical>[\s\S]*?<\/style>/g) || []).length, 1);
    fs.writeFileSync(headFile, head.replace(/<style data-eg-matrix-critical>[\s\S]*?<\/style>/,
        '<style data-eg-matrix-critical>' + critical.toString().trim() + '</style>'));
    report.css.criticalPdpBytes = Buffer.byteLength(critical.toString().trim());
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
})().catch(error => { console.error(error); process.exitCode = 1; });
