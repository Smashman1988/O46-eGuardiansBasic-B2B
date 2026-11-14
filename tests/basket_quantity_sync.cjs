// Local Chromium regression. Pass a reference Ceres root and a Twig autoloader.
// O46_BASKET_SYNC_REFERENCE selects an earlier unminified Twig partial for a regression control.
// Ceres runs its compiled Vue, Vuex, basket components, AJAX action and event handlers.
// Only the HTTP response bodies and their delivery order are controlled by the test.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

const root = path.resolve(__dirname, '..');
const ceres = path.resolve(process.argv[2] || path.join(root, '.cache/perf-audit426/ref-ceres'));
const twig = path.resolve(process.argv[3] || path.join(root, '.cache/contact-widget/autoload3.php'));
const php = process.env.O46_PHP || 'php';
const dist = path.join(ceres, 'resources/js/dist');
const base = fs.readFileSync(path.join(dist, 'ceres-base.js'), 'utf8');
// Keep webpack's original modules and loader. Select just the basket modules
// instead of mounting the whole store and starting unrelated shop components.
const bootstrap = 'return __webpack_require__(__webpack_require__.s = "./resources/js/src/base.js");';
assert.ok(base.includes(bootstrap), 'Unminified Ceres base bootstrap required');
const modules = base.replace(bootstrap, 'window.ceresRequire = __webpack_require__;');
const rowModule = './resources/js/src/app/components/basket/list/BasketListItem.vue';
const chunkDirectory = path.join(dist, 'chunks');
const chunks = fs.readdirSync(chunkDirectory).filter(name => /^ceres-\d+\.js$/.test(name))
    .map(name => fs.readFileSync(path.join(chunkDirectory, name), 'utf8')).join('\n');
assert.ok(chunks.includes('/***/ "' + rowModule + '":'), 'Compiled Ceres basket list item required');

function renderTemplates() {
    const code = String.raw`
        require $argv[1];
        $templates = ['Ceres::PageDesign.Macros.LayoutContainer' => '{% macro show(name) %}{% endmacro %}'];
        if (getenv('O46_BASKET_SYNC_REFERENCE')) $templates['Basket/Partials/QuantitySync.twig'] = file_get_contents(getenv('O46_BASKET_SYNC_REFERENCE'));
        $twig = new Twig\Environment(new Twig\Loader\ChainLoader([
            new Twig\Loader\ArrayLoader($templates),
            new Twig\Loader\FilesystemLoader($argv[2].'/resources/views')
        ]));
        function basketTestTranslation($key) {
            if (str_starts_with($key, 'Ceres::Template.')) return substr($key, strlen('Ceres::Template.'));
            $name = str_replace('GuardiansBasicB2B::Template.', '', $key);
            return $GLOBALS['labels'][$name] ?? throw new Exception('Missing translation '.$key);
        }
        $twig->addFunction(new Twig\TwigFunction('trans', 'basketTestTranslation'));
        $views = [];
        foreach (['de', 'en', 'fr', 'it', 'es'] as $lang) {
            $GLOBALS['labels'] = [];
            foreach (file($argv[2].'/resources/lang/'.$lang.'/Template.properties') as $line) {
                if (preg_match('/^([^#=\s]+)\s*=\s*(.*)$/u', trim($line), $m)) $GLOBALS['labels'][$m[1]] = trim($m[2], '"');
            }
            $localization = new class($lang) { function __construct(public $lang) {} function getLanguage() { return $this->lang; } };
            $basket = new class { function getBasketItemsForTemplate() { return []; } };
            $context = ['services'=>['checkout'=>['getCurrencyData'=>['name'=>'EUR','symbol'=>'€']],
                'basket'=>$basket, 'localizationRepository'=>$localization],
                'currentTemplate'=>'tpl.basket'];
            $views[$lang] = [];
            foreach (['meter'=>'PageDesign/Components/shipping-free-meter-'.$lang.'.twig',
                      'savings'=>'PageDesign/Components/dusparst.twig', 'totals'=>'Basket/Components/BasketTotals.twig',
                      'sync'=>'Basket/Partials/QuantitySync.twig'] as $name=>$view) {
                $views[$lang][$name] = $twig->render($view, $context);
            }
        }
        echo json_encode($views, JSON_THROW_ON_ERROR);`;
    const flags = process.env.O46_PHP_EXT ? ['-d', 'extension_dir=' + process.env.O46_PHP_EXT, '-d', 'extension=mbstring'] : [];
    return JSON.parse(execFileSync(php, [...flags, '-d', 'display_errors=stderr', '-r', code, twig, root], { encoding: 'utf8', maxBuffer: 3000000 }));
}

