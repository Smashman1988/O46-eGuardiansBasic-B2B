// Actual production modules with a local jQuery transport and virtual clock. No shop requests.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const jquery = path.resolve('resources/js/jquery-3.7.1.min.js');
const core = path.resolve(process.argv[2] || 'resources/js/core.js');

async function run(browser, mode) {
    const context = await browser.newContext();
    const page = await context.newPage();
    let headerReads = 0;
    let releaseHeader;
    const headerGate = new Promise(resolve => { releaseHeader = resolve; });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
        await context.route('**/*', route => route.request().isNavigationRequest()
            ? route.fulfill({ contentType: 'text/html', body: `<html lang="de"><body><div data-eg-title="Currency">€</div>
                <article data-item-variation><div data-eg-size-matrix>
                <div class="eg-size-matrix-table" aria-busy="true"><div class="eg-size-matrix-body"></div></div>
                <div class="eg-size-matrix-footer"><div class="eg-matrix-totals"><span data-eg-total-sum></span>
                <div class="eg-matrix-error-slot"><button type="button" data-eg-matrix-error-toggle aria-expanded="false" hidden>Details</button></div></div>
                <div role="status" data-eg-matrix-status data-partial="Teilweise ausgefallen"></div>
                <button data-eg-matrix-add>In den Warenkorb</button></div></div></article></body></html>` })
            : (() => {
                assert.equal(new URL(route.request().url()).pathname, '/rest/io/basket/');
                headerReads++;
                if (mode === 'edit-pending') return headerGate.then(() => route.fulfill({status:503,body:''}));
                return route.fulfill({ json: { data: { itemQuantity:0,itemSum:0,currency:'EUR',shippingCountryId:1,itemWishListIds:[] } } });
            })());
        await page.goto('https://matrix.test/');
        if (mode === 'other-tab') {
            const peer = await context.newPage();
            await peer.goto('https://matrix.test/');
            await page.exposeFunction('addFromOtherTab', () => peer.evaluate(() => localStorage.setItem('peer-quantity','1')));
        }
        await page.clock.install();
        await page.addScriptTag({path: jquery});
        await page.addScriptTag({path: core});
        await page.evaluate(mode => {
            window.calls = { posts: 0, reads: 0, quantity: 0, componentQuantity: 0, currencyQueries: 0 };
            const original = document.querySelector;
            document.querySelector = function(selector) {
                if (selector === '[data-eg-title="Currency"]') calls.currencyQueries++;
                return original.call(this, selector);
            };
            const count = mode === 'currency' ? 60 : ['edit-pending','partial-stock'].includes(mode) ? 2 : 1;
            const variants = Array.from({length: count}, (_, i) => ({variationId: i+1}));
            document.querySelector('[data-item-variation]').dataset.egVariations = JSON.stringify(variants);
            window.eGuardians = {};
            window.messageServiceTranslations = {'113':'Die maximale Bestellmenge dieser Variante wurde überschritten.'};
            O46Core.apiservice();
            jQuery.ajaxTransport('+json', options => ({
                send(_, complete) {
                    const reply = (status, data) => complete(status, status >= 400 ? 'error' : 'OK',
                        { text: data === undefined ? '' : JSON.stringify(data) });
                    if (options.url.includes('/variations/batch')) {
                        if (mode === 'partial-stock') return reply(200, { data: {
                            items: { 1: {price:2,stock:50,images:[],ean:'001'} }, missing:[2]
                        } });
                        return reply(200, {data: {items: Object.fromEntries(variants.map(v =>
                            [v.variationId, {price: 2, stock: 50, images: [], ean: '001'}]))}});
                    }
                    if (options.type === 'POST') {
                        calls.posts++;
                        if (mode === 'partial-stock') calls.postData = Object.fromEntries(new URLSearchParams(options.data));
                        if (mode === 'edit-pending') {
                            window.finishPost = () => { calls.quantity++; reply(201, {data:true}); };
                            return;
                        }
                        if (mode === 'delayed' && calls.posts === 1) {
                            return setTimeout(() => { calls.quantity++; reply(201, {data:true}); }, 94000);
                        }
                        if (mode === 'other-tab') {
                            return window.addFromOtherTab().then(() => complete(0,'error',{text:''}));
                        }
                        if (mode === 'network-applied') {
                            calls.quantity++;
                            return complete(0,'error',{text:''});
                        }
                        if (mode === 'network') return complete(0,'error',{text:''});
                        if (mode === 'bundle-partial') {
                            calls.componentQuantity++;
                            return reply(400,{data:{exceptionCode:111},events:{AfterBasketChanged:{basketItems:[{variationId:99,quantity:calls.componentQuantity}]}}});
                        }
                        if (mode === 'zero') return reply(400,{data:{exceptionCode:0}});
                        if (mode === 'order-max') return reply(400,{data:{exceptionCode:113}});
                        if (mode === 'invalid-response') return reply(201,{});
                        if (mode === 'unexpected-status') return reply(200,{data:true});
                        calls.quantity++;
                        return reply(201, {data:true});
                    }
                    calls.reads++;
                    if (mode === 'invalid-read' && calls.reads === 1) return reply(503, {});
                    if (mode === 'invalid-row' && calls.reads === 1) return reply(200, {data:[{}]});
                    return reply(200, {data: calls.quantity ? [{quantity:calls.quantity, variationId:1}] : []});
                },
                abort() {}
            }));
            O46Core.matrix();
            egInitSizeMatrices(document);
        }, mode);
        await page.clock.runFor(50);
        const baseline = await page.evaluate(() => {
            const initial = calls.currencyQueries;
            calls.currencyQueries = 0;
            const qty = document.querySelector('[data-eg-qty]');
            qty.value = '1';
            qty.dispatchEvent(new Event('input', {bubbles: true}));
            return initial;
        });
        await page.clock.runFor(50);
        const activity = await page.evaluate(() => calls.currencyQueries);
        if (mode === 'partial-stock') {
            const details = page.locator('[data-eg-matrix-error-toggle]');
            assert.equal(await page.locator('[data-eg-matrix-status]').textContent(), 'Teilweise ausgefallen');
            await details.press('Enter');
            assert.equal(await details.getAttribute('aria-expanded'), 'true');
            assert.equal(await page.locator('[data-eg-total-sum]').textContent(), '2,00 €');
            assert.equal(await page.evaluate(() => calls.posts), 0, 'Opening error details must never book');
        }
        if (mode === 'currency') {
            // The header can be replaced as a whole, bypassing the observer on the old node.
            await page.evaluate(() => {
                const button = document.querySelector('[data-eg-title]');
                const replacement = button.cloneNode(false);
                replacement.textContent = 'CHF';
                button.replaceWith(replacement);
                document.querySelector('[data-eg-qty]').dispatchEvent(new Event('input', {bubbles: true}));
            });
            await page.clock.runFor(50);
        } else {
            const qty = page.locator('[data-eg-qty]');
            if (mode === 'edit-pending') await qty.nth(1).evaluate(input => { input.disabled = true; });
            await page.locator('[data-eg-matrix-add]').evaluate(button => button.click());
            if (mode === 'edit-pending') {
                assert.equal(await qty.first().isEditable(),false,'Pending write must lock quantities');
                await page.evaluate(() => {
                    // Even an explicitly dispatched second event cannot book the pending selection again.
                    document.querySelector('[data-eg-matrix-add]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
                    finishPost();
                });
            }
            if (mode === 'delayed') await page.clock.fastForward(90001);
            await page.clock.runFor(1100);
            if (mode === 'order-max') assert.ok((await page.locator('body').innerText()).includes('Die maximale Bestellmenge dieser Variante wurde überschritten. Warenkorb bitte vor dem erneuten Hinzufügen prüfen.'));
            await page.clock.runFor(5000);
        }
        // Wait for the actual fetch used by the header and the final UI state.
        if (mode !== 'currency') await page.clock.resume();
        if (mode !== 'currency') await page.waitForFunction(() => !document.querySelector('[data-eg-matrix-add]').disabled, null, {polling: 'raf', timeout: 2200});
        if (mode === 'edit-pending') {
            assert.equal(await page.locator('[data-eg-qty]').first().isEditable(),true,'Confirmed write unlocks before header GET finishes');
            assert.equal(await page.locator('[data-eg-qty]').nth(1).isDisabled(),true,'Previously disabled input stays disabled');
            const receipt = page.waitForResponse(r => new URL(r.url()).pathname === '/rest/io/basket/');
            releaseHeader();
            assert.equal((await receipt).status(),503);
        } else if (mode !== 'currency') await page.waitForFunction(() => window.egSessionData?.basket?.currency === 'EUR');
        return {mode, headerReads, ...await page.evaluate(() => ({...calls, peerQuantity:Number(localStorage.getItem('peer-quantity')), input:document.querySelector('[data-eg-qty]').value,
            button:document.querySelector('[data-eg-matrix-add]').textContent, sum:document.querySelector('[data-eg-total-sum]').textContent,
            busy:document.querySelector('[data-eg-matrix-add]').disabled})), initialCurrencyQueries:baseline, changeCurrencyQueries:activity, errors};
    } finally { await context.close(); }
}

