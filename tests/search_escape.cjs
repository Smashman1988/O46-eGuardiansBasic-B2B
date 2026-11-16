// Actual shared source/minified handlers in isolated Chromium, with real jQuery.
// Controlled debounce/response scheduling; no shop requests or native acceptance claim.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const assert = require('node:assert/strict'), acorn = require('acorn');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const baseline = process.argv.find(arg => arg.startsWith('--baseline='))?.slice(11);
const output = process.argv.slice(2).find(arg => !arg.startsWith('--'));
const read = file => baseline ? cp.execFileSync('git', ['show', baseline + ':' + file],
    { cwd: root, encoding: 'utf8', maxBuffer: 4e6 }) : fs.readFileSync(path.join(root, file), 'utf8');
function method(source, name) {
    const found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.property?.name === name) {
            const value = node.right.type === 'LogicalExpression' ? node.right.right : node.right;
            if (value.type === 'FunctionExpression') found.push(source.slice(value.start, value.end));
        }
        for (const child of Object.values(node)) {
            if (Array.isArray(child)) child.forEach(visit); else if (child?.type) visit(child);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(found.length, 1, name);
    return found[0];
}
const versions = ['source', 'min'].map(name => ({ name,
    search: method(read('resources/js/' + (name === 'source' ? 'search.js' : 'core.min.js')), 'initLiveSearch'),
    helper: method(read('resources/js/core' + (name === 'source' ? '.js' : '.min.js')), 'autoCompleteReg')
}));
const report = { mode: 'ISOLATED_CHROMIUM_CONTROLLED_RESPONSES', baseline: baseline || null, rows: [] };
async function scenario(browser, version, lang, mobile) {
    const page = await browser.newPage({ viewport: { width: mobile ? 390 : 1440, height: 850 }, hasTouch: mobile, isMobile: mobile });
    const errors = [], checks = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(5000);
    const check = (name, actual, expected) => { assert.deepEqual(actual, expected, name); checks.push(name); };
    try {
        await page.route('**/*', route => route.abort());
        await page.setContent(`<html lang="${lang}"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>
          <div data-eg-search><div class="search-wrap"><form action="https://fixture.invalid/${lang}/search/" method="get">
            <input id="header" name="query" data-eg-livesearch placeholder="Search"><button>Search</button>
          </form></div><div class="related-search">Related</div></div>
          <div class="searchbox-404"><form action="https://fixture.invalid/${lang}/search/">
            <input id="missing" name="query" data-eg-livesearch placeholder="Search 404"></form><div data-eg-search></div></div>
          <button id="outside">Modal control</button></body></html>`);
        await page.addScriptTag({ content: read('resources/js/jquery-3.7.1.min.js') });
        await page.evaluate(({ search, helper, lang }) => {
            window.activeLang = lang; window.messageServiceTranslations = { searchexample: 'Suggestions' };
            window.pending = []; window.timers = new Map(); let next = 0;
            window.setTimeout = (fn, delay) => { timers.set(++next, { fn, delay }); return next; };
            window.clearTimeout = id => timers.delete(id);
            window.flush = () => {
                const batch = [...timers.values()]; timers.clear();
                batch.forEach(timer => { if (timer.delay !== 400) throw Error('Changed debounce'); timer.fn(); });
                return batch.length;
            };
            window.eGuardians = { events: {}, helper: { autoCompleteReg: eval('(' + helper + ')') },
                apiservice: { get: (url, params, callback) => pending.push({ url, params, callback }) } };
            eGuardians.events.initLiveSearch = eval('(' + search + ')');
            for (const id of ['header', 'missing']) {
                const input = document.getElementById(id);
                eGuardians.events.initLiveSearch(input); eGuardians.events.initLiveSearch(input);
            }
            window.navigation = []; window.escapes = [];
            document.addEventListener('click', event => {
                const link = event.target.closest('a');
                if (link) { navigation.push({ kind: 'link', href: link.getAttribute('href') }); event.preventDefault(); }
            });
            document.addEventListener('submit', event => {
                navigation.push({ kind: 'form', action: event.target.action, value: event.target.query.value });
                event.preventDefault();
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' || event.keyCode === 27) escapes.push({ target: event.target.id, prevented: event.defaultPrevented });
            });
            window.reply = (index, label = 'alpha', status = 200) => pending[index].callback({ data: {
                item: [{ label: label + ' first', url: '/product/one' }, { label: label + ' second', url: '/product/two' }],
                suggestion: [{ label: label + ' suggestion' }]
            } }, status);
            window.state = (id = 'header') => {
                const input = document.getElementById(id), scope = input.closest('[data-eg-search], .searchbox-404');
                return { value: input.value, focused: document.activeElement === input,
                    row: scope.querySelectorAll('.row-search-wrap').length,
                    active: [...scope.querySelectorAll('.autocomplete-active')].map(item => item.textContent),
                    expanded: input.getAttribute('aria-expanded'), controls: input.getAttribute('aria-controls'),
                    descendant: input.getAttribute('aria-activedescendant'),
                    selected: [...scope.querySelectorAll('[aria-selected="true"]')].map(item => item.id),
                    loading: !!scope.querySelector('.search-loading') || scope.classList.contains('search-loading'),
                    requests: pending.length, scheduled: timers.size, navigation: navigation.length,
                    text: scope.querySelector('.row-search-wrap')?.textContent || '' };
            };
        }, { ...version, lang });
        const input = page.locator('#header');
        const enter = async query => { await input.fill(query); await page.evaluate(() => flush()); };
        const reply = () => page.evaluate(() => reply(pending.length - 1));
        const state = () => page.evaluate(() => state());
        if (!baseline) {
            await input.focus();
            await page.evaluate(() => $('.related-search').hide());
            const markup = await page.locator('body').innerHTML();
            await input.press('Escape');
            check('initially closed Escape leaves existing DOM unchanged', await page.locator('body').innerHTML(), markup);
        }
        await enter('alpha'); await reply();
        if (baseline) {
            await input.press('Escape');
            check('original open dropdown ignores Escape', (await state()).row, 1);
            await enter('pending'); await input.press('Escape');
            await page.evaluate(() => reply(pending.length - 1, 'late'));
            check('original late reply remains visible after Escape', (await state()).text.includes('late'), true);
            return;
        }
        let before = await state();
        check('open ARIA listbox contract', await page.evaluate(() => {
            const input = document.querySelector('#header'), list = document.getElementById(input.getAttribute('aria-controls'));
            return [input.getAttribute('role'), input.getAttribute('aria-autocomplete'), input.getAttribute('aria-expanded'),
                list?.getAttribute('role'), [...list.querySelectorAll('li')].every(x => x.getAttribute('role') === 'option' && x.getAttribute('aria-selected') === 'false')];
        }), ['combobox', 'list', 'true', 'listbox', true]);
        await input.press('ArrowDown');
        let selected = await state();
        check('selection has one matching active descendant', [selected.active, selected.selected], [['alpha first'], [selected.descendant]]);
        await input.press('Escape');
        let actual = await state();
        check('Escape closes, resets ARIA/selection, preserves focus/text and requests',
            [actual.row, actual.active, actual.selected, actual.expanded, actual.controls, actual.descendant, actual.focused, actual.value, actual.requests, actual.scheduled, actual.navigation, actual.loading],
            [0, [], [], 'false', null, null, true, selected.value, before.requests, 0, 0, false]);
        before = actual; await input.press('Escape');
        check('closed Escape is idempotent', await state(), before);
        await input.blur(); await input.focus();
        check('refocusing cannot reopen discarded results', (await state()).row, 0);
        await input.fill('debounced'); await input.press('Escape');
        check('Escape cancels unissued debounce without a request', await page.evaluate(() => [flush(), pending.length]), [0, before.requests]);
        await enter('pending'); await input.press('Escape');
        await page.evaluate(() => reply(pending.length - 1, 'late'));
        actual = await state();
        check('Escape invalidates a pending reply', [actual.row, actual.expanded, actual.loading, actual.value], [0, 'false', false, 'pending']);
        await input.fill('pending!'); await input.fill('pending');
        await page.evaluate(() => reply(pending.length - 1, 'old identical query'));
        check('same-query old reply stays rejected before new debounce', (await state()).row, 0);
        await page.evaluate(() => flush()); await reply();
        check('new input reopens normally', [(await state()).row, (await state()).expanded], [1, 'true']);
        await input.press('ArrowDown'); check('reopen starts selection at first item', (await state()).active, ['alpha first']);
        await input.press('ArrowDown'); check('ArrowDown advances', (await state()).active, ['alpha second']);
        await input.press('ArrowDown'); check('ArrowDown wraps', (await state()).active, ['alpha first']);
        await input.press('ArrowUp'); check('ArrowUp wraps', (await state()).active, ['alpha second']);
        await input.press('Enter');
        check('Enter retains existing language-specific navigation', await page.evaluate(() => navigation.at(-1)),
            ['it', 'es'].includes(lang) ? { kind: 'link', href: '/product/two' } :
                { kind: 'form', action: `https://fixture.invalid/${lang}/search/`, value: 'alpha second' });
        await input.press('Escape'); await enter('pointer'); await reply();
        const link = page.locator('.list-autocomplete a').first();
        if (mobile) await link.tap(); else await link.click();
        check(mobile ? 'touch selection' : 'mouse selection', await page.evaluate(() => navigation.at(-1)), { kind: 'link', href: '/product/one' });
        const suggestion = page.locator('.list-autocomplete-suggestion a').first();
        if (mobile) await suggestion.tap(); else await suggestion.click();
        check('suggestion link remains intact', await page.evaluate(() => navigation.at(-1)),
            { kind: 'link', href: `https://fixture.invalid/${lang}/search/?query=alpha%20suggestion` });
        await input.focus(); await input.press('Escape');
        const requestCount = (await state()).requests;
        await input.fill('fast'); await input.fill('faster'); await input.fill('fastest');
        check('rapid input retains one debounce', (await state()).scheduled, 1);
        await page.evaluate(() => flush());
        check('rapid input issues only final query', await page.evaluate(() => [pending.length, pending.at(-1).params.query]), [requestCount + 1, 'fastest']);
        await reply(); await input.press('ArrowDown');
        await page.locator('#outside').click();
        check('outside dismissal updates expanded state', (await state()).expanded, 'false');
        await input.focus(); check('focus reopens existing results with ARIA', (await state()).expanded, 'true');
        await page.evaluate(() => document.getElementById('header').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })));
        check('key-only Escape (no legacy keyCode)', (await state()).row, 0);
        await enter('legacy'); await reply();
        await page.evaluate(() => $('#header').trigger($.Event('keydown', { keyCode: 27 })));
        check('legacy keyCode Escape', (await state()).row, 0);
        await input.fill(''); await page.evaluate(() => flush());
        check('empty query does not request suggestions', (await state()).requests, requestCount + 2);
        await enter('suggestions only');
        await page.evaluate(() => pending.at(-1).callback({ data: { item: [], suggestion: [{ label: 'completion' }] } }, 200));
        check('suggestion-only popup has expanded ARIA', [(await state()).row, (await state()).expanded], [1, 'true']);
        await input.press('Escape');
        check('Escape closes suggestion-only popup', [(await state()).row, (await state()).expanded], [0, 'false']);
        await enter('visible'); await reply(); await enter('still pending');
        check('pending query retains previous visible results', [(await state()).row, (await state()).loading], [1, true]);
        await input.press('Escape');
        await page.evaluate(() => reply(pending.length - 1, 'late visible'));
        check('Escape rejects late reply with older results still open', [(await state()).row, (await state()).loading, (await state()).expanded], [0, false, 'false']);
        const missing = page.locator('#missing');
        await missing.fill('second'); await page.evaluate(() => flush());
        await input.focus();
        const pendingMarkup = await page.locator('body').innerHTML();
        await input.press('Escape');
        check('closed input Escape leaves another input pending state unchanged', await page.locator('body').innerHTML(), pendingMarkup);
        await missing.focus(); await missing.press('Escape');
        await page.evaluate(() => reply(pending.length - 1));
        check('404 pending Escape rejects reply and clears shared loading classes', await page.evaluate(() =>
            [document.querySelectorAll('.row-search-wrap, .search-loading, .search-active-results').length, state('missing').expanded]), [0, 'false']);
        await missing.fill('second again'); await page.evaluate(() => { flush(); reply(pending.length - 1); });
        const second = await page.evaluate(() => state('missing'));
        check('404 input has independent list identity', second.controls !== selected.controls, true);
        await input.focus(); await input.press('Escape');
        check('closed header Escape leaves another input dropdown unchanged', await page.evaluate(() => {
            const result = state('missing'); delete result.focused; return result;
        }), (({ focused, ...rest }) => rest)(second));
        await missing.focus(); await missing.press('ArrowDown'); await missing.press('Escape');
        check('404 input Escape preserves focus/text and clears ARIA', await page.evaluate(() => {
            const s = state('missing'); return [s.row, s.value, s.focused, s.expanded, s.descendant];
        }), [0, 'alpha first', true, 'false', null]);
        check('404 popup Escape clears shared result classes', await page.locator('.search-active-results, .search-loading').count(), 0);
        await page.locator('#outside').focus(); await page.locator('#outside').press('Escape');
        check('Escape bubbles without preventDefault, including outside input', await page.evaluate(() =>
            [escapes.length > 5, escapes.every(e => !e.prevented), escapes.at(-1).target]), [true, true, 'outside']);
        check('language API contract unchanged', await page.evaluate(() => pending.every(request =>
            request.url === '/rest/' + (['it', 'es'].includes(activeLang) ? 'guardiansbasicb2b' : 'io') + '/item/search/autocomplete/' &&
            JSON.stringify(request.params.types) === JSON.stringify(['it', 'es'].includes(activeLang) ? ['item', 'suggestion'] : ['item', 'category', 'suggestion']))), true);
        check('idempotent initialization keeps one keyboard/input listener', await page.evaluate(() => ['header', 'missing'].map(id => {
            const events = $._data(document.getElementById(id), 'events'); return [events.keydown.length, events.input.length];
        })), [[1, 1], [1, 1]]);
        check('no JavaScript exceptions', errors, []);
    } finally {
        report.rows.push({ version: version.name, lang, viewport: mobile ? 'mobile-touch' : 'desktop-mouse', checks, errors });
        await page.close();
    }
}
(async () => {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        for (const version of versions) for (const lang of ['de', 'en', 'fr', 'it', 'es']) {
            for (const mobile of baseline ? [false] : [false, true]) await scenario(browser, version, lang, mobile);
        }
        report.status = baseline ? 'REPRODUCED_MISSING_ESCAPE' : 'PASS';
    } catch (error) { report.status = 'FAIL'; report.failure = String(error); throw error; }
    finally {
        await browser.close(); report.browserClosed = true;
        if (output) fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
    }
    console.log(JSON.stringify({ status: report.status, scenarios: report.rows.length, checks: report.rows.reduce((sum, row) => sum + row.checks.length, 0) }));
})().catch(error => { console.error(error); process.exitCode = 1; });
