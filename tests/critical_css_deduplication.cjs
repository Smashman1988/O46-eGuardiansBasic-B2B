// Browser equivalence for the three real critical-CSS branches. The retained
// baseline commit provides the previous cascade; no live shop is contacted.
// O46_PLAYWRIGHT_MODULE / O46_BROWSER_EXECUTABLE configure the local browser.
// node tests/critical_css_deduplication.cjs <report-directory> [captured-html-directory]
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const {optimizeHead} = require('../scripts/optimize-critical-css.cjs');
const {syncHead: syncCardCss} = require('../scripts/build-card-css.cjs');
const headPath = 'resources/views/PageDesign/Partials/Head.twig';
const newHead = fs.readFileSync(headPath, 'utf8');
// Git stores LF while this Windows checkout uses CRLF. Match the checkout's
// line endings before comparing the actual CSS transformation.
const oldHead = cp.execFileSync('git', ['show', '96e50ee:' + headPath], {encoding: 'utf8'}).replace(/\r?\n/g, newHead.includes('\r\n') ? '\r\n' : '\n');
const reportDirectory = path.resolve(process.argv[2] || '.cache/critical-css-deduplication');
const capturedDirectory = path.resolve(process.argv[3] || '.cache/global-performance-13af2e8-20261113');
const fullCss = fs.readFileSync('resources/css/main-211025.min.css', 'utf8');
fs.mkdirSync(reportDirectory, {recursive: true});
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const optimized = optimizeHead(oldHead);
assert.equal(syncCardCss(optimized.head), newHead, 'Critical CSS contains only the reviewed deduplication and generated card separators');
assert.equal(optimizeHead(newHead).head, newHead, 'Optimization is idempotent');
const getStyles = head => [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)].map(m => ({attributes: m[1], css: m[2].replace(/\{\{[\s\S]*?\}\}/g, 'https://local.invalid/theme')}));
const styles = {before: getStyles(oldHead), after: getStyles(newHead)};
assert.equal(styles.before.length, styles.after.length);
assert.deepEqual(styles.before.slice(3), styles.after.slice(3), 'All layout-stabilizing supplementary blocks remain byte-identical');
const allJobs = [
    {file: 'home-de-390-r0-cold', branch: 2, widths: [390, 1440], lang: 'de'},
    {file: 'all-en-1440-r0-cold', branch: 2, widths: [390, 1440], lang: 'en'},
    {file: 'category-few-fr-375-r0-cold', branch: 1, widths: [375, 1024, 1440], lang: 'fr'},
    {file: 'pdp-de-1440-r0-cold', branch: 0, widths: [390, 768, 1024, 1440], lang: 'de'},
    {file: 'basket-empty-fr-1024-r0-cold', branch: 2, widths: [390, 1024], lang: 'fr'},
    {file: 'account-it-1920-r0-cold', branch: 2, widths: [390, 768, 1920], lang: 'it'},
    {file: 'search-empty-es-768-r0-cold', branch: 2, widths: [390, 768, 1440], lang: 'es'},
    {file: 'content-images-en-320-r0-cold', branch: 2, widths: [320, 1440], lang: 'en'},
    {file: 'error404-es-390-r0-cold', branch: 2, widths: [390, 1440], lang: 'es'}
];
const fallback = '<!doctype html><html><head></head><body><header class="main-header"><div class="container"><div class="row"><div class="col-12 col-md-4"><a class="company-logo"><img width="1114" height="226"></a></div><div class="col-12 col-md-8"><input class="form-control" type="text"></div></div></div><nav><ul class="top-menu"><li><a>Category</a></li></ul></nav></header><main id="page-body"><article class="single"><h1>Product</h1><div class="row"><div class="col-12 col-lg-7">Content</div><div class="col-12 col-lg-5">Total</div></div></article><div class="category-product-list row"><article class="col-6 col-md-4"><div class="cat-item"><div class="cat-item-image"><img width="300" height="400"></div><div class="cat-item-data"><a class="cat-item-name">Product</a><div class="cat-attr-sizes"><span class="availsize">38</span></div></div></div></article></div></main><footer><div class="row"><div class="col-12 col-md-4 col-lg-4 col-xl-3"><p class="footer-title">Footer</p></div></div></footer></body></html>';
const hasCaptured = allJobs.every(job => fs.existsSync(path.join(capturedDirectory, job.file + '.html')));
const jobs = hasCaptured ? allJobs : [0, 1, 2].map(branch => ({file: 'synthetic-' + branch, branch, widths: [390, 768, 1024, 1440], lang: 'de'}));
function markup(job) {
    let html = hasCaptured ? fs.readFileSync(path.join(capturedDirectory, job.file + '.html'), 'utf8') : fallback;
    html = html.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '').replace(/<noscript\b[\s\S]*?<\/noscript\s*>/gi, '')
        .replace(/<link\b[^>]*>/gi, '').replace(/\s(?:on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
        .replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (whole, attributes, css) => attributes.includes('data-eg-') || css.startsWith('@font-face') || css.includes('Brand alphabet fallback') ? '' : whole);
    const own = styles.before.filter((style, index) => index === job.branch || index >= 3 && (job.branch === 0 || !/data-eg-(?:matrix|pdp-layout)-critical/.test(style.attributes)))
        .map(style => '<style' + (style === styles.before[job.branch] ? ' data-test-main-critical' : style.attributes) + '>' + style.css + '</style>').join('');
    return html.replace('</head>', own + '<style>*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}</style></head>');
}
async function snapshot(page) {
    return page.evaluate(() => {
        const nodes = [...document.body.querySelectorAll('*')].filter(node => !['SCRIPT', 'STYLE', 'LINK'].includes(node.tagName));
        const values = nodes.map(node => {
            const r = node.getBoundingClientRect();
            const normal = getComputedStyle(node);
            const before = getComputedStyle(node, '::before');
            const after = getComputedStyle(node, '::after');
            return {tag: node.tagName, class: typeof node.className === 'string' ? node.className : '', rect: [r.x, r.y + scrollY, r.width, r.height],
                style: [...normal].map(prop => prop + ':' + normal.getPropertyValue(prop)).join(';'),
                before: ['content', 'display', 'position', 'width', 'height', 'color', 'font-family', 'font-size'].map(prop => before.getPropertyValue(prop)),
                after: ['content', 'display', 'position', 'width', 'height', 'color', 'font-family', 'font-size'].map(prop => after.getPropertyValue(prop))};
        });
        return {nodes: values, document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight]};
    });
}
function assertEquivalent(before, after, label) {
    assert.equal(before.nodes.length, after.nodes.length, label + ': element count');
    assert.deepEqual(before.document, after.document, label + ': document geometry');
    for (let index = 0; index < before.nodes.length; index++) {
        const a = before.nodes[index], b = after.nodes[index];
        if (JSON.stringify(a) === JSON.stringify(b)) continue;
        const differences = {label, index, tag: a.tag, class: a.class, beforeRect: a.rect, afterRect: b.rect};
        const ap = a.style.split(';'), bp = b.style.split(';');
        differences.properties = ap.map((value, i) => value === bp[i] ? null : {before: value, after: bp[i]}).filter(Boolean).slice(0, 30);
        differences.beforePseudo = a.before; differences.afterPseudo = b.before;
        fs.writeFileSync(path.join(reportDirectory, 'first-difference.json'), JSON.stringify(differences, null, 2));
        throw new Error('Cascade mismatch: ' + JSON.stringify(differences));
    }
}
async function run() {
    const browser = await chromium.launch({headless: true, executablePath: process.env.O46_BROWSER_EXECUTABLE});
    const result = {mode: hasCaptured ? 'LOCAL_CAPTURED_HTML_CASCADE_EQUIVALENCE_NOT_NATIVE_ACCEPTANCE' : 'LOCAL_SYNTHETIC_CASCADE_EQUIVALENCE_NOT_NATIVE_ACCEPTANCE',
        baseline: '96e50ee', unchangedSupplementaryBlocks: styles.before.length - 3, sourceBeforeBytes: Buffer.byteLength(oldHead), sourceAfterBytes: Buffer.byteLength(newHead),
        blocks: optimized.blocks, cases: [], limitations: ['Frozen DOM without hydration, external requests blocked.', 'LCP/CLS/INP/TTFB and native cold/warm transfer NOT_TESTED.', 'Main and checkout stylesheets, fonts/preloads and image priority remain unchanged.']};
    try {
        for (const job of jobs) for (const width of job.widths) {
            const page = await browser.newPage({viewport: {width, height: 900}});
            try {
                await page.route('**/*', async route => {
                    const url = new URL(route.request().url());
                    const relative = url.pathname.replace(/^.*\/(?:guardiansbasicb2b|theme)\//i, '');
                    const file = path.resolve('resources', relative);
                    if (file.startsWith(path.resolve('resources') + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
                        return route.fulfill({body: fs.readFileSync(file), contentType: /\.woff2?$/.test(file) ? 'font/woff2' : /\.svg$/.test(file) ? 'image/svg+xml' : /\.png$/.test(file) ? 'image/png' : 'image/jpeg'});
                    }
                    return route.abort();
                });
                await page.setContent(markup(job), {waitUntil: 'load'});
                await page.evaluate(() => document.fonts.ready);
                const before = await snapshot(page);
                const screenshot = ['home-de-390-r0-cold', 'pdp-de-1440-r0-cold'].includes(job.file) && [390, 1440].includes(width);
                const imageBefore = screenshot ? await page.screenshot({path: path.join(reportDirectory, job.file + '-' + width + '-before.png')}) : null;
                await page.locator('style[data-test-main-critical]').evaluate((node, css) => node.textContent = css, styles.after[job.branch].css);
                await page.evaluate(() => document.fonts.ready);
                const after = await snapshot(page);
                assertEquivalent(before, after, 'Early ' + job.file + '/' + width);
                if (screenshot) {
                    const imageAfter = await page.screenshot({path: path.join(reportDirectory, job.file + '-' + width + '-after.png')});
                    assert.equal(sha(imageBefore), sha(imageAfter), 'Screenshot pixels are unchanged');
                }
                await page.addStyleTag({content: fullCss});
                await page.evaluate(() => document.fonts.ready);
                const fullAfter = await snapshot(page);
                await page.locator('style[data-test-main-critical]').evaluate((node, css) => node.textContent = css, styles.before[job.branch].css);
                await page.evaluate(() => document.fonts.ready);
                const fullBefore = await snapshot(page);
                assertEquivalent(fullBefore, fullAfter, 'Final ' + job.file + '/' + width);
                result.cases.push({file: job.file, language: job.lang, width, branch: ['pdp', 'category', 'general'][job.branch], elements: before.nodes.length,
                    earlyComputedStylesAndGeometryEqual: true, finalComputedStylesAndGeometryEqual: true, earlyDigest: sha(JSON.stringify(before)), finalDigest: sha(JSON.stringify(fullAfter)), screenshotPixelsEqual: screenshot ? true : null, status: 'PASS'});
                console.log(job.file + ' / ' + width + ': PASS (' + before.nodes.length + ' elements)');
            } finally { await page.close(); }
        }
        result.status = 'PASS';
    } catch (error) {
        result.status = 'FAIL'; result.error = error.stack; throw error;
    } finally {
        await browser.close(); result.browserClosed = true;
        fs.writeFileSync(path.join(reportDirectory, 'critical-css-equivalence.json'), JSON.stringify(result, null, 2));
    }
    console.log(result.cases.length + ' local before/after browser pairs PASS');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
