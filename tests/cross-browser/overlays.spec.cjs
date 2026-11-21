const {test,expect} = require('./storefront.cjs');
const {setViewport} = require('./viewport.cjs');

function installRecorder() {
    window.panelFrames = [];
    window.observePanels = label => {
        const root=document.documentElement, focus=document.activeElement;
        const panel = (selector,state) => {
            const node=document.querySelector(selector), r=node.getBoundingClientRect(), css=getComputedStyle(node);
            const trigger=document.querySelector('[data-eg-param="html,'+state+'"]');
            return {x:r.x,right:r.right,y:r.y,bottom:r.bottom,transform:css.transform,visible:css.visibility,opacity:css.opacity,
                pointer:css.pointerEvents,z:css.zIndex,expanded:trigger.getAttribute('aria-expanded'),open:root.classList.contains(state)};
        };
        return {label,time:performance.now(),width:innerWidth,desktop:matchMedia('(min-width: 992px)').matches,visual:visualViewport?.width,screen:screen.width,dpr:devicePixelRatio,client:root.clientWidth,overflow:root.scrollWidth-root.clientWidth,
            lock:[getComputedStyle(root).overflowY,getComputedStyle(document.body).overflowY],focus:focus.id||focus.getAttribute('aria-label')||focus.tagName,
            nav:panel('.top-menu-wrapper','menu-open'),filter:panel('.wrap-filter-mobile','filter-open')};
    };
    function frame(){window.panelFrames.push(window.observePanels(window.panelPhase));window.panelRAF=requestAnimationFrame(frame);}
    frame();
}
const menu = page => page.getByRole('button',{name:'Menü öffnen',exact:true});
const filter = page => page.getByRole('button',{name:'Filter öffnen',exact:true});
async function frames(page,ms=330) {
    await page.evaluate(ms=>new Promise(resolve=>{const start=performance.now();function next(){performance.now()-start>=ms?resolve():requestAnimationFrame(next);}requestAnimationFrame(next);}),ms);
}
async function attach(page,info) {
    const data=await page.evaluate(()=>{cancelAnimationFrame(window.panelRAF);return window.panelFrames;});
    await info.attach('panel-frames',{body:JSON.stringify(data),contentType:'application/json'});
    return data;
}
const reference = name => ['chromium','firefox','webkit'].includes(name);
test('Overlay-Geometrie bei Profilbreite und schnellen Wechseln',async({page,shop,browserName,isMobile},info)=>{
    await shop.open();await page.evaluate(installRecorder);
    const widths=reference(info.project.name) ? [320,360,390,430,767,768,769,991,992,1024,1440,1920] : [page.viewportSize().width,768,1024];
    const sequences=[[390,1024,390],[768,992,768],[768,1024,768],[1024,768,1024],[1440,390,1440]];
    for(const width of widths){await setViewport(page,{width,height:820},browserName==='webkit' && isMobile);await frames(page);}
    for(const seq of sequences) for(const width of seq){await setViewport(page,{width,height:820},browserName==='webkit' && isMobile);await frames(page,25);}
    await setViewport(page,{width:768,height:820},browserName==='webkit' && isMobile);await frames(page);
    await info.attach('geschlossen-768',{body:await page.screenshot(),contentType:'image/png'});
    const data=await attach(page,info);
    for(const width of widths) expect(data.some(row=>row.width===width),'sample '+width).toBeTruthy();
    const mobile=data.filter(r=>!r.desktop);
    expect(mobile.filter(r=>r.nav.right>1 || r.filter.x<r.client-1 || r.nav.visible!=='hidden' || r.filter.visible!=='hidden' || r.nav.pointer!=='none' || r.filter.pointer!=='none').slice(0,2)).toEqual([]);
    expect(data.filter(r=>r.overflow>1).slice(0,2)).toEqual([]);
});
test('Menü, Untermenü, Filter, Fokus und offene Größenwechsel',async({page,shop,hasTouch,browserName,isMobile},info)=>{
    const act=l=>hasTouch?l.tap():l.click();
    await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);await shop.open();await page.evaluate(installRecorder);
    try {
        await page.evaluate(()=>{window.panelPhase='Menü öffnen';});
        await act(menu(page));await expect(menu(page)).toHaveAttribute('aria-expanded','true');
        const nav=page.locator('.top-menu-wrapper'), drawer=page.locator('.wrap-filter-mobile');
        const checkOpen=async name=>{
            const row=await page.evaluate(()=>window.observePanels('offen'));
            expect(row[name]).toMatchObject({pointer:'auto',visible:'visible',expanded:'true',open:true});
            expect(row.lock).toContain('hidden');
        };
        await expect(nav.locator('.close')).toBeFocused();
        const sub=nav.locator('[data-eg-open-ddown]:visible').first();
        await act(sub);await expect(nav.locator('.ddown-open')).toHaveCount(1);
        const back=nav.locator('.ddown-open [data-eg-back-ddown]:visible').first();
        await back.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
        await act(back);
        await expect(nav.locator('.ddown-open')).toHaveCount(0);
        await frames(page);
        await checkOpen('nav');
        await expect(nav.locator('.close')).toBeInViewport();
        expect(await nav.locator('.close').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
        await info.attach('navigation-768',{body:await page.screenshot(),contentType:'image/png'});
        await act(nav.locator('.close'));await expect(menu(page)).toBeFocused();
        await act(filter(page));await expect(filter(page)).toHaveAttribute('aria-expanded','true');
        await act(drawer.locator('[data-eg-facet-toggle]').first());await expect(drawer.locator('[data-eg-facet-toggle]').first()).toHaveAttribute('aria-expanded','true');
        await frames(page);
        await checkOpen('filter');
        await expect(drawer.locator('.close')).toBeInViewport();
        await info.attach('filter-768',{body:await page.screenshot(),contentType:'image/png'});
        await act(drawer.locator('.close'));await expect(filter(page)).toBeFocused();
        for (const [opener,panel] of [[menu(page),nav],[filter(page),drawer]]) {
            await act(opener);await page.keyboard.press('Escape');await expect(opener).toBeFocused();
            await act(opener);
            await setViewport(page,{width:992,height:900},browserName==='webkit' && isMobile);
            expect(await panel.locator('.close').evaluate(button=>button.getClientRects().length)).toBe(0);
            await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);
            await expect(opener).toHaveAttribute('aria-expanded','false');
            await act(opener);
            // Chromium can blur the mobile close button before delivering the media-query event.
            await panel.locator('.close').evaluate(button=>button.blur());
            await setViewport(page,{width:1024,height:900},browserName==='webkit' && isMobile);
            await expect(page.locator('html')).not.toHaveClass(/menu-open|filter-open/);
            await expect.poll(()=>panel.evaluate(node=>node.contains(document.activeElement) &&
                document.activeElement.getClientRects().length > 0)).toBe(true);
            await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);await frames(page);
            await expect(opener).toHaveAttribute('aria-expanded','false');
            await expect(nav).toBeHidden();await expect(drawer).toBeHidden();
            await expect(opener).toBeFocused();
        }
        for (const [opener, target] of [
            [menu(page), nav.locator('.top-menu > li > a:visible').first()],
            [filter(page), drawer.locator('[data-eg-facet-toggle]').first()]
        ]) {
            await opener.press('Enter');
            await target.focus();
            await expect(target).toBeFocused();
            await setViewport(page,{width:1024,height:900},browserName==='webkit' && isMobile);
            await expect(page.locator('html')).not.toHaveClass(/menu-open|filter-open/);
            await expect(target).toBeFocused();
            await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);
            await expect(opener).toBeFocused();
            await expect(opener).toBeInViewport();

            await opener.press('Enter');
            await setViewport(page,{width:1024,height:900},browserName==='webkit' && isMobile);
            await expect(page.locator('html')).not.toHaveClass(/menu-open|filter-open/);
            const outside = page.locator('.wishlist-link:visible').first();
            await outside.focus();
            await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);
            await expect(outside).toBeFocused();
        }
        for(const [opener,x] of [[menu(page),730],[filter(page),24]]) {
            await act(opener);
            await expect.poll(()=>page.evaluate(x=>document.elementFromPoint(x,180)?.classList.contains('eg-backdrop'),x)).toBe(true);
            if(hasTouch) await page.touchscreen.tap(x,180); else await page.mouse.click(x,180);
            await expect(opener).toBeFocused();
            await expect(opener).toHaveAttribute('aria-expanded','false');
        }
        await menu(page).press('Enter');await filter(page).press('Enter');
        await expect(page.locator('html')).toHaveClass(/filter-open/);await expect(nav).toBeHidden();
        await page.keyboard.press('Escape');
        expect((await page.evaluate(()=>window.panelFrames)).filter(r=>r.nav.open && r.filter.open || r.overflow>1).slice(0,1)).toEqual([]);
    } finally {
        await attach(page,info);
    }
});


