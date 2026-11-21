// Read-only identity probe in a fresh hosted browser. Only approved documents and
// observed theme assets are read. Scripts, forms, subresources and redirects stay disabled.
const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const versions = require('../../resources/asset-versions.json');
const shop = 'https://b2b.outlet46.de';
const category = shop + '/alle-artikel/';
const sha256 = data => createHash('sha256').update(data).digest('hex');

function assetsFrom(refs, required) {
    const assets = [];
    for (const raw of new Set(refs)) {
        const url = new URL(raw, shop);
        const match = url.pathname.match(/\/plugin\/(\d+)\/guardiansbasicb2b\/(css\/[^/]+\.css|js\/[^/]+\.js)$/i);
        if (!match) continue;
        const [, pluginset, file] = match;
        assets.push({url:url.href, pluginset, file, version:url.searchParams.get('v')});
    }
    const trusted = url => {
        const u = new URL(url);
        return u.origin === shop || (u.origin === 'https://s3-eu-central-1.amazonaws.com' &&
            u.pathname.startsWith('/plentymarkets-public-92/gesikq7l45vs/plugin/'));
    };
    const mismatch = assets.find(a => a.pluginset !== '426' || !trusted(a.url) ||
        !Object.hasOwn(versions, a.file) || a.version !== String(versions[a.file]));
    if (mismatch) return {assets, reason:'Pluginset, Quelle oder Version weicht ab: '+mismatch.file+' (Set '+mismatch.pluginset+')'};
    const missing = required.filter(file => !assets.some(a => a.file === file));
    return missing.length ? {assets, reason:'Referenz fehlt: '+missing.join(', ')} : {assets};
}

async function inspect(report) {
    const browser = await chromium.launch();
    try {
        const context = await browser.newContext({javaScriptEnabled:false, serviceWorkers:'block', acceptDownloads:false});
        const page = await context.newPage();
        let documentUrl = category;
        await context.route('**/*', async route => {
            const req = route.request();
            if (req.method() !== 'GET' || req.resourceType() !== 'document' || req.url() !== documentUrl) return route.abort();
            const response = await route.fetch({maxRedirects:0, timeout:12000}).catch(() => null);
            if (!response) return route.fulfill({status:502, body:''});
            if (response.status() !== 200) return route.fulfill({status:response.status(), headers:{}, body:''});
            // Render for reference extraction only. Omit Set-Cookie, Refresh and active content.
            return route.fulfill({status:200, contentType:'text/html; charset=utf-8', body:await response.body()});
        });
        const documents = [['Kategorie',category,'js/cat.min.js']];
        const verified = new Set();
        for (const [kind, url, bundle] of documents) {
            documentUrl = url;
            const response = await page.goto(url,{waitUntil:'domcontentloaded',timeout:18000});
            if (response?.status() !== 200 || page.url() !== url) throw Error(kind+' nicht direkt erreichbar (HTTP '+response?.status()+')');
            const refs = await page.locator('link,script').evaluateAll(nodes => nodes.flatMap(n =>
                ['href','src','data-eg-magiczoom-src','data-eg-matrix-src'].map(key=>n.getAttribute(key)).filter(Boolean)));
            const row = {kind,url,...assetsFrom(refs,['css/main.min.css','js/core.min.js',bundle])};
            report.documents.push(row);
            if (row.reason) throw Error(row.reason);
            for (const asset of row.assets) {
                if (verified.has(asset.url)) continue;
                const bytes = await context.request.get(asset.url,{maxRedirects:0,timeout:12000});
                try {
                    if (bytes.status() !== 200) throw Error('Asset HTTP '+bytes.status()+': '+asset.file);
                    const expected=sha256(await fs.readFile(path.join(__dirname,'../../resources',asset.file)));
                    const actual=sha256(await bytes.body());
                    report.hashes.push({file:asset.file,url:asset.url,expected,actual});
                    if (actual !== expected) throw Error('SHA-256 weicht ab: '+asset.file);
                    verified.add(asset.url);
                } finally { await bytes.dispose(); }
            }
            if (kind === 'Kategorie') {
                const product = await page.locator('.cat-item a[href]').evaluateAll(links => links.map(a=>a.href)
                    .find(h=>{const u=new URL(h);return u.origin===location.origin && /\/a-\d+\/?$/.test(u.pathname) && !u.search && !u.hash;}));
                if (!product) throw Error('Keine eindeutige Artikeldetail-URL in der Kategorie');
                documents.push(['Artikel',product,'js/item.min.js']);
            }
        }
        report.status='426 für Kategorie und Artikel bytegleich belegt';
    } finally { await browser.close(); }
}

module.exports={assetsFrom};
if (require.main === module) {
    const report={status:'Vorschau nicht bestätigt',tag:process.env.GITHUB_REF_NAME,commit:process.env.TEST_COMMIT,documents:[],hashes:[]};
    inspect(report).catch(e=>{report.reason=e.message;}).then(async()=>{
        await fs.mkdir('.cache/cross-browser',{recursive:true});
        await fs.writeFile('.cache/cross-browser/preview.json',JSON.stringify(report,null,2));
        console.log('Anonymer Browser · '+report.status+(report.reason?' · '+report.reason.replace(/[\r\n]/g,' '):''));
    }).catch(e=>{console.error(e);process.exitCode=1;});
}
