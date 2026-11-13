// node tests/navigation_layout.cjs <render-artifacts-directory> <report.json>
// Offline comparison of actual rendered menus inside recorded native headers.
// Browser/service integration remains separate from this deterministic layout fixture.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const acorn = require('acorn');
const {chromium} = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), artifacts = path.resolve(process.argv[2]), reportPath = path.resolve(process.argv[3]);
const sources = {de:'home-de-390-r0-cold', en:'all-en-1440-r0-cold', fr:'category-few-fr-375-r0-cold', it:'search-it-428-r0-cold', es:'error404-es-390-r0-cold'};
const css = fs.readFileSync(path.join(root, 'resources/css/main-211025.min.css'), 'utf8');
const head = fs.readFileSync(path.join(root, 'resources/views/PageDesign/Partials/Head.twig'), 'utf8');
const fontCss = [...head.match(/<style>([\s\S]*?)<\/style>/)[1].replaceAll("{{ plugin_path('GuardiansBasicB2B') }}", '/plugins/GuardiansBasicB2B').matchAll(/@font-face\{[^}]+\}/g)].map(m=>m[0]).join('');
assert.ok(fontCss.includes('icomoon.woff2') && fontCss.includes('open-sans-v17-latin-regular.woff2'), 'Use the actual local header fonts');
const js = fs.readFileSync(path.join(root, 'resources/js/main.js'), 'utf8');
const jquery = fs.readFileSync(path.join(root, 'resources/js/jquery-3.7.1.min.js'), 'utf8');
const methods = {};
function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (n.type === 'AssignmentExpression' && n.left.type === 'MemberExpression' && n.left.object.type === 'ThisExpression' && ['tgClass','ddownOpen','ddownBack'].includes(n.left.property.name)) methods[n.left.property.name] = js.slice(n.right.start, n.right.end);
    for (const v of Object.values(n)) if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') walk(v);
}
walk(acorn.parse(js, {ecmaVersion:'latest'}));
assert.deepEqual(Object.keys(methods).sort(), ['ddownBack','ddownOpen','tgClass']);
const showAllStart = js.indexOf("$(document).on('click touchend', '.menuShowAll'");
assert.ok(showAllStart >= 0, 'Actual menuShowAll handler must still be reviewed');
const showAllEnd = js.indexOf('\n});', showAllStart) + 4;
const showAll = js.slice(showAllStart, showAllEnd);
const methodSetup = 'window.navigationEvents={' + Object.entries(methods).map(([name,code]) => `${name}:${code}`).join(',') + '};' +
    "$(document).on('click','[data-eg-open-ddown],[data-eg-back-ddown],[data-eg-param=\"html,menu-open\"]',function(event){event.preventDefault();event.stopPropagation();navigationEvents[this.dataset.egHandler](this);});" + showAll;
const localAssets = new Map(fs.readdirSync(path.join(root,'resources/documents/fonts')).map(name => [name,path.join(root,'resources/documents/fonts',name)]));
localAssets.set('b2b-outlet46-logo.png',path.join(root,'resources/images/b2b-outlet46-logo.png'));
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function mainHeader(html) {
    let depth=0, start=-1, result='';
    for (const match of html.matchAll(/<\/?header\b[^>]*>/gi)) {
        if (start<0) {
            if (!/id="page-header2?"/.test(match[0])) continue;
            start=match.index;
        }
        depth += match[0].startsWith('</') ? -1 : 1;
        if (depth===0) { result+=html.slice(start,match.index+match[0].length); start=-1; }
    }
    assert.ok(result.includes('top-menu') && depth===0, 'Recorded native header and navigation must both be captured');
    return result;
}

