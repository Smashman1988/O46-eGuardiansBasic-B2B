// Actual local Brotli HTTP transfer and Chromium timings from saved native HTML.
// External platform scripts are inert in BOTH variants; not a native server/INP/TTI benchmark.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),zlib=require('node:zlib');
const assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const D=path.resolve(process.argv[2]),B=path.resolve(process.argv[3]||'.cache/native-acceptance-543ee87-20261112');
fs.mkdirSync(D,{recursive:true});
const kinds=['few','women','all','children','search','filtered'],sources={},sizes={},measurements=[],requests=[];
const {readRevisionAsset}=require('./theme_assets.cjs');
const oldCss=readRevisionAsset('HEAD','resources/css/main.min.css');
const newCss=fs.readFileSync('resources/css/main.min.css','utf8');
const runtime=fs.readFileSync('resources/js/facets.min.js','utf8');
function facetRange(html){
    const from=html.indexOf('<section data-eg-target=".facet-item-value-chk"'),sectionEnd=html.indexOf('</section>',from)+10;
    assert.ok(from>0&&sectionEnd>from);const parent=html.lastIndexOf('<div class="leftsidecat">',from);
    let depth=0,end=0;const pattern=/<div\b[^>]*>|<\/div>/g;pattern.lastIndex=parent;
    for(let m;(m=pattern.exec(html));){depth+=m[0].startsWith('</')?-1:1;if(!depth){end=m.index;break;}}
    assert.ok(end>=sectionEnd);return {from,sectionEnd,end};
}
for(const kind of kinds){
    const old=fs.readFileSync(path.join(B,`facet-${kind}-1440.html`),'utf8'),range=facetRange(old);
    const params=kind==='search'?{query:'nike'}:kind==='filtered'?{facets:'3118'}:{};
    const rendered=JSON.parse(execFileSync(path.resolve('.cache/php-runtime/php-8.4.23/php.exe'),['tests/facets.php',path.resolve('.cache/contact-widget/autoload3.php'),'--render'],{input:JSON.stringify({kind,params}),maxBuffer:8e6}));
    sources[kind]={old,new:old.slice(0,range.from)+rendered.html+old.slice(range.end)};
    const json=rendered.html.match(/data-eg-facet-data>(.*?)<\/script>/s)[1];
    sizes[kind]={oldFacetBytes:Buffer.byteLength(old.slice(range.from,range.sectionEnd)),oldFacetWithControlsBytes:Buffer.byteLength(old.slice(range.from,range.end)),newFacetBytes:Buffer.byteLength(rendered.html),oldFullBytes:Buffer.byteLength(old),newFullBytes:Buffer.byteLength(sources[kind].new),dataBytes:Buffer.byteLength(json),newJsBytes:Buffer.byteLength(runtime),newJsBrotliBytes:zlib.brotliCompressSync(runtime).length};
    fs.writeFileSync(path.join(D,kind+'-after.html'),sources[kind].new);
}
function replay(html,mode){
    // Keep source scripts as inert nodes/data (including JSON) to preserve parser/DOM work.
    html=html.replace(/<script\b/g,'<script type="application/x-audit-inert"');
    html=html.replace(/href="[^"]*\/css\/main(?:-211025)?\.min\.css[^\"]*"/g,`href="/main-${mode}.css"`);
    const oldRuntime=`document.querySelectorAll('.cat-facet-name').forEach(e=>e.addEventListener('click',()=>e.closest('.eg-dropdown').classList.toggle('isOpen')));`;
    return html.replace('</body>',`<script>${mode==='old'?oldRuntime:''}document.querySelector('[aria-label="Filter öffnen"]')?.addEventListener('click',()=>document.documentElement.classList.toggle('filter-open'));</script>${mode==='new'?'<script src="/facets.js"></script>':''}</body>`);
}
let origin;
// Precompress before browser timing starts: avoid measuring local Brotli CPU as shop TTFB.
const bodies={'/facets.js':{body:runtime,type:'text/javascript'},'/main-old.css':{body:oldCss,type:'text/css'},'/main-new.css':{body:newCss,type:'text/css'}};
for(const kind of kinds)for(const mode of ['old','new'])bodies[`/${kind}/${mode}`]={body:replay(sources[kind][mode],mode),type:'text/html'};
const packed=Object.fromEntries(Object.entries(bodies).map(([key,value])=>{const raw=Buffer.from(value.body);return [key,{raw:raw.length,encoded:zlib.brotliCompressSync(raw),type:value.type}]}));
const server=http.createServer((req,res)=>{
    const url=new URL(req.url,origin||'http://localhost'),item=packed[url.pathname];
    if(!item){res.writeHead(url.pathname==='/favicon.ico'?204:404);return res.end();}
    requests.push({url:url.pathname,type:item.type,raw:item.raw,compressed:item.encoded.length});
    res.writeHead(200,{'Content-Type':item.type+'; charset=utf-8','Content-Encoding':'br','Content-Length':item.encoded.length,'Cache-Control':'no-store'});res.end(item.encoded);
});
const snap=()=>({dom:document.querySelectorAll('*').length,facetDom:document.querySelector('[data-eg-facets]').querySelectorAll('*').length+1,checkboxes:document.querySelectorAll('[data-eg-facets] input[type=checkbox]').length,headers:[...document.querySelectorAll('.cat-facet-name')].map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,w:e.getBoundingClientRect().width,h:e.getBoundingClientRect().height}))});
(async()=>{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
    const b=await chromium.launch({headless:true,executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try{
        for(const kind of kinds)for(const width of [390,1440])for(let rep=0;rep<5;rep++)for(const mode of rep%2?['new','old']:['old','new']){
            const c=await b.newContext({viewport:{width,height:900}}),p=await c.newPage(),errors=[];
            await c.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:200,contentType:r.request().resourceType()==='image'?'image/svg+xml':'text/plain',body:r.request().resourceType()==='image'?'<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>':''}));
            p.on('pageerror',e=>errors.push(e.message));const cdp=await c.newCDPSession(p);await cdp.send('Performance.enable');
            const start=requests.length,response=await p.goto(`${origin}/${kind}/${mode}`);assert.equal(response.status(),200);
            const initial=await p.evaluate(snap),nav=await p.evaluate(()=>performance.getEntriesByType('navigation')[0].toJSON());
            if(width===390)await p.locator('[aria-label="Filter öffnen"]').first().click();
            const opened=await p.evaluate(()=>{const e=document.querySelector('.cat-facet-name'),start=performance.now();e.click();return {openMs:performance.now()-start,firstInteractionAt:performance.now()}});
            const one=await p.evaluate(snap);
            if(rep===0)await p.screenshot({path:path.join(D,`${kind}-${mode}-${width}-open.png`)});
            const rest=await p.evaluate(()=>{const start=performance.now();for(const e of document.querySelectorAll('.cat-facet-name'))if(!e.closest('.eg-dropdown').classList.contains('isOpen'))e.click();return performance.now()-start});
            const all=await p.evaluate(snap);
            const repeat=await p.evaluate(()=>{const e=document.querySelector('.cat-facet-name');e.click();const start=performance.now();e.click();return performance.now()-start});
            assert.equal(all.checkboxes,sizes[kind]?Object.values(require('./fixtures/facets.json')[kind].groups).reduce((n,g)=>n+g.values.length,0):0);
            assert.deepEqual(errors,[]);
            // Parse identical raw full-page source separately: parser CPU only, without JS/network/layout.
            const parse=await p.evaluate(html=>{const start=performance.now(),d=new DOMParser().parseFromString(html,'text/html');return {ms:performance.now()-start,dom:d.querySelectorAll('*').length,facetDom:d.querySelector('[data-eg-facets]').querySelectorAll('*').length+1}},sources[kind][mode]);
            const metrics=Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x=>[x.name,x.value]));
            measurements.push({kind,width,rep,mode,initial,parse,one,all,...opened,openRemainingMs:rest,reopenMs:repeat,nav,metrics,requests:requests.slice(start),errors});
            fs.writeFileSync(path.join(D,'performance.json'),JSON.stringify({mode:'LOCAL_HTTP_BROTLI_REPLAY_EXTERNAL_SCRIPTS_INERT',sizes,measurements},null,2));
            await c.close();
        }
        console.log(JSON.stringify({runs:measurements.length,exceptions:measurements.flatMap(x=>x.errors).length,all:sizes.all}));
    }finally{await b.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e.stack);process.exitCode=1});