test('Einzeln zugestellter Rückwechsel schließt Panels und erhält bewusst gesetzten Fokus',async({page,shop,browserName,isMobile})=>{
    await page.addInitScript(() => {
        const matchMedia = window.matchMedia.bind(window);
        const breakpoint = matchMedia('(min-width: 992px)');
        window.matchMedia = query => query === breakpoint.media ? breakpoint : matchMedia(query);
    });
    await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);
    await shop.open();
    // Replay the final media event observed after a real hidden-tab round trip.
    const deliverMobile = () => page.evaluate(() => {
        const media = window.matchMedia('(min-width: 992px)');
        media.dispatchEvent(new MediaQueryListEvent('change',{media:media.media,matches:false}));
    });
    for (const opener of [menu(page), filter(page)]) {
        await opener.press('Enter');
        await page.evaluate(() => document.activeElement.blur());
        await deliverMobile();
        await expect(opener).toHaveAttribute('aria-expanded','false');
        await expect(opener).toBeFocused();
        expect(await page.evaluate(() => [document.documentElement,document.body].map(el=>getComputedStyle(el).overflowY))).not.toContain('hidden');

        const outside = page.locator('.wishlist-link:visible').first();
        await opener.press('Enter');
        await outside.focus();
        await deliverMobile();
        await deliverMobile();
        await expect(opener).toHaveAttribute('aria-expanded','false');
        await expect(outside).toBeFocused();
    }
});

