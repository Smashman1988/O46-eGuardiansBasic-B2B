const {test:base,expect} = require('./storefront.cjs');
const {chromium} = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const {setViewport} = require('./viewport.cjs');

// Use Playwright's verified launcher and lifecycle on every OS. A second CDP
// connection uses the browser's default profile without Playwright's focus override.
const test=base.extend({
    context: async ({context,browserName,channel},use,info)=>{
        if(browserName!=='chromium') return use(context);
        let owner, observer, observedContext;
        try {
            try {
                owner=await chromium.launch({channel:channel || 'chromium',headless:true,args:['--enable-automation','--remote-debugging-address=127.0.0.1','--remote-debugging-port=0']});
                const control=await owner.newBrowserCDPSession();
                const command=await control.send('Browser.getBrowserCommandLine');
                await control.detach();
                const arg=command.arguments.find(arg=>arg.startsWith('--user-data-dir='));
                if(!arg) throw Error('Playwright browser profile missing');
                const endpoint=await fs.readFile(path.join(arg.slice('--user-data-dir='.length),'DevToolsActivePort'),'utf8');
                const [port,route]=endpoint.trim().split(/\r?\n/);
                observer=await chromium.connectOverCDP('ws://127.0.0.1:'+Number(port)+route,{noDefaults:true});
                observedContext=observer.contexts()[0];
                if(!observedContext) throw Error('Default browser context missing');
            } catch(error) {
                info.annotations.push({type:'browser-setup',description:'Chromium-Start oder CDP-Verbindung fehlgeschlagen'});
                throw error;
            }
            await use(observedContext);
        } finally {
            try { await observer?.close(); } finally { await owner?.close(); }
        }
    }
});

test('Echter Hintergrundtab mit und ohne Breakpointwechsel',async({page,context,shop,browserName,isMobile,hasTouch,userAgent,deviceScaleFactor},info)=>{
    test.setTimeout(90000);
    const measurements=[];
    const cdp=browserName==='chromium'?await context.newCDPSession(page):null;
    if(cdp) {
        if(userAgent) await cdp.send('Network.setUserAgentOverride',{userAgent});
        await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:!!hasTouch});
    }
    const size=width=>cdp?cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:deviceScaleFactor||1,mobile:!!isMobile})
        :setViewport(page,{width,height:900},browserName==='webkit' && isMobile);
    await size(768);
    await shop.open();
    const popup=page.waitForEvent('popup');
    await page.evaluate(()=>window.open('about:blank','_blank'));
    const other=await popup;
    const state=()=>page.evaluate(()=>({
        width:innerWidth,visibility:document.visibilityState,focused:document.hasFocus(),
        focus:document.activeElement?.getAttribute('aria-label')||document.activeElement?.tagName,
        panel:document.activeElement?.closest('#o46-filter,#o46-menu')?.id,
        root:document.documentElement.className,lock:[document.documentElement,document.body].map(e=>getComputedStyle(e).overflowY),
        expanded:[...document.querySelectorAll('[aria-controls="o46-filter"],[aria-controls="o46-menu"]')].map(e=>e.getAttribute('aria-expanded'))
    }));
    try {
        await page.bringToFront();
        for(const [label,id] of [['Menü öffnen','o46-menu'],['Filter öffnen','o46-filter']]) for(const peak of [null,992,1024]){
            const opener=page.getByRole('button',{name:label,exact:true});
            await opener.press('Enter');
            await expect(opener).toHaveAttribute('aria-expanded','true');
            await other.bringToFront();
            // Poll only the observation. No page visibility, lifecycle or media event is synthesized.
            const hidden=await page.waitForFunction(()=>document.visibilityState==='hidden',null,{polling:50,timeout:2500})
                .then(()=>true,e=>{if(e.name==='TimeoutError')return false;throw e;});
            const before=await state();
            measurements.push({label,peak,before});
            if(!hidden || before.visibility!=='hidden'){
                info.annotations.push({type:'blocked',description:'Browser lieferte nach Tabwechsel kein bestätigtes hidden'});
                test.skip(true,'Hintergrund nicht bestätigt');
            }
            if(peak) {
                await size(peak);
                const mid=await state();
                measurements.at(-1).desktop=mid;
                expect(mid.width).toBe(peak);expect(mid.visibility).toBe('hidden');
                await size(768);
            }
            await page.bringToFront();
            await expect.poll(async()=>{const s=await state();return [s.visibility,s.focused,s.width];}).toEqual(['visible',true,768]);
            if(peak) await expect(opener).toBeFocused();
            const after=await state();
            measurements.at(-1).after=after;
            if(peak) {
                expect(after.root).not.toMatch(/menu-open|filter-open/);
                expect(after.expanded.every(v=>v==='false')).toBe(true);
                expect(after.lock).not.toContain('hidden');
                await expect(page.locator('#o46-menu')).toBeHidden();await expect(page.locator('#o46-filter')).toBeHidden();
            } else {
                await expect(opener).toHaveAttribute('aria-expanded','true');
                expect(after.panel).toBe(id);expect(after.lock).toContain('hidden');
                await page.keyboard.press('Escape');await expect(opener).toBeFocused();
            }
        }
    } finally {
        await info.attach('tab-lifecycle',{body:JSON.stringify(measurements,null,2),contentType:'application/json'});
        await other.close();await cdp?.detach();
    }
});
