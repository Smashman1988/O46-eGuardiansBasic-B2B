// Run after tests/asset_page_scope.php (pass its JSON path as argv[2]).
// A loopback HTTP server owns the simulated session. No live shop or credentials.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {chromium, expect} = require('@playwright/test');

const input = process.argv[2];
const {logout} = JSON.parse(fs.readFileSync(input, 'utf8'));
const evidence = {cases: [], pageErrors: []};
const traceFile = path.join(path.dirname(input), 'logout-browser.json');
const assets = new Map(['core.min.js', 'main.min.js', 'cat.min.js', 'item.min.js', 'jquery-3.7.1.min.js']
    .map(name => [name, fs.readFileSync(path.join('resources/js', name))]));
const routes = {
    '/': 'home', '/artikel/2351617_1453158/': 'product', '/alle-artikel/': 'category',
    '/search/': 'search', '/informationen/': 'content', '/konto/': 'account',
    '/konto/bestellungen/': 'account-linked', '/retoure/': 'orders', '/fachhandel/': 'hidden-category'
};
let origin, member, pending, responseBody, responseStatus, posts, requests, customerStatus;
const replyOK = {data: 200, events: {AfterAccountContactLogout: []}};
function reset(status = 200, body = replyOK) {
    member = true; pending = null; responseStatus = status; responseBody = body; posts = 0; requests = []; customerStatus = 200;
}
function html(lang, kind, prefix) {
    const bundle = {product: 'item', category: 'cat', search: 'cat'}[kind] || 'main';
    const personal = logout.roots[lang][kind].includes('data-eg-logout-home');
    const root = member ? logout.roots[lang][kind] : logout.roots[lang][kind].replace(' data-eg-private-member', '');
    return '<!doctype html>' + root + '<head><meta charset="utf-8">' +
        '<script>if(performance.getEntriesByType("navigation")[0]?.type==="back_forward")sessionStorage.setItem("historyDocument",location.pathname)</script>' + logout.history +
        '<script>addEventListener("pageshow",e=>{if(e.persisted)sessionStorage.setItem("restored",JSON.stringify({path:location.pathname,hidden:getComputedStyle(document.documentElement).display==="none"}))})</script>' +
        '<style>.modal{display:none}.modal.show{display:block}</style></head><body data-eg-shop-dialogs>' +
        '<button class="btn-login-open" data-eg-event="click" data-eg-handler="modalContent" data-eg-title="Account" data-eg-href="' + prefix + '/loginPreview/">Account</button>' +
        '<div class="modal dynamicModal" data-eg-dialog tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-title"></div><button data-dismiss="modal">X</button><div class="modal-body"></div></div></div></div>' +
        (personal && (member || kind === 'orders') ? '<main id="private-canary">Private fixture record</main>' : '') +
        '<script>window.messageServiceTranslations={0:"Rejected",successlogout:"Signed out"};window.activeLang="' + lang + '";</script>' +
        '<script src="/assets/jquery-3.7.1.min.js"></script><script src="/assets/core.min.js"></script><script src="/assets/' + bundle + '.min.js"></script>' +
        '<script>eGuardians.initialize();</script></body></html>';
}
const server = http.createServer((req, res) => {
    const u = new URL(req.url, origin);
    requests.push({method: req.method, url: u.pathname + u.search, member});
    if (u.pathname.startsWith('/assets/') && assets.has(path.basename(u.pathname))) {
        res.setHeader('Content-Type', 'application/javascript'); return res.end(assets.get(path.basename(u.pathname)));
    }
    const json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); };
    if (u.pathname.endsWith('/loginPreview/')) return json({data: logout.previews[member ? 'member' : 'guest']});
    if (u.pathname === '/rest/io/customer/') {
        res.statusCode = customerStatus;
        return json({data: customerStatus === 200 && member ? {id: 1} : null});
    }
    if (req.method === 'POST' && u.pathname === '/rest/io/customer/logout/') {
        posts++;
        pending = () => {
            if (responseStatus === 200 && responseBody.data === 200 && !responseBody.error) member = false;
            res.statusCode = responseStatus; json(responseBody);
        };
        return;
    }
    if (u.pathname === '/rest/io/session/') return json({data: {basket: {itemQuantity: 0}}});
    if (u.pathname === '/rest/io/basket/') return json({data: {itemQuantity: 0}});
    const prefix = u.pathname.match(/^\/(de|en|fr|it|es)(?=\/)/)?.[0] || '';
    const lang = prefix.slice(1) || 'de';
    const route = u.pathname.slice(prefix.length);
    if (route === '/login/') { res.setHeader('Content-Type', 'text/html'); return res.end('<h1>Guest login</h1>'); }
    const kind = routes[route];
    if (!kind) { res.writeHead(404); return res.end(); }
    const validGuestLink = kind === 'orders' && u.searchParams.get('orderAccessKey') === 'fixture-only';
    if (!member && !validGuestLink && logout.roots[lang][kind].includes('data-eg-logout-home')) {
        res.writeHead(302, {Location: prefix + '/login/'}); return res.end();
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', u.searchParams.has('fresh') ? 'private, no-store' : 'private, no-cache');
    res.end(html(lang, kind, prefix));
});
const logoutButton = '[data-eg-handler="logoutUser"]';
async function openPreview(page, signedIn) {
    await page.locator('.btn-login-open').click();
    const preview = page.locator('.dynamicModal');
    await expect(preview.locator(signedIn ? logoutButton : '#login-mail')).toBeVisible();
    if (!signedIn) {
        await expect(preview.locator(logoutButton)).toHaveCount(0);
        await expect(preview).not.toContainText('SessionFixture');
    }
}
async function send(page, double = false) {
    const before = page.url();
    const button = page.locator(logoutButton);
    if (double) {
        const box = await button.boundingBox();
        await page.mouse.dblclick(box.x + box.width / 2, box.y + box.height / 2);
    } else {
        await button.click();
    }
    await expect.poll(() => posts).toBe(1);
    if (double) {
        // A second independently bound control also reaches the real page handler.
        await page.evaluate(() => eGuardians.events.logoutUser(document.querySelector('[data-eg-handler="logoutUser"]')));
    }
    assert.equal(posts, 1);
    assert.equal(page.url(), before);
    assert.equal(member, true);
    await expect(page.locator('.alert-success')).toHaveCount(0);
    pending();
}
async function run() {
    reset();
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    origin = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({channel: 'chrome', ignoreDefaultArgs: ['--disable-back-forward-cache']});
    try {
        evidence.chrome = browser.version();
        async function check(name, fn, engine = browser) {
            reset();
            const ctx = await engine.newContext({serviceWorkers: 'block'});
            const page = await ctx.newPage();
            page.setDefaultTimeout(6000);
            const errors = [];
            page.on('pageerror', e => errors.push(e.message));
            const row = {name};
            try {
                await fn(page, row);
                assert.deepEqual(errors, []);
                row.result = 'PASS';
            } catch (e) {
                row.result = 'FAIL'; row.reason = e.message; console.error(name, e.message);
            } finally {
                row.posts = posts; row.requests = requests.filter(r => !r.url.startsWith('/assets/'));
                evidence.pageErrors.push(...errors); evidence.cases.push(row);
                await ctx.close();
            }
        }
        const samples = ['/', '/artikel/2351617_1453158/#bilder', '/alle-artikel/',
            '/alle-artikel/?facets=12%2C34&sorting=sorting.position_desc&page=2#liste',
            '/en/search/?query=linen+shirt', '/fr/alle-artikel/?facets=42', '/it/artikel/2351617_1453158/',
            '/es/search/?query=camisa%20azul', '/de/informationen/'];
        for (const url of samples) await check('Öffentliche URL ' + url, async (page, row) => {
            await page.goto(origin + url);
            await openPreview(page, true);
            await send(page, true);
            await expect.poll(() => requests.filter(r => r.url === url.split('#')[0] && !r.member).length).toBe(1);
            await page.waitForLoadState('load');
            assert.equal(page.url(), origin + url);
            await openPreview(page, false);
            assert.equal(posts, 1);
            row.destination = url; row.response = replyOK;
        });
        for (const lang of ['de','en','fr','it','es']) await check('Private Seite ' + lang, async (page, row) => {
            const prefix = lang === 'de' ? '' : '/' + lang;
            await page.goto(origin + prefix + '/konto/bestellungen/?returnUrl=https%3A%2F%2Fexample.invalid&templateType=home');
            await openPreview(page, true);
            await send(page);
            await page.waitForURL(origin + prefix + '/');
            await openPreview(page, false);
            await expect(page.locator('#private-canary')).toHaveCount(0);
            row.destination = prefix + '/';
        });
        await check('Abgelehnt, danach bewusster Wiederholungsversuch', async (page, row) => {
            responseStatus = 403; responseBody = {data: null, error: {message: 'Rejected'}};
            const url = origin + '/alle-artikel/?facets=19';
            await page.goto(url); await openPreview(page, true); await send(page, true);
            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-success')).toHaveCount(0);
            assert.equal(page.url(), url); assert.equal(member, true); assert.equal(posts, 1);
            await expect(page.locator(logoutButton)).toBeEnabled();
            responseStatus = 200; responseBody = replyOK;
            await page.locator(logoutButton).click();
            await expect.poll(() => posts).toBe(2);
            pending();
            await expect.poll(() => requests.some(r => r.url.includes('facets=19') && !r.member)).toBe(true);
            await openPreview(page, false);
            assert.equal(posts, 2);
            row.responses = [403, 200];
        });
        await check('Zurück auf bereits besuchte Bestellseite', async (page, row) => {
            await page.goto(origin + '/fr/konto/bestellungen/');
            await expect(page.locator('#private-canary')).toBeVisible();
            await page.goto(origin + '/fr/konto/');
            await openPreview(page, true); await send(page);
            await page.waitForURL(origin + '/fr/');
            await page.goBack({waitUntil: 'commit'});
            await expect.poll(() => requests.filter(r => !r.member && r.url === '/fr/').length).toBe(2);
            await page.waitForURL(origin + '/fr/');
            await openPreview(page, false);
            await expect(page.locator('#private-canary')).toHaveCount(0);
            row.restoration = await page.evaluate(() => JSON.parse(sessionStorage.getItem('restored')));
            assert.deepEqual(row.restoration, {path: '/fr/konto/bestellungen/', hidden: true});
            assert.ok(!requests.some(r => !r.member && r.url === '/fr/konto/bestellungen/'));
        });
        const noBfcache = await chromium.launch({channel:'chrome'});
        try {
            for (const [label, engine] of [['BFCache', browser], ['neues Dokument', noBfcache], ['ohne HTTP-Cache', noBfcache]]) {
                await check('Zurück auf persönlichen Link mit Gastschlüssel · ' + label, async (page, row) => {
                    const link = '/it/retoure/?orderAccessKey=fixture-only' + (label === 'ohne HTTP-Cache' ? '&fresh=1' : '');
                    await page.goto(origin + link);
                    await expect(page.locator('#private-canary')).toBeVisible();
                    await page.goto(origin + '/it/alle-artikel/');
                    await openPreview(page, true); await send(page);
                    await expect.poll(() => requests.some(r => !r.member && r.url === '/it/alle-artikel/')).toBe(true);
                    await page.waitForLoadState('load');
                    await page.goBack({waitUntil:'commit'});
                    await page.waitForURL(origin + '/it/');
                    await openPreview(page, false);
                    await expect(page.locator('#private-canary')).toHaveCount(0);
                    row.restoration = await page.evaluate(() => JSON.parse(sessionStorage.getItem('restored')));
                    if (label === 'BFCache') assert.deepEqual(row.restoration, {path:'/it/retoure/',hidden:true});
                    else {
                        assert.equal(row.restoration, null);
                        row.historyDocument = await page.evaluate(() => sessionStorage.getItem('historyDocument'));
                        assert.equal(row.historyDocument, '/it/retoure/');
                        row.newGuestRequest = requests.some(r => !r.member && r.url === link);
                        if (label === 'ohne HTTP-Cache') assert.equal(row.newGuestRequest, true);
                    }
                }, engine);
            }
        } finally { await noBfcache.close(); }
        await check('Zurück bei weiter angemeldeter Sitzung', async page => {
            await page.goto(origin + '/konto/');
            await page.goto(origin + '/alle-artikel/');
            await page.goBack({waitUntil:'commit'});
            await expect(page.locator('#private-canary')).toBeVisible();
            await openPreview(page, true);
            assert.equal(posts, 0);
        });
        await check('Sitzung anderweitig beendet · Zurück auf Gastlink', async page => {
            await page.goto(origin + '/es/retoure/?orderAccessKey=fixture-only');
            await page.goto(origin + '/es/alle-artikel/');
            member = false;
            await page.goBack({waitUntil:'commit'});
            await page.waitForURL(origin + '/es/');
            await openPreview(page, false);
            assert.ok(requests.some(r => !r.member && r.url === '/rest/io/customer/'));
            assert.equal(posts, 0);
        });
        await check('Sitzungsprüfung beim Zurückgehen antwortet mit HTTP 503', async page => {
            await page.goto(origin + '/fr/konto/');
            await page.goto(origin + '/fr/alle-artikel/');
            customerStatus = 503;
            await page.goBack({waitUntil:'commit'});
            await page.waitForURL(origin + '/fr/');
            await expect(page.locator('#private-canary')).toHaveCount(0);
            assert.equal(posts, 0);
        });
        await check('Zurück zur öffentlichen Seite mit alter offener Kontovorschau', async (page, row) => {
            await page.goto(origin + '/en/search/?query=linen');
            await openPreview(page, true);
            await page.goto(origin + '/en/konto/');
            await openPreview(page, true); await send(page);
            await page.waitForURL(origin + '/en/');
            await page.goBack({waitUntil:'commit'});
            await expect.poll(() => requests.some(r => !r.member && r.url === '/en/search/?query=linen')).toBe(true);
            await openPreview(page, false);
            row.restoration = await page.evaluate(() => JSON.parse(sessionStorage.getItem('restored')));
            assert.deepEqual(row.restoration, {path:'/en/search/',hidden:true});
        });
        // Test a denied local home value, including alternate-origin and backslash inputs.
        for (const target of ['//outside.invalid/', '/\\outside.invalid/']) await check('Ungültiges Startziel ' + target, async (page) => {
            await page.goto(origin + '/konto/');
            await page.locator('html').evaluate((el, value) => el.dataset.egLogoutHome = value, target);
            await openPreview(page, true); await send(page);
            await page.waitForURL(origin + '/'); assert.equal(posts, 1);
        });
        const {fixture} = require('./dialog_switch.cjs');
        const t = await fixture(browser, 'de', 390);
        try {
            const call = await t.open('account'); await t.reply(call);
            await expect(t.modal.locator('input[type=email]')).toBeVisible();
            await t.modal.locator('.close').click(); await expect(t.modal).toBeHidden();
            await t.heart.click();
            const picker = t.page.locator('#eg-wish-picker');
            await expect(picker).toBeVisible();
            await picker.getByRole('button', {name:'Rosa',exact:true}).click();
            await expect(picker.locator('[data-wish-id="1453158"]')).toBeVisible();
            await picker.locator('.modal-footer [data-dismiss]').click();
            await expect(t.heart).toBeFocused();
            await expect(t.page.locator('.modal-backdrop')).toHaveCount(0);
            assert.ok(t.requests.every(r => r.startsWith('GET ')));
            assert.deepEqual(t.errors, []);
            evidence.dialog = {result:'PASS', width:390, writes:0};
        } finally { await t.context.close(); }
    } finally { await browser.close(); }
    assert.ok(evidence.cases.every(row => row.result === 'PASS'), 'See ' + traceFile);
}
run().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => {
    fs.writeFileSync(traceFile, JSON.stringify(evidence, null, 2) + '\n');
    server.close();
    console.log(JSON.stringify({chrome:evidence.chrome, pass:evidence.cases.filter(r=>r.result==='PASS').length,
        fail:evidence.cases.filter(r=>r.result==='FAIL').length, dialog:evidence.dialog}));
});
