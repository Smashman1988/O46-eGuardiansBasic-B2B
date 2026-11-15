// Actual source/min matrix, local JSON transport, real DOM; no shop requests.
// node tests/matrix_processing.cjs [before-js-dir] [report.json]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const { sharedModule } = require('./theme_assets.cjs');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const before = process.argv[2] ? path.resolve(process.argv[2]) : null;
const current = path.resolve(__dirname, '../resources/js');

function instrument(entry) {
    let code = sharedModule(entry, 'matrix');
    const candidates = [];
    function walk(node) {
        if (!node?.type) return;
        if (node.type === 'FunctionDeclaration' && code.slice(node.start, node.end).includes('orderQuantityMaximum')) candidates.push(node);
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(walk);
            else if (value?.type) walk(value);
        }
    }
    walk(acorn.parse(code, { ecmaVersion: 'latest' }));
    assert.equal(candidates.length, 1, 'Exactly one existing order-limit normalizer');
    const at = candidates[0].body.start + 1;
    return code.slice(0, at) + 'window.normalizerCalls++;' + code.slice(at);
}

async function run(browser, directory, min, baseline) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await page.setContent('<main></main>');
        await page.evaluate(() => {
            window.normalizerCalls = 0;
            window.headingQueries = 0;
            window.requests = [];
            const query = Element.prototype.querySelector;
            Element.prototype.querySelector = function (selector) {
                if (this.hasAttribute('data-eg-size-matrix') && selector.startsWith('.eg-size-matrix-head [data-eg-col=')) headingQueries++;
                return query.call(this, selector);
            };
            window.eGuardians = { apiservice: { get(url, params, callback) {
                if (!url.endsWith('/variations/batch')) throw new Error('Unexpected request ' + url);
                const ids = params.ids.split(',').map(Number);
                requests.push(ids);
                const items = Object.fromEntries(ids.map(id => [id, window.fixtureItems[id]]));
                queueMicrotask(() => callback(JSON.parse(JSON.stringify({ data: { items } }))));
            } } };
        });
        await page.addScriptTag({ content: instrument(path.join(directory, min ? 'item.min.js' : 'item.js')) });
        const results = [];
        let index = 0;
        for (const language of ['de', 'en', 'fr', 'it', 'es']) {
            for (const mode of ['none', 'size', 'color', 'size_color']) {
                for (const count of [0, 1, 60, 312]) {
                    const probe = await page.evaluate(({ language, mode, count, index }) => {
                        document.documentElement.lang = language;
                        const offset = 100000 + index * 1000;
                        const rows = Array.from({ length: count }, (_, i) => ({ variationId: offset + i,
                            attributes: [{ attributeId: 1, attributeValueId: i + 1 }, { attributeId: 2, attributeValueId: 101 + i % 2 }] }));
                        const limits = [ { orderMax: 3 }, { orderMax: '4', maximumOrderQuantity: 1 },
                            { orderMax: 0, maximumOrderQuantity: 5 }, {},
                            { orderMax: 'bad', variation: { maximumOrderQuantity: 6 } },
                            { orderMax: -2, maximumOrderQuantity: 1 },
                            { orderMax: null, data: { variation: { maxOrder: 7 } } },
                            { orderMax: false, variation: { data: { variation: { orderQuantityMax: 8 } } } } ];
                        window.fixtureItems = Object.fromEntries(rows.map((row, i) => [row.variationId,
                            { id: row.variationId, price: 4.99, stock: 20, ean: '001' + row.variationId, images: [], ...limits[i % limits.length] }]));
                        const root = document.createElement('article');
                        root.setAttribute('data-item-variation', '');
                        root.setAttribute('data-eg-variations', JSON.stringify(rows));
                        const columns = ['size', 'color', 'stock', 'price', 'ean', 'sub', 'qty'];
                        // Exercise explicit labels, text fallback, missing, duplicate and empty headings.
                        const headings = language === 'fr' ? '' : columns.map(key => {
                            const text = language === 'es' ? '' : ' ' + language + ':' + key + ' ';
                            const label = language === 'de' || language === 'it' ? ' data-eg-label="' + language + ':' + key + '"' : '';
                            return '<div data-eg-col="' + key + '"' + label + '>' + text + '</div>';
                        }).join('');
                        root.innerHTML = '<div data-eg-size-matrix data-eg-mode="' + mode + '" data-eg-size-attribute-id="1" data-eg-color-attribute-id="2">' +
                            '<div class="eg-size-matrix-table" aria-busy="true"><div class="eg-size-matrix-head">' + headings +
                            (language === 'it' ? '<div data-eg-col="qty" data-eg-label="wrong duplicate">wrong</div>' : '') + '</div>' +
                            '<div class="eg-size-matrix-body"></div></div><span data-eg-matrix-status></span><span data-eg-total-qty></span><span data-eg-total-sum></span></div>';
                        const matrix = root.querySelector('[data-eg-size-matrix]');
                        matrix.setAttribute('data-eg-size-values', JSON.stringify(rows.map((_, i) => ({ attributeValueId: i + 1, name: 'S' + i, position: i }))));
                        matrix.setAttribute('data-eg-color-values', JSON.stringify([{ attributeValueId: 101, name: 'Black' }, { attributeValueId: 102, name: 'White' }]));
                        document.querySelector('main').replaceChildren(root);
                        normalizerCalls = 0; headingQueries = 0; requests = [];
                        egInitSizeMatrices(root);
                        return { truthyLimits: Object.values(fixtureItems).filter(row => !!row.orderMax).length };
                    }, { language, mode, count, index: index++ });
                    await page.waitForFunction(() => document.querySelector('.eg-size-matrix-table').getAttribute('aria-busy') === 'false');
                    const actual = await page.evaluate(() => ({ normalizerCalls, headingQueries, batches: requests.map(ids => ids.length),
                        rows: [...document.querySelectorAll('.eg-row')].map(row => ({ id: row.dataset.egVariationId, html: row.outerHTML })),
                        total: document.querySelector('[data-eg-total-sum]').textContent }));
                    const columns = mode.includes('size') ? 6 : 5;
                    assert.equal(actual.rows.length, count);
                    assert.equal(actual.headingQueries, baseline ? columns * count : count ? columns : 0);
                    assert.deepEqual(actual.batches, count > 300 ? [300, count - 300] : count ? [count] : []);
                    // Explicit correctness checks also run without an old checkout.
                    for (const [rowIndex, row] of actual.rows.entries()) {
                        const sourceIndex = Number(row.id) - (100000 + (index - 1) * 1000);
                        const expected = [3, 4, 5, null, 6, null, 7, 8][sourceIndex % 8];
                        const limit = row.html.match(/data-eg-ordermax-raw="([^"]*)"/);
                        assert.equal(limit ? Number(limit[1]) : null, expected, 'Alias precedence and limits retained');
                        assert.ok(row.html.includes('data-eg-price-value="4.99"'));
                        assert.ok(row.html.includes('001' + row.id));
                    }
                    results.push({ language, mode, count, ...probe, ...actual });
                }
            }
        }
        assert.deepEqual(errors, []);
        return results;
    } finally { await page.close(); }
}

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    const report = { mode: 'LOCAL_REAL_MATRIX_DOM_AND_JSON_FIXTURES', baseline: before, variants: [] };
    try {
        for (const min of [false, true]) {
            const prior = before ? await run(browser, before, min, true) : null;
            const next = await run(browser, current, min, false);
            const cases = next.map((row, i) => {
                if (prior) {
                    assert.deepEqual(row.rows, prior[i].rows, 'Whole row DOM including order, labels, limits, stock, EAN and prices');
                    assert.equal(row.total, prior[i].total);
                    assert.equal(prior[i].normalizerCalls - row.normalizerCalls, row.truthyLimits);
                }
                const { rows, ...summary } = row;
                return { ...summary, beforeHeadingQueries: prior?.[i].headingQueries, beforeNormalizerCalls: prior?.[i].normalizerCalls, equalRowDom: prior ? true : null };
            });
            report.variants.push({ min, cases });
        }
    } finally { await browser.close(); }
    report.status = 'PASS';
    if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2));
    console.log('160 matrix cases PASS, 0/1/60/312 variants, DE/EN/FR/IT/ES, source/min' + (before ? '; old/new full row DOM identical' : ''));
})().catch(error => { console.error(error); process.exitCode = 1; });
