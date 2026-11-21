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
    await act(page.locator('.facet-remove-all'),hasTouch);await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(0);
    await page.goBack();await expect(page.locator('[data-eg-remove-facet]')).toHaveCount(2);
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
    const geometry=await cards.evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,border:getComputedStyle(el).borderTopColor};}));
    expect(geometry[1].x).toBeGreaterThanOrEqual(geometry[0].right);
    expect(geometry[0].y).toBeCloseTo(geometry[1].y,0);
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
test('Infinite Scroll lädt Folgeartikel einmal und verankert den Verlauf',async({page,shop})=>{
    await shop.open('/');
    await shop.open('/scroll/');
    await expect(page.locator('.cat-item')).toHaveCount(6);
    await page.locator('.view-more-button').scrollIntoViewIfNeeded();
    await expect(page.locator('.cat-item')).toHaveCount(12);
    const ids=await page.locator('.cat-item').evaluateAll(cards=>cards.map(c=>c.dataset.egItem));
    expect(new Set(ids).size).toBe(12);
    await page.locator('.cat-item').last().scrollIntoViewIfNeeded();
    await expect(page).toHaveURL(/page=2/);
    expect(shop.requests.filter(r=>r[2]==='/scroll/')).toHaveLength(2);
    await page.goBack();await expect(page).toHaveURL('https://storefront.test/');
    await page.goForward();await expect(page).toHaveURL(/page=2/);
});
test('Quickview schließt per X und Escape, wechselt Produkt und gibt Fokus zurück',async({page,shop,hasTouch})=>{
    await shop.open();
    const buttons=page.locator('.cat-item .linkabso'), modal=page.locator('.modal-cross');
    for(const [index,mode] of [[0,'schnell'],[1,'escape'],[0,'x']]){
        const trigger=buttons.nth(index);await act(trigger,hasTouch);
        await expect(modal.locator('h1')).toHaveText('Artikel /product-'+(10001+index)+'/');
        await expect(page.locator('.modal.show')).toHaveCount(1);
        if(mode==='escape'){await expect.poll(()=>page.evaluate(()=>O46Core.quickview.phase)).toBe('shown');await page.keyboard.press('Escape');}
        else if(mode==='schnell' && !hasTouch) await pressCloseDuringEntrance(page);
        else await act(modal.locator('.close'),hasTouch);
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
    await act(page.locator('.eg-gallery-expand'),hasTouch);await expect(page.locator('.mz-expand')).toBeVisible();
    await act(page.locator('.mz-expand .mz-button-close'),hasTouch);await expect(page.locator('.mz-expand')).toHaveCount(0);
    await page.evaluate(() => {
        window.zoomOpenCount = 0;
        MagicZoom.registerCallback('onExpandOpen', () => { window.zoomOpenCount++; });
    });
    for (const [index, key] of ['Enter', 'Space'].entries()) {
        await page.locator('.eg-gallery-expand').press('Enter');
        await expect.poll(() => page.evaluate(() => window.zoomOpenCount)).toBe(index + 1);
        await page.locator('.mz-expand .mz-button-close').press(key);
        await expect(page.locator('.mz-expand')).toHaveCount(0);
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

