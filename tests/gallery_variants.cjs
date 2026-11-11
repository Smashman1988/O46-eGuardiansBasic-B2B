// Local regression for delayed responses and synthetic image-link navigation.
// The four production sources run against real DOMs; the native zoom API is a recorder.
const fs=require('node:fs'),assert=require('node:assert/strict'),acorn=require('acorn');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const names=['toInt','getZoomContextFromMatrix','escapeHtml','getProductTitleForGallery','normalizeThumbUrl','ensureZoomAnchor','setMainImageNow','updateMagicZoomWithGallery','previewVariationFromRow'];
function functions(source){const found={};function walk(n){if(!n?.type)return;if(n.type==='FunctionDeclaration'&&names.includes(n.id.name)){assert.ok(!found[n.id.name],n.id.name);found[n.id.name]=source.slice(n.start,n.end)}for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(walk);else if(v?.type)walk(v)}}walk(acorn.parse(source,{ecmaVersion:'latest'}));assert.equal(Object.keys(found).length,names.length);return Object.values(found).join('\n')}
(async()=>{const b=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE}),results=[];try{
 for(const name of ['cat','item','main','vue'])for(const modal of [false,true]){
 const p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'}));
 const id=modal?'ItemImgZoom2':'ItemImgZoom';
 await p.setContent(`<h1>Gallery</h1><div class="${modal?'modal-cross show':''}"><article><div class="single-prev-images"><a href="https://gallery-fixture.invalid/old">old</a></div><a id="${id}" class="MagicZoom" href="https://gallery-fixture.invalid/old"><img></a><div id="matrix" data-eg-size-matrix><div data-eg-variation-id="1"></div><div data-eg-variation-id="2"></div></div></article></div>`);
 await p.addScriptTag({content:`window.calls=[];window.pending=[];window.linkClicks=0;document.addEventListener('click',e=>{if(e.target.closest('a'))linkClicks++});
 window.MagicZoom={stop:id=>calls.push(['stop',id]),start:id=>calls.push(['start',id]),update:id=>calls.push(['update',id]),refresh:id=>calls.push(['refresh',id])};
 function fetchVariationDetails(id,cb){pending.push({id,cb})}function fetchVariationDetailsSingle(id,cb){pending.push({id,cb})}
 ${functions(fs.readFileSync('resources/js/'+name+'.js','utf8'))}`});
 const outcome=await p.evaluate(async id=>{
 const matrix=document.getElementById('matrix'),rows=[...matrix.children];
 const result=n=>({images:[{url:'https://gallery-fixture.invalid/'+n+'-large',urlMiddle:'https://gallery-fixture.invalid/'+n+'-middle',urlPreview:'https://gallery-fixture.invalid/'+n+'-thumb'}]});
 // Both warmed variants finish on each switch, exposing the old timer race.
 for(let i=0;i<50;i++){previewVariationFromRow(matrix,rows[i%2],true);pending.shift().cb(result(i%2))}
 await new Promise(r=>setTimeout(r,300));
 const rapid={clicks:linkClicks,href:document.getElementById(id).href,calls:calls.slice()};
 calls.length=0;previewVariationFromRow(matrix,rows[0],true);previewVariationFromRow(matrix,rows[1],true);
 pending.pop().cb(result('new'));pending.pop().cb(result('stale'));
 const late={href:document.getElementById(id).href,calls:calls.slice()};
 calls.length=0;previewVariationFromRow(matrix,rows[0],true);matrix.remove();pending.pop().cb(result('detached'));
 return {rapid,late,detachedCalls:calls,href:document.getElementById(id).href};
 },id);
 assert.equal(outcome.rapid.clicks,0,'no synthesized image link click');
 assert.equal(outcome.rapid.href,'https://gallery-fixture.invalid/1-large');
 assert.deepEqual(outcome.rapid.calls,Array.from({length:50},()=>[['stop',id],['start',id]]).flat());
 assert.equal(outcome.late.href,'https://gallery-fixture.invalid/new-large');assert.deepEqual(outcome.late.calls,[['stop',id],['start',id]]);
 assert.deepEqual(outcome.detachedCalls,[]);assert.equal(outcome.href,outcome.late.href);assert.deepEqual(errors,[]);
 results.push({source:name,modal,rapidSwitches:50,status:'PASS'});await p.close();
 }
 console.log('8 gallery scenarios PASS; 400 rapid switches, stale responses and removed matrices');
 if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(results,null,2));
 }finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
