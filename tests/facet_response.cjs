// Exercise the shipped compact filter without contacting IO or navigating a shop.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

async function main() {
    const browser = await chromium.launch({executablePath: process.env.O46_BROWSER_EXECUTABLE});
    try {
        for (const file of ['facets.js', 'facets.min.js']) {
            const page = await browser.newPage();
            await page.route('**/*', route => route.fulfill({contentType:'text/html', body:
                '<section data-eg-compact-facets data-eg-catid="12"><script type="application/json" data-eg-facet-data>{"selected":[],"values":{},"texts":{"error":"Fehler","loading":"Laden","result":"Treffer {count}"}}</script><input type="checkbox" class="facet-item-value-chk" data-eg-facetvalueid="1"><button data-eg-btnfilter></button><button data-eg-facet-retry hidden>Wiederholen</button><p class="facet-status"></p></section>'}));
            await page.goto('https://filter.test/');
            await page.evaluate(() => {
                window.requests = [];
                const timer = window.setTimeout.bind(window);
                window.setTimeout = (callback, delay, ...args) => timer(callback, delay === 15000 ? 600 : delay, ...args);
                window.fetch = (url, options) => new Promise((resolve,reject) => {
                    requests.push({url, options, resolve, reject});
                    if (!window.ignoreAbort) options.signal.addEventListener('abort', () => reject(new DOMException('Abgebrochen','AbortError')));
                });
            });
            await page.addScriptTag({content:fs.readFileSync('resources/js/'+file,'utf8')});
            const button = page.locator('[data-eg-btnfilter]'), retry = page.locator('[data-eg-facet-retry]');
            async function start(action) {
                const n = await page.evaluate(() => requests.length);
                await action();
                await page.waitForFunction(n => requests.length === n+1,n);
                return n;
            }
            async function finish(i, result, ok=true) {
                await page.evaluate(({i,result,ok}) => requests[i].resolve({ok, status:ok?200:503, json:async()=>({data:result})}),{i,result,ok});
            }
            const toggle = () => page.locator('input').click();
            for (const total of [0,12,'12',null,'',false,-2,2.5,{},'NaN',undefined]) {
                const i=await start(toggle);
                await finish(i,{facets:[],itemList:{total}});
                await page.waitForFunction(()=>document.querySelector('section').getAttribute('aria-busy')==='false');
                const valid=[0,12,'12'].includes(total);
                assert.equal(await button.isEnabled(),valid);
                assert.equal(await button.innerText(), valid?'Treffer '+total:'Treffer –');
                assert.equal(await retry.isVisible(),!valid);
            }
            for (const [result,ok] of [[{},true],[{itemList:{total:2}},true],[{facets:[{id:1,name:'Farbe',values:[{id:1,name:'Rot',count:-1}]}],itemList:{total:2}},true],[{facets:[{name:'Farbe',values:[]}],itemList:{total:2}},true],[{facets:[{id:1,name:'Farbe',values:[{count:0}]}],itemList:{total:2}},true],[null,false]]) {
                const i=await start(()=>retry.click());
                await finish(i,result,ok);
                await retry.waitFor();assert.equal(await button.isDisabled(),true);
            }
            await start(()=>retry.click());
            await retry.waitFor();assert.equal(await button.isDisabled(),true); // Aborted at the request deadline.
            await page.evaluate(()=>{window.ignoreAbort=true;});
            const old=await start(()=>retry.click()), newer=await start(toggle);
            await finish(newer,{facets:[],itemList:{total:9}});
            await finish(old,{facets:[],itemList:{total:1}});
            assert.equal(await button.innerText(),'Treffer 9');
            assert.equal(await retry.isHidden(),true);
            await page.close();
        }
        console.log('PASS: source and built filter, counts, malformed/partial data, timeout, retry and stale completion');
    } finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
