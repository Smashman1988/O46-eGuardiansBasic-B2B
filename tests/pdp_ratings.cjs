// Real PDP rating markup/font and delivered CSS: keep five stars on one row.
// node tests/pdp_ratings.cjs <report.json>
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const source=fs.readFileSync('resources/views/Item/SingleItem.twig','utf8');
const start=source.indexOf('<div class="item-ratings-top '),end=source.indexOf('{% endif %}',start);
assert.ok(start>0&&end>start);
const fragment=source.slice(start,end);
assert.equal((fragment.match(/{% for i in 1\.\.5 %}/g)||[]).length,2);
const full=fs.readFileSync('resources/css/main.min.css','utf8');
// Pin the pre-fix reference: HEAD also contains the fix after it is committed.
const before=cp.execFileSync('git',['show','731e00a6c98380e86f50fa7c5beb42d3fbda95ea:resources/css/main-211025.min.css'],{encoding:'utf8',maxBuffer:4000000});
const head=fs.readFileSync('resources/views/PageDesign/Partials/Head.twig','utf8');
const early=head.match(/<style data-eg-first-paint-critical>([\s\S]*?)<\/style>/)[1];
const pdpCritical=head.match(/<style>([\s\S]*?)<\/style>/)[1];
const font='@font-face{font-family:icomoon;src:url(data:font/woff2;base64,'+fs.readFileSync('resources/documents/fonts/icomoon.woff2').toString('base64')+')}';
function markup(label,percent){return fragment.replace(/{% for i in 1\.\.5 %}([\s\S]*?){% endfor %}/g,(_,s)=>s.repeat(5)).replace('{{ percentTotal }}',percent).replace('{{ itemData.item.feedbackCount }}','12').replace('{{ trans("GuardiansBasicB2B::Template.ratingtitle") }}',label);}
function measure(){const root=document.querySelector('.single .item-ratings-first'),grey=root.querySelector('.rating-grey'),fill=root.querySelector('.rating-fuller'),inner=root.querySelector('.rating-fuller-inner'),r=e=>e.getBoundingClientRect().toJSON();return{grey:r(grey),fill:r(fill),inner:r(inner),stars:[...root.querySelectorAll('.icon-star')].map(r),href:root.querySelector('a').getAttribute('href'),overflow:document.documentElement.scrollWidth>innerWidth,link:r(root.querySelector('.tab-rating-info'))};}
(async()=>{const b=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE}),out={cases:[],before:null};try{
const p=await b.newPage({viewport:{width:1440,height:900}});await p.route(/^https?:/,r=>r.abort());
const render=async(css,label,percent,container,fontSize)=>{await p.setContent('<style>'+css+font+'</style><style>body{margin:0}.single{margin:30px;width:'+container+'px;font-size:'+fontSize+'px}</style><article class="single">'+markup(label,percent)+'</article>');await p.evaluate(()=>document.fonts.ready);return p.evaluate(measure)};
out.before=await render(before,'Kundenmeinungen',100,600,16);assert.ok(out.before.stars.slice(0,5).some(s=>Math.abs(s.y-out.before.stars[0].y)>1),'Desktop fixture reproduces the reported wrap');await p.screenshot({path:path.join(path.dirname(process.argv[2]),'ratings-desktop-before.png'),clip:{x:0,y:0,width:720,height:120}});
await render(full,'Kundenmeinungen',100,600,16);await p.screenshot({path:path.join(path.dirname(process.argv[2]),'ratings-desktop-after.png'),clip:{x:0,y:0,width:720,height:120}});
for(const lang of ['de','en','fr','it','es']){
const label=fs.readFileSync('resources/lang/'+lang+'/Template.properties','utf8').match(/^ratingtitle\s*=\s*(.+)$/m)[1].trim();
for(const width of [320,360,375,390,430,480,768,1024,1440,1920])for(const kind of ['pdp','quickview'])for(const percent of [0,74,100]){
await p.setViewportSize({width,height:900});const container=Math.min(width-60,kind==='quickview'?Math.max(240,width*.55):width>=1200?width/2-30:width-60);
const result=await render(full,label,percent,container,width>=1440?20:16);
for(const stars of [result.stars.slice(0,5),result.stars.slice(5)])assert.ok(stars.every(s=>Math.abs(s.y-stars[0].y)<.1),JSON.stringify({lang,width,kind,percent,result}));
assert.ok(Math.abs(result.fill.width/result.grey.width-percent/100)<.002,'Fractional fill uses only the star cell');assert.ok(Math.abs(result.grey.x-result.inner.x)<.1&&Math.abs(result.grey.y-result.inner.y)<.1,'Both layers align');assert.ok(result.grey.right<=result.link.x+.1,'Link does not overlap the stars');assert.ok(!result.overflow);assert.equal(result.href,'#tabrating');
out.cases.push({lang,width,kind,percent,container,status:'PASS'});
if(lang==='es'&&kind==='quickview'&&percent===74&&width===320)await p.screenshot({path:path.join(path.dirname(process.argv[2]),'ratings-mobile-after.png'),clip:{x:0,y:0,width:320,height:160}});
}
}
// Early rules must also prevent wrapping with the existing preloaded CSS layer.
await p.setViewportSize({width:1440,height:900});const earlyResult=await render(pdpCritical+early,'Kundenmeinungen',74,600,16);assert.ok(earlyResult.stars.slice(0,5).every(s=>Math.abs(s.y-earlyResult.stars[0].y)<.1));assert.ok(Math.abs(earlyResult.fill.width/earlyResult.grey.width-.74)<.002);out.critical='PASS';
await p.close();console.log(out.cases.length+' language/width/PDP/Quickview/rating cases + critical CSS PASS');
}finally{await b.close();fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2))}})().catch(e=>{console.error(e);process.exitCode=1});
