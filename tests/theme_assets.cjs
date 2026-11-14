// Resolve the shared module definitions at their page call sites for the existing
// isolated module tests. Full deferred-script loading is tested by theme_bundles.cjs.
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
// Historical comparison fixtures can predate the stable production filenames.
// Current production reads remain strict; only explicit baseline callers use this.
function legacyAssetPath(file) {
    return file.replace(/([/\\]|^)(main|cat|item|vue)\.min\.js$/, '$1$2-020726.min.js')
        .replace(/([/\\]|^)main\.min\.css$/, '$1main-211025.min.css')
        .replace(/([/\\]|^)checkout\.min\.css$/, '$1checkout-120525.min.css');
}
function historicalAssetFile(file) {
    if (fs.existsSync(file)) return file;
    const legacy = legacyAssetPath(file);
    assert.ok(legacy !== file && fs.existsSync(legacy), 'Missing historical asset: ' + file);
    return legacy;
}
function readRevisionAsset(revision, file) {
    // Reject invalid revisions separately instead of disguising them as a rename.
    cp.execFileSync('git', ['rev-parse', '--verify', revision + '^{commit}'], {stdio: 'pipe'});
    for (const candidate of [...new Set([file, legacyAssetPath(file)])]) {
        const exists = cp.spawnSync('git', ['cat-file', '-e', revision + ':' + candidate], {stdio: 'pipe'});
        if (exists.status === 0) return cp.execFileSync('git', ['show', revision + ':' + candidate], {encoding: 'utf8', maxBuffer: 8e6});
    }
    throw new Error('Missing historical asset at ' + revision + ': ' + file);
}
function readAsset(file, encoding = 'utf8') {
    let source = fs.readFileSync(file, encoding);
    if (!/^(main|cat|item|vue)((-020726)?\.min)?\.js$/.test(path.basename(file)) || !source.includes('O46Core.')) return source;
    // Safe compression may join independent top-level expression statements.
    // Their result is unused; split only that exact top-level sequence shape so
    // isolated module extractors see the original execution boundaries again.
    const sequences = acorn.parse(source, { ecmaVersion: 'latest' }).body.filter(node =>
        node.type === 'ExpressionStatement' && node.expression.type === 'SequenceExpression');
    for (const node of sequences.reverse()) {
        const code = node.expression.expressions.map(part => '(' + source.slice(part.start, part.end) + ');').join('\n');
        source = source.slice(0, node.start) + code + source.slice(node.end);
    }
    const dir = path.dirname(file);
    const core = file.includes('.min.') ? fs.readFileSync(path.join(dir, 'core.min.js'), 'utf8') + '\n' + source :
        ['core.js', 'search.js', 'listing-item.js'].map(name => fs.readFileSync(path.join(dir, name), 'utf8')).join('\n');
    const modules = {};
    function walk(node, visit) {
        if (!node?.type || visit(node) === false) return;
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(child => walk(child, visit));
            else if (value?.type) walk(value, visit);
        }
    }
    walk(acorn.parse(core, { ecmaVersion: 'latest' }), assignment => {
        if (assignment.type !== 'AssignmentExpression' || assignment.left.object?.name !== 'O46Core') return;
        const value = assignment.right.type === 'LogicalExpression' ? assignment.right.right : assignment.right;
        if (value.type === 'FunctionExpression') modules[assignment.left.property.name] = value;
    });
    const edits = [];
    const tree = acorn.parse(source, { ecmaVersion: 'latest' });
    const topCalls = new Map(tree.body.filter(node => node.type === 'ExpressionStatement' && node.expression.type === 'CallExpression')
        .map(node => [node.expression.start, node]));
    walk(tree, call => {
        // A build-only shared source is already present in non-PDP min entries.
        // Its real function is expanded below at the original execution site.
        if (call.type === 'AssignmentExpression' && call.left.object?.name === 'O46Core' &&
            modules[call.left.property.name]) {
            edits.push([call.start, call.end, 'void 0']);
            return false;
        }
        if (call.type === 'AssignmentExpression' && call.left.property?.name === 'initLiveSearch' &&
            call.right.object?.name === 'O46Core' && call.right.property?.name === 'initLiveSearch') {
            const handler = modules.initLiveSearch;
            assert.ok(handler, 'Actual shared autocomplete implementation');
            edits.push([call.right.start, call.right.end, core.slice(handler.start, handler.end)]);
            return false;
        }
        if (call.type !== 'CallExpression' || call.callee.object?.object?.name !== 'O46Core' || call.callee.property?.name !== 'call') return;
        const key = call.callee.object.property.name, module = modules[key];
        assert.ok(module, 'Missing shared module ' + key);
        // Drop only the once guard and its success marker. Original module ASTs
        // remain intact; scoped parameters retain their original call argument.
        const installedFlag = node => node?.type === 'MemberExpression' && node.property?.name === key &&
            node.object?.property?.name === 'installed' && node.object?.object?.name === 'O46Core';
        const statements = module.body.body;
        const guardIndex = statements.findIndex(node => node.type !== 'VariableDeclaration');
        const first = statements[guardIndex];
        let body, last;
        if (first?.type === 'ExpressionStatement' && first.expression.type === 'LogicalExpression') {
            const guard = first.expression;
            assert.equal(statements.length, guardIndex + 1, 'Single compressed guard after hoisted variables');
            assert.ok(statements.slice(0, guardIndex).every(node => node.declarations.every(d => d.init === null)), 'Only uninitialized hoisted variables before guard');
            assert.ok(guard.operator === '||' && installedFlag(guard.left), 'Actual compressed once guard ' + key);
            assert.equal(guard.right.type, 'SequenceExpression');
            body = statements.slice(0, guardIndex).concat(guard.right.expressions.slice(0, -1));
            last = guard.right.expressions.at(-1);
        } else {
            assert.ok(first?.type === 'IfStatement' && installedFlag(first.test) && first.consequent.type === 'ReturnStatement' && !first.alternate,
                'Only the actual once guard may be excluded from fixture ' + key);
            body = module.body.body.slice(1, -1);
            last = module.body.body.at(-1)?.expression;
        }
        const trueLiteral = node => node?.value === true || (node?.type === 'UnaryExpression' && node.operator === '!' && node.argument.value === 0);
        assert.ok(last?.type === 'AssignmentExpression' && last.operator === '=' && installedFlag(last.left) && trueLiteral(last.right),
            'Only the actual success marker may be excluded from fixture ' + key);
        let code = body.map(node => {
            const value = core.slice(node.start, node.end);
            return /Statement$|Declaration$/.test(node.type) ? value : '(' + value + ')';
        }).join(';\n');
        if (module.params.length) code = 'var ' + module.params[0].name + '=' + source.slice(call.arguments[1].start, call.arguments[1].end) + ';\n' + code;
        const statement = topCalls.get(call.start);
        if (statement) edits.push([statement.start, statement.end, code + ';']);
        else edits.push([call.start, call.end, '(function(){' + code + '}).call(window)']);
        return false;
    });
    let result = source;
    for (const [start, end, code] of edits.sort((a, b) => b[0] - a[0])) result = result.slice(0, start) + code + result.slice(end);
    return result;
}
// Detached-method fixtures must preserve the enclosing events constructor's
// actual receiver name; the complete build can choose another minified alias.
function eventsOwner(source) {
    const owners = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.property?.name === 'events' &&
            node.right.type === 'NewExpression' && node.left.object.type === 'Identifier') owners.push(node.left.object.name);
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    visit(acorn.parse(source, {ecmaVersion: 'latest'}));
    assert.equal(owners.length, 1, 'Exactly one actual events constructor');
    return owners[0];
}
// Execute the actual shared vendor module in isolation. Compression can inline
// its UMD call, so locating it by a nested-call text substring is not reliable.
function sharedModule(file, key) {
    const page = fs.readFileSync(file, 'utf8');
    const coreFile = path.join(path.dirname(file), file.includes('.min.') ? 'core.min.js' : 'core.js');
    if (!page.includes('O46Core.' + key) || !fs.existsSync(coreFile)) return null;
    const source = fs.readFileSync(coreFile, 'utf8'), found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'AssignmentExpression' && node.left.object?.name === 'O46Core' && node.left.property?.name === key) {
            const value = node.right.type === 'LogicalExpression' ? node.right.right : node.right;
            if (value.type === 'FunctionExpression') found.push(value);
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    assert.equal(found.length, 1, 'Exactly one actual shared module ' + key);
    return 'window.O46Core=window.O46Core||{installed:{}};(' + source.slice(found[0].start, found[0].end) + ').call(window);';
}
module.exports = { readAsset, eventsOwner, sharedModule, historicalAssetFile, readRevisionAsset };