function snapshot(a, b, itemSumNet, unitPrices, rebate = 0) {
    const items = [a, b].map((quantity, i) => ({
        id: i + 1, itemId: i + 11, variationId: i + 101, variation: { id: i + 101, data: {
            prices: { default: {currency:'EUR'} }, properties: [], unit: { unitOfMeasurement:'C62',content:1 },
            variation: { minimumOrderQuantity:1, intervalOrderQuantity:1, maximumOrderQuantity:100 }
        } },
        quantity, price: unitPrices[i], basketItemOrderParams: []
    }));
    return { basket: { sessionId: 'local', itemSumNet, itemSum: +(itemSumNet * 1.19).toFixed(2),
        currency: 'EUR', itemQuantity: a + b, basketRebate: rebate, itemWishListIds: [] }, basketItems: items, showNetPrices: true };
}

const initial = snapshot(1, 1, 18, [8, 12], 10);
const high = snapshot(40, 1, 199, [5.5, 12], 14.22);
const low = snapshot(1, 1, 17.75, [7.5, 12], 8.97);

async function fixture(browser, views, lang, initiallyLoaded) {
    const page = await browser.newPage();
    page.setDefaultTimeout(2500);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => { errors.push('Unexpected network ' + route.request().url()); return route.abort(); });
    await page.setContent('<html lang="' + lang + '"><body data-o46-basket-sync><main id="page-body"><div id="vue-app"></div></main></body></html>');
    await page.addScriptTag({ content: modules });
    await page.addScriptTag({ content: chunks });
    await page.evaluate(({data,initiallyLoaded}) => {
        window.App = { templateType: 'basket', language: document.documentElement.lang, config: { log: { data: [] } } };
        window.Vue = ceresRequire('./node_modules/vue/dist/vue.js');
        const Vuex = ceresRequire('./node_modules/vuex/dist/vuex.esm.js').default;
        Vue.use(Vuex);
        const load = name => ceresRequire('./resources/js/src/app/' + name + '.js');
        window.$ = window.jQuery = ceresRequire('./node_modules/jquery/dist/jquery.js');
        Vue.config.errorHandler = error => { setTimeout(() => { throw error; }); };
        Vue.prototype.$translate = key => key;
        Vue.filter('numberFormat', String);
        Vue.filter('currency', String);
        Vue.filter('itemImages', () => []);
        Vue.filter('itemImage', () => '');
        Vue.filter('itemURL', () => '#');
        Vue.filter('itemName', () => 'Local item');
        Vue.component('quantity-input', ceresRequire('./resources/js/src/app/components/item/QuantityInput.vue').default);
        window.ceresStore = new Vuex.Store({ modules: { basket: load('store/modules/BasketModule').default,
            checkout: load('store/modules/CheckoutModule').default, wishList: load('store/modules/WishListModule').default } });
        load('services/ApiService').initListener();
        load('store/index').initClientListeners(ceresStore);
        ceresStore.commit('setBasket', data.basket);
        ceresStore.commit('setBasketItems', data.basketItems);
        ceresStore.commit('setShowNetPrices', true);
        if (initiallyLoaded) ceresStore.commit('setIsBasketInitiallyLoaded');
        window.trace = { writes: [], reads: [], mutations: [], published: [], saved: [], open: 0, peak: 0 };
        document.addEventListener('afterBasketItemQuantityUpdated', e => trace.saved.push([e.detail.id, e.detail.quantity]));
        const putReplies = [], getReplies = [];
        jQuery.ajaxTransport('+json', options => ({
            send(_headers, complete) {
                if (options.type !== 'PUT') throw Error('Unexpected Ceres request ' + options.type + ' ' + options.url);
                const params = new URLSearchParams(options.data);
                trace.writes.push({ path: options.url, id: +params.get('id'), variationId: +params.get('variationId'), quantity: +params.get('quantity') });
                trace.peak = Math.max(trace.peak, ++trace.open);
                putReplies.push(complete);
            },
            abort() { throw Error('Quantity write was aborted'); }
        }));
        window.finishPut = (response, status = 200, omitEvents = false) => {
            const complete = putReplies.shift();
            if (!complete) throw Error('No pending PUT');
            trace.open--;
            const json = status === 200 ? {data: {}, events: omitEvents ? {} : {AfterBasketChanged: response}} :
                {data: { exceptionCode: 401, placeholder: {} }, error: {code: 401, message: 'Quantity rejected'}};
            complete(status, String(status), { text: JSON.stringify(json) });
        };
        window.fetch = (url, options = {}) => {
            trace.reads.push({url: String(url), cache: options.cache});
            return new Promise(resolve => getReplies.push(resolve));
        };
        window.finishGet = (data, status = 200) => {
            const resolve = getReplies.shift();
            if (!resolve) throw Error('No pending GET');
            resolve(new Response(JSON.stringify({ data }), {status, headers:{'Content-Type':'application/json'}}));
        };
        window.addEventListener('o46:basket-updated', event => {
            const data = event.detail.session?.data;
            if (data?.basket) trace.published.push(data.basket.itemSumNet);
        });
        ceresStore.subscribe((m, s) => trace.mutations.push({ type: m.type, net: s.basket.data.itemSumNet }));
    }, {data:initial, initiallyLoaded});
    for (const html of [views[lang].meter, views[lang].savings, views[lang].sync]) {
        await page.evaluate(html => {
            const fragment = document.createElement('template');
            fragment.innerHTML = html;
            const scripts = Array.from(fragment.content.querySelectorAll('script'), s => { s.remove(); return s.textContent; });
            document.body.append(fragment.content);
            for (const content of scripts) {
                const script = document.createElement('script');
                script.textContent = content;
                document.body.appendChild(script);
            }
        }, html);
    }
    await page.evaluate(({ rowModule, totalsHtml, initial }) => {
        const BasketListItem = ceresRequire(rowModule).default;
        const template = new DOMParser().parseFromString(totalsHtml, 'text/html').querySelector('#vue-basket-totals');
        const BasketTotals = { ...ceresRequire('./resources/js/src/app/components/basket/BasketTotals.vue').default,
            ...Vue.compile(template.textContent, {delimiters:['${', '}']}) };
        window.vueApp = new Vue({store: ceresStore, render(h) { return h('section', {attrs:{id:'vue-app'}}, [
            ...this.$store.state.basket.items.map(item => h(BasketListItem, {key:item.id, props:{basketItem:item}})),
            h(BasketTotals, {props:{visibleFields:['basketValueNet','rebate']}})
        ]); }}).$mount('#vue-app');
        window.rows = vueApp.$children;
        window.dispatchEvent(new CustomEvent('o46:basket-updated', {detail:{items:initial.basketItems,session:{data:initial}}}));
    }, {rowModule, totalsHtml:views[lang].totals, initial});
    assert.deepEqual(errors, [], 'Basket scripts anchor and component startup');
    return {page, errors};
}

