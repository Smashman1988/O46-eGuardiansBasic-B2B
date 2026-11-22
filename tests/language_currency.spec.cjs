const { test, expect, origin } = require('./cross-browser/storefront.cjs');

const paths = {
    de: '/alle-artikel/', en: '/en/all-articles/', fr: '/fr/tous-les-articles/',
    it: '/it/tutti-gli-articoli/', es: '/es/todos-los-articulos/'
};
const picker = '[data-eg-language-switch]';
const choices = '.dynamicModal a[hreflang]';

async function setRoutes(page, query, englishURL) {
    await page.evaluate(({paths, query, englishURL}) => {
        document.head.querySelectorAll('link[hreflang]').forEach(link => link.remove());
        for (const [lang, path] of Object.entries(paths)) {
            const link = document.createElement('link');
            link.rel = 'alternate';
            link.hreflang = lang;
            link.href = lang === 'en' && englishURL ? englishURL : path + query;
            document.head.append(link);
        }
    }, {paths, query, englishURL});
}

function languageResponse(query, englishURL) {
    return Object.keys(paths).map(lang => {
        const path = lang === 'de' ? '/' : '/' + lang + '/';
        const href = lang === 'en' && englishURL ? englishURL : path + query;
        return '<a hreflang="' + lang + '" href="' + href.replaceAll('&', '&amp;') + '">' + lang + '</a>';
    }).join('');
}

const cases = [
    {name:'A · EUR without parameter'},
    {name:'B · currency only in the widget', widget:'?currency=USD', want:'USD'},
    {name:'C · currency only on the page', page:'?currency=USD', want:'USD'},
    {name:'D · explicit page currency wins', page:'?currency=CHF', widget:'?currency=USD', route:'?currency=GBP', want:'CHF'},
    {name:'D · IO currency before widget fallback', widget:'?currency=USD', route:'?Currency=GBP', want:'GBP'},
    {name:'E · encoded query, sorting and repeated currency aliases', page:'?query=C%2B%2B+%26+Gr%C3%BCn&sorting=name_desc&ShipToCountry=1',
     widget:'?currency=%75sd&currency=GBP&Currency=CHF&extra=ignore', want:'USD'},
    {name:'E · invalid page value and valid widget value', page:'?currency=INVALID', widget:'?Currency=usd', want:'USD'},
    {name:'E · unsupported code and malformed values', page:'?currency=123', widget:'?currency=ZZZ&Currency=12'},
    {name:'E · canonical duplicates and alternate case', route:'?currency=GBP&Currency=USD&currency=JPY', want:'GBP'},
    {name:'E · external IO route unavailable', englishRoute:'https://other.example/en/', blocked:true},
    {name:'E · external widget link unavailable', englishWidget:'https://other.example/en/?currency=USD', blocked:true}
];

for (const sample of cases) {
    test(sample.name, async ({page,shop}, info) => {
        await shop.open(paths.de + (sample.page || ''));
        await setRoutes(page, sample.route || '', sample.englishRoute);
        let loads = 0;
        await page.route('**/getShopBuilderContent/**', route => {
            expect(route.request().method()).toBe('GET');
            expect(new URL(route.request().url()).searchParams.get('categoryId')).toBe('5640');
            loads++;
            return route.fulfill({json:{data:{description1:languageResponse(sample.widget || '', sample.englishWidget)}}});
        });
        const network = [];
        page.on('request', req => {
            if (['xhr','fetch','document'].includes(req.resourceType())) network.push(req);
        });
        const start = page.url();
        await page.locator(picker).click();
        const links = page.locator(choices);
        await expect(links).toHaveCount(5);
        const audit = [];
        for (const [lang, path] of Object.entries(paths)) {
            const link = links.and(page.locator('[hreflang="' + lang + '"]'));
            if (sample.blocked && lang === 'en') {
                await expect(link).toHaveAttribute('aria-disabled','true');
                const href = await link.getAttribute('href');
                expect(!href || new URL(href, origin).origin === origin).toBe(true);
                await link.click({force:true});
                expect(page.url()).toBe(start);
                audit.push([lang,'unavailable']);
                continue;
            }
            const target = new URL(await link.getAttribute('href'));
            expect(target.origin).toBe(origin);
            expect(target.pathname).toBe(path);
            const amounts = [...target.searchParams].filter(([k]) => k.toLowerCase() === 'currency');
            expect(amounts).toEqual(sample.want ? [['currency',sample.want]] : []);
            expect(target.searchParams.has('extra')).toBe(false);
            if (sample.page?.includes('sorting=')) {
                expect(target.searchParams.get('query')).toBe('C++ & Grün');
                expect(target.searchParams.get('sorting')).toBe('name_desc');
                expect(target.searchParams.get('ShipToCountry')).toBe('1');
            }
            audit.push([lang,target.pathname+target.search]);
        }
        expect(page.url()).toBe(start);
        expect(loads).toBe(1);
        expect(network.map(req=>new URL(req.url()).pathname)).toEqual(['/getShopBuilderContent/']);
        if (sample.name.startsWith('B ·')) {
            const to = origin + paths.en + '?currency=USD';
            await page.route(to, route => route.fulfill({contentType:'text/html', body:'<html lang="en"><title>Local English category</title></html>'}));
            await links.and(page.locator('[hreflang="en"]')).click();
            await expect(page).toHaveURL(to);
            expect(network.filter(req => req.isNavigationRequest()).length).toBe(1);
        } else {
            await page.keyboard.press('Escape');
            await expect(page.locator('.dynamicModal')).toBeHidden();
            await expect(page.locator(picker)).toBeFocused();
        }
        await info.attach('language-routes', {body:JSON.stringify({start,links:audit,loads}), contentType:'application/json'});
    });
}

test('FR · flag click before and after window.load', async ({page,shop}, info) => {
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/flags/4x3/fr.svg', async route => {
        await gate;
        await route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg"/>'});
    });
    let loads = 0;
    await page.route('**/fr/getShopBuilderContent/**', route => {
        loads++;
        return route.fulfill({json:{data:{description1:languageResponse('')}}});
    });
    try {
        await page.goto(origin+'/fr/category/',{waitUntil:'domcontentloaded'});
        const flag = page.locator(picker+' img');
        const probe = await flag.evaluate(img => {
            const r = img.getBoundingClientRect();
            return {phase:document.readyState, enabled:!img.closest('button').disabled,
                hit:img.closest('button').contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),
                handler:typeof window.eGuardians?.events?.modalContent};
        });
        expect(probe).toEqual({phase:'interactive',enabled:true,hit:true,handler:'function'});
        await flag.click();
        await expect(page.locator(choices)).toHaveCount(5,{timeout:2500});
        expect(loads).toBe(1);
        await page.locator('.dynamicModal .close').click();
        await expect(page.locator(picker)).toBeFocused();
        release();
        await expect(page.locator('body')).toHaveAttribute('data-ready','1');
        await flag.click();
        await expect(page.locator(choices)).toHaveCount(5);
        expect(loads).toBe(2);
        await page.keyboard.press('Escape');
        await expect(page.locator(picker)).toBeFocused();
        await info.attach('early-click',{body:JSON.stringify({probe,loads}),contentType:'application/json'});
    } finally { release(); }
});

