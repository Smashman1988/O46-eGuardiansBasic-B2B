// The legacy facet CLI now uses the complete CSS build; exercise that contract in isolation.
const path = require('node:path');
require('./css_build.cjs').run(path.resolve(process.argv[2] || '.cache/facet-asset-build.json'))
    .catch(error => {console.error(error); process.exitCode = 1;});
