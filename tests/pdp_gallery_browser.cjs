// node tests/pdp_gallery_browser.cjs <rendered PDP HTML> <results.json>
const fs = require('node:fs');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

async function run() {
    const html = fs.readFileSync(process.argv[2], 'utf8')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, '');
    const source = fs.readFileSync('resources/js/item.js','utf8');
    const browser = await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    const results = [];
    const save = () => fs.writeFileSync(process.argv[3], JSON.stringify(results,null,2));
    try {
        const page = await browser.newPage({viewport:{width:390,height:850},hasTouch:true,isMobile:true,userAgent:'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36'});
        page.setDefaultTimeout(6000);
        let dimensions = [700,900];
        await page.route('**/*', route => {
            assert.equal(route.request().method(),'GET');
            if (route.request().resourceType()==='document') return route.fulfill({contentType:'text/html',body:html});
            if (route.request().resourceType()==='image') {
                const [w,h]=dimensions;
                return route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"><rect width="100%" height="100%" fill="white"/><circle cx="50%" cy="50%" r="12" fill="red"/></svg>'});
            }
            return route.fulfill({status:204,body:''});
        });
        await page.goto('https://fixture.invalid/product');
        await page.addStyleTag({path:'resources/css/main.min.css'});
        for (const [w,h] of [[700,900],[900,600],[800,800],[1600,320],[300,900]]) {
            dimensions=[w,h];
            const box=await page.locator('#ItemImgZoom > img').evaluate(async (img, n) => {
                img.src='/format-'+n+'.svg'; await img.decode();
                const frame=img.closest('.eg-gallery-frame').getBoundingClientRect();
                return [img.naturalWidth,img.naturalHeight,getComputedStyle(img).objectFit,Math.round(frame.height)];
            },w+'-'+h);
            assert.deepEqual(box.slice(0,3),[w,h,'contain']);
            results.push({format:[w,h],frameHeight:box[3]});
        }
        assert.equal(new Set(results.map(r=>r.frameHeight)).size,1);save();
        dimensions=[700,900];
        await page.reload();
        await page.addStyleTag({path:'resources/css/main.min.css'});
        await page.addScriptTag({path:'resources/js/jquery-3.7.1.min.js'});
        const interactions=source.slice(source.indexOf("$(document).on('click', '.eg-gallery-expand"),source.indexOf("$(document).on('click', '.slideToRating"));
        await page.addScriptTag({content:interactions});
        await page.addScriptTag({path:'resources/js/magiczoom.min.js'});
        const counter=page.locator('[data-eg-gallery-counter]');
        const count=async value=>page.waitForFunction(value=>document.querySelector('[data-eg-gallery-counter]').textContent===value,value);
        await count('1 / 3'); await page.locator('#ItemImgZoom .mz-figure').waitFor();
        await page.locator('#ItemImgZoom').scrollIntoViewIfNeeded();
        await page.waitForTimeout(600);
        const rect=await page.locator('#ItemImgZoom').boundingBox();
        const client=await page.context().newCDPSession(page);
        async function swipe(left) {
            const start=rect.x+rect.width*(left?0.8:0.2),y=rect.y+rect.height*0.48;
            await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:start,y}]});
            for(let i=1;i<=8;i++) {
                await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start+(left?-1:1)*rect.width*0.57*i/8,y}]});
                await page.waitForTimeout(18);
            }
            await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
        }
        await swipe(true);await count('2 / 3');await page.waitForTimeout(350);
        await swipe(false);await count('1 / 3');results.push({swipe:'both directions'});save();
        await page.waitForTimeout(650); // Let the vendor finish the preceding swipe before the desktop click.
        await page.setViewportSize({width:1440,height:900});
        await page.locator('.single-prev-images a').nth(2).click();await count('3 / 3');
        await page.locator('.eg-gallery-expand').press('Enter');
        await page.locator('.mz-expand .mz-image-stage img').first().waitFor({state:'visible'});
        await page.evaluate(()=>MagicZoom.close('ItemImgZoom'));
        await page.locator('.mz-expand').waitFor({state:'hidden'});
        results.push({thumbnail:'3 / 3',zoom:'open and close'});save();
        await page.evaluate(()=>{document.querySelectorAll('[data-eg-size-matrix]').forEach(x=>x.remove());window.O46Core={installed:{}};});
        await page.addScriptTag({path:'resources/js/matrix.js'});
        await page.evaluate(()=>{
            O46Core.matrix();
            const article=document.querySelector('article.single');
            const one={url:'/new-1.svg'},two={url:'/new-2.svg'};
            O46Core.setVariationGallery(article,{variation:[one,one,two,{url:''}]});
            bindGalleryCounter(article.querySelector('.eg-item-gallery'));
        });
        await count('1 / 2');
        await page.locator('.single-prev-images a').nth(1).click();await count('2 / 2');
        results.push({variation:'deduplicated, reinitialized and navigable'});save();
        const a=source.indexOf('this.watchListTrigger = '),b=source.indexOf('this.initLiveSearch',a);
        await page.evaluate(()=>{window.messages=[];window.messageServiceTranslations={};window.eGuardians={item:{watchList:{add:(id,cb)=>{messages.push(['add',id]);cb();},remove:(id,cb)=>{messages.push(['remove',id]);cb();}}},ui:{message:{success:{show(){}}}},helper:{btnShowLoader(){},btnHideLoader(){}}};});
        await page.addScriptTag({content:source.slice(a,b).replace('this.watchListTrigger = ','window.watchListTrigger = ')});
        const wish=page.locator('.eg-gallery-frame [data-eg-handler="watchListTrigger"]');
        await wish.evaluate(el=>el.addEventListener('click',()=>window.watchListTrigger(el)));
        await wish.click();assert.equal(await wish.getAttribute('aria-pressed'),'true');
        await wish.click();assert.equal(await wish.getAttribute('aria-pressed'),'false');
        assert.deepEqual(await page.evaluate(()=>messages.map(x=>x[0])),['add','remove']);
        assert.equal(await page.locator('.mz-expand').count(),0);
        assert.equal(await counter.textContent(),'2 / 2');results.push({wishlist:'add/remove, unchanged selection and zoom'});save();
    } finally { await browser.close(); }
}
run().catch(error=>{console.error(error);process.exitCode=1;});

