// node tests/premium_header.cjs <render-directory> [--baseline] [--probe]
// Runs real rendered Twig, production CSS and unchanged production JS in Chromium.
// Local HTTP responses stand in for Plenty services; no request reaches a live shop.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const directory = path.resolve(process.argv[2]);
const baseline = process.argv.includes('--baseline');
const probe = process.argv.includes('--probe');
const integration = process.argv.includes('--integration');
const sticky = process.argv.includes('--sticky');
const boundaries = process.argv.includes('--boundaries');
const widths = probe ? [1440, 992, 390, 320] : boundaries ? [575,576,577,767,769,1201,1401,1681,1901,2501] : sticky ? [2560,1920,1600,1440,1366,1280,1200,1024,992,991,768,430,390,375,320] : [2560,1920,1600,1440,1366,1280,1200,1024,992,991,768,430,390,375,320,993,1199,1399,1400,1679,1680,1899,1900,2499,2500];
const report = { baseline, cases: [], assertions: 0, pageErrors: [], consoleErrors: [], missingResources: [], serviceRequests: [], externalRequests: [], plentyONE: 'NOT_RUN' };
function check(ok, message) { assert.ok(ok, message); report.assertions++; }
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/fixture-ceres/')) {
        // Ceres is not installed locally. Its flag is an explicit fixture.
        res.writeHead(200, {'Content-Type': 'image/svg+xml'});
        return res.end('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="24"><path fill="#222" d="M0 0h32v8H0z"/><path fill="#c22" d="M0 8h32v8H0z"/><path fill="#fc4" d="M0 16h32v8H0z"/></svg>');
    }
    let file = url.pathname.startsWith('/resources/') ? path.join(root, url.pathname) : path.join(directory, url.pathname);
    if (file.startsWith(root + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
        const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.woff':'font/woff','.json':'application/json'};
        res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
        return fs.createReadStream(file).pipe(res);
    }
    if (/autocomplete|loginPreview|getShopBuilderContent/.test(url.pathname)) {
        report.serviceRequests.push(req.url);
        res.writeHead(200, {'Content-Type':'application/json; charset=utf-8'});
        const data=url.pathname.includes('autocomplete') ? {item:[{label:'Local test shoe',url:'/fixture-product/',image:'/resources/images/b2b-outlet46-logo.png'}],category:[],suggestion:[]} : '<p>Local service fixture: PlentyONE NOT_RUN</p>';
        return res.end(JSON.stringify({data}));
    }
    if (!path.extname(url.pathname)) {
        report.serviceRequests.push(req.url);
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        return res.end('<h1>Local navigation destination: PlentyONE NOT_RUN</h1>');
    }
    report.missingResources.push(req.url);
    res.writeHead(404); res.end('Missing local resource');
});
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    const browser = await chromium.launch({headless: true, ...(process.env.O46_BROWSER_EXECUTABLE ? {executablePath:process.env.O46_BROWSER_EXECUTABLE} : {})});
    try {
        for (const language of integration ? [] : sticky ? ['de'] : probe ? ['de', 'fr'] : ['de','en','fr','it','es']) {
            for (const width of widths) {
                const name = `${language}-${width}`;
                const context = await browser.newContext({viewport:{width,height:900}});
                const page = await context.newPage();
                page.on('pageerror', e => report.pageErrors.push({name, error:e.message, stack:e.stack}));
                page.on('console', m => { if(m.type()==='error') report.consoleErrors.push({name,error:m.text()}); });
                await page.route('**/*', route => {
                    if (route.request().url().startsWith(origin)) return route.continue();
                    report.externalRequests.push(route.request().url()); return route.abort();
                });
                await page.goto(`${origin}/${language}-home-EUR.html`);
                await page.evaluate(() => document.fonts.ready);
                await delay(80);
                const metrics = await page.evaluate(() => {
                    const rect = e => { const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}; };
                    const header=document.querySelector('#page-header'), nav=document.querySelector('#page-header2'), bar=document.querySelector('.top-top-bar');
                    return {header:rect(header),nav:rect(nav),trustbar:rect(bar),total:rect(bar).bottom,overflow:document.documentElement.scrollWidth>innerWidth,
                        sticky:getComputedStyle(header).position, search:rect(document.querySelector('.search-box')),
                        utilities:[...document.querySelectorAll('.lang-switcher, .lang-switcher > *, .lang-switcher img')].map(e=>({tag:e.tagName,class:e.className,rect:rect(e),css:{width:getComputedStyle(e).width,minWidth:getComputedStyle(e).minWidth,flex:getComputedStyle(e).flex}})),
                        categories:[...document.querySelectorAll('.top-menu > li')].map(e=>({id:e.className,text:e.querySelector('.nav-cat-name').textContent,rect:rect(e.querySelector('a'))})),
                        hamburger:getComputedStyle(document.querySelector('[data-eg-param="html,menu-open"]')).display};
                });
                report.cases.push({language,width,...metrics});
                if (probe || widths.indexOf(width) < 15) {
                    await page.screenshot({path:path.join(directory,`${language}-${width}.png`)});
                    await page.screenshot({path:path.join(directory,`${language}-${width}-header.png`),clip:{x:0,y:0,width,height:Math.ceil(metrics.total)}});
                }
                if (sticky) {
                    await page.evaluate(()=>window.scrollTo(0,500));
                    await delay(80);
                    const top=await page.locator('#page-header').evaluate(e=>e.getBoundingClientRect().top);
                    check(metrics.sticky==='sticky' ? Math.abs(top)<=1 : top<0,`${name}: actual scroll behavior matches existing sticky positioning`);
                    await page.evaluate(()=>window.scrollTo(0,0));
                    if(!baseline && width===1440) {
                        await page.locator('.top-menu > .cat-4103 > a').hover();
                        await page.locator('.top-menu > .cat-4103 > .ddown-wrap').waitFor({state:'visible'});
                        await page.screenshot({path:path.join(directory,'de-1440-dropdown.png')});
                    }
                }
                if (!baseline && !probe && !sticky) {
                    check(metrics.categories.length===11, `${name}: eleven shared categories`);
                    check(!metrics.overflow, `${name}: no page overflow`);
                    if (width >= 992) {
                        check(metrics.utilities.filter(u=>u.tag==='IMG'&&u.class==='margin-right-10').every(img=>img.rect.right<=metrics.utilities.find(u=>u.tag==='BUTTON').rect.x),`${name}: review does not overlap selectors`);
                        check(metrics.hamburger==='none', `${name}: desktop only`);
                        check(metrics.nav.height>=56 && metrics.nav.height<=64, `${name}: compact navigation ${metrics.nav.height}`);
                        const rows=[...new Set(metrics.categories.map(c=>c.rect.y))];
                        check(rows.length===2, `${name}: exactly two rows`);
                        check(metrics.categories.slice(0,6).every(c=>c.rect.y===rows[0]) && metrics.categories.slice(6).every(c=>c.rect.y===rows[1]), `${name}: six/five split`);
                        check(metrics.categories.every(c=>c.rect.x>=0 && c.rect.right<=width),`${name}: category boxes inside viewport`);
                        check(await page.locator('.top-menu > li > a').evaluateAll(links=>links.every(a=>{const text=a.querySelector('.nav-cat-name'),r=document.createRange();r.selectNodeContents(text);const t=r.getBoundingClientRect(),b=a.getBoundingClientRect();return t.left>=b.left && t.right<=b.right && t.top>=b.top && t.bottom<=b.bottom;})), `${name}: labels not clipped`);
                        for (const item of await page.locator('.top-menu > .eg-ddown').all()) {
                            const link=item.locator(':scope > a'), dropdown=item.locator(':scope > .ddown-wrap');
                            await link.hover();
                            await dropdown.waitFor({state:'visible'});
                            check(await dropdown.isVisible(),`${name}: hover dropdown`);
                            const box=await dropdown.boundingBox();
                            check(Math.abs(box.y-metrics.nav.bottom)<=1 && box.x>=0 && box.x+box.width<=width+1,`${name}: dropdown below both rows`);
                            // Follow a vertical mouse path into a first-row dropdown through row two.
                            const top=await link.boundingBox();
                            await page.mouse.move(top.x+top.width/2,box.y+8,{steps:3});
                            check(await dropdown.isVisible(),`${name}: continuous hover path`);
                            await page.mouse.move(1,800);
                            await link.focus();
                            check(await dropdown.isVisible(),`${name}: keyboard dropdown`);
                            await page.keyboard.press('Tab');
                            check(await item.evaluate(e=>e.contains(document.activeElement) && document.activeElement.closest('.ddown-wrap')),`${name}: Tab reaches submenu`);
                            await page.locator('.search-box input').focus();
                        }
                    } else {
                        check(metrics.hamburger!=='none',`${name}: hamburger present`);
                        await page.locator('[data-eg-param="html,menu-open"]').first().click();
                        await delay(350);
                        check(await page.evaluate(()=>document.documentElement.classList.contains('menu-open') && getComputedStyle(document.documentElement).overflow==='hidden'),`${name}: menu opens and scroll locks`);
                        const home=page.locator('.top-menu > .cat-4103');
                        await home.locator('[data-eg-open-ddown]').click();
                        await delay(350);
                        check(await home.evaluate(e=>e.classList.contains('ddown-open')),`${name}: Home submenu opens`);
                        check(await home.locator('.cat-1385 a').isVisible(),`${name}: Home subcategory visible`);
                        if (width===390) await page.screenshot({path:path.join(directory,`${language}-${width}-magic-home.png`)});
                        await home.locator('[data-eg-back-ddown]').click();
                        check(await home.evaluate(e=>!e.classList.contains('ddown-open')),`${name}: back works`);
                        await page.locator('.top-menu-wrapper .basket-prev-close').click();
                        check(await page.evaluate(()=>!document.documentElement.classList.contains('menu-open') && getComputedStyle(document.documentElement).overflow!=='hidden'),`${name}: closes and unlocks`);
                        await page.locator('[data-eg-param="html,search-open"]').click();
                        await delay(350);
                        check(await page.locator('.search-box input').isVisible(),`${name}: search opens`);
                    }
                }
                await context.close();
            }
            console.log(`${language}: ${widths.length} widths checked`);
        }
        if (integration) for (const language of ['de','en','fr','it','es']) {
            for (const mode of ['home','category','item','checkout','vue-category']) {
                for (const width of [1440,390]) {
                    const name=`${language}-${mode}-${width}-USD`;
                    const context=await browser.newContext({viewport:{width,height:900}});
                    const page=await context.newPage();
                    page.on('pageerror',e=>report.pageErrors.push({name,error:e.message}));
                    page.on('console',m=>{if(m.type()==='error')report.consoleErrors.push({name,error:m.text()});});
                    await page.route('**/*',route=>{
                        if(route.request().url().startsWith(origin))return route.continue();
                        report.externalRequests.push(route.request().url());return route.abort();
                    });
                    const url=`${origin}/${language}-${mode}-USD.html`;
                    await page.goto(url);
                    await page.evaluate(()=>document.fonts.ready);
                    check(await page.locator('.top-menu').count()===1,`${name}: one shared menu`);
                    if(width>=992) {
                        const colors=await page.evaluate(()=>{
                            const deal=getComputedStyle(document.querySelector('.top-menu > .cat-6425 .nav-cat-name'));
                            const home=getComputedStyle(document.querySelector('.top-menu > .cat-4103 > a'));
                            return {deal:deal.color,home:home.color,border:home.borderWidth,decoration:home.textDecorationLine};
                        });
                        check(colors.deal==='rgb(255, 77, 77)' && colors.home==='rgb(255, 255, 255)' && colors.border==='0px' && colors.decoration==='none',`${name}: red deals, white Home, no accent border/underline`);
                    }
                    const currencyLinks=await page.locator('.top-menu a[href^="/"]').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
                    check(currencyLinks.every(href=>href.endsWith('?currency=USD')),`${name}: currency on every category link`);
                    const handlerAttributes=await page.locator('#page-header [data-eg-handler]').evaluateAll(elements=>elements.map(e=>Object.fromEntries([...e.attributes].filter(a=>a.name.startsWith('data-')).map(a=>[a.name,a.value]))));
                    check(handlerAttributes.some(a=>a['data-eg-param']==='html,menu-open') && handlerAttributes.some(a=>a['data-eg-href']?.endsWith('/loginPreview/')),`${name}: retained control handlers`);
                    for(const selector of ['.btn-login-open','.lang-switcher button[data-eg-title="Currency"]','.lang-switcher button[aria-label]']) {
                        const button=page.locator(selector);
                        const route=await button.getAttribute('data-eg-href');
                        const response=page.waitForResponse(r=>r.url().includes(route));
                        await button.click();await response;
                        await page.locator('.dynamicModal .modal-body').getByText('Local service fixture: PlentyONE NOT_RUN',{exact:true}).waitFor();
                        check(await page.locator('.dynamicModal').isVisible(),`${name}: ${selector} opens existing modal via unchanged JS`);
                        await page.locator('.dynamicModal [data-dismiss]').click();
                        await page.locator('.dynamicModal').waitFor({state:'hidden'});
                    }
                    if(mode!=='vue-category') {
                        if(width<992)await page.locator('[data-eg-param="html,search-open"]').click();
                        const input=page.locator('[data-eg-livesearch]');
                        const response=page.waitForResponse(r=>r.url().includes('/rest/io/item/search/autocomplete/'));
                        await input.fill('test shoe');await response;
                        await page.locator('.row-search-wrap .list-autocomplete a').waitFor();
                        check(await page.locator('.row-search-wrap').isVisible(),`${name}: live-search request and rendering`);
                        const liveBox=await page.locator('.row-search-wrap').boundingBox();
                        check(liveBox.x>=-1 && liveBox.x+liveBox.width<=width+1,`${name}: live-search fits viewport`);
                        await input.fill('query-check');
                        await page.locator('.btn-set-search').click();
                        await page.waitForURL(u=>u.pathname.endsWith('/search/'));
                        check(new URL(page.url()).searchParams.get('query')==='query-check',`${name}: search form preserves query URL`);
                        await page.goto(url);
                    } else check(await page.locator('[data-eg-livesearch]').count()===0,`${name}: pre-existing Vue-category search condition`);
                    const wishlist=page.locator('.wishlist-link');
                    const wishlistHref=await wishlist.getAttribute('href');
                    await wishlist.click();await page.waitForURL(new URL(wishlistHref,origin).href);
                    check(page.url()===new URL(wishlistHref,origin).href,`${name}: wishlist destination`);
                    await page.goto(url);
                    const basket=page.locator('.icon-online-shopping-cart').locator('..');
                    const basketHref=await basket.getAttribute('href');
                    await basket.click();await page.waitForURL(new URL(basketHref,origin).href);
                    check(page.url()===new URL(basketHref,origin).href && basketHref.endsWith('?currency=USD'),`${name}: basket destination and currency`);
                    await page.goto(url);
                    if(width<992) {
                        await page.locator('[data-eg-param="html,menu-open"]').first().click();
                        await page.locator('.top-menu > .cat-4103 [data-eg-open-ddown]').click();
                        const sub=page.locator('.top-menu > .cat-4103 .cat-1385 a');
                        const href=await sub.getAttribute('href');
                        await sub.click();await page.waitForURL(new URL(href,origin).href);
                        check(page.url()===new URL(href,origin).href,`${name}: actual Home child navigation`);
                    } else {
                        const home=page.locator('.top-menu > .cat-4103 > a');
                        const href=await home.getAttribute('href');
                        await home.focus();await page.keyboard.press('Enter');await page.waitForURL(new URL(href,origin).href);
                        check(page.url()===new URL(href,origin).href,`${name}: keyboard navigation follows Home link`);
                    }
                    report.cases.push({language,mode,width,status:'PASS'});
                    await context.close();
                }
            }
            console.log(`${language}: five page modes, desktop/mobile controls checked`);
        }
        check(report.pageErrors.length===0, 'zero browser runtime errors');
        check(report.consoleErrors.length===0, 'zero browser console errors');
        check(report.missingResources.length===0, 'zero missing local resources');
        check(report.externalRequests.length===0, 'zero external requests');
    } finally {
        await browser.close(); server.close();
        fs.writeFileSync(path.join(directory,integration?'integration-report.json':sticky?'sticky-report.json':probe?'browser-probe.json':boundaries?'boundary-report.json':'browser-report.json'),JSON.stringify(report,null,2));
        console.log(JSON.stringify({cases:report.cases.length,assertions:report.assertions,pageErrors:report.pageErrors.slice(0,8),consoleErrors:report.consoleErrors.slice(0,8),missingResources:[...new Set(report.missingResources)],externalRequests:report.externalRequests.length,plentyONE:report.plentyONE}));
    }
})().catch(e=>{server.close();console.error(e);process.exitCode=1;});
