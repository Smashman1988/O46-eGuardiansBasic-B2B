const {test, expect} = require('@playwright/test');

// Keep the observation in the document so resize delivery and rendering are sampled
// together, independently of the time a runner needs for a Playwright round trip.
function observeViewport(width) {
    const exact = matchMedia('(width: ' + width + 'px)');
    const desktop = matchMedia('(min-width: 992px)');
    const events = [];
    let generation = 0;
    const measure = () => ({
        time: performance.now(), media: exact.matches, desktop: desktop.matches,
        layout: document.documentElement.clientWidth, inner: innerWidth,
        visual: window.visualViewport?.width, screen: screen.width, dpr: devicePixelRatio,
        meta: document.querySelector('meta[name=viewport]')?.content
    });
    const onChange = event => {
        generation++;
        events.push({source: event.currentTarget === window.visualViewport ? 'visualViewport' : event.type, ...measure()});
    };
    const sources = [[window,'resize'],[window.visualViewport,'resize'],[exact,'change'],[desktop,'change']];
    for (const [target,type] of sources) target?.addEventListener(type,onChange);
    const before = measure();

    // Two paints with the same CSS metrics and no intervening resize or media
    // event establish a stable layout. A stable previous layout can be retried once.
    function settle() {
        return new Promise(resolve => {
            let previous, frame, samples = 0;
            function finish(stable, last) {
                cancelAnimationFrame(frame);
                clearTimeout(timer);
                resolve({stable, samples, last});
            }
            function paint() {
                const last = measure();
                samples++;
                const signature = [generation,last.media,last.desktop,last.layout].join('/');
                if (signature === previous) return finish(true,last);
                previous = signature;
                frame = requestAnimationFrame(paint);
            }
            // A suspended render loop must also return a diagnostic.
            const timer = setTimeout(()=>finish(false,measure()),1500);
            frame = requestAnimationFrame(paint);
        });
    }
    return {before, events, settle, dispose() {
        for (const [target,type] of sources) target?.removeEventListener(type,onChange);
    }};
}

async function setViewport(page, size, mobileWebKit) {
    if (!mobileWebKit || page.url() === 'about:blank') {
        await page.setViewportSize(size);
        return;
    }
    if (await page.evaluate(()=>document.hidden)) {
        // Hidden documents may suspend animation frames. Verify the actual CSS
        // breakpoint independently before returning to the foreground.
        await page.setViewportSize(size);
        const layout = () => page.evaluate(width => ({
            hidden: document.hidden, exact: matchMedia('(width: '+width+'px)').matches,
            client: document.documentElement.clientWidth
        }),size.width);
        const first = await layout();
        if (first.hidden && !first.exact) {
            await page.setViewportSize({...size,height:size.height+1});
            await page.setViewportSize(size);
        }
        await expect.poll(layout,{timeout:1500}).toEqual({hidden:true,exact:true,client:size.width});
        return;
    }
    const observer = await page.evaluateHandle(observeViewport,size.width);
    const target = {stable:true, last:{media:true, desktop:size.width>=992, layout:size.width}};
    const observations = [];
    try {
        await page.setViewportSize(size);
        const sample = () => observer.evaluate(o=>o.settle());
        let result = await sample();
        observations.push(result);
        if (result.stable && (!result.last.media || result.last.layout !== size.width)) {
            // WebKit may still lay out at the previous screen width. Invalidate that
            // layout at the requested width, then restore the exact requested height.
            await page.setViewportSize({...size,height:size.height+1});
            await page.setViewportSize(size);
            result = await sample();
            observations.push(result);
        }
        expect(result,'WebKit CSS-Viewport nach Resize auf '+size.width+' px').toMatchObject(target);
    } finally {
        try {
            const evidence = await observer.evaluate(o=>{o.dispose();return {before:o.before,events:o.events};});
            await test.info().attach('viewport-'+size.width,{body:JSON.stringify({size,...evidence,observations}),contentType:'application/json'});
        } finally { await observer.dispose(); }
    }
}
module.exports = {setViewport};
