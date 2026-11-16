// Isolated before/after autocomplete DOM-work comparison. Uses real jQuery and
// search/helper functions; all response data are local fixtures, never shop calls.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const reportFile = process.argv[2];
const includeMin = process.argv.includes('--min');
const baseline = 'cccb7bf301422f4ec4f0705b25868f834e15ded0';
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const before = file => cp.execFileSync('git', ['show', baseline + ':' + file], { cwd: root, encoding: 'utf8', maxBuffer: 4e6 });
function method(source, name) {
    const found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.property?.name === name) {
            const value = node.right.type === 'LogicalExpression' ? node.right.right : node.right;
            if (value.type === 'FunctionExpression') found.push(source.slice(value.start, value.end));
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(found.length, 1, 'One actual ' + name + ' implementation');
    return found[0];
}
const versions = [
    { name: 'before', search: before('resources/js/search.js'), core: before('resources/js/core.js') },
    { name: 'source', search: read('resources/js/search.js'), core: read('resources/js/core.js') }
];
if (includeMin) versions.push({ name: 'min', search: read('resources/js/core.min.js'), core: read('resources/js/core.min.js') });
const rows = [];
async function scenario(browser, version, lang) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.abort());
    try {
        await page.setContent(`<html lang="${lang}"><div data-eg-search><div class="search-wrap"><form action="https://fixture.invalid/${lang}/search/"><input data-eg-livesearch class="input-ff-search"></form></div><div class="related-search">Related</div></div><button id="outside">Outside</button></html>`);
        await page.addScriptTag({ content: read('resources/js/jquery-3.7.1.min.js') });
        await page.evaluate(({ search, helper, lang }) => {
            window.activeLang = lang;
            window.messageServiceTranslations = { searchexample: 'Suggestions ' + lang };
            window.pending = [];
            window.eGuardians = {
                events: {}, helper: { autoCompleteReg: eval('(' + helper + ')') },
                apiservice: { get: (url, params, callback) => pending.push({ url, params, callback }) }
            };
            eGuardians.events.initLiveSearch = eval('(' + search + ')');
            const input = document.querySelector('input');
            eGuardians.events.initLiveSearch(input);
            eGuardians.events.initLiveSearch(input);
            window.counts = {};
            const count = key => counts[key] = (counts[key] || 0) + 1;
            const original = window.$;
            window.$ = new Proxy(original, { apply(target, receiver, args) {
                if (typeof args[0] === 'string') count('$:' + args[0]);
                return Reflect.apply(target, receiver, args);
            } });
            for (const name of ['find', 'closest', 'get']) {
                const fn = original.fn[name];
                original.fn[name] = function (...args) {
                    count(name + ':' + String(args[0]));
                    return fn.apply(this, args);
                };
            }
            document.addEventListener('click', event => {
                if (event.target.closest('a')) event.preventDefault();
            });
            window.snapshot = () => ({
                html: document.querySelector('[data-eg-search]').outerHTML,
                value: input.value,
                requests: pending.map(({ url, params }) => ({ url, params })),
                inputHandlers: $._data(input, 'events').input.length,
                keydownHandlers: $._data(input, 'events').keydown.length
            });
        }, { search: method(version.search, 'initLiveSearch'), helper: method(version.core, 'autoCompleteReg'), lang });
        await page.locator('input').fill('alpha');
        await page.waitForFunction(() => pending.length === 1);
        const result = await page.evaluate(() => {
            const input = document.querySelector('input');
            const operations = {};
            counts = {};
            pending[0].callback({ data: {
                suggestion: [null, '', 0, 'alpha & "quoted"', 'αlpha', 'ALPHA', 'alpha +', 'alpha ignored'].map(label => ({ label })),
                item: [null, '', 0, 'alpha <img src=x onerror=bad()>', 'ALPHA beta'].map((label, i) => ({ label, url: '/product/' + i, image: '' }))
            } });
            operations.render = counts;
            const rendered = snapshot();
            counts = {};
            for (const keyCode of [65, 66, 67, 32, 8, 46, 9, 16, 37, 39, 27, 229]) {
                $(input).trigger($.Event('keydown', { keyCode }));
            }
            operations.ordinaryKeys = counts;
            const ordinary = snapshot();
            counts = {};
            $(document).trigger($.Event('mouseup', { target: document.getElementById('outside') }));
            operations.outside = counts;
            const hidden = snapshot();
            counts = {};
            $(input).trigger('focus');
            operations.focus = counts;
            const shown = snapshot();
            const keys = [];
            for (const keyCode of [40, 40, 40, 40, 38, 13]) {
                const event = $.Event('keydown', { keyCode });
                $(input).trigger(event);
                keys.push({ keyCode, prevented: event.isDefaultPrevented(), ...snapshot() });
            }
            return { rendered, ordinary, hidden, shown, keys, operations };
        });
        assert.equal(result.rendered.inputHandlers, 1);
        assert.equal(result.rendered.keydownHandlers, 1);
        assert.equal(result.rendered.requests.length, 1);
        assert.equal(result.rendered.requests[0].url, '/rest/' + (['it', 'es'].includes(lang) ? 'guardiansbasicb2b' : 'io') + '/item/search/autocomplete/');
        assert.equal(result.ordinary.value, result.rendered.value);
        assert.equal(result.ordinary.html, result.rendered.html);
        assert.deepEqual(errors, []);
        return { version: version.name, lang, ...result, errors };
    } finally { await page.close(); }
}
(async () => {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        for (const lang of ['de', 'en', 'fr', 'it', 'es']) {
            const original = await scenario(browser, versions[0], lang);
            rows.push(original);
            for (const version of versions.slice(1)) {
                const current = await scenario(browser, version, lang);
                for (const stage of ['rendered', 'ordinary', 'hidden', 'shown', 'keys']) assert.deepEqual(current[stage], original[stage], lang + ' ' + version.name + ' ' + stage);
                assert.equal(original.operations.ordinaryKeys['find:.list-autocomplete li'], 12);
                assert.equal(original.operations.ordinaryKeys['get:undefined'], 12);
                assert.equal(current.operations.ordinaryKeys['find:.list-autocomplete li'] || 0, 0);
                assert.equal(current.operations.ordinaryKeys['get:undefined'] || 0, 0);
                assert.equal(original.operations.outside['$:.row-search-wrap'], 2);
                assert.equal(current.operations.outside['$:.row-search-wrap'], 1);
                assert.equal(original.operations.focus['$:.row-search-wrap'], 2);
                assert.equal(current.operations.focus['$:.row-search-wrap'], 1);
                assert.equal(original.operations.render['$:[data-eg-search]'], 2);
                assert.equal(current.operations.render['$:[data-eg-search]'], 1);
                rows.push(current);
            }
        }
        const report = { status: 'PASS', baseline, scenarios: rows.length, comparisons: rows.length - 5, rows };
        if (reportFile) fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
        console.log(JSON.stringify({ status: report.status, scenarios: report.scenarios, comparisons: report.comparisons }));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
