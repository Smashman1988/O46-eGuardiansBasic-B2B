const {test, expect} = require('@playwright/test');

// Keep the observation in the document so resize delivery and rendering are sampled
// together, independently of the time a runner needs for a Playwright round trip.
function observeViewport(width) {
    let exact = matchMedia('(width: ' + width + 'px)');
    const desktop = matchMedia('(min-width: 992px)');
    const events = [];
    let generation = 0;
    const meta=document.querySelector('meta[name=viewport]');
    const measure = () => ({
        time: performance.now(), media: exact.matches, desktop: desktop.matches,
        layout: document.documentElement.clientWidth, inner: innerWidth,
        visual: window.visualViewport?.width, screen: screen.width, dpr: devicePixelRatio,
        meta: meta?.content
    });
    const onChange = event => {
        generation++;
        events.push({source: event.currentTarget === window.visualViewport ? 'visualViewport' : event.type, ...measure()});
    };
    const sources = [[window,'resize'],[window.visualViewport,'resize'],[desktop,'change']];
    for (const [target,type] of sources) target?.addEventListener(type,onChange);
    exact.addEventListener('change',onChange);
    let before = measure();
    function reset(nextWidth) {
        exact.removeEventListener('change',onChange);
        width=nextWidth;
        exact=matchMedia('(width: '+width+'px)');
        exact.addEventListener('change',onChange);
        generation=0;
        events.length=0;
        before=measure();
    }

    // Two paints with the same CSS metrics and no intervening resize or media
    // event establish a stable layout. A stable previous layout can be retried once.
    function settle(holdMs=0, strictClient=true) {
        return new Promise(resolve => {
            let previous, stableSince, frame, samples = 0, confirming = false;
            const signature = last => [generation,last.media,last.desktop,last.layout,last.inner,last.visual].join('/');
            const target = last => last.media && last.desktop === (width>=992) && (!strictClient || last.layout===width);
            function finish(stable, last) {
                cancelAnimationFrame(frame);
                clearTimeout(timer);
                resolve({stable, samples, last, confirming, heldMs:stableSince===undefined?0:last.time-stableSince});
            }
            function paint() {
                const last = measure();
                samples++;
                const current = signature(last);
                if (current === previous) {
                    stableSince ??= last.time;
                    if (!last.media || (strictClient && last.layout!==width) || last.time-stableSince>=holdMs) return finish(true,last);
                } else {
                    stableSince=undefined;
                    if (confirming) return finish(false,last);
                }
                previous = current;
                frame = requestAnimationFrame(paint);
            }
            // At the acquisition deadline only an already observed, matching pair
            // of paints can finish its hold. Any further change invalidates it.
            let timer = setTimeout(()=>{
                const last=measure();
                if (!holdMs || stableSince===undefined || !target(last) || signature(last)!==previous) return finish(false,last);
                confirming=true;
                timer=setTimeout(()=>finish(false,measure()),holdMs);
            },1500);
            frame = requestAnimationFrame(paint);
        });
    }
    return {get before(){return before;}, events, settle, reset, dispose() {
        exact.removeEventListener('change',onChange);
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
    const observations = [];
    let primaryError;
    try {
        await resizeAndMeasure(page,size,true,async()=>{
            const result=await observer.evaluate(o=>o.settle());
            observations.push(result);
            return result;
        });
    } catch (error) {
        primaryError=error;
        throw error;
    } finally {
        try {
            if (!page.isClosed()) {
                const evidence = await observer.evaluate(o=>{o.dispose();return {before:o.before,events:o.events};});
                await test.info().attach('viewport-'+size.width,{body:JSON.stringify({size,...evidence,observations}),contentType:'application/json'});
            }
        } catch (error) {
            if (!primaryError && !test.info().errors.length && test.info().status!=='timedOut') throw error;
        } finally { await observer.dispose().catch(()=>{}); }
    }
}

async function resizeAndMeasure(page,size,mobileWebKit,sample) {
    await page.setViewportSize(size);
    let result=await sample();
    if (mobileWebKit && result.stable && (!result.last.media || result.last.layout!==size.width)) {
        await page.setViewportSize({...size,height:size.height+1});
        await page.setViewportSize(size);
        result=await sample();
    }
    const last={media:true,desktop:size.width>=992};
    if (mobileWebKit) last.layout=size.width;
    expect(result,'CSS-Viewport nach Resize auf '+size.width+' px').toMatchObject({stable:true,last});
}
module.exports = {setViewport,observeViewport,resizeAndMeasure};
