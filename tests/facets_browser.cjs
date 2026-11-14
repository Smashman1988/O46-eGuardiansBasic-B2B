// Local HTTP/Twig/Chromium acceptance. IO responses are explicit fixtures, never native claims.
// O46_PLAYWRIGHT_MODULE, O46_BROWSER_EXECUTABLE; node tests/facets_browser.cjs <report-dir> [--smoke]
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), zlib = require('node:zlib');
const assert = require('node:assert/strict'), {execFileSync} = require('node:child_process');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const {moduleCode}=require('./language_modal.cjs');
const widths=[320,375,390,430,768,1024,1440,1920];
const D = path.resolve(process.argv[2]), smoke = process.argv.includes('--smoke');
const languageStateOnly = process.argv.includes('--language-state-only');
fs.mkdirSync(D, {recursive:true});
const fixtures = require('./fixtures/facets.json'), langs = ['de','en','fr','it','es'];
const php = path.resolve('.cache/php-runtime/php-8.4.23/php.exe');
const autoload = path.resolve('.cache/contact-widget/autoload3.php');
const crypto = require('node:crypto');
const hashes = () => Object.fromEntries(['resources/js/facets.min.js','resources/css/main.min.css','resources/views/Category/Item/Partials/FacetFilter2.twig','src/Extensions/Base_Extension.php'].map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
const startHashes = hashes();
const records = [], requests = [], errors = [], consoleErrors = [], responses = [];
let origin, responseMode = 'normal', responseSerial = 0;
const file = name => fs.readFileSync(name);
const reference = fs.readFileSync('.cache/native-acceptance-543ee87-20261112/facet-all-1440.html','utf8');
const criticalStyles = (reference.match(/<style[^>]*>[\s\S]*?<\/style>/g)||[]).join('');
function render(options) {
    return JSON.parse(execFileSync(php, ['tests/facets.php',autoload,'--render'], {input:JSON.stringify(options),maxBuffer:10*1024*1024,windowsHide:true}).toString());
}
function route(kind, lang, params={}) {
    const url = new URL(fixtures[kind].languages[lang]);
    url.host = new URL(origin).host; url.protocol = 'http:';
    for (const [key,value] of Object.entries(params)) url.searchParams.set(key,value);
    return url.href;
}
function send(res, body, type='text/html', status=200) {
    const raw = Buffer.from(body), encoded = zlib.brotliCompressSync(raw, {params:{[zlib.constants.BROTLI_PARAM_QUALITY]:1}});
    res.writeHead(status, {'Content-Type':type+'; charset=utf-8','Content-Encoding':'br','Content-Length':encoded.length,'Cache-Control':'no-store'});
    res.end(encoded); return {raw:raw.length,compressed:encoded.length};
}
const server = http.createServer((req,res) => {
    const url = new URL(req.url,origin || 'http://localhost');
    try {
        if (url.pathname === '/language-module.js') return send(res,moduleCode('resources/js/cat.min.js'),'text/javascript');
        if (url.pathname === '/facets.js') return send(res,file('resources/js/facets.min.js'),'text/javascript');
        if (url.pathname === '/main.css') return send(res,file('resources/css/main.min.css'),'text/css');
        if (url.pathname === '/jquery.js') return send(res,file('resources/js/jquery-3.7.1.min.js'),'text/javascript');
        if (url.pathname === '/favicon.ico') {res.writeHead(204);return res.end();}
        if (url.pathname.startsWith('/rest/io/facet/')) {
            const params=Object.fromEntries(url.searchParams), serial=++responseSerial;
            requests.push({serial,params});
            assert.equal(params.countsOnly, '1', 'Facet refresh must opt into totals without unused product documents');
            if(responseMode==='error') return send(res,JSON.stringify({error:'controlled IO failure'}),'application/json',503);
            const kind=Object.keys(fixtures).find(k=>String(fixtures[k].categoryId)===params.categoryId)||'search';
            const groups=structuredClone(fixtures[kind].groups);
            let total=42;
            if(responseMode==='zero') {groups.length=0;total=0;}
            if(responseMode==='new-value') groups[0].values.push({id:987654,name:'New <value> & "safe"',count:7});
            const body=JSON.stringify({data:{facets:groups,itemList:{total}}});
            const delay=responseMode==='race' && serial%2 ? 650 : 15;
            return setTimeout(()=>{if(!res.destroyed)send(res,body,'application/json');},delay);
        }
        let lang='de',kind=null;
        for(const [k,fixture] of Object.entries(fixtures)) for(const [l,target] of Object.entries(fixture.languages)) {
            if(new URL(target).pathname===url.pathname && k!=='filtered') {kind=k;lang=l;}
        }
        if (kind === null) return send(res,'Unknown localized route','text/plain',404);
        assert.equal(url.searchParams.has('countsOnly'), false, 'API projection must not leak into storefront or language URLs');
        const params=Object.fromEntries(url.searchParams), languages=Object.fromEntries(langs.map(l=>[l,route(kind,l)]));
        if(params.__missingLanguage) delete languages[params.__missingLanguage];
        const zero=params.__zero==='1'||String(params.query||'').startsWith('no-match-')||Number(params.priceMin)>=999999;
        const r=render({kind,lang,path:url.pathname,params,languages,...(zero?{groups:[]}:{})});
        const html=`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${r.robots}"><link rel="canonical" href="${route(kind,lang)}">${Object.entries(languages).map(([l,u])=>`<link rel="alternate" hreflang="${l}" href="${u}">`).join('')}${criticalStyles}<link rel="stylesheet" href="/main.css"><style>body{font-family:Arial} .audit-header{padding:12px} .dynamicModal{display:none;background:white;padding:20px;position:fixed;inset:50px;z-index:9999}</style><script src="/jquery.js" defer></script><script src="/language-module.js" defer></script><script src="/facets.js" defer></script></head><body class="hold-transition"><header class="audit-header"><button data-eg-language-switch data-eg-language-unavailable="Language unavailable" data-eg-handler="modalContent">Language</button><button id="mobile-filter">Filter</button></header><div class="main"><main class="categoriegrid page-content container"><h1>${kind} (${zero?0:42})</h1><div class="row"><div class="col-12"><div class="leftsidecat">${r.html}</div></div></div><div class="category-product-list">Local result fixture</div></main></div><div class="dynamicModal"><div class="modal-body"></div></div><script>
        document.querySelector('[data-eg-language-switch]').onclick=function(){eGuardians.events.modalContent(this)};
        document.querySelector('#mobile-filter').onclick=()=>document.documentElement.classList.toggle('filter-open');
        document.addEventListener('click',e=>{if(e.target.closest('.basket-prev-close'))document.documentElement.classList.remove('filter-open')});
        document.addEventListener('DOMContentLoaded',()=>{ // Existing legacy bindings deliberately coexist to detect double toggles.
        $('.eg-dropdown-value').click(function(){$(this).parents('.eg-dropdown').toggleClass('isOpen')});
        $(document).on('click','[data-eg-btnfilter]',function(){if($(this).data('eg-targeturl'))location.href=$(this).data('eg-targeturl')});
        });</script></body></html>`;
        const sizes=send(res,html);responses.push({path:url.pathname,params,kind,lang,zero,...sizes});
    }catch(e){console.error(e.stack);send(res,String(e),'text/plain',500);}
});
const save=()=>fs.writeFileSync(path.join(D,'browser.json'),JSON.stringify({mode:'LOCAL_IO_FIXTURES',startHashes,endHashes:hashes(),records,requests,errors,consoleErrors,responses},null,2));
async function test(name, run) {if(languageStateOnly&&!name.startsWith('language-dirty/'))return;try{const evidence=await run();records.push({name,status:'PASS',...evidence});}catch(e){records.push({name,status:'FAIL',error:e.stack});save();throw e;}save();}
async function ready(p,url) {await p.goto(url);await p.waitForFunction(()=>window.egFacets);}
async function open(p,id) {
    if(await p.evaluate(()=>innerWidth<992&&!document.documentElement.classList.contains('filter-open'))) await p.locator('#mobile-filter').click();
    const h=p.locator(`[data-eg-facet-group="${id}"] [data-eg-facet-toggle]`);
    if(await h.getAttribute('aria-expanded')!=='true') await h.click();
}
async function waitResult(p) {await p.waitForFunction(()=>document.querySelector('[data-eg-btnfilter][data-eg-targeturl]:not([disabled])'));}
async function selected(p){return p.locator('[data-eg-remove-facet]').evaluateAll(es=>es.map(e=>e.dataset.egRemoveFacet));}
(async()=>{
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
    const browser=await chromium.launch({headless:true,executablePath:process.env.O46_BROWSER_EXECUTABLE});
    const context=await browser.newContext({viewport:{width:1440,height:900}}),p=await context.newPage();
    p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
    try {
        if(process.argv.includes('--history-only')) {
            await test('history/infinite-scroll-page-state-and-filter-popstate',async()=>{
                await ready(p,route('all','de',{facets:'3118'}));const before=responses.length;
                await p.evaluate(()=>{const u=new URL(location.href);u.searchParams.set('page','2');history.pushState({},'',u);u.searchParams.set('page','3');history.pushState({},'',u)});
                await p.goBack();await p.waitForURL(u=>u.searchParams.get('page')==='2');assert.equal(responses.length,before);
                await p.goForward();await p.waitForURL(u=>u.searchParams.get('page')==='3');assert.equal(responses.length,before);
                await p.evaluate(()=>{const u=new URL(location.href);u.searchParams.set('facets','659');history.pushState({},'',u)});
                await p.goBack();assert.deepEqual(await selected(p),['3118']);
                await p.goForward();await p.waitForFunction(()=>document.querySelector('[data-eg-remove-facet="659"]'));
                assert.deepEqual(await selected(p),['659']);assert.ok(responses.length>before);
                await p.reload();assert.deepEqual(await selected(p),['659']);
                return {pageOnlyDoesNotReload:true,filterPopstateReloads:true,selectionRestored:true};
            });
            assert.deepEqual(errors,[]);assert.deepEqual(hashes(),startHashes);save();console.log('History integration PASS');return;
        }
        for(const lang of langs) for(const width of smoke?[390,1440]:[320,375,390,430,768,1024,1440,1920]) for(const kind of smoke?['all']:['all','women','children','few','search','empty-search','zero']) {
            await test(`layout/${lang}/${width}/${kind}`,async()=>{
                await p.setViewportSize({width,height:900});
                const realKind=['empty-search','zero'].includes(kind)?'search':kind;
                await ready(p,route(realKind,lang,{...(kind==='zero'?{facets:'2247,3118',__zero:'1'}:{}),...(kind==='empty-search'?{query:'no-match-empty'}:{})}));
                assert.equal(await p.locator('input[type=checkbox]').count(),0);
                const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);if(overflow) { console.log(await p.evaluate(()=>[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})).filter(e=>e.right>innerWidth+1).slice(0,12))); await p.screenshot({path:path.join(D,'failure.png')}); } assert.equal(overflow,false);
                if(kind==='zero') assert.deepEqual(await selected(p),['2247','3118']);
                else if(kind!=='empty-search') {
                    const n=requests.length;await open(p,'1');
                    assert.ok(await p.locator('[data-eg-facet-group="1"] input').count());
                    assert.equal(requests.length,n);assert.equal(await p.locator('[data-eg-facet-group="1"] [aria-expanded=true]').count(),1);
                }
                if(lang==='de'&&['all','zero'].includes(kind)&&[390,1440].includes(width))await p.screenshot({path:path.join(D,`after-${kind}-${width}.png`),fullPage:false});
                return {lang,width,kind,requestsOnOpen:0};
            });
        }
        await p.setViewportSize({width:1440,height:900});
        await test('open-close/100-and-keyboard',async()=>{
            await ready(p,route('all','de'));const n=requests.length;await open(p,'1');
            await p.locator('#facet-item-3118').evaluate(e=>e.dataset.identity='retained');
            const h=p.locator('[data-eg-facet-group="1"] [data-eg-facet-toggle]');
            for(let i=0;i<100;i++){await h.click();assert.equal(await h.getAttribute('aria-expanded'),'false');await h.click();assert.equal(await h.getAttribute('aria-expanded'),'true');}
            assert.equal(await p.locator('#facet-item-3118').getAttribute('data-identity'),'retained');
            await h.focus();await p.keyboard.press('Space');assert.equal(await h.getAttribute('aria-expanded'),'false');await p.keyboard.press('Enter');
            await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.type),'checkbox');await p.keyboard.press('Escape');
            assert.equal(await h.getAttribute('aria-expanded'),'false');assert.equal(requests.length,n);
            await p.evaluate(()=>{egFacets.init();egFacets.init()});await h.click();assert.equal(await h.getAttribute('aria-expanded'),'true');
            return {cycles:100,requests:0,domReused:true,keyboard:true,idempotent:true};
        });
        const sizeIds=fixtures.all.groups.find(g=>g.id===1).values.map(v=>String(v.id));
        const brand=fixtures.all.groups.find(g=>g.id!==1&&g.id!==2&&g.id!==8&&g.values.length>100);
        for(let i=0;i<(smoke?3:100);i++) await test(`combination/${i}`,async()=>{
            await p.setViewportSize({width:widths[i%8],height:900});
            const ids=[sizeIds[i%sizeIds.length],String(brand.values[i%brand.values.length].id)],extra=sizeIds[(i+1)%sizeIds.length];
            await ready(p,route('all',langs[i%5],{facets:ids.join(','),sorting:'texts.name1_asc',page:'2'}));
            await open(p,'1');assert.equal(await p.locator(`#facet-item-${ids[0]}`).isChecked(),true);
            await p.locator(`label[for="facet-item-${extra}"]`).click();await waitResult(p);
            const request=requests.at(-1);assert.deepEqual(new Set(request.params.facets.split(',')),new Set([...ids,extra]));
            const target=new URL(await p.locator('.btnfilter-desktop').getAttribute('data-eg-targeturl'),origin);
            assert.equal(target.searchParams.get('sorting'),'texts.name1_asc');assert.equal(target.searchParams.has('page'),false);
            await open(p,brand.id);assert.equal(await p.locator(`#facet-item-${ids[1]}`).isChecked(),true);
            return {ids,extra,lang:langs[i%5],width:widths[i%8],request:request.serial};
        });
        for(const source of langs)for(const kind of ['women','search'])await test(`language-dirty/${source}/${kind}`,async()=>{
            await p.setViewportSize({width:1440,height:900});
            await ready(p,route(kind,source,{facets:'3118',query:'Nike & + Größe',page:'3',sorting:'texts.name1_asc'}));
            const brand=fixtures[kind].groups.find(g=>g.id===3),brandId=String(brand.values[0].id);await open(p,brand.id);
            await Promise.all([p.waitForResponse(r=>r.url().includes('/rest/io/facet/')),p.locator(`label[for="facet-item-${brandId}"]`).click()]);
            await open(p,'8');
            await p.locator('.facet-input-price-min').fill('2');await p.locator('.facet-input-price-max').fill('10');
            await p.evaluate(()=>{const q=document.createElement('div');q.className='modal';q.innerHTML='<article class="single" data-item data-mainitemid="999" data-eg-active-variation="9999"></article>';document.body.append(q)});
            const n=requests.length,target=langs[(langs.indexOf(source)+1)%5];await p.locator('[data-eg-language-switch]').click();const a=p.locator(`[data-eg-facet-language="${target}"]`);await a.waitFor();
            const u=new URL(await a.getAttribute('href')),expected=['3118',brandId].sort();assert.deepEqual((u.searchParams.get('facets')||'').split(',').sort(),expected);assert.equal(u.searchParams.get('query'),'Nike & + Größe');assert.equal(u.searchParams.get('priceMin'),'2');assert.equal(u.searchParams.get('priceMax'),'10');assert.equal(u.searchParams.has('page'),false);assert.equal(u.searchParams.get('sorting'),'texts.name1_asc');assert.equal(requests.length,n);
            await Promise.all([p.waitForURL(u=>u.pathname===new URL(route(kind,target)).pathname),a.click()]);assert.deepEqual((await selected(p)).sort(),expected);return{source,target,kind,brandId,dirtyFilters:true,quickviewIgnored:true,extraFacetRequests:0};
        });
        for(let i=0;i<(smoke?2:50);i++) await test(`language/${i}`,async()=>{
            await p.setViewportSize({width:widths[i%8],height:900});
            const source=langs[i%5],target=langs[(i%5+1+Math.floor(i/5)%4)%5],kind=i%2?'search':'women';
            const params={facets:'3118,659',priceMin:'2',priceMax:'10',sorting:'texts.name1_asc',query:'Nike & + Größe',currency:'EUR',ShipToCountry:'1'};
            await ready(p,route(kind,source,params));await p.locator('[data-eg-language-switch]').click();
            const link=p.locator(`[data-eg-facet-language="${target}"]`);await link.waitFor();
            await Promise.all([p.waitForURL(u=>u.pathname===new URL(route(kind,target)).pathname),link.click()]);
            for(const [k,v] of Object.entries(params)) assert.equal(new URL(p.url()).searchParams.get(k),v);
            assert.equal(await p.locator('html').getAttribute('lang'),target);assert.deepEqual(await selected(p),['3118','659']);
            if(i<10){await p.goBack();assert.equal(await p.locator('html').getAttribute('lang'),source);await p.goForward();assert.deepEqual(await selected(p),['3118','659']);await p.reload();assert.deepEqual(await selected(p),['3118','659']);}
            return {source,target,kind,params,width:widths[i%8],historyReload:i<10};
        });
        for(let i=0;i<(smoke?2:50);i++) await test(`zero/${i}`,async()=>{
            const params={__zero:'1',facets:i%2?'2247,3118':String(999000+i),...(i%3?{priceMin:'999999'}:{}),...(i%4?{query:'no-match-'+i}:{})};
            await ready(p,route(i%2?'search':'women',langs[i%5],params));
            const ids=params.facets.split(',');assert.deepEqual(await selected(p),ids);assert.match(await p.locator('h1').textContent(),/\(0\)/);
            const first=p.locator('[data-eg-remove-facet]').first();await Promise.all([p.waitForURL(u=>u.searchParams.get('facets')!==params.facets),first.click()]);
            assert.deepEqual(await selected(p),ids.slice(1));
            if(await p.locator('.facet-remove-all').count()){await p.locator('.facet-remove-all').click();await p.waitForLoadState();for(const key of ['facets','priceMin','priceMax'])assert.equal(new URL(p.url()).searchParams.has(key),false);}
            if(i%10===0){await p.reload();assert.equal(await p.locator('input[type=checkbox]').count(),0);}
            return {lang:langs[i%5],params,activeBefore:ids,removal:true,reset:true};
        });
        for(let i=0;i<(smoke?2:50);i++) await test(`price/${i}`,async()=>{
            await p.setViewportSize({width:widths[i%8],height:900});
            const kind=i%2?'search':'women',lang=langs[i%5],params=i%2?{query:'Nike',facets:'3118,659'}:{};
            await ready(p,route(kind,lang,params));await open(p,'8');
            const min=String(2+Math.floor(i/15)),max=String(10+Math.floor(i/15));
            const price=i%3===0?{priceMin:min}:i%3===1?{priceMax:max}:{priceMin:min,priceMax:max};
            const beforeInput=requests.length;
            if(price.priceMin)await p.locator('.facet-input-price-min').fill(price.priceMin);
            if(price.priceMax)await p.locator('.facet-input-price-max').fill(price.priceMax);
            await p.waitForTimeout(450);assert.equal(requests.length,beforeInput,'Typing a price must not issue extra IO searches');
            await Promise.all([p.waitForURL(u=>Object.entries(price).every(([k,v])=>u.searchParams.get(k)===v)),p.locator('.pricefilter').click()]);
            assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'NOINDEX,FOLLOW');
            assert.equal(await p.locator('.facet-remove-price').count(),1);
            assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),route(kind,lang));
            return {lang,kind,price,params,width:widths[i%8]};
        });
        await test('responses/zero-new-values-error-race',async()=>{
            await ready(p,route('all','de',{facets:'3118'}));await open(p,'1');responseMode='zero';
            await p.locator('label[for="facet-item-659"]').click();await waitResult(p);
            assert.match(await p.locator('.btnfilter-desktop').textContent(),/^0 /);
            assert.equal(await p.locator('#facet-item-3118').isChecked(),true);assert.equal(await p.locator('label[for="facet-item-3118"]').isVisible(),true);
            responseMode='new-value';await p.locator('label[for="facet-item-659"]').click();await waitResult(p);
            assert.equal(await p.locator('label[for="facet-item-987654"]').textContent().then(s=>s.includes('New <value> & "safe"')),true);
            responseMode='error';await p.locator('label[for="facet-item-659"]').click();await p.waitForFunction(()=>document.querySelector('.facet-status').textContent.length>0);
            assert.equal(await p.locator('.btnfilter-desktop').isDisabled(),true);
            responseMode='race';await p.locator('label[for="facet-item-659"]').click();await p.waitForTimeout(330);await p.locator('label[for="facet-item-631"]').click();await waitResult(p);await p.waitForTimeout(700);
            const target=new URL(await p.locator('.btnfilter-desktop').getAttribute('data-eg-targeturl'),origin);assert.equal(target.searchParams.get('facets'),'3118,631');
            responseMode='normal';return {zeroCount:true,retained:true,newValues:true,errorNotZero:true,staleResponseIgnored:true};
        });
        await test('facet-types/all-and-missing-language',async()=>{
            await ready(p,route('all','de'));
            const ids=[];
            for(const group of fixtures.all.groups.filter(g=>g.values.length)) {
                if(group.id===23) { assert.equal(await p.locator('[data-eg-facet-group="23"] [data-eg-facet-toggle]').isVisible(),false,'Existing hidden action facet changed'); continue; }
                await open(p,group.id);const id=String(group.values[0].id);ids.push(id);
                await p.locator(`label[for="facet-item-${id}"]`).click();await waitResult(p);
                assert.deepEqual(new Set(requests.at(-1).params.facets.split(',')),new Set(ids));
            }
            await ready(p,route('women','de',{facets:'3118,659',__missingLanguage:'en'}));
            await p.locator('[data-eg-language-switch]').click();
            const link=p.locator('[data-eg-facet-language="en"]');await link.waitFor();
            assert.equal(await link.getAttribute('aria-disabled'),'true');const before=p.url();await link.click({force:true});assert.equal(p.url(),before);
            assert.ok(await p.locator('.facet-language-status').textContent());
            return {groups:ids.length,ids,hiddenByExistingCss:[23],missingLanguageRetainsPage:true};
        });
        await test('context-isolation/tabs-category-query-language',async()=>{
            const other=await context.newPage();other.on('pageerror',e=>errors.push(e.message));
            await ready(p,route('women','de',{facets:'3118'}));await open(p,'1');
            await ready(other,route('all','fr',{facets:'659',query:'other query'}));await open(other,'1');
            assert.equal(await p.locator('#facet-item-3118').isChecked(),true);assert.equal(await p.locator('#facet-item-659').isChecked(),false);
            assert.equal(await other.locator('#facet-item-3118').isChecked(),false);assert.equal(await other.locator('#facet-item-659').isChecked(),true);
            await other.reload();assert.deepEqual(await selected(other),['659']);await other.close();
            return {isolated:true,nativeCustomerCache:'NOT_TESTED'};
        });
        assert.deepEqual(hashes(),startHashes,'Product files changed during test run');
        assert.deepEqual(errors,[]);save();console.log(JSON.stringify({pass:records.filter(r=>r.status==='PASS').length,fail:0,exceptions:errors.length,requests:requests.length}));
    } finally {save();await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
