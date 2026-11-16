// Serve exactly the own asset lists emitted by real before/after Twig renders.
// Local gzip transfers and cache reuse; native plugin/Ceres injection is not simulated.
const fs=require('fs'),path=require('path'),http=require('http'),zlib=require('zlib'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const D=path.resolve(process.argv[2]);
const scopes={before:JSON.parse(fs.readFileSync(D+'/asset-page-before.json')),after:JSON.parse(fs.readFileSync(D+'/asset_page_scope-3.json'))};
const pageTypes={'Startseite (Kategorie 31)':'known-main-content','Kategorie':'category','Suche':'search','Produktdetail':'product','Quickview-Fragment':'quickview-fragment','Markenverzeichnis':'brands','Warenkorb (verknüpft)':'basket','Checkout (verknüpft)':'linked-checkout','Checkout (direkt)':'checkout'};
const files={},received=[],rows=[];
for(const version of['before','after'])for(const c of Object.values(scopes[version].cases))for(const script of c.scripts){
    const route='/assets/'+version+'/'+script,raw=fs.readFileSync((version==='before'?D+'/before/':'')+'resources/'+script.split('?')[0]);
    files[route]={raw,gzip:zlib.gzipSync(raw,{level:6})};
}
const server=http.createServer((req,res)=>{
    if(files[req.url]){const f=files[req.url];received.push({url:req.url,bytes:f.gzip.length});res.writeHead(200,{'content-type':'application/javascript','content-encoding':'gzip','cache-control':'public,max-age=3600'});return res.end(f.gzip);}
    res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});res.end('<!doctype html><title>Local asset transfer fixture</title>');
});
(async()=>{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
    const b=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try{for(const[page,kind]of Object.entries(pageTypes)){
        const row={page,kind};
        for(const version of['before','after']){
            const scripts=scopes[version].cases['de/'+kind].scripts,context=await b.newContext(),p=await context.newPage();
            await p.goto(origin);const hrefs=scripts.map(s=>'/assets/'+version+'/'+s);
            const states={};for(const state of['cold','warm']){
                const from=received.length;
                await p.evaluate(async urls=>{for(const url of urls){const r=await fetch(url);if(!r.ok)throw Error(r.status);await r.arrayBuffer();}},hrefs);
                states[state]={wireRequests:received.length-from,gzipBodyBytes:received.slice(from).reduce((n,r)=>n+r.bytes,0)};
            }
            assert.equal(states.cold.wireRequests,scripts.length);assert.equal(states.warm.wireRequests,0);
            row[version]={scripts:scripts.map(script=>({file:script,bodyBytes:files['/assets/'+version+'/'+script].raw.length,gzipBodyBytes:files['/assets/'+version+'/'+script].gzip.length})),...states};
            await context.close();
        }
        assert.equal(row.before.cold.wireRequests-row.after.cold.wireRequests,kind==='quickview-fragment'?0:1);
        rows.push(row);
    }}finally{await b.close();server.close();}
    fs.writeFileSync(D+'/resources.json',JSON.stringify({status:'PASS',rows,mode:'LOCAL_REAL_TWIG_ASSET_LISTS_AND_GZIP_HTTP_REPLAY',limits:['Own theme JS only. Ceres/additional plugin/payment injections require native Preview 426 inventory.','Fetch replay measures body bytes and browser cache reuse; parse/execution is covered separately by full-bundle tests, no native speed claim.','Quickview fragment emits no script; from a listing the existing loader downloads matrix and zoom on first demand.']},null,2));
    console.log(rows.length+' page resource matrices with cold/warm local gzip transfer PASS');
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
