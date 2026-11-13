// Legacy command retained; production assets now use the complete reproducible build.
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
    const report = await require('./build-js.cjs').build();
    console.log(JSON.stringify(report));
}
module.exports = {region};
if (require.main === module) build().catch(error => { console.error(error); process.exitCode = 1; });
