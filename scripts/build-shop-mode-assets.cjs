// Replace only the existing shop-mode dialog in the four shipped bundles.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const {minify} = require('terser');

function region(source) {
    const found = [];
    function visit(node) {
        if (!node?.type) return;
        if (node.type === 'CallExpression' && node.callee.type === 'FunctionExpression') {
            const text = source.slice(node.start, node.end);
            if (text.includes('o46_shop_mode') && text.includes('shop-mode-modal')) found.push(node);
        }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    visit(acorn.parse(source, {ecmaVersion: 'latest'}));
    assert.equal(found.length, 1, 'One existing shop-mode dialog');
    return found[0];
}

async function build() {
    const results = [];
    for (const name of ['main', 'cat', 'item', 'vue']) {
        const source = fs.readFileSync(`resources/js/${name}.js`, 'utf8');
        const part = region(source);
        const file = `resources/js/${name}-020726.min.js`;
        const before = fs.readFileSync(file, 'utf8');
        const target = region(before);
        const built = await minify('window.__shopModeBuild=' + source.slice(part.callee.start, part.callee.end), {
            compress: false, mangle: true, format: {comments: false}
        });
        const expression = acorn.parse(built.code, {ecmaVersion: 'latest'}).body[0].expression.right;
        const replacement = '(' + built.code.slice(expression.start, expression.end) + ')()';
        const after = before.slice(0, target.start) + replacement + before.slice(target.end);
        acorn.parse(after, {ecmaVersion: 'latest'});
        fs.writeFileSync(file, after);
        results.push({file, before: Buffer.byteLength(before), after: Buffer.byteLength(after), unchangedOutsideDialog: true});
    }
    console.log(JSON.stringify(results, null, 2));
}

module.exports = {region};
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
