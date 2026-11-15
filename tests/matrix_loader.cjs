// Actual core loader against controlled DOM, script events and clock.
// Matrix business behavior and browser script order have their existing suites.
// node tests/matrix_loader.cjs [--source-only] [report.json]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const args = process.argv.slice(2);
const modes = args.includes('--source-only') ? ['source'] : ['source', 'min'];
const output = args.find(value => !value.startsWith('--'));
const rows = [];
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

function element() {
    const values = new Set();
    return {
        nodeType: 1, isConnected: true, disabled: false, hidden: true, textContent: '',
        dataset: { unavailable: 'Varianten nicht verfügbar' }, attributes: {}, listeners: new Map(),
        classList: {
            add(value) { values.add(value); }, remove(value) { values.delete(value); },
            contains(value) { return values.has(value); },
            toggle(value) { if (values.has(value)) { values.delete(value); return false; } values.add(value); return true; }
        },
        setAttribute(name, value) { this.attributes[name] = value; },
        addEventListener(name, callback) {
            if (!this.listeners.has(name)) this.listeners.set(name, new Set());
            this.listeners.get(name).add(callback);
        },
        removeEventListener(name, callback) { this.listeners.get(name)?.delete(callback); },
        emit(name) { for (const callback of [...(this.listeners.get(name) || [])]) callback(); },
        matches() { return false; }, querySelectorAll() { return []; },
        remove() { this.isConnected = false; }
    };
}

function fixture(mode, options = {}) {
    const state = { scripts: [], observers: [], warnings: [], installs: 0, scans: [], timers: new Map(), nextTimer: 1, roots: [] };
    const document = {
        currentScript: { getAttribute(name) { return name === 'data-eg-matrix-src' && !options.noUrl ? '/assets/matrix.min.js?v=1' : null; } },
        documentElement: element(),
        querySelector(selector) {
            if (selector === 'script[data-eg-matrix]') return state.scripts.find(script => script.isConnected) || null;
            return null;
        },
        querySelectorAll(selector) { assert.equal(selector, '[data-eg-size-matrix]'); return state.roots.filter(root => root.isConnected); },
        createElement(name) { assert.equal(name, 'script'); return element(); },
        head: { appendChild(script) { state.scripts.push(script); } }
    };
    class Observer {
        constructor(callback) { this.callback = callback; this.connected = false; state.observers.push(this); }
        observe(target, settings) {
            assert.equal(target, document.documentElement);
            assert.deepEqual(JSON.parse(JSON.stringify(settings)), { childList: true, subtree: true });
            this.connected = true;
        }
        disconnect() { this.connected = false; }
        emit(node) { if (this.connected) this.callback([{ addedNodes: [node] }]); }
    }
    const sandbox = {
        document, Promise, URL, console: { warn(...values) { state.warnings.push(values); } },
        setTimeout(callback, delay) { const id = state.nextTimer++; state.timers.set(id, { callback, delay }); return id; },
        clearTimeout(id) { state.timers.delete(id); }, MutationObserver: options.noObserver ? undefined : Observer
    };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    const file = path.join(__dirname, '../resources/js/core' + (mode === 'min' ? '.min' : '') + '.js');
    vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
    const core = sandbox.O46Core;
    assert.equal(typeof core.ensureMatrix, 'function', 'Build core.min.js before running both modes');
    function root() {
        const node = element();
        const children = { status: element(), toggle: element(), button: element(), table: element() };
        node.matches = selector => selector === '[data-eg-size-matrix]';
        node.querySelector = selector => ({
            '[data-eg-matrix-status]': children.status,
            '[data-eg-matrix-error-toggle]': children.toggle,
            '[data-eg-matrix-add]': children.button,
            '.eg-size-matrix-table': children.table
        })[selector] || null;
        state.roots.push(node);
        return { node, ...children };
    }
    function installDefinition() {
        core.matrix = function () {
            if (core.installed.matrix) return;
            state.installs++;
            core.installed.matrix = true;
            sandbox.egInitSizeMatrices = container => { state.scans.push(container); };
        };
    }
    async function downloaded(script = state.scripts.at(-1)) { installDefinition(); script.emit('load'); await flush(); }
    async function timeout() {
        const pending = [...state.timers.values()];
        assert.equal(pending.length, 1);
        assert.equal(pending[0].delay, 15000);
        pending[0].callback();
        await flush();
    }
    return { state, document, sandbox, core, root, installDefinition, downloaded, timeout };
}

