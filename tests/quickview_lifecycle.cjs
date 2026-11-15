// Real shipped Bootstrap/jQuery/CSS, MagicZoom, matrix and page entry point.
// Only Plenty endpoints/images are local fixtures. No requests to either shop.
// node tests/quickview_lifecycle.cjs <output-dir> [--baseline] [--min] [--smoke] [--filter=extended|name] [--delay=0]
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const output = path.resolve(process.argv[2] || '.cache/quickview-lifecycle');
const baseline = process.argv.includes('--baseline'), compressed = process.argv.includes('--min');
const smoke = process.argv.includes('--smoke');
const filter = process.argv.find(arg=>arg.startsWith('--filter='))?.slice(9);
const requestedDelay = process.argv.find(arg=>arg.startsWith('--delay='))?.slice(8);
const revision = 'b6ba34996bd261482af3e8cd694707a3594d789e';
const read = file => fs.readFileSync(file, 'utf8');
const core = baseline ? cp.execFileSync('git', ['show', revision + ':resources/js/core.min.js'], {encoding:'utf8', maxBuffer:2e6}) :
    compressed ? read('resources/js/core.min.js') : ['core.js','search.js','zoom-loader.js'].map(f => read('resources/js/' + f)).join('\n');
fs.mkdirSync(output, {recursive:true});
const cases = new Map(), results = [];
let origin, serial = 0;
const labels = {de:'Menge', en:'Quantity', fr:'Quantité', it:'Quantità', es:'Cantidad'};
function product(id, lang) {
    const offset = id === 'B' ? 2000 : 1000;
    const variants = [1,2].map(i => ({variationId:offset+i, attributes:[{attributeId:1,attributeValueId:i}]}));
    return `<article class="single" data-fixture-product="${id}" data-fixture-lang="${lang}"><h2>Product ${id}</h2>
    <a class="MagicZoom" id="ItemImgZoom2" href="/image.svg?large=${id}" data-options="zoomMode: off; hint: off;"><img width="120" height="90" src="/image.svg?small=${id}"></a>
    <div class="single-prev-images"><a data-zoom-id="ItemImgZoom2" href="/image.svg?second=${id}" data-image="/image.svg?second=${id}"><img width="40" height="30" src="/image.svg?second=${id}"></a></div>
    <div data-item-variation data-eg-variations='${JSON.stringify(variants)}'><div data-eg-size-matrix data-eg-mode="size" data-eg-size-attribute-id="1" data-eg-size-values='[{"attributeValueId":1,"name":"M"},{"attributeValueId":2,"name":"L"}]'>
    <div class="eg-size-matrix-table" aria-busy="true"><div class="eg-size-matrix-head"><span data-eg-col="qty">${labels[lang]}</span></div><div class="eg-size-matrix-body"></div></div>
    <div class="eg-size-matrix-footer"><span data-eg-total-qty></span><span data-eg-total-sum></span><span data-eg-matrix-status></span><button data-eg-matrix-add>Add</button></div></div></div>
    <button data-eg-event="click" data-eg-handler="testVariant">Check binding</button></article>`;
}
function fixture(config) {
    return `<!doctype html><html lang="${config.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body>
    <header><span data-eg-basket-quantity>0</span><span data-basket-sum>0</span><a class="wishlist-link"></a></header><div data-eg-title="Currency">€</div>
    <script id="app-data-custom" type="application/json">{"templateType":"category"}</script>
    <button class="linkabso" data-href="/${config.lang}/A?case=${config.id}">A</button><button class="linkabso" data-href="/${config.lang}/B?case=${config.id}">B</button><div class="category-product-list"></div>
    <div class="modal fade modal-cross" tabindex="-1" role="dialog"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><button class="close" data-dismiss="modal" aria-label="Close">×</button></div><div class="modal-body"></div></div></div></div>
    <script>window.activeLang='${config.lang}';window.messageServiceTranslations={searchexample:'Search'};window.addEventListener('load',function(){eGuardians.initialize();eGuardians.events.testVariant=function(){window.variantClicks=(window.variantClicks||0)+1};window.fixtureReady=true});</script>
    <script src="/assets/jquery-3.7.1.min.js"></script><script src="/core.js?case=${config.id}" data-eg-magiczoom-src="/assets/magiczoom.min.js?case=${config.id}" data-eg-matrix-src="/assets/matrix.min.js?case=${config.id}" defer></script><script src="/assets/${config.bundle || 'main'}.min.js" defer></script></body></html>`;
}
const server = http.createServer((req, res) => {
    const url = new URL(req.url, origin), config = cases.get(url.searchParams.get('case') || /qvcase=(\d+)/.exec(req.headers.cookie || '')?.[1]);
    const send = (type, body, status=200, delay=0) => {
        const finish = () => { if (!res.destroyed) { res.writeHead(status, {'Content-Type':type}); res.end(body); } };
        if (delay) setTimeout(finish, delay); else finish();
    };
    if (config) config.requests.push({path:url.pathname, query:url.search, method:req.method, at:Date.now()});
    if (url.pathname === '/core.js') return send('application/javascript', core);
    if (url.pathname.startsWith('/assets/')) return send('application/javascript', read('resources/js/' + path.basename(url.pathname)), 200,
        url.pathname.includes('/matrix.') ? config?.matrixDelay || 0 : 0);
    if (url.pathname === '/style.css') return send('text/css', read('resources/css/main.min.css'));
    if (url.pathname === '/image.svg') return send('image/svg+xml','<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480"><rect width="640" height="480" fill="#76ae00"/></svg>');
    if (/^\/(de|en|fr|it|es)\/[AB]$/.test(url.pathname)) {
        if (!url.searchParams.has('quickViewItem')) return send('text/html','<h1>Product fallback</h1>');
        const fail = config.failNext; config.failNext = false;
        return send('text/html', fail ? '' : product(url.pathname.at(-1), config.lang), fail ? 503 : 200,
            config.htmlDelays?.[url.pathname.at(-1)] ?? config.htmlDelay ?? 0);
    }
    if (url.pathname === '/rest/io/variations/batch') {
        const items = Object.fromEntries([1001,1002,2001,2002].map(id => [id,{id,price:id%2 ? 4.99 : 7.49,stock:id%2 ? 17 : 8,orderMax:id%2 ? 5 : 3,ean:'001234567'+id,images:[]} ]));
        return send('application/json', JSON.stringify({data:{items}}));
    }
    if (url.pathname === '/rest/io/session/') return send('application/json',JSON.stringify({data:{basket:{itemQuantity:0,itemSum:0,currency:'EUR',shippingCountryId:1,customerId:0,itemWishListIds:[]}}}));
    if (url.pathname.startsWith('/rest/io/basket')) {
        const basket = () => ({itemQuantity:config.basket.reduce((s,r)=>s+r.quantity,0),itemSum:config.basket.reduce((s,r)=>s+r.quantity*4.99,0),currency:'EUR',shippingCountryId:1,itemWishListIds:[]});
        if(req.method==='POST') {
            let body='';req.on('data',chunk=>body+=chunk);req.on('end',()=>{
                const params=new URLSearchParams(body);
                config.basket=[{id:1,variationId:Number(params.get('basketItems[0][variationId]')),quantity:Number(params.get('basketItems[0][quantity]'))}];
                send('application/json',JSON.stringify({data:true,events:{AfterBasketChanged:{basket:basket()}}}),201);
            });return;
        }
        if(req.method==='DELETE') {config.basket=[];return send('application/json',JSON.stringify({data:true}));}
        return send('application/json',JSON.stringify({data:url.pathname.includes('/items')?config.basket:basket()}));
    }
    if (url.pathname === '/' && config) {res.setHeader('Set-Cookie','qvcase='+config.id+'; Path=/; SameSite=Lax');return send('text/html', fixture(config));}
    if (url.pathname === '/favicon.ico') return send('image/x-icon','');
    send('text/plain', '', 404);
});
async function setup(browser, extra={}) {
    const config = {id:String(++serial),lang:'de',width:1440,requests:[],basket:[],...extra}; cases.set(config.id, config);
    const context = await browser.newContext({viewport:{width:config.width,height:900},reducedMotion:'no-preference',isMobile:!!config.touch,hasTouch:!!config.touch});
    const page = await context.newPage(), errors = [], consoleMessages = [], networkFailures = [];
    page.setDefaultTimeout(7000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console',message=>{if(['warning','error'].includes(message.type()))consoleMessages.push({type:message.type(),text:message.text()});});
    page.on('requestfailed',request=>networkFailures.push({url:request.url(),error:request.failure()?.errorText}));
    page.on('response',response=>{if(response.status()>=400)networkFailures.push({url:response.url(),status:response.status()});});
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    await page.goto(origin + '/?case=' + config.id);
    await page.waitForFunction(() => window.fixtureReady);
    await page.evaluate(() => {
        window.timeline = []; window.initCount = 0; window.bindCount = 0;
        const backdrops=new WeakMap();let nextBackdrop=0;
        window.snapshot = () => {
            const node=document.querySelector('.modal-cross'), modal=jQuery(node).data('bs.modal');
            if(modal?._backdrop&&!backdrops.has(modal._backdrop))backdrops.set(modal._backdrop,++nextBackdrop);
            return {shown:!!modal?._isShown,transitioning:!!modal?._isTransitioning,display:getComputedStyle(node).display,
                opacity:getComputedStyle(node).opacity,cls:node.className,ariaHidden:node.getAttribute('aria-hidden'),ariaModal:node.getAttribute('aria-modal'),
                backdrops:document.querySelectorAll('.modal-backdrop').length,product:node.querySelector('article')?.dataset.fixtureProduct || null,
                rows:node.querySelectorAll('.eg-row').length,initCount,bindCount,backdropId:modal?._backdrop?backdrops.get(modal._backdrop):null};
        };
        window.record = event => timeline.push({ms:Math.round(performance.now()*10)/10,event,...snapshot()});
        jQuery('.modal-cross').on('show.bs.modal shown.bs.modal hide.bs.modal hidden.bs.modal', event => record(event.type));
        for (const name of ['show','hide','_hideModal','_removeBackdrop','_showBackdrop','_showElement']) {
            const original = jQuery.fn.modal.Constructor.prototype[name];
            jQuery.fn.modal.Constructor.prototype[name] = function(...args) { record(name+'-call'); return original.apply(this,args); };
        }
        const bind=eGuardians.events.bindEvents;
        eGuardians.events.bindEvents=function(selector){if(selector?.includes('modal-cross')){bindCount++;record('bind');}return bind.apply(this,arguments);};
        const get=eGuardians.apiservice.get;
        eGuardians.apiservice.get=function(url,data,callback,...rest){record('GET '+new URL(url,location.href).pathname);return get.call(this,url,data,function(...args){record('response '+new URL(url,location.href).pathname);callback(...args);},...rest);};
        new MutationObserver(records=>{for(const r of records)if(r.type==='attributes' && r.attributeName==='data-eg-matrix-initialized'){initCount++;record('matrix-init');}}).observe(document.querySelector('.modal-body'),{subtree:true,attributes:true});
        document.addEventListener('click',event=>{if(event.target.closest('.linkabso,[data-dismiss="modal"]'))record('click '+event.target.closest('.linkabso,[data-dismiss="modal"]').textContent);},true);
    });
    return {page,context,config,errors,consoleMessages,networkFailures};
}
async function ready(page, product='A') {
    await page.waitForFunction(id => {
        const n=document.querySelector('.modal-cross'), m=jQuery(n).data('bs.modal');
        return m?._isShown && !m._isTransitioning && n.classList.contains('show') && getComputedStyle(n).display==='block' &&
            getComputedStyle(n).opacity==='1' && n.getAttribute('aria-modal')==='true' && !n.hasAttribute('aria-hidden') &&
            n.querySelector('article')?.dataset.fixtureProduct===id && n.querySelectorAll('.eg-row').length===2 &&
            n.querySelector('[data-eg-price-value="4.99"]') && n.querySelector('[data-eg-size-matrix]')?.dataset.egMatrixInitialized==='1' &&
            jQuery._data(n.querySelector('[data-eg-handler="testVariant"]'),'events')?.click?.length===1;
    }, product);
    assert.equal(await page.locator('.modal-backdrop').count(),1);
    const before=await page.evaluate(()=>window.variantClicks||0);
    await page.locator('[data-eg-handler="testVariant"]').click();
    assert.equal(await page.evaluate(()=>window.variantClicks),before+1,'Visible bound dialog is operable');
    const rows=await page.locator('.eg-row').evaluateAll(nodes=>nodes.map(n=>({id:Number(n.dataset.egVariationId),price:Number(n.querySelector('[data-eg-price]').dataset.egPriceValue),
        stock:Number(n.querySelector('[data-eg-stock]').dataset.egStockNet),ean:n.querySelector('[data-eg-ean]').textContent,limit:Number(n.dataset.egOrdermaxRaw),max:Number(n.querySelector('[data-eg-qty]').max)})));
    const start=product==='B'?2000:1000;
    assert.deepEqual(rows,[1,2].map(i=>({id:start+i,price:i===1?4.99:7.49,stock:i===1?17:8,ean:'001234567'+(start+i),limit:i===1?5:3,max:i===1?5:3})), 'Complete values after opening');
    assert.deepEqual(await page.locator('.eg-row [data-eg-col="size"]').allTextContents(),['M','L']);
    if(!baseline) {
        const listeners=await page.evaluate(()=>Object.fromEntries(['show','shown','hide','hidden'].map(name=>[name,
            jQuery._data(document.querySelector('.modal-cross'),'events')[name].filter(h=>h.namespace.includes('o46Quickview')).length])));
        assert.deepEqual(listeners,{show:1,shown:1,hide:1,hidden:1},'One coordinator listener per native event');
    }
}
async function closed(page) {
    await page.waitForFunction(() => {const n=document.querySelector('.modal-cross'),m=jQuery(n).data('bs.modal');return !m?._isShown && !m?._isTransitioning && getComputedStyle(n).display==='none' && !document.querySelector('.modal-backdrop');});
}
async function reopen(page, delay, duringOpening=false) {
    if (duringOpening) {
        await page.evaluate(delay => new Promise(resolve => {
            jQuery('.modal-cross').one('show.bs.modal.test',()=>setTimeout(()=>{
                document.querySelector('.close').click();const open=()=>{document.querySelector('.linkabso').click();resolve();};
                if(delay===0)open();else setTimeout(open,delay);
            },0));document.querySelector('.linkabso').click();
        }), delay);
    } else {
        await page.evaluate(delay => new Promise(resolve => {
            document.querySelector('.close').click();const open=()=>{document.querySelector('.linkabso').click();resolve();};
            if(delay===0)open();else setTimeout(open,delay);
        }), delay);
    }
}
async function main() {
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); origin='http://127.0.0.1:'+server.address().port;
    const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try {
        const widths=smoke?[1440]:[1440,390], delays=[0,50,100,250,500,1000].filter(value=>requestedDelay===undefined||value===Number(requestedDelay));
        for(const width of (filter && !'close-reopen'.includes(filter)?[]:widths)) for(const lang of (baseline||smoke?['de']:Object.keys(labels))) for(const delay of delays) {
            const t=await setup(browser,{width,lang});
            try {
                await t.page.locator('.linkabso').first().click();await ready(t.page);
                await reopen(t.page,delay);await t.page.waitForTimeout(1200);
                const state=await t.page.evaluate(()=>snapshot());
                const row={case:'close-reopen',width,lang,delay,state,result:state.shown&&state.display==='block'?'PASS':'FAIL',timeline:await t.page.evaluate(()=>timeline),requests:t.config.requests};
                results.push(row);
                if(!baseline) {
                    await ready(t.page);assert.equal(row.result,'PASS');
                    assert.equal(state.initCount,2);assert.equal(state.bindCount,2);
                    assert.equal(t.config.requests.filter(r=>r.path.includes('/matrix.min.js')).length,1);
                    assert.equal(t.config.requests.filter(r=>r.path.includes('/magiczoom.min.js')).length,1);
                    assert.equal(t.config.requests.filter(r=>r.path==='/rest/io/variations/batch').length,1);
                    assert.equal(t.config.requests.filter(r=>r.path.endsWith('/A')&&r.query.includes('quickViewItem')).length,2);
                    await t.page.locator('.close').click();await closed(t.page);
                    assert.deepEqual(t.networkFailures,[]);assert.deepEqual(t.consoleMessages,[]);
                }
                if(delay===0) await t.page.screenshot({path:path.join(output,'reopen-'+width+'.png')});
                assert.deepEqual(t.errors,[]);console.log(row.case,width,delay,row.result);
            } finally {await t.context.close();}
        }
        if(baseline||smoke) return;
        async function scenario(name,options,execute) {
            if(filter && filter!=='extended' && !name.includes(filter)) return;
            const t=await setup(browser,options),row={case:name,...options,result:'FAIL'};results.push(row);
            try {
                await execute(t);assert.deepEqual(t.errors,[]);
                if(!name.includes('failure')) {assert.deepEqual(t.consoleMessages,[]);assert.deepEqual(t.networkFailures,[]);}
                assert.equal(t.config.requests.filter(r=>/^\/rest\/io\/variations\/\d+/.test(r.path)).length,0);
                row.result='PASS';console.log(name,JSON.stringify(options),'PASS');
            }
            catch(error){row.error=error.stack;row.dom=await t.page.locator('body').innerHTML();await t.page.screenshot({path:path.join(output,name+'-'+options.width+'-failure.png')});throw error;}
            finally {
                row.timeline=await t.page.evaluate(()=>window.timeline||[]);row.requests=t.config.requests;
                row.errors=t.errors;row.console=t.consoleMessages;row.networkFailures=t.networkFailures;
                await t.context.close();
            }
        }
        for(const width of widths) {
            if(width===390) for(const delay of delays) await scenario('touch-reopen',{width,delay,touch:true},async({page})=>{
                await page.locator('.linkabso').first().tap();await ready(page);await reopen(page,delay);await ready(page);
                await page.locator('.close').tap();await closed(page);
            });
            for(const delay of delays) {
                await scenario('close-during-opening-reopen',{width,delay},async({page,config})=>{
                    await reopen(page,delay,true);await ready(page);await page.waitForTimeout(350);await ready(page);
                    assert.equal(config.requests.filter(r=>r.path.includes('/matrix.min.js')).length,1);
                    await page.locator('.close').click();await closed(page);
                });
                await scenario('rapid-identical-open',{width,delay,htmlDelay:300},async({page,config})=>{
                    await page.evaluate(delay=>new Promise(resolve=>{let n=0;function click(){document.querySelector('.linkabso').click();if(++n===4)resolve();else setTimeout(click,delay);}click();}),delay);
                    await ready(page);
                    assert.equal(config.requests.filter(r=>r.path.endsWith('/A')).length,1,'One HTML request for same active opening');
                    assert.equal(await page.evaluate(()=>initCount),1);assert.equal(await page.evaluate(()=>bindCount),1);
                });
                for(const loading of ['html','matrix']) await scenario('cancel-during-'+loading,{width,delay,[loading+'Delay']:1300},async({page,config})=>{
                    await page.locator('.linkabso').first().click();
                    if(loading==='matrix') await page.waitForFunction(()=>timeline.some(row=>row.event==='response /de/A'));
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(delay);
                    await page.locator('.linkabso').first().click();await ready(page);
                    const htmlRequests=config.requests.filter(r=>r.path.endsWith('/A')).length;
                    assert.equal(htmlRequests,loading==='html'?1:2,'Only pending HTML is reused');
                    assert.equal(config.requests.filter(r=>r.path.includes('/matrix.min.js')).length,1);
                    assert.equal(await page.evaluate(()=>initCount),1,'Canceled opening never inserts a matrix');
                });
            }
            for(const loading of ['html','matrix']) await scenario('cancel-without-reopen-'+loading,{width,[loading+'Delay']:500},async({page})=>{
                await page.locator('.linkabso').first().click();await page.keyboard.press('Escape');await page.waitForTimeout(800);await closed(page);
                assert.equal(await page.evaluate(()=>initCount),0);
                await page.locator('.linkabso').first().click();await ready(page);
            });
            for(const method of ['button','escape','backdrop']) await scenario('dismiss-during-opening-'+method,{width},async({page})=>{
                await page.evaluate(method=>{
                    jQuery('.modal-cross').one('show.bs.modal.test',()=>setTimeout(()=>{
                        if(method==='button')document.querySelector('.close').click();
                        if(method==='backdrop')document.querySelector('.modal-cross').click();
                        if(method==='escape')jQuery(document).trigger(jQuery.Event('keydown',{which:27}));
                    },0));document.querySelector('.linkabso').click();
                },method);
                await page.waitForTimeout(1000);await closed(page);
                await page.locator('.linkabso').first().click();await ready(page);
            });
            await scenario('product-change-and-stale-response',{width,htmlDelays:{A:300,B:0}},async({page})=>{
                // Schedule competing intents in the same browser turn; pointer
                // automation must not wait for an already opening backdrop.
                await page.evaluate(()=>{document.querySelectorAll('.linkabso')[0].click();document.querySelectorAll('.linkabso')[1].click();});
                await ready(page,'B');await page.waitForTimeout(400);await ready(page,'B');
                await page.locator('.close').click();await closed(page);
                await page.locator('.linkabso').first().click();await ready(page);
                await page.evaluate(()=>document.querySelector('.linkabso:nth-of-type(2)').click());await ready(page,'B');
            });
            await scenario('canceled-network-failure-retry',{width,htmlDelay:300,failNext:true},async({page,config})=>{
                await page.locator('.linkabso').first().click();await page.keyboard.press('Escape');await page.waitForTimeout(500);await closed(page);
                assert.equal(new URL(page.url()).pathname,'/','Canceled failure must not navigate');
                config.htmlDelay=0;await page.locator('.linkabso').first().click();await ready(page);
                assert.equal(config.requests.filter(r=>r.path.includes('/matrix.min.js')).length,1);
            });
            await scenario('network-failure-fallback-and-retry',{width,failNext:true},async({page})=>{
                await page.locator('.linkabso').first().click();await page.waitForURL('**/de/A?case=*');
                assert.equal(await page.locator('h1').textContent(),'Product fallback');
                await page.goBack();await page.waitForFunction(()=>window.fixtureReady);
                await page.locator('.linkabso').first().click();await ready(page);
            });
            await scenario('transport-failure-retry',{width},async({page,config})=>{
                let fail=true;
                await page.route('**/de/A?*',async route=>{
                    if(fail){fail=false;await new Promise(resolve=>setTimeout(resolve,150));return route.abort('failed');}
                    return route.continue();
                });
                await page.locator('.linkabso').first().click();await page.keyboard.press('Escape');await page.waitForTimeout(350);await closed(page);
                assert.equal(new URL(page.url()).pathname,'/');
                await page.locator('.linkabso').first().click();await ready(page);
                assert.equal(config.requests.filter(r=>r.path.includes('/matrix.min.js')).length,1);
                assert.equal(config.requests.filter(r=>r.path.includes('/magiczoom.min.js')).length,1);
            });
            for(const bundle of ['main','cat','item','vue']) await scenario('dynamic-card-'+bundle,{width,bundle},async({page})=>{
                await page.evaluate(()=>{const button=document.querySelectorAll('.linkabso')[1].cloneNode(true);button.id='dynamic-card';document.querySelector('.category-product-list').append(button);});
                await page.locator('#dynamic-card').click();await ready(page,'B');await reopen(page,0);await ready(page);
            });
            await scenario('gallery-quantity-basket-after-reopen',{width},async({page,config})=>{
                await page.locator('.linkabso').first().click();await ready(page);await reopen(page,0);await ready(page);
                await page.waitForFunction(()=>document.querySelector('#ItemImgZoom2 .mz-ready'));
                await page.evaluate(()=>{window.galleryUpdated=false;MagicZoom.registerCallback('onUpdate',()=>window.galleryUpdated=true);});
                await page.locator('.single-prev-images a').click();
                await page.waitForFunction(()=>window.galleryUpdated && [...document.querySelectorAll('#ItemImgZoom2 img')].some(img=>img.src.includes('second=')));
                await page.evaluate(()=>{window.expanded=false;window.expansionClosed=false;MagicZoom.registerCallback('onExpandOpen',()=>window.expanded=true);MagicZoom.registerCallback('onExpandClose',()=>window.expansionClosed=true);});
                await page.locator('#ItemImgZoom2').click();await page.waitForFunction(()=>window.expanded);
                await page.locator('.mz-button-close:visible').click();await page.waitForFunction(()=>window.expansionClosed);
                const qty=page.locator('[data-eg-qty]').first();await qty.fill('9');await qty.press('Tab');assert.equal(await qty.inputValue(),'5');
                await qty.fill('2');await qty.press('Tab');
                await page.waitForFunction(()=>document.querySelector('[data-eg-total-qty]').textContent.trim()==='2');
                assert.equal((await page.locator('[data-eg-total-qty]').textContent()).trim(),'2');
                assert.ok((await page.locator('[data-eg-total-sum]').textContent()).includes('9,98'));
                await page.locator('[data-eg-matrix-add]').click();
                await page.waitForFunction(()=>document.querySelector('[data-eg-basket-quantity]').textContent.trim()==='2');
                assert.deepEqual(config.basket,[{id:1,variationId:1001,quantity:2}]);
                assert.equal(config.requests.filter(r=>r.method==='POST').length,1);
                assert.equal(await qty.inputValue(),'0');
                await page.evaluate(()=>fetch('/rest/io/basket/items/1',{method:'DELETE'}));assert.deepEqual(config.basket,[]);
            });
        }
    } finally {await browser.close();server.close();fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({baseline,compressed,revision,results},null,2));}
}
main().catch(error=>{console.error(error);process.exitCode=1;server.close();});
