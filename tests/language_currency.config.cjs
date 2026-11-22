const path = require('node:path');
const { defineConfig } = require('@playwright/test');

const output = path.resolve(__dirname, '../.cache/settings-dialogs/sprache-waehrung');
module.exports = defineConfig({
    testDir: __dirname,
    testMatch: 'language_currency.spec.cjs',
    globalSetup: require.resolve('./cross-browser/prepare.cjs'),
    outputDir: path.join(output, 'results'),
    reporter: [['list'], ['json', {outputFile: path.join(output, 'tests.json')}]],
    workers: 1,
    use: {serviceWorkers: 'block', viewport: {width: 1440, height: 900}},
    projects: [{name: 'chrome', use: {channel: 'chrome'}}, {name: 'edge', use: {channel: 'msedge'}}]
});
