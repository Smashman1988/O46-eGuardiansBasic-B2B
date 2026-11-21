const {test:base,expect} = require('./storefront.cjs');
const {chromium} = require('playwright');
const {spawn} = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');

// The normal Chromium automation context forces foreground focus. Use a disposable
// default context without those overrides, leaving the regular functional projects intact.
const test = base.extend({
    context: async ({context,browserName,channel},use) => {
        if(browserName!=='chromium') return use(context);
        let executable=chromium.executablePath();
        if(channel) {
            const filename=channel==='msedge'?'Microsoft/Edge/Application/msedge.exe':'Google/Chrome/Application/chrome.exe';
            const candidates=process.platform==='win32'
                ? [process.env.LOCALAPPDATA,process.env.PROGRAMFILES,process.env['PROGRAMFILES(X86)']].filter(Boolean).map(dir=>path.join(dir,filename))
                : [channel==='msedge'?'/opt/microsoft/msedge/msedge':'/opt/google/chrome/chrome'];
            executable=candidates.find(file=>require('node:fs').existsSync(file));
            if(!executable) throw Error('Installed browser missing: '+channel);
        }
        const profile=await fs.mkdtemp(path.join(os.tmpdir(),'o46-browser-test-'));
        let child, browser;
        try {
            child=spawn(executable,['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-networking',
                '--disable-sync','--remote-debugging-port=0','--remote-debugging-address=127.0.0.1','--user-data-dir='+profile,'about:blank'],
                {windowsHide:true,stdio:'ignore'});
            let launchError;
            child.once('error',e=>{launchError=e;});
            const endpoint=path.join(profile,'DevToolsActivePort');
            await expect.poll(async()=>launchError?launchError.message:fs.access(endpoint).then(()=>true,()=>false),{timeout:10000}).toBe(true);
            const [port,route]=(await fs.readFile(endpoint,'utf8')).trim().split(/\r?\n/);
            browser=await chromium.connectOverCDP('ws://127.0.0.1:'+Number(port)+route,{noDefaults:true});
            const ctx=browser.contexts()[0];
            await use(ctx);
        } finally {
            if(browser) {
                const control=await browser.newBrowserCDPSession().catch(()=>null);
                await control?.send('Browser.close').catch(()=>{});
                await browser.close().catch(()=>{});
            }
            if(child?.pid && child.exitCode===null && child.signalCode===null) child.kill();
            if(path.dirname(profile)!==path.resolve(os.tmpdir()) || !path.basename(profile).startsWith('o46-browser-test-')) throw Error('Unexpected test profile');
            await fs.rm(profile,{recursive:true,force:true,maxRetries:8,retryDelay:200});
        }
    }
});

test('Echter Hintergrundtab mit und ohne Breakpointwechsel',async({page,context,shop,browserName,hasTouch,isMobile,deviceScaleFactor,userAgent},info)=>{
    test.setTimeout(90000);
    const measurements=[];
    const cdp=browserName==='chromium'?await context.newCDPSession(page):null;
    const size=async width=>{
        if(!cdp) return page.setViewportSize({width,height:900});
        await cdp.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:deviceScaleFactor||1,mobile:!!isMobile});
    };
    if(cdp) {
        if(userAgent) await cdp.send('Network.setUserAgentOverride',{userAgent});
        await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:!!hasTouch});
    }
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
