const profiles = {
    chromium: {device:'Desktop Chrome', engine:'chromium'},
    chrome: {device:'Desktop Chrome', engine:'chromium', channel:'chrome'},
    edge: {device:'Desktop Edge', engine:'chromium', channel:'msedge'},
    firefox: {device:'Desktop Firefox', engine:'firefox'},
    webkit: {device:'Desktop Safari', engine:'webkit'},
    android: {device:'Pixel 5', engine:'chromium'},
    'android-small': {device:'Galaxy S9+', engine:'chromium'},
    'android-large': {device:'Pixel 7 Pro', engine:'chromium'},
    iphone: {device:'iPhone 13', engine:'webkit'},
    ipad: {device:'iPad (gen 7)', engine:'webkit'}
};
module.exports = profiles;
if (require.main === module) {
    const include = Object.entries(profiles).map(([project, p]) => ({project, install:p.channel || p.engine}));
    console.log(JSON.stringify({include}));
}
