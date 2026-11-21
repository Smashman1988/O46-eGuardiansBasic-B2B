const { defineConfig, devices } = require('@playwright/test');
const output = '.cache/cross-browser';
const profiles = require('./tests/cross-browser/profiles.cjs');
module.exports = defineConfig({
    testDir: './tests/cross-browser',
    globalSetup: './tests/cross-browser/prepare.cjs',
    testMatch: '**/*.spec.cjs',
    outputDir: output+'/results',
    reporter: [['list'],['html',{outputFolder:output+'/report',open:'never'}],['json',{outputFile:output+'/results.json'}]],
    timeout: 60000, workers: 2, retries: 0,
    use: { screenshot:'only-on-failure',trace:'retain-on-failure',serviceWorkers:'block',actionTimeout:4500 },
    projects: Object.entries(profiles).filter(([name]) => process.env.GITHUB_ACTIONS === "true" || ["chrome","edge"].includes(name) || (process.env.O46_SYSTEM_CHROME && name.startsWith("android"))).map(([name,profile]) => ({
        name, use: { ...devices[profile.device], browserName:profile.engine,
            ...(profile.channel ? {channel:profile.channel} : {}),
            ...(process.env.O46_SYSTEM_CHROME && name.startsWith('android') ? {channel:'chrome'} : {})
        }
    }))
});

