// Build-time only: validate per-file version increments and emit literal Twig URLs.
// Checksums guard forgotten increments; they never appear in storefront URLs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const jsFiles = [
    ['core.js', 'core.min.js'],
    ...['main', 'cat', 'item', 'vue'].map(name => [name + '.js', name + '.min.js']),
    ['magiczoom.js', 'magiczoom.min.js'],
    ['facets.js', 'facets.min.js'],
    ['vendor/jquery-3.7.1.js', 'jquery-3.7.1.min.js']
];
const cssFiles = [['main.css', 'main.min.css'], ['checkout.css', 'checkout.min.css']];
const assetFiles = [...jsFiles.map(([, file]) => 'js/' + file), 'js/contact-widget.js',
    ...cssFiles.map(([, file]) => 'css/' + file), 'css/contact-widget.css'].sort();
const templates = ['resources/views/PageDesign/PageDesign.twig', 'resources/views/PageDesign/Partials/Head.twig'];
const lf = value => value.toString().replace(/\r\n/g, '\n');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function prepare({root = path.resolve(__dirname, '..'), outputs = []} = {}) {
    const contents = new Map(outputs.map(output => [output.file, output.content]));
    const read = file => contents.has(file) ? contents.get(file) : fs.readFileSync(path.join(root, file));
    const versions = JSON.parse(fs.readFileSync(path.join(root, 'resources/asset-versions.json'), 'utf8'));
    const previous = JSON.parse(fs.readFileSync(path.join(root, 'resources/asset-manifest.json'), 'utf8'));
    assert.equal(previous.schemaVersion, 2, 'Invalid asset lock schema; keep resources/asset-manifest.json with the sources');
    assert.deepEqual(Object.keys(versions).sort(), assetFiles, 'asset-versions.json must contain every delivery asset exactly once');
    assert.deepEqual(Object.keys(previous.assets).sort(), assetFiles, 'Asset lock must contain every delivery asset exactly once');
    const assets = {}, references = new Set();
    for (const file of assetFiles) {
        // .gitattributes deploys LF. Emit those exact bytes on Windows as well.
        const content = lf(read('resources/' + file));
        const current = versions[file], accepted = previous.assets[file], sha256 = hash(content);
        assert.ok(Number.isSafeInteger(current) && current > 0, 'Invalid asset version for ' + file + ': use a positive safe integer');
        assert.ok(accepted && Number.isSafeInteger(accepted.version) && accepted.version > 0 &&
            /^[0-9a-f]{64}$/.test(accepted.sha256), 'Invalid asset lock entry for ' + file);
        if (sha256 !== accepted.sha256) {
            assert.equal(current, accepted.version + 1,
                'Asset content changed: ' + file + '. Set its version in resources/asset-versions.json from ' +
                accepted.version + ' to ' + (accepted.version + 1) + ' and rebuild. Do not edit the generated asset-manifest.json.');
        } else {
            assert.equal(current, accepted.version,
                'Asset content unchanged: ' + file + '. Keep version ' + accepted.version + ' in resources/asset-versions.json.');
        }
        assets[file] = {version: current, sha256};
        contents.set('resources/' + file, content);
    }
    function version(file) {
        assert.ok(assets[file], 'Unknown own delivery asset: ' + file);
        references.add(file);
        return file + '?v=' + assets[file].version;
    }
    for (const file of templates) {
        let source = lf(read(file));
        source = source.replace(/(\{\{\s*plugin_path\('GuardiansBasicB2B'\)\s*\}\}\/)((?:js|css)\/[\w./-]+)(?:\?[^"\r\n]*)?(?=")/g,
            (_, base, asset) => base + version(asset));
        // Reuse the existing four branch assignments instead of adding a runtime
        // map, include, macro, service or filesystem lookup for the dynamic bundle.
        source = source.replace(/(\{% set themePageScript = ')(main|cat|item|vue)\.min\.js(?:\?[^']*)?(' %\})/g,
            (_, start, bundle, end) => start + version('js/' + bundle + '.min.js').slice(3) + end);
        contents.set(file, source);
    }
    assert.deepEqual([...references].sort(), assetFiles, 'Every delivery asset must have a versioned Twig reference');
    const page = contents.get(templates[0]);
    assert.equal((page.match(/\/js\/\{\{ themePageScript \}\}/g) || []).length, 1, 'One existing dynamic bundle URL');
    const manifest = {schemaVersion: 2, assets};
    contents.set('resources/asset-manifest.json', JSON.stringify(manifest, null, 2) + '\n');
    return {root, outputs: [...contents].map(([file, content]) => ({file, content})), manifest};
}

function publish(prepared, {check = false} = {}) {
    const changed = prepared.outputs.filter(({file, content}) => {
        const target = path.join(prepared.root, file);
        return !fs.existsSync(target) || !fs.readFileSync(target).equals(Buffer.from(content));
    });
    if (check) assert.equal(changed.length, 0, 'Asset build is stale: ' + changed.map(x => x.file).join(', '));
    else for (const {file, content} of changed) {
        const target = path.join(prepared.root, file);
        fs.mkdirSync(path.dirname(target), {recursive: true});
        fs.writeFileSync(target, content);
    }
    return {status: 'PASS', check, changed: changed.map(x => x.file)};
}
module.exports = {jsFiles, cssFiles, assetFiles, templates, lf, prepare, publish};
