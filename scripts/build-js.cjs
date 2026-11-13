// Reproducible production JavaScript build. No partial edits of old minified files.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { minify } = require('terser');
const acorn = require('acorn');
const root = path.resolve(__dirname, '..');
const files = [
    ['core.js', 'core.min.js'],
    ...['main', 'cat', 'item', 'vue'].map(name => [name + '.js', name + '-020726.min.js']),
    ['magiczoom.js', 'magiczoom.min.js'],
    ['facets.js', 'facets.min.js'],
    ['vendor/jquery-3.7.1.js', 'jquery-3.7.1.min.js']
];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
async function build({ check = false } = {}) {
    assert.equal(require('terser/package.json').version, '5.44.0', 'Use the pinned Terser version');
    const report = [];
    for (const [source, target] of files) {
        const sources = source === 'core.js' ? [source, 'search.js', 'zoom-loader.js'] :
            ['main.js', 'cat.js', 'vue.js'].includes(source) ? ['listing-item.js', source] : [source];
        const input = sources.map(file => fs.readFileSync(path.join(root, 'resources/js', file), 'utf8')).join('\n');
        acorn.parse(input, { ecmaVersion: 'latest' });
        // jQuery is the unchanged, versioned upstream distribution. MagicZoom's
        // packed payload and license are retained; never transform its eval text.
        const output = source.startsWith('vendor/') ? input : (await minify(input, {
            // Preserve public properties, globals and argument arity. Default
            // safe compression only; no unsafe transforms or property mangling.
            compress: source === 'magiczoom.js' ? false : source === 'facets.js' ? true :
                { defaults: true, passes: 2, keep_fargs: true },
            mangle: source !== 'magiczoom.js',
            format: { comments: source === 'facets.js' ? false : /^!|@license|Copyright|license terms|Version:|Build:/i }
        })).code + '\n';
        acorn.parse(output, { ecmaVersion: 'latest' });
        const file = path.join(root, 'resources/js', target);
        if (check) assert.equal(hash(fs.readFileSync(file)), hash(output), target + ' differs from its source build');
        else fs.writeFileSync(file, output);
        report.push({ source: 'resources/js/' + source, sources: sources.map(file => 'resources/js/' + file), target: 'resources/js/' + target,
            sourceSha256: hash(input), sha256: hash(output), bytes: Buffer.byteLength(output) });
    }
    const manifest = JSON.stringify({ format: 'Terser safe compression passes=2, keep_fargs; facets keeps prior defaults; no unsafe/property mangling; packed MagicZoom unchanged; jQuery vendor copy',
        terser: '5.44.0', files: report }, null, 2) + '\n';
    const manifestFile = path.join(root, 'build/js/manifest.json');
    if (check) assert.equal(fs.readFileSync(manifestFile, 'utf8'), manifest, 'Stale JavaScript manifest');
    else fs.writeFileSync(manifestFile, manifest);
    return report;
}
module.exports = { build, files };
if (require.main === module) build({ check: process.argv.includes('--check') })
    .then(report => console.log(JSON.stringify({ status: 'PASS', files: report }, null, 2)))
    .catch(error => { console.error(error); process.exitCode = 1; });
