// Exercise the real CSS build only in an isolated repository-shaped copy.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const builder = require('../scripts/build-css.cjs');
const project = path.resolve(__dirname, '..');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const generated = ['resources/css/main.min.css', 'resources/css/checkout.min.css',
    'build/css/main.min.css', 'build/css/checkout.min.css', 'build/css/manifest.json',
    'resources/views/PageDesign/Partials/Head.twig', 'resources/asset-manifest.json',
    'resources/views/PageDesign/PageDesign.twig'];

function fixture(output) {
    fs.mkdirSync(path.dirname(output), {recursive: true});
    const root = fs.mkdtempSync(path.join(path.dirname(output), 'css-build-'));
    for (const file of [...generated, 'resources/css/main.css', 'resources/css/checkout.css',
        'resources/views/PageDesign/Partials/Footer.twig', 'build/js/manifest.json',
        'scripts/asset-versioning.cjs', 'resources/asset-versions.json',
        ...['css', 'matrix-assets', 'facet-assets', 'card-css', 'js'].map(name => 'scripts/build-' + name + '.cjs')]) {
        fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
        fs.copyFileSync(path.join(project, file), path.join(root, file));
    }
    fs.cpSync(path.join(project, 'resources/js'), path.join(root, 'resources/js'), {recursive: true});
    fs.copyFileSync(path.join(project, 'resources/css/contact-widget.css'), path.join(root, 'resources/css/contact-widget.css'));
    return root;
}
function snapshot(root) {
    const files = [...generated, 'build/js/manifest.json', 'resources/asset-versions.json'];
    function collect(dir) { for (const entry of fs.readdirSync(path.join(root, dir), {withFileTypes: true})) {
        const file = dir + '/' + entry.name;
        if (entry.isDirectory()) collect(file); else files.push(file);
    } }
    collect('resources/js');
    return Object.fromEntries(files.map(file => [file, hash(fs.readFileSync(path.join(root, file)))]));
}
function cli(root, file, args = [], extraEnv = {}) {
    return cp.spawnSync(process.execPath, [file, ...args], {cwd: root, encoding: 'utf8', windowsHide: true,
        env: {...process.env, NODE_PATH: [path.join(project, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter), ...extraEnv}});
}
function bump(root, assets) {
    const file = path.join(root, 'resources/asset-versions.json');
    const versions = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const asset of assets) {
        assert.ok(Number.isSafeInteger(versions[asset]) && versions[asset] > 0, asset);
        versions[asset]++;
    }
    fs.writeFileSync(file, JSON.stringify(versions, null, 2) + '\n');
}
async function run(output = path.join(project, '.cache/css-build.json')) {
    const root = fixture(output), rows = [], original = snapshot(root);
    const check = (name, fn) => { fn(); rows.push({name, status: 'PASS'}); };
    let prepared;
    check('prepare calculates all six CSS outputs without writes', () => {
        prepared = builder.prepare({root}); assert.equal(prepared.outputs.length, 6); assert.deepEqual(snapshot(root), original);
    });
    check('stale --check rejects without CSS, Head or JS writes', () => {
        fs.appendFileSync(path.join(root, generated[0]), '\n.stale-output{color:red}');
        const before = snapshot(root);
        assert.throws(() => builder.build({root, check: true}), /Asset build is stale: resources\/css\/main\.min\.css/);
        assert.deepEqual(snapshot(root), before);
    });
    check('invalid checkout source fails before any output write', () => {
        const file = path.join(root, 'resources/css/checkout.css'), source = fs.readFileSync(file, 'utf8'), before = snapshot(root);
        fs.writeFileSync(file, source + '\n.invalid{');
        try { assert.throws(() => builder.build({root}), /Unclosed block/); assert.deepEqual(snapshot(root), before); }
        finally { fs.writeFileSync(file, source); }
    });
    check('missing required critical block fails before any output write', () => {
        const file = path.join(root, generated[5]), head = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, head.replace('data-eg-matrix-critical', 'data-removed-matrix-critical'));
        const before = snapshot(root);
        try { assert.throws(() => builder.build({root}), /Exactly one existing matrix/); assert.deepEqual(snapshot(root), before); }
        finally { fs.writeFileSync(file, head); }
    });
    check('complete build replaces stale output and keeps mirrors identical', () => {
        builder.build({root});
        for (const name of ['main.min.css', 'checkout.min.css']) {
            assert.deepEqual(fs.readFileSync(path.join(root, 'resources/css', name)), fs.readFileSync(path.join(root, 'build/css', name)));
        }
        assert.ok(!fs.readFileSync(path.join(root, generated[0]), 'utf8').includes('stale-output'));
    });
    check('six source-derived and three card critical blocks are retained', () => {
        const head = fs.readFileSync(path.join(root, generated[5]), 'utf8');
        for (const name of ['matrix', 'logo', 'pdp-layout', 'first-paint', 'footer', 'content-layout'])
            assert.equal(head.split('<style data-eg-' + name + '-critical>').length - 1, 1);
        assert.equal(head.split('/* B2B card separators */').length - 1, 3);
    });
    check('full build is idempotent and --check is read-only', () => {
        const before = snapshot(root); assert.deepEqual(builder.build({root}).changed, []);
        builder.build({root, check: true}); assert.deepEqual(snapshot(root), before);
    });
    check('new source rule reaches both complete assets', () => {
        const file = path.join(root, 'resources/css/checkout.css'), source = fs.readFileSync(file, 'utf8');
        fs.writeFileSync(file, source + '\n.fixture-owned-source{color:#123456}');
        bump(root, ['css/checkout.min.css']); builder.build({root});
        assert.ok(fs.readFileSync(path.join(root, generated[1]), 'utf8').includes('.fixture-owned-source'));
        fs.writeFileSync(file, source); bump(root, ['css/checkout.min.css']); builder.build({root});
    });
    check('one trailing license-comment byte is normalized without source mutation', () => {
        const file = path.join(root, 'resources/css/checkout.css'), source = fs.readFileSync(file, 'utf8');
        const before = builder.prepare({root}).report.assets[1].removedTrailingWhitespaceBytes;
        const fixtureSource = '/*! fixture copyright \n */\n' + source;
        fs.writeFileSync(file, fixtureSource);
        try {
            assert.equal(builder.prepare({root}).report.assets[1].removedTrailingWhitespaceBytes, before + 1);
            assert.equal(fs.readFileSync(file, 'utf8'), fixtureSource);
        } finally { fs.writeFileSync(file, source); }
    });
    check('LF and CRLF source anchors generate identical critical geometry', () => {
        const file = path.join(root, 'resources/css/main.css'), source = fs.readFileSync(file, 'utf8');
        const before = builder.prepare({root}).report.critical;
        fs.writeFileSync(file, source.replace(/\r\n/g, '\n'));
        try { assert.deepEqual(builder.prepare({root}).report.critical, before); }
        finally { fs.writeFileSync(file, source); }
    });
    check('CSS-only build leaves every JavaScript file and JS manifest unchanged', () => {
        const after = snapshot(root); for (const [file, before] of Object.entries(original))
            if (file.startsWith('resources/js/') || file === 'build/js/manifest.json') assert.equal(after[file], before, file);
    });
    for (const script of ['scripts/build-css.cjs', 'scripts/build-card-css.cjs', 'scripts/build-matrix-assets.cjs', 'scripts/build-facet-assets.cjs']) {
        check(script + ' --check preserves all output hashes', () => {
            const before = snapshot(root), result = cli(root, script, ['--check']);
            assert.equal(result.status, 0, result.stderr); assert.deepEqual(snapshot(root), before);
        });
    }
    check('legacy matrix PostCSS override is loaded and --check remains read-only', () => {
        const spy = path.join(root, 'postcss-spy.cjs'), marker = path.join(root, 'postcss-spy-loaded.txt');
        fs.writeFileSync(spy, "require('node:fs').writeFileSync(" + JSON.stringify(marker) + ", 'loaded');\n" +
            'module.exports = require(' + JSON.stringify(require.resolve('postcss')) + ');\n');
        const before = snapshot(root), result = cli(root, 'scripts/build-matrix-assets.cjs', ['--check'], {O46_POSTCSS_MODULE: spy});
        assert.equal(result.status, 0, result.stderr);
        assert.equal(fs.readFileSync(marker, 'utf8'), 'loaded');
        assert.deepEqual(snapshot(root), before);
    });
    check('legacy facet write rebuilds CSS and retains identical JavaScript hashes', () => {
        const before = snapshot(root), result = cli(root, 'scripts/build-facet-assets.cjs');
        assert.equal(result.status, 0, result.stderr); assert.deepEqual(snapshot(root), before);
    });
    check('legacy facet source changes remain rebuildable; stale check never writes', () => {
        fs.appendFileSync(path.join(root, 'resources/js/facets.js'), '\nwindow.__fixtureFacetBuild = 1;');
        bump(root, ['js/facets.min.js']);
        const before = snapshot(root), checked = cli(root, 'scripts/build-facet-assets.cjs', ['--check']);
        assert.notEqual(checked.status, 0); assert.deepEqual(snapshot(root), before);
        const built = cli(root, 'scripts/build-facet-assets.cjs'); assert.equal(built.status, 0, built.stderr);
        assert.ok(fs.readFileSync(path.join(root, 'resources/js/facets.min.js'), 'utf8').includes('__fixtureFacetBuild'));
        // The complete legacy entry also updates its JS manifest and the generated
        // asset URLs. CSS output/critical rules must still remain byte-identical.
        for (const file of generated.slice(0, 6)) assert.equal(snapshot(root)[file], before[file], file);
        const manifest = JSON.parse(fs.readFileSync(path.join(root, 'resources/asset-manifest.json'), 'utf8'));
        assert.equal(manifest.assets['js/facets.min.js'].sha256,
            hash(fs.readFileSync(path.join(root, 'resources/js/facets.min.js'))));
        assert.ok(fs.readFileSync(path.join(root, 'resources/views/PageDesign/PageDesign.twig'), 'utf8')
            .includes('facets.min.js?v=' + manifest.assets['js/facets.min.js'].version));
    });
    check('absolute facet CLI from another checkout only reads and writes its own repository', () => {
        const foreign = fs.mkdtempSync(path.join(path.dirname(root), 'foreign-facet-cwd-'));
        const foreignSource = path.join(foreign, 'resources/js/facets.js');
        const foreignOutput = path.join(foreign, 'resources/js/facets.min.js');
        fs.mkdirSync(path.dirname(foreignSource), {recursive: true});
        fs.writeFileSync(foreignSource, 'window.__foreignFacetSource = 1;\n');
        fs.writeFileSync(foreignOutput, 'KEEP_FOREIGN_OUTPUT\n');
        const foreignBefore = [foreignSource, foreignOutput].map(file => hash(fs.readFileSync(file)));
        fs.appendFileSync(path.join(root, 'resources/js/facets.js'), '\nwindow.__intendedFacetRoot = 1;');
        bump(root, ['js/facets.min.js']);
        fs.appendFileSync(path.join(root, generated[0]), '\n.stale-intended-output{color:red}');
        const before = snapshot(root), absoluteScript = path.join(root, 'scripts/build-facet-assets.cjs');
        const checked = cli(foreign, absoluteScript, ['--check']);
        assert.notEqual(checked.status, 0, 'Stale intended output must fail --check');
        assert.deepEqual(snapshot(root), before, '--check cannot write intended outputs');
        assert.deepEqual([foreignSource, foreignOutput].map(file => hash(fs.readFileSync(file))), foreignBefore);
        const built = cli(foreign, absoluteScript);
        assert.equal(built.status, 0, built.stderr);
        const intended = fs.readFileSync(path.join(root, 'resources/js/facets.min.js'), 'utf8');
        assert.ok(intended.includes('__intendedFacetRoot'));
        assert.ok(!intended.includes('__foreignFacetSource'));
        assert.ok(!fs.readFileSync(path.join(root, generated[0]), 'utf8').includes('stale-intended-output'));
        assert.deepEqual([foreignSource, foreignOutput].map(file => hash(fs.readFileSync(file))), foreignBefore,
            'Foreign checkout source and generated JavaScript must remain untouched');
    });
    const result = {status: 'PASS', mode: 'ISOLATED_COMPLETE_CSS_BUILD', root, rows, javascriptFilesUnchanged: Object.keys(original).filter(x => x.startsWith('resources/js/')).length};
    fs.writeFileSync(output, JSON.stringify(result, null, 2)); console.log(rows.length + ' complete CSS build checks PASS'); return result;
}
module.exports = {run, fixture, snapshot, cli, generated, bump};
if (require.main === module) run(process.argv[2] && path.resolve(process.argv[2])).catch(error => {console.error(error); process.exitCode = 1;});
