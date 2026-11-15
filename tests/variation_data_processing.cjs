// Real jQuery plus the actual source/minified variation controllers and matrix.
// node tests/variation_data_processing.cjs [before-js-dir] [report.json]
// No shop traffic. Product values and transport are explicit local fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const { readAsset, eventsOwner, sharedModule } = require('./theme_assets.cjs');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const before = process.argv[2] ? path.resolve(process.argv[2]) : null;
const current = path.resolve(__dirname, '../resources/js');

function controller(file) {
    const source = readAsset(file), found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.object?.type === 'ThisExpression' &&
            node.left.property?.name === 'variations' && node.right.type === 'NewExpression') found.push(node.right);
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(found.length, 1, 'Exactly one actual variation controller: ' + file);
    // Retain the enclosing entry's receiver alias when the minifier renamed it.
    return 'window.eGuardians={item:{}};eGuardians.item.variations=((' + eventsOwner(source) + ')=>(' +
        source.slice(found[0].start, found[0].end) + '))(eGuardians);';
}

async function controllers(browser, file, baseline) {
    const page = await browser.newPage();
    try {
        await page.setContent('<main></main>');
        await page.addScriptTag({ path: path.join(current, 'jquery-3.7.1.min.js') });
        await page.addScriptTag({ content: controller(file) });
        const cases = await page.evaluate(({ baseline }) => {
            const result = [], parser = JSON.parse, variantController = eGuardians.item.variations;
            for (const language of ['de', 'en', 'fr', 'it', 'es']) {
                document.documentElement.lang = language;
                for (const count of [1, 60, 301, 600]) {
                    // Historical metadata is deliberately present: removing its
                    // unused eager read must work independently of HTML projection.
                    const data = Array.from({ length: count }, (_, i) => ({
                        variationId: 1001 + i,
                        attributes: [{ attributeId: 191, attributeValueId: i + 1 }],
                        url: language + '/example-product_42', unitId: 1, unitCombinationId: 1
                    }));
                    const raw = JSON.stringify(data);
                    let parses = 0;
                    JSON.parse = function (input, ...args) {
                        if (input === raw) parses++;
                        return parser.call(this, input, ...args);
                    };
                    const root = document.createElement('div');
                    root.setAttribute('data-item-variation', '');
                    root.setAttribute('data-eg-variations', raw);
                    document.querySelector('main').appendChild(root);
                    try {
                        variantController.init(root);
                        const initialParses = parses;
                        // Static jQuery.data inspects its cache without reading/parsing the attribute.
                        const initialCachedRows = $.data(root, 'egVariations')?.length ?? 0;
                        // Existing external/legacy controls may appear after init.
                        // They must still resolve the map lazily on their first use.
                        root.innerHTML = '<div data-eg-attributes="191"><button data-eg-value="' + count + '">Size</button></div>';
                        const button = root.querySelector('button');
                        const attributes = [{ attributeId: 191, attributeValueId: count }];
                        const found = variantController.getVariation(attributes, button);
                        const candidates = variantController.findVariation(attributes[0], 0, root);
                        const afterLazyRead = parses;
                        // Reinitializing with real controls must populate their existing data contract.
                        variantController.init(root);
                        result.push({ language, count, initialParses, initialCachedRows, afterLazyRead,
                            afterControlsInit: parses, selected: found?.variationId,
                            candidates: candidates.map(row => row.variationId),
                            boundCandidates: $(button).data('variation').map(row => row.variationId) });
                    } finally {
                        JSON.parse = parser;
                        $(root).remove();
                    }
                }
            }
            return result;
        }, { baseline });
        for (const item of cases) {
            assert.equal(item.initialParses, baseline ? 1 : 0, file + ': eager map parse');
            assert.equal(item.initialCachedRows, baseline ? item.count : 0, file + ': retained jQuery map');
            assert.equal(item.afterLazyRead, 1, file + ': legacy first use must obtain map');
            assert.equal(item.afterControlsInit, 1, file + ': legacy map remains jQuery-cached');
            assert.equal(item.selected, 1000 + item.count);
            assert.deepEqual(item.candidates, [1000 + item.count]);
            assert.deepEqual(item.boundCandidates, item.candidates);
        }
        return { asset: path.basename(file), baseline, cases };
    } finally { await page.close(); }
}

