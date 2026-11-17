// Offline real Twig card output, built CSS, local fonts and downloaded product photos.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const D=path.resolve(process.argv[2]),root=path.resolve(__dirname,'..'),rows=[];
const read=p=>fs.readFileSync(p,'utf8');
const head=read(D+'/before/resources/views/PageDesign/Partials/Head.twig');
const fonts=[...head.replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/theme').matchAll(/@font-face\{[^}]+\}/g)].slice(0,3).map(x=>x[0]).join('');
const critical=[...read(root+'/resources/views/PageDesign/Partials/Head.twig').replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/theme').matchAll(/<style>(@font-face[\s\S]*?)<\/style>/g)].map(x=>x[1]);
const criticalRows=[];
const wrapperRows=[];
const design=process.argv.includes('--design');
const imageReview=process.argv.includes('--images');
const widths=imageReview?[360,390,430,768,1024,1200,1440,1774]:design?[360,390,768,1200,1440,1774]:[360,390,575,576,767,768,991,992,1199,1200,1400,1401,1440,1600];
const imageBounds=imageReview?JSON.parse(read(D+'/image-bounds.json')):null;
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
 try{for(const lang of['de','en','fr','it','es'])for(const width of widths)for(const version of['before','after']){
    if((design||imageReview)&&lang!=='de'&&![390,1440].includes(width))continue;
    const page=await browser.newPage({viewport:{width,height:900}}),errors=[],imageRequests=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>{
        const url=new URL(route.request().url()),name=path.basename(url.pathname);
        if(url.pathname.startsWith('/visual/')){imageRequests.push(url.pathname);const file=D+url.pathname.replace(/\.avif$/,'');return fs.existsSync(file)?route.fulfill({path:file}):route.abort();}
        const font=root+'/resources/documents/fonts/'+name;
        if(/\.woff2?$/.test(name)&&fs.existsSync(font))return route.fulfill({path:font});
        return route.abort();
    });
    const css=read((version==='before'?D+'/before':root)+'/resources/css/main.min.css');
    const html=read(D+`/cards-${lang}-${version}.html`);
    await page.setContent('<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="https://cards.test/"><style>'+fonts+css+'</style></head><body class="hold-transition"><main id="page-body" class="container-fluid" style="padding:12px">'+html+'</main><button id="totop" hidden>Top</button></body></html>');
    await page.evaluate(()=>document.fonts.ready);
    const initial=await page.locator('.cat-item-image').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));
    // Execute the real loader instead of manually hydrating data-src attributes.
    for(const file of ['jquery-3.7.1.min.js','core.min.js','cat.min.js'])await page.addScriptTag({path:root+'/resources/js/'+file});
    await page.evaluate(()=>eGuardians.initialize());
    for(const card of await page.locator('.cat-item').all()){
        await card.locator('picture img').scrollIntoViewIfNeeded();
        await card.locator('picture img').evaluate(i=>new Promise((resolve,reject)=>{if(i.complete&&i.naturalWidth)return resolve();i.addEventListener('load',resolve,{once:true});i.addEventListener('error',()=>reject(Error('Product photo failed')),{once:true});}));
    }
    await page.evaluate(()=>scrollTo(0,0));
    await page.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth>0));
    const values=await page.locator('.cat-item').evaluateAll(cards=>cards.map(card=>{
        const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom}};
        const image=card.querySelector('.cat-item-image'),photo=image.querySelector('picture img');
        const overlays=[...image.querySelectorAll('.cat-badges,.cat-logo,.item-action2')];
        const parts=['.cat-item-sizes','.cat-item-name','.cat-card-price','.linkabso'].map(s=>card.querySelector(s)).filter(Boolean);
        const logo=image.querySelector('.cat-logo');
        return {card:rect(card),image:rect(image),photo:rect(photo),fit:getComputedStyle(photo).objectFit,natural:[photo.naturalWidth,photo.naturalHeight],logo:logo?{rect:rect(logo),natural:[logo.naturalWidth,logo.naturalHeight],fit:getComputedStyle(logo).objectFit}:null,parts:parts.map(rect),button:rect(card.querySelector('button')),ratingText:card.querySelector('.item-action2')?.textContent.trim()||'',sizes:[...card.querySelectorAll('.availsize')].map(e=>({text:e.textContent,rect:rect(e),overflow:e.scrollWidth>e.clientWidth+1,interactive:e.matches('button,a,input,[role=button],[aria-selected],[aria-pressed]')})),
            overlays:overlays.map(e=>({rect:rect(e),pointer:getComputedStyle(e).pointerEvents,background:getComputedStyle(e).backgroundColor,clickThrough:(()=>{const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;if(x<0||x>=innerWidth||y<0||y>=innerHeight)return null;return !!document.elementFromPoint(x,y)?.closest('a.product-list')})()}))};
    }));
    if(imageReview)values.forEach((v,i)=>{
        const painted=(rect,natural,bounds)=>{
            const scale=Math.min(rect.w/natural[0],rect.h/natural[1]);
            const x=rect.x+(rect.w-natural[0]*scale)/2,y=rect.y+(rect.h-natural[1]*scale)/2;
            return {x,y,w:natural[0]*scale,h:natural[1]*scale,scale,
                content:{x:x+bounds[0]*scale,y:y+bounds[1]*scale,w:(bounds[2]-bounds[0])*scale,h:(bounds[3]-bounds[1])*scale}};
        };
        v.painted=painted(v.photo,v.natural,imageBounds[i+'.jpg'].bounds);
        if(v.logo)v.logo.painted=painted(v.logo.rect,v.logo.natural,imageBounds[i+'-logo'].bounds);
        if(version==='after'){
            for(const o of v.overlays){const a=v.painted,b=o.rect;
                assert.ok(Math.min(a.x+a.w,b.right)-Math.max(a.x,b.x)<=1||Math.min(a.y+a.h,b.bottom)-Math.max(a.y,b.y)<=1,'No overlay covers any part of the product file');
            }
            if(v.logo)assert.equal(v.logo.fit,'contain','Complete logo preserved');
        }
    });
    assert.deepEqual(errors,[]);assert.equal(values.length,12);
    if(version==='after'){
        const lineGroups=new Map();
        values.forEach((v,i)=>{
            assert.equal(v.image.h,initial[i],'Image hydration must preserve geometry');
            assert.equal(v.fit,'contain','Full product image preserved');
            assert.ok(v.photo.h>50&&v.photo.bottom<=v.image.bottom+1&&v.photo.y>=v.image.y-1,'Loaded photo stays in its visible frame');
            for(const size of v.sizes){assert.equal(size.overflow,false,'Complete size label wraps');assert.equal(size.interactive,false,'Informational sizes');}
            assert.equal(v.ratingText,'','Only rating stars, no count');
            assert.ok(v.button.h>=44,'Touch target');
            for(let j=1;j<v.parts.length;j++)assert.ok(v.parts[j].y>=v.parts[j-1].bottom-1,'Card content must not overlap');
            for(const o of v.overlays){assert.equal(o.pointer,'none');assert.notEqual(o.clickThrough,false,'Overlay must retain image click');assert.ok(o.rect.x>=v.image.x-1&&o.rect.right<=v.image.right+1&&o.rect.y>=v.image.y-1&&o.rect.bottom<=v.image.bottom+1,'Overlay stays inside image');}
            const key=Math.round(v.card.y);if(!lineGroups.has(key))lineGroups.set(key,[]);lineGroups.get(key).push(v);
        });
        for(const line of lineGroups.values())assert.ok(Math.max(...line.map(v=>v.button.bottom))-Math.min(...line.map(v=>v.button.bottom))<2,'Buttons align per row');
        if(width>=1200)assert.equal([...lineGroups.values()][0].length,6,'Six desktop columns');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No viewport overflow');
    }
    if(lang==='de'&&(imageReview||[360,390,768,1200,1440,1774].includes(width)))await page.screenshot({path:D+`/cards-${width}-${version}.png`,fullPage:true});
    if(imageReview&&lang==='de'&&[390,1440].includes(width)){
        const last=values[width===390?1:5];
        await page.screenshot({path:D+`/row-${width}-${version}.png`,clip:{x:0,y:0,width,height:Math.ceil(last.card.bottom+12)}});
    }
    if(lang==='de'&&width===1774)await page.locator('.cat-item').nth(1).screenshot({path:D+`/detail-${version}.png`});
    const initialImageRequests=[...imageRequests];
    if(lang==='de'&&version==='after'&&[390,1440].includes(width)){
        const geometry=()=>page.locator('.cat-item,.cat-item-image,.cat-item-sizes,.cat-item-name,.cat-card-price,.linkabso').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
        const full=await geometry();
        for(let branch=0;branch<critical.length;branch++){
            await page.locator('style').evaluate((e,css)=>e.textContent=css,critical[branch]);
            const actual=await geometry();const same=JSON.stringify(actual)===JSON.stringify(full);
            criticalRows.push({width,branch,same,full:same?undefined:full,actual:same?undefined:actual});
        }
        await page.locator('style').evaluate((e,css)=>e.textContent=css,fonts+css);
        // Homepage/recommendations use div grid cells; PDP cross-selling has four desktop columns.
        const listing=page.locator('.category-product-list'),original=await listing.innerHTML();
        for(const kind of ['home','cross-selling']){
            let cells=original.replace(/<article\b/g,'<div').replace(/<\/article>/g,'</div>');
            if(kind==='cross-selling')cells=cells.replace(/col-(xl|xlg|xxlg)-2/g,'col-$1-3');
            await listing.evaluate((e,html)=>e.innerHTML=html,cells);
            const cards=await page.locator('.cat-item').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),b=e.querySelector('.linkabso').getBoundingClientRect();return {y:r.y,h:r.height,bottom:b.bottom,buttonHeight:b.height}}));
            const first=cards.filter(e=>Math.abs(e.y-cards[0].y)<1);
            assert.equal(first.length,width===390?2:(kind==='home'?6:4));
            assert.ok(Math.max(...first.map(e=>e.bottom))-Math.min(...first.map(e=>e.bottom))<2);
            assert.ok(cards.every(e=>e.buttonHeight>=44));
            assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            wrapperRows.push({kind,width,status:'PASS',columns:first.length});
        }
        await listing.evaluate((e,html)=>e.innerHTML=html,original);
    }
    rows.push({lang,width,version,cards:values.length,status:'PASS',firstRowHeight:values[0].card.h,values,imageRequests:initialImageRequests,errors});
    await page.close();
 }}finally{await browser.close();fs.writeFileSync(D+'/card-layout.json',JSON.stringify({rows,criticalRows,wrapperRows},null,2));}
 assert.ok(criticalRows.every(r=>r.same),'Critical/full card geometry: '+criticalRows.filter(r=>!r.same).map(r=>r.width+'/'+r.branch).join(', '));
 for(const row of rows.filter(r=>r.version==='after')){
    const before=rows.find(r=>r.version==='before'&&r.lang===row.lang&&r.width===row.width);
    assert.deepEqual([...row.imageRequests].sort(),[...before.imageRequests].sort(),'Unchanged image request multiset');
    if(imageReview)row.values.forEach((v,i)=>{
        const old=before.values[i];
        assert.ok(v.painted.scale>=old.painted.scale,'No product becomes smaller');
        assert.ok(v.card.h<=old.card.h*1.09,'Card growth remains below 9%');
        if(v.logo)assert.ok(v.logo.painted.scale>=old.logo.painted.scale,'No logo becomes smaller');
    });
 }
 console.log(JSON.stringify({status:'PASS',cases:rows.length,cards:rows.length*12,criticalBranches:criticalRows.length,gridContexts:wrapperRows.length,widths}));
})().catch(e=>{console.error(e);process.exitCode=1});