test('Panelkanten, Scrollsperre und Schließziele je Mobilbreite',async({page,shop,hasTouch,browserName,isMobile},info)=>{
    await shop.open();await page.evaluate(installRecorder);
    try {
        const widths=reference(info.project.name) ? [320,360,390,430,767,768,769,991] : new Set([Math.min(page.viewportSize().width,991),768]);
        for(const width of widths) {
            await setViewport(page,{width,height:850},browserName==='webkit' && isMobile);
            for(const [name,opener,selector] of [['nav',menu(page),'.top-menu-wrapper'],['filter',filter(page),'.wrap-filter-mobile']]) {
                await page.evaluate(label=>{window.panelPhase=label;},name+' '+width);
                if(hasTouch) await opener.tap(); else await opener.click();
                await frames(page);
                const state=await page.evaluate(()=>window.observePanels(window.panelPhase)), panel=state[name];
                expect(panel.open).toBe(true);
                expect(panel.x).toBeGreaterThanOrEqual(-1);
                expect(panel.right).toBeLessThanOrEqual(state.client+1);
                expect(Math.abs(name==='nav'?panel.x:panel.right-state.client)).toBeLessThan(1);
                expect(panel.opacity).toBe('1');
                expect(state.lock).toContain('hidden');
                const close=page.locator(selector+' .close');
                if(hasTouch) await close.tap(); else await close.click();
                await expect(opener).toBeFocused();
                await expect(page.locator(selector)).toBeHidden();
            }
        }
    } finally {await attach(page,info);}
});
