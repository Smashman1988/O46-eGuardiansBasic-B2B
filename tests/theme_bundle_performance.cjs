// Local uncompressed HTTP comparison; does not measure PlentyONE or native CWV.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const { server, metrics, setOrigin } = require('./theme_bundles.cjs');
const output = path.resolve('.cache/systematic-optimization-96e50ee-20261113/js/performance.json');
const rows = [], navigation = [];
async function main() {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = 'http://127.0.0.1:' + server.address().port;
    setOrigin(origin);
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    async function snapshot(page, cdp) {
        await page.waitForFunction(() => window.fixtureReady);
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        const result = await metrics(page, cdp);
        const js = result.resources.filter(x => x.name.endsWith('.js'));
        result.js = { resources: js.length, transferredRequests: js.filter(x => x.transferSize > 0).length,
            transferredBytes: js.reduce((n, x) => n + x.transferSize, 0), encodedBodyBytes: js.reduce((n, x) => n + x.body, 0) };
        return result;
    }
    try {
        for (const width of [390, 1440]) for (const bundle of ['main', 'cat', 'item', 'vue']) for (const before of [true, false]) {
            const context = await browser.newContext({ viewport: { width, height: 900 } });
            const page = await context.newPage(), cdp = await context.newCDPSession(page), errors = [];
            page.on('pageerror', e => errors.push(e.message));
            await cdp.send('Performance.enable');
            await page.addInitScript(() => {
                new PerformanceObserver(list => { window.fixtureLcp = list.getEntries().at(-1)?.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
                new PerformanceObserver(list => { for (const x of list.getEntries()) if (!x.hadRecentInput) window.fixtureCls = (window.fixtureCls || 0) + x.value; }).observe({ type: 'layout-shift', buffered: true });
                new PerformanceObserver(list => { window.fixtureLongTasks = (window.fixtureLongTasks || []).concat(list.getEntries().map(x => x.duration)); }).observe({ type: 'longtask', buffered: true });
            });
            await page.goto(origin + '/?bundle=' + bundle + (before ? '&before' : ''));
            const cold = await snapshot(page, cdp);
            await page.reload();
            const warm = await snapshot(page, cdp);
            assert.deepEqual(errors, []);
            rows.push({ width, bundle, state: before ? 'before' : 'after', cold, warm });
            await context.close();
        }
        for (const before of [true, false]) {
            const context = await browser.newContext(), page = await context.newPage(), cdp = await context.newCDPSession(page);
            await cdp.send('Performance.enable');
            for (const bundle of ['main', 'cat', 'item']) {
                await page.goto(origin + '/?bundle=' + bundle + (before ? '&before' : ''));
                navigation.push({ state: before ? 'before' : 'after', bundle, result: await snapshot(page, cdp) });
            }
            await context.close();
        }
    } finally { await browser.close(); server.close(); }
    fs.writeFileSync(output, JSON.stringify({ status: 'PASS', mode: 'LOCAL_HTTP_UNCOMPRESSED_FIXTURE', repetitions: 1,
        limits: 'No native TTFB/PHP time/INP. CPU and fixture LCP are descriptive single runs, not a general performance claim.', rows, navigation }, null, 2));
    console.log(JSON.stringify({ status: 'PASS', coldWarmPairs: rows.length, navigationPages: navigation.length }));
}
main().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
