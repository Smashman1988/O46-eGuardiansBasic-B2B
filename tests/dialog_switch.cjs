// Focused PDP fixture. All browser requests are fulfilled locally, including wishlist writes.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium, expect} = require('@playwright/test');
const baseline = process.argv.includes('--before');
const reference = '77138b396e54d32b8fab72a69bf69aa8c8cb5cde';
const out = path.resolve('.cache/popup-modernisierung-wishlist/dialogwechsel');
fs.mkdirSync(out, {recursive:true});
const read = name => fs.readFileSync(name, 'utf8');
const sources = new Map();
function source(name) {
    if (!sources.has(name)) sources.set(name, baseline
        ? cp.execFileSync('git',['show',reference+':'+name],{encoding:'utf8',maxBuffer:8e6}) : read(name));
    return sources.get(name);
}
function twig(script, data) {
    const php = process.env.O46_PHP || (process.platform === 'win32' ? path.resolve('.cache/php-runtime/php-8.4.23/php.exe') : 'php');
    const args = process.platform === 'win32' ? ['-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=mbstring'] : [];
    return JSON.parse(cp.execFileSync(php,[...args,script,process.env.O46_TWIG_AUTOLOAD || '.cache/contact-widget/autoload3.php'],
        {input:JSON.stringify(data),encoding:'utf8',maxBuffer:12e6}));
}
const headers = twig('tests/cross-browser/render.php', {});
const variants = [[1453159,1,1],[1453158,1,2],[1453157,1,3],[1453162,2,1]];
const fragments = new Map();
function pageHtml(lang,single) {
    const key = lang+(single ? '-single' : '');
    if (fragments.has(key)) return fragments.get(key);
    const rows = (single ? variants.slice(0,1) : variants).map(([variationId,color,size]) => ({
        variationId,attributes:[{attributeId:9,attributeValueId:color},{attributeId:1,attributeValueId:size}]
    }));
    const attributes = [[9,'Farbe',['Rosa','Schwarz']],[1,'Größe',['S','M','L']]].map(([attributeId,name,values]) => ({
        attributeId,name,values:values.map((name,i)=>({attributeValueId:i+1,name}))
    }));
    const f = twig('tests/wishlist_picker_fixture.php',{lang,base:1453159,saved:[],rows,attributes,units:{},
        baseline:false,dialogShells:false,pdp:source('resources/views/Item/SingleItem.twig'),layout:source('resources/views/PageDesign/PageDesign.twig')});
    const head = source('resources/views/PageDesign/Partials/Head.twig');
    const baseStyle = head.match(/<style>@font-face[\s\S]*?<\/style>/)[0]
        .replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/plugin/GuardiansBasicB2B');
    const galleryStyle = head.match(/<style data-eg-pdp-gallery>[\s\S]*?<\/style>/)[0];
    const alternates = ['de','en','fr','it','es'].map(l=>'<link rel="alternate" hreflang="'+l+'" href="/'+l+'/artikel/">').join('');
    const html = '<!doctype html><html lang="'+lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">'+alternates+baseStyle+galleryStyle+
        '<link rel="stylesheet" href="/assets/main.min.css"></head><body data-eg-shop-dialogs>'+headers.languages[lang].header+
        '<main><article class="single" data-item data-mainitemid="2351617" data-eg-active-variation="1453159"><div class="container"><h1>Bruno Banani</h1>'+
        '<div class="col-12 col-xl-6 stickyarticle z-index1"><div class="row eg-item-gallery"><div class="col-12 col-md-10 offset-md-2">'+
        '<div class="relative eg-gallery-frame" data-eg-gallery-count="1">'+f.heart+'</div></div></div></div>'+f.matrix+'</div></article></main>'+
        f.dynamic+f.picker+headers.backdrop+'<button id="totop">↑</button><img alt="" width="1" height="1" src="/load-gate.svg">'+
        '<script id="app-data-custom" type="application/json">{"templateType":"item"}</script><script>window.activeLang='+JSON.stringify(lang)+
        ';window.messageServiceTranslations={};window.addEventListener("load",()=>{eGuardians.initialize();document.body.dataset.ready=1;})</script>'+
        '<script src="/assets/jquery-3.7.1.min.js"></script><script defer src="/assets/core.min.js"></script><script defer src="/assets/item.min.js" data-eg-matrix></script></body></html>';
    fragments.set(key,html);
    return html;
}
const heartSelector = '.btn-watch-h';
const triggers = {account:'.btn-login-open', language:'[data-eg-language-switch]', info:'[data-eg-href$="categoryId=5638"]'};
const content = {
    account:'<form data-result="account"><label>E-Mail<input type="email"></label><input type="password"><button type="button" data-eg-event="click" data-eg-handler="fixtureAccount">Login</button></form>',
    language:{description1:'<nav data-result="language"><a href="/en/">English</a></nav>'},
    info:{description1:'<section data-result="info">Information</section>'}
};
async function fixture(browser,lang,width,{early=false,single=false,height=850,stylesheet,beforeScripts}={}) {
    const context = await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
    if (beforeScripts) await context.addInitScript(beforeScripts);
    const page = await context.newPage();
    page.setDefaultTimeout(4000);
    const pending = [], requests = [], errors = [], failed = [];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>failed.push({path:new URL(r.url()).pathname,error:r.failure()?.errorText}));
    let release;
    const gate = early ? new Promise(resolve=>release=resolve) : Promise.resolve();
    let releaseStock;
    const stockGate = early ? new Promise(resolve=>releaseStock=resolve) : Promise.resolve();
    const pic = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>';
    await context.route('**/*',async route=>{
        const req=route.request(), u=new URL(req.url()), p=u.pathname;
        requests.push(req.method()+' '+p+u.search);
        if(req.isNavigationRequest() && u.hostname==='fixture.test' && p==='/produkt/')
            return route.fulfill({contentType:'text/html; charset=utf-8',body:pageHtml(lang,single)});
        if(req.resourceType()==='image'){
            if(p==='/load-gate.svg') await gate;
            if(p.endsWith('b2b-outlet46-logo.png')) return route.fulfill({path:path.resolve('resources/images/b2b-outlet46-logo.png')});
            return route.fulfill({contentType:'image/svg+xml',body:pic});
        }
        if(u.hostname!=='fixture.test') {errors.push('Unexpected host '+u.hostname);return route.abort();}
        if(p.startsWith('/assets/')) {
            const css=p.endsWith('.css');
            return route.fulfill({contentType:css?'text/css':'application/javascript',body:css && stylesheet ? stylesheet : source('resources/'+(css?'css/':'js/')+path.basename(p))});
        }
        if(req.resourceType()==='font') return route.fulfill({path:path.resolve('resources/documents/fonts',path.basename(p))});
        if(p.endsWith('/loginPreview/') || p.endsWith('/getShopBuilderContent/')) {
            pending.push({route,kind:p.endsWith('/loginPreview/')?'account':u.searchParams.get('categoryId')==='5640'?'language':'info'});
            return;
        }
        if(p==='/rest/io/variations/batch') {
            await stockGate;
            return route.fulfill({json:{data:{items:Object.fromEntries(variants.map(([id])=>[id,{id,stock:6}]))}}});
        }
        if(req.isNavigationRequest() && p==='/accessoires-guenstig/')
            return route.fulfill({contentType:'text/html',body:'<title>Accessoires</title><h1>Accessoires</h1>'});
        if(p==='/rest/io/basket/' || p==='/rest/io/session/') {
            const basket={itemQuantity:0,itemWishListIds:[],currency:'EUR'};
            return route.fulfill({json:{data:p.includes('session')?{basket}:basket}});
        }
        if(p==='/rest/io/itemWishList/' && single && req.method()==='POST')
            return route.fulfill({status:201,json:{data:{variationId:Number(new URLSearchParams(req.postData()).get('variationId'))}}});
        errors.push('Unexpected request '+req.method()+' '+p);
        return route.abort();
    });
    await page.goto('https://fixture.test/produkt/',{waitUntil:'domcontentloaded'});
    const ready=()=>expect(page.locator('body')).toHaveAttribute('data-ready','1');
    if(!early) await ready();
    const modal=page.locator('.dynamicModal'), heart=page.locator(heartSelector);
    async function open(kind){
        const count=pending.length;
        await page.locator(triggers[kind]).click();
        await expect.poll(()=>pending.length).toBe(count+1);
        assert.equal(pending[count].kind,kind);
        return pending[count];
    }
    async function reply(call,status=200) {
        await call.route.fulfill({status,json:status===200?{data:content[call.kind]}:{error:'unavailable'}});
    }
    async function shot(name){ await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'}); }
    return {context,page,modal,heart,open,reply,shot,ready,release,releaseStock,requests,errors,failed,pending};
}
async function earlyHeart(t, evidence) {
    const state=()=>t.heart.evaluate(el=>({disabled:el.disabled,busy:el.getAttribute('aria-busy'),title:el.title,opacity:getComputedStyle(el).opacity,
        icon:el.firstElementChild.className, glyph:getComputedStyle(el.firstElementChild,'::before').content,
        handlers:window.jQuery?._data(el,'events')?.click?.length || 0,document:document.readyState,
        variations:JSON.parse(document.querySelector('[data-eg-variations]').dataset.egVariations).length,
        picker:document.querySelector('#eg-wish-picker').classList.contains('show')}));
    evidence.early=await state();
    const box=await t.heart.boundingBox();
    assert.ok(box);
    const point={x:box.x+box.width/2,y:box.y+box.height/2};
    assert.ok(await t.page.evaluate(p=>!!document.elementFromPoint(p.x,p.y)?.closest('.wishlist-info1'),point));
    await t.page.mouse.click(point.x,point.y);
    evidence.clicked=await state();
    assert.equal(evidence.clicked.picker,false);
    assert.equal(evidence.early.handlers,0);
    assert.equal(evidence.early.variations,4);
    assert.equal(evidence.early.disabled,!baseline);
    if(!baseline){
        assert.equal(evidence.early.busy,'true');assert.ok(evidence.early.title);
        assert.equal(evidence.early.icon,'icon-spinner9');
        assert.ok(!['none','normal','""'].includes(evidence.early.glyph));
    }
    t.release();
    await t.ready();
    assert.equal((await state()).disabled,false);
    await t.heart.click();
    await expect(t.page.locator('#eg-wish-picker')).toBeVisible();
    evidence.ready=await state();
    assert.equal(evidence.ready.icon,'icon-heart-o');
    if(!baseline) assert.notEqual(evidence.early.glyph,evidence.ready.glyph);
    if(t.releaseStock){
        await expect.poll(()=>t.requests.some(r=>r.includes('/rest/io/variations/batch'))).toBe(true);
        evidence.openBeforeStockReply=true;
        t.releaseStock();
    }
    await t.page.keyboard.press('Escape');
    await expect(t.heart).toBeFocused();
}
async function before(t,evidence) {
    await t.reply(await t.open('account'));
    await expect(t.modal.locator('input[type=password]')).toBeVisible();
    await t.modal.locator('.close').click();
    const pending=await t.open('language');
    await expect(t.modal.locator('input[type=password]')).toBeVisible();
    evidence.title=await t.modal.locator('.modal-title').innerText();
    await t.shot('vorher-dialog-'+t.page.viewportSize().width);
    await t.reply(pending);
    await expect(t.modal.locator('[data-result=language]')).toBeVisible();
}
async function run(){
    const rows=[];
    const channels = baseline ? ['chrome'] : ['chrome','msedge'];
    const selected = channels.filter(channel=>!process.env.O46_BROWSER || process.env.O46_BROWSER===channel);
    assert.ok(selected.length,'Choose an installed Chrome or Edge channel');
    for(const channel of selected){
        const browser=await chromium.launch({channel});
        async function check(name,lang,width,opts,action) {
            const row={channel,version:browser.version(),name,lang,width};
            rows.push(row);
            let t;
            try{
                t=await fixture(browser,lang,width,opts);
                await action(t,row);
                assert.deepEqual(t.errors,[]);
                row.result='PASS';
            }catch(e){row.result='FAIL';row.error=e.stack;console.error(name,lang,width,e.message);}
            finally{
                if(t){t.release?.();t.releaseStock?.();row.api=t.requests.filter(r=>/rest\/io|loginPreview|getShopBuilderContent/.test(r));row.requestFailures=t.failed;await t.context.close();}
                fs.writeFileSync(path.join(out,baseline?'vorher.json':channel+'.json'),JSON.stringify(rows.filter(r=>r.channel===channel),null,2));
            }
        }
        try{
            await check('Früher Herz-Klick','en',1024,{early:true},earlyHeart);
            if(baseline) for(const width of [390,1440]) await check('Altes Formular','de',width,{},before);
            else await afterChecks(check);
        }finally{await browser.close();}
    }
    console.log(rows.filter(r=>r.result==='PASS').length+'/'+rows.length+' Gruppen');
    if(rows.some(r=>r.result==='FAIL')) process.exitCode=1;
}
async function closed(t,kind) {
    await expect(t.modal).toBeHidden();
    await expect(t.page.locator(triggers[kind])).toBeFocused();
    assert.equal(await t.page.locator('body.modal-open,.modal-backdrop').count(),0);
}
const messages={
    de:['Inhalt wird geladen …','Der Inhalt konnte nicht geladen werden. Bitte erneut öffnen.'],
    en:['Loading content…','The content could not be loaded. Please reopen the dialog.'],
    fr:['Chargement du contenu…','Le contenu n’a pas pu être chargé. Veuillez rouvrir la fenêtre.'],
    it:['Caricamento del contenuto…','Impossibile caricare il contenuto. Riapri la finestra.'],
    es:['Cargando contenido…','No se pudo cargar el contenido. Vuelve a abrir la ventana.']
};
async function switches(t,row) {
    const body=t.modal.locator('.modal-body');
    row.switches=[];
    await t.page.evaluate(()=>{window.loginCalls=0;eGuardians.events.fixtureAccount=()=>window.loginCalls++;});
    let accountCount=0;
    for(const kind of ['account','language','account','info','language','info']){
        const pending=await t.open(kind);
        assert.equal(await body.innerText(),messages[row.lang][0]);
        await expect(body.locator('form,a')).toHaveCount(0);
        await expect(t.modal.locator('.modal-title')).toHaveText(await t.page.locator(triggers[kind]).getAttribute('data-eg-title'));
        await expect(t.modal.locator('.close')).toBeFocused();
        await expect(t.page.locator('body')).toHaveClass(/modal-open/);
        if(row.lang==='de' && kind==='language' && row.switches.length===1 && row.channel==='chrome')
            await t.shot('nachher-dialog-'+row.width);
        await t.reply(pending);
        await expect(body.locator('[data-result="'+kind+'"]')).toBeVisible();
        await expect(body.locator('[data-result]')).toHaveCount(1);
        if(kind==='language') await expect(body.locator('a')).toHaveAttribute('href',/\/en\/artikel\//);
        if(kind==='account'){
            await body.locator('button').click();
            assert.equal(await t.page.evaluate(()=>window.loginCalls),++accountCount);
        }
        await t.page.keyboard.press('Escape');
        await closed(t,kind);
        row.switches.push(kind);
    }
    const failed=await t.open('info');
    await t.reply(failed,503);
    await expect(body.getByRole('alert')).toHaveText(messages[row.lang][1]);
    assert.equal(await body.locator('form,a').count(),0);
    await t.modal.locator('.close').click();
    await closed(t,'info');
    const invalid=await t.open('info');
    await invalid.route.fulfill({json:{data:'',error:'invalid_parameters'}});
    await expect(body.getByRole('alert')).toHaveText(messages[row.lang][1]);
    await t.page.keyboard.press('Escape');
    await closed(t,'info');
}
async function races(t,row) {
    // Capture the actual jqXHR and independently hold an already delivered callback.
    // This exercises both transport cancellation and a callback too late to abort.
    await t.page.evaluate(()=>{
        const get=eGuardians.apiservice.get;
        window.transports=[];
        eGuardians.apiservice.get=function(url,data,callback){
            const xhr=get.call(this,url,data,(...args)=>{
                if(window.holdResult && args[1]===200){
                    window.holdResult=false;
                    window.delayedResult=()=>callback(...args);
                }else callback(...args);
            });
            window.transports.push(xhr);
            return xhr;
        };
    });
    for(const close of ['X','Escape']){
        const pending=await t.open('account');
        if(close==='X') await t.modal.locator('.close').click();
        else await t.page.keyboard.press('Escape');
        await closed(t,'account');
        assert.equal(await t.page.evaluate(()=>window.transports.at(-1).statusText),'abort');
        await t.reply(pending);
        await expect(t.modal.locator('form')).toHaveCount(0);
    }
    async function hold(){
        await t.page.evaluate(()=>{window.holdResult=true;window.delayedResult=null;});
        await t.reply(await t.open('account'));
        await t.page.waitForFunction(()=>typeof window.delayedResult==='function');
    }
    await hold();
    await t.modal.locator('.close').click();
    await t.reply(await t.open('language'));
    const links=t.modal.locator('[data-result=language]');
    await expect(links).toBeVisible();
    await t.page.evaluate(()=>window.delayedResult());
    await expect(links).toBeVisible();
    await expect(t.modal.locator('form')).toHaveCount(0);
    await t.page.keyboard.press('Escape');
    await closed(t,'language');
    await hold();
    await t.page.keyboard.press('Escape');
    await t.page.evaluate(()=>window.delayedResult());
    await closed(t,'account');
    await expect(t.modal.locator('form')).toHaveCount(0);
    // Another call can replace the current request even without closing Bootstrap.
    const previous=await t.open('account');
    const count=t.pending.length;
    await t.page.evaluate(()=>eGuardians.events.modalContent(document.querySelector('[data-eg-language-switch]')));
    await expect.poll(()=>t.pending.length).toBe(count+1);
    assert.equal(await t.page.evaluate(()=>window.transports.at(-2).statusText),'abort');
    await t.reply(t.pending[count]);
    await t.reply(previous);
    await expect(links).toBeVisible();
    row.abortCount=await t.page.evaluate(()=>window.transports.filter(x=>x.statusText==='abort').length);
    await t.modal.locator('.close').click();
    await closed(t,'account');
}
async function picker(t,row){
    const modal=t.page.locator('#eg-wish-picker');
    await expect(t.page.locator('.eg-row').first()).toBeVisible();
    const start=t.requests.filter(r=>r.includes('/rest/io/')).length;
    await t.heart.click();
    await expect(modal).toBeVisible();
    const combinations={};
    for(const color of ['Rosa','Schwarz']){
        await modal.getByRole('button',{name:color,exact:true}).click();
        combinations[color]=await modal.locator('[data-wish-id]').evaluateAll(btns=>btns.map(b=>[b.firstChild.textContent,b.dataset.wishId]));
    }
    assert.deepEqual(combinations,{Rosa:[['S','1453159'],['M','1453158'],['L','1453157']],Schwarz:[['S','1453162']]});
    row.combinations=combinations;
    const box=await modal.locator('[data-wish-save]').boundingBox();
    assert.ok(box && box.y>=0 && box.y+box.height<=850 && box.x>=0 && box.x+box.width<=row.width);
    assert.ok(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(row.channel==='chrome') await t.shot('auswahl-'+row.width);
    await modal.locator('.modal-footer [data-dismiss]').click();
    await expect(t.heart).toBeFocused();
    assert.equal(await t.page.locator('body.modal-open,.modal-backdrop').count(),0);
    assert.equal(t.requests.filter(r=>r.includes('/rest/io/')).length,start);
}
async function single(t){
    await t.heart.click();
    await expect(t.heart).toHaveAttribute('aria-pressed','true');
    await expect(t.page.locator('#eg-wish-picker')).toBeHidden();
    assert.deepEqual(t.requests.filter(r=>r.includes('itemWishList')),['POST /rest/io/itemWishList/']);
}
async function menu(t,row){
    const page=t.page;
    const trigger=page.locator('[aria-controls="o46-menu"].btn-mobile-nav');
    const entry=page.locator('.top-menu > .eg-ddown').filter({has:page.locator(':scope > a[href="/accessoires-guenstig/"]')});
    const top=entry.locator(':scope > a').first();
    const dropdown=entry.locator(':scope > .ddown-wrap');
    const width=async n=>{await page.setViewportSize({width:n,height:850});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));};
    const mid=b=>({x:Math.round(b.x+b.width/2),y:Math.round(b.y+b.height/2)});
    await page.evaluate(()=>{
        window.pointer={x:0,y:0};window.menuEvents=[];
        document.addEventListener('pointermove',e=>window.pointer={x:e.clientX,y:e.clientY});
        const li=document.querySelector('.top-menu a[href="/accessoires-guenstig/"]').parentElement;
        for(const name of ['mouseenter','mouseleave']) li.addEventListener(name,e=>window.menuEvents.push([name,e.clientX,e.clientY]));
    });
    row.states=[];
    async function snapshot(label){
        const s=await top.evaluate((a,label)=>{
            const id=el=>el && [el.tagName,el.className,el.closest('a')?.getAttribute('href')].filter(Boolean).join(' ');
            const parent=a.parentElement,panel=parent.querySelector(':scope > .ddown-wrap'),heart=document.querySelector('.btn-watch-h');
            const rect=heart.getBoundingClientRect(),x=rect.x+rect.width/2,y=rect.y+rect.height/2;
            const hit=document.elementFromPoint(x,y);
            return {label,width:innerWidth,pointer:window.pointer,pointerHit:id(document.elementFromPoint(window.pointer.x,window.pointer.y)),
                heartXY:[x,y],heartHit:id(hit),heartReceives:heart.contains(hit),menuIntercepts:!!hit?.closest('.ddown-wrap'),hover:parent.matches(':hover'),
                display:getComputedStyle(panel).display,pointerEvents:getComputedStyle(panel).pointerEvents,dropdownZ:getComputedStyle(panel).zIndex,
                headerZ:getComputedStyle(a.closest('header')).zIndex,heartStack:getComputedStyle(heart.closest('.wishlist-info1')).zIndex,
                focus:id(document.activeElement),mobile:document.documentElement.classList.contains('menu-open'),
                expanded:document.querySelector('.btn-mobile-nav[aria-controls="o46-menu"]').getAttribute('aria-expanded'),
                oldClasses:document.querySelectorAll('.top-menu .ddown-open,.top-menu .isOpen').length,
                inert:document.getElementById('o46-menu').inert,overflow:document.documentElement.scrollWidth>innerWidth};
        },label);
        row.states.push(s);assert.equal(s.overflow,false);
        return s;
    }
    const away=()=>page.mouse.move(5,650);
    await away();
    const initial=await snapshot('1024 direkt');
    assert.equal(initial.heartReceives,true);
    const navPoint=mid(await top.boundingBox());
    assert.ok(navPoint.x<768,'Stationärer Punkt liegt im mobilen Viewport');
    await width(768);await away();await width(1024);
    assert.equal((await snapshot('768 → 1024 Inhalt')).heartReceives,true);
    await width(768);await page.mouse.move(navPoint.x,navPoint.y);
    await snapshot('768 vor stationärem Wechsel');
    await width(1024);
    const stationary=await snapshot('1024 Navigation unter ruhendem Zeiger');
    if(stationary.display!=='none') assert.equal(stationary.hover,true);
    await away();await expect(dropdown).toBeHidden();
    await width(768);
    await trigger.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded','true');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveAttribute('aria-expanded','false');
    await trigger.press('Enter');await expect(trigger).toHaveAttribute('aria-expanded','true');
    await page.locator('.top-menu [data-eg-open-ddown]').first().click();
    await away();await width(1024);
    const reset=await snapshot('1024 nach offenem Mobil-Untermenü');
    assert.equal(reset.mobile,false);assert.equal(reset.oldClasses,0);assert.equal(reset.expanded,'false');
    assert.equal(reset.heartReceives,true);
    await top.hover();
    await expect(dropdown).toBeVisible();
    const hovering=await snapshot('1024 bewusstes Hover');
    assert.equal(hovering.hover,true);
    assert.equal(hovering.menuIntercepts,true);
    if(row.channel==='chrome') await t.shot('menue-hover-1024');
    await away();await expect(dropdown).toBeHidden();
    assert.equal((await snapshot('1024 nach Mouseleave')).heartReceives,true);
    await t.heart.click();await expect(page.locator('#eg-wish-picker')).toBeVisible();
    await page.keyboard.press('Escape');await expect(t.heart).toBeFocused();
    assert.equal(new URL(page.url()).pathname,'/produkt/');
    await top.focus();await expect(top).toBeFocused();await page.keyboard.press('Tab');
    assert.ok(await top.evaluate(a=>document.activeElement!==a && document.activeElement!==document.body));
    await away();
    for(const n of [768,991,992,390,1440]){
        await width(n);
        const state=await snapshot(n+' nach Wechsel');
        assert.equal(state.mobile,false);assert.equal(state.oldClasses,0);assert.equal(state.heartReceives,true);
    }
    row.menuEvents=await page.evaluate(()=>window.menuEvents);
    await top.press('Enter');
    await expect(page).toHaveURL('https://fixture.test/accessoires-guenstig/');
    row.keyboardDestination=new URL(page.url()).pathname;
}
async function afterChecks(check) {
    for(const lang of Object.keys(messages)){
        for(const width of (lang==='de'?[390,1440]:[390])){
            await check('Dialogwechsel und Fehlertext',lang,width,{},switches);
        }
    }
    await check('Abbruch und verspätete Antworten','de',1024,{},races);
    await check('Menü, Hit-Test und Tastatur','de',1024,{},menu);
    for(const width of [390,1440]) await check('Vier Varianten und Abbrechen','de',width,{},picker);
    await check('Einzelvariante mit lokaler API','en',1024,{single:true},single);
}
module.exports = {fixture, races};
if (require.main === module) run().catch(e=>{console.error(e);process.exitCode=1;});
