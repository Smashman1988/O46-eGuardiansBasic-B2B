// Real shared core in two same-origin Chromium tabs. Only the IO replies are fixtures.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

const origin = 'https://basket-header.test';
const core = path.resolve(process.argv[2] || 'resources/js/core.js');
const jquery = path.resolve('resources/js/jquery-3.7.1.min.js');
const cacheKey = 'basketCache_header_v2';
const scopeKey = 'o46-basket-scope';

function basket(quantity, itemSum) {
    return {
        itemQuantity: quantity, itemSumNet: Math.round(itemSum / 1.19 * 100) / 100, itemSum, currency: 'EUR',
        shippingCountryId: 1, customerId: 0, sessionId: 'fixture-session-1', itemWishListIds: []
    };
}

function deferred() {
    let resolve;
    const promise = new Promise(done => { resolve = done; });
    return { promise, resolve };
}

async function run(browser) {
    const context = await browser.newContext({ locale: 'de-DE', serviceWorkers: 'block' });
    const reads = [];
    const errors = [];
    let current = basket(0, 0);
    let gate;
    const unexpectedRequests = [];

    await context.route('**/*', async route => {
        const request = route.request();
        const url = new URL(request.url());
        assert.equal(url.origin, origin);
        if (request.isNavigationRequest()) {
            const currency = url.searchParams.get('currency') === 'CHF' ? 'CHF' : 'EUR';
            const country = url.searchParams.get('country') === '2' ? ' data-eg-basket-country="2"' : '';
            return route.fulfill({
                contentType: 'text/html',
                body: '<!doctype html><html lang="de"><body><header id="page-header" data-eg-basket-currency="' +
                    currency + '"' + country + '><span data-eg-basket-quantity></span><span data-eg-basket-quantity></span>' +
                    '<span data-basket-sum></span><span data-currency-symbol>€</span></header></body></html>'
            });
        }
        if (request.method() === 'GET' && /^\/rest\/io\/(basket|session)\/?$/.test(url.pathname)) {
            const snapshot = current;
            reads.push({ pathname: url.pathname, snapshot });
            if (gate) {
                const held = gate;
                gate = null;
                held.started.resolve();
                await held.release.promise;
            }
            const data = url.pathname.includes('/session') ? { basket: snapshot, basketItems: [] } : snapshot;
            return route.fulfill({ json: { data, events: {} } });
        }
        unexpectedRequests.push(url.pathname);
        return route.abort();
    });

    async function boot(page, url, ceres = false) {
        await page.goto(url);
        await page.addScriptTag({ path: jquery });
        await page.addScriptTag({ path: core });
        await page.evaluate(ceres => {
            window.invalidated = 0;
            window.addEventListener('o46:basket-invalidated', () => window.invalidated++);
            if (ceres) {
                document.body.setAttribute('data-o46-basket-sync', '');
                const state = { basket: { data: {}, items: [], isBasketInitiallyLoaded: false } };
                const listeners = [];
                window.ceresStore = {
                    state,
                    subscribe(fn) { listeners.push(fn); },
                    commit(type, payload) {
                        if (type === 'setBasket') state.basket.data = payload;
                        if (type === 'setIsBasketInitiallyLoaded') state.basket.isBasketInitiallyLoaded = true;
                        listeners.forEach(fn => fn({ type, payload }, state));
                    }
                };
            }
        }, ceres);
        await page.evaluate(() => window.O46Core.basketHeader.start());
    }

    async function expectHeader(page, quantity, itemSum) {
        await page.waitForFunction(({ quantity, itemSum }) => {
            const counts = Array.from(document.querySelectorAll('[data-eg-basket-quantity]'));
            const sum = document.querySelector('[data-basket-sum]').textContent.trim().replace(/[^\d,.-]/g, '');
            return counts.length === 2 && counts.every(node => node.textContent.trim() === String(quantity)) &&
                sum !== '' && Number(sum.replace(',', '.')) === itemSum;
        }, { quantity, itemSum }, { timeout: 3000 });
    }

    async function accept(page, snapshot) {
        await page.evaluate(snapshot => window.O46Core.basketHeader.accept(snapshot), snapshot);
    }

    async function storage(page) {
        return page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
    }

    try {
        const a = await context.newPage();
        const b = await context.newPage();
        for (const page of [a, b]) page.on('pageerror', error => errors.push(error.message));
        await boot(a, origin + '/artikel');
        await expectHeader(a, 0, 0);
        assert.equal(reads.length, 1, 'cold header needs one authoritative read');
        await a.evaluate(() => Promise.all([O46Core.basketHeader.start(), O46Core.basketHeader.start()]));
        assert.equal(reads.length, 1, 'repeat initialization reuses the original subscriptions/read');
        await boot(b, origin + '/kategorie');
        await expectHeader(b, 0, 0);
        assert.equal(reads.length, 2, 'new independent tab verifies server session before using a shared entry');
        const afterBoot = reads.length;
        assert.equal(await b.evaluate(() => window.invalidated), 0, 'session check is not an add/quantity write');

        // Vue pages get their bootstrap data from Ceres' session. Test its public delivery points.
        await boot(b, origin + '/warenkorb', true);
        await b.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
        assert.equal(reads.length, afterBoot, 'visibility cannot race the initial Ceres session');
        await b.evaluate(snapshot => {
            ceresStore.commit('setBasket', snapshot);
            ceresStore.commit('setIsBasketInitiallyLoaded');
        }, current);
        await expectHeader(b, 0, 0);
        assert.equal(reads.length, afterBoot, 'Ceres initialization needs no parallel header GET');

        current = basket(1, 4.99);
        await accept(a, current);
        await expectHeader(b, 1, 4.99);
        assert.equal(await b.evaluate(() => ceresStore.state.basket.data.itemQuantity), 0,
            'localStorage can repaint the header but cannot replace prices in the authoritative Vuex basket');
        current = basket(40, 199.60);
        await accept(a, current);
        await expectHeader(a, 40, 199.60);
        await expectHeader(b, 40, 199.60);
        assert.equal(reads.length, afterBoot, 'local mutation reaches both tabs without refetch');
        assert.equal(await b.evaluate(() => window.invalidated), 2, 'one foreign change per accepted write');
        assert.equal(await a.evaluate(() => window.invalidated), 0, 'no feedback to the writer');

        current = basket(41, 204.59);
        await b.evaluate(snapshot => {
            ceresStore.commit('setBasket', snapshot);
            jQuery(document).trigger('ajaxComplete', [
                { status: 200, responseJSON: { events: { AfterBasketChanged: { basket: { ...snapshot } } } } },
                { type: 'PUT', url: '/rest/io/basket/items/1' }
            ]);
            document.dispatchEvent(new CustomEvent('afterBasketItemQuantityUpdated'));
        }, current);
        await expectHeader(a, 41, 204.59);
        assert.equal(await a.evaluate(() => window.invalidated), 1, 'a Ceres PUT signals the other tab once');
        current = basket(40, 199.60);
        await accept(a, current);
        await expectHeader(b, 40, 199.60);
        await boot(b, b.url());
        await expectHeader(b, 40, 199.60);
        assert.equal(reads.length, afterBoot, 'reload uses matching fresh cache');
        await boot(b, origin + '/neuheiten');
        await expectHeader(b, 40, 199.60);
        assert.equal(reads.length, afterBoot, 'navigation after write needs no IO read');
        const cache = await storage(b);
        const record = JSON.parse(cache[cacheKey]);
        assert.ok(!Object.keys(cache).some(key => key.startsWith('basketCache_') && key !== cacheKey));
        assert.deepEqual(Object.keys(record.basket).sort(),
            ['itemQuantity', 'itemSum', 'itemWishListIds', 'currency', 'shippingCountryId'].sort());
        assert.ok(!cache[cacheKey].includes('fixture-session-1'), 'raw IO session identity excluded from shared storage');
        assert.match(record.scope, /^[a-f\d]{64}$/);
        assert.equal(record.scope, await b.evaluate(key => sessionStorage.getItem(key), scopeKey));

        current = basket(2, 9.98);
        const held = { started: deferred(), release: deferred() };
        gate = held;
        await a.evaluate(() => {
            window.headerReads = Promise.all([O46Core.basketHeader.refresh(), O46Core.basketHeader.refresh()]);
        });
        await Promise.race([
            held.started.promise,
            new Promise((resolve, reject) => {
                setTimeout(() => reject(new Error('Header refresh never reached the IO route')), 5000).unref();
            })
        ]);
        current = basket(3, 14.97);
        await accept(b, current);
        await expectHeader(a, 3, 14.97);
        held.release.resolve();
        await a.evaluate(() => window.headerReads);
        await expectHeader(a, 3, 14.97);
        await expectHeader(b, 3, 14.97);
        assert.equal(reads.length, afterBoot + 1, 'concurrent refreshes share one response and discard stale data');
        current = basket(0, 0);
        await accept(a, current);
        await expectHeader(b, 0, 0);
        assert.equal(reads.length, afterBoot + 1, 'confirmed empty basket reaches peer tab after removal');

        // Continue in a single tab for deterministic corrupt/expired cache request counts.
        await a.close();
        let nextRead = reads.length;
        async function expectRefetch(value, explanation) {
            await b.evaluate(([key, raw]) => localStorage.setItem(key, raw), [cacheKey, value]);
            await boot(b, b.url());
            await expectHeader(b, current.itemQuantity, current.itemSum);
            assert.equal(reads.length, ++nextRead, explanation);
        }
        const authoritativeRecord = JSON.parse((await storage(b))[cacheKey]);
        await expectRefetch('{bad-json', 'corrupt JSON');
        await expectRefetch(JSON.stringify({ ...authoritativeRecord, timestamp: Date.now() - 31 * 60_000 }),
            'expired fallback');
        await expectRefetch(JSON.stringify({ ...authoritativeRecord, scope: 'f'.repeat(64) }),
            'shared entry for another session');
        const injection = '<img src=x onerror="window.injected=true">';
        await expectRefetch(JSON.stringify({
            ...authoritativeRecord, basket: { ...authoritativeRecord.basket, itemQuantity: injection, currency: injection }
        }), 'invalid numeric/currency fields require authoritative read');
        assert.equal(await b.evaluate(() => Boolean(window.injected || document.querySelector('#page-header img'))), false);

        await b.evaluate(key => {
            localStorage.removeItem(key);
            localStorage.setItem('basketCache_de_EUR_1_guest', JSON.stringify({
                timestamp: Date.now(), data: { basket: { itemQuantity: 777, itemSum: 9876 } }
            }));
        }, cacheKey);
        await boot(b, b.url());
        await expectHeader(b, current.itemQuantity, current.itemSum);
        assert.equal(reads.length, ++nextRead, 'legacy cache is not authoritative');

        current = { ...basket(0, 0), sessionId: 'replacement-session', currency: 'CHF' };
        await boot(b, origin + '/artikel?currency=CHF');
        await expectHeader(b, 0, 0);
        assert.equal(reads.length, ++nextRead, 'currency/session change causes one read');
        assert.notEqual(JSON.parse((await storage(b))[cacheKey]).scope, record.scope);

        const guestScope = JSON.parse((await storage(b))[cacheKey]).scope;
        const sameContext = { ...current, currency: 'CHF' };
        current = { ...current, customerId: 37, itemQuantity: 7, itemSum: 20.50 };
        await b.evaluate(() => O46Core.basketHeader.invalidate());
        await expectHeader(b, 7, 20.50);
        assert.equal(reads.length, ++nextRead, 'account change requires a new authoritative read');
        const customerRecord = JSON.parse((await storage(b))[cacheKey]);
        assert.notEqual(customerRecord.scope, guestScope, 'same session ID with different customer has a different scope');
        assert.equal(Object.hasOwn(customerRecord.basket, 'customerId'), false);
        current = { ...current, customerId: 0, itemQuantity: 0, itemSum: 0 };
        await b.evaluate(() => O46Core.basketHeader.invalidate());
        await expectHeader(b, 0, 0);
        assert.equal(reads.length, ++nextRead, 'logout obtains the guest basket');
        assert.equal(JSON.parse((await storage(b))[cacheKey]).scope, guestScope);

        const peer = await context.newPage();
        peer.on('pageerror', error => errors.push(error.message));
        current = { ...basket(5, 84), sessionId: 'isolated', currency: 'EUR', shippingCountryId: 2 };
        await boot(peer, origin + '/zweiter-kunde?country=2');
        await expectHeader(peer, 5, 84);
        assert.equal(reads.length, ++nextRead, 'independent context verified exactly once');
        await accept(peer, { ...current, itemSum: 82 });
        await expectHeader(peer, 5, 82);
        await expectHeader(b, 0, 0);
        await accept(b, sameContext);
        await expectHeader(b, 0, 0);
        await expectHeader(peer, 5, 82);
        await peer.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.equal(reads.length, nextRead, 'published responses in different contexts do not trigger refetch loops');

        await peer.evaluate(() => {
            window.O46Core.basketHeader.accept({ sessionId: '', itemQuantity: 1, itemSum: 3,
                itemWishListIds: [], currency: 'EUR', shippingCountryId: 2 });
        });
        await expectHeader(peer, 1, 3);
        assert.equal(await peer.evaluate(key => sessionStorage.getItem(key), scopeKey), null);
        assert.equal(JSON.parse((await storage(b))[cacheKey]).scope, guestScope, 'missing session cannot remove another tab’s usable record');

        current = { ...sameContext, itemQuantity: 2, itemSum: 9.98 };
        const bad = JSON.stringify({ ...JSON.parse((await storage(b))[cacheKey]), timestamp: 0 });
        await peer.evaluate(([key, bad]) => localStorage.setItem(key, bad), [cacheKey, bad]);
        await expectHeader(b, 2, 9.98);
        assert.equal(reads.length, ++nextRead, 'invalid record in running tab revalidates only once');
        await boot(peer, origin + '/warenkorb?currency=CHF', true);
        await peer.evaluate(s => {
            ceresStore.commit('setBasket', s);
            ceresStore.commit('setIsBasketInitiallyLoaded');
        }, current);
        await expectHeader(peer, 2, 9.98);
        const writesBeforeCoupon = await b.evaluate(() => window.invalidated);
        await peer.evaluate(snapshot => {
            snapshot.itemSum = 8.75;
            ceresStore.commit('setBasket', snapshot);
            jQuery(document).trigger('ajaxComplete', [
                { status: 200, responseJSON: { events: { AfterBasketChanged: { basket: { ...snapshot } } } } },
                { type: 'POST', url: '/rest/io/coupon/' }
            ]);
        }, current);
        await expectHeader(b, 2, 8.75);
        assert.equal(await b.evaluate(() => window.invalidated), writesBeforeCoupon + 1);

        current = { ...current, itemQuantity: 3, itemSum: 13.75 };
        await b.evaluate(() => O46Core.basketHeader.refreshAfterWrite());
        await expectHeader(peer, 3, 13.75);
        assert.equal(reads.length, ++nextRead, 'write without full response publishes one validated summary read');
        await peer.close();
        current = { ...current, shippingCountryId: 2 };
        await boot(b, origin + '/vergleich?currency=CHF&country=2');
        assert.equal(reads.length, ++nextRead, 'country marker excludes previous private shipping context');
        assert.equal(JSON.parse((await storage(b))[cacheKey]).basket.shippingCountryId, 2);

        assert.ok(reads.every(read => read.pathname === '/rest/io/basket/'), 'no full IO session request');

        assert.deepEqual(unexpectedRequests, []);
        assert.deepEqual(errors, []);
        console.log(JSON.stringify({
            status: 'PASS', asset: path.basename(core), tabs: 2,
            checks: ['cold empty', 'idempotent start', 'fresh navigation', 'add', 'quantity 1→40', 'storage change',
                'Ceres bootstrap', 'no storage to Vuex', 'Ceres PUT event', 'no write echo', 'reload',
                'compact data', 'hashed scope', 'single flight', 'discard outdated GET',
                'remove', 'corrupt JSON', 'TTL', 'foreign scope', 'XSS', 'legacy migration', 'currency/session change',
                'login invalidation', 'logout invalidation', 'no ping-pong across contexts', 'missing session',
                'invalid data during open session', 'coupon write', 'targeted read after write', 'country marker'],
            basketReads: reads.length, fullSessionReads: 0, cacheBytes: Buffer.byteLength(cache[cacheKey], 'utf8')
        }));
    } finally {
        await context.close();
    }
}

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        await run(browser);
    } finally {
        await browser.close();
    }
})().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
