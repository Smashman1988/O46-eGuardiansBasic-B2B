// Execute the real shared API wrapper with captured transport, without shop writes.
// node tests/api_transport.cjs [--min] [--reference=commit] [--output=report.json]
const fs = require('node:fs');
const vm = require('node:vm');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const option = name => process.argv.find(value => value.startsWith(name + '='))?.slice(name.length + 1);
const file = 'resources/js/core' + (process.argv.includes('--min') ? '.min' : '') + '.js';
const reference = option('--reference');
const source = reference ? cp.execFileSync('git', ['show', reference + ':' + file], {encoding: 'utf8'}) : fs.readFileSync(file, 'utf8');
let wrapper;
function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'AssignmentExpression' && node.left.object?.name === 'O46Core' && node.left.property?.name === 'apiservice') {
        assert.equal(wrapper, undefined, 'Exactly one API initializer');
        wrapper = source.slice(node.right.start, node.right.end);
    }
    for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value);
}
visit(acorn.parse(source, {ecmaVersion: 'latest'}));
assert.ok(wrapper, 'API initializer found');
function fixture() {
    const calls = [];
    const context = vm.createContext({O46Core: {installed: {}}, eGuardians: {}, $: {ajax: options => calls.push(options)}, console});
    vm.runInContext('(' + wrapper + ')()', context);
    return {api: context.eGuardians.apiservice, calls};
}
const rows = [];
function test(name, run) {
    try { run(); rows.push({name, status: 'PASS'}); }
    catch (error) { rows.push({name, status: 'FAIL', error: error.message}); }
}
test('PUT dispatches one request with original data and JSON default', () => {
    const {api, calls} = fixture(), data = {quantity: 2};
    assert.doesNotThrow(() => api.put('/fixture/item/7', data));
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'PUT');
    assert.equal(calls[0].url, '/fixture/item/7');
    assert.equal(calls[0].data, data);
    assert.equal(calls[0].dataType, 'json');
    assert.equal(calls[0].timeout, undefined, 'No new write deadline');
});
for (const type of [undefined, 'json', 'html', 'text']) test('DELETE preserves response contract: ' + (type || 'default'), () => {
    const {api, calls} = fixture(), data = {id: 7}, response = {data: true};
    const received = [];
    api.delete('/fixture/wishlist/7', data, value => received.push(value), type);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'DELETE');
    assert.equal(calls[0].data, data);
    assert.equal(calls[0].dataType, type || 'json');
    calls[0].success(response, 'success', {status: 200});
    assert.equal(received.length, 1);
    assert.equal(received[0], response);
    assert.equal(calls[0].timeout, undefined);
});
for (const method of ['get', 'post', 'delete']) for (const malformed of [false, true]) test(method.toUpperCase() + ' error callback without retry: ' + (malformed ? 'non-JSON' : 'JSON'), () => {
    const {api, calls} = fixture(), received = [];
    api[method]('/fixture/error', '', value => received.push(value));
    const xhr = {status: 500, responseText: malformed ? '<h1>error</h1>' : '{"error":"failure"}'};
    calls[0].error(xhr);
    assert.equal(received.length, 1);
    assert.equal(calls.length, 1, 'No automatic write/read retry');
    if (malformed) assert.equal(received[0], xhr);
    else assert.equal(received[0].error, 'failure');
});
test('GET alone can opt into the existing read deadline and HTML response', () => {
    const {api, calls} = fixture(), received = [];
    api.get('/fixture/product', '', (value, status) => received.push([value, status]), 'html', 30000);
    assert.equal(calls[0].timeout, 30000);
    assert.equal(calls[0].dataType, 'html');
    calls[0].success('<article>product</article>', 'success', {status: 200});
    assert.deepEqual(received, [['<article>product</article>', 200]]);
});
const report = {file, reference: reference || 'working-tree', cases: rows.length, pass: rows.filter(row => row.status === 'PASS').length, rows};
if (option('--output')) fs.writeFileSync(option('--output'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.pass !== report.cases) process.exitCode = 1;
