// Preserve the facet JavaScript entry; delegate all CSS to the complete source build.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {minify} = require('terser');
async function build({check = false, root = path.resolve(__dirname, '..')} = {}) {
    const cssBuilder = require('./build-css.cjs');
    const prepared = cssBuilder.prepare({root});
    const result = await minify(fs.readFileSync(path.join(root, 'resources/js/facets.js'), 'utf8'), {
        compress: true, mangle: true, format: {comments: false}
    });
    const javascript = result.code + '\n';
    const file = path.join(root, 'resources/js/facets.min.js');
    if (check) {
        assert.equal(fs.readFileSync(file, 'utf8'), javascript, 'Facet JavaScript differs from source build');
        return {jsBytes: Buffer.byteLength(javascript), css: cssBuilder.publish(prepared, {check})};
    }
    // Both stylesheets, Head and facet JavaScript have now been calculated successfully.
    const css = cssBuilder.publish(prepared);
    fs.writeFileSync(file, javascript);
    return {jsBytes: Buffer.byteLength(javascript), css};
}
module.exports = {build};
if (require.main === module) build({check: process.argv.includes('--check')})
    .then(report => console.log(JSON.stringify(report)))
    .catch(error => {console.error(error.stack || error.message); process.exitCode = 1;});
