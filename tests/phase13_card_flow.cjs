// Real Twig cards and complete shipped bundles; only local HTTP fixture data.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const D=path.resolve(process.argv[2]),root=path.resolve(__dirname,'..'),rows=[];
const read=p=>fs.readFileSync(p,'utf8');
const fonts=[...read(root+'/resources/views/PageDesign/Partials/Head.twig').replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/theme').matchAll(/@font-face\{[^}]+\}/g)].slice(0,3).map(x=>x[0]).join('');
let origin,requests=[];
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,origin);requests.push({path:u.pathname+u.search,method:req.method});
 if(u.pathname.startsWith('/visual/')){const file=D+u.pathname.replace(/\.avif$/,'');if(fs.existsSync(file))return res.end(fs.readFileSync(file));}
 if(u.pathname.startsWith('/assets/')){res.setHeader('Content-Type','application/javascript');return res.end(read(root+'/resources/js/'+path.basename(u.pathname)));}
 if(/\.woff2?$/.test(u.pathname))return res.end(fs.readFileSync(root+'/resources/documents/fonts/'+path.basename(u.pathname)));
 if(u.pathname==='/rest/io/session/'){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({data:{basket:{itemQuantity:0,itemSum:0,currency:'EUR',shippingCountryId:1,customerId:0,itemWishListIds:[]}}}));}
 res.setHeader('Content-Type','text/html');
 if(u.searchParams.get('quickViewItem')==='true')return res.end('<article class="single"><h2 data-local-quickview>Local quickview</h2></article>');
 const next=u.searchParams.get('page')==='2';
 const cards=read(D+'/cards-de-'+(next?'next':'after')+'.html').replaceAll('https://b2b.outlet46.de',origin);
 res.end(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Card flow fixture</title><style>${fonts+read(root+'/resources/css/main.min.css')}</style></head><body><main style="padding:12px">${cards}</main>${next?'':'<a class="pagination__next" href="'+u.pathname+'?page=2">Next</a>'}<button id="totop" hidden>Top</button><div class="modal fade modal-cross" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button class="close" data-dismiss="modal">Close</button></div><div class="modal-body"></div></div></div></div><script src="/assets/jquery-3.7.1.min.js"></script><script src="/assets/core.min.js" data-eg-magiczoom-src="/assets/magiczoom.min.js" data-eg-matrix-src="/assets/matrix.min.js" defer></script><script src="/assets/cat.min.js" defer></script><script>window.activeLang='de';window.messageServiceTranslations={searchexample:'Search'};addEventListener('load',()=>{eGuardians.initialize();window.fixtureReady=true})</script></body></html>`);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
 try{for(const route of ['/category/','/search/'])for(const width of [390,1774]){
   requests=[];const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
   await page.goto(origin+route);await page.waitForFunction(()=>window.fixtureReady);
   assert.equal(await page.locator('.cat-item').count(),12);
   const geometry=()=>page.locator('.cat-item').evaluateAll(es=>es.map(e=>[e.getBoundingClientRect().width,e.getBoundingClientRect().height,e.querySelector('.cat-item-image').getBoundingClientRect().height,e.querySelector('.linkabso').getBoundingClientRect().height]));
   const first=await geometry();
   await page.evaluate(()=>InfiniteScroll.data(document.querySelector('.category-product-list')).loadNextPage());
   await page.waitForFunction(()=>document.querySelectorAll('.cat-item').length===24);
   for(const n of [12,13,18,23]){const photo=page.locator('.cat-item picture img').nth(n);await photo.scrollIntoViewIfNeeded();await photo.evaluate(i=>new Promise((resolve,reject)=>{if(i.complete&&i.naturalWidth)return resolve();i.onload=resolve;i.onerror=()=>reject(Error('Appended image failed'));}));}
   const all=await geometry();assert.deepEqual(all.slice(12),first,'Appended lazy cards match initial card geometry');
   if(process.argv.includes('--bottom-align')){
     const cards=await page.locator('.cat-item').evaluateAll(es=>es.map(e=>({y:Math.round(e.getBoundingClientRect().y),bottoms:['.cat-item-name','.cat-card-price','.cat-card-price>.outlet-green','.linkabso','.cat-card-price>.font-12'].map(s=>e.querySelector(s)?.getBoundingClientRect().bottom??null)})));
     for(const y of new Set(cards.map(c=>c.y))){const line=cards.filter(c=>c.y===y);for(let part=0;part<5;part++){const bottoms=line.map(c=>c.bottoms[part]).filter(v=>v!==null);if(bottoms.length>1)assert.ok(Math.max(...bottoms)-Math.min(...bottoms)<2,'Initial and appended names, RRP, sale prices and buttons align');}}
     await page.evaluate(()=>scrollTo(0,0));
     const clip=await page.locator('.cat-item').nth(12).evaluate((e,width)=>{const r=e.getBoundingClientRect();return {x:0,y:r.y-12,width,height:r.height+24}},width);
     await page.screenshot({path:D+'/append-'+route.replaceAll('/','')+'-'+width+'.png',fullPage:true,clip});
   }
   assert.equal(requests.filter(r=>r.path===route+'?page=2').length,1,'One next-page request');
   const button=page.locator('.cat-item .linkabso').nth(12);await button.click();
   await page.waitForFunction(()=>!!document.querySelector('.modal-cross.show [data-local-quickview]'));
   assert.equal(requests.filter(r=>r.path.includes('quickViewItem=true')).length,1);
   assert.equal(requests.filter(r=>r.method!=='GET').length,0,'No basket writes');assert.deepEqual(errors,[]);
   rows.push({route,width,status:'PASS',initialCards:12,afterAppend:24,matchedCards:12,quickview:true,errors,requests});await page.close();
 }}finally{await browser.close();server.close();fs.writeFileSync(D+'/card-flow.json',JSON.stringify(rows,null,2));}
 console.log(JSON.stringify({status:'PASS',cases:rows.length,appendedCards:rows.length*12,quickviews:rows.length}));
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
