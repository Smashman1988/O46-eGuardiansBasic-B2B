const { readAsset } = require('./theme_assets.cjs');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const {region} = require('../scripts/build-shop-mode-assets.cjs');
const output = process.argv[2] || '.cache/shop-mode.json';
const revision = process.argv.find(x => x.startsWith('--revision='))?.split('=')[1];
const rows = [];
const fixture = '<style>.smm-hidden{display:none}#shop-mode-modal{padding:16px}</style><div id="shop-mode-modal" class="smm-hidden" aria-hidden="true"><input><button id="smm-b2b">B2B</button><button id="smm-b2c">B2C</button></div>';

async function run() {
    const browser = await chromium.launch({executablePath: process.env.O46_BROWSER_EXECUTABLE});
    try {
        for (const name of ['main', 'cat', 'item', 'vue']) for (const suffix of ['.js', '.min.js']) {
            const file = `resources/js/${name}${suffix}`;
            const source = revision ? cp.execFileSync('git', ['show', revision + ':' + file], {encoding: 'utf8'}) : readAsset(file, 'utf8');
            const part = region(source), script = '(' + source.slice(part.callee.start, part.callee.end) + ')()';
            for (const lang of ['de', 'en', 'fr', 'it', 'es']) {
                const context = await browser.newContext({viewport: {width: lang === 'de' ? 1024 : 390, height: 844}, locale: lang});
                await context.route('**/*', route => route.fulfill({contentType: 'text/html', body: '<html lang="' + lang + '"><body>' + fixture + '</body></html>'}));
                const page = await context.newPage(), cdp = await context.newCDPSession(page);
                const errors = []; page.on('pageerror', error => errors.push(error.message));
                // Deterministic timer queue for the local dialog contract, not a native timing measurement.
                await page.addInitScript(() => {
                    let id = 0; window.__timers = new Map();
                    window.setTimeout = (callback, delay) => { __timers.set(++id, {callback, delay}); return id; };
                    window.clearTimeout = id => __timers.delete(id);
                    window.__openDialog = () => { for (const [id, timer] of __timers) { __timers.delete(id); timer.callback(); } };
                });
                async function fresh(noModal = false) {
                    await context.clearCookies();
                    await page.goto('https://b2b.outlet46.de/__local_shop_mode_contract');
                    if (noModal) await page.locator('#shop-mode-modal').evaluate(e => e.remove());
                    await page.evaluate(script);
                }
                async function listeners() {
                    const object = await cdp.send('Runtime.evaluate', {expression: 'document'});
                    const result = await cdp.send('DOMDebugger.getEventListeners', {objectId: object.result.objectId});
                    return result.listeners.filter(x => x.type === 'keydown').length;
                }
                async function check(test, fn) {
                    const row = {file, lang, test, revision: revision || 'working-tree'};
                    try { await fn(row); row.status = 'PASS'; } catch (error) { row.status = 'FAIL'; row.error = error.message; }
                    rows.push(row);
                }
                await check('Tab then Escape', async () => {
                    await fresh(); await page.evaluate(() => __openDialog());
                    await page.keyboard.press('Tab'); await page.keyboard.press('Escape');
                    assert.equal(await page.locator('#shop-mode-modal').count(), 0);
                    assert.equal(await listeners(), 0);
                });
                await check('Choice releases document listener', async () => {
                    await fresh(); await page.evaluate(() => __openDialog());
                    await page.locator('#smm-b2b').click();
                    assert.equal(await listeners(), 0);
                    assert.equal(await page.locator('#shop-mode-modal').count(), 0);
                    assert.equal((await context.cookies()).find(x => x.name === 'o46_shop_mode')?.value, 'b2b');
                });
                await check('Early Escape cancels open timer', async () => {
                    await fresh(); await page.keyboard.press('Escape');
                    assert.equal(await page.evaluate(() => __timers.size), 0);
                    assert.equal(await page.locator('#shop-mode-modal').count(), 0);
                });
                await check('Missing dialog is harmless', async () => { await fresh(true); assert.equal(await listeners(), 0); });
                await check('Stored B2B preference skips dialog', async () => {
                    await fresh(); await page.evaluate(() => __openDialog()); await page.locator('#smm-b2b').click();
                    await page.goto('https://b2b.outlet46.de/__local_shop_mode_contract'); await page.evaluate(script);
                    assert.equal(await page.evaluate(() => __timers.size), 0);
                    assert.equal(await listeners(), 0);
                    assert.equal(await page.locator('#shop-mode-modal').isVisible(), false);
                });
                await check('B2C destination preserved in intercepted fixture', async () => {
                    await fresh(); await page.evaluate(() => __openDialog());
                    await Promise.all([page.waitForURL('https://www.outlet46.de/'), page.locator('#smm-b2c').click()]);
                    assert.equal(page.url(), 'https://www.outlet46.de/');
                });
                await check('Repeated close has no listener growth', async row => {
                    await fresh(); const initial = await listeners(); assert.equal(initial, 1);
                    for (let cycle = 0; cycle < 20; cycle++) {
                        await page.evaluate(() => __openDialog());
                        await page.locator('#shop-mode-modal').click({position: {x: 1, y: 1}});
                        assert.equal(await listeners(), 0);
                        if (cycle < 19) { await page.evaluate(html => document.body.innerHTML = html, fixture); await page.evaluate(script); }
                    }
                    row.cycles = 20; row.remainingListeners = await listeners(); row.pendingTimers = await page.evaluate(() => __timers.size);
                    assert.equal(row.pendingTimers, 0);
                });
                assert.equal(errors.length, 0, 'No uncaught page errors');
                await context.close();
            }
            console.log(file, rows.filter(x => x.file === file && x.status === 'PASS').length + '/' + rows.filter(x => x.file === file).length + ' PASS');
        }
    } finally { await browser.close(); }
    fs.mkdirSync(path.dirname(output), {recursive: true});
    fs.writeFileSync(output, JSON.stringify({mode: 'LOCAL_BROWSER_CONTRACT', rows, passed: rows.filter(x => x.status === 'PASS').length, failed: rows.filter(x => x.status === 'FAIL').length}, null, 2));
    assert.equal(rows.filter(x => x.status === 'FAIL').length, 0);
}
run().catch(error => { fs.mkdirSync(path.dirname(output), {recursive: true}); fs.writeFileSync(output, JSON.stringify({rows, error: error.stack}, null, 2)); console.error(error); process.exitCode = 1; });
