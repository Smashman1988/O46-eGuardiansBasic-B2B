// Local HTTP acceptance with real PHP/Twig/active JS and strict localized route fixtures.
// Never a native Plenty acceptance: product responses and routing services are explicit fixtures.
// node tests/facet_routes_browser.cjs <report-dir>
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),cp=require('node:child_process');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
if(process.argv.length!==3)throw new Error('Expected report directory only; product cases are in language_switch_browser.cjs');
const D=path.resolve(process.argv[2]),langs=['de','en','fr','it','es'];fs.mkdirSync(D,{recursive:true});
const {moduleCode}=require('./language_modal.cjs');
const fixtures=require('./fixtures/facets.json');
const php=path.resolve('.cache/php-runtime/php-8.4.23/php.exe'),autoload=path.resolve('.cache/contact-widget/autoload3.php');
const out={mode:'LOCAL_HTTP_TWIG_ROUTING_FIXTURES',checks:[],requests:[],responses:[],pageErrors:[],blockedExternal:[]};
const save=()=>fs.writeFileSync(D+'/browser.json',JSON.stringify(out,null,2));let origin;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const render=options=>JSON.parse(cp.execFileSync(php,['tests/facets.php',autoload,'--render'],{input:JSON.stringify(options),windowsHide:true,maxBuffer:10*1024*1024}));
const local=raw=>{const u=new URL(raw);return origin+u.pathname+u.search};
const routes=(fixture)=>Object.fromEntries(langs.map(l=>[l,local(fixture.languages[l])]));
const catalog=[{id:'1',size:'3118',brand:'155',color:'9',price:4.99},{id:'2',size:'659',brand:'155',color:'10',price:8.99},{id:'3',size:'2',brand:'2247',color:'9',price:14.99},{id:'4',size:'3118',brand:'2247',color:'10',price:30}];
function products(params){const ids=(params.facets||'').split(',').filter(Boolean);return catalog.filter(p=>{for(const k of ['size','brand','color']){const relevant=ids.filter(id=>catalog.some(x=>x[k]===id));if(relevant.length&&!relevant.includes(p[k]))return false}return (!params.priceMin||p.price>=+params.priceMin)&&(!params.priceMax||p.price<=+params.priceMax)}).map(p=>p.id)}
const server=http.createServer((req,res)=>{const u=new URL(req.url,origin);out.requests.push({path:u.pathname,query:u.search,method:req.method});const send=(body,type='text/html',status=200)=>{res.writeHead(status,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});res.end(body)};
try{
 if(u.pathname==='/jquery.js')return send(fs.readFileSync('resources/js/jquery-3.7.1.min.js'),'text/javascript');
 if(u.pathname==='/language-module.js')return send(moduleCode('resources/js/cat.min.js'),'text/javascript');
 if(u.pathname==='/facets.js')return send(fs.readFileSync('resources/js/facets.min.js'),'text/javascript');
 if(u.pathname==='/main.css')return send(fs.readFileSync('resources/css/main.min.css'),'text/css');
 if(u.pathname==='/favicon.ico'){res.writeHead(204);return res.end()}
 let kind=null,lang=null;for(const k of ['women','search','all'])for(const l of langs)if(new URL(fixtures[k].languages[l]).pathname===u.pathname){kind=k;lang=l}
 if(!kind){out.responses.push({url:u.href,status:404});return send('Unknown localized route','text/plain',404)}
 const params=Object.fromEntries(u.searchParams),languageRoutes=routes(fixtures[kind]);if(params.__missing)delete languageRoutes[params.__missing];
 const ids=products(params),r=render({kind,lang,path:u.pathname,params,languages:languageRoutes,...(ids.length===0?{groups:[]}:{})});
 out.responses.push({url:u.href,status:200,kind,lang,ids});
 send(`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="${r.robots||'INDEX,FOLLOW'}"><link rel="canonical" href="${esc(local(fixtures[kind].languages[lang]))}">${Object.entries(languageRoutes).map(([l,u])=>`<link rel="alternate" hreflang="${l}" href="${esc(u)}">`).join('')}<link rel="stylesheet" href="/main.css"><style>body{font-family:Arial}.dynamicModal{display:none;position:fixed;inset:20px;background:white;z-index:99999;padding:20px}.test-header{padding:10px}</style><script src="/jquery.js" defer></script><script src="/language-module.js" defer></script><script src="/facets.js" defer></script></head><body><header class="test-header"><button data-eg-language-switch data-eg-language-unavailable="Language unavailable" data-eg-handler="modalContent">Language</button><button id="filter-open">Filter</button><button data-eg-handler="modalContent" id="other-modal">Other modal</button></header><main class="categoriegrid container"><h1>${kind} (${ids.length})</h1><output id="query">${esc(params.query||'')}</output>${r.html}<div class="category-product-list">${ids.map(id=>`<article data-result-id="${id}">Product ${id}</article>`).join('')}</div></main><div class="dynamicModal"><div class="modal-body"></div></div><script>document.querySelector('[data-eg-language-switch]').onclick=function(){eGuardians.events.modalContent(this)};document.querySelector('#filter-open').onclick=()=>document.documentElement.classList.add('filter-open');document.querySelector('#other-modal').onclick=()=>{document.querySelector('.modal-body').innerHTML='<a href="/help/">Help</a>'};</script></body></html>`);
}catch(e){out.responses.push({url:u.href,status:500,error:e.stack});send(e.stack,'text/plain',500)}});
async function check(name,fn){try{out.checks.push({name,status:'PASS',details:await fn()})}catch(e){out.checks.push({name,status:'FAIL',error:e.stack});save();throw e}save()}
const scenario=[
 ['size',{facets:'3118'},'3118',['1','2','3','4']],
 ['brand',{facets:'155'},'155',['1','2','3','4']],
 ['color',{facets:'9'},'9',['1','2','3','4']],
 ['price',{priceMin:'2',priceMax:'10'},'price',['1','2','3','4']],
 ['combined-size',{facets:'3118,155,9',priceMin:'2',priceMax:'10'},'3118',['1']],
 ['combined-brand',{facets:'3118,155,9',priceMin:'2'},'155',['1']],
 ['combined-price',{facets:'3118,155,9',priceMax:'10'},'price',['1']],
 ['reset',{facets:'3118,155,9',priceMin:'2',priceMax:'10'},'all',['1','2','3','4']],
 ['zero-remove',{facets:'2247,3118',priceMin:'999999'},'2247',[]],
 ['zero-reset',{facets:'2247,3118',priceMin:'999999'},'all',['1','2','3','4']]
];
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;const b=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE}),c=await b.newContext({viewport:{width:1440,height:900}});await c.route('**/*',r=>{if(new URL(r.request().url()).origin===origin)return r.continue();out.blockedExternal.push(r.request().url());return r.abort()});const p=await c.newPage();p.setDefaultTimeout(10000);p.on('pageerror',e=>out.pageErrors.push(e.message));
const read=async()=>p.evaluate(()=>({lang:document.documentElement.lang,ids:[...document.querySelectorAll('[data-result-id]')].map(e=>e.dataset.resultId),active:[...document.querySelectorAll('[data-eg-remove-facet]')].map(e=>e.dataset.egRemoveFacet),query:document.querySelector('#query').textContent,item:document.querySelector('[data-item]')?.dataset.item,qty:document.querySelector('[data-eg-qty]')?.value}));
const nav=async url=>{let r=await p.goto(url);if(!r)r=await p.reload();assert.equal(r.status(),200);await p.waitForFunction(()=>window.egFacets);return read()};
const expect=async(lang,params,ids)=>{const state=await read();assert.equal(state.lang,lang);assert.deepEqual(state.active,(params.facets||'').split(',').filter(Boolean));assert.equal(state.query,params.query||'');if(ids)assert.deepEqual(state.ids,ids);const actual=new URL(p.url());assert.deepEqual(Object.fromEntries(actual.searchParams),params);assert.equal(actual.pathname,new URL(currentRoute).pathname);return state};let currentRoute;
try{
 for(const lang of langs)for(const kind of ['women','search'])for(const [name,selected,action,resultIds]of scenario)await check(`routing/${lang}/${kind}/${name}`,async()=>{
  currentRoute=local(fixtures[kind].languages[lang]);const params={sorting:'sorting.price.avg_asc',page:'3',itemsPerPage:'24',currency:'EUR',ShipToCountry:'1',campaign:'Keep & + Ü % / ?',...selected};if(kind==='search')params.query='shirt & + Größe / été?';const u=new URL(currentRoute);for(const [k,v]of Object.entries(params))u.searchParams.set(k,v);
  const initial=await nav(u.href);await expect(lang,params);await p.reload();await expect(lang,params,initial.ids);
  const expected={...params};delete expected.page;if(action==='all'){delete expected.facets;delete expected.priceMin;delete expected.priceMax}else if(action==='price'){delete expected.priceMin;delete expected.priceMax}else{const ids=expected.facets.split(',').filter(x=>x!==action);if(ids.length)expected.facets=ids.join(',');else delete expected.facets}
  const link=p.locator(action==='all'?'.facet-remove-all':action==='price'?'.facet-remove-price':`[data-eg-remove-facet="${action}"]`);const href=await link.getAttribute('href');const [r]=await Promise.all([p.waitForNavigation(),link.click()]);assert.equal(r.status(),200);const after=await expect(lang,expected,resultIds);await p.reload();await expect(lang,expected,resultIds);await p.goBack();await expect(lang,params,initial.ids);await p.goForward();await expect(lang,expected,resultIds);
  if(name==='zero-reset'&&['en','fr'].includes(lang))await p.screenshot({path:path.join(D,`${lang}-${kind}-reset.png`)});
  return {before:u.href,after:p.url(),href,httpStatus:200,language:lang,initial,afterState:after,history:true,reload:true};
 });
 {
 await check('compact/reference-and-100-reopens',async()=>{await nav(local(fixtures.all.languages.de));assert.equal(await p.locator('input[type=checkbox]').count(),0);const root=p.locator('[data-eg-compact-facets]');assert.equal(await root.locator('*').count()+1,69);const n=out.requests.length,h=p.locator('[data-eg-facet-group="1"] [data-eg-facet-toggle]');await h.click();await p.locator('#facet-item-3118').evaluate(e=>e.dataset.proof='same');const count=await root.locator('*').count();for(let i=0;i<100;i++){await h.click();assert.equal(await h.getAttribute('aria-expanded'),'false');await h.click();assert.equal(await h.getAttribute('aria-expanded'),'true')}assert.equal(await root.locator('*').count(),count);assert.equal(await p.locator('#facet-item-3118').getAttribute('data-proof'),'same');assert.equal(out.requests.length,n);return {initialElements:69,cycles:100,extraRequests:0,reused:true}});
 assert.deepEqual(out.pageErrors,[])}
 out.complete=true;save();console.log(JSON.stringify({cases:out.checks.length,pass:out.checks.filter(x=>x.status==='PASS').length,fail:out.checks.filter(x=>x.status==='FAIL').length,exceptions:out.pageErrors.length}));
}finally{save();await b.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e.stack);process.exitCode=1});
