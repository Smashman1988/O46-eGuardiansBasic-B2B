// node tests/contact_widget.cjs <preview-directory> <report.json>
// Uses an external Playwright installation; ships no runtime dependencies.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const directory = path.resolve(process.argv[2]);
const reportPath = path.resolve(process.argv[3]);
const script = fs.readFileSync(path.join(__dirname, '../resources/js/contact-widget.js'), 'utf8');
const report = { scenarios: [], assertions: 0, pageErrors: [], externalRequests: [], plentyONE: 'NOT_RUN' };
function check(ok, message) { assert.ok(ok, message); report.assertions++; }
const intersects = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

(async () => {
    const browser = await chromium.launch({ headless: true, ...(process.env.O46_BROWSER_EXECUTABLE ? { executablePath: process.env.O46_BROWSER_EXECUTABLE } : {}) });
    try {
        const sizes = [[1440, 900], [1024, 768], [768, 1024], [390, 844], [320, 568], [280, 480], [568, 320]];
        for (const mode of ['isolated', 'theme', 'category', 'item', 'checkout']) {
            for (const language of ['de', 'en', 'fr', 'it', 'es']) {
                for (const [width, height] of language === 'de' ? sizes : [[320, 568]]) {
                    const name = `${mode}/${language}/${width}x${height}`;
                    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
                    await context.addInitScript(() => {
                        // Any accidental persistence access or cookie access must fail loudly.
                        for (const key of ['localStorage', 'sessionStorage']) {
                            Object.defineProperty(window, key, { get() { throw new Error(`Unexpected ${key} access`); } });
                        }
                        Object.defineProperty(document, 'cookie', {
                            get() { throw new Error('Unexpected cookie read'); },
                            set() { throw new Error('Unexpected cookie write'); }
                        });
                        window.contactFixtureShifts = [];
                        new PerformanceObserver(list => window.contactFixtureShifts.push(...list.getEntries().map(entry => entry.value)))
                            .observe({ type: 'layout-shift', buffered: true });
                    });
                    const page = await context.newPage();
                    page.on('pageerror', error => report.pageErrors.push(`${name}: ${error.message}`));
                    await page.route(/^https?:/, route => {
                        report.externalRequests.push({ scenario: name, url: route.request().url() });
                        return route.abort();
                    });
                    await page.goto(pathToFileURL(path.join(directory, `preview-${language}-${mode}.html`)).href);
                    const widget = page.locator('#o46-b2b-contact-widget');
                    const toggle = widget.locator('.o46-b2b-contact-toggle');
                    const panel = widget.locator('.o46-b2b-contact-panel');
                    const close = widget.locator('.o46-b2b-contact-close');
                    const links = panel.locator('a');
                    await widget.locator('[aria-expanded="false"]').waitFor();
                    check(await widget.count() === 1, `${name}: exactly one widget`);
                    check(await toggle.isVisible() && !await panel.isVisible(), `${name}: visible launcher, closed panel`);
                    check(await panel.locator('button').count() === 1 && await widget.locator('button').count() === 2, `${name}: only panel has a close button`);
                    check(await links.count() === 2, `${name}: exactly two contact methods`);
                    check(await links.nth(0).getAttribute('href') === 'https://whatsapp.com/channel/0029VbDashBBPzjbqTzmQb3m', `${name}: exact channel`);
                    check(await links.nth(0).getAttribute('target') === '_blank' && await links.nth(0).getAttribute('rel') === 'noopener noreferrer', `${name}: safe new tab`);
                    check(await links.nth(1).getAttribute('href') === 'mailto:b2b@outlet46.de', `${name}: email`);
                    check(!/telegram/i.test(await widget.textContent()), `${name}: no Telegram`);
                    const launcher = await toggle.boundingBox();
                    check(launcher.x >= 0 && launcher.y >= 0 && launcher.x + launcher.width <= width && launcher.y + launcher.height <= height, `${name}: launcher inside viewport`);
                    check(!intersects(launcher, await page.locator('#totop').boundingBox()), `${name}: back-to-top remains clear`);
                    const bodyBefore = await page.locator('#contact-fixture-shop').boundingBox();
                    await toggle.click();
                    check(await panel.isVisible() && await toggle.getAttribute('aria-expanded') === 'true', `${name}: opens`);
                    check(await close.evaluate(element => document.activeElement === element), `${name}: opening focus`);
                    const box = await panel.boundingBox();
                    check(box.x >= 0 && box.y >= 0 && box.x + box.width <= width + 1 && box.y + box.height <= height, `${name}: panel inside viewport`);
                    check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}: no horizontal overflow`);
                    check(JSON.stringify(bodyBefore) === JSON.stringify(await page.locator('#contact-fixture-shop').boundingBox()), `${name}: shop layout unchanged`);
                    check(await toggle.isVisible(), `${name}: launcher remains visible when open`);
                    for (const link of await links.all()) {
                        await link.scrollIntoViewIfNeeded();
                        const row = await link.boundingBox();
                        check(row.height >= 44, `${name}: touch target`);
                        check(await link.evaluate(element => {
                            const r = element.getBoundingClientRect();
                            return element.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
                        }), `${name}: entire contact row reachable`);
                    }
                    await close.scrollIntoViewIfNeeded();
                    await close.click();
                    check(!await panel.isVisible() && await toggle.isVisible(), `${name}: X closes panel only`);
                    check(await toggle.evaluate(element => document.activeElement === element), `${name}: restores focus`);

                    if (language === 'de' && width === 1440) {
                        await page.addScriptTag({ content: script });
                        await toggle.focus();
                        await page.keyboard.press('Enter');
                        check(await panel.isVisible(), `${name}: duplicate script does not duplicate listeners`);
                        await page.keyboard.press('Tab');
                        check(await links.nth(0).evaluate(element => document.activeElement === element), `${name}: keyboard WhatsApp`);
                        await page.keyboard.press('Tab');
                        check(await links.nth(1).evaluate(element => document.activeElement === element), `${name}: keyboard email`);
                        await page.keyboard.press('Escape');
                        check(!await panel.isVisible() && await toggle.isVisible(), `${name}: Escape`);
                        await page.keyboard.press('Space');
                        check(await panel.isVisible(), `${name}: Space opens`);
                        check(await close.evaluate(element => getComputedStyle(element).outlineStyle !== 'none'), `${name}: visible keyboard focus`);
                        await toggle.click();
                        check(!await panel.isVisible(), `${name}: repeated launcher click`);
                        await toggle.click();
                        await page.locator('#contact-fixture-outside').click();
                        check(!await panel.isVisible(), `${name}: outside click`);
                        check(await page.locator('#contact-fixture-outside').evaluate(element => document.activeElement === element), `${name}: outside control keeps focus`);
                        await toggle.click();
                        await page.keyboard.press('Shift+Tab'); // Close -> launcher.
                        await page.keyboard.press('Shift+Tab'); // Launcher -> previous shop control.
                        check(!await panel.isVisible(), `${name}: no keyboard trap`);
                        check(await page.evaluate(() => !document.querySelector('#o46-b2b-contact-widget').contains(document.activeElement)), `${name}: Tab reaches shop`);
                        await page.locator('#contact-fixture-overlay').evaluate(element => { element.style.display = 'block'; });
                        check(await toggle.evaluate(element => {
                            const r = element.getBoundingClientRect();
                            return !element.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
                        }), `${name}: shop modal has priority`);
                        await page.locator('#contact-fixture-overlay').evaluate(element => { element.style.display = 'none'; });
                        await page.reload();
                        check(await toggle.isVisible() && !await panel.isVisible(), `${name}: visible again after navigation`);
                    }
                    check(await page.evaluate(() => window.contactFixtureShifts.reduce((sum, value) => sum + value, 0)) === 0, `${name}: zero measured layout shift`);
                    if (language === 'de' && mode === 'theme' && [1440, 390].includes(width)) {
                        await toggle.click();
                        await page.mouse.move(1, 1);
                        await page.screenshot({ path: path.join(directory, `contact-widget-${width}.png`), fullPage: true });
                        await close.click();
                        if (width === 1440) { await page.screenshot({ path: path.join(directory, 'contact-widget-closed.png'), fullPage: true }); }
                    }
                    report.scenarios.push({ name, status: 'PASS' });
                    await context.close();
                }
            }
        }
        check(report.pageErrors.length === 0, 'No JavaScript page errors');
        check(!report.externalRequests.some(request => request.scenario.startsWith('isolated/')), 'No external widget requests');
    } catch (error) {
        report.failure = error.stack;
        process.exitCode = 1;
    } finally {
        await browser.close();
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(JSON.stringify({ scenarios: report.scenarios.length, assertions: report.assertions, pageErrors: report.pageErrors, externalRequests: report.externalRequests.length, failure: report.failure || null }, null, 2));
    }
})();
