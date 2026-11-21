const {test,expect} = require('./storefront.cjs');
const {setViewport,observeViewport,resizeAndMeasure} = require('./viewport.cjs');

function installRecorder(closed=false) {
    const root=document.documentElement, body=document.body;
    const desktop=matchMedia('(min-width: 992px)');
    const initialFocus=document.activeElement;
    function panelReader(selector,state) {
        const node=document.querySelector(selector);
        const triggers=[...document.querySelectorAll('[data-eg-param="html,'+state+'"]')];
        return () => {
            const r=node.getBoundingClientRect(), css=getComputedStyle(node);
            const panel={x:r.x,right:r.right,visible:css.visibility,pointer:css.pointerEvents,
                expanded:triggers[0].getAttribute('aria-expanded'),open:root.classList.contains(state)};
            if (closed) panel.collapsed=triggers.every(trigger=>trigger.getAttribute('aria-expanded')==='false');
            if (!closed) Object.assign(panel,{y:r.y,bottom:r.bottom,transform:css.transform,opacity:css.opacity,z:css.zIndex});
            return panel;
        };
    }
    const nav=panelReader('.top-menu-wrapper','menu-open'), filter=panelReader('.wrap-filter-mobile','filter-open');
    window.panelFrames=[];
    window.observePanels=label=>{
        const focus=document.activeElement, client=root.clientWidth;
        return {label,width:innerWidth,desktop:desktop.matches,visual:window.visualViewport?.width,screen:screen.width,dpr:devicePixelRatio,
            client,overflow:root.scrollWidth-client,lock:[getComputedStyle(root).overflowY,getComputedStyle(body).overflowY],
            focus:focus.id||focus.getAttribute('aria-label')||focus.tagName,focusRetained:focus===initialFocus,nav:nav(),filter:filter()};
    };
    let previousSignature, readMs=0;
    window.takePanelFrames=()=>{
        const rows=window.panelFrames;
        window.panelFrames=[];
        previousSignature=undefined;
        const cost=readMs;
        readMs=0;
        return {rows,readMs:cost};
    };
    function frame(){
        const time=performance.now(), row=window.observePanels(window.panelPhase);
        readMs+=performance.now()-time;
        // Compare all measured fields. A single anomalous frame creates its own row.
        if (closed) {
            const signature=JSON.stringify(row);
            if (signature===previousSignature) {
                const last=window.panelFrames.at(-1);
                last.until=time;
                last.frames++;
            } else {
                window.panelFrames.push({...row,time,until:time,frames:1});
                previousSignature=signature;
            }
        } else window.panelFrames.push({...row,time});
        window.panelRAF=requestAnimationFrame(frame);
    }
    frame();
}
const menu = page => page.getByRole('button',{name:'Menü öffnen',exact:true});
const filter = page => page.getByRole('button',{name:'Filter öffnen',exact:true});
async function frames(page,ms=330) {
    await page.evaluate(ms=>new Promise(resolve=>{const start=performance.now();function next(){performance.now()-start>=ms?resolve():requestAnimationFrame(next);}requestAnimationFrame(next);}),ms);
}
async function attach(page,info,priorError) {
    const alreadyFailed=()=>priorError || info.errors.length || info.status==='timedOut';
    if (page.isClosed() && alreadyFailed()) return [];
    try {
        const data=await page.evaluate(()=>{cancelAnimationFrame(window.panelRAF);return window.panelFrames || [];});
        await info.attach('panel-frames',{body:JSON.stringify(data),contentType:'application/json'});
        return data;
    } catch (error) {
        if (alreadyFailed()) return [];
        throw error;
    }
}
const reference = name => ['chromium','firefox','webkit'].includes(name);
// Retain the original order, including consecutive equal widths. Verify each
// occurrence and retain each checkpoint on the runner before requesting the next.
for (const sweep of [true,false]) {
    test(sweep?'Geschlossene Panels bei Profil- und Referenzbreiten':'Geschlossene Panels bei schnellen Größenwechseln',async({page,shop,browserName,isMobile},info)=>{
        await shop.open();
        const focusTarget=page.locator('.cat-item .linkabso').first();
        await focusTarget.evaluate(el=>el.focus({preventScroll:true}));
        await expect(focusTarget).toBeFocused();
        const widths=sweep
            ? (reference(info.project.name)?[320,360,390,430,767,768,769,991,992,1024,1440,1920]:[page.viewportSize().width,768,1024])
            : [390,1024,390,768,992,768,768,1024,768,1024,768,1024,1440,390,1440];
        const sequence=[...widths,768];
        const mobileWebKit=browserName==='webkit' && isMobile;
        const recorded=[];
        await page.evaluate(installRecorder,true);
        const observer=await page.evaluateHandle(observeViewport,sequence[0]);
        try {
            for(const [index,width] of sequence.entries()) {
                const next=sequence[index+1], holdMs=sweep||next===undefined?330:25;
                const attempts=[];
                try {
                    await resizeAndMeasure(page,{width,height:820},mobileWebKit,async()=>{
                        const batch=await observer.evaluate(async(o,{next,holdMs,width,mobileWebKit})=>{
                            const result=await o.settle(holdMs,mobileWebKit);
                            const complete=result.stable && result.last.media && (!mobileWebKit || result.last.layout===width);
                            const evidence={before:o.before,events:o.events.slice(),result,...window.takePanelFrames()};
                            if (complete) {
                                if (next!==undefined) o.reset(next);
                                else { cancelAnimationFrame(window.panelRAF); o.dispose(); }
                            }
                            return evidence;
                        },{next,holdMs,width,mobileWebKit});
                        attempts.push(batch);
                        recorded.push(...batch.rows);
                        return batch.result;
                    });
                } finally {
                    await info.attach('viewport-'+width,{body:JSON.stringify({index,width,attempts}),contentType:'application/json'});
                }
                const rows=attempts.flatMap(a=>a.rows);
                expect(rows.some(r=>r.width===width && r.desktop===(width>=992)),'Zielposition '+(index+1)+' bei '+width+' px').toBe(true);
                const invalid=rows.find(r=>r.overflow>1 || !r.focusRetained || r.lock.includes('hidden') || r.lock.includes('clip') ||
                    r.nav.open || r.filter.open || !r.nav.collapsed || !r.filter.collapsed ||
                    (!r.desktop && (r.nav.right>1 || r.filter.x<r.client-1 || r.nav.visible!=='hidden' ||
                        r.filter.visible!=='hidden' || r.nav.pointer!=='none' || r.filter.pointer!=='none')));
                expect(invalid,'Panelzustand während Wechsel '+(index+1)).toBeUndefined();
            }
            await info.attach('geschlossen-768',{body:await page.screenshot(),contentType:'image/png'});
        } finally {
            // Already returned batches survive a timeout or a closed browser.
            await info.attach('panel-frames',{body:JSON.stringify(recorded),contentType:'application/json'});
            await observer.dispose().catch(()=>{});
        }
    });
}
test.describe('Mobile Panels',()=>{
    test.beforeEach(async({page,shop,browserName,isMobile})=>{
        await setViewport(page,{width:768,height:900},browserName==='webkit' && isMobile);
        await shop.open();
        await page.evaluate(installRecorder);
    });

    test.afterEach(async({page},info)=>{
        const data=await attach(page,info);
        if (info.status === 'passed') {
            expect(data.length).toBeGreaterThan(0);
            expect(data.filter(r=>r.nav.open && r.filter.open || r.overflow>1).slice(0,1)).toEqual([]);
        }
    });

    test('Menü, Untermenü, Filter und Schließen per Hintergrund',async({page,hasTouch},info)=>{
        const act=l=>hasTouch?l.tap():l.click();
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
    });

    for (const name of ['Menü','Filter']) {
        test(name+' bei offenen Größenwechseln und bewusster Fokuswahl',async({page,hasTouch,browserName,isMobile})=>{
            const act=l=>hasTouch?l.tap():l.click();
            const nav=page.locator('.top-menu-wrapper'), drawer=page.locator('.wrap-filter-mobile');
            const opener=name==='Menü'?menu(page):filter(page);
            const panel=name==='Menü'?nav:drawer;
            const target=panel.locator(name==='Menü'?'.top-menu > li > a:visible':'[data-eg-facet-toggle]').first();
            await page.evaluate(label=>{window.panelPhase=label;},name);
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
            const closed=await page.evaluate(()=>window.observePanels('Zurück auf 768 px'));
            expect(closed.lock).not.toContain('hidden');
            expect([closed.nav.expanded,closed.filter.expanded]).toEqual(['false','false']);

            await opener.press('Enter');
            await expect(panel.locator('.close')).toBeFocused();
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
        });
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
    } catch (error) {
        await attach(page,info,error);
        throw error;
    }
    await attach(page,info);
});
