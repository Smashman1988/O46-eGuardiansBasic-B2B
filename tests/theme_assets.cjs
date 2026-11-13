// Resolve the shared module definitions at their page call sites for the existing
// isolated module tests. Full deferred-script loading is tested by theme_bundles.cjs.
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const assert = require('node:assert/strict');
function readAsset(file, encoding = 'utf8') {
    const source = fs.readFileSync(file, encoding);
    if (!/^(main|cat|item|vue)(-020726\.min)?\.js$/.test(path.basename(file)) || !source.includes('O46Core.')) return source;
    const core = fs.readFileSync(path.join(path.dirname(file), file.includes('.min.') ? 'core.min.js' : 'core.js'), 'utf8');
    const modules = {};
    for (const statement of acorn.parse(core, { ecmaVersion: 'latest' }).body) {
        const assignment = statement.expression;
        if (assignment?.type !== 'AssignmentExpression' || assignment.left.object?.name !== 'O46Core') continue;
        const value = assignment.right.type === 'LogicalExpression' ? assignment.right.right : assignment.right;
        if (value.type === 'FunctionExpression') modules[assignment.left.property.name] = value;
    }
    const edits = [];
    for (const statement of acorn.parse(source, { ecmaVersion: 'latest' }).body) {
        const call = statement.expression;
        if (call?.type !== 'CallExpression' || call.callee.object?.object?.name !== 'O46Core' || call.callee.property?.name !== 'call') continue;
        const key = call.callee.object.property.name, module = modules[key];
        assert.ok(module, 'Missing shared module ' + key);
        // Drop only the once guard and its success marker. Original module ASTs
        // remain intact; scoped parameters retain their original call argument.
        const installedFlag = node => node?.type === 'MemberExpression' && node.property?.name === key &&
            node.object?.property?.name === 'installed' && node.object?.object?.name === 'O46Core';
        const first = module.body.body[0], last = module.body.body.at(-1)?.expression;
        assert.ok(first?.type === 'IfStatement' && installedFlag(first.test) && first.consequent.type === 'ReturnStatement' && !first.alternate,
            'Only the actual once guard may be excluded from fixture ' + key);
        assert.ok(last?.type === 'AssignmentExpression' && last.operator === '=' && installedFlag(last.left) && last.right.value === true,
            'Only the actual success marker may be excluded from fixture ' + key);
        const body = module.body.body.slice(1, -1);
        let code = body.map(node => core.slice(node.start, node.end)).join('\n');
        if (module.params.length) code = 'var ' + module.params[0].name + '=' + source.slice(call.arguments[1].start, call.arguments[1].end) + ';\n' + code;
        edits.push([statement.start, statement.end, code]);
    }
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
module.exports = { readAsset, eventsOwner };
