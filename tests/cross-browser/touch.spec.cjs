const {test,expect} = require('./storefront.cjs');

test('Wischgeste wechselt das Galeriebild im Touchprofil', async ({page,context,shop,browserName,hasTouch},info)=>{
    if(!hasTouch) test.info().annotations.push({type:'not-applicable',description:'Desktopprofil ohne Touch'});
    test.skip(!hasTouch,'Touchprofil erforderlich');
    await shop.open('/product-10001/');
    const figure=page.locator('#ItemImgZoom .mz-figure');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toBeVisible();
    await expect(page.locator('.single-prev-images a').first()).toHaveClass(/mz-thumb-selected/);
    await expect.poll(()=>figure.locator(':scope > img').first().evaluate(img=>img.complete && img.naturalWidth>0)).toBe(true);
    await expect(page.locator('[data-eg-gallery-counter]')).toHaveText('1 / 3');
    const nextImage=await page.locator('.single-prev-images a').nth(1).getAttribute('data-image');
    const box=await figure.boundingBox();
    const y=Math.round(box.y+box.height/2),start=Math.round(box.x+box.width*.8),end=Math.round(box.x+box.width*.2);
    const points=Array.from({length:7},(_,i)=>({x:Math.round(start+(end-start)*i/6),y}));
    const inputEvents = await figure.evaluateHandle(node=>{
        const events=[];
        for (const type of ['touchstart','touchmove','touchend','touchcancel','pointerdown','pointermove','pointerup','pointercancel']) {
            document.addEventListener(type,e=>{
                if (node.contains(e.target) && (!e.pointerType || e.pointerType==='touch')) events.push(type);
            },{capture:true,passive:true});
        }
        return events;
    });
    if(browserName==='chromium'){
        const input=await context.newCDPSession(page);
        try {
            for(const [i,point] of points.entries()) {
                await input.send('Input.dispatchTouchEvent',{type:i?'touchMove':'touchStart',touchPoints:[point]});
                await page.evaluate(()=>new Promise(requestAnimationFrame));
            }
            await input.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        } finally {await input.detach();}
    } else {
        // Playwright constructs the engine's own TouchEvent and TouchList objects.
        const target=figure.locator(':scope > img').first();
        const offset=await page.evaluate(()=>({x:scrollX,y:scrollY}));
        for(const [i,point] of [...points,points.at(-1)].entries()){
            const type=i===0?'touchstart':i===points.length?'touchend':'touchmove';
            const contacts=[{identifier:1,clientX:point.x,clientY:point.y,pageX:point.x+offset.x,pageY:point.y+offset.y,screenX:point.x,screenY:point.y}];
            const active=type==='touchend'?[]:contacts;
            await target.dispatchEvent(type,{touches:active,targetTouches:active,changedTouches:contacts});
        }
    }
    const events=await inputEvents.jsonValue();
    await inputEvents.dispose();
    await info.attach('gallery-input',{body:JSON.stringify(events),contentType:'application/json'});
    expect(events.filter(e=>e==='touchstart')).toHaveLength(1);
    expect(events.filter(e=>e==='touchend')).toHaveLength(1);
    expect(events).not.toContain('touchcancel');
    const pointers=events.filter(e=>e==='pointerdown').length;
    expect(pointers).toBeLessThanOrEqual(1);
    expect(events.filter(e=>e==='pointerup'||e==='pointercancel')).toHaveLength(pointers);
    await expect(page.locator('[data-eg-gallery-counter]')).toHaveText('2 / 3');
    await expect.poll(()=>figure.locator(':scope > img').evaluateAll(imgs=>imgs.map(img=>new URL(img.currentSrc).pathname))).toContain(nextImage);
});

