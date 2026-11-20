// Local CSS regression for the exact configured ShopBuilder 50/50 grid.
const fs=require('node:fs'),assert=require('node:assert/strict'),postcss=require('postcss');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const head=fs.readFileSync('resources/views/PageDesign/Partials/Head.twig','utf8');
const candidate=head.match(/<style data-eg-builder-half-grid-critical>([\s\S]*?)<\/style>/)?.[1];
assert.ok(candidate,'Active shared critical block');postcss.parse(candidate);
const critical=[...head.matchAll(/<style>(@font-face[\s\S]*?)<\/style>/g)].at(2)[1].replace(/\{\{[\s\S]*?\}\}/g,'/local-theme');
const main=fs.readFileSync('resources/css/main.min.css','utf8');
const configs=['col-md-6 col-lg-6 col-xl-6','col-md-6 col-lg-12 col-xl-12','col-md-12 col-lg-6 col-xl-6','col-md-6 col-lg-6 col-xl-12'];
const rows=[];
async function verifyHomeCards(page) {
    const cells = '<div class="col-6 col-md-3 col-xl-2"><div class="cat-item has-variations"></div></div>'.repeat(12);
    const list = '<div class="row category-product-list">' + cells + '</div>';
    const category = '<section class="container categoriegrid"><div class="row"><div class="col-12">' + list + '</div></div></section>';
    const home = '<main class="isHome"><div class="container-max"><div class="row"><div class="col"><div class="widget-code"><div class="widget-inner">' + list + '</div></div></div></div></div></main>';
    await page.setContent('<!doctype html><style>' + critical + '</style>' + category + home);
    const bounds = selector => page.locator(selector + ' .cat-item').evaluateAll(cards => {
        const firstTop = cards[0].getBoundingClientRect().top;
        return cards.map(card => {
            const rect = card.getBoundingClientRect();
            return [rect.x, rect.width, rect.top === firstTop];
        });
    });
    const firstPaint = await bounds('.isHome');
    await page.addStyleTag({content: main});
    const reference = await bounds('.categoriegrid');
    assert.deepEqual(await bounds('.isHome'), reference, 'Home product grid matches category columns and gutters');
    assert.deepEqual(firstPaint, reference, 'Home product grid has final widths at first paint');
}
const snap=page=>page.evaluate(()=>[...document.querySelectorAll('[data-test-col]')].map(e=>({id:e.dataset.testCol,x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,flex:getComputedStyle(e).flex,maxWidth:getComputedStyle(e).maxWidth,matched:e.matches(':where(#page-body .widget-two-col)>.col-md-6:where(.col-lg-6.col-xl-6)')})));
(async()=>{
    const browser=await chromium.launch({headless:true,executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try{for(const width of [320,375,390,428,768,1024,1440,1920]){
        const page=await browser.newPage({viewport:{width,height:900}});
        try{
            await page.route('**/*',r=>r.abort());
            const fixture=configs.map((classes,i)=>`<div class="widget-two-col row"><div data-test-col="${i}" class="widget-inner col-12 col-sm-12 ${classes}">Test column</div></div>`).join('');
            await page.setContent(`<style>${critical}</style><style id="candidate">${candidate}</style><div id="page-body">${fixture}<div class="row"><div data-test-col="outside" class="col-12 col-md-6 col-lg-6 col-xl-6">Outside widget</div></div></div>`);
            const early=await snap(page);
            await page.addStyleTag({content:main});const final=await snap(page);
            await page.evaluate(()=>document.getElementById('candidate').sheet.disabled=true);const without=await snap(page);
            assert.equal(early[0].width,final[0].width,'Target width stable before full CSS at '+width);
            assert.deepEqual(final,without,'Final configured layout unchanged at '+width);
            assert.deepEqual(final.map(x=>x.matched),[true,false,false,false,false],'Other breakpoint combinations/outside grid excluded');
            rows.push({width,status:'PASS',early,final,without});
            await verifyHomeCards(page);
        }finally{await page.close();}
    }}finally{await browser.close();if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify({mode:'LOCAL_SOURCE_CSS_BROWSER_REGRESSION_NOT_NATIVE',rows,browserClosed:true},null,2)+'\n');}
    console.log(rows.length+' configured-grid responsive scenarios PASS');
})().catch(error=>{console.error(error);process.exitCode=1});
