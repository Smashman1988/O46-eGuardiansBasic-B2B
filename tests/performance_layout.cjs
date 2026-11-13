// First-paint geometry under delayed media, using the actual critical/minified CSS.
// node tests/performance_layout.cjs <report.json>
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
// An optional archived template permits a failing pre-fix control without editing sources.
const head=fs.readFileSync(process.env.O46_HEAD_TEMPLATE||'resources/views/PageDesign/Partials/Head.twig','utf8');
const critical=[...head.matchAll(/<style data-eg-(?:pdp-layout|first-paint)-critical>([\s\S]*?)<\/style>/g)].map(x=>x[1]).join('');
const full=fs.readFileSync('resources/css/main-211025.min.css','utf8');
const images=[['https://www.outlet46.de/documents/category/31/lager.jpg',2500,800],
 ...['outlet46-lager-jeans','pakete-packen-outlet46','mitarbeiter-outlet46-kleidung','originalware-outlet46'].map(n=>['https://www.outlet46.de/documents/category/31/'+n+'.jpg',1000,643]),
 ...['paypal','sepa','kreditkarte','vorkasse','amazon-payv2'].map(n=>['https://cdn02.outlet46.de/frontend/page/bilder/Footer/'+n+'.png',120,50])];
(async()=>{const b=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE}),out=[];try{for(const width of [320,375,390,430,768,1440])for(const mode of ['critical','full']){const p=await b.newPage({viewport:{width,height:900}}),pending=[];await p.route('https://**/*',r=>new Promise(resolve=>pending.push(async()=>{const image=images.find(x=>x[0]===r.request().url());assert.ok(image);await r.fulfill({contentType:'image/svg+xml',body:`<svg xmlns="http://www.w3.org/2000/svg" width="${image[1]}" height="${image[2]}"></svg>`});resolve()})));
 const markup=images.map(([src,w,h])=>`<div class="widget-code"><img ${w===120?`data-src="${src}"`:'width="100%"'} src="${w===120?'':src}" data-width="${w}" data-height="${h}"></div>`).join('');
 await p.setContent('<style>body{margin:0}img{max-width:100%}</style><style>'+ (mode==='critical'?critical:full)+'</style><main id="page-body">'+markup+'</main>',{waitUntil:'domcontentloaded'});
 const measure=()=>p.locator('img').evaluateAll(es=>es.map(e=>({width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,natural:[e.naturalWidth,e.naturalHeight]})));
 const before=await measure();await p.locator('img[data-src]').evaluateAll(es=>es.forEach(e=>e.src=e.dataset.src));await p.waitForTimeout(20);await Promise.all(pending.map(f=>f()));await p.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth));const after=await measure();
 for(let i=0;i<images.length;i++){assert.ok(Math.abs(before[i].height-after[i].height)<.1,JSON.stringify({width,mode,image:images[i][0],before:before[i],after:after[i]}));assert.ok(Math.abs(after[i].width/after[i].height-images[i][1]/images[i][2])<.01);}
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));out.push({width,mode,images:images.length,before,after});await p.close();}
 // Existing ShopBuilder markup must fit without changing its configured margins
 // or the original video frame ratio, including translated checkout labels.
 for(const width of [320,375,390,430,768,1440])for(const mode of ['critical','full']){
 const p=await b.newPage({viewport:{width,height:900}});
 await p.route('https://www.youtube.com/**',r=>r.fulfill({contentType:'text/html',body:''}));
 const labels=['zur Kasse','Checkout','Passer la commande','Procedi al pagamento','Finalizar compra'];
 await p.setContent('<style>body{margin:0}#page-body{padding:0 15px}.widget-link{margin-left:5px}.btn-block{display:block;width:100%}.ml-2{margin-left:7.5px}.mr-3{margin-right:15px}</style><style>'+(mode==='critical'?critical:full)+'</style><main id="page-body"><iframe width="1000" height="600" style="box-sizing:border-box" frameborder="0" src="https://www.youtube.com/embed/dhHucj4sfRI"></iframe><div class="widget-basket-totals"></div>'+labels.map(label=>'<div class="widget-link"><a href="/kasse/" class="btn-block ml-2 mr-3">'+label+'</a></div>').join('')+'</main>');
 const geometry=await p.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,video:document.querySelector('iframe').getBoundingClientRect().toJSON(),buttons:[...document.querySelectorAll('.widget-link a')].map(e=>({rect:e.getBoundingClientRect().toJSON(),left:getComputedStyle(e).marginLeft,right:getComputedStyle(e).marginRight,href:e.getAttribute('href')}))}));
 assert.ok(!geometry.overflow);assert.ok(Math.abs(geometry.video.width/geometry.video.height-1000/600)<.002);assert.ok(geometry.buttons.every(x=>x.rect.right<=width&&x.left==='7.5px'&&x.right==='15px'&&x.href==='/kasse/'));
 out.push({width,mode,contentOverflow:geometry});await p.close();
 }
 // MagicZoom's .mz-thumb rule must not collapse unloaded thumbnails to 2px.
 for(const width of [768,1024,1440,1920]){const p=await b.newPage({viewport:{width,height:900}});await p.setContent('<style>'+full+'</style><style>.mz-thumb{display:inline-block!important}</style><article class="single"><div style="width:85px"><div class="single-prev-images">'+Array.from({length:7},()=>'<a class="mz-thumb"><img width="100%" height="100%"></a>').join('')+'</div></div></article>');const rows=await p.locator('.single-prev-images a').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));assert.ok(rows.every(r=>r.width>=84));assert.ok(rows.every((r,i)=>!i||r.top>=rows[i-1].bottom));
 await p.locator('.single-prev-images img').evaluateAll(es=>es.forEach((e,i)=>{const [w,h]=[[100,200],[200,100],[100,100]][i%3];e.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'"></svg>')}));await p.waitForFunction(()=>[...document.images].every(e=>e.complete&&e.naturalWidth));
 const proportions=await p.locator('.single-prev-images img').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return{rendered:r.width/(r.height-parseFloat(c.paddingBottom)),natural:e.naturalWidth/e.naturalHeight,width:r.width,height:r.height}}));assert.ok(proportions.every(x=>Math.abs(x.rendered-x.natural)<.01&&x.height<=75&&x.width<=85),'Portrait, landscape and square thumbnails retain their proportions');
 out.push({width,thumbnailFrames:rows,proportions});await p.close();}
 // Real footer grid classes: the fourth column must not wrap before main.css.
 const footerCss=head.match(/<style data-eg-footer-critical>([\s\S]*?)<\/style>/)[1];
 const contentCss=head.match(/<style data-eg-content-layout-critical>([\s\S]*?)<\/style>/)[1];
 const footerClasses=[...fs.readFileSync('resources/views/PageDesign/Partials/Footer.twig','utf8').matchAll(/<div class="([^"]*\bcol-\d+[^\"]*)"/g)].map(x=>x[1]);
 const baseStyles=[...head.matchAll(/<style>([\s\S]*?)<\/style>/g)].slice(0,3).map(x=>x[1]);
 assert.equal(baseStyles.length,3,'All three existing critical CSS branches are tested');
 // Actual cart grid classes: preserve the final layout and reserve the desktop columns
 // before asynchronous main.css. The pre-existing 768/991px tablet gap is recorded,
 // not repaired by this desktop-only regression test.
 for(const width of [320,375,390,428,768,991,992,1024,1280,1440,1920]){
 const p=await b.newPage({viewport:{width,height:900}});
 const cartMarkup='<main id="page-body"><div id="cart-columns" class="widget widget-grid widget-two-col row"><div class="widget-inner col-xl-7 widget-prop-xl-2-1 col-lg-7 widget-prop-lg-2-1 col-md-6 widget-prop-md-3-1 col-sm-12 widget-prop-sm-3-1 widget-stacked-mobile col-12 widget-prop-3-1 widget-stacked-mobile"><div>Artikel</div></div><div class="widget-inner col-xl-5 widget-prop-xl-auto col-lg-5 widget-prop-lg-auto col-md-6 widget-prop-md-3-1 col-sm-12 widget-prop-sm-3-1 col-12 widget-prop-3-1"><div>Summe / Versand</div></div></div></main>';
 await p.setContent('<style>body{margin:0}</style><style data-cart-critical>'+baseStyles[2]+'</style>'+cartMarkup);
 const measure=()=>p.locator('#cart-columns > .widget-inner').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return{x:r.x,width:r.width,maxWidth:s.maxWidth,flexBasis:s.flexBasis,flexGrow:s.flexGrow,flexShrink:s.flexShrink,paddingLeft:s.paddingLeft,paddingRight:s.paddingRight}}));
 const before=await measure();await p.addStyleTag({content:full});const after=await measure();
 const initialStable=before.every((v,i)=>Math.abs(v.x-after[i].x)<.1&&Math.abs(v.width-after[i].width)<.1&&['maxWidth','flexBasis','flexGrow','flexShrink'].every(k=>v[k]===after[i][k]));
 if(width<768||width>=992)assert.ok(initialStable,'Cart critical grid must match main.css: '+JSON.stringify({width,before,after}));
 await p.locator('style[data-cart-critical]').evaluate(e=>e.remove());const fullOnly=await measure();
 assert.deepEqual(fullOnly,after,'Cart final geometry/spacing must be identical without critical CSS: '+width);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Cart grid must not overflow: '+width);
 out.push({width,cartGridBefore:before,cartGridAfter:after,cartGridFullOnly:fullOnly,initialStable,legacyTabletInitialMismatch:width>=768&&width<992&&!initialStable,finalLayoutUnchanged:true});await p.close();
 }
 for(const width of [375,390,768,1024,1440,1920])for(const [variant,base]of baseStyles.entries()){
 const p=await b.newPage({viewport:{width,height:900}});
 const markup='<main id="non-footer"><div class="row"><div class="col-12 col-xl-6">Gallery</div><div class="col-12 col-xl-6">Matrix</div></div></main><footer><div class="container"><div class="row">'+footerClasses.map(c=>'<div class="'+c+'">'+(c.includes('d-none')?'<hr>':'<p class="footer-title">Footer</p>')+'</div>').join('')+'</div></div></footer>';
 const contentMarkup='<section><div id="payment-widget" class="widget-code"><div class="widget-inner mr-3 ml-3"><div class="row">'+Array.from({length:7},()=>'<div class="mb-3 col-12 col-sm-6 col-lg-4 col-xl-3"><a class="d-flex"><picture style="width:120px;height:50px"><img data-src="https://cdn02.outlet46.de/frontend/page/bilder/Footer/paypal.png" width="120" height="50"></picture><span class="align-self-center flex-grow-1 text-center">Payment</span></a></div>').join('')+'</div></div></div></section>';
 await p.setContent('<style>'+base+'</style><div id="page-body"><div id="unrelated-widget" class="widget-code"><div class="row"><div class="col-12 col-xl-6">Embedded list</div><div class="col-12 col-xl-6">Filter</div></div></div>'+markup+contentMarkup+'</div>');
 const outside=()=>p.locator('#non-footer .row > div, #unrelated-widget .row > div').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 const outsideBefore=await outside();const early=await p.addStyleTag({content:footerCss+contentCss});
 assert.deepEqual(await outside(),outsideBefore,'Footer rules must preserve the early PDP/header grid');
 const measure=()=>p.locator('footer .row > div').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y,width:e.getBoundingClientRect().width,display:getComputedStyle(e).display})));
 const content=()=>p.locator('#payment-widget .row > div').evaluateAll(es=>es.map(e=>({x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height})));
 const contentBefore=await content();const before=await measure();await p.addStyleTag({content:full});const after=await measure();
 assert.deepEqual(await content(),contentBefore,'Content grid columns must be stable before main.css');
 for(let i=0;i<before.length;i++){assert.equal(before[i].display,after[i].display);assert.ok(Math.abs(before[i].x-after[i].x)<1&&Math.abs(before[i].width-after[i].width)<1,JSON.stringify({width,variant,before,after}));}
 await early.evaluate(e=>e.remove());assert.deepEqual(await measure(),after,'Final footer layout must equal the full stylesheet without the early copy');assert.deepEqual(await content(),contentBefore,'Final content layout must equal the full stylesheet without the early copy');
 out.push({width,variant,footerGridBefore:before,footerGridAfter:after,contentGrid:contentBefore,nonFooterUnchanged:true,finalLayoutUnchanged:true});await p.close();
 }
 }finally{await b.close();fs.writeFileSync(process.argv[2],JSON.stringify(out,null,2))}console.log('120 delayed images + 12 content overflow cases with 5 checkout labels + 4 thumbnail layouts + 11 cart grids + 18 footer/content grids; outside and final layouts unchanged PASS');})().catch(e=>{console.error(e);process.exitCode=1});
