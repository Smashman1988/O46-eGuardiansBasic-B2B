// Complete deferred production assets, real jQuery/Bootstrap/Lozad/MagicZoom.
// HTTP fixtures replace Plenty services; no external shop or payment requests.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { historicalAssetFile } = require('./theme_assets.cjs');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.argv[2] || '.cache/systematic-optimization-96e50ee-20261113/js/browser');
fs.mkdirSync(output, { recursive: true });
const rows = [], requests = [];
let origin;
const gallery = id => `<article class="single"><h2>Product ${id}</h2><a class="MagicZoom" id="ItemImgZoom${id === 'pdp' ? '' : '2'}" href="/image.svg?large=${id}" data-options="zoomMode: off; hint: off;"><img width="320" height="240" src="/image.svg?small=${id}"></a><div class="single-prev-images"></div><button data-eg-event="click" data-eg-handler="testVariant">Size</button></article>`;
function html(bundle, lang, before, hasGallery = false) {
    const url = before ? '/before/' : '/assets/';
    const asset = before ? path.basename(historicalAssetFile(path.resolve(output, '../before', bundle + '.min.js'))) : bundle + '.min.js';
    return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"><title>Local bundle contract</title></head><body>
    <header><h1>Theme fixture</h1><span data-eg-basket-quantity>0</span><span data-basket-sum>0</span><a class="wishlist-link"></a></header>
    <script id="app-data-custom" type="application/json">{"templateType":"category"}</script>
    <button class="linkabso" data-href="/${lang}/product?keep=1&quickViewItem=true">Quickview</button><div class="category-product-list"></div>
    ${bundle === 'item' || hasGallery ? gallery('pdp') : ''}<img class="lozad" width="40" height="30" data-src="/image.svg?lazy"><button id="totop">Top</button>
    <div class="modal fade modal-cross" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button class="close" data-dismiss="modal">Close</button></div><div class="modal-body"></div></div></div></div>
    <script>window.activeLang='${lang}';window.messageServiceTranslations={searchexample:'Search'};window.addEventListener('load',function(){eGuardians.initialize();eGuardians.events.testVariant=function(){window.variantClicks=(window.variantClicks||0)+1};window.fixtureReady=true});</script>
    <script src="/assets/jquery-3.7.1.min.js"></script>
    ${before ? '' : '<script src="/assets/core.min.js" data-eg-magiczoom-src="/assets/magiczoom.min.js" defer></script>'}
    <script src="${url}${asset}" defer></script>
    ${!before && bundle === 'item' ? '<script src="/assets/magiczoom.min.js" data-eg-magiczoom defer></script>' : ''}
    </body></html>`;
}
const server = http.createServer((req, res) => {
    const u = new URL(req.url, origin);
    requests.push(u.pathname);
    if (u.pathname.startsWith('/assets/') || u.pathname.startsWith('/before/')) {
        const dir = u.pathname.startsWith('/before/') ? path.resolve(output, '../before') : path.resolve('resources/js');
        const file = path.join(dir, path.basename(u.pathname));
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Cache-Control', 'public, max-age=3600');
        return res.end(fs.readFileSync(file));
    }
    if (u.pathname === '/style.css') { res.setHeader('Content-Type', 'text/css'); return res.end(fs.readFileSync('resources/css/main.min.css')); }
    if (u.pathname === '/image.svg') { res.setHeader('Content-Type', 'image/svg+xml'); return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#76ae00"/><circle cx="320" cy="240" r="100" fill="white"/></svg>'); }
    if (u.pathname === '/rest/io/session/') {
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({ data: { basket: { itemQuantity: 0, itemSum: 0, currency: 'EUR', shippingCountryId: 1, customerId: 0, itemWishListIds: [] } } }));
    }
    if (u.pathname.endsWith('/product')) {
        res.setHeader('Content-Type', 'text/html');
        return res.end(u.searchParams.get('quickViewItem') === 'true' ? gallery(u.pathname) : '<h1>Product fallback</h1>');
    }
    res.setHeader('Content-Type', 'text/html');
    res.end(html(u.searchParams.get('bundle') || 'main', u.searchParams.get('lang') || 'de', u.searchParams.has('before'), u.searchParams.has('gallery')));
});
async function metrics(page, cdp) {
    const perf = await cdp.send('Performance.getMetrics');
    return page.evaluate(values => ({ metrics: Object.fromEntries(values.map(x => [x.name, x.value])),
        resources: performance.getEntriesByType('resource').map(x => ({ name: new URL(x.name).pathname, transferSize: x.transferSize, body: x.encodedBodySize })),
        lcp: window.fixtureLcp || null, cls: window.fixtureCls || 0, longTasks: window.fixtureLongTasks || [] }), perf.metrics);
}
async function run() {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        for (const width of [390, 1440]) {
            const context = await browser.newContext({ viewport: { width, height: 900 } });
            const page = await context.newPage(), errors = [];
            page.setDefaultTimeout(10000);
            page.on('pageerror', error => errors.push(error.message));
            page.on('console', message => { if (message.type() === 'warning') console.log(message.text()); });
            await page.addInitScript(() => {
                new PerformanceObserver(list => { window.fixtureLcp = list.getEntries().at(-1)?.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
                new PerformanceObserver(list => { for (const x of list.getEntries()) if (!x.hadRecentInput) window.fixtureCls = (window.fixtureCls || 0) + x.value; }).observe({ type: 'layout-shift', buffered: true });
                new PerformanceObserver(list => { window.fixtureLongTasks = (window.fixtureLongTasks || []).concat(list.getEntries().map(x => x.duration)); }).observe({ type: 'longtask', buffered: true });
            });
            const cdp = await context.newCDPSession(page);
            await cdp.send('Performance.enable');
            for (const bundle of ['main', 'cat', 'item', 'vue']) {
                const lang = { main: 'de', cat: 'fr', item: 'it', vue: 'es' }[bundle];
                const start = errors.length;
                await page.goto(`${origin}/?bundle=${bundle}&lang=${lang}`);
                await page.waitForFunction(() => window.fixtureReady);
                await page.locator('img.lozad').scrollIntoViewIfNeeded();
                await page.waitForFunction(() => document.querySelector('img.lozad').naturalWidth > 0);
                const initial = await page.evaluate(() => ({ zoom: !!window.MagicZoom, core: Object.keys(O46Core.installed),
                    requests: performance.getEntriesByType('resource').filter(x => x.name.includes('magiczoom.min.js')).length }));
                assert.equal(initial.zoom, bundle === 'item');
                assert.equal(initial.requests, bundle === 'item' ? 1 : 0);
                const cold = await metrics(page, cdp);
                // Duplicate inclusion of the core must not attach listeners again.
                const prior = await page.evaluate(() => ($._data(document, 'events')?.click || []).length);
                await page.addScriptTag({ url: origin + '/assets/core.min.js' });
                await page.evaluate(() => { const modules = Object.keys(O46Core.installed); for (const key of modules) O46Core[key].call(window, 5000); });
                assert.equal(await page.evaluate(() => ($._data(document, 'events')?.click || []).length), prior);
                await page.locator('.linkabso').click();
                await page.waitForFunction(() => {
                    const modal = document.querySelector('.modal-cross.show');
                    return modal && getComputedStyle(modal).opacity === '1' && modal.querySelector('.mz-ready');
                }).catch(async error => {
                    fs.writeFileSync(path.join(output, 'quickview-diagnostic.json'), JSON.stringify({ errors, requests,
                        state: await page.evaluate(() => ({ url: location.href, zoom: !!window.MagicZoom,
                            src: window.O46Core?.magicZoomUrl, html: document.querySelector('.modal-cross')?.outerHTML,
                            scripts: [...document.scripts].map(x => x.src) })) }, null, 2));
                    throw error;
                });
                await page.locator('.modal-cross [data-eg-handler="testVariant"]').click();
                assert.equal(await page.evaluate(() => window.variantClicks), 1);
                if (bundle === 'cat' || bundle === 'item') {
                    await page.evaluate(() => {
                        window.expansionOpened = false; window.expansionClosed = false;
                        MagicZoom.registerCallback('onExpandOpen', () => { window.expansionOpened = true; });
                        MagicZoom.registerCallback('onExpandClose', () => { window.expansionClosed = true; });
                    });
                    await page.locator('.modal-cross .MagicZoom').click();
                    await page.waitForFunction(() => window.expansionOpened);
                    await page.locator('.mz-button-close:visible').click();
                    await page.waitForFunction(() => window.expansionClosed);
                }
                await page.locator('.modal-cross .close').click();
                await page.waitForFunction(() => !document.querySelector('.modal-cross.show'));
                await page.locator('.linkabso').click();
                await page.waitForFunction(() => {
                    const modal = document.querySelector('.modal-cross.show');
                    return modal && getComputedStyle(modal).opacity === '1' && modal.querySelector('.mz-ready');
                });
                assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').filter(x => x.name.includes('magiczoom.min.js')).length), 1);
                assert.deepEqual(errors.slice(start), []);
                if (bundle === 'cat') await page.screenshot({ path: path.join(output, 'quickview-' + width + '.png') });
                await page.reload();
                await page.waitForFunction(() => window.fixtureReady);
                const warm = await metrics(page, cdp);
                rows.push({ status: 'PASS', width, bundle, lang, initial, cold, warm });
                fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ mode: 'LOCAL_FULL_ASSETS_HTTP_FIXTURE', rows }, null, 2));
            }
            // The fifth language uses exactly the same existing handlers.
            await page.goto(origin + '/?bundle=cat&lang=en&gallery');
            await page.waitForFunction(() => window.fixtureReady && document.querySelector('#ItemImgZoom .mz-ready'));
            assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').filter(x => x.name.includes('magiczoom.min.js')).length), 1);
            rows.push({ status: 'PASS', width, case: 'initial-gallery-on-content-page' });
            await page.goto(origin + '/?bundle=cat&lang=en');
            await page.waitForFunction(() => window.fixtureReady);
            assert.equal(await page.locator('html').getAttribute('lang'), 'en');
            // One in-flight request, failure cleanup, retry, and fast repeated input.
            await page.route('**/assets/magiczoom.min.js', route => route.abort('failed'));
            await page.locator('.linkabso').click();
            await page.waitForURL('**/en/product?keep=1');
            assert.equal(await page.locator('h1').textContent(), 'Product fallback');
            await page.unroute('**/assets/magiczoom.min.js');
            rows.push({ status: 'PASS', width, case: 'english-quickview-asset-failure-product-fallback' });
            await context.close();
        }
    } finally { await browser.close(); server.close(); }
    const result = { mode: 'LOCAL_FULL_ASSETS_HTTP_FIXTURE_NOT_NATIVE_CWV', status: 'PASS', rows };
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ status: 'PASS', cases: rows.length }));
}
module.exports = { server, html, metrics, setOrigin: value => { origin = value; } };
if (require.main === module) run().catch(error => {
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({ error: error.stack, completed: rows.length }, null, 2));
    console.error(error); server.close(); process.exitCode = 1;
});
