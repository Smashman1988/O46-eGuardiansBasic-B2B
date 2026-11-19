// Pass the O46_SEO_HISTORY_FIXTURES export from tests/seo_pagination.php.
// All navigation, HTML fragments and asset requests are intercepted locally.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const [fixtureFile, outputFile, assetDir = 'resources/js'] = process.argv.slice(2);
const fixtures = JSON.parse(fs.readFileSync(fixtureFile));
const rows = [];
const assets = ['jquery-3.7.1.min.js', 'core.min.js', 'cat.min.js'];
function pageValues(html) {
    const doc = html ? new DOMParser().parseFromString('<html><head>'+html+'</head></html>', 'text/html') : document;
    const tags = selector => Array.from(doc.head.querySelectorAll(selector));
    return {
        title: doc.title,
        canonical: tags('link[rel="canonical"]').map(el => el.getAttribute('href')),
        languages: tags('link[hreflang]').map(el => [el.hreflang, el.getAttribute('href'), el.dataset.egLanguageUrl]),
        routes: tags('meta[name="o46-language-route"]').map(el => [el.lang, el.content]),
        robots: tags('meta[name="robots"]').map(el => el.content),
        neighbors: tags('link[rel="prev"],link[rel="next"]').map(el => [el.rel, el.getAttribute('href')])
    };
}
async function scenario(browser, lang, mode, width = 1000) {
    const context = await browser.newContext({viewport: {width, height: 700}});
    const page = await context.newPage();
    let cases = fixtures[lang][mode];
    const search = mode === 'search', first = search ? 1 : 18, last = first + 2;
    const errors = [], requests = [], checks = [], states = [];
    let legacyFragment = false;
    page.on('pageerror', err => errors.push(err.message));
    const url = (n, kind = 'direct') => cases[n][kind].url;
    await context.route('**/*', async route => {
        const u = new URL(route.request().url()), file = path.basename(u.pathname);
        requests.push(u.pathname + u.search);
        if (u.pathname.startsWith('/assets/') && assets.includes(file)) {
            return route.fulfill({path:path.join(assetDir, file), contentType:'application/javascript'});
        }
        if (u.pathname === '/rest/io/basket/') return route.fulfill({json:{data:{itemQuantity:0, itemSum:0}}});
        assert.equal(u.pathname, new URL(url(first)).pathname, 'Unexpected request ' + u.pathname);
        const number = Number(u.searchParams.get('page') || 1), fragment = u.searchParams.has('quickViewItem');
        const value = cases[number][fragment ? 'fragment' : 'direct'];
        const head = legacyFragment && fragment ? value.head.replace(/ data-o46-history-robots="[^"]*"/,'') : value.head;
        const next = number < last ? '<a class="pagination__next" href="'+url(number+1,'fragment').replaceAll('&','&amp;')+'">Next</a>' : '';
        const items = search ? Array.from({length:24},(_,i)=>
            '<article class="post" style="height:200px" data-item="'+((number-1)*24+i+1)+'"></article>').join('')
            : '<article class="post" style="height:4800px">Page '+number+'</article>';
        return route.fulfill({contentType:'text/html; charset=utf-8',body:'<!doctype html><html lang="'+lang+'"><head>'+head+
            '</head><body><button id="totop"></button><div class="category-product-list">'+items+'</div>'+next+
            '<script>window.activeLang="'+lang+'";window.messageServiceTranslations={};</script>'+
            (fragment ? '' : assets.map(name=>'<script src="/assets/'+name+'"></script>').join(''))+'</body></html>'});
    });
    async function compare(number, label) {
        const expected = await page.evaluate(pageValues, cases[number].direct.head);
        const actual = await page.evaluate(pageValues);
        const current = new URL(page.url()), target = new URL(url(number));
        assert.equal(current.origin+current.pathname,target.origin+target.pathname);
        assert.deepEqual([...current.searchParams].sort(),[...target.searchParams].sort());
        assert.equal(expected.languages.length,cases===fixtures[lang].forced?0:5);
        assert.equal(expected.canonical.length,1);
        assert.equal(expected.robots[0], search || [fixtures[lang].filtered,fixtures[lang].sorted].includes(cases)?'NOINDEX,FOLLOW':'INDEX,FOLLOW');
        assert.deepEqual(actual,expected,lang+'/'+mode+'/'+label);
        checks.push(label);
        states.push({step:label,url:current.href,directUrl:target.href,actual,expected});
    }
    try {
        await page.goto(url(first));
        await compare(first,'direct');
        const origin = await page.evaluate(()=>performance.timeOrigin);
        if (search) {
            assert.equal(await page.locator('.post').count(),24);
            await page.evaluate(()=>window.firstItems=[...document.querySelectorAll('.post')]);
        }
        // Give back/forward a genuine same-document entry; the theme retains its
        // replace-on-scroll policy and does not itself create an entry per scroll.
        await page.evaluate(()=>history.pushState(null,'',location.href));
        for (const n of [first+1,last]) {
            if (search) {
                await page.locator('.post').last().scrollIntoViewIfNeeded();
                await page.locator('.post').nth(24*(n-1)).waitFor();
            } else {
                await page.evaluate(async()=>{await InfiniteScroll.data(document.querySelector('.category-product-list')).loadNextPage();});
            }
            await compare(n-1,'append-before-scroll-'+n);
            await page.locator('.post').nth(search ? (n-1)*24 : n-first).evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top+30));
            await page.waitForFunction(n=>new URL(location.href).searchParams.get('page')===String(n),n);
            await compare(n,'scroll-'+n);
            if (search) {
                assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);
                assert.deepEqual(await page.locator('.post').evaluateAll(es=>es.map(e=>Number(e.dataset.item))),Array.from({length:24*n},(_,i)=>i+1));
                assert.ok(await page.evaluate(()=>{
                    const items = document.querySelectorAll('.post');
                    return window.firstItems.every((el,i)=>el===items[i]);
                }));
            }
        }
        if (search) {
            await page.locator('.post').last().scrollIntoViewIfNeeded();
            assert.equal(await page.evaluate(()=>InfiniteScroll.data(document.querySelector('.category-product-list')).canLoad),false);
            assert.equal(requests.filter(r=>!r.includes('quickViewItem')&&r.startsWith(new URL(url(first)).pathname+'?')).length,1);
        }
        await page.goBack(); await compare(first,'back');
        await page.goForward(); await compare(last,'forward');
        await page.reload(); await compare(last,'reload');
        if (search) assert.equal(await page.locator('.post').count(),24);
        if (mode === 'plain') {
            for (const target of ['filtered','sorted','plain']) {
                cases = fixtures[lang][target];
                await page.goto(url(18));
                await compare(18,'navigate-'+target);
            }
        }
        assert.equal(requests.filter(r=>r.includes('quickViewItem')).length,2);
        if (mode === 'plain' && lang === 'de') {
            legacyFragment = true;
            await page.evaluate(()=>InfiniteScroll.data(document.querySelector('.category-product-list')).loadNextPage().then(()=>true));
            await compare(18,'cached-old-fragment-before-scroll');
            await Promise.all([page.waitForEvent('domcontentloaded'), page.locator('.post').nth(1).evaluate(el=>scrollTo(0,scrollY+el.getBoundingClientRect().top+30))]);
            await compare(19,'cached-old-fragment-direct-fallback');
            assert.equal(await page.locator('.post').count(),1);
        }
        assert.deepEqual(errors,[]);
        return {lang,mode,width,checks,states,fragmentRequests:requests.filter(r=>r.includes('quickViewItem')).length,status:'PASS'};
    } finally {await context.close();}
}
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try {
        for(const lang of Object.keys(fixtures)) {
            const modes = Object.keys(fixtures[lang]).filter(mode=>lang==='de' || ['plain','sorted','search'].includes(mode));
            for(const mode of modes) {
                const widths = mode==='search' ? (lang==='de' ? [390,768,1440] : [390]) : [1000];
                for (const width of widths) rows.push(await scenario(browser,lang,mode,width));
            }
        }
    } finally {await browser.close();fs.writeFileSync(outputFile,JSON.stringify(rows,null,2));}
    console.log(rows.length+' browser routes, '+rows.reduce((n,r)=>n+r.checks.length,0)+' complete direct-head comparisons PASS');
})().catch(error=>{console.error(error);process.exitCode=1;});