async function status(page) {
    return page.evaluate(() => {
        const msg = document.querySelector('[data-o46-basket-status]');
        return {text:msg.textContent, loading:msg.dataset.loading, error:msg.dataset.error, hidden:msg.hidden,
            busy: document.querySelector('.cmp-totals').getAttribute('aria-busy'),
            hiddenPrices: ['.cmp-totals dl','.item-total-price','#o46-min-order'].every(
                selector => getComputedStyle(document.querySelector(selector)).visibility === 'hidden')};
    });
}

async function normal(page, lang) {
    await checkView(page, initial, lang);
    await intent(page, 0, 40);
    await writes(page, 1);
    let s = await status(page);
    assert.ok(s.hiddenPrices && !s.hidden && s.text === s.loading && s.loading && s.busy === 'true', 'Pending feedback and stale prices hidden');
    await page.evaluate(data => finishPut(data), high);
    await published(page, high.basket.itemSumNet);
    await checkView(page, high, lang);
    await intent(page, 0, 1);
    await writes(page, 2);
    await page.evaluate(data => finishPut(data), low);
    await published(page, low.basket.itemSumNet);
    await checkView(page, low, lang);
    const tr = await page.evaluate(() => trace);
    assert.deepEqual(tr.writes, [40, 1].map(quantity => ({path:'/rest/io/basket/items/1',id:1,variationId:101,quantity})));
    assert.equal(tr.peak, 1);
    assert.equal(tr.reads.length, 0);
    s = await status(page);
    assert.ok(s.hidden && !s.hiddenPrices && s.busy === 'false');
}

