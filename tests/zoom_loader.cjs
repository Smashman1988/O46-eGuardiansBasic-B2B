// Deterministic lifecycle contracts for the actual gallery loader source.
// Fake DOM, clock, vendor-ready signal and AJAX; the real vendor is covered by theme_bundles.cjs.
// node tests/zoom_loader.cjs [report.json] [loader-source.js]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const source = fs.readFileSync(process.argv[3] || path.join(__dirname, '../resources/js/zoom-loader.js'), 'utf8');
const core = fs.readFileSync(path.join(__dirname, '../resources/js/core.js'), 'utf8');
const apiNode = acorn.parse(core, {ecmaVersion: 'latest'}).body.find(node =>
    node.type === 'ExpressionStatement' && node.expression.type === 'AssignmentExpression' &&
    core.slice(node.expression.left.start, node.expression.left.end) === 'O46Core.apiservice');
assert.ok(apiNode, 'The actual shared API adapter must be available');
const apiSource = core.slice(apiNode.start, apiNode.end);
const rows = [];
const flush = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };

class Clock {
    now = 0;
    nextId = 1;
    jobs = new Map();
    set(fn, delay = 0) {
        const id = this.nextId++;
        this.jobs.set(id, { at: this.now + delay, fn });
        return id;
    }
    clear(id) { this.jobs.delete(id); }
    async advance(delay) {
        const until = this.now + delay;
        await flush();
        for (;;) {
            const next = [...this.jobs].filter(([, job]) => job.at <= until)
                .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
            if (!next) break;
            this.now = next[1].at;
            this.jobs.delete(next[0]);
            next[1].fn();
            await flush();
        }
        this.now = until;
        await flush();
    }
}

