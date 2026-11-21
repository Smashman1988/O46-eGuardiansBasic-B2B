const {test,expect} = require('./storefront.cjs');

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
        return {label,time:performance.now(),width:innerWidth,client:root.clientWidth,overflow:root.scrollWidth-root.clientWidth,
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
test('Overlay-Geometrie an elf Breiten und bei schnellen Wechseln',async({page,shop},info)=>{
    await shop.open();await page.evaluate(installRecorder);
    const widths=[320,360,390,430,767,768,769,991,992,1024,1440];
    const sequences=[[390,1024,390],[768,1024,768],[1024,768,1024],[1440,390,1440]];
    for(const width of widths){await page.setViewportSize({width,height:820});await frames(page);}
    for(const seq of sequences) for(const width of seq){await page.setViewportSize({width,height:820});await frames(page,25);}
    await page.setViewportSize({width:768,height:820});await frames(page);
    await info.attach('geschlossen-768',{body:await page.screenshot(),contentType:'image/png'});
    const data=await attach(page,info);
    for(const width of widths) expect(data.some(row=>row.width===width),'sample '+width).toBeTruthy();
    const mobile=data.filter(r=>r.width<992);
    expect(mobile.filter(r=>r.nav.right>1 || r.filter.x<r.client-1 || r.nav.visible!=='hidden' || r.filter.visible!=='hidden' || r.nav.pointer!=='none' || r.filter.pointer!=='none').slice(0,2)).toEqual([]);
    expect(data.filter(r=>r.overflow>1).slice(0,2)).toEqual([]);
});
test('Menü, Untermenü, Filter, Fokus und offene Größenwechsel',async({page,shop,hasTouch},info)=>{
    const act=l=>hasTouch?l.tap():l.click();
    await page.setViewportSize({width:768,height:900});await shop.open();await page.evaluate(installRecorder);
    try {
        await page.evaluate(()=>{window.panelPhase='Menü öffnen';});
        await act(menu(page));await expect(menu(page)).toHaveAttribute('aria-expanded','true');
        const nav=page.locator('.top-menu-wrapper'), drawer=page.locator('.wrap-filter-mobile');
        await expect(nav.locator('.close')).toBeFocused();
        const sub=nav.locator('[data-eg-open-ddown]:visible').first();
        await act(sub);await expect(nav.locator('.ddown-open')).toHaveCount(1);
        await act(nav.locator('.ddown-open [data-eg-back-ddown]:visible').first());
        await expect(nav.locator('.ddown-open')).toHaveCount(0);
        await frames(page);
        await expect(nav.locator('.close')).toBeInViewport();
        expect(await nav.locator('.close').evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
        await info.attach('navigation-768',{body:await page.screenshot(),contentType:'image/png'});
        await act(nav.locator('.close'));await expect(menu(page)).toBeFocused();
        await act(filter(page));await expect(filter(page)).toHaveAttribute('aria-expanded','true');
        await act(drawer.locator('[data-eg-facet-toggle]').first());await expect(drawer.locator('[data-eg-facet-toggle]').first()).toHaveAttribute('aria-expanded','true');
        await frames(page);
        await expect(drawer.locator('.close')).toBeInViewport();
        await info.attach('filter-768',{body:await page.screenshot(),contentType:'image/png'});
        await act(drawer.locator('.close'));await expect(filter(page)).toBeFocused();
        for (const opener of [menu(page),filter(page)]) {
            await act(opener);await page.keyboard.press('Escape');await expect(opener).toBeFocused();
            await act(opener);await page.setViewportSize({width:1024,height:900});
            await expect(page.locator('html')).not.toHaveClass(/menu-open|filter-open/);
            await page.setViewportSize({width:768,height:900});await frames(page);
            await expect(opener).toHaveAttribute('aria-expanded','false');
            await expect(nav).toBeHidden();await expect(drawer).toBeHidden();
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
    } finally {
        const data=await attach(page,info);
        expect(data.filter(r=>r.nav.open && r.filter.open || r.overflow>1).slice(0,1)).toEqual([]);
        for (const name of ['nav','filter']) {
            const opened=data.filter(r=>r.width<992 && r[name].open);
            expect(opened.some(r=>r[name].pointer==='auto' && r[name].visible==='visible' && r[name].expanded==='true' && r.lock.includes('hidden'))).toBe(true);
        }
    }
});


test('Panelkanten, Scrollsperre und Schließziele je Mobilbreite',async({page,shop,hasTouch},info)=>{
    await shop.open();await page.evaluate(installRecorder);
    try {
        for(const width of [320,360,390,430,767,768,769,991]) {
            await page.setViewportSize({width,height:850});
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
