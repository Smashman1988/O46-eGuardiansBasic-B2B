// Check the real builder in an isolated copy; never rebuild product assets here.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = process.cwd();
const output = path.resolve(process.argv[2] || '.cache/facet-asset-build.json');
fs.mkdirSync(path.dirname(output), {recursive: true});
const dir = fs.mkdtempSync(path.join(path.dirname(output), 'facet-build-'));
for (const file of ['scripts/build-facet-assets.cjs', 'resources/js/facets.js', 'resources/css/main.css']) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
    fs.copyFileSync(file, path.join(dir, file));
}
const cssFile = 'resources/css/main-211025.min.css';
const active = fs.readFileSync(cssFile, 'utf8');
const start = '/* B2B compact facets: built */', end = '/* End B2B compact facets */';
const begin = active.indexOf(start), last = active.indexOf(end, begin) + end.length;
assert.ok(begin > 0 && last > begin);
const block = active.slice(begin, last), remainder = active.slice(0, begin) + active.slice(last);
const rows = [];
function run(name, before, expected, exit = 0) {
    fs.writeFileSync(path.join(dir, cssFile), before);
    const result = cp.spawnSync(process.execPath, ['scripts/build-facet-assets.cjs'], {
        cwd: dir, env: {...process.env, NODE_PATH: path.resolve('.cache/asset-tools/node_modules')},
        encoding: 'utf8', windowsHide: true
    });
    assert.equal(result.status, exit, name + ': ' + result.stderr);
    assert.equal(fs.readFileSync(path.join(dir, cssFile), 'utf8'), expected, name);
    if (!exit) assert.equal(fs.readFileSync(path.join(dir, 'resources/js/facets.min.js'), 'utf8'), fs.readFileSync(path.join(root, 'resources/js/facets.min.js'), 'utf8'));
    rows.push({name, status: 'PASS'});
}
run('Current active asset remains byte-identical', active, active);
run('Unrelated trailing rule survives', active + '\n.keep{color:red}', active + '\n.keep{color:red}');
run('Existing complete stylesheet after facet block survives', block + remainder, block + remainder);
run('Repeated build is idempotent', block + remainder, block + remainder);
run('First build appends without truncating', remainder, remainder + block);
run('Missing closing marker fails without CSS mutation', active.replace(end, ''), active.replace(end, ''), 1);
fs.writeFileSync(output, JSON.stringify({mode: 'ISOLATED_ASSET_BUILD', rows}, null, 2));
console.log(rows.length + ' facet builder checks PASS');
