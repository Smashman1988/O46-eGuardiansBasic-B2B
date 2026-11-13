const { readAsset } = require('./theme_assets.cjs');
// node tests/quickview_dropdown.cjs (same Chrome/Playwright overrides as seo_metadata.cjs).
// Exercise the real registration, opener and element binder. Only Quickview transport,
// modal display, image observers and the two products are fixtures; no shop is contacted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const assets = path.resolve(__dirname, '../resources/js');

function quickviewParts(source) {
    const parts = {};
    function visit(node, depth = 0) {
        if (!node || !node.type) return;
        let name;
        if (node.type === 'AssignmentExpression' && node.left.property?.name === 'events' &&
            node.right.type === 'NewExpression' && source.slice(node.right.start, node.right.end).includes('.bindEvents')) {
            parts.owner = node.left.object.name; // original lexical name, including the minifier's alias
        }
        if (node.type === 'AssignmentExpression' && node.left.property?.name === 'bindEvents') {
            name = 'bind';
        } else if (node.type === 'AssignmentExpression' && node.left.property?.name === 'observeLazyImages') {
            name = 'lazy';
        } else if (node.type === 'CallExpression') {
            const method = node.callee.property?.name;
            if (method === 'on' && node.arguments[1]?.value === '.linkabso') name = 'open';
            if (method === 'mouseup' && node.callee.object?.arguments?.[0]?.name === 'document' &&
                source.slice(node.start, node.end).includes('.cat-facet')) {
                assert.equal(depth, 0, 'Dropdown registration is inside a repeatable function');
                name = 'register';
            }
        }
        if (name) {
            assert.ok(!parts[name], 'Duplicate ' + name);
            const fragment = ['bind', 'lazy'].includes(name) ? node.right : node;
            parts[name] = source.slice(fragment.start, fragment.end);
        }
        const childDepth = depth + Number(/Function/.test(node.type));
        for (const val of Object.values(node)) {
            if (Array.isArray(val)) val.forEach(child => visit(child, childDepth));
            else if (val?.type) visit(val, childDepth);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.deepEqual(Object.keys(parts).sort(), ['bind', 'lazy', 'open', 'owner', 'register']);
    return parts;
}

async function exercise(browser, asset) {
    const parts = quickviewParts(readAsset(path.join(assets, asset), 'utf8'));
    const page = await browser.newPage();
    try {
        await page.setContent('<button class="linkabso" data-href="https://fixture.invalid/A">A</button><button class="linkabso" data-href="https://fixture.invalid/B">B</button>' +
            '<div class="modal-cross" hidden><div class="modal-body"></div></div>' +
            '<div class="eg-dropdown"><button>Inside</button></div><div class="eg-dropdown cat-facet"></div>');
        await page.addScriptTag({ path: path.join(assets, 'jquery-3.7.1.min.js') });
        await page.evaluate(() => {
            window.lozad = () => ({ observe() {} });
            window.MagicZoom = { start() {} };
            window.seen = { local: 0, unrelated: 0, product: null };
            jQuery(document).on('mouseup.unrelated', () => { seen.unrelated++; });
            jQuery.fn.modal = function () { return this.prop('hidden', false); };
            window.eGuardians = {
                events: { selectVariant() { seen.local++; } },
                apiservice: { get(product, params, callback) {
                    seen.product = new URL(product, 'https://fixture.invalid/').pathname;
                    callback('<button data-eg-event="click" data-eg-handler="selectVariant">Size</button>');
                } }
            };
        });
        await page.addScriptTag({content: 'window.O46Core={};' + fs.readFileSync(path.join(assets, 'zoom-loader.js'), 'utf8')});
        await page.addScriptTag({ content: 'eGuardians.events.observeLazyImages = ((' + parts.owner + ') => (' + parts.lazy + '))(eGuardians);' +
            'eGuardians.events.bindEvents = ((' + parts.owner + ') => (' + parts.bind + '))(eGuardians);' +
            parts.register + ';' + parts.open + ';eGuardians.events.bindEvents();' });
        for (let i = 1; i <= 20; i++) {
            const index = i <= 2 ? 0 : i % 2;
            await page.locator('.linkabso').nth(index).click();
            await page.waitForFunction(() => {
                const button = document.querySelector('.modal-cross [data-eg-event]');
                return button && jQuery._data(button, 'events')?.click?.length === 1;
            });
            await page.locator('.modal-cross button').click();
            const result = await page.evaluate(() => {
                const $ = jQuery;
                $('.modal-cross').prop('hidden', true);
                $('.eg-dropdown').addClass('isOpen');
                const unrelated = seen.unrelated;
                $('.eg-dropdown button').trigger('mouseup');
                const inside = $('.eg-dropdown').first().hasClass('isOpen');
                $(document).triggerHandler('mouseup');
                return { inside, outside: !$('.eg-dropdown').first().hasClass('isOpen'),
                    facet: $('.cat-facet').hasClass('isOpen'), unrelated: seen.unrelated - unrelated,
                    handlers: $._data(document, 'events').mouseup.length, product: seen.product, local: seen.local };
            });
            assert.deepEqual(result, { inside: true, outside: true, facet: true, unrelated: 2,
                handlers: 2, product: index ? '/B' : '/A', local: i }, asset + ' opening ' + i);
        }
    } finally { await page.close(); }
}

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        for (const name of ['cat', 'item', 'main', 'vue']) {
            for (const suffix of ['.js', '-020726.min.js']) {
                await exercise(browser, name + suffix);
                console.log(name + suffix + ': 20/20 PASS');
            }
        }
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