async function queued(page) {
    await intent(page, 0, 40);
    await writes(page, 1);
    await intent(page, 0, 3);
    await intent(page, 0, 1);
    await intent(page, 1, 5);
    await intent(page, 1, 3);
    assert.equal(await page.evaluate(() => trace.writes.length), 1);
    await page.evaluate(data => finishPut(data), high);
    await writes(page, 2);
    await page.evaluate(data => finishPut(data), low);
    await writes(page, 3);
    const final = snapshot(1, 3, 34.12, [7.5, 10.5], 12.51);
    await page.evaluate(data => finishPut(data), final);
    await published(page, final.basket.itemSumNet);
    await checkView(page, final, 'de');
    const tr = await page.evaluate(() => trace);
    assert.deepEqual(tr.writes.map(w => [w.id,w.quantity]), [[1,40],[1,1],[2,3]]);
    assert.equal(tr.peak, 1);
    assert.deepEqual(tr.published, [initial.basket.itemSumNet, final.basket.itemSumNet]);
    assert.equal(tr.reads.length, 0);
}

async function rapidEdits(page, viaDom) {
    await page.clock.install();
    await page.evaluate(viaDom => {
        if (viaDom) {
            // Native change handlers run before the 500 ms debounce. All three
            // fields/edits are still enabled at this point.
            const inputs = [...document.querySelectorAll('.basket-list-item input.qty-input')];
            for (const [index, quantity] of [[0,3],[1,2],[0,4]]) {
                if (inputs[index].disabled) throw Error('Unexpected input lock before debounce');
                inputs[index].value = String(quantity);
                inputs[index].dispatchEvent(new Event('change', {bubbles:true}));
            }
        } else {
            // Exact native overlay sequence. An optimistic prop update used to emit
            // A3 after 500 ms and replace the already queued A4 while PUT A3 was open.
            rows[0].updateQuantity(3);
            rows[1].updateQuantity(2);
            rows[0].updateQuantity(4);
        }
    }, viaDom);
    await page.clock.runFor(550);
    const expectedWrites = viaDom ? [[1,4],[2,2]] : [[1,3],[2,2],[1,4]];
    // For the pure DOM case, timers with the same expiry may run in either row order.
    const quantities = [1,1];
    for (let i = 0; i < expectedWrites.length; i++) {
        await page.clock.runFor(750);
        const wrote = await page.evaluate(() => trace.writes.map(w => [w.id,w.quantity]));
        assert.equal(wrote.length, i+1, 'PUT sequence after delayed prop feedback: ' + JSON.stringify(wrote));
        const [id,quantity] = wrote[i];
        if (!viaDom) assert.deepEqual(wrote[i], expectedWrites[i]);
        quantities[id - 1] = quantity;
        const confirmed = snapshot(quantities[0], quantities[1], quantities[0] * 7 + quantities[1] * 9, [8,12], 12.5);
        await page.evaluate(data => finishPut(data), confirmed);
    }
    await page.clock.runFor(750);
    const tr = await page.evaluate(() => trace);
    if (viaDom) assert.deepEqual(tr.writes.map(w => [w.id,w.quantity]).sort((a,b) => a[0]-b[0]), expectedWrites);
    else assert.deepEqual(tr.writes.map(w => [w.id,w.quantity]), expectedWrites);
    assert.equal(tr.peak, 1);
    assert.equal(tr.reads.length, 0);
    assert.deepEqual(quantities, [4,2]);
    assert.equal(tr.published.at(-1), 46);
    await checkView(page, snapshot(4,2,46,[8,12],12.5), 'de');
}

