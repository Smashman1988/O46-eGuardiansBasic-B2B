// Four checkout longhands are supplied by earlier Critical CSS and later Main.
// A presence check alone cannot prove this: an intervening same-priority rule
// can change the early cascade. Freeze the relevant ordered declarations after
// the accepted early/full browser comparison. Any change needs a fresh audit;
// do not update these hashes merely to make a failing test pass.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const postcss = require('postcss');

const contracts = [
    ['.custom-control-input', 'opacity', '0'],
    ['.card-body', '-webkit-box-flex', '1'],
    ['.modal-content', '-webkit-box-direction', 'normal'],
    ['.modal-body', '-webkit-box-flex', '1']
];
const relevant = new Set(['all', ...contracts.map(([, property]) => property)]);
const expected = {
    head: 'b02b2f905fe02785062864d8968395b7b73419e002e23d8529cf7de6ad828e19',
    checkoutSource: '1d08b8efb060848b986156942bb498612da9fe01349c2275dd32fddff8ffc731',
    checkout: '941c4071c2923e4606666638e5c74c6c6babf731b6925537f8a0cd3ccc32f0c6',
    main: 'b267ceca2c9c2bbf1e99077d3f8fa630f0df2968378b4ea9d298d263b349e542'
};
const normalize = text => text.trim().replace(/\s*([>+~])\s*/g, '$1');
function rows(css) {
    const result = [];
    postcss.parse(css).walkRules(rule => {
        const context = [];
        for (let parent = rule.parent; parent && parent.type !== 'root'; parent = parent.parent) {
            context.unshift([parent.type, parent.name || parent.selector, parent.params || '']);
        }
        const selectors = rule.selectors.map(normalize);
        for (const declaration of rule.nodes.filter(node => node.type === 'decl')) {
            result.push({context, selectors, property: declaration.prop, value: declaration.value.trim(), important: !!declaration.important});
        }
    });
    return result;
}
const hash = data => crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
const project = data => data.filter(row => relevant.has(row.property));
const head = fs.readFileSync('resources/views/PageDesign/Partials/Head.twig', 'utf8');
const blocks = [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)].map(match => ({
    attributes: match[1], css: match[2].replace(/\{\{[\s\S]*?\}\}/g, 'O46_TWIG_URL')
}));
const primary = blocks.filter(block => block.css.startsWith('@font-face'));
assert.equal(primary.length, 3, 'All three page-type Critical CSS branches are required');
const source = rows(fs.readFileSync('resources/css/checkout.css', 'utf8'));
const checkout = rows(fs.readFileSync('resources/css/checkout.min.css', 'utf8'));
const main = rows(fs.readFileSync('resources/css/main.min.css', 'utf8'));
function matching(data, selector, property, value) {
    return data.filter(row => row.context.length === 0 && row.selectors.includes(selector) && row.property === property && row.value === value && !row.important);
}
for (const [selector, property, value] of contracts) {
    for (const [branch, block] of primary.entries()) assert.ok(matching(rows(block.css), selector, property, value).length,
        `Critical branch ${branch} must supply ${selector} ${property}:${value}`);
    assert.ok(matching(main, selector, property, value).length, `Main fallback missing: ${selector} ${property}`);
    assert.equal(matching(source, selector, property, value).length, 0, `Checkout source reintroduced shared ${selector} ${property}`);
    assert.equal(matching(checkout, selector, property, value).length, 0, `Checkout asset reintroduced shared ${selector} ${property}`);
}
const projections = {
    head: blocks.flatMap((block, index) => project(rows(block.css)).map(row => [index < 3 ? ['pdp', 'category', 'general'][index] : block.attributes.trim(), row])),
    checkoutSource: project(source), checkout: project(checkout), main: project(main)
};
for (const [name, projection] of Object.entries(projections)) assert.equal(hash(projection), expected[name],
    `${name}: cross-file cascade changed; re-audit the four shared longhands and compare early + full CSS before updating this guard`);

assert.ok(!head.includes('data-eg-footer-images-critical'), 'Footer image geometry must have one Critical CSS owner');
const footer = blocks.filter(block => block.attributes.includes('data-eg-footer-critical'));
assert.equal(footer.length, 1);
const footerRules = rows(footer[0].css);
const footerGeometry = [
    ['footer img[src=""][data-src]', 'display', 'inline-block'],
    ['footer .footer-logo-focus', 'aspect-ratio', '324/120'],
    ['footer .footer-logo-sat1', 'aspect-ratio', '192/120'],
    ['footer .footer-logo-galileo', 'aspect-ratio', '1'],
    ['footer .footer-logo-ntv', 'aspect-ratio', '192/120'],
    ['footer .footer-logo-omr', 'aspect-ratio', '170/120']
];
for (const [selector, property, value] of footerGeometry) assert.equal(footerRules.filter(row =>
    row.context.length === 0 && row.selectors.includes(selector) && row.property === property &&
    row.value.replace(/\s*\/\s*/g, '/') === value && !row.important).length, 1,
    `Footer geometry must be emitted exactly once: ${selector} ${property}`);
const orderedFooterGeometry = footerRules.flatMap(row => row.selectors.map(selector =>
    [selector, row.property, row.value.replace(/\s*\/\s*/g, '/')])).filter(([selector, property]) =>
    footerGeometry.some(([expectedSelector, expectedProperty]) => selector === expectedSelector && property === expectedProperty));
assert.deepEqual(orderedFooterGeometry, footerGeometry, 'Keep the retained footer geometry in its verified selector/declaration order');
console.log(JSON.stringify({status: 'PASS', sharedCheckoutLonghands: contracts.length, headBranches: primary.length,
    orderedCascadeProjectionGuards: Object.keys(expected).length, uniqueFooterGeometryRules: footerGeometry.length}));
