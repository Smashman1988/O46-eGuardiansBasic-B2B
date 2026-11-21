const { test: base, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const origin = 'https://storefront.test';
const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root,file));
const head = read('resources/views/PageDesign/Partials/Head.twig').toString();
const styles = [...head.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)];
const svg = color => '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="800"><rect width="640" height="800" fill="'+color+'"/><circle cx="320" cy="400" r="100" fill="white"/></svg>';
const imageFor = color => ({url:'/image/'+color+'.svg',urlMiddle:'/image/'+color+'.svg',urlPreview:'/image/'+color+'.svg'});
function article(f, id, quick) {
    const matrix = '<div data-item-variation data-eg-variations=\''+JSON.stringify(f.variations)+'\'>'+f.matrix+'</div>';
    return '<article class="single container" data-item><h1>Artikel '+id+'</h1><div class="row">'+(quick?f.gallery.replaceAll('ItemImgZoom','ItemImgZoom2'):f.gallery)+'</div>'+(quick?'':matrix)+'</article>';
}
function storefront(f,url) {
    const pdp = /^\/product-/.test(url.pathname), home = url.pathname === '/';
    const bundle = pdp ? 'item' : home ? 'main' : 'cat';
    const critical = [styles[pdp?0:2],...styles.filter(m=>m[1] && (pdp || !/pdp|matrix/.test(m[1])))].map(m=>m[0]).join('')
        .replaceAll("{{ plugin_path('GuardiansBasicB2B') }}",'/plugin/GuardiansBasicB2B');
    const selected = (url.searchParams.get('facets')||'').split(',');
    const filterKey = f.groups.map(g=>String(g.values[0].id)).filter(id=>selected.includes(id)).join(',');
    let cards = f.cards.replaceAll('https://b2b.outlet46.de',origin);
    if (!home) cards = cards.replaceAll('<div class="col-6 col-sm-6','<div class="post col-6 col-sm-6');
    if (url.searchParams.get('page')==='2') cards = cards.replaceAll('1000','2000');
    const pagination = url.pathname==='/scroll/' && !url.searchParams.has('page') ? '<a class="pagination__next" href="/scroll/?page=2">2</a><button class="view-more-button">Mehr Artikel</button>' : '';
    const title = home?'LiveShopping':url.pathname.includes('/search/')?'Suchergebnisse':'Alle Artikel';
    const listing = '<section class="categoriegrid page-content container"><h1>'+title+'</h1><div class="row"><div class="col-12"><div class="leftsidecat">'+(home?'':f.controls+f.filters[filterKey].replaceAll('https://b2b.outlet46.de/damen-bekleidung/',origin+url.pathname))+'</div></div><div class="col-12">'+(url.searchParams.get('query')==='Nulltreffer'?'<p>Keine Treffer</p>':cards)+pagination+ '</div></div></section>';
    return '<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="alternate" hreflang="en" href="/en/category/">'+critical+'<link rel="stylesheet" href="/assets/main.min.css"><link rel="stylesheet" href="/assets/contact-widget.css"></head><body>'+f.header+
        '<main id="page-body" class="'+(home?'isHome':'')+'">'+(pdp?article(f,url.pathname,false):listing)+(url.searchParams.has('long-page')?'<div aria-hidden="true" style="height:2400px"></div>':'')+'</main>'+f.footer+f.contact+f.newsletter+f['modal-cross']+f.dynamicModal+f.backdrop+
        '<button id="totop">Nach oben</button><script type="application/json" id="app-data-custom">{"templateType":"'+(home?'home':pdp?'item':'category')+'"}</script>'+
        '<script>window.activeLang="de";window.messageServiceTranslations={searchexample:"Beispiele"};window.addEventListener("load",function(){eGuardians.initialize();document.body.dataset.ready="1"})</script>'+
        '<script src="/assets/jquery-3.7.1.min.js"></script><script defer src="/assets/core.min.js" data-eg-magiczoom-src="/assets/magiczoom.min.js" data-eg-matrix-src="/assets/matrix.min.js"></script>'+
        '<script defer src="/assets/'+bundle+'.min.js"'+(pdp?' data-eg-matrix':'')+'></script>'+(pdp?'<script defer src="/assets/magiczoom.min.js" data-eg-magiczoom></script>':'')+'<script defer src="/assets/facets.min.js"></script></body></html>';
}
const test = base.extend({
    shop: async ({context,page},use,info) => {
        const f = JSON.parse(read('.cache/cross-browser/fragments.json'));
        const requests=[], errors=[], failures=[];
        page.on('pageerror',e=>errors.push(e.message));
        page.on('console',m=>{ if(m.type()==='error') errors.push(m.text()); });
        page.on('requestfailed',r=>failures.push({url:r.url(),message:r.failure()?.errorText}));
        await context.route('**/*',async route=>{
            const req=route.request(), u=new URL(req.url()), p=u.pathname;
            requests.push([req.method(),u.host,p]);
            const html=body=>route.fulfill({contentType:'text/html; charset=utf-8',body});
            const json=data=>route.fulfill({json:{data}});
            const pic=color=>route.fulfill({contentType:'image/svg+xml',body:svg(color)});
            if (req.method()==='GET') {
                if(u.hostname==='images.example.test' && req.resourceType()==='image') return pic('steelblue');
                if(u.origin===origin) {
                    if(/^\/assets\/[a-z0-9.-]+\.(css|js)$/.test(p)) return route.fulfill({path:path.join(root,'resources',p.endsWith('.js')?'js':'css',path.basename(p))});
                    if(p.includes('/documents/fonts/') && /^[\w.-]+\.woff2?$/.test(path.basename(p))) return route.fulfill({path:path.join(root,'resources/documents/fonts',path.basename(p))});
                    if(req.resourceType()==='image') {
                        if(p==='/plugin/GuardiansBasicB2B/images/b2b-outlet46-logo.png') return route.fulfill({path:path.join(root,'resources/images/b2b-outlet46-logo.png')});
                        return pic(p.includes('green')?'green':p.includes('red')?'red':'steelblue');
                    }
                    if(p==='/rest/io/session/') return json({basket:{itemQuantity:0,itemWishListIds:[]}});
                    if(p==='/rest/io/facet/') return json({itemList:{total:6},facets:f.groups});
                    if(p.includes('/search/autocomplete/')) return json({item:[],suggestion:[{label:'Laufschuh'}]});
                    if(p==='/loginPreview/') return json({description1:'<h2>Anmelden</h2>'});
                    if(p==='/getShopBuilderContent/') return json({description1:'<a href="/en/">English</a>'});
                    if(p==='/rest/io/variations/batch') return json({items:Object.fromEntries([101,102].map((id,i)=>[id,{id,stock:5,images:[imageFor(i?'red':'green')]}]))});
                    if(p.startsWith('/product-') && u.searchParams.get('quickViewItem')==='true') return html(article(f,p,true));
                    if(/^\/(?:|category\/|alle-artikel\/|category-\d+\/|search\/|scroll\/|en\/category\/|product-\d+\/)$/.test(p)) return html(storefront(f,u));
                    if(p==='/favicon.ico') return route.fulfill({status:204});
                }
                // CDN references embedded in the real Twig get inert image bytes; no network passes through.
                if(req.resourceType()==='image' && /(^|\.)outlet46\.de$/.test(u.hostname)) return pic('slategray');
            }
            errors.push('Unmodelled request: '+req.method()+' '+u.origin+p);
            return route.abort('blockedbyclient');
        });
        const open=async (pathname='/alle-artikel/')=>{await page.goto(origin+pathname);await expect(page.locator('body')).toHaveAttribute('data-ready','1');};
        try { await use({open,requests,groups:f.groups}); }
        finally {
            await info.attach('browser-diagnostics',{body:JSON.stringify({requests,errors,failures},null,2),contentType:'application/json'});
            expect(errors,'Page, console and unexpected request errors').toEqual([]);
            expect(failures.filter(r=>!/ABORTED|cancelled|canceled|NS_BINDING_ABORTED/i.test(r.message||'')),'Failed requests').toEqual([]);
        }
    }
});
module.exports={test,expect,origin};

