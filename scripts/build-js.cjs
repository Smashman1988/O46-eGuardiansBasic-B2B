// Reproducible production JavaScript build. No partial edits of old minified files.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { minify } = require('terser');
const acorn = require('acorn');
const versions = require('./asset-versioning.cjs');
const files = versions.jsFiles;
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
async function prepare({root = path.resolve(__dirname, '..')} = {}) {
    assert.equal(require('terser/package.json').version, '5.44.0', 'Use the pinned Terser version');
    const report = [], outputs = [];
    for (const [source, target] of files) {
        const sources = source === 'core.js' ? [source, 'search.js', 'zoom-loader.js'] :
            ['main.js', 'cat.js', 'vue.js'].includes(source) ? ['listing-item.js', source] : [source];
        const input = sources.map(file => versions.lf(fs.readFileSync(path.join(root, 'resources/js', file)))).join('\n');
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
        outputs.push({file: 'resources/js/' + target, content: output});
        report.push({ source: 'resources/js/' + source, sources: sources.map(file => 'resources/js/' + file), target: 'resources/js/' + target,
            sourceSha256: hash(input), sha256: hash(output), bytes: Buffer.byteLength(output) });
    }
    const manifest = JSON.stringify({ format: 'Terser safe compression passes=2, keep_fargs; facets keeps prior defaults; no unsafe/property mangling; packed MagicZoom unchanged; jQuery vendor copy',
        terser: '5.44.0', files: report }, null, 2) + '\n';
    outputs.push({file: 'build/js/manifest.json', content: manifest});
    return {root, outputs, report};
}
async function build(options = {}) {
    const prepared = await prepare(options);
    versions.publish(versions.prepare(prepared), options);
    return prepared.report;
}
module.exports = { prepare, build, files };
if (require.main === module) build({ check: process.argv.includes('--check') })
    .then(report => console.log(JSON.stringify({ status: 'PASS', files: report }, null, 2)))
    .catch(error => { console.error(error); process.exitCode = 1; });
