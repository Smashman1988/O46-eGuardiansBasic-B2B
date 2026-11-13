// Reuse the existing source-derived first-paint CSS; external assets belong to build-css.
const assert = require('node:assert/strict');
const postcss = require(process.env.O46_POSTCSS_MODULE || 'postcss');

function deriveCriticalCss(source, head, compiledCss, footerMarkup) {
    // Anchors describe CSS content, independent of the checkout's LF/CRLF convention.
    source = source.replace(/\r\n/g, '\n');
    const report = {};
    function replaceCritical(name, css) {
        const tag = '<style data-eg-' + name + '-critical>';
        const pattern = new RegExp(tag + '[\\s\\S]*?</style>', 'g');
        assert.equal((head.match(pattern) || []).length, 1, 'Exactly one existing ' + name + ' critical block');
        head = head.replace(pattern, () => tag + css + '</style>');
    }
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
    const critical = root.clone();
    critical.walkRules(rule => { if (postcss.list.comma(rule.selector).every(s => s.trim().startsWith('.modal'))) rule.remove(); });
    replaceCritical('matrix', critical.toString().trim());
    report.criticalPdpBytes = Buffer.byteLength(critical.toString().trim());

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
    // Keep logo declarations in their owning early block.
    head = head.replace(/<style([^>]*)>([\s\S]*?)<\/style>/g, (whole, attributes, css) => {
        if (attributes.includes('data-eg-logo-critical')) return whole;
        return '<style' + attributes + '>' + css.replace(/\.company-logo img\s*\{[^{}]*\}|\.o-logo\s*\{[^{}]*\}/g, '') + '</style>';
    });
    replaceCritical('logo', logoCss);
    report.logoBytes = Buffer.byteLength(logoCss);

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
    report.zoomCriticalBytes = Buffer.byteLength(zoomCritical.toString());
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
        replaceCritical(name, css + (name === 'pdp-layout' ? zoomCritical.toString() : ''));
        report[name + 'Bytes'] = Buffer.byteLength(css);
    }

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
    // Borrow the full build output, keeping the delivered utility cascade in sync.
    const utilitySource = postcss.parse(compiledCss);
    const utilities = postcss.root();
    const footerGrid = new Set((footerMarkup.match(/\bcol(?:-(?:sm|md|lg|xl|xlg))?-\d+\b/g) || []).map(s => '.' + s));
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
    replaceCritical('footer', footer.toString().trim());
    report.footerCriticalBytes = Buffer.byteLength(footer.toString().trim());

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
    replaceCritical('content-layout', contentLayout.toString().trim());
    report.contentLayoutCriticalBytes = Buffer.byteLength(contentLayout.toString().trim());
    return {head, report};
}

async function build({check = false} = {}) {
    const cssBuilder = require('./build-css.cjs');
    const prepared = cssBuilder.prepare();
    const javascript = await require('./build-js.cjs').build({check});
    return {javascript, css: cssBuilder.publish(prepared, {check})};
}
module.exports = {deriveCriticalCss, build};
if (require.main === module) build({check: process.argv.includes('--check')})
    .then(report => {
        const reportFile = process.argv.slice(2).find(arg => !arg.startsWith('--'));
        if (reportFile && !process.argv.includes('--check')) require('node:fs').writeFileSync(reportFile, JSON.stringify(report, null, 2));
        console.log(JSON.stringify(report));
    })
    .catch(error => {console.error(error.stack || error.message); process.exitCode = 1;});
