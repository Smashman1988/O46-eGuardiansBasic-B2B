const {test,expect} = require('./storefront.cjs');
const {pressCloseDuringEntrance} = require('../quickview_pointer.cjs');
const act = (locator,touch) => touch ? locator.tap() : locator.click();

test('Mehrfachfilter, Anwenden, Rücksetzen und History',async({page,shop,hasTouch})=>{
    await shop.open();
    const mobile=await page.evaluate(()=>matchMedia('(max-width:991.98px)').matches);
    if(mobile) await act(page.getByRole('button',{name:'Filter öffnen'}),hasTouch);
    for(const group of shop.groups){
        const box=page.locator('[data-eg-facet-group="'+group.id+'"]');
        const title=box.locator('[data-eg-facet-toggle]');
        await act(title,hasTouch);
        const check=box.locator('.facet-item-value-chk').first();
        await act(box.locator('label[for="'+await check.getAttribute('id')+'"]'),hasTouch);
        await expect(check).toBeChecked();
        await act(title,hasTouch);
    }
    const apply=page.locator(mobile?'.wrap-filter-mobile .btnfilter-mobile-bottom':'.btnfilter-desktop');
    await expect(apply).toBeEnabled();await act(apply,hasTouch);
    await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(2);
    await expect(page.locator('.category-product-list .cat-item')).toHaveCount(1);
    await page.reload();await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(2);
    await act(page.locator('.facet-remove-all'),hasTouch);await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(0);
    await expect(page.locator('.category-product-list .cat-item')).toHaveCount(6);
    await page.goBack();await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(2);
    await expect(page.locator('.category-product-list .cat-item')).toHaveCount(1);
    await page.goForward();await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(0);
});
test('LiveShopping-Karten, Raster, Bilder, Logo, Bewertung und Fokus',async({page,shop,hasTouch})=>{
    await shop.open('/');
    const cards=page.locator('.category-product-list .cat-item');await expect(cards).toHaveCount(6);
    const first=cards.first();
    await first.scrollIntoViewIfNeeded();
    await expect.poll(()=>first.locator('picture img').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
    await expect.poll(()=>first.locator('.cat-logo').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
    await expect(first.locator('.item-ratings-head')).toBeVisible();
    await expect(first.locator('.cat-item-sizes')).toBeVisible();
    await expect(first.locator('.i-action-sale')).toBeVisible();
    const geometry=await cards.evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,border:getComputedStyle(el).borderTopColor};}));
    expect(geometry[1].x).toBeGreaterThanOrEqual(geometry[0].right);
    expect(geometry[0].y).toBeCloseTo(geometry[1].y,0);
    expect(geometry[0].right-geometry[0].x).toBeCloseTo(geometry[1].right-geometry[1].x,0);
    const row=geometry.filter(card=>Math.abs(card.y-geometry[0].y)<1);
    const rightMargin=await page.evaluate(()=>document.documentElement.clientWidth)-row.at(-1).right;
    expect(geometry[0].x).toBeGreaterThanOrEqual(0);
    expect(Math.abs(geometry[0].x-rightMargin),'Außenabstände des Rasters').toBeLessThanOrEqual(2);
    expect(geometry[0].border).toBe('rgba(0, 0, 0, 0)');
    const action=first.locator('.linkabso');await action.focus();await expect(action).toBeFocused();
    if(!hasTouch){await action.hover();expect(await action.evaluate(el=>el.matches(':hover'))).toBe(true);}
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});
test('Header-Suche, Vorschlag, Ergebnisse, Nulltreffer und History',async({page,shop,hasTouch})=>{
    await shop.open();
    const input=page.locator('[data-eg-livesearch]');
    const reveal=async()=>{if(await page.getByLabel('Suche öffnen').isVisible()) await act(page.getByLabel('Suche öffnen'),hasTouch);};
    await reveal();await input.fill('Lauf');
    const suggestion=page.getByRole('option').getByRole('link',{name:'Laufschuh'});
    await act(suggestion,hasTouch);await expect(page).toHaveURL(/search\/\?query=Laufschuh/);
    await expect(page.locator('.cat-item')).toHaveCount(6);
    expect(shop.requests.filter(r=>r[2].includes('/autocomplete/'))).toHaveLength(1);
    await reveal();await input.fill('Nulltreffer');await input.press('Enter');
    await expect(page.getByText('Keine Treffer',{exact:true})).toBeVisible();await expect(page.locator('.cat-item')).toHaveCount(0);
    await page.goBack();await expect(page.locator('.cat-item')).toHaveCount(6);
});
test('Infinite Scroll lädt Folgeartikel einmal und verankert den Verlauf',async({page,shop},info)=>{
    await page.addInitScript(()=>{
        addEventListener('pageshow',e=>{window.fromCache=e.persisted;});
        addEventListener('pagehide',()=>sessionStorage.setItem('departure:'+location.pathname,String(scrollY)));
    });
    await shop.open('/');
    const setHomePosition=()=>page.evaluate(async()=>{
        await document.fonts.ready;
        scrollTo({top:180,behavior:'instant'});
        return scrollY;
    });
    const homePosition=await setHomePosition();
    expect(homePosition).toBeGreaterThan(0);
    // Control navigation through the same rendered home. Native scroll anchoring may
    // adjust the stored coordinate when a document is reconstructed (e.g. Galaxy S9+).
    await shop.open('/category/');
    await page.goBack();
    const reference=await page.evaluate(async()=>{await document.fonts.ready;return scrollY;});
    expect(reference).toBeGreaterThan(0);
    expect(await setHomePosition()).toBe(homePosition);
    await shop.open('/scroll/');
    await expect(page.locator('.cat-item')).toHaveCount(6);
    await page.locator('.view-more-button').scrollIntoViewIfNeeded();
    const cards=page.locator('.cat-item');
    await expect.poll(()=>cards.count()).toBeGreaterThanOrEqual(12);
    await cards.last().scrollIntoViewIfNeeded();
    await expect(cards).toHaveCount(18);
    const ids=await cards.evaluateAll(items=>items.map(c=>c.dataset.egItem));
    expect(new Set(ids).size).toBe(18);
    const trigger=cards.last().locator('.linkabso');
    await trigger.click();
    const modal=page.locator('.modal-cross');
    await expect(modal.locator('h1')).toHaveText('Artikel /product-30006/');
    await expect(page.locator('.modal.show')).toHaveCount(1);
    await expect.poll(()=>page.evaluate(()=>O46Core.quickview.phase)).toBe('shown');
    await page.keyboard.press('Escape');await expect(trigger).toBeFocused();
    await expect(page.locator('.modal-backdrop')).toHaveCount(0);
    expect(shop.requests.filter(r=>r[2]==='/product-30006/')).toHaveLength(1);
    await cards.last().scrollIntoViewIfNeeded();
    await expect(page).toHaveURL(/page=3/);
    const position=await page.evaluate(()=>scrollY);
    expect(position).toBeGreaterThan(0);
    expect(shop.requests.filter(r=>r[2]==='/scroll/')).toHaveLength(3);
    await page.goBack();await expect(page).toHaveURL('https://storefront.test/');
    const departure=await page.evaluate(()=>Number(sessionStorage.getItem('departure:/')));
    expect(departure).toBe(homePosition);
    await info.attach('home-history',{body:JSON.stringify({requested:homePosition,reference,departure,returned:await page.evaluate(()=>scrollY)}),contentType:'application/json'});
    await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(reference,0);
    await page.goForward();await expect(page).toHaveURL(/page=3/);
    // A BFCache restore retains appended cards; a fresh navigation renders page three.
    await expect(page.locator('[data-eg-item="30006"]')).toBeVisible();
    const restored=await page.evaluate(()=>({y:scrollY,fromCache:window.fromCache===true}));
    if(restored.fromCache) await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(position,0);
    await info.attach('scroll-history',{body:JSON.stringify({homePosition,position,restored}),contentType:'application/json'});
});
test('Quickview schließt per X und Escape, wechselt Produkt und gibt Fokus zurück',async({page,shop,hasTouch})=>{
    await shop.open();
    const buttons=page.locator('.cat-item .linkabso'), modal=page.locator('.modal-cross');
    await page.evaluate(()=>{
        document.addEventListener('pointerdown',e=>{
            if(e.target.closest('.modal-cross .close')) window.closePhase=O46Core.quickview.phase;
        },true);
    });
    for(const [index,mode] of [[0,'schnell'],[1,'escape'],[0,'x']]){
        const trigger=buttons.nth(index);await act(trigger,hasTouch);
        if(mode==='schnell') {
            await pressCloseDuringEntrance(page,hasTouch);
            expect(await page.evaluate(()=>window.closePhase)).toBe('opening');
        } else {
            await expect(modal.locator('h1')).toHaveText('Artikel /product-'+(10001+index)+'/');
            await expect(page.locator('.modal.show')).toHaveCount(1);
            await expect.poll(()=>page.evaluate(()=>O46Core.quickview.phase)).toBe('shown');
            if(mode==='escape') await page.keyboard.press('Escape');
            else await act(modal.locator('.close'),hasTouch);
        }
        await expect(modal).toBeHidden();await expect(page.locator('.modal-backdrop')).toHaveCount(0);await expect(trigger).toBeFocused();
    }
    expect(shop.requests.filter(r=>r[2]==='/assets/magiczoom.min.js')).toHaveLength(1);
});
test('Galerie, Richtung, Vorschaubild, Zähler und Zoom',async({page,shop,hasTouch})=>{
    await shop.open('/product-10001/');
    const counter=page.locator('[data-eg-gallery-counter]');
    await expect(counter).toHaveText('1 / 3');
    await expect(page.locator('#ItemImgZoom .mz-figure')).toBeVisible();
    await act(page.locator('.zoomnavright'),hasTouch);await expect(counter).toHaveText('2 / 3');
    await act(page.locator('.zoomnavleft'),hasTouch);await expect(counter).toHaveText('1 / 3');
    const thumb=page.locator('.single-prev-images a').last();
    if(await thumb.isVisible()){await act(thumb,hasTouch);await expect(counter).toHaveText('3 / 3');}
    const expand = page.locator('.eg-gallery-expand');
    const close = page.locator('.mz-expand .mz-button-close');
    await page.evaluate(() => {
        window.zoomOpenCount = 0;
        MagicZoom.registerCallback('onExpandOpen', () => { window.zoomOpenCount++; });
    });
    for (const [index, key] of ['pointer', 'Enter', 'Space', 'Escape'].entries()) {
        if (key === 'pointer') await act(expand, hasTouch);
        else await expand.press('Enter');
        await expect.poll(() => page.evaluate(() => window.zoomOpenCount)).toBe(index + 1);
        if (key === 'pointer') await act(close, hasTouch);
        else await close.press(key);
        await expect(page.locator('.mz-expand')).toHaveCount(0);
        await expect(expand).toBeFocused();
        await expect(expand).toBeInViewport();
    }
});
test('Variantenwahl aktualisiert das Galeriebild',async({page,shop,hasTouch})=>{
    await shop.open('/product-10001/');
    const row=page.locator('.eg-row[data-eg-variation-id="102"]');
    const preview=row.locator('[data-eg-color-preview]');
    await expect(preview).toBeVisible();
    await expect.poll(()=>row.getAttribute('data-eg-variation-state')).not.toBe('loading');
    await act(preview,hasTouch);
    await expect(page.locator('#ItemImgZoom')).toHaveAttribute('href',/red\.svg/);
});
test('Konto, Merkliste, Kontakt, Newsletter und Footer',async({page,shop,hasTouch})=>{
    await shop.open('/?long-page');
    const modal=page.locator('.dynamicModal');
    await act(page.getByLabel('Mein Konto öffnen'),hasTouch);
    await expect(modal.locator('h2')).toHaveText('Anmelden');await act(modal.locator('.close'),hasTouch);
    await expect(modal).toBeHidden();
    const contact=page.locator('.o46-b2b-contact-toggle');
    await act(contact,hasTouch);await expect(page.locator('#o46-b2b-contact-panel')).toBeVisible();
    await act(page.locator('.o46-b2b-contact-close'),hasTouch);await expect(contact).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('footer').first()).toBeVisible();
    await page.locator('footer a').last().scrollIntoViewIfNeeded();
    const popup=page.locator('#o46-b2b-newsletter');
    await expect(popup).toBeVisible();await act(popup.locator('button'),hasTouch);await expect(popup).toBeHidden();
    await act(page.locator('.wishlist-link').first(),hasTouch);await expect(page).toHaveURL(/category-5483\//);
});
test('Desktopmenü und kontextbezogener Sprachwechsel',async({page,shop})=>{
    await page.setViewportSize({width:1440,height:950});await shop.open();
    const nav=page.locator('.top-menu');
    const entry=nav.locator('li.eg-ddown').first();
    await entry.hover();await expect(entry.locator('a:visible').nth(1)).toBeVisible();
    await page.locator('[data-eg-language-switch]').click();const modal=page.locator('.dynamicModal');
    const english=modal.getByRole('link',{name:'English'});await expect(english).toHaveAttribute('href',/\/en\/category\//);
    await english.click();await expect(page).toHaveURL(/\/en\/category\//);
});


test('Markenfilter einzeln anwenden und nach Reload lesen',async({page,shop})=>{
    await page.setViewportSize({width:768,height:900});
    await shop.open();
    await page.getByRole('button',{name:'Filter öffnen'}).press('Enter');
    const brand=shop.groups.find(group=>group.name==='Marke');
    const group=page.locator('[data-eg-facet-group="'+brand.id+'"]');
    await group.locator('[data-eg-facet-toggle]').press('Enter');
    const input=group.locator('input[type=checkbox]').first();
    await group.locator('label[for="'+await input.getAttribute('id')+'"]').click();
    const apply=page.locator('.btnfilter-mobile-bottom');
    await expect(apply).toBeEnabled();await apply.click();
    await expect(page).toHaveURL(new RegExp('facets='+brand.values[0].id+'(?:&|$)'));
    await page.reload();
    await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(1);
    await expect(page.locator('.cat-item')).toHaveCount(2);
});
test('Suchsortierung nach Namen verwendet die neu sortierte Liste',async({page,shop})=>{
    await shop.open('/search/');
    const cards=page.locator('.category-product-list .cat-item');
    const sort=page.locator('.eg-dropdown-sort');
    await expect(cards.first()).toHaveAttribute('data-eg-item','10001');
    await sort.locator('.eg-dropdown-value').click();
    await sort.getByText('Name Z–A').click();
    await expect(page).toHaveURL(/sorting=name_desc/);
    await expect(sort.locator('.sort-val')).toHaveText('Name Z–A');
    await expect(cards.first()).toHaveAttribute('data-eg-item','10006');
});
test('Startseitenbanner und horizontaler Produktstreifen',async({page,shop})=>{
    await page.setViewportSize({width:390,height:850});
    await shop.open('/');
    const strip=page.locator('.home-slider-items');
    await expect(strip.locator('.cat-item')).toHaveCount(15);
    await strip.focus();
    await strip.locator('.cat-item').last().scrollIntoViewIfNeeded();
    await expect.poll(()=>strip.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
    const slide=page.locator('.section-slider .home-slider-main');
    await expect(slide).toHaveCount(2);
    await slide.first().getByRole('link').click();
    await expect(page).toHaveURL(/category-1\//);
});
test('Galerie mit nur einem Bild bleibt bedienbar',async({page,shop})=>{
    await shop.open('/product-10001/?single');
    await expect(page.locator('#ItemImgZoom .mz-figure')).toBeVisible();
    await expect(page.locator('[data-eg-gallery-counter]')).toBeHidden();
    await expect(page.locator('.eg-gallery-frame')).toHaveAttribute('data-eg-gallery-count','1');
    const expand=page.locator('.eg-gallery-expand');
    await page.evaluate(()=>{MagicZoom.registerCallback('onExpandOpen',()=>{window.singleZoomOpen=true;});});
    await expand.press('Enter');
    await expect.poll(()=>page.evaluate(()=>window.singleZoomOpen)).toBe(true);
    await page.locator('.mz-expand .mz-button-close').press('Escape');
    await expect(page.locator('.mz-expand')).toHaveCount(0);await expect(expand).toBeFocused();
});
const labels = {
    de:['Menü öffnen','Filter öffnen','Schließen','Artikel filtern'],
    en:['Open menu','Open filters','Close','Filter articles'],
    fr:['Ouvrir le menu','Ouvrir les filtres','Fermer','Filtrer les articles'],
    it:['Apri il menu','Apri i filtri','Chiudi','Filtra articoli'],
    es:['Abrir el menú','Abrir los filtros','Cerrar','Filtrar artículos']
};
test('Sichtbare Filtertexte, ARIA-Namen und Fokus in fünf Sprachen',async({page,shop})=>{
    await page.setViewportSize({width:768,height:900});
    for(const [lang,[menu,filter,close,caption]] of Object.entries(labels)) {
        await shop.open(lang==='de'?'/category/':'/'+lang+'/category/');
        await expect(page.locator('html')).toHaveAttribute('lang',lang);
        await expect(page.getByRole('button',{name:filter,exact:true})).toHaveText(caption);
        for(const [label,id] of [[menu,'o46-menu'],[filter,'o46-filter']]) {
            const opener=page.getByRole('button',{name:label,exact:true});
            await opener.press('Enter');
            const button=page.locator('#'+id).getByRole('button',{name:close,exact:true}).first();
            await expect(button).toBeFocused();
            await button.press('Escape');await expect(opener).toBeFocused();
        }
    }
});
