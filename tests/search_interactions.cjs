// Local browser regression for the actual search handlers in all four page bundles.
// Same Chromium / Playwright environment variables as tests/quickview_dropdown.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const acorn = require('acorn');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const dir = path.resolve(__dirname, '../resources/js');
const jquery = fs.readFileSync(path.join(dir, 'jquery-3.7.1.min.js'), 'utf8');
const langs = ['de','en','fr','it','es'];
const origin = 'https://search-fixture.invalid';
const prefix = l => l === 'de' ? '' : '/' + l;
const term = '2351296', labels = ['Alpha & Beta + 50%', 'Caffè #2'], empty = 'zzqnohits426xyz';
const sku = '9885396';
const quotedLabel = '9885396 "><img src=x onerror="window.badLabel=1"> & Zubehör';
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const captured = process.env.O46_SEARCH_CAPTURE ? JSON.parse(fs.readFileSync(process.env.O46_SEARCH_CAPTURE)) : null;
const results = [];

function handlers(asset) {
    const source = fs.readFileSync(path.join(process.env.O46_SEARCH_ASSETS || dir, asset), 'utf8');
    const found = {};
    function walk(n) {
        if (!n?.type) return;
        if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression') {
            const key = n.left.property.name;
            // Keep the complete events constructor: facet tokens, debounce and error paths share its closure.
            if ((key === 'events' && n.right.type === 'NewExpression') || key === 'autoCompleteReg') {
                assert.ok(!found[key], 'ambiguous ' + key);
                found[key] = source.slice(n.right.start, n.right.end);
                if (key === 'events') found.owner = n.left.object.name;
            }
        }
        for (const child of Object.values(n)) {
            if (Array.isArray(child)) child.forEach(walk); else if (child?.type) walk(child);
        }
    }
    walk(acorn.parse(source, {ecmaVersion:'latest'}));
    assert.ok(found.events && found.autoCompleteReg && found.owner);
    return `window.eGuardians={helper:{autoCompleteReg:(${found.autoCompleteReg})},
        apiservice:{get:(url,params,cb)=>$.getJSON(url,params,cb)}};
        (function(${found.owner}){eGuardians.events=${found.events}})(eGuardians);
        eGuardians.events.bindEvents();`;
}

function shell(l, action, query, category) {
    const attr = query === null ? '' : ' data-eg-searchstring="'+escape(query)+'"';
    return `<!doctype html><html lang="${l}"><meta name="viewport" content="width=device-width,initial-scale=1">
        <meta charset="utf-8"><div data-eg-search><div class="search-wrap"><form method="get" action="${action}">
        <input name="query" data-eg-livesearch data-eg-event="load" data-eg-handler="initLiveSearch">
        <button class="btn-set-search">Search</button></form></div></div>
        <section data-eg-facets data-eg-catid="${category}"${attr}>${['376','659'].map(id=>`<label><input type="checkbox" data-eg-event="change" data-eg-handler="facetFilter" data-eg-facetvalueid="${id}">${id}</label>`).join('')}
        <button class="btnfilter-desktop" data-eg-btnfilter disabled>Apply</button></section>
        <select class="eg-dropdown-sort" data-eg-activesorting="price" data-eg-defaultsorting="new"></select>
        <input class="facet-input-price-min" value=""><input class="facet-input-price-max" value="">
        <script>window.messageServiceTranslations={searchexample:'Search'};window.lozad=()=>({observe(){}});window.activeLang=document.documentElement.lang;</script>
        <script src="/jquery.js"></script><script src="/handlers.js"></script></html>`;
}

