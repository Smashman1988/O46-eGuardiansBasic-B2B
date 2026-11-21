// The workflow matrix and its report must derive their scope from the same tag.
module.exports = function profilesForTag(tag, profiles) {
    if (tag?.startsWith('b2b-browser-iphone-')) return ['iphone'];
    if (tag?.startsWith('b2b-browser-test-')) return Object.keys(profiles);
    throw new Error('Unbekannter Browser-Test-Tag: '+String(tag));
};
