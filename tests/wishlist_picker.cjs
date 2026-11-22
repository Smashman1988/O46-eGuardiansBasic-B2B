// Run against the local production bundles. Route all traffic, including IO writes, in memory.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium, expect} = require('@playwright/test');
const out = path.resolve('.cache/popup-modernisierung-wishlist');
fs.mkdirSync(out, {recursive:true});
const baselineRef = '1dd9551822e9f784ee150babee8341bcdbc9eefe';
const files = new Map();
function source(file, baseline) {
    const key = [file, baseline].join(':');
    if (!files.has(key)) files.set(key, baseline ? cp.execFileSync('git',['show',baselineRef+':'+file],{encoding:'utf8',maxBuffer:2e6}) : fs.readFileSync(file,'utf8'));
    return files.get(key);
}
const dims = {
    color:{id:9, names:['Farbe','Colour','Couleur','Colore','Color'], values:['Marine','Olive']},
    size:{id:1, names:['Größe','Size','Taille','Taglia','Talla'], values:['S','M','L']},
    fabric:{id:33,names:['Material','Material','Matière','Materiale','Material'], values:['Linen','Cotton']}
};
const langs=['de','en','fr','it','es'];
const shapes={single:[[],[[]]], sizes:[['size'],[[1],[2],[3]]], colors:[['color'],[[1],[2]]],
    both:[['color','size'],[[1,1],[1,2],[2,3]]], material:[['fabric'],[[1],[2]]],
    mixed:[['size','fabric','color'],[[1,1,1],[1,2,1],[2,2,2]]],
    duplicate:[['size'],[[1],[1]]], unit:[[],[[],[]]], many:[['size'],Array.from({length:72},(_,i)=>[i+1])]};