async function scenario(browser, asset, code, l, width, full) {
    const mobile = width === 390;
    const context = await browser.newContext({viewport:{width,height:850},isMobile:mobile,hasTouch:mobile,locale:l});
    const page = await context.newPage(), errors=[], api=[], seen=[];
    page.setDefaultTimeout(5000);page.on('pageerror',e=>errors.push(e.message));
    const root=prefix(l), action=root+'/search/', start=root+'/fixture/', product=root+'/product/a-2351296/';
    let value=term,category='',fail=false;const counts={};
    let searchResponse;
    const recorded=q=>captured?.find(v=>v.l===l&&v.q===q);
    await context.route('**/*',async route=>{
        const u=new URL(route.request().url());
        assert.equal(u.origin,origin);
        if(u.pathname==='/jquery.js'||u.pathname==='/handlers.js')return route.fulfill({contentType:'text/javascript',body:u.pathname==='/jquery.js'?jquery:code});
        if(u.pathname==='/rest/io/item/search/autocomplete/') {
            const q=u.searchParams.get('query');api.push(['ac',q]);
            if(searchResponse) return route.fulfill({json:{data:searchResponse}});
            if(q===sku) {
                const suggestion=[9885396,null,undefined,'','009885396',quotedLabel,0,'Artikel 9885396','sechster Treffer'];
                return route.fulfill({json:{data:{
                    suggestion:suggestion.map(label=>({label})),
                    item:[null,'',undefined,9885396,quotedLabel].map(label=>({label,url:product+'?v=9',image:'/image.png'}))
                }}});
            }
            const no=q===empty;
            return route.fulfill({json:{data:{item:no?[]:labels.map((label,i)=>({label,url:product+'?v='+i})),suggestion:no?[]:[{label:labels[0]}]}}});
        }
        if(u.pathname==='/rest/io/facet/') {
            const pars=Object.fromEntries(u.searchParams),q=pars.query||'';
            api.push(['facet',pars]);
            if(fail||(!q.trim()&&!category))return route.fulfill({status:400,json:{data:null}});
            const saved=recorded(q);
            const count=saved?.facet && saved.facet.id===(pars.facets||'') ? saved.facet.total :
                (q===empty?0:1);
            counts[q]=count;
            return route.fulfill({json:{data:{facets:[{values:[{id:376,count}]}],itemList:{total:count}}}});
        }
        return route.fulfill({contentType:'text/html; charset=utf-8',body:shell(l,action,value,category)});
    });
    const input=page.locator('input[name=query]'),btn=page.locator('.btn-set-search');
    const begin=()=>page.goto(origin+start);
    async function nav(fn,pathname,params) {
        await Promise.all([page.waitForNavigation({waitUntil:'load'}),fn()]);
        const u=new URL(page.url());assert.equal(u.pathname,pathname);assert.deepEqual(Object.fromEntries(u.searchParams),params);
        assert.equal(await page.locator('html').getAttribute('lang'),l);
    }
    async function suggestions(q) {
        const n=api.length;await Promise.all([page.waitForResponse(r=>r.url().includes('/autocomplete/')),input.fill(q)]);
        await page.waitForFunction(()=>document.querySelector('.row-search-wrap')&&!document.querySelector('.search-loading'))
            .catch(error=>{assert.deepEqual(errors,[]);throw error;});
        assert.deepEqual(api.slice(n),[['ac',q]],'one autocomplete call');
    }
    try {
        await begin();
        await suggestions(sku);
        const textLinks = page.locator('.list-autocomplete-suggestion a');
        const productLinks = page.locator('.list-autocomplete a');
        assert.deepEqual(await textLinks.allTextContents(),[sku,'009885396',quotedLabel,'0','Artikel 9885396']);
        assert.deepEqual(await productLinks.allTextContents(),[sku,quotedLabel]);
        assert.deepEqual(await textLinks.locator('strong').allTextContents(),[sku,sku,sku,sku]);
        assert.deepEqual(await productLinks.locator('strong').allTextContents(),[sku,sku]);
        assert.equal(await textLinks.nth(2).getAttribute('title'),quotedLabel);
        assert.equal(await productLinks.nth(1).locator('img').getAttribute('alt'),quotedLabel);
        assert.equal(await page.locator('.row-search-wrap [onerror], .list-autocomplete-suggestion img').count(),0);
        const pick = link => mobile ? link.tap() : link.click();
        await nav(()=>pick(textLinks.nth(1)),action,{query:'009885396'});
        await begin();await suggestions(sku);
        await input.press('ArrowDown');
        assert.equal(await input.inputValue(),sku);
        await nav(()=>input.press('Enter'),action,{query:sku});
        await begin();await suggestions(sku);
        await nav(()=>pick(productLinks.nth(1)),product,{v:'9'});
        seen.push('numeric, empty and HTML labels');
        await begin();await suggestions(term);await input.press('ArrowDown');assert.equal(await input.inputValue(),labels[0]);
        await input.press('ArrowDown');assert.equal(await input.inputValue(),labels[1]);
        await input.press('ArrowUp');assert.equal(await input.inputValue(),labels[0]);
        await nav(()=>input.press('Enter'),action,{query:labels[0]});seen.push('keyboard');
        if(full) {
            await page.goBack();assert.equal(new URL(page.url()).pathname,start);
            await page.goForward();assert.equal(new URL(page.url()).pathname,action);assert.equal(new URL(page.url()).searchParams.get('query'),labels[0]);seen.push('history');
            for(const how of ['Enter','button','product','suggestion','no matches','short']){
                await begin();const q=how==='no matches'?empty:how==='short'?'ab':'nike';
                if(how==='short'){await input.fill(q);await input.press('Enter');assert.equal(new URL(page.url()).pathname,start);}
                else{
                    await suggestions(q);
                    const click=el=>mobile?el.tap():el.click();
                    if(how==='product')await nav(()=>click(page.locator('.list-autocomplete a').first()),product,{v:'0'});
                    else if(how==='suggestion')await nav(()=>click(page.locator('.list-autocomplete-suggestion a').first()),action,{query:labels[0]});
                    else if(how==='button')await nav(()=>click(btn),action,{query:q});
                    else {if(how==='no matches'){await input.press('ArrowDown');assert.equal(await input.inputValue(),q);}await nav(()=>input.press('Enter'),action,{query:q});}
                }
                seen.push(how);
            }
            // A second form (e.g. on a 404) can have a different configured action.
            // Only its own input may react; no /search/ or language prefix may be inferred.
            const secondRoute=root+'/configured-route/';
            async function setupSecond(){
                await begin();
                await page.evaluate(action=>{
                const el=document.createElement('div');el.className='searchbox-404';
                el.innerHTML='<form method="get"><input data-eg-livesearch name="query"><button>Search</button></form><div data-eg-search></div>';
                document.body.append(el);el.querySelector('form').action=action;
                eGuardians.events.initLiveSearch(el.querySelector('input'));
                },secondRoute);
                const before=api.length;
                await page.locator('.searchbox-404 input').fill('nike');
                await page.locator('.searchbox-404 [data-eg-search] .list-autocomplete a').first().waitFor();
                assert.deepEqual(api.slice(before),[['ac','nike']]);
            }
            await setupSecond();
            const second=page.locator('.searchbox-404 input');
            await second.press('ArrowDown');assert.equal(await page.locator('[data-eg-search] input').inputValue(),'');
            await nav(()=>second.press('Enter'),secondRoute,{query:labels[0]});
            await setupSecond();
            const secondLink=page.locator('.searchbox-404 .list-autocomplete-suggestion a').first();
            await nav(()=>mobile?secondLink.tap():secondLink.click(),secondRoute,{query:labels[0]});
            seen.push('separate form action');

            // Replay the available shop labels, including their original JSON types and product URLs.
            for (const query of [sku,term,'0002','adidas','nike','shoes','[a]+']) {
                const label = query === sku ? Number(query) : query;
                searchResponse = recorded(query)?.ac ?? {
                    item: [{label:'Produkt '+query.toUpperCase(),url:product}],
                    suggestion: [{label}]
                };
                await begin();
                await suggestions(query);
                for (const [selector,entries] of [
                    ['.list-autocomplete a',searchResponse.item],
                    ['.list-autocomplete-suggestion a',searchResponse.suggestion.slice(0,5)]
                ]) {
                    const links = page.locator(selector);
                    assert.deepEqual(await links.allTextContents(),entries.map(entry=>String(entry.label)));
                    for (const [index,entry] of entries.entries()) {
                        const name = String(entry.label);
                        const pos = name.toLowerCase().indexOf(query.toLowerCase());
                        assert.deepEqual(await links.nth(index).locator('strong').allTextContents(),
                            pos < 0 ? [] : [name.slice(pos,pos+query.length)]);
                        const url = new URL(await links.nth(index).getAttribute('href'),origin);
                        if (selector === '.list-autocomplete a') {
                            assert.equal(url.href,new URL(entry.url,origin).href);
                        } else {
                            assert.equal(url.pathname,action);
                            assert.equal(url.searchParams.get('query'),name);
                        }
                    }
                }
            }
            // Only rows with usable labels should open the suggestions box.
            searchResponse = {item:[],suggestion:[{label:'009885396'}]};
            await begin();await suggestions(sku);
            assert.equal(await page.locator('[data-eg-search].search-active-results').count(),1);
            searchResponse = {item:[{label:null,url:product}],suggestion:[{}, {label:''}]};
            await suggestions(term);
            assert.equal(await page.locator('.row-search-wrap li, [data-eg-search].search-active-results').count(),0);
            searchResponse = undefined;
            seen.push('search terms and literal highlighting');
        }
        if(asset.startsWith('cat')) {
            const cases=full?[2351296,9885396,'adidas','nike','shoes',empty,'0000123','0','  text  ','',null]:[2351296];
            for(const q of cases){
                value=q;category='';await begin();const n=api.length;
                const check=page.locator('input[type=checkbox]').first(),apply=page.locator('[data-eg-btnfilter]');
                await Promise.all([page.waitForResponse(r=>r.url().includes('/facet/')),check.check()]);
                await page.waitForFunction(()=>!document.querySelector('.btn-load'));
                assert.equal(api.length,n+1);const req=api.at(-1)[1];
                assert.equal(req.query,String(q??''));assert.equal(req.facets,'376');
                if(q===''||q===null){assert.equal(await apply.isDisabled(),true);assert.equal(await apply.evaluate(el=>jQuery(el).data('eg-targeturl')),null);}
                else {
                    assert.equal(await apply.isEnabled(),true);assert.ok((await apply.textContent()).includes(String(counts[String(q)])));
                    await nav(()=>apply.click(),start,{facets:'376',query:String(q).trim(),sorting:'price'});
                }
            }
            if(full) {
                value='adidas';category='';await begin();const checks=page.locator('input[type=checkbox]'),apply=page.locator('[data-eg-btnfilter]');
                async function step(fn){await Promise.all([page.waitForResponse(r=>r.url().includes('/facet/')),fn()]);await page.waitForFunction(()=>!document.querySelector('.btn-load'));}
                await step(()=>checks.nth(0).check());await step(()=>checks.nth(1).check());
                await nav(()=>apply.click(),start,{query:value,facets:'376,659',sorting:'price'});
                await begin();await step(()=>checks.first().check());await step(()=>checks.first().uncheck());
                await nav(()=>apply.click(),start,{query:value,sorting:'price'});
                value=null;category='60';await begin();await step(()=>checks.first().check());await step(()=>checks.first().uncheck());
                await nav(()=>apply.click(),start,{sorting:'price'});
                fail=true;value=term;category='';await begin();await step(()=>checks.first().check());assert.equal(await apply.isDisabled(),true);
            }
            seen.push('filters');
        }
        assert.deepEqual(errors,[]);results.push({asset,l,width,steps:seen,counts});
    } finally {await context.close();}
}
(async()=>{
    const browser=await chromium.launch({headless:true,executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try{
        const tasks=[];
        for(const n of ['cat','item','main','vue'])for(const end of ['.js','-020726.min.js']){
            const asset=n+end,code=handlers(asset);
            for(const l of langs)for(const w of [1440,390])tasks.push(()=>scenario(browser,asset,code,l,w,n==='cat'&&end!=='.js'));
        }
        // Group results in reproducible order; never contact the shop.
        for(let i=0;i<tasks.length;i+=4)await Promise.all(tasks.slice(i,i+4).map(fn=>fn()));
        console.log(results.length+' asset/language/viewport scenarios PASS');
        if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(results,null,2)+'\n');
    } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
