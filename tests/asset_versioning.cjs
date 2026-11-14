// Real builders and manual numeric versions in an isolated repository copy.
// No shop/browser/network access or original resource/template writes.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {fixture, bump} = require('./css_build.cjs');
const combined = require('../scripts/build-matrix-assets.cjs');
const javascript = require('../scripts/build-js.cjs');
const stylesheet = require('../scripts/build-css.cjs');
const versioning = require('../scripts/asset-versioning.cjs');
const project = path.resolve(__dirname, '..');
const hash = b => crypto.createHash('sha256').update(b).digest('hex');
const headFile = 'resources/views/PageDesign/Partials/Head.twig';
const pageFile = 'resources/views/PageDesign/PageDesign.twig';
const manifestFile = 'resources/asset-manifest.json';
const versionsFile = 'resources/asset-versions.json';
const json = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const writeJson = (root, file, data) => fs.writeFileSync(path.join(root, file), JSON.stringify(data, null, 2) + '\n');

function snapshot(root) {
    const out = {};
    for (const base of ['resources/js', 'resources/css', 'build']) {
        function walk(dir) {
            if (!fs.existsSync(path.join(root, dir))) return;
            for (const e of fs.readdirSync(path.join(root, dir), {withFileTypes: true})) {
                const file = dir + '/' + e.name;
                if (e.isDirectory()) walk(file); else out[file] = hash(fs.readFileSync(path.join(root, file)));
            }
        }
        walk(base);
    }
    for (const file of [headFile, pageFile, manifestFile, versionsFile]) {
        if (fs.existsSync(path.join(root, file))) out[file] = hash(fs.readFileSync(path.join(root, file)));
    }
    return out;
}
function manifest(root) { return json(root, manifestFile); }
function differentAssets(before, after) {
    assert.deepEqual(Object.keys(after.assets).sort(), Object.keys(before.assets).sort());
    return Object.keys(after.assets).filter(key => JSON.stringify(before.assets[key]) !== JSON.stringify(after.assets[key])).sort();
}
function assertChanged(before, after, assets) {
    assert.deepEqual(differentAssets(before, after), [...assets].sort());
    for (const asset of assets) {
        assert.notEqual(after.assets[asset].sha256, before.assets[asset].sha256, asset + ': final bytes changed');
        assert.equal(after.assets[asset].version, before.assets[asset].version + 1, asset + ': exactly one increment');
    }
}
function assertManifestAndUrls(root) {
    const data = manifest(root), versions = json(root, versionsFile);
    assert.deepEqual(Object.keys(data).sort(), ['assets', 'schemaVersion']);
    assert.equal(data.schemaVersion, 2);
    assert.deepEqual(Object.keys(data.assets).sort(), [...versioning.assetFiles].sort());
    assert.deepEqual(Object.keys(versions).sort(), [...versioning.assetFiles].sort());
    const page = fs.readFileSync(path.join(root, pageFile), 'utf8');
    const head = fs.readFileSync(path.join(root, headFile), 'utf8');
    const templates = page + '\n' + head;
    for (const [asset, entry] of Object.entries(data.assets)) {
        assert.deepEqual(Object.keys(entry).sort(), ['sha256', 'version']);
        assert.ok(Number.isSafeInteger(entry.version) && entry.version > 0, asset + ': positive safe integer');
        assert.equal(entry.version, versions[asset], asset + ': configured version');
        assert.equal(entry.sha256, hash(fs.readFileSync(path.join(root, 'resources', asset))), asset + ': final bytes');
        assert.match(entry.sha256, /^[0-9a-f]{64}$/);
        const needle = path.posix.basename(asset) + '?v=' + entry.version;
        const expected = ['css/main.min.css', 'css/checkout.min.css', 'js/magiczoom.min.js'].includes(asset) ? 2 : 1;
        assert.equal(templates.split(needle).length - 1, expected, asset + ': active and fallback URL coverage');
        for (const match of templates.matchAll(new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^"\'\\s<>]*)', 'g'))) {
            assert.equal(match[1], '', asset + ': no timestamp/hash/additional parameter');
        }
        assert.ok(!templates.includes('?v=' + entry.sha256), asset + ': digest remains internal');
    }
    assert.ok(!/(?:main|cat|item|vue)-020726\.min\.js|main-211025\.min\.css|checkout-120525\.min\.css/.test(templates));
    const runtime = templates.replace(/\{#[\s\S]*?#\}/g, '').replace(/<!--[\s\S]*?-->/g, '');
    assert.ok(!/asset-(?:manifest|versions)\.json|hash_file|file_get_contents/.test(runtime),
        'Literal URLs require no runtime manifest/config reads or hashing');
    assert.equal((page.match(/\?v=\{\{\s*buildHash\s*\}\}/g) || []).length, 3, 'Ceres contracts stay intact');
    assert.ok(page.includes("plugin_path('AmazonPayCheckout')"), 'Payment path unchanged');
    return data;
}
function assertReadOnlyError(root, action, pattern) {
    const before = snapshot(root); assert.throws(action, pattern);
    assert.deepEqual(snapshot(root), before, 'Validation failure cannot write any input/output');
}

async function run(output = path.join(project, '.cache/asset-versioning.json')) {
    const originalProduct = snapshot(project), root = fixture(output), rows = [];
    const test = async (name, fn) => { await fn(); rows.push({name, status: 'PASS'}); };
    await test('combined prepare calculates both families and numeric versions without writes', async () => {
        const before = snapshot(root), css = stylesheet.prepare({root}), js = await javascript.prepare({root});
        const prepared = versioning.prepare({root, outputs: [...css.outputs, ...js.outputs]});
        assert.deepEqual(snapshot(root), before); assert.equal(prepared.root, root);
        assert.equal(prepared.manifest.schemaVersion, 2);
        assert.ok(!prepared.outputs.some(x => x.file === versionsFile), 'Builder cannot rewrite manual configuration');
    });
    await test('two complete builds are identical with exact numeric URLs and no runtime lookup', async () => {
        await combined.build({root}); const before = snapshot(root); assertManifestAndUrls(root);
        await combined.build({root}); assert.deepEqual(snapshot(root), before); assertManifestAndUrls(root);
    });
    await test('current --check is read-only', async () => {
        const before = snapshot(root); await combined.build({root, check: true}); assert.deepEqual(snapshot(root), before);
    });
    await test('manual versions reject invalid numeric types and ranges before writes', async () => {
        const original = json(root, versionsFile);
        try {
            for (const value of [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, '2', null, true]) {
                writeJson(root, versionsFile, {...original, 'js/facets.min.js': value});
                assertReadOnlyError(root, () => versioning.prepare({root}), /Invalid asset version for js\/facets\.min\.js/);
            }
        } finally { writeJson(root, versionsFile, original); }
    });
    await test('manual map and generated lock require exactly twelve known assets', async () => {
        for (const file of [versionsFile, manifestFile]) {
            const original = json(root, file);
            try {
                for (const mode of ['missing', 'unknown']) {
                    const changed = JSON.parse(JSON.stringify(original));
                    const entries = file === versionsFile ? changed : changed.assets;
                    if (mode === 'missing') delete entries['js/facets.min.js'];
                    else entries['js/unknown.min.js'] = file === versionsFile ? 1 : {version: 1, sha256: '0'.repeat(64)};
                    writeJson(root, file, changed); assertReadOnlyError(root, () => versioning.prepare({root}));
                }
            } finally { writeJson(root, file, original); }
        }
    });
    await test('generated lock validates schema, version and digest', async () => {
        const original = manifest(root);
        try {
            for (const mutate of [data => {data.schemaVersion = 1;},
                data => {data.assets['js/facets.min.js'].version = 0;},
                data => {data.assets['js/facets.min.js'].sha256 = 'invalid';}]) {
                const changed = JSON.parse(JSON.stringify(original)); mutate(changed); writeJson(root, manifestFile, changed);
                assertReadOnlyError(root, () => versioning.prepare({root}));
            }
        } finally { writeJson(root, manifestFile, original); }
    });
    await test('unchanged bytes reject an unnecessary manual increment', async () => {
        const original = json(root, versionsFile); bump(root, ['js/facets.min.js']);
        try { assertReadOnlyError(root, () => versioning.prepare({root}), /Asset content unchanged: js\/facets\.min\.js/); }
        finally { writeJson(root, versionsFile, original); }
    });
    await test('forgotten JavaScript increment rejects normal build and --check without writes', async () => {
        fs.appendFileSync(path.join(root, 'resources/js/facets.js'), '\nwindow.__assetVersionFixture = 1;\n');
        const before = snapshot(root);
        await assert.rejects(javascript.build({root}), /Asset content changed: js\/facets\.min\.js/);
        assert.deepEqual(snapshot(root), before);
        await assert.rejects(combined.build({root, check: true}), /Asset content changed: js\/facets\.min\.js/);
        assert.deepEqual(snapshot(root), before);
    });
    await test('correct JavaScript increment updates only its own lock entry and URL', async () => {
        const before = manifest(root); bump(root, ['js/facets.min.js']); const changedSource = snapshot(root);
        await assert.rejects(javascript.build({root, check: true}), /Asset build is stale:/);
        assert.deepEqual(snapshot(root), changedSource); await javascript.build({root});
        assertChanged(before, assertManifestAndUrls(root), ['js/facets.min.js']);
    });
    await test('changed bytes reject rollback and skipped increment', async () => {
        const sourceFile = path.join(root, 'resources/js/facets.js'), source = fs.readFileSync(sourceFile);
        const original = json(root, versionsFile), current = manifest(root).assets['js/facets.min.js'].version;
        fs.appendFileSync(sourceFile, '\nwindow.__assetRollbackFixture = 1;\n');
        const prepared = await javascript.prepare({root});
        try {
            for (const version of [current - 1, current + 2]) {
                writeJson(root, versionsFile, {...original, 'js/facets.min.js': version});
                assertReadOnlyError(root, () => versioning.prepare(prepared), /Asset content changed: js\/facets\.min\.js/);
            }
        } finally { fs.writeFileSync(sourceFile, source); writeJson(root, versionsFile, original); }
    });
    await test('shared listing source requires all three main/category/Vue increments', async () => {
        const before = manifest(root), affected = ['js/main.min.js', 'js/cat.min.js', 'js/vue.min.js'];
        fs.appendFileSync(path.join(root, 'resources/js/listing-item.js'), '\nwindow.__assetSharedListingFixture = 1;\n');
        bump(root, ['js/main.min.js']); const partial = snapshot(root);
        await assert.rejects(javascript.build({root}), /Asset content changed: js\/(?:cat|vue)\.min\.js/);
        assert.deepEqual(snapshot(root), partial);
        bump(root, ['js/cat.min.js', 'js/vue.min.js']); await javascript.build({root});
        assertChanged(before, assertManifestAndUrls(root), affected);
    });
    await test('shared core search source changes only its composed core output', async () => {
        const before = manifest(root);
        fs.appendFileSync(path.join(root, 'resources/js/search.js'), '\nwindow.__assetSharedCoreFixture = 1;\n');
        bump(root, ['js/core.min.js']); await javascript.build({root});
        assertChanged(before, assertManifestAndUrls(root), ['js/core.min.js']);
    });
    await test('stylesheet requires its explicit increment and preserves all JavaScript versions', async () => {
        const before = manifest(root);
        fs.appendFileSync(path.join(root, 'resources/css/checkout.css'), '\n.asset-version-fixture{outline-color:#123456}\n');
        assertReadOnlyError(root, () => stylesheet.build({root}), /Asset content changed: css\/checkout\.min\.css/);
        bump(root, ['css/checkout.min.css']);
        assertReadOnlyError(root, () => stylesheet.build({root, check: true}), /Asset build is stale:/);
        stylesheet.build({root}); assertChanged(before, assertManifestAndUrls(root), ['css/checkout.min.css']);
    });
    await test('combined preparation publishes explicit CSS and JavaScript increments together', async () => {
        const before = manifest(root);
        fs.appendFileSync(path.join(root, 'resources/js/facets.js'), '\nwindow.__assetVersionTogether = 2;\n');
        fs.appendFileSync(path.join(root, 'resources/css/checkout.css'), '\n.asset-version-together{outline-offset:7px}\n');
        bump(root, ['js/facets.min.js', 'css/checkout.min.css']); await combined.build({root});
        assertChanged(before, assertManifestAndUrls(root), ['css/checkout.min.css', 'js/facets.min.js']);
    });
    await test('raw contact JavaScript and CSS require their own versions', async () => {
        const before = manifest(root), affected = ['js/contact-widget.js', 'css/contact-widget.css'];
        fs.appendFileSync(path.join(root, 'resources/js/contact-widget.js'), '\nwindow.__assetVersionContact = 3;\n');
        fs.appendFileSync(path.join(root, 'resources/css/contact-widget.css'), '\n.asset-version-contact{outline-offset:3px}\n');
        assertReadOnlyError(root, () => versioning.prepare({root}), /Asset content changed: (?:css|js)\/contact-widget\./);
        bump(root, affected); await combined.build({root}); assertChanged(before, assertManifestAndUrls(root), affected);
    });
    await test('source comment with identical delivered bytes requires no increment', async () => {
        const before = manifest(root), versions = fs.readFileSync(path.join(root, versionsFile));
        fs.appendFileSync(path.join(root, 'resources/js/facets.js'), '\n// ordinary fixture comment omitted by the existing minifier\n');
        await javascript.build({root}); assert.deepEqual(manifest(root), before);
        assert.deepEqual(fs.readFileSync(path.join(root, versionsFile)), versions); assertManifestAndUrls(root);
    });
    await test('lock or numeric Twig drift fails --check without repair', async () => {
        const file = path.join(root, manifestFile), source = fs.readFileSync(file, 'utf8');
        const corrupt = JSON.parse(source); corrupt.assets['js/facets.min.js'].sha256 = '0'.repeat(64);
        fs.writeFileSync(file, JSON.stringify(corrupt)); const before = snapshot(root);
        try { await assert.rejects(combined.build({root, check: true}), /Asset content changed: js\/facets\.min\.js/); assert.deepEqual(snapshot(root), before); }
        finally { fs.writeFileSync(file, source); }
        const page = path.join(root, pageFile), text = fs.readFileSync(page, 'utf8');
        assert.match(text, /facets\.min\.js\?v=\d+/);
        fs.writeFileSync(page, text.replace(/facets\.min\.js\?v=\d+/, 'facets.min.js?v=999999'));
        const drift = snapshot(root);
        try { await assert.rejects(combined.build({root, check: true}), /Asset build is stale:/); assert.deepEqual(snapshot(root), drift); }
        finally { fs.writeFileSync(page, text); }
    });
    await test('invalid later JavaScript cannot partially publish valid changed CSS or URLs', async () => {
        const file = path.join(root, 'resources/js/facets.js'), source = fs.readFileSync(file);
        const cssFile = path.join(root, 'resources/css/checkout.css'), css = fs.readFileSync(cssFile);
        const versions = json(root, versionsFile);
        fs.appendFileSync(cssFile, '\n.asset-not-partially-written{color:red}\n'); bump(root, ['css/checkout.min.css']);
        fs.appendFileSync(file, '\nfunction invalid_asset_version_source( {'); const before = snapshot(root);
        try { await assert.rejects(combined.build({root})); assert.deepEqual(snapshot(root), before); }
        finally { fs.writeFileSync(file, source); fs.writeFileSync(cssFile, css); writeJson(root, versionsFile, versions); }
    });
    await test('clean clone rebuild from foreign CWD leaves manual versions and foreign files untouched', async () => {
        const build = path.resolve(root, 'build'), versions = fs.readFileSync(path.join(root, versionsFile));
        assert.equal(path.dirname(build), path.resolve(root)); assert.notEqual(path.resolve(root), project);
        fs.rmSync(build, {recursive: true, force: true});
        const foreign = fs.mkdtempSync(path.join(path.dirname(root), 'foreign-asset-cwd-'));
        const sentinel = path.join(foreign, manifestFile);
        fs.mkdirSync(path.dirname(sentinel), {recursive: true}); fs.writeFileSync(sentinel, 'KEEP FOREIGN MANIFEST');
        const result = cp.spawnSync(process.execPath, [path.join(root, 'scripts/build-matrix-assets.cjs')],
            {cwd: foreign, encoding: 'utf8', windowsHide: true,
                env: {...process.env, NODE_PATH: [path.join(project, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter)}});
        assert.equal(result.status, 0, result.stderr); assert.equal(fs.readFileSync(sentinel, 'utf8'), 'KEEP FOREIGN MANIFEST');
        assert.deepEqual(fs.readFileSync(path.join(root, versionsFile)), versions); assertManifestAndUrls(root);
        assert.ok(fs.existsSync(path.join(root, 'build/js/manifest.json')));
        assert.ok(fs.existsSync(path.join(root, 'build/css/manifest.json')));
        const before = snapshot(root); await combined.build({root, check: true}); assert.deepEqual(snapshot(root), before);
    });
    assert.deepEqual(snapshot(project), originalProduct, 'Isolated tests cannot change original product assets');
    const result = {status: 'PASS', mode: 'ISOLATED_REAL_NUMERIC_ASSET_BUILD', root, rows,
        assetCount: Object.keys(manifest(root).assets).length, originalProductUnchanged: true};
    fs.writeFileSync(output, JSON.stringify(result, null, 2)); console.log(rows.length + ' asset versioning checks PASS');
    return result;
}
module.exports = {run, snapshot, assertManifestAndUrls, differentAssets};
if (require.main === module) run(process.argv[2] && path.resolve(process.argv[2])).catch(error => {console.error(error); process.exitCode = 1;});
