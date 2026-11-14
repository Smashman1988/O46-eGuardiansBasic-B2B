// Exercise the actual matrix and API modules, jQuery transport and abort lifecycle.
// Uses a local response transport and Playwright's virtual clock. No shop traffic.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const { sharedModule } = require('./theme_assets.cjs');

async function scenario(browser, entry, mode, count, copies = 1, baseline = false, projection = null) {
    const page = await browser.newPage();
    try {
        await page.clock.install();
        await page.setContent('<article><a id="ItemImgZoom"><img></a><div data-item-variation data-eg-variations></div></article>');
        await page.addScriptTag({ path: 'resources/js/jquery-3.7.1.min.js' });
        await page.evaluate(({ mode, count, copies, projection }) => {
            window.eGuardians = {};
            window.MagicZoom = { start() {}, stop() {} };
            window.calls = { batches: [], singles: [], aborted: 0, openSingles: 0, maxSingles: 0, overlap: false };
            const root = document.querySelector('[data-item-variation]');
            const ids = Array.from({ length: count }, (_, i) => ({ variationId: i + 1 }));
            root.dataset.egVariations = JSON.stringify([...ids, ids[0]]);
            root.innerHTML = ('<div data-eg-size-matrix data-eg-mode="color"><div role="status" data-eg-matrix-status ' +
                'data-fallback="Fallback" data-partial="Partial" data-unavailable="Unavailable">Loading</div>' +
                '<div class="eg-size-matrix-table" aria-busy="true"><div class="eg-size-matrix-body"></div></div></div>').repeat(copies);
            window.statuses = [];
            root.querySelectorAll('[data-eg-matrix-status]').forEach(status => {
                new MutationObserver(() => statuses.push({
                    text: status.textContent, busy: status.nextElementSibling.getAttribute('aria-busy')
                })).observe(status, { childList: true });
            });
            let openBatches = 0;
            jQuery.ajaxTransport('+json', options => {
                let timer;
                const url = new URL(options.url, 'https://fixture.test');
                const batch = url.pathname.endsWith('/batch');
                return {
                    send(_headers, complete) {
                        if (batch) {
                            openBatches++;
                            const batchIds = url.searchParams.get('ids').split(',').map(Number);
                            calls.batches.push({ ids: batchIds, timeout: options.timeout });
                            // The PHP route de-duplicates and limits the sorted request list to 300.
                            const items = projection ? projection.batch.items : Object.fromEntries([...new Set(batchIds)].slice(0, 300).map(id => [
                                id, { id, price: 4.99, stock: 20, ean: '001' + id, images: [{ url: '#batch-' + id }] }
                            ]));
                            if (mode === 'partial') {
                                delete items[2];
                                items[3] = null;
                            }
                            if (mode === 'timeout') return;
                            timer = setTimeout(() => {
                                openBatches--;
                                if (mode === 'error' || mode === 'allFailed') complete(503, 'Unavailable');
                                else complete(200, 'OK', { text: JSON.stringify({ data: {
                                    items, missing: mode === 'partial' ? [3] : []
                                } }) });
                            }, mode === 'slow' ? 6573 : 5);
                        } else {
                            const id = Number(url.pathname.split('/').pop());
                            calls.singles.push(id);
                            calls.overlap ||= openBatches > 0;
                            calls.maxSingles = Math.max(calls.maxSingles, ++calls.openSingles);
                            timer = setTimeout(() => {
                                calls.openSingles--;
                                if (mode === 'allFailed') { complete(503, 'Unavailable'); return; }
                                const doc = projection ? projection.docs[id] : {
                                    stock: { net: 11 }, prices: { default: { unitPrice: { value: 2.5 } } },
                                    barcodes: [{ code: '001' + id }], variation: { maximumOrderQuantity: 3 },
                                    images: { variation: [{ url: '#single-' + id, position: 1 }] }
                                };
                                complete(200, 'OK', { text: JSON.stringify({ data: { documents: [{ data: doc }] } }) });
                            }, 10);
                        }
                    },
                    abort() {
                        clearTimeout(timer);
                        if (batch) { openBatches--; calls.aborted++; }
                        else calls.openSingles--;
                    }
                };
            });
        }, { mode, count, copies, projection });
        await page.addScriptTag({ content: sharedModule(entry, 'apiservice') });
        await page.addScriptTag({ content: sharedModule(entry, 'matrix') });
        const initial = await page.evaluate(() => {
            const status = document.querySelector('[data-eg-matrix-status]');
            const initial = { text:status.textContent, busy:status.nextElementSibling.getAttribute('aria-busy') };
            egInitSizeMatrices(document);
            return initial;
        });
        if (!baseline) {
            assert.deepEqual(initial, { text:'Loading', busy:'true' });
        }
        if (mode === 'slow') {
            await page.clock.runFor(6100);
            if (!baseline) assert.equal(await page.evaluate(() => calls.singles.length), 0);
            await page.clock.fastForward(1000);
        } else if (mode === 'timeout') {
            const timeout = await page.evaluate(() => calls.batches[0].timeout);
            assert.ok(timeout > 6573 && timeout <= 30000);
            await page.clock.fastForward(timeout);
        }
        if (!baseline && mode === 'slow' && count === 60) {
            // A failed map in a newly opened Quickview must never borrow the host product's IDs.
            const empty = await page.evaluate(() => {
                const host = document.querySelector('[data-item-variation]');
                const modal = host.cloneNode(true);
                modal.dataset.egVariations = 'null';
                const matrix = modal.querySelector('[data-eg-size-matrix]');
                matrix.removeAttribute('data-eg-matrix-initialized');
                document.body.appendChild(modal);
                egInitSizeMatrices(matrix);
                const value = [matrix.querySelector('[data-eg-matrix-status]').textContent,
                    matrix.querySelector('.eg-size-matrix-table').getAttribute('aria-busy'), matrix.querySelectorAll('.eg-row').length];
                modal.remove();
                return value;
            });
            assert.deepEqual(empty, ['Unavailable', 'false', 0]);
        }
        // Allow transport completion and the bounded fallback queue to finish.
        for (let i = 0; i < 5; i++) await page.clock.fastForward(20);
        const result = await page.evaluate(({ count, allImages }) => {
            const samples = allImages ? Array.from({ length: count }, (_, i) => i + 1) : [...new Set([1, Math.min(count, 300), count])];
            const images = samples.map(id => {
                document.querySelector('[data-eg-variation-id="' + id + '"] [data-eg-color-preview]').click();
                return document.getElementById('ItemImgZoom').getAttribute('href');
            });
            const final = [...document.querySelectorAll('[data-eg-matrix-status]')].map(status => ({
                text: status.textContent, busy: status.nextElementSibling.getAttribute('aria-busy')
            }));
            return { ...calls, samples, images, statuses:window.statuses, final, rows: [...document.querySelectorAll('.eg-row')].map(row => ({
                id: +row.dataset.egVariationId, price: +row.querySelector('[data-eg-price]').dataset.egPriceValue,
                ean: row.querySelector('[data-eg-ean]').textContent, orderMax: row.dataset.egOrdermaxRaw || null,
                stock: row.querySelector('[data-eg-stock]').dataset.egStockNet || null,
                quantityCap: +row.querySelector('[data-eg-qty]').max
            })) };
        }, { count, allImages: !!projection });
        const requestedIds = result.batches.flatMap(batch => batch.ids);
        const allIds = Array.from({ length: count }, (_, i) => i + 1);
        assert.deepEqual(baseline ? [...new Set(requestedIds)] : requestedIds, baseline ? allIds : allIds.slice(0, 300));
        assert.equal(result.batches.length, 1);
        const lateFallback = baseline && mode === 'slow';
        const allFallback = lateFallback || mode === 'error' || mode === 'timeout' || mode === 'allFailed';
        const expectedSingles = allFallback ? allIds : mode === 'partial' ? [2] : allIds.slice(300);
        assert.deepEqual(result.singles, expectedSingles);
        assert.equal(result.aborted, mode === 'timeout' ? 1 : 0);
        assert.ok(result.maxSingles <= 6 && result.openSingles === 0);
        assert.equal(result.overlap, lateFallback);
        if (!baseline) {
            const fallbackMessage = result.statuses.some(s => s.text === 'Fallback' && s.busy === 'true');
            assert.equal(fallbackMessage, expectedSingles.length > 0);
            const message = mode === 'partial' ? 'Partial' : mode === 'allFailed' ? 'Unavailable' : '';
            assert.deepEqual(result.final, Array.from({ length:copies }, () => ({ text:message, busy:'false' })));
        }
        const singleIds = new Set(expectedSingles);
        const orderedIds = [1, ...allIds]; // color mode breaks ties by ascending variation ID
        assert.deepEqual(result.rows.map(row => row.id), Array.from({ length: copies }, () => orderedIds).flat());
        assert.deepEqual(result.images, result.samples.map(id => mode === 'allFailed' ? null :
            (projection ? '#first-' : singleIds.has(id) ? '#single-' : '#batch-') + id));
        for (const row of result.rows) {
            const missing = (mode === 'partial' && row.id === 3) || mode === 'allFailed';
            const fallback = singleIds.has(row.id) && !missing;
            if (projection) {
                const doc = projection.docs[row.id];
                const limit = Number(doc.variation.maximumOrderQuantity);
                assert.equal(row.price, doc.prices.default.unitPrice.value);
                assert.equal(row.stock, String(doc.stock.net));
                assert.equal(row.ean, doc.barcodes[1].code);
                assert.equal(row.orderMax, limit > 0 ? String(limit) : null);
                assert.equal(row.quantityCap, limit > 0 ? Math.min(limit, doc.stock.net) : doc.stock.net);
                continue;
            }
            assert.equal(row.price, missing ? 0 : fallback ? 2.5 : 4.99);
            assert.equal(row.ean, missing ? '–' : '001' + row.id);
            assert.equal(row.stock, missing ? null : fallback ? '11' : '20');
            assert.equal(row.orderMax, fallback ? '3' : null);
            assert.equal(row.quantityCap, missing ? 200 : fallback ? 3 : 20);
        }
        return { mode, count, copies, batches: result.batches.map(b => b.ids.length),
            singles: result.singles.length, aborted: result.aborted, maxSingles: result.maxSingles,
            overlap: result.overlap, rows: result.rows.length, phpProjection: !!projection };
    } finally { await page.close(); }
}

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        const baseline = process.argv[2];
        const projection = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null;
        if (baseline) {
            for (const file of ['item.js', 'item.min.js']) {
                for (const [mode, count] of [['slow', 60], ['ok', 300], ['overflow', 312]]) {
                    const result = await scenario(browser, path.join(baseline, file), mode, count, 2, true);
                    console.log(JSON.stringify({ baseline, file, ...result }));
                }
            }
        }
        for (const entry of ['resources/js/item.js', 'resources/js/item.min.js']) {
            for (const args of [['slow', 60, 2], ['error', 14], ['timeout', 14], ['partial', 5], ['allFailed', 5], ['ok', 300, 2], ['overflow', 312, 2]]) {
                const result = await scenario(browser, entry, ...args);
                console.log(JSON.stringify({ entry, ...result }));
            }
            if (projection) {
                for (const mode of ['ok', 'slow', 'error']) {
                    const result = await scenario(browser, entry, mode, 8, 1, false, projection);
                    console.log(JSON.stringify({ entry, ...result }));
                }
            }
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