async function recover(page, mode) {
    await intent(page, 0, 40);
    await writes(page, 1);
    await page.evaluate(fail => finishPut(null, fail ? 409 : 200, true), mode === 'failedWrite' || mode === 'bothFailed');
    await reads(page, 1);
    const tr = await page.evaluate(() => trace);
    assert.deepEqual(tr.reads, [{url:'/rest/io/session?templateType=basket&template=Ceres%3A%3ABasket.Basket',cache:'no-store'}]);
    assert.ok((await status(page)).hiddenPrices);
    if (mode === 'newIntent') {
        await intent(page, 0, 1);
        assert.equal(await page.evaluate(() => trace.writes.length), 1, 'No second write before readback');
        await page.evaluate(data => finishGet(data), high);
        await writes(page, 2);
        await page.evaluate(data => finishPut(data), low);
        await published(page, low.basket.itemSumNet);
        await checkView(page, low, 'de');
        assert.deepEqual(await page.evaluate(() => trace.published), [initial.basket.itemSumNet, low.basket.itemSumNet]);
    } else if (mode === 'newSnapshot' || mode === 'newSnapshotReadError') {
        const newer = snapshot(40, 2, 206.40, [5.15, 10.5], 9.07);
        await page.evaluate(data => {
            ceresRequire('./resources/js/src/app/services/ApiService.js').triggerEvent('AfterBasketChanged', data);
        }, newer);
        await page.evaluate(([older,fail]) => finishGet(older, fail ? 503 : 200), [high, mode === 'newSnapshotReadError']);
        await published(page, newer.basket.itemSumNet);
        await checkView(page, newer, 'de');
        assert.equal(await page.evaluate(net => trace.mutations.some(m => m.type === 'setBasket' && m.net === net),high.basket.itemSumNet),
            false,'Stale GET must never commit, even transiently');
    } else if (mode === 'bothFailed') {
        await page.evaluate(() => finishGet({}, 503));
        await page.waitForFunction(() => document.documentElement.classList.contains('o46-basket-unconfirmed'));
        const s = await status(page);
        assert.ok(s.hiddenPrices && !s.hidden && s.text === s.error && s.error && s.busy === 'false');
        assert.deepEqual(await page.evaluate(() => trace.published), [initial.basket.itemSumNet]);
        assert.equal(await page.locator('input.qty-input').first().inputValue(), '1');
        // A new, confirmed edit after this double failure must recover the UI.
        await intent(page, 0, 40);
        await writes(page, 2);
        await page.evaluate(data => finishPut(data), high);
        await published(page, high.basket.itemSumNet);
        await checkView(page, high, 'de');
        assert.ok((await status(page)).hidden);
    } else {
        const expected = mode === 'failedWrite' ? low : high;
        await page.evaluate(data => finishGet(data), expected);
        await published(page, expected.basket.itemSumNet);
        await checkView(page, expected, 'de');
        const s = await status(page);
        assert.ok(!s.hiddenPrices && (mode === 'failedWrite' ? !s.hidden && s.text === s.error && s.error : s.hidden));
    }
    assert.equal(await page.evaluate(() => trace.peak), 1);
    assert.equal(await page.evaluate(() => trace.reads.length), 1, 'At most one recovery request');
}

