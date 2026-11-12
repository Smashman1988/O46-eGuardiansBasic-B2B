// Rebuild owned matrix, logo, newsletter and first-paint regions; preserve unrelated rules.
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
    report.css = { file, editedLegacySelectorSpans: edits.length, unrelatedRulesPreserved: true };
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
    // The same geometry must exist before and after the asynchronous stylesheet.
    // Copy the owning source rules rather than maintaining a second CSS definition.
    const thumbSelectors = ['.single .single-prev-images a', '.single .single-prev-images a img', '.single-prev-images'];
    const thumbs = postcss.root();
    for (const selector of thumbSelectors) {
        const from = source.indexOf('\n' + selector + '{');
        assert.ok(from >= 0, 'Missing source geometry: ' + selector);
        const to = source.indexOf('}', from) + 1;
        thumbs.append(postcss.parse(source.slice(from, to)).nodes[0]);
    }
    assert.equal(thumbs.nodes.length, thumbSelectors.length);
    // MagicZoom inserts its figure/lens before async main.css applies. Borrow only
    // their existing layout declarations, scoped to the PDP anchor. Keep vendor
    // CSS authoritative: no second definition or extra external bundle rules.
    const zoomFrom = source.indexOf('\n.MagicZoom,\n.mz-figure,');
    const zoomLast = source.indexOf('\n.mz-lens img {', zoomFrom);
    assert.ok(zoomFrom > 0 && zoomLast > zoomFrom);
    const zoomSource = postcss.parse(source.slice(zoomFrom, source.indexOf('}', zoomLast) + 1));
    const zoomProperties = {
        '.mz-figure': ['display', 'font-size', 'line-height', 'position', 'vertical-align'],
        'figure.mz-figure': ['margin', 'overflow'],
        '.mz-lens': ['position', 'overflow', 'pointer-events'],
        '.mz-lens img': ['position', 'max-width', 'max-height'],
        '.mz-figure > img': ['width', 'height']
    };
    const zoomCritical = postcss.root();
    for (const [selector, properties] of Object.entries(zoomProperties)) {
        const rule = postcss.rule({ selector: ':where(#ItemImgZoom) ' + selector });
        zoomSource.walkRules(existing => {
            if (!postcss.list.comma(existing.selector).includes(selector)) return;
            existing.walkDecls(decl => { if (properties.includes(decl.prop)) rule.append(decl.clone()); });
        });
        assert.equal(rule.nodes.length, properties.length, 'Missing/duplicate MagicZoom geometry: ' + selector);
        zoomCritical.append(rule);
    }
    zoomCritical.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
        if (n.type === 'decl') n.raws.important = '!important';
    });
    zoomCritical.raws.after = '';
    report.css.zoomCriticalBytes = Buffer.byteLength(zoomCritical.toString());
    const geometryBegin = source.indexOf('/* B2B first-paint geometry:');
    const geometryEnd = source.indexOf('/* End B2B first-paint geometry */', geometryBegin);
    assert.ok(geometryBegin > 0 && geometryEnd > geometryBegin);
    const geometry = postcss.parse(source.slice(geometryBegin, geometryEnd));
    for (const [name, tree] of [['pdp-layout', thumbs], ['first-paint', geometry]]) {
        tree.walkComments(c => c.remove());
        tree.walk(n => {
            n.raws.before = ''; n.raws.after = '';
            n.raws.between = n.type === 'decl' ? ':' : '';
            if (n.type === 'decl') n.raws.important = '!important';
        });
        tree.raws.after = '';
        const css = tree.toString().trim();
        const markStart = `/* B2B ${name} bundle start */`, markEnd = `/* B2B ${name} bundle end */`;
        stylesheet = fs.readFileSync(file, 'utf8');
        const prior = stylesheet.indexOf(markStart);
        if (prior >= 0) {
            const last = stylesheet.indexOf(markEnd, prior);
            assert.ok(last > prior);
            stylesheet = stylesheet.slice(0, prior) + stylesheet.slice(last + markEnd.length);
        }
        if (name === 'pdp-layout') {
            const spans = [];
            postcss.parse(stylesheet).walkRules(rule => {
                const selectors = postcss.list.comma(rule.selector);
                const keep = selectors.filter(s => !thumbSelectors.includes(s.trim()));
                if (keep.length === selectors.length) return;
                const from = rule.source.start.offset;
                spans.push([from, from + (keep.length ? rule.selector.length : rule.toString().length), keep.join(',')]);
            });
            for (const [from, to, value] of spans.sort((a,b) => b[0]-a[0])) stylesheet = stylesheet.slice(0,from)+value+stylesheet.slice(to);
        }
        stylesheet += markStart + css + markEnd;
        postcss.parse(stylesheet);
        fs.writeFileSync(file, stylesheet);
        let head = fs.readFileSync(headFile, 'utf8');
        const tag = `<style data-eg-${name}-critical>`;
        const pattern = new RegExp(tag + '[\\s\\S]*?</style>');
        const earlyCss = css + (name === 'pdp-layout' ? zoomCritical.toString() : '');
        if (pattern.test(head)) head = head.replace(pattern, tag + earlyCss + '</style>');
        else {
            const anchor = name === 'pdp-layout' ? '{# B2B matrix critical end #}' : '{# Generated from main.css: reserve proportional logo geometry before async CSS. #}';
            assert.ok(head.includes(anchor));
            head = head.replace(anchor, anchor + '\n' + tag + earlyCss + '</style>');
        }
        fs.writeFileSync(headFile, head);
        report.css[name + 'Bytes'] = Buffer.byteLength(css);
    }
    // Short pages paint the footer above the fold. Its existing layout must not
    // wait for main.css. No stylesheet behavior or footer markup is changed.
    const footerFrom = source.indexOf('\nfooter{');
    const footerTo = source.indexOf('\n.category-title{', footerFrom);
    assert.ok(footerFrom > 0 && footerTo > footerFrom);
    const footer = postcss.parse(source.slice(footerFrom, footerTo));
    // The source region also contains old blog/table rules; they are not footer CSS.
    footer.walkRules(rule => {
        const keep = postcss.list.comma(rule.selector).filter(s => !/^\.blog-post\b|^\.scrollable-table\b/.test(s));
        if (!keep.length) rule.remove();
        else rule.selector = keep.join(',');
    });
    const pressFrom = source.indexOf('\n.footer-press-logos {');
    const pressTo = source.indexOf('/* B2B matrix:', pressFrom);
    assert.ok(pressFrom > 0 && pressTo > pressFrom);
    footer.append(postcss.parse(source.slice(pressFrom, pressTo)).nodes);
    // Existing critical CSS omits responsive visibility utilities. In particular,
    // d-lg-block d-xl-none footer separators incorrectly wrap the fourth column
    // before the asynchronous stylesheet arrives (1080px horizontal movement).
    // Preserve the source order and breakpoints of the existing utilities.
    // Legacy source/min Bootstrap ordering differs (d-xlg-none vs d-xl-block).
    // Borrow the actually delivered utility cascade; do not reorder the site's grid.
    const utilitySource = postcss.parse(fs.readFileSync(file, 'utf8'));
    const utilities = postcss.root();
    const footerGrid = new Set((fs.readFileSync('resources/views/PageDesign/Partials/Footer.twig', 'utf8').match(/\bcol(?:-(?:sm|md|lg|xl|xlg))?-\d+\b/g) || []).map(s => '.' + s));
    utilitySource.walkRules(rule => {
        const keep = postcss.list.comma(rule.selector).filter(s => s === '.col' || footerGrid.has(s) || /^\.d-(?:(?:sm|md|lg|xl|xlg)-)?(?:none|block|inline-block|flex)$/.test(s));
        if (!keep.length) return;
        const copy = rule.clone({selector: keep.join(',')});
        if (rule.parent.type === 'atrule') utilities.append(rule.parent.clone({nodes: [copy]}));
        else utilities.append(copy);
    });
    footer.prepend(utilities.nodes);
    // Early grid utilities must not override the header/PDP critical breakpoints.
    // Keep these borrowed rules local to their actual consumer, the footer.
    footer.walkRules(rule => {
        rule.selector = postcss.list.comma(rule.selector).map(s => /^footer\b/.test(s) ? s : ':where(footer) ' + s).join(',');
    });
    footer.walkComments(c => c.remove());
    footer.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
    });
    footer.raws.after = '';
    const footerTag = '<style data-eg-footer-critical>' + footer.toString().trim() + '</style>';
    let footerHead = fs.readFileSync(headFile, 'utf8');
    const footerPattern = /<style data-eg-footer-critical>[\s\S]*?<\/style>/;
    footerHead = footerPattern.test(footerHead) ? footerHead.replace(footerPattern, footerTag) :
        footerHead.replace('<style data-eg-first-paint-critical>', footerTag + '\n<style data-eg-first-paint-critical>');
    fs.writeFileSync(headFile, footerHead);
    report.css.footerCriticalBytes = Buffer.byteLength(footer.toString().trim());
    // Existing payment/content widgets use this small Bootstrap grid. Reserve
    // its normal rows before main.css, without changing other page grids or specificity.
    const contentClasses = new Set(['.row', '.col-12', '.col-sm-6', '.col-lg-4', '.col-xl-3',
        '.d-flex', '.align-self-center', '.flex-grow-1', '.text-center', '.mb-3', '.mr-3', '.ml-3']);
    const contentLayout = postcss.root();
    const paymentWidget = ':where(#page-body .widget-code:has(img[data-src$="/frontend/page/bilder/Footer/paypal.png"]))';
    utilitySource.walkRules(rule => {
        const keep = postcss.list.comma(rule.selector).filter(s => contentClasses.has(s));
        if (!keep.length) return;
        const copy = rule.clone({selector: keep.map(s => paymentWidget + ' ' + s).join(',')});
        contentLayout.append(rule.parent.type === 'atrule' ? rule.parent.clone({nodes: [copy]}) : copy);
    });
    contentLayout.walk(n => {
        n.raws.before = ''; n.raws.after = '';
        n.raws.between = n.type === 'decl' ? ':' : '';
    });
    contentLayout.raws.after = '';
    const contentTag = '<style data-eg-content-layout-critical>' + contentLayout.toString().trim() + '</style>';
    const contentPattern = /<style data-eg-content-layout-critical>[\s\S]*?<\/style>/;
    let contentHead = fs.readFileSync(headFile, 'utf8');
    contentHead = contentPattern.test(contentHead) ? contentHead.replace(contentPattern, contentTag) :
        contentHead.replace('<style data-eg-first-paint-critical>', contentTag + '\n<style data-eg-first-paint-critical>');
    fs.writeFileSync(headFile, contentHead);
    report.css.contentLayoutCriticalBytes = Buffer.byteLength(contentLayout.toString().trim());
    // Removing legacy rules can expose whitespace at the old minified line end.
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/[\t ]+(?=\r?$)/gm, ''));
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
})().catch(error => { console.error(error.stack || error.message); process.exitCode = 1; });
