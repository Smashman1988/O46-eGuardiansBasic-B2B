// One source per stylesheet. Compute every generated output before writing any file.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const postcss = require('postcss');
const CleanCSS = require('clean-css');
const {deriveCriticalCss} = require('./build-matrix-assets.cjs');
const {syncHead} = require('./build-card-css.cjs');
const files = [['main.css', 'main-211025.min.css'], ['checkout.css', 'checkout-120525.min.css']];
const hash = value => crypto.createHash('sha256').update(value).digest('hex');

function prepare({root = path.resolve(__dirname, '..')} = {}) {
    assert.equal(require('clean-css/package.json').version, '5.3.3', 'Use the pinned clean-css version');
    const outputs = [], sources = {}, assets = [];
    for (const [sourceName, targetName] of files) {
        const source = fs.readFileSync(path.join(root, 'resources/css', sourceName), 'utf8');
        postcss.parse(source, {from: sourceName});
        const result = new CleanCSS({level: {1: {all: true}, 2: {all: true}}, rebase: false}).minify(source);
        assert.equal(result.errors.length, 0, result.errors.join('\n'));
        assert.equal(result.warnings.length, 0, result.warnings.join('\n'));
        // Retain the former matrix builder's end-of-line whitespace normalization.
        const styles = result.styles.replace(/[\t ]+(?=\r?$)/gm, '');
        postcss.parse(styles, {from: targetName});
        sources[sourceName] = source;
        outputs.push({file: 'resources/css/' + targetName, content: styles});
        outputs.push({file: 'build/css/' + targetName, content: styles});
        assets.push({source: 'resources/css/' + sourceName, target: 'resources/css/' + targetName,
            mirror: 'build/css/' + targetName, sourceSha256: hash(source), sha256: hash(styles), bytes: Buffer.byteLength(styles),
            removedTrailingWhitespaceBytes: Buffer.byteLength(result.styles) - Buffer.byteLength(styles)});
    }
    const headFile = 'resources/views/PageDesign/Partials/Head.twig';
    const head = fs.readFileSync(path.join(root, headFile), 'utf8');
    const footer = fs.readFileSync(path.join(root, 'resources/views/PageDesign/Partials/Footer.twig'), 'utf8');
    const critical = deriveCriticalCss(sources['main.css'], head, outputs[0].content, footer);
    const updatedHead = syncHead(critical.head, sources['main.css']);
    outputs.push({file: headFile, content: updatedHead});
    const manifest = {format: 'Complete sources; clean-css level 1 all + level 2 all; rebase false; existing source-derived critical CSS',
        cleanCss: '5.3.3', postcss: require('postcss/package.json').version, files: assets};
    outputs.push({file: 'build/css/manifest.json', content: JSON.stringify(manifest, null, 2) + '\n'});
    return {root, outputs, report: {assets, critical: critical.report, cardCriticalBranches: 3}};
}

function publish(prepared, {check = false} = {}) {
    const changed = prepared.outputs.filter(output => {
        const file = path.join(prepared.root, output.file);
        return !fs.existsSync(file) || !fs.readFileSync(file).equals(Buffer.from(output.content));
    });
    if (check) assert.equal(changed.length, 0, 'CSS build is stale: ' + changed.map(output => output.file).join(', '));
    else for (const output of changed) {
        const file = path.join(prepared.root, output.file);
        fs.mkdirSync(path.dirname(file), {recursive: true});
        fs.writeFileSync(file, output.content);
    }
    return {status: 'PASS', check, changed: changed.map(output => output.file), ...prepared.report};
}

function build(options = {}) { return publish(prepare(options), options); }
module.exports = {prepare, publish, build, files};
if (require.main === module) {
    try { console.log(JSON.stringify(build({check: process.argv.includes('--check')}), null, 2)); }
    catch (error) { console.error(error.stack || error.message); process.exitCode = 1; }
}
