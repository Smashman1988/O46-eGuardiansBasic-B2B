// node tests/product_card_layout.cjs <card-artifacts-directory> <report.json>
// Actual CSS/fonts and rendered Twig fixtures; fully offline, not a native CWV test.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),dir=path.resolve(process.argv[2]),rows=[],errors=[];
const read=file=>fs.readFileSync(file,'utf8');
const css={before:read(path.join(dir,'before/main.css')),after:read(path.join(root,'resources/css/main.css'))};
const head=read(path.join(dir,'before/Head.twig'));
const fonts=[...head.replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/plugins/theme').matchAll(/@font-face\{[^}]+\}/g)].slice(0,3).map(m=>m[0]).join('');
const fontFiles=new Map(fs.readdirSync(path.join(root,'resources/documents/fonts')).map(name=>[name,path.join(root,'resources/documents/fonts',name)]));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
 try {
  for(const lang of ['de','en','fr','it','es'])for(const width of [390,1440]){
   const values=[];
   for(const version of ['before','after']){
    const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',async route=>{
     const req=route.request(),name=path.basename(new URL(req.url()).pathname);
     if(fontFiles.has(name))return route.fulfill({path:fontFiles.get(name),headers:{'access-control-allow-origin':'*'}});
     if(req.resourceType()==='image'){
      const logo=/brand|logo/.test(name),w=logo?50:225,h=logo?50:300;
      return route.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#ddd"/></svg>`});
     }
     await route.abort();
    });
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"><base href="https://cards.test/"><style>'+fonts+css[version]+'</style></head><body class="hold-transition"><main id="page-body" class="container">'+read(path.join(dir,`cards-${lang}-${version}.html`))+'</main></body></html>');
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.evaluate(()=>document.fonts.check('15px "Open Sans"')&&document.fonts.check('12px icomoon')),'Actual text and icon fonts must load');
    const result={};
    for(const state of ['initial','loaded']){
     if(state==='loaded'){
      await page.evaluate(()=>{for(const e of document.querySelectorAll('[data-srcset]'))e.srcset=e.dataset.srcset;for(const e of document.querySelectorAll('img[data-src]'))e.src=e.dataset.src;});
      await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
     }
     result[state]=await page.locator('.cat-item').evaluateAll(cards=>cards.map(card=>{
      const rect=e=>{const r=e.getBoundingClientRect();return ['x','y','width','height'].map(k=>Math.round(r[k]*1000)/1000);};
      return {id:card.dataset.egItem,card:rect(card),parts:[...card.querySelectorAll('.cat-article-header-info,.item-action:not(.invisible),.item-action2:not(.invisible),.cat-logo,.cat-item-image,.sizebox,.cat-attr-sizes,.availsize,.cat-item-name,.paddinlr,.linkabso')].map(e=>({class:e.className,text:e.textContent.replace(/\s+/g,' ').trim(),rect:rect(e)}))};
     }));
    }
    if(lang==='de')await page.screenshot({path:path.join(dir,`cards-${lang}-${width}-${version}.png`)});
    values.push(result);await page.close();
   }
   const differences=[];
   for(const state of ['initial','loaded'])for(let i=0;i<values[0][state].length;i++){
    const before=values[0][state][i],after=values[1][state][i];
    if(JSON.stringify(before)!==JSON.stringify(after))differences.push({state,id:before.id,before,after});
   }
   rows.push({lang,width,cards:values[1].loaded.length,status:differences.length?'FAIL':'PASS',differences});
  }
 }finally{await browser.close();}
 const report={status:rows.every(r=>r.status==='PASS')&&!errors.length?'PASS':'FAIL',rows,errors,mode:'OFFLINE_ACTUAL_CSS_FONT_AND_RENDERED_TWIG_GEOMETRY',limits:['Deterministic images; actual CDN image content and native server lifecycle are not measured.','Element bounds/text compared for all 60 cards before and after lazy image hydration at 390 and 1440px; no CWV attribution.']};
 fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2));
 console.log(JSON.stringify({status:report.status,cases:rows.length,failed:rows.filter(r=>r.status==='FAIL').map(r=>[r.lang,r.width,r.differences.length]),errors}));
 assert.equal(report.status,'PASS');
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
