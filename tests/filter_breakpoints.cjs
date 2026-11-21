// Exercise the shipped stylesheet with the listing drawer's desktop and mobile states.
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

async function main() {
    const browser = await chromium.launch({ executablePath: process.env.O46_BROWSER_EXECUTABLE });
    try {
        const page = await browser.newPage({ viewport: { width: 1024, height: 820 } });
        await page.setContent('<!doctype html><div class="filter-container"><div class="wrap-filter-mobile">Filter</div></div>');
        await page.addStyleTag({ path: path.join(__dirname, '../resources/css/main.min.css') });
        const drawer = page.locator('.wrap-filter-mobile');
        for (const width of [768, 1024, 1440, 1024, 390]) {
            // Arm the listener before resizing so even the first mobile frame is checked.
            await drawer.evaluate(el => {
                window.filterFrames = new Promise(resolve => {
                    window.addEventListener('resize', () => {
                        const frames = [];
                        const start = performance.now();
                        function sample(now) {
                            const rect = el.getBoundingClientRect();
                            const root = document.documentElement;
                            frames.push({ left: rect.left, width: root.clientWidth, overflow: root.scrollWidth - root.clientWidth });
                            if (now - start < 400) requestAnimationFrame(sample);
                            else resolve(frames);
                        }
                        requestAnimationFrame(sample);
                    }, { once: true });
                });
            });
            await page.setViewportSize({ width, height: 820 });
            const frames = await page.evaluate(() => window.filterFrames);
            assert.ok(frames.every(frame => frame.overflow === 0), 'Document overflow at ' + width);
            if (width < 992) {
                assert.ok(frames.every(frame => frame.left >= frame.width - 1),
                    'Closed filter entered the viewport at ' + width + 'px: left=' + Math.min(...frames.map(f => f.left)));
                for (const open of [true, false]) {
                    const geometry = await drawer.evaluate(async (el, open) => {
                        document.documentElement.classList.toggle('filter-open', open);
                        el.getBoundingClientRect();
                        const slide = el.getAnimations().find(animation => animation.transitionProperty === 'transform');
                        if (slide) await slide.finished;
                        const rect = el.getBoundingClientRect();
                        return { animated: !!slide, left: rect.left, right: rect.right };
                    }, open);
                    assert.ok(geometry.animated, 'Intentional mobile open and close should animate');
                    assert.ok(Math.abs((open ? geometry.right : geometry.left) - width) < 1, 'Drawer endpoint');
                }
            } else {
                assert.ok(frames.every(frame => Math.abs(frame.left - frames[0].left) < 1), 'Desktop filter moved');
            }
        }
        console.log('5 viewport transitions and 4 intentional mobile drawer transitions passed');
    } finally {
        await browser.close();
    }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