async function invalidation(page, mode) {
    const signal = () => page.evaluate(() => window.dispatchEvent(new Event('o46:basket-invalidated')));
    if (mode === 'afterWrite') {
        await intent(page, 0, 40);
        await writes(page, 1);
    }
    await signal();
    if (mode === 'beforeInit') {
        assert.equal(await page.evaluate(() => trace.reads.length), 0);
        await page.evaluate(() => ceresStore.commit('setIsBasketInitiallyLoaded'));
    }
    if (mode === 'afterWrite') {
        assert.equal(await page.evaluate(() => trace.reads.length), 0);
        await page.evaluate(data => finishPut(data), high);
    }
    await reads(page, 1);
    const latest = snapshot(40, 2, 205.75, [5.25, 10.5], 10.93);
    if (mode === 'coalesced') {
        await signal();
        await signal();
        assert.equal(await page.evaluate(() => trace.reads.length), 1);
        await page.evaluate(data => finishGet(data), high);
        await reads(page, 2);
        assert.equal(await page.evaluate(net => trace.mutations.some(m => m.type === 'setBasket' && m.net === net), high.basket.itemSumNet), false);
    }
    if (mode === 'oldReadError') {
        await page.evaluate(data => {
            ceresRequire('./resources/js/src/app/services/ApiService.js').triggerEvent('AfterBasketChanged', data);
            finishGet(null, 503);
        }, latest);
    } else {
        await page.evaluate(data => finishGet(data), latest);
    }
    await published(page, latest.basket.itemSumNet);
    await checkView(page, latest, 'de');
    const tr = await page.evaluate(() => trace);
    assert.deepEqual(tr.published, [initial.basket.itemSumNet, latest.basket.itemSumNet]);
    assert.equal(tr.reads.length, mode === 'coalesced' ? 2 : 1);
    assert.equal(tr.writes.length, mode === 'afterWrite' ? 1 : 0);
    assert.deepEqual(tr.saved, mode === 'afterWrite' ? [[1,40]] : []);
    const s = await status(page);
    assert.ok(s.hidden && !s.hiddenPrices && s.busy === 'false');
}

async function main() {
    const pageDesign = fs.readFileSync(path.join(root, 'resources/views/PageDesign/PageDesign.twig'), 'utf8');
    assert.match(pageDesign, /if currentTemplate == 'tpl\.basket' %} data-o46-basket-sync/);
    assert.match(pageDesign, /if currentTemplate == 'tpl\.basket' %}\s*{% include "GuardiansBasicB2B::Basket.Partials.QuantitySync" %}[\s\S]*?window\.createApp\(/);
    const views = renderTemplates();
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        const cases = [['de','rapid-components'],['de','rapid-inputs'], ...Object.keys(views).map(lang => [lang, 'normal']),
            ...['queued','missingEvent','failedWrite','bothFailed','newIntent','newSnapshot','newSnapshotReadError',
                'tab:beforeInit','tab:coalesced','tab:afterWrite','tab:oldReadError'].map(mode => ['de',mode])];
        for (const [lang, mode] of cases) {
            const {page,errors} = await fixture(browser,views,lang,mode !== 'tab:beforeInit');
            try {
                if (mode === 'normal') await normal(page, lang);
                else if (mode === 'queued') await queued(page);
                else if (mode.startsWith('rapid-')) await rapidEdits(page, mode === 'rapid-inputs');
                else if (mode.startsWith('tab:')) await invalidation(page, mode.slice(4));
                else await recover(page, mode);
                assert.deepEqual(errors, []);
                console.log('PASS', lang, mode);
            } finally { await page.close(); }
        }
        console.log(cases.length + ' local basket browser scenarios passed.');
    } finally { await browser.close(); }
}

