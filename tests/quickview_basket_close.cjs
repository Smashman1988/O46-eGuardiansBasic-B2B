// Local browser integration. Every request, including IO writes, is intercepted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const {chromium, expect} = require('@playwright/test');
const {fixture, product} = require('./quickview_lifecycle.cjs');
const {fixture: pdpFixture} = require('./dialog_switch.cjs');
const out = path.resolve('.cache/quickview-auto-close');
const read = file => fs.readFileSync(file, 'utf8');
const before = process.argv.includes('--before');
const php = process.env.O46_PHP || (process.platform === 'win32' ? path.resolve('.cache/php-runtime/php-8.4.23/php.exe') : 'php');
const phpArgs = process.platform === 'win32' ? ['-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=mbstring'] : [];
const rendered = JSON.parse(cp.execFileSync(php,[...phpArgs,'tests/cross-browser/render.php',
    process.env.O46_TWIG_AUTOLOAD || '.cache/contact-widget/autoload3.php'],{encoding:'utf8',maxBuffer:8e6}));
const de = Object.fromEntries(read('resources/lang/de/Template.properties').split(/\r?\n/).filter(s=>s.includes('='))
    .map(s=>{const pos=s.indexOf('='); return [s.slice(0,pos).trim(),s.slice(pos+1).trim()];}));
