// Build-time only: validate per-file version increments and emit literal Twig URLs.
// Checksums guard forgotten increments; they never appear in storefront URLs.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const jsFiles = [
    ['core.js', 'core.min.js'],
    ['matrix.js', 'matrix.min.js'],
    ...['main', 'cat', 'item', 'vue'].map(name => [name + '.js', name + '.min.js']),
    ['magiczoom.js', 'magiczoom.min.js'],
    ['facets.js', 'facets.min.js'],
    ['vendor/jquery-3.7.1.js', 'jquery-3.7.1.min.js']
];
const cssFiles = [['main.css', 'main.min.css'], ['checkout.css', 'checkout.min.css']];
const assetFiles = [...jsFiles.map(([, file]) => 'js/' + file),
    ...cssFiles.map(([, file]) => 'css/' + file), 'css/contact-widget.css'].sort();
const templates = ['resources/views/PageDesign/PageDesign.twig', 'resources/views/PageDesign/Partials/Head.twig'];
const lf = value => value.toString().replace(/\r\n/g, '\n');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function prepare({root = path.resolve(__dirname, '..'), outputs = []} = {}) {
    const contents = new Map(outputs.map(output => [output.file, output.content]));
    const read = file => contents.has(file) ? contents.get(file) : fs.readFileSync(path.join(root, file));
    const versions = JSON.parse(fs.readFileSync(path.join(root, 'resources/asset-versions.json'), 'utf8'));
    const previous = JSON.parse(fs.readFileSync(path.join(root, 'resources/asset-manifest.json'), 'utf8'));
    assert.ok([2, 3, 4].includes(previous.schemaVersion), 'Invalid asset lock schema; keep resources/asset-manifest.json with the sources');
    assert.deepEqual(Object.keys(versions).sort(), assetFiles, 'asset-versions.json must contain every delivery asset exactly once');
    // One explicit migration introduces the matrix asset at version 1. Once
    // schema 3 is written, missing lock entries remain errors for every asset.
    const introducingMatrix = previous.schemaVersion === 2;
    const bundlingContact = previous.schemaVersion < 4;
    const lockedFiles = introducingMatrix ? assetFiles.filter(file => file !== 'js/matrix.min.js') : [...assetFiles];
    if (bundlingContact) lockedFiles.push('js/contact-widget.js');
    assert.deepEqual(Object.keys(previous.assets).sort(), lockedFiles.sort(), 'Asset lock must contain every delivery asset exactly once');
    if (bundlingContact) {
        // Retire only this known request, without accepting an unverified source
        // change during migration. Its code is now hashed inside the core build.
        const contact = previous.assets['js/contact-widget.js'];
        assert.ok(Number.isSafeInteger(contact.version) && contact.version > 0 &&
            contact.sha256 === hash(lf(fs.readFileSync(path.join(root, 'resources/js/contact-widget.js')))),
            'Contact bundle migration requires the unchanged locked source');
    }
    const assets = {}, references = new Set();
    for (const file of assetFiles) {
        // .gitattributes deploys LF. Emit those exact bytes on Windows as well.
        const content = lf(read('resources/' + file));
        const current = versions[file], accepted = previous.assets[file], sha256 = hash(content);
        assert.ok(Number.isSafeInteger(current) && current > 0, 'Invalid asset version for ' + file + ': use a positive safe integer');
        if (introducingMatrix && file === 'js/matrix.min.js') {
            assert.equal(current, 1, 'New matrix asset must start at version 1');
            assets[file] = {version: current, sha256};
            contents.set('resources/' + file, content);
            continue;
        }
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
    // A CSS-only build must never retire the old request while leaving an old
    // core behind. Verify the actual emitted bundle and its complete inputs.
    const built = JSON.parse(read('build/js/manifest.json')).files;
    function requireBundle(name, inputs, message) {
        const entry = built.find(e => e.target === 'resources/js/' + name + '.min.js');
        const sources = inputs.map(s => 'resources/js/' + s + '.js');
        assert.ok(entry && JSON.stringify(entry.sources) === JSON.stringify(sources) &&
            entry.sha256 === assets['js/' + name + '.min.js'].sha256 &&
            entry.sourceSha256 === hash(sources.map(file => lf(read(file))).join('\n')), message);
    }
    requireBundle('core', ['core', 'search', 'zoom-loader', 'contact-widget'], 'Contact bundle requires a current complete core build; run npm run build');
    requireBundle('item', ['matrix', 'item'], 'PDP requires a current combined matrix/item build; run npm run build');
    requireBundle('main', ['listing-item', 'main'], 'Shared main/Vue delivery requires a current main build; run npm run build');
    function version(file) {
        assert.ok(assets[file], 'Unknown own delivery asset: ' + file);
        references.add(file);
        return file + '?v=' + assets[file].version;
    }
    for (const file of templates) {
        let source = lf(read(file));
        source = source.replace(/(\{\{\s*plugin_path\('GuardiansBasicB2B'\)\s*\}\}\/)((?:js|css)\/[\w./-]+)(?:\?[^"\r\n]*)?(?=")/g,
            (_, base, asset) => base + version(asset));
        // Reuse the existing branch assignments instead of adding a runtime
        // map, include, macro, service or filesystem lookup for the dynamic bundle.
        source = source.replace(/(\{% set themePageScript = ')(main|cat|item|vue)\.min\.js(?:\?[^']*)?(' %\})/g,
            (_, start, bundle, end) => start + version('js/' + bundle + '.min.js').slice(3) + end);
        contents.set(file, source);
    }
    // Old cached HTML can still fetch the locked Vue v5 asset. New pages share main.
    assert.deepEqual([...references].sort(), assetFiles.filter(file => file !== 'js/vue.min.js'), 'Every active asset must have a versioned Twig reference');
    const page = contents.get(templates[0]);
    assert.equal((page.match(/\/js\/\{\{ themePageScript \}\}/g) || []).length, 1, 'One existing dynamic bundle URL');
    const manifest = {schemaVersion: 4, assets};
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
