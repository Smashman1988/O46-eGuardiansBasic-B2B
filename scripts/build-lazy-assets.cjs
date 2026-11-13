// Update only owned lazy-image bindings and category initialization.
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
    visit(acorn.parse(source, { ecmaVersion: 'latest' }));
    if (!found.category && flattenedCategory.length) {
        assert.equal(flattenedCategory.length,1); found.category = flattenedCategory[0];
    }
    return found;
}
async function build() {
    const report = [];
    for (const name of ['cat', 'item', 'main', 'vue']) {
        const source = fs.readFileSync(`resources/js/${name}.js`, 'utf8');
        const file = `resources/js/${name}-020726.min.js`, old = fs.readFileSync(file, 'utf8');
        const a = regions(source), b = regions(old), edits = [];
        assert.ok(a.bindEvents && a.observeLazyImages && b.bindEvents);
        for (const key of ['bindEvents', 'observeLazyImages', ...(name === 'cat' ? ['category'] : [])]) {
            const node = a[key]; assert.ok(node, key);
            const value = key === 'category' ? source.slice(node.start, node.end) : source.slice(node.right.start, node.right.end);
            const result = await minify('window.__lazyBuild=' + value, { compress: false, mangle: true, format: { comments: false } });
            const expression = acorn.parse(result.code, { ecmaVersion: 'latest' }).body[0].expression.right;
            const replacement = result.code.slice(expression.start, expression.end);
            if (!b[key]) {
                assert.equal(key, 'observeLazyImages');
                edits.push([b.bindEvents.start, b.bindEvents.start, 'this.observeLazyImages=' + replacement + ';']);
            } else if (key !== 'category') {
                edits.push([b[key].right.start, b[key].right.end, replacement]);
            } else {
                let from = b[key].start, to = b[key].end;
                while (old[from - 1] === '(' && old[to] === ')') { from--; to++; }
                edits.push([from, to, '(' + replacement + ')']);
            }
        }
        let output = old;
        for (const [from, to, replacement] of edits.sort((x,y) => y[0]-x[0])) output = output.slice(0,from)+replacement+output.slice(to);
        acorn.parse(output, { ecmaVersion: 'latest' });
        fs.writeFileSync(file, output);
        report.push({ file, before: Buffer.byteLength(old), after: Buffer.byteLength(output), unchangedOutsideOwnedRegions: true });
    }
    console.log(JSON.stringify(report, null, 2));
}
if (require.main === module) build().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { regions };
