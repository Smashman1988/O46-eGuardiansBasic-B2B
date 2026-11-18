// Controlled response ordering across overlapping PDP / Quickview matrices.
// No shop is contacted. The real minified matrix runs against held API callbacks.
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
async function main() {
    const browser = await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    const log = [];
    try {
        const page = await browser.newPage();
        await page.route('**/*', route => route.abort());
        await page.setContent('<html lang="de"><body></body></html>');
        const dir = process.argv[3] || 'resources/js';
        for (const file of ['jquery-3.7.1.min.js', 'core.min.js','matrix.min.js']) {
            await page.addScriptTag({path:path.join(dir,file)});
        }
        await page.evaluate(()=>{
            window.requests = [];
            window.eGuardians = {apiservice:{get(url, args, reply) { requests.push({url,args,reply}); }}};
            O46Core.matrix();
            window.mount = (name, ids) => {
                const panel = document.createElement('section');
                panel.id=name; panel.dataset.itemVariation=''; panel.dataset.egVariations=JSON.stringify(ids.map(variationId=>({variationId})));
                panel.innerHTML='<div data-eg-size-matrix data-eg-mode="color"><div class="eg-size-matrix-table"><div class="eg-size-matrix-body"></div></div>'+
                    '<span data-eg-total-sum></span><button data-eg-matrix-add>Add</button><span data-eg-matrix-status data-partial="partial" data-unavailable="error"></span></div>';
                document.body.append(panel);
                egInitSizeMatrices(panel);
            };
            mount('pdp',[1,2,3,4,5]); mount('qv',[2,4,6]);
        });
        async function row(id, group='pdp') {
            return page.locator('#'+group+' [data-eg-variation-id="'+id+'"]').evaluate(el=>{
                const qty=el.querySelector('[data-eg-qty]');
                return [el.dataset.egVariationState, qty.disabled, Number(qty.max), qty.value];
            });
        }
        const batches=()=>page.evaluate(()=>requests.map(r=>r.args.ids || r.url));
        assert.deepEqual(await row(1),['loading',true,0,'0']);
        assert.deepEqual(await batches(),['1,2,3,4,5','6']);
        await page.evaluate(()=>{
            const host=document.querySelector('#pdp');
            for (const id of [1,5,1]) host.querySelector('[data-eg-variation-id="'+id+'"] [data-eg-color-preview]').click();
            host.querySelector('[data-eg-qty]').value='9';
            host.querySelector('[data-eg-matrix-add]').click();
        });
        assert.equal((await batches()).length,2,'Unresolved selection must not read or write basket or start single requests');
        log.push('pending input, attempted write, quick selection, overlapping requests');
        await page.evaluate(()=>{
            requests[1].reply({data:{items:{6:{stock:3,price:2}}}},200);
            requests[0].reply({data:{items:{1:{stock:10,price:0,orderMax:3},3:{stock:'0',price:3},5:{stock:null,price:4}},missing:[2]}},200);
        });
        assert.deepEqual(await row(1),['available',false,3,'0']);
        assert.deepEqual(await row(2),['missing',true,0,'0']);
        assert.deepEqual(await row(3),['unavailable',true,0,'0']);
        assert.deepEqual(await row(5),['available',false,200,'0']);
        assert.deepEqual(await row(2,'qv'),['missing',true,0,'0']);
        assert.deepEqual(await row(6,'qv'),['available',false,3,'0']);
        assert.deepEqual((await batches()).slice(2),['/rest/io/variations/4']);
        log.push('missing, zero stock, explicit zero price, unknown-stock fallback, order limit');
        await page.evaluate(()=>requests[2].reply({data:{documents:[]}},503));
        assert.deepEqual(await row(4),['error',true,0,'0']);
        assert.deepEqual(await row(4,'qv'),['error',true,0,'0']);
        await page.evaluate(()=>{egInitSizeMatrices(document.querySelector('#pdp'));egInitSizeMatrices(document.querySelector('#qv'));});
        assert.deepEqual(await row(4),['loading',true,0,'0']);
        assert.deepEqual((await batches()).slice(3),['4']);
        await page.evaluate(()=>{
            requests[3].reply({data:{items:{4:{price:0,stock:5}}}},200);
            requests[2].reply({data:{documents:[]}},200); // stale completion from the failed request
            requests[0].reply({data:{items:{2:{price:12,stock:100}},missing:[4]}},200);
        });
        assert.deepEqual(await row(4),['available',false,5,'0']);
        assert.deepEqual(await row(4,'qv'),['available',false,5,'0']);
        assert.deepEqual(await row(2),['missing',true,0,'0']);
        log.push('transient error, successful retry on both open matrices, stale single and batch ignored');
        await page.evaluate(()=>{
            const host=document.querySelector('#pdp');
            const input=host.querySelector('[data-eg-variation-id="1"] [data-eg-qty]');
            input.value='8'; input.dispatchEvent(new Event('input',{bubbles:true}));
            for(const id of [2,3]) {
                const blocked=host.querySelector('[data-eg-variation-id="'+id+'"] [data-eg-qty]');
                blocked.value='9';
            }
            host.querySelector('[data-eg-matrix-add]').click();
        });
        assert.equal((await batches()).at(-1),'/rest/io/basket/items/');
        // The existing basket write suite verifies the recorded payload and a successful normal write.
        // Here confirm that a free, resolved variation reaches the write path after stock clamping.
        const payload=await page.evaluate(async()=>{
            let sent;
            eGuardians.apiservice.post=(url,data,reply)=>{sent={url,data};reply({data:true},201);};
            requests.at(-1).reply({data:[]},200);
            await new Promise(resolve=>setTimeout(resolve,0));
            return sent;
        });
        assert.equal(payload.data.basketItems.length,1);
        assert.equal(payload.data.basketItems[0].variationId,1);
        assert.equal(payload.data.basketItems[0].quantity,3);
        log.push('valid zero-price row posted at capped quantity; missing and zero-stock siblings excluded');
        console.log(JSON.stringify({status:'PASS',log,simulatedPost:payload.data}));
        if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({log,payload},null,2));
    } finally {await browser.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
