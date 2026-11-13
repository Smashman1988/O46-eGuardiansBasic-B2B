const { readAsset } = require('./theme_assets.cjs');
// node tests/seo_metadata.cjs <report.json> [<seo-php-report.json> ...] [--browser] [--asset=<js-file>]
// Executes the actual category metadata IIFE with a minimal DOM/history fixture.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assetOption = process.argv.find(arg => arg.startsWith('--asset='));
const asset = assetOption ? path.resolve(assetOption.slice('--asset='.length)) : path.join(__dirname, '../resources/js/cat.js');
const source = readAsset(asset, 'utf8');
let script;
if (assetOption) {
    // Parse the complete shipped asset, then execute its actual metadata IIFE.
    const acorn = require('acorn');
    const matches = [];
    function walk(node) {
        if (!node || typeof node !== 'object') return;
        if (node.type === 'CallExpression' && ['FunctionExpression','ArrowFunctionExpression'].includes(node.callee.type)) {
            const text = source.slice(node.callee.start, node.callee.end);
            if (text.includes('twitter:description') && text.includes('popstate') && text.includes('document.title')) matches.push(node);
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(walk);
            else if (value && typeof value === 'object') walk(value);
        }
    }
    walk(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(matches.length, 1, 'Expected exactly one metadata IIFE in shipped asset');
    script = '(' + source.slice(matches[0].start, matches[0].end) + ');';
} else {
    const start = source.indexOf('// title and metadaten pages update');
    assert.ok(start >= 0, 'Metadata section must exist');
    const end = source.indexOf('\n})();', start);
    assert.ok(end > start, 'Metadata IIFE must end');
    script = source.slice(start, end + '\n})();'.length);
}
const report = { cases: [], failures: [], browserCases: [], runtime: 'Node VM with DOM/history fixture; optional local Chrome; no live deployment' };
report.asset = asset;
report.assetSha256 = require('node:crypto').createHash('sha256').update(source).digest('hex');
const browserFixtures = [];
const baseUrl = 'https://b2b.example.test/content/';
const title = 'Mode – Sale';
const description = 'Marken – Angebote';
const state = (overrides = {}) => ({ requestedPage: 2, currentPage: 2, pageMax: 53, hasList: true,
    ambiguous: false, invalidInput: false, outOfRange: false, empty: false, valid: true, noindex: false, ...overrides });

function fixture({ url = baseUrl + '?page=2', pagination = state(), language = 'de',
    initialTitle = title + ' – Page 2', initialDescription = description + ' – Page 2', raw,
    canonical = baseUrl + '?page=2', robots = 'INDEX,FOLLOW' } = {}) {
    let current = new URL(url);
    const tags = new Map();
    const tag = (selector, value) => tags.set(selector, { value,
        getAttribute() { return this.value; }, setAttribute(name, content) { this.value = content; } });
    if (pagination !== undefined && pagination !== null) tag('meta[name="o46-pagination"]', raw ?? JSON.stringify(pagination));
    if (initialDescription !== null) tag('meta[name="description"]', initialDescription);
    tag('meta[property="og:title"]', initialTitle);
    tag('meta[property="og:description"]', initialDescription ?? 'Existing social description');
    tag('meta[name="twitter:title"]', initialTitle);
    tag('meta[name="twitter:description"]', initialDescription ?? 'Existing social description');
    tag('meta[name="robots"]', robots);
    tag('link[rel="canonical"]', canonical);
    const document = { title: initialTitle, documentElement: { lang: language }, querySelector: selector => tags.get(selector) || null };
    const events = {};
    const history = {};
    for (const method of ['pushState', 'replaceState']) history[method] = (data, text, next) => { if (next != null) current = new URL(next, current); };
    const on = (name, callback) => { events[name] = callback; };
    const window = { location: { get href() { return current.href; } }, addEventListener: on, jQuery: () => ({ on }) };
    vm.runInNewContext(script, { document, window, history, URL, URLSearchParams, setTimeout: callback => callback() }, { timeout: 1000 });
    return { document, tags, get(selector) { return tags.get(selector)?.value; },
        go(next, method = 'pushState') { history[method](null, '', next); },
        append(next, content, items) {
            events['append.infiniteScroll']?.({}, { querySelector: () => ({ content }) }, next, items);
        },
        back(next) { current = new URL(next, current); events.popstate?.(); } };
}
function test(name, run) {
    try { run(); report.cases.push(name); }
    catch (error) { report.failures.push({ name, error: error.message }); }
}
function metadata(f, expectedTitle, expectedDescription) {
    assert.equal(f.document.title, expectedTitle);
    assert.equal(f.get('meta[name="description"]'), expectedDescription);
    assert.equal(f.get('meta[property="og:title"]'), expectedTitle);
    assert.equal(f.get('meta[name="twitter:title"]'), expectedTitle);
    if (expectedDescription !== undefined) {
        assert.equal(f.get('meta[property="og:description"]'), expectedDescription);
        assert.equal(f.get('meta[name="twitter:description"]'), expectedDescription);
    }
}
for (const [language, label] of Object.entries({ de: 'Seite', en: 'Page', fr: 'Page', it: 'Pagina', es: 'Página' })) {
    for (const page of [1, 2, 53]) test(language + '/valid/' + page, () => {
        const suffix = page > 1 ? ' – Page ' + page : '';
        const f = fixture({ language, url: baseUrl + '?page=' + page, pagination: state({ requestedPage: page, currentPage: page }),
            initialTitle: title + suffix, initialDescription: description + suffix });
        const expected = page > 1 ? ' – ' + label + ' ' + page : '';
        metadata(f, title + expected, description + expected);
    });
    for (const value of ['54', '999', '0', '-1', 'abc', '', '2abc', '2.5', '02', '1e2', '9007199254740992']) test(language + '/invalid/' + value, () => {
        const f = fixture({ language, url: baseUrl + '?page=' + value,
            pagination: state({ currentPage: 1, valid: false }), initialTitle: title, initialDescription: description });
        metadata(f, title, description);
        assert.equal(f.get('meta[name="robots"]'), 'INDEX,FOLLOW');
        assert.equal(f.get('link[rel="canonical"]'), baseUrl + '?page=2');
    });
    test(language + '/history-and-popstate', () => {
        const f = fixture({ language });
        for (const [next, method, page] of [['?page=3','pushState',3],['?page=53','replaceState',53],['?page=54','pushState',1],['?page=2abc','replaceState',1],['?page=1','pushState',1]]) {
            f.go(next, method);
            const suffix = page > 1 ? ' – ' + label + ' ' + page : '';
            metadata(f, title + suffix, description + suffix);
        }
        f.back('?page=2');
        metadata(f, title + ' – ' + label + ' 2', description + ' – ' + label + ' 2');
    });
}
for (const [name, pagination] of Object.entries({ noList: state({ hasList: false, valid: false, currentPage: 1 }),
    ambiguous: state({ ambiguous: true, valid: false, currentPage: 1 }),
    unknown: state({ pageMax: null, valid: false, currentPage: 1 }),
    empty: state({ pageMax: 0, empty: true, valid: false, currentPage: 1 }),
    effectiveMismatch: state({ valid: false, currentPage: 1 }) })) test('state/' + name, () => {
    const f = fixture({ pagination, initialTitle: title, initialDescription: description });
    metadata(f, title, description);
});
test('missing-server-state-preserves-existing-numbering', () => {
    const f = fixture({ pagination: null });
    metadata(f, title + ' – Page 2', description + ' – Page 2');
});
test('malformed-server-state-preserves-server-metadata', () => {
    const f = fixture({ raw: '{broken', initialTitle: title, initialDescription: description });
    metadata(f, title, description);
});
test('unrepresentable-client-bound-preserves-server-numbering', () => {
    const f = fixture({ pagination: state({ pageMax: 9007199254740992 }) });
    metadata(f, title + ' – Page 2', description + ' – Page 2');
});
test('duplicate-page-is-not-a-valid-number', () => {
    const f = fixture({ url: baseUrl + '?page=2&page=3', pagination: state({ valid: false, currentPage: 1 }), initialTitle: title, initialDescription: description });
    metadata(f, title, description);
});
test('no-description-never-produces-undefined-description', () => {
    const f = fixture({ initialDescription: null });
    assert.equal(f.get('meta[name="description"]'), undefined);
    assert.equal(f.get('meta[property="og:description"]'), 'Existing social description');
});
test('forced-canonical-and-restrictive-robots-remain-untouched', () => {
    const f = fixture({ canonical: 'https://external.example/special/', robots: 'NOINDEX,NOFOLLOW' });
    metadata(f, title + ' – Seite 2', description + ' – Seite 2');
    assert.equal(f.get('link[rel="canonical"]'), 'https://external.example/special/');
    assert.equal(f.get('meta[name="robots"]'), 'NOINDEX,NOFOLLOW');
});
test('unconfirmed-route-or-filter-does-not-reuse-old-bounds', () => {
    const f = fixture();
    f.go('?page=2&facets=7');
    metadata(f, title + ' – Seite 2', description + ' – Seite 2');
    f.go('/other/?page=53');
    metadata(f, title + ' – Seite 2', description + ' – Seite 2');
});
test('quickview-cleanup-keeps-infinite-scroll-numbering', () => {
    const f = fixture({ url: baseUrl + '?page=2&quickViewItem=true' });
    f.go('?page=3');
    metadata(f, title + ' – Seite 3', description + ' – Seite 3');
});
test('initial-invalid-page-can-return-to-confirmed-page', () => {
    const f = fixture({ url: baseUrl + '?page=999', pagination: state({ requestedPage: 999, currentPage: 1, valid: false }), initialTitle: title, initialDescription: description });
    f.go('?page=2');
    metadata(f, title + ' – Seite 2', description + ' – Seite 2');
    f.back('?page=999');
    metadata(f, title, description);
});
for (const [name, url, server, items, accepted] of [
    ['matching', '?page=54&quickViewItem=true', { valid:true, currentPage:54 }, [{}], true],
    ['empty', '?page=54', { valid:true, currentPage:54 }, [], false],
    ['unconfirmed', '?page=54', { valid:false, currentPage:54 }, [{}], false],
    ['clamped', '?page=54', { valid:true, currentPage:1 }, [{}], false],
    ['filter', '?page=54&facets=7', { valid:true, currentPage:54 }, [{}], false],
    ['route', '/other/?page=54', { valid:true, currentPage:54 }, [{}], false],
    ['invalid-json', '?page=54', undefined, [{}], false],
]) test('append/' + name, () => {
    const f = fixture({});
    f.go('?page=54');
    f.append(url, JSON.stringify(server), items);
    const suffix = accepted ? ' – Seite 54' : '';
    metadata(f, title + suffix, description + suffix);
    f.go('?page=55');
    metadata(f, title, description);
    f.back('?page=54');
    metadata(f, title + suffix, description + suffix);
});
for (const reportFile of process.argv.slice(3).filter(arg => !arg.startsWith('--'))) {
    const php = JSON.parse(readAsset(reportFile, 'utf8'));
    for (const [name, value] of Object.entries(php.cases).filter(([name]) => name.startsWith('client-pagination/'))) {
        browserFixtures.push({ name: 'browser-' + php.twig + '/' + name, value, tail: php.cases['documents/1654/1658/70'] });
        test('php-' + php.twig + '/' + name, () => {
            const page = name.endsWith('-abc') ? 'abc' : (name.endsWith('-999') ? '999' : (name.endsWith('-1') ? '1' : '2'));
            const f = fixture({ url: baseUrl + '?page=' + page, pagination: value.pagination,
                initialTitle: value.title, initialDescription: value.description, canonical: value.canonical, robots: value.robots });
            const baseTitle = value.title.replace(/ – (?:Seite|Page|Pagina|Página) [1-9][0-9]*$/, '');
            const baseDescription = value.description.replace(/ – (?:Seite|Page|Pagina|Página) [1-9][0-9]*$/, '');
            const suffix = value.pagination.valid && value.pagination.currentPage > 1 ? ' – Seite ' + page : '';
            metadata(f, baseTitle + suffix, baseDescription + suffix);
            assert.equal(f.get('meta[name="robots"]'), value.robots);
            assert.equal(f.get('link[rel="canonical"]'), value.canonical);
        });
    }
}
async function browserTests() {
    const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
    const browser = await chromium.launch({ headless: true, ...(process.env.O46_BROWSER_EXECUTABLE ? { executablePath: process.env.O46_BROWSER_EXECUTABLE } : {}) });
    const escaped = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    try {
        for (const { name, value, tail } of browserFixtures) {
            const context = await browser.newContext();
            try {
                const page = await context.newPage();
                const pageErrors = [];
                page.on('pageerror', error => pageErrors.push(error.message));
                const head = `<meta name="o46-pagination" content="${escaped(JSON.stringify(value.pagination))}">`
                    + `<title>${escaped(value.title)}</title><meta name="description" content="${escaped(value.description)}">`
                    + `<meta name="robots" content="${escaped(value.robots)}"><link rel="canonical" href="${escaped(value.canonical)}">`;
                // Every request is fulfilled locally or rejected; never contact a shop.
                await page.route('**/*', route => route.request().url().startsWith(baseUrl)
                    ? route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<!doctype html><html lang="de"><head><meta charset="utf-8">' + head + '</head><body><div class="category-product-list"></div></body></html>' })
                    : route.abort());
                const number = name.endsWith('-abc') ? 'abc' : (name.endsWith('-999') ? '999' : (name.endsWith('-1') ? '1' : '2'));
                await page.goto(baseUrl + '?page=' + number);
                if (name.endsWith('content-single-2')) await page.addScriptTag({ path: path.join(__dirname,'../resources/js/jquery-3.7.1.min.js') });
                await page.addScriptTag({ content: script });
                const actual = await page.evaluate(() => ({ title: document.title,
                    description: document.querySelector('meta[name="description"]').content,
                    robots: document.querySelector('meta[name="robots"]').content,
                    canonical: document.querySelector('link[rel="canonical"]').getAttribute('href') }));
                const strip = text => value.pagination.valid && value.pagination.currentPage > 1 ? text.replace(/ – (?:Seite|Page|Pagina|Página) [1-9][0-9]*$/, '') : text;
                const suffix = value.pagination.valid && value.pagination.currentPage > 1 ? ' – Seite ' + number : '';
                assert.deepEqual(actual, { title: strip(value.title) + suffix, description: strip(value.description) + suffix, robots: value.robots, canonical: value.canonical });
                if (name.endsWith('content-single-2')) {
                    for (const [next, suffix] of [[3,' – Seite 3'],[999,''],[2,' – Seite 2']]) {
                        await page.evaluate(number => history.pushState(null, '', '?page=' + number), next);
                        await page.waitForFunction(expected => document.title === expected, strip(value.title) + suffix);
                        assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), strip(value.description) + suffix);
                    }
                    if (tail) {
                        // Begin with a bound of 69 in this fixture and append a separately
                        // confirmed page beyond it, using the actual jQuery event signature.
                        await page.evaluate(state => {
                            const payload = document.implementation.createHTMLDocument();
                            const meta = payload.createElement('meta');
                            meta.name = 'o46-pagination';
                            meta.content = JSON.stringify(state);
                            payload.head.append(meta);
                            const path = '?page=' + state.currentPage;
                            window.jQuery('.category-product-list').trigger('append.infiniteScroll', [payload,path+'&quickViewItem=true',[document.createElement('article')]]);
                            history.pushState(null,'',path);
                        }, tail);
                        await page.waitForFunction(expected => document.title === expected, strip(value.title) + ' – Seite 70', {timeout:3000});
                        assert.equal(await page.locator('meta[name="description"]').getAttribute('content'), strip(value.description) + ' – Seite 70');
                    }
                }
                assert.deepEqual(pageErrors, []);
                report.browserCases.push(name);
            } catch (error) { report.failures.push({ name, error: error.message }); }
            finally { await context.close(); }
        }
    } finally { await browser.close(); }
}
(async () => {
    if (process.argv.includes('--browser')) await browserTests();
})().catch(error => report.failures.push({ name: 'browser-runtime', error: error.message })).finally(() => {
    fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ pass: report.cases.length, browserPass: report.browserCases.length, fail: report.failures.length, failures: report.failures }));
    process.exitCode = report.failures.length ? 1 : 0;
});
