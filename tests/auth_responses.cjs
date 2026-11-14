// Local contract regression: actual theme API, auth service, UI and entry handlers.
// HTTP delivery and DOM interfaces are controlled doubles. No accounts or network.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const referenceIndex = process.argv.indexOf('--reference');
const reference = referenceIndex < 0 ? null : process.argv[referenceIndex + 1];
const minified = process.argv.includes('--min');
const outputIndex = process.argv.indexOf('--output');
const output = outputIndex < 0 ? null : process.argv[outputIndex + 1];
const read = file => reference ? cp.execFileSync('git', ['show', reference + ':' + file], {encoding: 'utf8', maxBuffer: 4e6}) : fs.readFileSync(file, 'utf8');
function assignment(source, owner, key, optional = false) {
    const found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' &&
            (node.left.property.name || node.left.property.value) === key &&
            (owner === 'this' ? node.left.object.type === 'ThisExpression' : node.left.object.name === owner)) {
            const value = node.right.type === 'LogicalExpression' ? node.right.right : node.right;
            found.push(source.slice(value.start, value.end));
        }
        for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(visit); else if (value?.type) visit(value);
    }
    visit(acorn.parse(source, {ecmaVersion: 'latest'}));
    if (optional && !found.length) return null;
    assert.equal(found.length, 1, owner + '.' + key);
    return found[0];
}
const core = read('resources/js/core' + (minified ? '.min' : '') + '.js');
function eventHandler(source, key) {
    // The page IIFE owns eGuardians; Terser renames that closure binding (e.g. t).
    // Retain its actual events-owner binding when extracting an individual method.
    let owner;
    function visit(node, ancestors = []) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.object?.type === 'ThisExpression' &&
            (node.left.property.name || node.left.property.value) === key) {
            const events = [...ancestors].reverse().find(parent => parent.type === 'AssignmentExpression' &&
                (parent.left.property?.name || parent.left.property?.value) === 'events');
            assert.equal(events?.left.object.type, 'Identifier', 'Expected page event owner');
            const declaration = ancestors.find(parent => parent.type === 'VariableDeclarator' && parent.id.name === 'eGuardians');
            assert.ok(declaration, 'Expected eGuardians page IIFE');
            owner = events.left.object.name;
        }
        for (const value of Object.values(node)) if (Array.isArray(value)) value.forEach(child => visit(child, [...ancestors, node]));
        else if (value?.type) visit(value, [...ancestors, node]);
    }
    visit(acorn.parse(source, {ecmaVersion: 'latest'}));
    assert.ok(owner, 'Expected closure owner for ' + key);
    return '(function(' + owner + '){return (' + assignment(source, 'this', key) + ')})(eGuardians)';
}
const loginOk = name => ({data: null, events: {AfterAccountAuthentication: {isSuccess: true, accountContact: {firstName: name}}}});
const logoutOk = {data: 200, events: {AfterAccountContactLogout: []}};
const scenarios = [
    {kind: 'login', name: 'confirmed login', status: 200, data: loginOk('Fixture'), success: true},
    {kind: 'login', name: 'wrong credentials without auth event', status: 401, data: {data: null, events: {}, error: {message: 'Invalid credentials'}}, errorKey: 'wronguserlogindata'},
    {kind: 'login', name: 'blocked account', status: 401, data: {events: {AfterAccountAuthentication: {isSuccess: false}}, error: {message: 'user is blocked'}}, errorKey: 'banneduser'},
    {kind: 'login', name: 'server error', status: 500, data: {}, errorKey: '0'},
    {kind: 'login', name: 'network failure', status: 0, data: {}, errorKey: '0'},
    {kind: 'login', name: 'invalid success envelope', status: 200, data: {data: null, events: {}}, errorKey: '0'},
    {kind: 'login', name: 'rejection without error field', status: 401, data: {events: {AfterAccountAuthentication: {isSuccess: false}}}, errorKey: 'wronguserlogindata'},
    {kind: 'login', name: 'confirmed login without contact', status: 200, data: {events: {AfterAccountAuthentication: {isSuccess: true, accountContact: null}}}, success: true},
    {kind: 'login', name: 'untrusted contact name', status: 200, data: loginOk('<img src=x onerror="throw 1">&\'Fixture'), success: true, escapedName: true},
    {kind: 'login', name: 'truthy string is not confirmation', status: 200, data: {events: {AfterAccountAuthentication: {isSuccess: 'true', accountContact: {firstName: 'Fixture'}}}}, errorKey: '0'},
    {kind: 'logout', name: 'confirmed logout', status: 200, data: logoutOk, success: true},
    {kind: 'logout', name: 'server error', status: 500, data: {}, errorKey: '0'},
    {kind: 'logout', name: 'network failure', status: 0, data: {}, errorKey: '0'},
    {kind: 'logout', name: 'invalid success envelope', status: 200, data: {data: null, events: {}}, errorKey: '0'},
    {kind: 'logout', name: 'confirmed logout without optional event', status: 200, data: {data: 200, events: {}}, success: true}
];
function translations(lang) {
    const values = {0: 'Ceres generic action error (' + lang + ')'};
    for (const line of read('resources/lang/' + lang + '/Template.properties').split(/\r?\n/)) {
        const match = /^([^#=\s]+)\s*=\s*(.*)$/.exec(line.trim());
        if (match) values[match[1]] = match[2];
    }
    for (const key of ['login1', 'login2', 'banneduser', 'wronguserlogindata', 'successlogout']) assert.ok(values[key], lang + '/' + key);
    return values;
}
function run(bundle, lang, scenario) {
    const source = read('resources/js/' + bundle + (minified ? '.min' : '') + '.js');
    const result = {bundle, lang, scenario: scenario.name, kind: scenario.kind, status: scenario.status, requests: 0,
        shown: 0, hidden: 0, messages: [], rendered: [], redirects: 0, cacheInvalidations: 0, error: null};
    let pending;
    const timers = [];
    const jq = selector => ({val: () => 'fixture', removeClass() {return this;}, addClass() {return this;},
        attr() {return this;}, removeAttr() {return this;}, alert() {return this;},
        insertBefore() {result.rendered.push(selector); return this;}});
    jq.ajax = options => {result.requests++; pending = options;};
    const location = {href: 'https://fixture.invalid/', reload() {result.redirects++;}};
    const context = {console: {error() {}, warn() {}}, $: jq, jQuery: jq,
        document: {location}, location, setTimeout: fn => {timers.push(fn);}, clearTimeout() {},
        messageServiceTranslations: translations(lang),
        O46Core: {installed: {}, basketHeader: {invalidate() {result.cacheInvalidations++; return Promise.resolve();}}},
        eGuardians: {helper: {btnShowLoader() {result.shown++;}, btnHideLoader() {result.hidden++;}}, validator: {checkInputs: () => true}}
    };
    context.window = context;
    vm.createContext(context);
    for (const module of ['apiservice', 'ui']) vm.runInContext('(' + assignment(core, 'O46Core', module) + ')()', context);
    const legacyUser = bundle === 'vue' ? assignment(source, 'eGuardians', 'user', true) : null;
    if (legacyUser) vm.runInContext('eGuardians.user=(' + legacyUser + ')', context);
    else vm.runInContext('(' + assignment(core, 'O46Core', 'user') + ')()', context);
    for (const type of ['success', 'error']) {
        const show = context.eGuardians.ui.message[type].show;
        context.eGuardians.ui.message[type].show = message => {result.messages.push({type, message: message.message}); show(message);};
    }
    vm.runInContext('runHandler=' + eventHandler(source, scenario.kind + 'User'), context);
    try {
        context.runHandler({});
        assert.ok(pending, 'Exactly one captured transport expected');
        if (scenario.status >= 200 && scenario.status < 300) pending.success(scenario.data, 'success', {status: scenario.status});
        else pending.error({status: scenario.status, responseText: JSON.stringify(scenario.data)});
        for (const timer of timers) timer();
        if (location.href !== 'https://fixture.invalid/') result.redirects++;
    } catch (error) {result.error = error.name + ': ' + error.message;}
    result.valid = result.error === null && result.requests === 1 && result.hidden === result.shown &&
        result.messages.length === 1 && result.messages[0].type === (scenario.success ? 'success' : 'error') &&
        result.redirects === (scenario.success ? 1 : 0) && result.cacheInvalidations === (scenario.success ? 1 : 0) &&
        (!scenario.errorKey || result.messages[0].message === context.messageServiceTranslations[scenario.errorKey]) &&
        (!scenario.escapedName || (result.rendered.some(html => html.includes('&lt;img')) && result.rendered.every(html => !html.includes('<img'))));
    return result;
}
const rows = [];
for (const bundle of ['main', 'cat', 'item', 'vue']) for (const scenario of scenarios) rows.push(run(bundle, 'de', scenario));
// Real theme labels in each additional language; shared behavior is covered above.
for (const lang of ['en', 'fr', 'it', 'es']) for (const scenario of [scenarios[0], scenarios[2], scenarios[3], scenarios[10]]) rows.push(run('main', lang, scenario));
const report = {mode: 'LOCAL_EXACT_SOURCE_HTTP_AND_DOM_DOUBLES', native: false, reference, minified,
    summary: {cases: rows.length, pass: rows.filter(row => row.valid).length, fail: rows.filter(row => !row.valid).length,
        throws: rows.filter(row => row.error).length, stuckLoaders: rows.filter(row => row.hidden !== row.shown).length,
        falseLogoutSuccesses: rows.filter(row => row.kind === 'logout' && !row.scenario.startsWith('confirmed logout') && row.messages.some(m => m.type === 'success')).length}, rows};
if (output) {fs.mkdirSync(path.dirname(output), {recursive: true}); fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');}
console.log(JSON.stringify(report.summary));
if (!reference) assert.equal(report.summary.fail, 0, JSON.stringify(rows.filter(row => !row.valid), null, 2));
