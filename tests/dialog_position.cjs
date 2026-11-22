// All PDP requests are intercepted by the shared fixture. No shop data is written.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {chromium, expect} = require('@playwright/test');
const {fixture, races} = require('./dialog_switch.cjs');

const out = path.resolve('.cache/popup-modernisierung-wishlist/position');
const reference = '4c7556c8b7edac1f5d1bf7a3a1e4f6244b718db1';
const widths = [[320,568],[390,360],[390,780],[768,800],[1024,768],[1440,900]];
const triggers = {language:'[data-eg-language-switch]',account:'.btn-login-open',info:'[data-eg-title="Currency"]'};
const language = '<nav data-result="language">'+['Deutsch','English','Français','Italiano','Español'].map((name,i)=>
    '<p><a href="/'+['de','en','fr','it','es'][i]+'/">'+name+'</a></p>').join('')+'</nav>';
function metrics(modal, point) {
    const rect = s => modal.querySelector(s).getBoundingClientRect();
    const card=rect('.modal-content'), x=rect('.close'), b=modal.querySelector('.modal-body');
    const cx=x.left+x.width/2, cy=x.top+x.height/2;
    const hit = document.elementFromPoint(point?.x ?? cx,point?.y ?? cy);
    return {x:cx,y:cy,left:card.left,right:innerWidth-card.right,top:card.top,bottom:card.bottom,
        height:card.height,bodyHeight:b.clientHeight,scrollHeight:b.scrollHeight,closeHit:modal.querySelector('.close').contains(hit),
        focusX:document.activeElement===modal.querySelector('.close'),modalPadding:getComputedStyle(modal).paddingRight,
        bodyPadding:document.body.style.paddingRight,overflow:document.documentElement.scrollWidth-innerWidth,
        backdrops:document.querySelectorAll('.modal-backdrop').length};
}
async function closed(t, selector) {
    await expect(t.modal).toBeHidden();
    await expect(t.page.locator(selector)).toBeFocused();
    assert.equal(await t.page.locator('.modal-backdrop,body.modal-open').count(),0);
}
async function dialog(t,row,before) {
    const {page,modal}=t;
    const call=await t.open('language');
    await expect(modal.getByRole('status')).toBeVisible();
    row.loading=await modal.evaluate(metrics);
    const shot=async suffix=>{
        if(row.channel==='chrome' && (row.width===1440 || row.width===390 && row.height===780)) {
            const file=[row.stage,row.width,row.height,suffix].join('-')+'.png';
            await page.screenshot({path:path.join(out,file),animations:'disabled'});
            (row.screenshots??=[]).push(file);
        }
    };
    await shot('laden');
    // Keep the real mouse button down while the delayed HTTP result changes layout.
    await page.mouse.move(row.loading.x,row.loading.y);
    await page.mouse.down();
    await call.route.fulfill({json:{data:{description1:language}}});
    await expect(modal.locator('[data-result=language] a')).toHaveCount(5);
    row.loaded=await modal.evaluate(metrics,row.loading);
    await shot('geladen');
    await page.mouse.up();
    row.closedByOriginalPoint=await modal.isHidden();
    if(before) {
        if(!row.closedByOriginalPoint) await modal.locator('.close').click();
        return;
    }
    await closed(t,triggers.language);
    assert.ok(row.closedByOriginalPoint && row.loaded.closeHit);
    assert.ok(Math.abs(row.loaded.left-row.loaded.right)<=1);
    assert.ok(Math.abs(row.loading.y-row.loaded.y)<=1);
    assert.ok(row.loading.height<180 && row.loading.backdrops===1 && row.loaded.backdrops===1);
    assert.ok(row.loaded.overflow<=0 && row.loaded.bottom<=row.height);
    for(const kind of ['account','language','account','info']) {
        const request=await t.open(kind);
        await expect(modal.locator('.close')).toBeFocused();
        if(kind==='info'){
            await request.route.fulfill({json:{data:'<section data-result="info">'+'<p>Information</p>'.repeat(45)+'<button id="end">Ende</button></section>'}});
        } else await t.reply(request);
        await expect(modal.locator('[data-result='+kind+']')).toBeVisible();
        const m=await modal.evaluate(metrics,row.loading);
        assert.ok(m.closeHit && m.backdrops===1);
        if(kind==='info'){
            const end=modal.locator('#end');
            await end.focus();
            row.long=await modal.evaluate(metrics,row.loading);
            row.long.scrollTop=await modal.locator('.modal-body').evaluate(el=>el.scrollTop);
            row.long.endHit=await end.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));});
            assert.ok(row.long.scrollTop>0 && row.long.endHit && row.long.closeHit && row.long.bottom<=row.height);
        }
        await page.keyboard.press('Escape');
        await closed(t,triggers[kind]);
    }
    const bad=await t.open('info');
    await t.reply(bad,503);
    await expect(modal.getByRole('alert')).toBeVisible();
    await modal.locator('.close').click();
    await closed(t,triggers.info);
    // Deliver the cached/fast path without waiting for a loading assertion.
    await t.context.route(url=>url.pathname.endsWith('/loginPreview/'),route=>route.fulfill({json:{data:'<form id="fast">Konto</form>'}}));
    await page.locator(triggers.account).click();
    await expect(modal.locator('#fast')).toBeVisible();
    assert.ok((await modal.evaluate(metrics,row.loading)).closeHit);
    await modal.locator('.close').click();
    await closed(t,triggers.account);
}
function startTrace() {
    const q=s=>document.querySelector(s), origin=performance.now(), frames=[], events=[];
    const id=el=>el ? el.tagName+' '+(el.id||el.className||'') : '';
    const rect=el=>{const r=el.getBoundingClientRect();return [r.x,r.y,r.width,r.height];};
    const h=q('.stickyhead'), search=q('.search-box'), heart=q('.btn-watch-h'), row=q('.header-wrap .row');
    let first, atWidth;
    function frame() {
        const [x,y,w,b]=rect(heart), cx=x+w/2,cy=y+b/2, current=document.elementFromPoint(cx,cy);
        if(innerWidth!==atWidth){first=[cx,cy];atWidth=innerWidth;}
        const old=document.elementFromPoint(...first), css=getComputedStyle(search), sticky=getComputedStyle(h);
        frames.push({ms:Math.round(performance.now()-origin),width:innerWidth,scrollY,head:rect(h),sticky:sticky.position,top:sticky.top,
            columns:[...row.children].map(rect),basis:css.flexBasis,max:css.maxWidth,transition:css.transitionProperty,
            heart:[cx,cy],hit:id(current),heartHit:heart.contains(current),oldHit:id(old),oldHeartHit:heart.contains(old),
            hover:!!q('.top-menu > li:hover'),focus:id(document.activeElement)});
    }
    const event=e=>events.push([Math.round(performance.now()-origin),e.type,id(e.target),e.propertyName||'']);
    const types=['resize','scroll','transitionrun','transitionend','transitioncancel','focusin','focusout'];
    types.forEach(name=>window.addEventListener(name,event,true));
    const observer=new MutationObserver(changes=>changes.forEach(c=>events.push([Math.round(performance.now()-origin),'mutation',id(c.target),c.attributeName])));
    observer.observe(h,{subtree:true,attributes:true,attributeFilter:['class','style']});
    observer.observe(document.documentElement,{attributes:true,attributeFilter:['class','style']});
    frame();
    window.headerTrace=new Promise(resolve=>{
        function tick(){frame();if(performance.now()-origin<600)requestAnimationFrame(tick);
            else {observer.disconnect();types.forEach(name=>window.removeEventListener(name,event,true));resolve({frames,events});}}
        requestAnimationFrame(tick);
    });
}
async function header(t,row,before) {
    const page=t.page;
    const [from,to,scroll,hover]=row.scenario;
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(n=>window.scrollTo({top:n,behavior:'instant'}),scroll);
    await page.mouse.move(3,600);
    if(hover) await page.locator('.top-menu > li > a[href="/accessoires-guenstig/"]').first().hover();
    await page.evaluate(startTrace);
    if(from!==to) await page.setViewportSize({width:to,height:800});
    const {frames,events}=await page.evaluate(()=>window.headerTrace);
    row.frames=frames;row.events=events;
    const target=frames.filter(f=>f.width===to);
    assert.ok(target.length>=2);
    row.span=Math.max(...target.map(f=>f.head[3]))-Math.min(...target.map(f=>f.head[3]));
    row.first=target[0];row.last=target.at(-1);
    if(before) return;
    assert.ok(row.span<=1,'Header springt nach dem Resize: '+row.span);
    if(scroll) assert.ok(target.every(f=>f.scrollY>0));
    if(hover) assert.ok(row.last.hover);
    else if(!scroll) assert.ok(target.every(f=>f.heartHit && f.oldHeartHit));
    row.scrollEvents=events.filter(e=>e[1]==='scroll').length;
}
async function picker(t,row) {
    const {page,heart}=t, modal=page.locator('#eg-wish-picker');
    const qty=page.locator('[data-eg-variation-id="1453158"] [data-eg-qty]').first();
    await expect(qty).toBeVisible();
    await expect.poll(()=>t.requests.some(r=>r.includes('/rest/io/variations/batch'))).toBe(true);
    await qty.focus();
    const count=t.requests.length;
    await heart.click(); await expect(modal).toBeVisible();
    await expect(modal.locator('[data-wish-id="1453158"]')).toHaveAttribute('aria-pressed','true');
    row.selection={};
    for(const color of ['Rosa','Schwarz']){
        // The accessible name of the selected color includes a visible checkmark.
        await modal.getByRole('group',{name:'Farbe'}).getByRole('button',{name:new RegExp(color+'$')}).click();
        row.selection[color]=await modal.locator('[data-wish-id]').evaluateAll(nodes=>nodes.map(n=>[n.firstChild.textContent,n.dataset.wishId]));
    }
    assert.deepEqual(row.selection,{Rosa:[['S','1453159'],['M','1453158'],['L','1453157']],Schwarz:[['S','1453162']]});
    row.margins=await modal.locator('.modal-content').evaluate(el=>{const b=el.getBoundingClientRect();return [b.left,innerWidth-b.right];});
    assert.ok(Math.abs(row.margins[0]-row.margins[1])<=1);
    await modal.locator('.modal-footer [data-dismiss]').click();
    await expect(heart).toBeFocused();
    assert.equal(await page.locator('.modal-backdrop,body.modal-open').count(),0);
    row.extra=t.requests.slice(count);
    assert.deepEqual(row.extra,[]);
}
async function nav(t) {
    const p=t.page, mobile=p.locator('button[aria-controls="o46-menu"].btn-mobile-nav');
    await mobile.press('Enter');await expect(mobile).toHaveAttribute('aria-expanded','true');
    await p.keyboard.press('Escape');await expect(mobile).toBeFocused();
    await expect(mobile).toHaveAttribute('aria-expanded','false');
    await p.setViewportSize({width:1024,height:800});
    const link=p.locator('.top-menu > li > a[href="/accessoires-guenstig/"]').first();
    const drop=link.locator('..').locator(':scope > .ddown-wrap');
    await link.hover();await expect(drop).toBeVisible();
    await p.mouse.move(5,650);await expect(drop).toBeHidden();
    await link.press('Enter');await expect(p).toHaveURL(/\/accessoires-guenstig\/$/);
}
async function main(){
    const channel=process.argv[2]||'chrome';
    assert.ok(['chrome','msedge'].includes(channel));
    fs.mkdirSync(out,{recursive:true});
    const css=execFileSync('git',['show',reference+':resources/css/main.min.css'],{encoding:'utf8'});
    const rows=[];
    const browser=await chromium.launch({channel,ignoreDefaultArgs:['--hide-scrollbars']});
    async function check(name,stage,width,height,action,scenario) {
        const row={name,stage,channel,version:browser.version(),width,height,scenario};
        rows.push(row);
        let t;
        try {
            t=await fixture(browser,'de',width,{height,stylesheet:stage==='vorher'?css:undefined});
            await action(t,row,stage==='vorher');
            assert.deepEqual(t.errors,[]);
            assert.ok(!t.requests.some(r=>r.startsWith('POST /rest/io/itemWishList')||r.startsWith('DELETE')));
            row.ok=true;
        }catch(e){row.ok=false;row.error=e.message;console.error(stage,name,width,height,e.message);}
        finally {if(t){row.errors=t.errors;row.api=t.requests.filter(r=>/rest\/io|loginPreview|getShopBuilderContent/.test(r));row.failedRequests=t.failed;await t.context.close();}}
        fs.writeFileSync(path.join(out,channel+'.json'),JSON.stringify(rows,null,1));
    }
    try{
        for(const stage of ['vorher','nachher']){
            for(const [w,h] of widths) await check('Dialog',stage,w,h,dialog);
            const scenarios=stage==='vorher'?[[768,1024,0,false]]:[[1024,1024,0,false],[768,1024,0,false],[1024,768,0,false],[991,992,0,false],[768,1024,100,false],[1024,1024,0,true]];
            for(const s of scenarios) await check('Header',stage,s[0],800,header,s);
        }
        await check('Abbruch', 'nachher',1024,768,races);
        await check('Navigation','nachher',768,800,nav);
        for(const w of [390,1440]) await check('Merklistenauswahl','nachher',w,780,picker);
    }finally{await browser.close();}
    console.log(channel,rows.filter(r=>r.ok).length+'/'+rows.length);
    if(rows.some(r=>!r.ok))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