(async()=>{
    const browser = await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    const rows = [], errors = [];
    try {
        for (const [lang, file] of Object.entries(sources)) for (const width of [390,1440]) {
            const original = fs.readFileSync(path.join(root,'.cache/global-performance-13af2e8-20261113',file+'.html'),'utf8');
            const header = mainHeader(original); assert.ok(header,'Recorded native header: '+lang);
            const results = [];
            for (const version of ['before','after']) {
                const page = await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1});
                page.on('pageerror',e=>errors.push(e.message));
                let requests = 0, groupDataRequests = 0;
                await page.route('**/*', async route => {
                    const req = route.request(), url = new URL(req.url()), asset = localAssets.get(path.basename(url.pathname));
                    requests++;
                    if (req.resourceType() === 'document') return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Navigation target fixture</title>'});
                    if (asset) return route.fulfill({path:asset,headers:{'access-control-allow-origin':'*'}});
                    if (req.resourceType() === 'xhr' || req.resourceType() === 'fetch') groupDataRequests++;
                    await route.abort();
                });
                await page.setContent('<!doctype html><html><head><base href="https://navigation.test/"><meta charset="utf-8"><style>'+fontCss+css+'</style></head><body class="hold-transition">'+header+'<main style="height:1000px"></main></body></html>');
                await page.locator('.top-menu').evaluate((el,html)=>{el.innerHTML=html},fs.readFileSync(path.join(artifacts,`navigation-${lang}-eur-${version}.html`),'utf8'));
                await page.addScriptTag({content:jquery}); await page.addScriptTag({content:methodSetup});
                await page.evaluate(()=>document.fonts.ready);
                assert.equal(await page.evaluate(()=>document.fonts.check('15px "Open Sans"') && document.fonts.check('35px icomoon')),true,'Actual fonts loaded');
                await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
                const tree = await page.locator('.top-menu').evaluate(el=>{
                    const visit = n=>n.nodeType===3 ? (n.textContent.replace(/\s+/g,' ').trim() || null) : n.nodeType===1 ? [n.tagName,Object.fromEntries([...n.attributes].map(a=>[a.name,a.value]).sort()),[...n.childNodes].map(visit).filter(v=>v!==null)] : null;
                    return visit(el);
                });
                const nodeCounts = await page.locator('.top-menu').evaluate(el=>{
                    const counts={elements:0,textNodes:0,whitespaceTextNodes:0,total:0};
                    const walker=document.createTreeWalker(el,NodeFilter.SHOW_ALL);
                    for(let node=walker.currentNode;node;node=walker.nextNode()) {
                        counts.total++;
                        if(node.nodeType===1)counts.elements++;
                        if(node.nodeType===3){counts.textNodes++;if(!node.textContent.trim())counts.whitespaceTextNodes++;}
                    }
                    return counts;
                });
                const measure = ()=>page.locator('.top-menu, .top-menu *').evaluateAll(es=>es.map(e=>{
                    const r=e.getBoundingClientRect(), s=getComputedStyle(e);
                    return {tag:e.tagName, x:r.x,y:r.y,width:r.width,height:r.height,display:s.display,visibility:s.visibility,font:s.font,color:s.color};
                }));
                const settle = ()=>page.evaluate(async()=>{
                    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
                    await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>{})));
                });
                await settle();
                const closed = await measure();
                if (width < 992) {
                    await page.locator('.btn-mobile-nav[data-eg-param="html,menu-open"]').click();
                    assert.equal(await page.locator('html').evaluate(e=>e.classList.contains('menu-open')),true);
                    await page.locator('.top-menu > .cat-4814 > a [data-eg-open-ddown]').click();
                    assert.equal(await page.locator('.top-menu > .cat-4814').evaluate(e=>e.classList.contains('ddown-open')),true);
                } else await page.locator('.top-menu > .cat-4814 > a').hover();
                await settle();
                const opened = await measure();
                let screenshot = null;
                if (['de','fr'].includes(lang)) {
                    screenshot = `navigation-${lang}-${width}-${version}.png`;
                    await page.screenshot({path:path.join(artifacts,screenshot),animations:'disabled'});
                }
                if (width < 992) {
                    await page.locator('.top-menu > .cat-4814 [data-eg-back-ddown]').click();
                    assert.equal(await page.locator('.top-menu > .cat-4814').evaluate(e=>e.classList.contains('ddown-open')),false);
                    await page.locator('.top-menu > .cat-4103 > a [data-eg-open-ddown]').click();
                    assert.equal(await page.locator('.top-menu > .cat-4103').evaluate(e=>e.classList.contains('ddown-open')),true);
                    await page.locator('.top-menu > .cat-4103 [data-eg-back-ddown]').click();
                    assert.equal(await page.locator('.top-menu > .cat-4103').evaluate(e=>e.classList.contains('ddown-open')),false);
                    await page.locator('.top-menu > .cat-4814 > a [data-eg-open-ddown]').click();
                }
                const target = await page.locator('.top-menu > .cat-4814 > a').getAttribute('href');
                await Promise.all([page.waitForURL('https://navigation.test'+target),page.locator('.top-menu > .cat-4814 .menuShowAll').click()]);
                assert.equal(groupDataRequests,0,'Menu must not add category data requests');
                results.push({version,tree,nodeCounts,closed,opened,requests,groupDataRequests,target,screenshot,
                    screenshotSha:screenshot?sha(fs.readFileSync(path.join(artifacts,screenshot))):null});
                await page.close();
            }
            assert.deepEqual(results[1].tree,results[0].tree,`${lang}/${width} native browser DOM`);
            assert.deepEqual(results[1].closed,results[0].closed,`${lang}/${width} closed layout`);
            assert.deepEqual(results[1].opened,results[0].opened,`${lang}/${width} opened layout`);
            assert.equal(results[1].target,results[0].target,`${lang}/${width} Show all destination`);
            assert.equal(results[1].screenshotSha,results[0].screenshotSha,`${lang}/${width} pixel comparison`);
            rows.push({language:lang,width,status:'PASS',elements:results[1].closed.length,nativeHeaderFixture:file,
                nodesBefore:results[0].nodeCounts,nodesAfter:results[1].nodeCounts,
                checks:['DOM/attributes/texts/order identical','closed/open geometry and computed styles identical','Show all target identical',...(width<992?['native open/back methods: first and last submenu']:[])],
                screenshotBefore:results[0].screenshot,screenshotAfter:results[1].screenshot,pixelsIdentical:results[0].screenshot?true:null,
                requestsBefore:results[0].requests,requestsAfter:results[1].requests,addedGroupDataRequests:0});
        }
        assert.deepEqual(errors,[],'Browser script errors');
        fs.writeFileSync(reportPath,JSON.stringify({status:'PASS',kind:'OFFLINE_RECORDED_HEADER_WITH_ACTUAL_CSS_NAVIGATION_MARKUP_AND_HANDLER_METHODS',browser:browser.version(),rows,errors,
            limits:['Uses recorded headers and local fonts/logo, no network or native backend.', 'Only navigation helper methods and explicit event-binding fixture execute; full-theme script integration tested separately.', 'No native CWV or complete authenticated user journey claim.']},null,2));
        console.log(JSON.stringify({status:'PASS',pairs:rows.length,pixelPairs:rows.filter(r=>r.pixelsIdentical).length,browserErrors:errors.length}));
    } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
