const {expect} = require('@playwright/test');

// Mobile WebKit updates device metrics and screen size through separate commands.
// Reapply the same size when its CSS viewport still describes the preceding screen.
async function setViewport(page, size, mobileWebKit) {
    await page.setViewportSize(size);
    if (!mobileWebKit || page.url() === 'about:blank') return;
    const measure = () => page.evaluate(width => ({
        media: matchMedia('(width: ' + width + 'px)').matches,
        layout: document.documentElement.clientWidth,
        inner: innerWidth,
        visual: visualViewport.width,
        screen: screen.width,
        dpr: devicePixelRatio,
        meta: document.querySelector('meta[name=viewport]')?.content
    }),size.width);
    const initial=await measure();
    if (!initial.media || initial.layout !== size.width) {
        // Keep the requested width while triggering a fresh layout with the updated screen.
        await page.setViewportSize({width:size.width,height:size.height+1});
        await page.setViewportSize(size);
    }
    await expect.poll(measure,{message:'WebKit CSS-Viewport nach Resize, erste Messung '+JSON.stringify(initial)})
        .toMatchObject({media:true,layout:size.width,inner:size.width});
}
module.exports = {setViewport};