(async function () {
    const browser = await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try {
        const results = [];
        const confirmed = ['success','invalid-read','invalid-row','edit-pending','partial-stock'];
        for (const mode of [...confirmed,'network','network-applied','delayed','zero','order-max','invalid-response','unexpected-status','bundle-partial','other-tab','currency']) {
            const result = await run(browser, mode);
            results.push(result);
            console.log(JSON.stringify(result));
            if (mode !== 'currency') {
                assert.equal(result.posts, 1, 'One POST for one user action');
                assert.equal(result.reads, 1, 'Only the original pre-clamp read');
                assert.equal(result.headerReads, 1, 'Fixture has no authoritative header in the response');
                const success = confirmed.includes(mode);
                assert.equal(result.input, success ? '0' : '1');
                assert.equal(result.button, success ? 'Hinzugefügt ✓' : 'Warenkorb bitte vor dem erneuten Hinzufügen prüfen.');
                assert.equal(result.quantity, success || mode === 'network-applied' || mode === 'delayed' ? 1 : 0);
                assert.equal(result.peerQuantity, mode === 'other-tab' ? 1 : 0);
                assert.equal(result.componentQuantity, mode === 'bundle-partial' ? 1 : 0);
            }
            if (mode === 'currency') {
                assert.ok(result.initialCurrencyQueries <= 5);
                assert.equal(result.changeCurrencyQueries, 1);
                assert.equal(result.sum, '2,00 CHF');
            }
            if (mode === 'partial-stock') {
                assert.deepEqual(result.postData, {'basketItems[0][variationId]':'1', 'basketItems[0][quantity]':'1'});
            }
        }
        if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(results,null,2));
        assert.ok(results.every(result => !result.errors.length));
    } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode=1; });