const translate = s => s.replace(/{{\s*trans\(["']GuardiansBasicB2B::Template\.(\w+)["']\)\s*}}/g,(_,key)=>{assert.ok(de[key]);return de[key];});
const shell = translate(read('resources/views/PageDesign/PageDesign.twig').match(/<div class="modal fade modal-cross"[\s\S]*?(?=\s*{#)/)[0]);
const toast = translate(read('resources/views/DynamicContent/DynamicBasketPreviewSmall.twig'));
const picture = '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#689b3b"/></svg>';
const summary = quantity => ({itemQuantity:quantity,itemSum:0,currency:'EUR',shippingCountryId:1,itemWishListIds:[]});
const results = [];
function gate() { let release; const promise=new Promise(resolve=>{release=resolve;}); return {promise,release}; }

async function listing(browser,width,mode={}) {
    const context=await browser.newContext({viewport:{width,height:850},serviceWorkers:'block'});
    const page=await context.newPage(), errors=[], traffic=[], posts=[];
    page.on('pageerror', e=>errors.push(e.message));
    page.setDefaultTimeout(5000);
    let quantity=mode.initial || 0, wrote=false;
    const html=fixture({lang:'de',id:1,bundle:'cat'})
        .replace('<body>','<body><div id="vue-app" class="main" data-eg-handler="initShopData" data-eg-event="load"></div>')
        .replace(/<header>[\s\S]*?<\/header>/,rendered.languages.de.header)
        .replace(/<div class="modal fade modal-cross"[\s\S]*?(?=<script>)/,()=>shell+'<template id="o46-basket-toast">'+toast+'</template>')
        .replace('<button class="linkabso"', '<h1>Artikelübersicht</h1><button class="linkabso"')
        .replace('>A</button>','>Vorschau Artikel A</button>').replace('>B</button>','>Vorschau Artikel B</button>');
    await context.route('**/*',async route=>{
        const req=route.request(), u=new URL(req.url()), p=u.pathname, method=req.method();
        assert.equal(u.hostname,'fixture.test');
        if(p.startsWith('/rest/')) traffic.push(method+' '+p);
        if(p==='/') return route.fulfill({contentType:'text/html',body:html});
        if(p==='/core.js'||p.startsWith('/assets/')) {
            const file='resources/js/'+(p==='/core.js'?'core.min.js':path.basename(p));
            const body=before && p.includes('matrix.min.js') ? cp.execFileSync('git',['show','HEAD:'+file],{encoding:'utf8'}) : read(file);
            return route.fulfill({contentType:'application/javascript',body});
        }
        if(p==='/style.css') return route.fulfill({contentType:'text/css',body:read('resources/css/main.min.css')});
        if(req.resourceType()==='image') return route.fulfill({contentType:'image/svg+xml',body:picture});
        if(req.resourceType()==='font') return route.fulfill({path:path.resolve('resources/documents/fonts',path.basename(p))});
        if(/^\/de\/[AB]$/.test(p)) return route.fulfill({contentType:'text/html',body:product(p.at(-1),'de')});
        if(p==='/rest/io/variations/batch') return route.fulfill({json:{data:{items:Object.fromEntries([1001,1002,2001,2002].map(id=>[id,{id,stock:10,orderMax:5,images:[]}]))}}});
        if(p==='/rest/io/session/') return route.fulfill({json:{data:{basket:summary(quantity)}}});
        if(p==='/rest/io/basket/') {
            if(wrote && mode.headerGate) await mode.headerGate.promise;
            return route.fulfill({status:wrote && mode.badHeader ? 503 : 200,json:{data:summary(quantity)}});
        }
        if(p==='/rest/io/basket/items/' && method==='GET') return route.fulfill({status:mode.badSnapshot?503:200,json:{data:quantity?[{variationId:1001,quantity}]:[]}});
        if(p==='/rest/io/basket/items/' && method==='POST') {
            const params=new URLSearchParams(req.postData()), batch=[];
            for(let i=0;params.has('basketItems['+i+'][variationId]');i++) batch.push([Number(params.get('basketItems['+i+'][variationId]')),Number(params.get('basketItems['+i+'][quantity]'))]);
            if(params.has('variationId')) batch.push([Number(params.get('variationId')),Number(params.get('quantity'))]);
            posts.push(batch);
            if(mode.postGate) await mode.postGate.promise;
            wrote=true;
            if(mode.abort) return route.abort('connectionreset');
            if(mode.reject) {
                if(mode.partial) quantity+=batch[0][1];
                return route.fulfill({status:400,json:{data:{exceptionCode:112,placeholder:{stock:0}}}});
            }
            quantity+=batch.reduce((n,item)=>n+item[1],0);
            return route.fulfill({status:201,json:mode.fallback?{data:true}:{data:true,events:{AfterBasketChanged:{basket:summary(quantity)}}}});
        }
        throw Error('Unexpected fixture request '+method+' '+p);
    });
    await page.goto('https://fixture.test/');
    await page.waitForFunction(()=>window.fixtureReady);
    await expect(page.locator('[data-eg-basket-quantity]').first()).toHaveText(String(quantity));
    await page.evaluate(()=>{
        window.qvEvents=[]; const mark=kind=>qvEvents.push({kind,ms:performance.now()});
        jQuery('.modal-cross').on('shown.bs.modal hide.bs.modal hidden.bs.modal',e=>mark(e.type));
        new MutationObserver(records=>{for(const r of records) for(const el of r.addedNodes) if(el.id==='wkb-toast') {
            mark('toast'); new MutationObserver(()=>{if(!el.classList.contains('show'))mark('expired');}).observe(el,{attributes:true,attributeFilter:['class']});
        }}).observe(document.querySelector('.basket-prev-small-data'),{childList:true});
    });
    const modal=page.locator('.modal-cross'), add=modal.locator('[data-eg-matrix-add]');
    async function open(key='A') {
        await page.getByRole('button',{name:'Vorschau Artikel '+key}).click();
        await expect.poll(()=>page.evaluate(()=>O46Core.quickview?.phase)).toBe('shown');
        await expect(modal.locator('[data-fixture-product="'+key+'"] [data-eg-qty]').first()).toBeEnabled();
    }
    async function select(values=[1]) {
        for(const [i,n] of values.entries()) await modal.locator('[data-eg-qty]').nth(i).fill(String(n));
    }
    async function closed() {
        await expect.poll(()=>page.evaluate(()=>O46Core.quickview.phase)).toBe('hidden');
        await expect(page.locator('.modal-backdrop,body.modal-open')).toHaveCount(0);
    }
    return {context,page,modal,add,open,select,closed,errors,traffic,posts};
}

async function run() {
    fs.mkdirSync(out,{recursive:true});
    const browser=await chromium.launch({channel:process.env.O46_CHROME_CHANNEL || 'chrome'});
    async function scenario(name,width,mode,check) {
        const t=await listing(browser,width,mode);
        const row={name,width}; results.push(row);
        try {
            await t.open(); await check(t,row);
            assert.deepEqual(t.errors,[]);row.status='PASS';
        } catch(e) {
            row.status='FAIL'; row.error=e.message;process.exitCode=1;
        } finally {
            row.events=await t.page.evaluate(()=>qvEvents);row.posts=t.posts;row.requests=t.traffic;
            await t.context.close(); console.log(row.status,name,width,row.error||'');
        }
    }
    const header=t=>t.page.locator('[data-eg-basket-quantity]').first();
    try {
        for(const width of before?[390]:[320,390,768,1024,1440]) {
            const held=gate();
            await scenario(before?'Ausgangsverhalten':'Vollständiger Zugang',width,{postGate:held},async(t,row)=>{
                await t.select(width===1440?[1,2]:[1]);
                await t.add.click(); await expect.poll(()=>t.posts.length).toBe(1);
                await expect(t.add).toBeDisabled(); await expect(t.modal).toBeVisible();
                if(width===390||width===1440) await t.page.screenshot({path:path.join(out,(before?'ausgang':'vorher')+'-'+width+'.png')});
                const reads=t.traffic.filter(r=>r==='GET /rest/io/basket/').length;
                held.release();
                await expect(header(t)).toHaveText(width===1440?'3':'1');
                if(before) {
                    await expect(t.add).toBeEnabled();await expect(t.modal).toBeVisible();
                    assert.equal(await t.page.evaluate(()=>O46Core.quickview.phase),'shown');
                    await expect(t.page.locator('#wkb-toast.show')).toHaveCount(1);
                    await t.page.screenshot({path:path.join(out,'ausgang-nach-zugang.png')});return;
                }
                await t.closed();await expect(t.page.getByRole('button',{name:'Vorschau Artikel A'})).toBeFocused();
                const notice=t.page.locator('#wkb-toast.show');await expect(notice).toBeVisible();
                await expect(notice).toContainText(de.superinwkb);
                row.toast=await notice.evaluate(el=>{
                    const r=el.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
                    return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom,topmost:el.contains(hit),scroll:getComputedStyle(document.body).overflowY};
                });
                assert.ok(row.toast.x>=0 && row.toast.right<=width+0.5 && row.toast.y>=0 && row.toast.bottom<=850 && row.toast.topmost);
                assert.notEqual(row.toast.scroll,'hidden');
                assert.equal(t.traffic.filter(r=>r==='GET /rest/io/basket/').length,reads);
                assert.deepEqual(t.posts,width===1440?[[[1001,1],[1002,2]]]:[[[1001,1]]]);
                if(width===390||width===1440) await t.page.screenshot({path:path.join(out,'nachher-'+width+'.png')});
                if(width===390) {
                    await t.page.waitForFunction(()=>qvEvents.some(e=>e.kind==='expired'));
                    const events=await t.page.evaluate(()=>qvEvents);
                    row.toastMs=Math.round(events.find(e=>e.kind==='expired').ms-events.find(e=>e.kind==='toast').ms);
                    assert.ok(row.toastMs>=2950);
                }
                for(const name of ['hide','hidden','toast']) assert.equal(await t.page.evaluate(k=>qvEvents.filter(e=>e.kind===k).length,name),1);
            });
        }
        if(before) return;
        const headerGate=gate();
        await scenario('Doppelklick und verzögerter Header',390,{headerGate,fallback:true},async t=>{
            await t.select();
            const count=t.traffic.filter(r=>r==='GET /rest/io/basket/').length;
            await t.add.evaluate(b=>{b.click();b.click();});
            await expect.poll(()=>t.traffic.filter(r=>r==='GET /rest/io/basket/').length).toBe(count+1);
            await expect(t.modal).toBeVisible();await expect(t.add).toBeDisabled();await expect(t.page.locator('#wkb-toast')).toHaveCount(0);
            await expect(header(t)).toHaveText('0');headerGate.release();await t.closed();await expect(header(t)).toHaveText('1');
            assert.equal(t.posts.length,1);assert.equal(t.traffic.filter(r=>r==='GET /rest/io/basket/').length,count+1);
        });
        for(const [name,mode,values,count,total] of [
            ['IO-Ablehnung',{reject:true},[1],1,0],['Teilweise abgelehnter Batch',{reject:true,partial:true},[1,2],1,1],
            ['Verbindungsabbruch',{abort:true},[1],1,0],['Bestandsabgleich nicht lesbar',{badSnapshot:true},[1],0,0],
            ['Header nach bestätigtem POST nicht lesbar',{fallback:true,badHeader:true},[1],1,0],
            ['Menge null',{},[0],0,0],['Keine gewählte Variante',{},[],0,0],
            ['Teilmenge angepasst',{initial:4},[2,1],1,6],['Bestandsgrenze erreicht',{initial:5},[1],0,5]
        ]) await scenario(name,390,mode,async t=>{
            await t.select(values);await t.add.click();
            await expect(t.page.locator('.alert-danger:visible,.eg-notice:visible').first()).toBeVisible();
            await expect(header(t)).toHaveText(String(total));
            await expect(t.modal).toBeVisible();assert.equal(t.posts.length,count);
            if(mode.initial===4) assert.deepEqual(t.posts,[[[1001,1],[1002,1]]]);
            await expect(t.page.locator('#wkb-toast')).toHaveCount(0);
            assert.equal(await t.page.evaluate(()=>qvEvents.filter(e=>e.kind==='hide').length),0);
        });
        for(const next of [null,'A','B']) {
            const postGate=gate();
            await scenario('Späte Antwort nach X'+(next?' und Wiederöffnen '+next:''),390,{postGate},async t=>{
                await t.select();await t.add.click();await expect.poll(()=>t.posts.length).toBe(1);
                await t.modal.locator('.modal-header .close').click();await t.closed();
                if(next) await t.open(next);
                postGate.release();await expect(header(t)).toHaveText('1');
                if(next) {await expect(t.modal).toBeVisible();await expect(t.modal.locator('article')).toHaveAttribute('data-fixture-product',next);}
                else await t.closed();
                assert.equal(await t.page.evaluate(()=>qvEvents.filter(e=>e.kind==='hide').length),1);
                await expect(t.page.locator('#wkb-toast')).toHaveCount(0);
            });
        }
        await scenario('Externe Headeraktualisierung, Escape und Hintergrund',1024,{},async t=>{
            await t.page.evaluate(s=>O46Core.basketHeader.accept(s),summary(4));await expect(header(t)).toHaveText('4');
            await expect(t.modal).toBeVisible();assert.equal(t.posts.length,0);
            await t.page.keyboard.press('Escape');await t.closed();await t.open();
            await t.modal.click({position:{x:2,y:2}});await t.closed();
        });
        await scenario('Externer Artikelzugang während der Vorschau',1024,{},async t=>{
            const error=await t.page.evaluate(()=>new Promise(resolve=>eGuardians.basket.addItem(2001,2,(_,code)=>resolve(code))));
            assert.equal(error,null);await expect(header(t)).toHaveText('2');
            assert.deepEqual(t.posts,[[[2001,2]]]);await expect(t.modal).toBeVisible();
            assert.equal(await t.page.evaluate(()=>qvEvents.some(e=>e.kind==='hide')),false);
        });
        for(const switchProduct of [false,true]) await scenario(switchProduct?'Produktwechsel im Öffnungseffekt':'Bestätigung im Öffnungseffekt',390,{},async(t,row)=>{
            await t.modal.locator('.close').click();await t.closed();
            await t.page.evaluate(replace=>{
                qvEvents.length=0;
                jQuery('.modal-cross').one('show.bs.modal',function(){
                    const matrix=this.querySelector('[data-eg-size-matrix]');
                    const observer=new MutationObserver(()=>{
                        const input=matrix.querySelector('[data-eg-qty]:not(:disabled)');
                        if(!input) return;
                        observer.disconnect();
                        input.value='1';input.dispatchEvent(new Event('input',{bubbles:true}));
                        const button=matrix.querySelector('[data-eg-matrix-add]');
                        const finished=new MutationObserver(()=>{
                            if(button.hasAttribute('aria-busy')) return;
                            finished.disconnect();window.confirmedPhase=O46Core.quickview.phase;
                            if(replace) document.querySelectorAll('.linkabso')[1].click();
                        });
                        finished.observe(button,{attributes:true,attributeFilter:['aria-busy']});
                        button.click();
                    });
                    observer.observe(matrix,{childList:true,subtree:true,attributes:true});
                });
                document.querySelector('.linkabso').click();
            },switchProduct);
            await t.page.waitForFunction(()=>window.confirmedPhase);
            row.confirmedPhase=await t.page.evaluate(()=>confirmedPhase);assert.equal(row.confirmedPhase,'opening');
            if(switchProduct) {
                await expect(t.modal.locator('article')).toHaveAttribute('data-fixture-product','B');
                await expect(t.modal).toBeVisible();await t.modal.locator('.close').click();
            }
            await t.closed();await expect(t.page.locator('#wkb-toast.show')).toHaveCount(switchProduct?0:1);
            assert.equal(t.posts.length,1);
        });
        await scenario('Galeriebild und Zoom',1440,{},async t=>{
            await t.page.evaluate(()=>{window.galleryEvents=[];for(const key of ['onUpdate','onExpandOpen','onExpandClose']) MagicZoom.registerCallback(key,()=>galleryEvents.push(key));});
            await t.modal.locator('.single-prev-images a').click();
            await t.page.waitForFunction(()=>galleryEvents.includes('onUpdate'));
            await t.modal.locator('#ItemImgZoom2').click();await t.page.waitForFunction(()=>galleryEvents.includes('onExpandOpen'));
            await t.page.locator('.mz-button-close:visible').click();await t.page.waitForFunction(()=>galleryEvents.includes('onExpandClose'));
            await expect(t.modal).toBeVisible();assert.equal(t.posts.length,0);
        });
        const pdp=await pdpFixture(browser,'de',1440);
        const row={name:'Desktop-PDP, Merklistenauswahl und Kontodialog',width:1440};results.push(row);
        try {
            let posted=0;
            await pdp.page.route('**/rest/io/basket/items/',async route=>{
                if(route.request().method()==='GET') return route.fulfill({json:{data:[]}});
                posted++;return route.fulfill({status:201,json:{data:true,events:{AfterBasketChanged:{basket:summary(1)}}}});
            });
            const url=pdp.page.url();await pdp.page.locator('[data-eg-qty]').first().fill('1');await pdp.page.locator('[data-eg-matrix-add]').click();
            await expect(pdp.page.locator('[data-eg-basket-quantity]').first()).toHaveText('1');assert.equal(posted,1);
            assert.equal(pdp.page.url(),url);await expect(pdp.page.locator('.modal.show,.modal-backdrop')).toHaveCount(0);
            await pdp.heart.click();const picker=pdp.page.locator('#eg-wish-picker');
            await expect(picker).toBeVisible();
            await expect(picker.locator('[data-wish-key="9-1"]')).toHaveText('Rosa');
            await picker.locator('[data-wish-key="9-1"]').click();await picker.locator('[data-wish-id="1453158"]').click();
            await expect(picker.locator('[data-wish-save]')).toBeEnabled();await pdp.page.keyboard.press('Escape');await expect(pdp.heart).toBeFocused();
            const account=await pdp.open('account'); await pdp.reply(account);await expect(pdp.modal.locator('form')).toBeVisible();
            await pdp.modal.locator('.close').click();await expect(pdp.modal).toBeHidden();assert.deepEqual(pdp.errors,[]);
            row.status='PASS';row.posts=posted;
        } catch(e) {row.status='FAIL';row.error=e.message;row.picker=await pdp.page.locator('#eg-wish-picker').innerText();row.errors=pdp.errors;process.exitCode=1;}
        finally {await pdp.context.close();console.log(row.status,row.name,row.error||'');}
    } finally {
        await browser.close();
        fs.writeFileSync(path.join(out,before?'baseline.json':'results.json'),JSON.stringify({browser:browser.version(),results},null,2));
    }
}
run().catch(e=>{console.error(e);process.exitCode=1;});