function inputs(config, saved) {
    const [keys, combos] = shapes[config.shape];
    return {lang:config.lang, baseline:!!config.baseline,base:101,saved:[...saved],
        attributes:keys.map(k => ({attributeId:dims[k].id,name:dims[k].names[langs.indexOf(config.lang)],
            values:[...new Set(combos.map(c=>c[keys.indexOf(k)]))].map(v=>({attributeValueId:v,name:dims[k].values[v-1]||String(v)}))})),
        dialogShells:!!config.dialogShells, units:config.shape==='unit'?{31:'1 Stück',32:'6 Stück'}:{},
        rows:combos.map((c,i)=>({variationId:101+i,unitCombinationId:31+i,attributes:c.map((v,j)=>({attributeId:dims[keys[j]].id,attributeValueId:v}))})),
        pdp:source('resources/views/Item/SingleItem.twig',config.baseline), layout:source('resources/views/PageDesign/PageDesign.twig',config.baseline)};
}
function render(data) {
    const php = process.env.O46_PHP || (process.platform==='win32'?path.resolve('.cache/php-runtime/php-8.4.23/php.exe'):'php');
    const args = process.platform==='win32'?['-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=mbstring']:[];
    return JSON.parse(cp.execFileSync(php,[...args,'tests/wishlist_picker_fixture.php',process.env.O46_TWIG_AUTOLOAD||'.cache/contact-widget/autoload3.php'],
        {input:JSON.stringify(data),encoding:'utf8',maxBuffer:3e6}));
}
const results=[];
async function main(){
    const browser=await chromium.launch({channel:'chrome'});
    let context, page, writes, saved, config, fail, gate, requests;
    const errors=[];
    const heart=()=>page.locator('.btn-watch-h');
    const modal=()=>page.locator('#eg-wish-picker');
    const option=id=>modal().locator('[data-wish-id="'+id+'"]');
    const save=()=>modal().locator('[data-wish-save]');
    const shot=name=>page.screenshot({path:path.join(out,name+'.png')});
    async function open(shape='both',opts={}){
        if(context) await context.close();
        config={shape,lang:'de',width:1024,...opts}; saved=new Set(config.saved||[]); writes=[]; requests=[]; fail=''; gate=null;
        context=await browser.newContext({viewport:{width:config.width,height:config.height||800},hasTouch:!!config.touch,serviceWorkers:'block'});
        page=await context.newPage(); page.setDefaultTimeout(4000);
        page.on('pageerror',e=>errors.push(e.stack || e.message));
        await page.route('**/*',async route=>{
            const req=route.request(), url=new URL(req.url()), p=url.pathname;
            assert.equal(url.hostname,config.shop?'b2b.outlet46.de':'fixture.test');
            requests.push(req.method()+' '+p);
            if(req.isNavigationRequest()){
                const input=inputs(config,saved),f=render(input);
                const galleryStyle=source('resources/views/PageDesign/Partials/Head.twig',config.baseline).match(/<style data-eg-pdp-gallery>[\s\S]*?<\/style>/)[0];
                const launchers=config.dialogShells?'<button data-toggle="modal" data-target="#login">Login</button><button data-toggle="modal" data-target=".modal-cross">Quickview</button>':'';
                const body='<header style="padding:14px 5%;border-bottom:1px solid #ddd"><img alt="Outlet46 B2B" width="136" src="/brand.png"></header>'+
                    '<main class="container" style="padding-block:24px"><article class="single" data-item data-mainitemid="42" data-eg-active-variation="101"><div class="eg-gallery-frame" data-eg-gallery-count="0" style="min-height:80px"><h1>Leinenhemd</h1>'+f.heart+'</div>'+f.matrix+'</article>'+
                    '<button id="info" data-eg-event="click" data-eg-handler="modalContent" data-eg-href="/info/" data-eg-title="Sprache">Sprache</button></main>'+
                    f.picker+f.dynamic+(config.shop?f.shop:'')+launchers+f.shells+'<button id="totop">↑</button>';
                return route.fulfill({contentType:'text/html; charset=utf-8',body:'<!DOCTYPE html><html lang="'+config.lang+'"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+galleryStyle+'<link rel="stylesheet" href="/main.min.css"><body data-eg-shop-dialogs>'+body+
                    '<script id="app-data-custom" type="application/json">{"templateType":"item"}</script><script>window.activeLang='+JSON.stringify(config.lang)+';window.messageServiceTranslations='+JSON.stringify({wishlistplus:f.added,wishlistminus:f.removed})+';window.addEventListener("load",()=>{eGuardians.initialize(); document.body.dataset.ready=1;})</script><script src="/jquery-3.7.1.min.js"></script><script src="/core.min.js"></script><script src="/item.min.js" data-eg-matrix></script></body></html>'});
            }
            if(p==='/brand.png')return route.fulfill({path:path.resolve('resources/images/b2b-outlet46-logo.png')});
            if(p.includes('/documents/fonts/'))return route.fulfill({path:path.resolve('resources/documents/fonts',path.basename(p))});
            if(p.endsWith('.css')||p.endsWith('.js'))return route.fulfill({contentType:p.endsWith('.css')?'text/css':'application/javascript',body:source('resources/'+(p.endsWith('.css')?'css':'js')+p,config.baseline)});
            if(p==='/rest/io/itemWishList/'||p.startsWith('/rest/io/itemWishList/')){
                const id=Number(new URLSearchParams(req.postData()).get('variationId')); const method=req.method();
                writes.push({method,id}); if(gate) await gate;
                if(fail==='http')return route.fulfill({status:403,json:{error:{code:403}}});
                if(fail==='id')return route.fulfill({status:201,json:{data:{variationId:id+1}}});
                if(fail==='false')return route.fulfill({status:200,json:{data:false}});
                if(method==='POST'){saved.add(id);return route.fulfill({status:201,json:{data:{variationId:id,contactId:config.guest?0:17}}});}
                assert.equal(p,'/rest/io/itemWishList/'+id);assert.equal(method,'DELETE');saved.delete(id);return route.fulfill({json:{data:true}});
            }
            const basket={itemQuantity:0,itemSum:0,currency:'EUR',shippingCountryId:1,itemWishListIds:[...saved]};
            if(p==='/rest/io/basket/')return route.fulfill({json:{data:basket}});
            if(p==='/rest/io/session/')return route.fulfill({json:{data:{basket}}});
            if(p==='/rest/io/variations/batch')return route.fulfill({json:{data:{items:Object.fromEntries(url.searchParams.get('ids').split(',').map(id=>[id,{id:Number(id),stock:id==='103'?0:6}]))}}});
            if(p==='/info/')return route.fulfill({json:{data:{description1:'<nav aria-label="Sprache"><a href="/de/">Deutsch</a> · <a href="/en/">English</a> · <a href="/fr/">Français</a> · <a href="/it/">Italiano</a> · <a href="/es/">Español</a></nav>'}}});
            throw Error('Unexpected route: '+p);
        });
        await page.goto('https://'+(config.shop?'b2b.outlet46.de':'fixture.test')+'/produkt/');
        await expect(page.locator('body')).toHaveAttribute('data-ready','1');
        await expect(page.locator('.eg-row').first()).toBeVisible();
    }
    async function check(name,fn) {
        try {await fn();results.push({name,pass:true});}
        catch(e){results.push({name,pass:false,error:e.message});throw e;}
        finally {fs.writeFileSync(path.join(out,'popup-tests.json'),JSON.stringify({browser:browser.version(),results,errors},null,2));}
    }
    async function closed(){
        await expect(modal()).toBeHidden();await expect(heart()).toBeFocused();
        assert.equal(await page.locator('.modal-backdrop,body.modal-open').count(),0);
    }
    try{
        await check('Herz · Kontur, Hover, Tastaturfokus, gespeicherter Zustand und mobiles Touchziel',async()=>{
            await open('single');
            const glyph=()=>heart().locator('.icon-heart-o').evaluate(el=>getComputedStyle(el,'::before').content);
            await expect(heart()).toHaveAttribute('aria-pressed','false');
            assert.ok((await glyph()).includes('\ue925'));
            await heart().hover();
            await expect(heart()).toHaveCSS('color','rgb(118, 174, 0)');
            assert.ok((await glyph()).includes('\ue925'));
            await page.keyboard.press('Tab');
            await expect(heart()).toBeFocused();
            await expect(heart()).toHaveCSS('outline-style','solid');
            await expect(heart()).toHaveCSS('outline-width','2px');
            assert.equal(writes.length,0);
            await page.keyboard.press('Enter');
            await expect(heart()).toHaveAttribute('aria-pressed','true');
            assert.ok((await glyph()).includes('\ue924'));
            await open('single',{width:320,touch:true,saved:[101]});
            const target=await heart().boundingBox();
            assert.ok(target.width>=44 && target.height>=44);
            assert.ok((await glyph()).includes('\ue924'));
            assert.equal(writes.length,0);
        });
        await check('Einzelvariante · IO-Antwort abwarten, hinzufügen, erneut laden und manuell entfernen',async()=>{
            await open('single');let release;gate=new Promise(r=>{release=r;});await heart().click();
            await expect.poll(()=>writes.length).toBe(1);await expect(heart()).toHaveAttribute('aria-pressed','false');
            await expect(modal()).toBeHidden();await heart().click();assert.equal(writes.length,1);
            release();gate=null;await expect(heart()).toHaveAttribute('aria-pressed','true');await page.reload();
            await expect(heart()).toHaveAttribute('aria-pressed','true');await heart().click();await expect(heart()).toHaveAttribute('aria-pressed','false');
            assert.deepEqual(writes,[{method:'POST',id:101},{method:'DELETE',id:101}]);
        });
        for(const [shape,label,count] of [['sizes','Größe',3],['colors','Farbe',2]]){
            await check('Nur '+label,async()=>{await open(shape);await heart().click();await expect(modal().locator('legend')).toHaveText([label]);assert.equal(await modal().locator('[data-wish-id]').count(),count);});
        }
        await check('Farbe und Größe · echte Kombinationen, ausverkaufte Variante, Doppelklick und Reload',async()=>{
            await open();await heart().click();await expect(save()).toBeDisabled();await expect(modal().locator('legend')).toHaveText(['Farbe']);
            await modal().getByRole('button',{name:'Marine'}).click();await expect(modal().locator('legend')).toHaveText(['Farbe','Größe']);
            assert.deepEqual(await modal().locator('[data-wish-id]').evaluateAll(a=>a.map(b=>b.dataset.wishId)),['101','102']);
            await modal().getByRole('button',{name:'Olive'}).click();await expect(save()).toBeDisabled();await expect(option(103)).toContainText('Nicht verfügbar');
            assert.equal(await modal().locator('[data-wish-id]').count(),1);await option(103).click();assert.equal(writes.length,0);
            let release;gate=new Promise(r=>{release=r;});await save().click();await expect(save()).toBeDisabled();await expect(heart()).toHaveAttribute('aria-pressed','false');
            release();gate=null;await closed();await expect(heart()).toHaveAttribute('aria-pressed','true');
            assert.deepEqual(writes,[{method:'POST',id:103}]);await page.reload();await expect(heart()).toHaveAttribute('aria-pressed','true');
            await heart().click();await modal().getByRole('button',{name:'Olive'}).click();await option(103).click();await expect(option(103)).toContainText('Bereits auf der Merkliste');await expect(save()).toBeDisabled();assert.equal(writes.length,1);
        });
        await check('PDP-Matrixauswahl und vorhandene Vormerkung',async()=>{
            await open('both',{saved:[102]});await page.locator('[data-eg-variation-id="102"] [data-eg-qty]').focus();
            await heart().click();await expect(option(102)).toHaveAttribute('aria-pressed','true');await expect(save()).toBeDisabled();assert.equal(writes.length,0);
        });
        await check('IO-Variantenlink öffnet mit der verlinkten Größe',async()=>{
            await open('sizes');await page.goto('https://fixture.test/produkt/42_102/');
            await heart().click();await expect(option(102)).toHaveAttribute('aria-pressed','true');assert.equal(writes.length,0);
        });
        await check('Reload · ältere Headerdaten überschreiben die gespeicherte Variante nicht',async()=>{
            await open('sizes',{saved:[102]});
            await page.evaluate(()=>{
                sessionStorage.setItem('o46-basket-scope','fixture');
                localStorage.setItem('basketCache_header_v2',JSON.stringify({scope:'fixture',change:'older',timestamp:Date.now(),
                    basket:{itemQuantity:0,itemSum:0,currency:'EUR',shippingCountryId:1,itemWishListIds:[]}}));
                O46Core.basketHeader.start();
            });
            await expect(heart()).toHaveAttribute('aria-pressed','true');await heart().click();
            await option(102).click();await expect(save()).toBeDisabled();assert.equal(writes.length,0);
        });
        for(const shape of ['material','duplicate','unit'])await check('Konkrete Varianten · '+shape,async()=>{
            await open(shape);await heart().click();await expect(modal().locator('legend')).toHaveText(['Variante']);
            await expect(option(102)).toContainText(shape==='material'?'Material · Cotton':'Variante 102');
            if(shape==='unit'){
                await expect(option(101)).toContainText('1 Stück');
                await expect(option(102)).toContainText('6 Stück');
            }
            await option(102).click();await save().click();await closed();assert.deepEqual(writes,[{method:'POST',id:102}]);
        });
        await check('Farbe, Größe und zusätzliches Material',async()=>{
            await open('mixed');await heart().click();
            await modal().getByRole('button',{name:'Marine'}).click();await modal().getByRole('button',{name:'S',exact:true}).click();
            await expect(modal().locator('legend')).toHaveText(['Farbe','Größe','Variante']);
            await expect(option(102)).toContainText('Cotton');await option(102).click();await save().click();await closed();
            assert.deepEqual(writes,[{method:'POST',id:102}]);
        });
        await check('Abbrechen, X, Escape und Hintergrund · Fokus und null Requests',async()=>{
            await open();await page.waitForLoadState('networkidle');const n=requests.length;
            for(const way of ['Abbrechen','X','Escape','Hintergrund']){
                await heart().focus();await page.keyboard.press('Enter');await expect(modal()).toBeVisible();
                assert.ok(await modal().evaluate(el=>el.contains(document.activeElement)));const cancel=modal().locator('.btn-secondary');
                await cancel.focus();await page.keyboard.press('Tab');await expect(modal().locator('.close')).toBeFocused();
                await page.keyboard.press('Shift+Tab');await expect(cancel).toBeFocused();
                if(way==='Escape')await page.keyboard.press('Escape');else if(way==='Hintergrund')await page.mouse.click(2,2);
                else await modal().locator(way==='X'?'.close':'.btn-secondary').click();await closed();
            }
            assert.deepEqual(requests.slice(n),[]);assert.equal(writes.length,0);
        });
        await check('HTTP-Fehler, falsche Antwort-ID und Wiederholung',async()=>{
            await open();await heart().click();await modal().getByRole('button',{name:'Marine'}).click();await option(101).click();
            for(const f of ['http','id']){fail=f;await save().click();await expect(modal().locator('[data-wish-status]')).toContainText('nicht aktualisiert');await expect(heart()).toHaveAttribute('aria-pressed','false');await expect(save()).toBeEnabled();}
            fail='';await save().click();await closed();assert.equal(writes.length,3);
        });
        await check('Fehlgeschlagener Einzel-DELETE belässt die Vormerkung',async()=>{
            await open('single',{saved:[101]});fail='false';await heart().click();await expect(page.locator('[data-wish-notice]')).toContainText('nicht aktualisiert');await expect(heart()).toHaveAttribute('aria-pressed','true');
        });
        await check('Gast · gleicher IO-Aufruf und bestätigte ID',async()=>{
            await open('sizes',{guest:true});await heart().click();await option(102).click();await save().click();await closed();assert.deepEqual(writes,[{method:'POST',id:102}]);
        });
        for(const lang of langs)await check('Sprache '+lang,async()=>{
            await open('both',{lang,saved:[103]});await heart().click();
            await modal().getByRole('button',{name:'Olive'}).click();await option(103).click();
            await expect(modal().locator('legend')).toHaveText([dims.color.names[langs.indexOf(lang)],dims.size.names[langs.indexOf(lang)]]);
            const expected={de:['Nicht verfügbar','Bereits auf der Merkliste'],en:['Not available','Already on your wish list'],fr:['Non disponible','Déjà dans votre liste de souhaits'],it:['Non disponibile','Già nella lista dei desideri'],es:['No disponible','Ya está en tu lista de deseos']}[lang];
            for(const s of expected)await expect(option(103)).toContainText(s);
            assert.doesNotMatch(await modal().innerText(),/::Template|wishAlreadySaved/);await expect(save()).toBeDisabled();
        });
        for(const width of [320,360,390,430,768,1024,1440])await check('Dialoge bei '+width+' px · Touch, Innen-Scroll und Trefferfläche',async()=>{
            await open('many',{width,height:width<500?620:800,touch:width<500});const tap=async l=>config.touch?l.tap():l.click();
            await tap(heart());await expect(modal()).toBeVisible();await tap(option(101));const m=await modal().evaluate(el=>{
                const body=el.querySelector('.modal-body'), save=el.querySelector('[data-wish-save]'), r=save.getBoundingClientRect();
                body.scrollTop=body.scrollHeight;return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,scroll:body.scrollTop,
                    visible:r.x>=0&&r.right<=innerWidth&&r.y>=0&&r.bottom<=innerHeight,hit:save.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),height:r.height,lock:getComputedStyle(document.body).overflowY};});
            assert.ok(m.visible && m.hit && m.height>=44 && m.overflow===0 && m.lock==='hidden',JSON.stringify(m)); if(width<500)assert.ok(m.scroll>0);
            await tap(modal().locator('.close'));await closed();
            await tap(page.locator('#info'));const info=page.locator('.dynamicModal');await expect(info.getByText('Français')).toBeVisible();
            await expect(info.getByRole('button')).toBeFocused();await page.keyboard.press('Escape');await expect(info).toBeHidden();await expect(page.locator('#info')).toBeFocused();
            results[results.length]= {name:'Messung '+width,measurement:m};
        });
        await check('Shopauswahl · Öffnen, Escape, Scrollsperre und wartender zweiter Dialog',async()=>{
            await open('both',{shop:true});await heart().click();await expect(modal()).toBeVisible();
            await page.waitForTimeout(2100);await expect(page.locator('#shop-mode-modal')).toBeHidden();
            await modal().locator('.close').click();const choice=page.locator('#shop-mode-modal');await expect(choice).toBeVisible();await expect(page.locator('#smm-b2b')).toBeFocused();
            await page.keyboard.press('Escape');await expect(choice).toHaveCount(0);assert.equal(await page.locator('body.modal-open,.modal-backdrop').count(),0);
        });
        await check('Shopauswahl, Sprachdialog, Quickview- und Loginrahmen auf sieben Breiten',async()=>{
            await open('both',{shop:true,dialogShells:true});
            for(const [selector,opener] of [['#shop-mode-modal',null],['.dynamicModal','#info'],['.modal-cross','[data-target=".modal-cross"]'],['#login','[data-target="#login"]']]){
                const dialog=page.locator(selector);
                if(opener) await page.locator(opener).click();
                await expect(dialog).toBeVisible();
                if(selector==='.dynamicModal') await expect(dialog.getByText('Français')).toBeVisible();
                await expect.poll(()=>dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
                const measurements=[];
                for(const width of [320,360,390,430,768,1024,1440]){
                    await page.setViewportSize({width,height:width<500?620:800});
                    const measurement=await dialog.evaluate(el=>{
                        const card=el.querySelector('.modal-content').getBoundingClientRect();
                        const controls=[...el.querySelectorAll('button')].map(btn=>{
                            const r=btn.getBoundingClientRect();
                            return {height:r.height,width:r.width,hit:btn.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))};
                        });
                        return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,
                            cardVisible:card.left>=0 && card.right<=innerWidth && card.top>=0 && card.bottom<=innerHeight,
                            locked:getComputedStyle(document.body).overflowY==='hidden',controls};
                    });
                    assert.ok(measurement.overflow===0 && measurement.cardVisible && measurement.locked,JSON.stringify(measurement));
                    assert.ok(measurement.controls.every(c=>c.height>=44 && c.width>=44 && c.hit),JSON.stringify(measurement));
                    measurements.push(measurement);
                }
                results.push({name:selector,measurements});
                // Bootstrap hides the Quickview before its backdrop finishes fading.
                // Check the released scroll lock at the actual end of the modal lifecycle.
                await dialog.evaluate(el=>{
                    document.body.dataset.fixtureHidden='';
                    $(el).one('hidden.bs.modal',()=>{document.body.dataset.fixtureHidden='yes';});
                });
                await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
                await expect(page.locator('body')).toHaveAttribute('data-fixture-hidden','yes');
                assert.equal(await page.locator('body.modal-open,.modal-backdrop').count(),0);
                if(opener) await expect(page.locator(opener)).toBeFocused();
            }
        });
        for(const width of [390,1440])await check('Bildvergleich '+width,async()=>{
            for(const baseline of [true,false]){
                await open('both',{width,height:width===390?760:900,baseline});
                if(baseline){await heart().click();await expect(heart()).toHaveAttribute('aria-pressed','true');}
                else {await heart().click();await expect(modal()).toBeVisible();await modal().getByRole('button',{name:'Marine'}).click();await option(102).click();}
                await shot((baseline?'vorher':'nachher')+'-herz-'+width);if(!baseline){
                    await modal().getByRole('button',{name:'Olive'}).click();await option(103).click();
                    await shot('nicht-verfuegbar-'+width);await modal().locator('.close').click();await closed();
                }
                await page.locator('#info').click();await expect(page.locator('.dynamicModal').getByText('Français')).toBeVisible();await page.waitForTimeout(350);
                await shot((baseline?'vorher':'nachher')+'-dialog-'+width);
            }
        });
        await check('JavaScript ohne Laufzeitfehler',async()=>assert.deepEqual(errors,[]));
        console.log(results.filter(r=>r.pass).length+' Fälle bestanden');
    }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