async function intent(page, row, quantity) {
    const input = page.locator('input.qty-input').nth(row);
    if (await input.isEnabled()) {
        await page.evaluate(row => {
            const field = rows[row].$children.find(child => child.$options.name === 'quantity-input');
            window.inputDelivered = false;
            field.$once('quantity-change', () => { window.inputDelivered = true; });
        }, row);
        await input.fill(String(quantity));
        await input.press('Tab');
        await page.waitForFunction(() => window.inputDelivered);
    } else {
        // Ceres locks inputs during its PUT. Reproduce a debounced quantity-change
        // dispatched after a second row started a PUT, via Ceres' original listener.
        await page.evaluate(([row,qty]) => rows[row].$children.find(child => child.$options.name === 'quantity-input')
            .$emit('quantity-change', qty), [row,quantity]);
    }
}

async function writes(page, count) {
    await page.waitForFunction(count => trace.writes.length >= count, count);
}

async function reads(page, count) {
    await page.waitForFunction(count => trace.reads.length >= count, count);
}

async function published(page, expected) {
    await page.waitForFunction(expected => trace.published.includes(expected), expected);
}

async function checkView(page, data, lang) {
    const view = await page.evaluate(() => {
        const meter = document.querySelector('#o46-min-order');
        const amounts = [...document.querySelectorAll('.cmp-totals dt')].map(label =>
            [label.textContent.trim(), +label.nextElementSibling.textContent.trim()]);
        return { quant: Array.from(document.querySelectorAll('input.qty-input'), x => +x.value),
            line: Array.from(document.querySelectorAll('.item-total-price'), x => +x.textContent),
            amounts: Object.fromEntries(amounts), net: ceresStore.state.basket.data.itemSumNet,
            gross: ceresStore.state.basket.data.itemSum, rebate: ceresStore.state.basket.data.basketRebate,
            limit: +meter.dataset.limit, done: meter.classList.contains('o46-free-ship--done'), hidden: meter.classList.contains('is-hidden'),
            pct: +meter.querySelector('[role=progressbar]').getAttribute('aria-valuenow'), text: meter.querySelector('.o46-remaining').textContent };
    });
    assert.deepEqual(view.quant, data.basketItems.map(item => item.quantity));
    assert.deepEqual(view.line, data.basketItems.map(item => item.price * item.quantity));
    assert.equal(view.amounts['basketSubTotal (basketNet)'], data.basket.itemSumNet);
    assert.equal(view.amounts['basketSubTotal (basketGross)'], data.basket.itemSum);
    const baseValue = data.basket.itemSumNet * 100 / (100 - data.basket.basketRebate);
    assert.ok(Math.abs(view.amounts.basketRebate - (baseValue - data.basket.itemSumNet)) < 0.005, 'Rendered rebate');
    assert.equal(view.net, data.basket.itemSumNet);
    assert.equal(view.gross, data.basket.itemSum);
    assert.equal(view.rebate, data.basket.basketRebate);
    assert.equal(view.limit, 199);
    assert.equal(view.hidden, false);
    assert.equal(view.done, data.basket.itemSumNet >= 199);
    assert.equal(view.pct, Math.min(100, Math.round(100 * data.basket.itemSumNet / 199)));
    assert.ok(view.text.trim(), 'Localized 199 EUR message');
    if (!view.done) assert.ok(view.text.includes(new Intl.NumberFormat(lang, {style:'currency',currency:'EUR'}).format(199 - view.net)), view.text);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
