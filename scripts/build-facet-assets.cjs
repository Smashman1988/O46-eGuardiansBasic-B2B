// Compatibility entry: use the same full build, manifest and URL publication.
const {build} = require('./build-matrix-assets.cjs');
module.exports = {build};
if (require.main === module) build({check: process.argv.includes('--check')})
    .then(report => console.log(JSON.stringify(report)))
    .catch(error => {console.error(error.stack || error.message); process.exitCode = 1;});
