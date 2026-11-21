const { defineConfig, devices } = require('@playwright/test');
const output = '.cache/cross-browser';
const profiles = {
    chromium: 'Desktop Chrome', chrome: 'Desktop Chrome', edge: 'Desktop Edge',
    firefox: 'Desktop Firefox', webkit: 'Desktop Safari',
    android: 'Pixel 5', 'android-small': 'Galaxy S9+', 'android-large': 'Pixel 7 Pro',
    iphone: 'iPhone 13', ipad: 'iPad (gen 7)'
};
module.exports = defineConfig({
    testDir: './tests/cross-browser',
    globalSetup: './tests/cross-browser/prepare.cjs',
    testMatch: '**/*.spec.cjs',
    outputDir: output+'/results',
    reporter: [['list'],['html',{outputFolder:output+'/report',open:'never'}],['json',{outputFile:output+'/results.json'}]],
    timeout: 60000, workers: 2, retries: 0,
    use: { screenshot:'only-on-failure',trace:'retain-on-failure',serviceWorkers:'block',actionTimeout:4500 },
    projects: Object.entries(profiles).filter(([name]) => process.env.GITHUB_ACTIONS === "true" || ["chrome","edge"].includes(name) || (process.env.O46_SYSTEM_CHROME && name.startsWith("android"))).map(([name,profile]) => ({
        name, use: { ...devices[profile],
            ...(['chrome','edge'].includes(name) ? {channel:name==='edge'?'msedge':'chrome'} : {}),
            ...(process.env.O46_SYSTEM_CHROME && name.startsWith('android') ? {channel:'chrome'} : {})
        }
    }))
});

