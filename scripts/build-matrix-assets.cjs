// Rebuild matrix, logo and newsletter regions; preserve unrelated asset bytes.
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
            const selectors = postcss.list.comma(rule.selector);
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
    critical.walkRules(rule => { if (postcss.list.comma(rule.selector).every(s => s.trim().startsWith('.modal'))) rule.remove(); });
    const headFile = 'resources/views/PageDesign/Partials/Head.twig';
    const head = fs.readFileSync(headFile, 'utf8');
    assert.equal((head.match(/<style data-eg-matrix-critical>[\s\S]*?<\/style>/g) || []).length, 1);
    fs.writeFileSync(headFile, head.replace(/<style data-eg-matrix-critical>[\s\S]*?<\/style>/,
        '<style data-eg-matrix-critical>' + critical.toString().trim() + '</style>'));
    report.css.criticalPdpBytes = Buffer.byteLength(critical.toString().trim());

    // Keep logo constraints identical in the stylesheet and the first-paint path.
    // Parse only this source region: unrelated legacy CSS is not part of this build.
    const logoBegin = source.indexOf('/* B2B responsive logo:');
    const logoEnd = source.indexOf('/* End B2B responsive logo */', logoBegin);
    assert.ok(logoBegin > 0 && logoEnd > logoBegin);
    const logo = postcss.parse(source.slice(logoBegin, logoEnd));
    logo.walkComments(c => c.remove());
    logo.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
    });
    logo.raws.after = '';
    const logoCss = logo.toString().trim();
    const logoStart = '/* B2B logo bundle start */', logoLast = '/* B2B logo bundle end */';
    let stylesheet = fs.readFileSync(file, 'utf8');
    const spans = [];
    const existingLogo = stylesheet.indexOf(logoStart);
    if (existingLogo >= 0) {
        const last = stylesheet.indexOf(logoLast, existingLogo);
        assert.ok(last > existingLogo);
        spans.push([existingLogo, last + logoLast.length, '']);
    } else {
        postcss.parse(stylesheet).walkRules(rule => {
            const selectors = postcss.list.comma(rule.selector);
            const keep = selectors.filter(s => !['.company-logo img', '.o-logo'].includes(s.trim()));
            if (keep.length === selectors.length) return;
            const from = rule.source.start.offset;
            spans.push([from, from + (keep.length ? rule.selector.length : rule.toString().length), keep.join(',')]);
        });
    }
    for (const [from, to, replacement] of spans.sort((a, b) => b[0] - a[0])) stylesheet = stylesheet.slice(0, from) + replacement + stylesheet.slice(to);
    stylesheet += logoStart + logoCss + logoLast;
    postcss.parse(stylesheet);
    fs.writeFileSync(file, stylesheet);
    let updatedHead = fs.readFileSync(headFile, 'utf8');
    // Remove the superseded fixed logo sizes from the three existing critical styles.
    updatedHead = updatedHead.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (whole, attributes, css) => {
        if (attributes.includes('data-eg-logo-critical')) return whole;
        return '<style' + attributes + '>' + css.replace(/\.company-logo img\s*\{[^{}]*\}|\.o-logo\s*\{[^{}]*\}/g, '') + '</style>';
    });
    assert.equal((updatedHead.match(/<style data-eg-logo-critical>[\s\S]*?<\/style>/g) || []).length, 1);
    updatedHead = updatedHead.replace(/<style data-eg-logo-critical>[\s\S]*?<\/style>/, '<style data-eg-logo-critical>' + logoCss + '</style>');
    fs.writeFileSync(headFile, updatedHead);
    report.css.logoBytes = Buffer.byteLength(logoCss);

    const newsletterBegin = source.indexOf('/* B2B newsletter card */');
    const newsletterEnd = source.indexOf('/* End B2B newsletter card */', newsletterBegin);
    assert.ok(newsletterBegin > 0 && newsletterEnd > newsletterBegin);
    const newsletter = postcss.parse(source.slice(newsletterBegin, newsletterEnd));
    newsletter.walkComments(c => c.remove());
    newsletter.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
    });
    newsletter.raws.after = '';
    const nlStart = '/* B2B newsletter bundle start */', nlEnd = '/* B2B newsletter bundle end */';
    stylesheet = fs.readFileSync(file, 'utf8');
    const newsletterSpans = [], priorNewsletter = stylesheet.indexOf(nlStart);
    if (priorNewsletter >= 0) {
        const last = stylesheet.indexOf(nlEnd, priorNewsletter);
        assert.ok(last > priorNewsletter);
        newsletterSpans.push([priorNewsletter, last + nlEnd.length, '']);
    } else {
        const tree = postcss.parse(stylesheet);
        tree.walkRules(rule => {
            const selectors = postcss.list.comma(rule.selector);
            const keep = selectors.filter(s => !s.includes('.o46-b2b-newsletter'));
            if (keep.length === selectors.length) return;
            const from = rule.source.start.offset;
            newsletterSpans.push([from, from + (keep.length ? rule.selector.length : rule.toString().length), keep.join(',')]);
        });
        tree.walkAtRules('keyframes', rule => {
            if (rule.params === 'o46-b2b-newsletter-in') newsletterSpans.push([rule.source.start.offset, rule.source.start.offset + rule.toString().length, '']);
        });
    }
    for (const [from, to, replacement] of newsletterSpans.sort((a, b) => b[0] - a[0])) stylesheet = stylesheet.slice(0, from) + replacement + stylesheet.slice(to);
    stylesheet += nlStart + newsletter.toString().trim() + nlEnd;
    postcss.parse(stylesheet);
    fs.writeFileSync(file, stylesheet);
    report.css.newsletterBytes = Buffer.byteLength(newsletter.toString().trim());
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
})().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
