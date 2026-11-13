// Legacy command retained; production assets now use the complete reproducible build.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const acorn = require('acorn');
const { minify } = require('terser');
function regions(source) {
    const found = {};
    const flattenedCategory = [];
    function visit(node) {
        if (!node?.type) return;
        let key;
        if (node.type === 'AssignmentExpression' && node.left.type === 'MemberExpression' &&
            node.left.object.type === 'ThisExpression' && ['bindEvents', 'observeLazyImages'].includes(node.left.property.name)) {
            key = node.left.property.name;
        }
        if (node.type === 'CallExpression' && node.callee.type === 'FunctionExpression') {
            const text = source.slice(node.start, node.end);
            if (text.includes('pagination__next') && text.includes('quickViewItem') && text.includes('append.infiniteScroll')) key = 'category';
        }
        if (node.type === 'SequenceExpression') {
            const start = node.expressions.findIndex(x => x.type === 'AssignmentExpression' &&
                source.slice(x.left.start,x.left.end) === 'InfiniteScroll.prototype.updateHistory');
            if (start >= 0) {
                const last = node.expressions.findIndex((x,i) => i > start && x.type === 'CallExpression' &&
                    source.slice(x.start,x.end).startsWith('$(".category-product-list").on("append.infiniteScroll"'));
                if (last >= start) flattenedCategory.push({start:node.expressions[start].start,end:node.expressions[last].end});
            }
        }
        if (key) { assert.ok(!found[key], 'Unique region ' + key); found[key] = node; }
        for (const value of Object.values(node)) {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value?.type) visit(value);
        }
    }
    const tree = acorn.parse(source, { ecmaVersion: 'latest' });
    visit(tree);
    if (!found.category && flattenedCategory.length) {
        assert.equal(flattenedCategory.length,1); found.category = flattenedCategory[0];
    }
    // The fixture adapter splits top-level compressed sequences back into
    // statements. Retain the complete, real history/append setup in that shape.
    if (!found.category) {
        const start = tree.body.findIndex(node => node.type === 'ExpressionStatement' &&
            node.expression.type === 'AssignmentExpression' &&
            source.slice(node.expression.left.start, node.expression.left.end) === 'InfiniteScroll.prototype.updateHistory');
        if (start >= 0) {
            const end = tree.body.findIndex((node, index) => index >= start && node.type === 'ExpressionStatement' &&
                source.slice(node.start, node.end).includes('append.infiniteScroll') &&
                source.slice(node.start, node.end).includes('pagination__next'));
            assert.ok(end >= start && end - start <= 4, 'Contiguous actual category lifecycle statements');
            found.category = { start: tree.body[start].start, end: tree.body[end].end, statementGroup: true };
        }
    }
    return found;
}
async function build() {
    const report = await require('./build-js.cjs').build();
    console.log(JSON.stringify(report));
}
if (require.main === module) build().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { regions };
