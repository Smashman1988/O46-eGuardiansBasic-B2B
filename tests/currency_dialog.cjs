// Real Twig header and production bundles. ShopBuilder supplies the form in the shop.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium, expect} = require('@playwright/test');
const {fixture} = require('./dialog_switch.cjs');

const labels = {
    de: {currency:'Währung', action:'Ändern', account:'Anmelden', language:'Sprache', loading:'Inhalt wird geladen …'},
    en: {currency:'Currency', action:'Change', account:'Login', language:'Language', loading:'Loading content…'},
    fr: {currency:'Devise', action:'Modifier', account:'S identifier', language:'Langue', loading:'Chargement du contenu…'},
    it: {currency:'Valuta', action:'Modifica', account:'Accedi', language:'Linguaggio', loading:'Caricamento del contenuto…'},
    es: {currency:'Moneda', action:'Cambiar', account:'Iniciar sesión', language:'el Idioma', loading:'Cargando contenido…'}
};

function recordCurrencyObserver() {
    const observe = MutationObserver.prototype.observe;
    window.currencyObservers = 0;
    MutationObserver.prototype.observe = function (target, options) {
        if (target.matches?.('[data-eg-currency]') && options.characterData && options.subtree) window.currencyObservers++;
        return observe.call(this, target, options);
    };
}

async function checkLocale(browser, lang, words) {
    const t = await fixture(browser, lang, 390, {beforeScripts:recordCurrencyObserver});
    try {
        const {page, modal} = t;
        const title = modal.locator('.modal-title');
        const body = modal.locator('.modal-body');
        const close = modal.locator('.close');
        const opener = page.locator('button[data-eg-currency]');
        const route = (lang === 'de' ? '' : '/' + lang) + '/getShopBuilderContent/?categoryId=5638';
        await expect(opener).toHaveAttribute('data-eg-href', route);
        await expect(opener).toHaveText('€');
        assert.equal(await page.evaluate(() => window.currencyObservers), 1);
        const results = [];
        for (const previous of ['account','language']) {
            const old = await t.open(previous);
            await expect(title).toHaveText(words[previous]);
            await t.reply(old);
            await expect(body.locator('[data-result="' + previous + '"]')).toBeVisible();
            await expect(title).toHaveText(words[previous]);
            await close.click();
            await expect(modal).toBeHidden();

            const pending = await t.open('info');
            const request = pending.route.request();
            assert.equal(request.method(), 'GET');
            assert.equal(request.url(), 'https://fixture.test' + route);
            await expect(body.getByRole('status')).toBeVisible();
            await expect(body.getByRole('status')).toHaveText(words.loading);
            await expect(body.locator('[data-result],form,a')).toHaveCount(0);
            await expect(title).toHaveText(words.currency);
            const loadingTitle = await title.innerText();
            await expect(close).toBeFocused();
            await expect(page.locator('body')).toHaveClass(/modal-open/);
            const form = '<form><label>' + words.currency + ': <select><option value="EUR" selected>EUR (€)</option></select></label>' +
                '<button type="submit">' + words.action + '</button></form>';
            await pending.route.fulfill({json:{data:form}});
            await expect(body.getByRole('combobox', {name:words.currency + ':'})).toHaveValue('EUR');
            await expect(body.getByRole('button', {name:words.action, exact:true})).toBeVisible();
            await expect(body.locator('[data-result],[role=status]')).toHaveCount(0);
            await expect(title).toHaveText(words.currency);
            await expect(modal).not.toContainText(/(?:Ceres|GuardiansBasicB2B)::/);
            const loadedTitle = await title.innerText();
            const closing = previous === 'account' ? 'X' : 'Escape';
            if (closing === 'X') await close.click(); else await page.keyboard.press('Escape');
            await expect(modal).toBeHidden();
            await expect(opener).toBeFocused();
            await expect(page.locator('.modal-backdrop,body.modal-open')).toHaveCount(0);
            results.push({previous, loadingTitle, loadedTitle, closing});
        }
        assert.ok(t.requests.every(request => request.startsWith('GET ')));
        assert.equal(page.url(), 'https://fixture.test/produkt/');
        assert.deepEqual(t.errors, []);
        assert.deepEqual(t.failed, []);
        return {lang, route, results};
    } finally { await t.context.close(); }
}

async function run() {
    const browser = await chromium.launch({channel:'chrome'});
    try {
        const locales = [];
        for (const [lang, words] of Object.entries(labels)) locales.push(await checkLocale(browser, lang, words));
        // PDP and quickview can load the matrix through different compiled assets.
        const page = await browser.newPage();
        await page.setContent('<button data-eg-currency data-eg-title="Moneda">€</button>');
        await page.evaluate(recordCurrencyObserver);
        await page.evaluate(() => { window.O46Core = {installed:{}}; });
        await page.addScriptTag({path:path.resolve('resources/js/matrix.min.js')});
        await page.evaluate(() => O46Core.matrix());
        assert.equal(await page.evaluate(() => window.currencyObservers), 1);
        const evidence = {chrome:browser.version(), locales, standaloneObserver:true};
        const report = '.cache/popup-modernisierung-wishlist/waehrungsdialog-browser.json';
        fs.mkdirSync(path.dirname(report), {recursive:true});
        fs.writeFileSync(report, JSON.stringify(evidence,null,2) + '\n');
        console.log('PASS: 5 locales, 10 currency openings, both matrix bundles');
    } finally { await browser.close(); }
}
run().catch(error => {console.error(error);process.exitCode=1;});
