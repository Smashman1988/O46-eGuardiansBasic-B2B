// Remove only declarations already repeated later under the same selector and
// at-rule conditions. Do not use viewport coverage to discard ShopBuilder CSS.
// node scripts/optimize-critical-css.cjs [--write]
const fs = require('node:fs');
const assert = require('node:assert/strict');
const postcss = require('postcss');

function deduplicate(css) {
    const root = postcss.parse(css);
    const rules = [];
    const seen = new Map();
    const removed = [];
    root.walkRules(rule => rules.push(rule));
    for (const rule of rules.reverse()) {
        const conditions = [];
        let parent = rule.parent;
        let supported = true;
        while (parent && parent.type !== 'root') {
            // Keyframe steps, layers and future nesting semantics are not the
            // ordinary author cascade handled by this deliberately narrow pass.
            if (parent.type !== 'atrule' || !['media', 'supports'].includes(parent.name)) supported = false;
            conditions.unshift('@' + parent.name + ' ' + parent.params);
            parent = parent.parent;
        }
        if (!supported || rule.nodes.some(node => node.type !== 'decl' && node.type !== 'comment')) continue;
        const declarations = rule.nodes.filter(node => node.type === 'decl');
        const signature = declaration => JSON.stringify([declaration.prop, declaration.value, !!declaration.important]);
        const key = selector => JSON.stringify([conditions, selector]);
        const selectors = rule.selectors;
        const future = selector => seen.get(key(selector)) || new Set();
        const retained = selectors.filter(selector => !declarations.every(declaration => future(selector).has(signature(declaration))));
        for (const declaration of declarations) {
            if (retained.every(selector => future(selector).has(signature(declaration)))) {
                removed.push({conditions, selectors, property: declaration.prop, value: declaration.value, important: !!declaration.important});
                declaration.remove();
            }
        }
        // Include the original declarations: any removed occurrence has an
        // identical later successor, so the same proof also holds transitively.
        for (const selector of selectors) {
            const values = future(selector);
            declarations.forEach(declaration => values.add(signature(declaration)));
            seen.set(key(selector), values);
        }
        if (!retained.length || !rule.nodes.some(node => node.type === 'decl')) rule.remove();
        else if (retained.length !== selectors.length) rule.selector = retained.join(',');
    }
    root.walkAtRules(rule => {
        if (rule.nodes && !rule.nodes.length && ['media', 'supports'].includes(rule.name)) rule.remove();
    });
    return {css: root.toString(), removed};
}

function optimizeHead(head) {
    const blocks = [];
    const optimized = head.replace(/<style>(@font-face[\s\S]*?)<\/style>/g, (whole, css) => {
        // Protect Twig expressions from the CSS parser, then restore verbatim.
        const expressions = [];
        const protectedCss = css.replace(/\{\{[\s\S]*?\}\}/g, value => {
            expressions.push(value);
            return 'O46_TWIG_' + (expressions.length - 1) + '_URL';
        });
        const result = deduplicate(protectedCss);
        const restored = result.css.replace(/O46_TWIG_(\d+)_URL/g, (_, index) => expressions[Number(index)]);
        blocks.push({branch: ['pdp', 'category', 'general'][blocks.length], beforeBytes: Buffer.byteLength(css), afterBytes: Buffer.byteLength(restored), removed: result.removed});
        return '<style>' + restored + '</style>';
    });
    assert.equal(blocks.length, 3, 'All three critical-CSS branches must be present');
    return {head: optimized, blocks};
}

if (require.main === module) {
    const file = 'resources/views/PageDesign/Partials/Head.twig';
    const source = fs.readFileSync(file, 'utf8');
    const result = optimizeHead(source);
    if (process.argv.includes('--write')) fs.writeFileSync(file, result.head);
    else assert.equal(result.head, source, 'Repeated critical declarations found; run with --write and review');
    console.log(JSON.stringify({status: 'PASS',write: process.argv.includes('--write'), blocks: result.blocks.map(({removed, ...block}) => ({...block, removedDeclarations: removed.length}))}));
}

module.exports = {deduplicate, optimizeHead};
