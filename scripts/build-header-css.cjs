// Minify only the Premium-Kompakt suffix. Never regenerate the legacy stylesheet.
// O46_CLEAN_CSS_MODULE may point to an existing clean-css 5.3.3 installation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const CleanCSS = require(process.env.O46_CLEAN_CSS_MODULE || 'clean-css');
const root = path.resolve(__dirname, '..');
const marker = '/* B2B Premium-Kompakt header: isolated patch; do not rebuild the legacy CSS. */';
const source = fs.readFileSync(path.join(root, 'resources/css/main.css'), 'utf8');
const productionFile = path.join(root, 'resources/css/main-211025.min.css');
const production = fs.readFileSync(productionFile, 'utf8');
assert.equal(source.split(marker).length, 2, 'Expected exactly one header patch');
const split = production.indexOf('\n' + marker);
const base = split < 0 ? production : production.slice(0, split);
const hash = crypto.createHash('sha256').update(base.replaceAll('\r\n', '\n')).digest('hex');
assert.equal(hash, 'c62cf6e83159a8208a0c008b718ebdeb31e7d509ffc95513db967f3c19269d69', 'Production baseline changed: inspect it before rebuilding this patch');
const result = new CleanCSS({level: 0, rebase: false}).minify(source.slice(source.indexOf(marker) + marker.length));
assert.deepEqual(result.errors, [], 'Header CSS minification errors');
assert.deepEqual(result.warnings, [], 'Header CSS minification warnings');
const next = base + '\n' + marker + '\n' + result.styles + '\n';
const headFile = path.join(root, 'resources/views/PageDesign/Partials/Head.twig');
const head = fs.readFileSync(headFile, 'utf8');
const inline = '<style data-premium-header>' + result.styles + '</style>';
const nextHead = head.includes('<style data-premium-header>')
    ? head.replace(/<style data-premium-header>[\s\S]*?<\/style>/, inline)
    : head.replace('<link rel="stylesheet" href="{{ plugin_path(\'GuardiansBasicB2B\') }}/css/main-211025.min.css', inline + '\n<link rel="stylesheet" href="{{ plugin_path(\'GuardiansBasicB2B\') }}/css/main-211025.min.css');
assert(nextHead.includes(inline), 'Critical header CSS insertion point missing');
if (process.argv.includes('--check')) {
    assert.equal(production, next, 'Production header suffix differs from editable source');
    assert.equal(head, nextHead, 'Critical header CSS differs from editable source');
} else {
    fs.writeFileSync(productionFile, next);
    fs.writeFileSync(headFile, nextHead);
}
console.log(JSON.stringify({legacySha256: hash, legacyBytes: Buffer.byteLength(base), headerBytes: Buffer.byteLength(result.styles), check: process.argv.includes('--check')}));
