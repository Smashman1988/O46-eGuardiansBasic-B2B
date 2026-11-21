const {test,expect} = require('./storefront.cjs');

test('Wischgeste wechselt das Galeriebild im Touchprofil', async ({page,context,shop,browserName,hasTouch})=>{
    if(!hasTouch) test.info().annotations.push({type:'not-applicable',description:'Desktopprofil ohne Touch'});
    test.skip(!hasTouch,'Touchprofil erforderlich');
    await shop.open('/product-10001/');
    const figure=page.locator('#ItemImgZoom .mz-figure');
    await figure.scrollIntoViewIfNeeded();
    await expect(figure).toBeVisible();
    const box=await figure.boundingBox();
    const y=Math.round(box.y+box.height/2),start=Math.round(box.x+box.width*.8),end=Math.round(box.x+box.width*.2);
    const points=Array.from({length:7},(_,i)=>({x:Math.round(start+(end-start)*i/6),y}));
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
        // WebKit has no CDP input. Send the gesture to the real widget with DOM touch events.
        await figure.evaluate(async (node,points)=>{
            const target=node.querySelector('img') || node;
            for(const [i,point] of [...points,points.at(-1)].entries()){
                const type=i===0?'touchstart':i===points.length?'touchend':'touchmove';
                const touch={target,identifier:1,clientX:point.x,clientY:point.y,pageX:point.x+scrollX,pageY:point.y+scrollY,screenX:point.x,screenY:point.y};
                const event=new Event(type,{bubbles:true,cancelable:true});
                const active=type==='touchend'?[]:[touch];
                Object.assign(event,{touches:active,targetTouches:active,changedTouches:[touch]});
                target.dispatchEvent(event);
                await new Promise(requestAnimationFrame);
            }
        },points);
    }
    await expect(page.locator('[data-eg-gallery-counter]')).toHaveText('2 / 3');
});