function fixture({delayMatrix = false, realApi = false} = {}) {
    const clock = new Clock();
    const state = { scripts: [], requests: [], html: [], shows: 0, bindings: 0, starts: 0,
        redirects: [], vendorReady: false, vendorCallbacks: [], matrixCalls: 0, matrixReady: !delayMatrix };
    let resolveMatrix, rejectMatrix;
    const matrixReady = delayMatrix ? new Promise((resolve, reject) => { resolveMatrix = resolve; rejectMatrix = reject; }) : Promise.resolve();
    const document = {
        currentScript: { getAttribute: () => '/assets/magiczoom.min.js?v=fixture' },
        querySelector: () => state.scripts.find(script => !script.removed) || null,
        createElement() {
            return {
                listeners: new Map(), removed: false,
                setAttribute() {},
                addEventListener(name, fn) { this.listeners.set(name, fn); },
                removeEventListener(name) { this.listeners.delete(name); },
                emit(name) { this.listeners.get(name)?.(); },
                remove() { this.removed = true; }
            };
        },
        head: { appendChild(script) { state.scripts.push(script); } }
    };
    const sandbox = {
        document, O46Core: {installed: {}, ensureMatrix() { state.matrixCalls++; return matrixReady; }}, URL, Promise,
        setTimeout: (fn, delay) => clock.set(fn, delay), clearTimeout: id => clock.clear(id),
        console: { warn() {} },
        location: { href: 'https://shop.example/fr/category/', assign(url) { state.redirects.push(url); } },
        eGuardians: {
            apiservice: { get(url, data, callback, type) { state.requests.push({ url, callback, type }); } },
            events: { bindEvents() { state.bindings++; } }
        },
        $(target) {
            return typeof target === 'object' ? { data: () => target.href } : {
                html(value) { assert.ok(state.matrixReady, 'Quickview must not insert markup before matrix readiness'); state.html.push(value); }, modal() { state.shows++; }
            };
        }
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    if (realApi) {
        // Run the production API facade. Only the AJAX transport/clock is fake:
        // its timeout ends the request via the same error callback as jQuery.
        sandbox.$.ajax = options => {
            let complete = false;
            let timer;
            const request = {url: options.url, type: options.dataType, method: options.method,
                timeout: options.timeout, timedOut: false,
                succeed(html) {
                    if (complete) return;
                    complete = true;
                    clock.clear(timer);
                    options.success(html, 'success', {status: 200});
                }};
            if (options.timeout > 0) timer = clock.set(() => {
                if (complete) return;
                complete = true;
                request.timedOut = true;
                options.error({status: 0, responseText: ''});
            }, options.timeout);
            state.requests.push(request);
        };
        vm.runInContext(apiSource + ';O46Core.apiservice();', sandbox, {filename: 'core-api-adapter.js'});
    }
    vm.runInContext(source, sandbox, { filename: 'zoom-loader.js' });
    function installVendor(alreadyReady = false) {
        sandbox.MagicZoom = { start() {
            assert.ok(state.vendorReady, 'Gallery must never start before vendor initialization');
            state.starts++;
        } };
        state.vendorReady = alreadyReady;
        document.jAddEvent = (name, callback, priority = 50) => {
            assert.equal(name, 'domready');
            if (state.vendorReady) clock.set(callback);
            else state.vendorCallbacks.push({ callback, priority });
        };
    }
    function vendorDomReady() {
        // The vendor's own initialization runs before the loader's ready callback.
        state.vendorCallbacks.push({ priority: 50, callback: () => { state.vendorReady = true; } });
        state.vendorCallbacks.sort((a, b) => a.priority - b.priority).forEach(entry => entry.callback());
        state.vendorCallbacks.length = 0;
    }
    return { state, clock, document, sandbox, loader: sandbox.O46Core, installVendor, vendorDomReady,
        completeMatrix() { state.matrixReady = true; resolveMatrix(); },
        failMatrix() { rejectMatrix(new Error('Matrix asset unavailable')); } };
}

async function completeDownload(test, script) {
    test.installVendor();
    script.emit('load');
    test.vendorDomReady();
    await test.clock.advance(0);
}

async function run() {
    let test = fixture();
    const first = test.loader.ensureMagicZoom(), parallel = test.loader.ensureMagicZoom();
    assert.equal(first, parallel);
    assert.equal(test.state.scripts.length, 1);
    let resolved = false;
    first.then(() => { resolved = true; });
    test.installVendor();
    test.state.scripts[0].emit('load');
    await test.clock.advance(0);
    assert.equal(resolved, false, 'Script load alone is not vendor readiness');
    test.vendorDomReady();
    assert.equal(resolved, false, 'Resolution waits for the vendor callback turn to finish');
    await test.clock.advance(0);
    await first;
    assert.ok(resolved && test.state.vendorReady);
    assert.equal(test.clock.jobs.size, 0, 'Successful download clears its timeout');
    rows.push({ case: 'parallel-load-and-vendor-ready-order', status: 'PASS', downloads: 1 });

    for (const failure of ['error-event', 'load-without-vendor', 'timeout']) {
        test = fixture();
        const promise = test.loader.ensureMagicZoom();
        const rejected = assert.rejects(promise);
        const failedScript = test.state.scripts[0];
        if (failure === 'error-event') failedScript.emit('error');
        else if (failure === 'load-without-vendor') failedScript.emit('load');
        else {
            await test.clock.advance(14999);
            assert.equal(failedScript.removed, false);
            await test.clock.advance(1);
        }
        await rejected;
        assert.equal(test.loader.zoomPromise, null);
        assert.ok(failedScript.removed);
        assert.equal(failedScript.listeners.size, 0);
        assert.equal(test.clock.jobs.size, 0);
        const retry = test.loader.ensureMagicZoom();
        assert.equal(test.state.scripts.length, 2);
        await completeDownload(test, test.state.scripts[1]);
        await retry;
        assert.equal(test.state.scripts.filter(script => !script.removed).length, 1);
        rows.push({ case: failure + '-cleanup-and-retry', status: 'PASS' });
    }

    test = fixture();
    test.installVendor(true);
    let existingReady = false;
    const existing = test.loader.ensureMagicZoom().then(() => { existingReady = true; });
    await flush();
    assert.equal(existingReady, false);
    await test.clock.advance(0);
    await existing;
    assert.equal(test.state.scripts.length, 0);
    rows.push({ case: 'existing-vendor-no-second-download', status: 'PASS' });

    test = fixture({delayMatrix:true});
    test.installVendor(true);
    test.loader.openQuickview({href:'/en/product?keep=1'}, 10);
    test.state.requests[0].callback('<p>waiting for matrix</p>');
    await test.clock.advance(10);
    assert.equal(test.state.matrixCalls, 1);
    assert.equal(test.state.shows, 0);
    assert.deepEqual(test.state.html, []);
    test.completeMatrix();
    await test.clock.advance(10);
    assert.equal(test.state.shows, 1);
    assert.equal(test.state.bindings, 1);
    assert.deepEqual(test.state.redirects, []);
    rows.push({case:'quickview-waits-for-matrix-before-inserting-html',status:'PASS'});

    for (const staleResponse of ['<p>old product</p>', { error: 'old request failed' }]) {
        test = fixture();
        test.installVendor(true);
        test.loader.openQuickview({ href: '/fr/product-a?facets=9&quickViewItem=true&quickViewItem=old' }, 10);
        test.loader.openQuickview({ href: '/fr/product-b?facets=7&sorting=price' }, 10);
        const requested = new URL(test.state.requests[0].url);
        assert.deepEqual(requested.searchParams.getAll('quickViewItem'), ['true']);
        assert.equal(requested.searchParams.get('facets'), '9');
        assert.equal(test.state.requests[0].type, 'html');
        test.state.requests[1].callback('<p>latest product</p>');
        await test.clock.advance(0);
        test.state.requests[0].callback(staleResponse);
        await test.clock.advance(10);
        assert.deepEqual(test.state.html, ['<p>latest product</p>']);
        assert.equal(test.state.shows, 1);
        assert.equal(test.state.starts, 1);
        assert.equal(test.state.bindings, 1);
        assert.deepEqual(test.state.redirects, []);
        rows.push({ case: typeof staleResponse === 'string' ? 'stale-success-ignored-url-normalized' : 'stale-error-ignored', status: 'PASS' });
    }

    for (const failure of ['invalid-html', 'gallery-download', 'matrix-download']) {
        test = fixture({delayMatrix:failure === 'matrix-download'});
        if (failure !== 'gallery-download') test.installVendor(true);
        test.loader.openQuickview({ href: '/es/product?facets=7%2C9&query=zapato+azul&quickViewItem=true&keep=1' }, 10);
        if (failure === 'invalid-html') test.state.requests[0].callback({ error: 'server' });
        else if (failure === 'matrix-download') {
            test.state.requests[0].callback('<p>valid product</p>');
            test.failMatrix();
        } else test.state.scripts[0].emit('error');
        await test.clock.advance(0);
        assert.equal(test.state.redirects.length, 1);
        const fallback = new URL(test.state.redirects[0]);
        assert.equal(fallback.pathname, '/es/product');
        assert.equal(fallback.searchParams.get('facets'), '7,9');
        assert.equal(fallback.searchParams.get('query'), 'zapato azul');
        assert.equal(fallback.searchParams.get('keep'), '1');
        assert.equal(fallback.searchParams.has('quickViewItem'), false);
        assert.equal(test.state.shows, 0);
        assert.equal(test.state.bindings, 0);
        rows.push({ case: failure + '-localized-product-fallback', status: 'PASS' });
    }
    test = fixture({realApi: true});
    test.installVendor(true);
    test.loader.openQuickview({href: '/it/product?keep=1&quickViewItem=true'}, 10);
    await test.clock.advance(29999);
    assert.equal(test.state.redirects.length, 0, 'Allow slow HTML rendering until its deadline');
    assert.equal(test.state.shows, 0);
    await test.clock.advance(1);
    assert.equal(test.state.redirects.length, 1, 'A hanging HTML read must reach the product fallback');
    assert.equal(test.state.requests.length, 1, 'No automatic HTML retry');
    assert.equal(test.state.requests[0].method, 'GET');
    assert.equal(test.state.requests[0].type, 'html');
    assert.equal(test.state.requests[0].timeout, 30000, 'Deadline travels through the production API adapter');
    assert.equal(test.state.requests[0].timedOut, true);
    assert.equal(test.state.redirects[0], 'https://shop.example/it/product?keep=1');
    rows.push({case: 'hanging-html-actual-api-adapter-deadline', status: 'PASS', beforeDeadlineMs: 29999, timeoutMs: 30000, requests: 1, redirects: 1});

    test.loader.openQuickview({href: '/it/product?keep=1'}, 10);
    test.state.requests[1].succeed('<p>retry product</p>');
    await test.clock.advance(10);
    assert.deepEqual(test.state.html, ['<p>retry product</p>']);
    assert.equal(test.state.shows, 1);
    assert.equal(test.state.bindings, 1);
    assert.equal(test.state.redirects.length, 1);
    assert.equal(test.state.scripts.length, 0, 'A later explicit interaction reuses ready assets');
    rows.push({case: 'new-interaction-after-html-timeout', status: 'PASS', requests: 2, automaticRetries: 0});

    for (const responseDelay of [0, 20000]) {
        test = fixture({realApi: true});
        test.installVendor(true);
        test.loader.openQuickview({href: '/fr/slow-product'}, 10);
        await test.clock.advance(responseDelay);
        test.state.requests[0].succeed('<p>complete product</p>');
        await test.clock.advance(30010 - responseDelay);
        assert.deepEqual(test.state.html, ['<p>complete product</p>']);
        assert.equal(test.state.shows, 1);
        assert.equal(test.state.bindings, 1);
        assert.deepEqual(test.state.redirects, []);
        assert.equal(test.state.requests[0].timedOut, false);
        rows.push({case: 'html-success-through-actual-api-' + responseDelay + 'ms', status: 'PASS', responseDelayMs: responseDelay});
    }

    test = fixture({realApi: true});
    test.installVendor(true);
    test.loader.openQuickview({href: '/en/old-product'}, 10);
    await test.clock.advance(5000);
    test.loader.openQuickview({href: '/en/new-product'}, 10);
    test.state.requests[1].succeed('<p>new product</p>');
    await test.clock.advance(25010);
    assert.equal(test.state.requests[0].timedOut, true);
    assert.deepEqual(test.state.html, ['<p>new product</p>']);
    assert.equal(test.state.shows, 1);
    assert.deepEqual(test.state.redirects, [], 'A stale read deadline must not navigate away from a newer choice');
    rows.push({case: 'stale-html-timeout-keeps-newer-quickview', status: 'PASS'});
    const report = { status: 'PASS', mode: 'ISOLATED_LOADER_FAKE_DOM_CLOCK_VENDOR_AND_AJAX', cases: rows };
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify(report, null, 2));
    console.log(rows.length + ' loader lifecycle cases PASS');
}
run().catch(error => {
    if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({status: 'FAIL', cases: rows, error: error.message}, null, 2));
    console.error(error); process.exitCode = 1;
});