async function run(mode) {
    let test = fixture(mode);
    test.core.matrix(); test.core.matrix();
    assert.equal(test.state.scripts.length, 0);
    assert.equal(test.state.installs, 0);
    assert.equal(test.state.observers.length, 1);
    test.state.observers[0].emit(element());
    const detached = test.root(); detached.node.isConnected = false;
    test.state.observers[0].emit(detached.node);
    assert.equal(test.state.scripts.length, 0);
    rows.push({ mode, case: 'No matrix: no module download or installation; one detector; unrelated/detached content ignored', status: 'PASS' });

    const late = test.root();
    test.state.observers[0].emit(late.node);
    const first = test.core.ensureMatrix(), second = test.core.ensureMatrix();
    assert.equal(first, second);
    assert.equal(test.state.scripts.length, 1);
    await test.downloaded(); await first;
    assert.equal(test.state.installs, 1);
    assert.equal(test.state.scans[0], test.document);
    assert.equal(test.state.observers[0].connected, false);
    assert.equal(test.state.timers.size, 0);
    await test.core.ensureMatrix(); test.core.matrix();
    assert.equal(test.state.installs, 1);
    assert.equal(test.state.scripts.length, 1);
    rows.push({ mode, case: 'Late matrix + concurrent callers: one request, one installation, immediate document scan, detector disconnected', status: 'PASS' });

    test = fixture(mode);
    const removed = test.root();
    test.core.matrix(); removed.node.isConnected = false;
    await test.downloaded();
    assert.equal(test.state.installs, 1);
    assert.equal(test.document.querySelectorAll('[data-eg-size-matrix]').length, 0);
    rows.push({ mode, case: 'Matrix removed before download: scans current document, does not retain removed insertion root', status: 'PASS' });

    test = fixture(mode);
    test.installDefinition();
    test.core.matrix();
    assert.equal(test.state.installs, 1, 'Parser-discovered PDP module retains synchronous entry call');
    await test.core.ensureMatrix();
    assert.equal(test.state.scripts.length, 0);
    assert.equal(test.state.observers.length, 0);
    rows.push({ mode, case: 'PDP definition already loaded: synchronous installation, no second request or detector', status: 'PASS' });

    test = fixture(mode);
    const eager = element(); test.state.scripts.push(eager);
    const eagerPromise = test.core.ensureMatrix();
    assert.equal(test.state.scripts.length, 1);
    await test.downloaded(eager); await eagerPromise;
    assert.equal(test.state.installs, 1);
    rows.push({ mode, case: 'Existing eager script in flight reused; validates installed public initializer', status: 'PASS' });

    test = fixture(mode);
    test.core.matrix();
    const failedRoot = test.root();
    test.state.observers[0].emit(failedRoot.node);
    const failed = test.core.ensureMatrix().catch(error => error);
    test.state.scripts[0].emit('error');
    assert.match((await failed).message, /could not be loaded/);
    assert.equal(test.state.observers[0].connected, false);
    assert.equal(failedRoot.button.disabled, true);
    assert.equal(failedRoot.status.textContent, failedRoot.status.dataset.unavailable);
    assert.equal(failedRoot.toggle.hidden, false);
    failedRoot.toggle.emit('click');
    assert.equal(failedRoot.toggle.attributes['aria-expanded'], 'true');
    test.core.matrix(); test.state.observers[0].emit(test.root().node);
    assert.equal(test.state.scripts.length, 1, 'No automatic retry from DOM or repeated bootstrap');
    const retry = test.core.ensureMatrix();
    assert.equal(test.state.scripts.length, 2, 'Later explicit interaction may retry a read-only asset');
    await test.downloaded(); await retry;
    assert.equal(failedRoot.button.disabled, false);
    assert.equal(failedRoot.toggle.listeners.get('click').size, 0, 'Temporary error handler removed before real module binding');
    assert.equal(failedRoot.toggle.attributes['aria-expanded'], 'false');
    assert.equal(failedRoot.status.classList.contains('eg-matrix-error-open'), false);
    rows.push({ mode, case: 'Download error: fixed existing error UI, disabled purchase, no observer retry; explicit retry cleans temporary state/listener', status: 'PASS' });

    test = fixture(mode);
    const timed = test.core.ensureMatrix().catch(error => error);
    await test.timeout();
    assert.match((await timed).message, /could not be loaded/);
    assert.equal(test.state.scripts[0].isConnected, false);
    assert.equal(test.core.matrixPromise, null);
    assert.equal(test.state.timers.size, 0);
    rows.push({ mode, case: '15-second asset timeout: request state and listeners released, no retry loop', status: 'PASS' });

    test = fixture(mode);
    const invalid = test.core.ensureMatrix().catch(error => error);
    test.state.scripts[0].emit('load');
    assert.match((await invalid).message, /did not initialize/);
    assert.equal(test.core.installed.matrix, undefined);
    assert.equal(test.state.scripts[0].isConnected, false);
    const fixed = test.core.ensureMatrix(); await test.downloaded(); await fixed;
    assert.equal(test.state.scripts.length, 2);
    rows.push({ mode, case: 'HTTP-loaded file without matrix definition rejected; later corrected module can load', status: 'PASS' });

    test = fixture(mode, { noUrl: true });
    await assert.rejects(test.core.ensureMatrix(), /could not be loaded/);
    assert.equal(test.state.scripts.length, 0);
    test.core.matrixUrl = '/assets/matrix.min.js?v=1';
    const configured = test.core.ensureMatrix(); await test.downloaded(); await configured;
    rows.push({ mode, case: 'Missing asset URL fails closed without request; later explicit load accepts restored configuration', status: 'PASS' });

    test = fixture(mode, { noObserver: true });
    test.core.matrix();
    assert.equal(test.state.scripts.length, 0);
    const explicit = test.core.ensureMatrix(); await test.downloaded(); await explicit;
    assert.equal(test.state.installs, 1);
    rows.push({ mode, case: 'Without MutationObserver: no unsupported detector; explicit Quickview dependency still loads', status: 'PASS' });

    test = fixture(mode);
    test.document.readyState = 'complete';
    const initialHook = test.sandbox.egInitSizeMatrices;
    assert.equal(typeof initialHook, 'function');
    assert.equal(test.state.scripts.length, 0, 'Registering the public hook must not trigger a download');
    const manualRoot = test.root().node;
    assert.equal(initialHook(manualRoot), undefined, 'Public API retains its undefined return contract');
    assert.equal(initialHook(manualRoot), undefined);
    assert.equal(test.state.scripts.length, 1);
    await test.downloaded();
    assert.notEqual(test.sandbox.egInitSizeMatrices, initialHook);
    assert.equal(test.state.installs, 1);
    assert.equal(test.state.scans.filter(root => root === manualRoot).length, 2);
    rows.push({ mode, case: 'Public initializer before lazy load: explicit roots after DOMContentLoaded share one download and reach real hook', status: 'PASS' });
}

(async () => {
    for (const mode of modes) await run(mode);
    const report = { status: 'PASS', mode: 'LOCAL_CONTROLLED_LOADER_CONTRACT_NOT_NATIVE_PERFORMANCE', cases: rows.length, rows };
    if (output) fs.writeFileSync(path.resolve(output), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ status: report.status, cases: report.cases, modes }));
})().catch(error => { console.error(error); process.exitCode = 1; });