async function matrix(browser, compressed) {
    const page = await browser.newPage();
    try {
        await page.setContent('<main></main>');
        await page.evaluate(() => {
            window.eGuardians = { apiservice: { get(url, params, callback) {
                if (!url.endsWith('/variations/batch')) throw new Error('Unexpected request: ' + url);
                const items = Object.fromEntries(params.ids.split(',').map(Number).map(id => [id,
                    { id, price: 4.99, stock: 20, orderMax: 7, ean: '001' + id, images: [] }]));
                queueMicrotask(() => callback({ data: { items } }));
            } } };
        });
        await page.addScriptTag({ content: sharedModule(path.join(current, compressed ? 'item.min.js' : 'item.js'), 'matrix') });
        const cases = [];
        for (const count of [1, 60, 301, 600]) {
            const initial = await page.evaluate(count => {
                const root = document.createElement('div');
                root.setAttribute('data-item-variation', '');
                const raw = JSON.stringify(Array.from({ length: count }, (_, i) => ({
                    variationId: 1001 + i, attributes: []
                })));
                root.setAttribute('data-eg-variations', raw);
                root.innerHTML = '<div data-eg-size-matrix data-eg-mode="none"><div class="eg-size-matrix-table" aria-busy="true">' +
                    '<div class="eg-size-matrix-body"></div></div><span data-eg-matrix-status></span>' +
                    '<span data-eg-total-qty></span><span data-eg-total-sum></span></div>';
                document.querySelector('main').replaceChildren(root);
                let parses = 0;
                const parser = JSON.parse;
                JSON.parse = function (input, ...args) {
                    if (input === raw) parses++;
                    return parser.call(this, input, ...args);
                };
                try { egInitSizeMatrices(root); }
                finally { JSON.parse = parser; }
                return { count, parses, rows: root.querySelectorAll('.eg-row').length };
            }, count);
            await page.waitForFunction(() => document.querySelector('.eg-size-matrix-table').getAttribute('aria-busy') === 'false');
            const rendered = await page.evaluate(() => [...document.querySelectorAll('.eg-row')].map(row => ({
                id: Number(row.dataset.egVariationId), price: row.querySelector('[data-eg-price]').dataset.egPriceValue,
                ean: row.querySelector('[data-eg-ean]').textContent, max: row.querySelector('[data-eg-qty]').max
            })));
            assert.equal(initial.parses, 1, 'Matrix retains one independent parse');
            assert.equal(initial.rows, count);
            assert.deepEqual(rendered, Array.from({ length: count }, (_, i) => ({
                id: 1001 + i, price: '4.99', ean: '001' + (1001 + i), max: '7'
            })));
            cases.push({ ...initial, values: 'PASS' });
        }
        return { compressed, cases };
    } finally { await page.close(); }
}

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.O46_BROWSER_EXECUTABLE });
    const report = { mode: 'LOCAL_JQUERY_AND_ACTUAL_MODULES_NO_NATIVE_ACCEPTANCE', controllers: [], matrices: [] };
    try {
        for (const name of ['item', 'main', 'cat', 'vue']) {
            for (const suffix of ['.js', '.min.js']) {
                if (before) report.controllers.push(await controllers(browser, path.join(before, name + suffix), true));
                report.controllers.push(await controllers(browser, path.join(current, name + suffix), false));
                console.log(name + suffix + ': 20 ' + (before ? 'before/after comparisons' : 'current cases') + ' for init and legacy controls PASS');
            }
        }
        for (const compressed of [false, true]) report.matrices.push(await matrix(browser, compressed));
        report.status = 'PASS';
        if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
        console.log('160 controller ' + (before ? 'before/after comparisons' : 'cases') + '; 8 matrix renders (1/60/301/600 rows) PASS');
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
