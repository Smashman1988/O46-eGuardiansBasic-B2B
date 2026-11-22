// node tests/wish_list_template.cjs <Ceres root> <Twig autoloader> <Vue 2.6.12 SSR renderer> [results.json] [IT capture.html] [ES capture.html]
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');

const [reference, twig, renderer, output, itCapture, esCapture] = process.argv.slice(2);
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const resource = file => read(path.join(reference, 'resources', file));
const phpFlags = process.env.O46_PHP_EXT ? ['-d', 'extension_dir=' + process.env.O46_PHP_EXT, '-d', 'extension=mbstring'] : [];
function renderLayout(lang, dictionary) {
    return JSON.parse(execFileSync(process.env.O46_PHP || 'php', [...phpFlags, '-d', 'display_errors=stderr',
        path.join(__dirname, 'wish_list_layout.php'), twig, reference, lang], {encoding:'utf8',input:JSON.stringify(dictionary)}));
}
function readGroup(html) {
    const tags = [...html.matchAll(/<script\b[^>]*data-translation="Ceres::Template"[^>]*>([\s\S]*?)<\/script>/g)];
    assert.equal(tags.length,1,'Expected a single Ceres dictionary');
    return JSON.parse(tags[0][1]);
}
const sfc = resource('js/src/app/components/wishList/WishList.vue');
const template = sfc.match(/<template>\n([\s\S]*?)\n<\/template>/)[1].replace(/^  /gm, '');
const original = '|| inactiveVariationIds.length !== 0';
assert.equal(template.split(original).length, 2, 'Review the override against the new Ceres version');

function exposeLoader(file, entry) {
    const source = resource('js/dist/' + file);
    const boot = 'return __webpack_require__(__webpack_require__.s = "./resources/js/src/' + entry + '.js");';
    assert.ok(source.includes(boot), file + ' bootstrap');
    return source.replace(boot, file === 'ceres-server.js' ? 'return __webpack_require__;' : 'window.ceresRequire=__webpack_require__;');
}
const base = exposeLoader('ceres-base.js', 'base');
const server = new vm.Script(exposeLoader('ceres-server.js', 'entry-server'));
const chunks = fs.readdirSync(path.join(reference, 'resources/js/dist/chunks')).filter(f => /^ceres-\d+\.js$/.test(f))
    .map(f => resource('js/dist/chunks/' + f)).join('\n');
const renderToString = require(path.resolve(renderer));
const dictionaries = {};
for (const lang of ['de','en','fr']) {
    dictionaries[lang] = Object.fromEntries([...resource('lang/' + lang + '/Template.properties')
        .matchAll(/^(\w+)\s*=\s*"(.*)"\s*$/gm)].map(m => [m[1], m[2]]));
}
// Offline subset from the 426 Ceres dictionaries, or use full archived storefront responses.
dictionaries.it = itCapture ? readGroup(read(itCapture)) : {
    wishListNoItems:'Non hai articoli nella tua lista dei desideri.',wishListAvailability:'Disponibilità',wishListDelete:'Elimina'
};
dictionaries.es = esCapture ? readGroup(read(esCapture)) : {
    wishListNoItems:'No tienes ningún artículo en tu lista de deseos.',wishListAvailability:'Disponibilidad',wishListDelete:'Eliminar'
};
const labels = {
    de:['Nicht verfügbar','Varianten ID'],en:['Not available','Variation ID'],fr:['Non disponible','ID des variantes'],
    it:['Non disponibile','ID variante'],es:['No disponible','ID de variante']
};
const layouts = {};
for (const [lang,dictionary] of Object.entries(dictionaries)) {
    const rendered = layouts[lang] = renderLayout(lang,dictionary);
    assert.deepEqual(readGroup(rendered.originalTranslations),dictionary);
    const [availability,id] = labels[lang];
    assert.deepEqual(readGroup(rendered.translations),{
        ...dictionary,wishListInactiveItemAvailability:availability,wishListInactiveItemId:id
    },'Only missing labels may change: '+lang);
    assert.equal(rendered.template, template.replace(original, '&& inactiveVariationIds.length === 0')
        .replace('Ceres::Template.wishListInactiveItems','Ceres::Template.wishListInactiveItemAvailability'),
        'Review upstream changes outside the empty condition and unresolved-entry label');
}
for (const lang of ['it','es']) {
    const defaults = {wishListInactiveItemAvailability:labels[lang][0],wishListInactiveItemId:labels[lang][1]};
    for (const key of Object.keys(defaults)) {
        const merchant = {...dictionaries[lang],[key]:'Merchant wording'};
        assert.deepEqual(readGroup(renderLayout(lang,merchant).translations),{...defaults,...merchant},
            'Keep the configured '+key+' label for '+lang);
    }
}
const layout=layouts.de;

// This runs in the browser and, for hydration controls, in the Ceres server bundle's own JS realm.
function initialise({active, inactive, sessionIds, dictionary, lang, serverSide, count = false, heart = false}) {
    const req = globalThis.ceresRequire;
    globalThis.App = {urls:{wishList:'/wish'}, templateType:'wish-list', isSSR:!!serverSide, language:lang, decimalSeparator:'.',
        config:{item:{},global:{shippingCostsCategoryId:0},log:{data:[]}}};
    // The server gets the SSR:global payload. The client service reads the actual rendered script tag.
    if (serverSide) globalThis.translations = {Ceres:{Template:dictionary}};
    const Vue = req('./node_modules/vue/dist/vue.js');
    const hooks = req('./resources/js/src/mount.js');
    if (serverSide) Vue.component = hooks.component;
    else {
        Vue.prototype.$mount = hooks.mount;
        window.$ = window.jQuery = req('./node_modules/jquery/dist/jquery.js');
    }
    const component = name => req('./resources/js/src/app/components/' + name + '.vue');
    const store = req('./resources/js/src/app/store/index.js').createStore();
    const componentNames = {'quantity-input':'item/QuantityInput','icon':'pageDesign/Icon','loading-animation':'pageDesign/LoadingAnimation',
        'add-to-basket':'basket/AddToBasket','wish-list-count':'wishList/WishListCount','add-to-wish-list':'item/AddToWishList'};
    for (const [name, file] of Object.entries(componentNames)) Vue.component(name,component(file).default);
    Vue.component('wish-list', () => Promise.resolve(component('wishList/WishList')));
    Vue.directive('tooltip',{});
    Vue.directive('waiting-animation-infinite',{});
    Vue.prototype.$ceres = App;
    Vue.prototype.$translate = req('./resources/js/src/app/services/TranslationService.js').default.translate;
    const filters = {itemURL:d=>'/product/'+d.variation.id,itemName:d=>'Item '+d.variation.id,
        itemImage:()=>'',itemImages:()=>[],currency:String,numberFormat:String,hasItemDefaultPrice:()=>true};
    for (const [name, fn] of Object.entries(filters)) Vue.filter(name,fn);
    const problems = [];
    Vue.config.errorHandler = (err, _vm, info) => problems.push(info + ': ' + err.message);
    Vue.config.warnHandler = msg => problems.push(msg);
    const rows = ids => ids.map(id => ({id, data:{variation:{id,intervalOrderQuantity:1,minimumOrderQuantity:1,
        maximumOrderQuantity:5,availability:{id:1,names:{name:'OK'}}},item:{id},prices:{default:{unitPrice:{value:0}}},
        unit:{unitOfMeasurement:'C62',content:1},properties:[],attributes:[],images:{},texts:{name1:'Item '+id},filter:{isSalable:true}}}));
    store.commit('setWishListItems',rows(active));
    store.commit('setInactiveVariationIds',inactive);
    store.commit('setWishListIds',sessionIds);
    store.commit('setUserData',{id:7});
    const app = new Vue({store,render(h){
        const children = [h('wish-list')];
        if(count) children.push(h('wish-list-count'));
        if(heart) children.push(h('add-to-wish-list',{props:{variationId:905}}));
        return h('main',{attrs:{id:'vue-app'}},children);
    }});
    globalThis.fixture = {app, store, problems, rows, Vue};
    if (!serverSide) window.ceresStore = store;
}
const results = {routes:layout.routes, matrix:[], languages:[], translationBaseline:[], hydration:[], buttons:[], persistence:[]};
function serverMarkup(input) {
    const scope = vm.createContext({module:{exports:{}},require,process:{env:{VUE_ENV:'server'}},console,setTimeout,clearTimeout,
        templates:{'wish-list':layout.template}, translations:{}, input:{...input,serverSide:true}});
    scope.global = scope;
    server.runInContext(scope);
    scope.ceresRequire = scope.module.exports;
    vm.runInContext('('+initialise.toString()+')(input)',scope);
    return new Promise((resolve,reject)=>renderToString(scope.fixture.app,(err,html)=>{
        if(err)return reject(err);
        if(scope.fixture.problems.length)return reject(Error(scope.fixture.problems.join('\n')));
        resolve(html);
    }));
}

async function run() {
    const browser = await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    results.chrome = browser.version();
    const browserErrors = [];
    const unexpectedRequests = [];
    let ctx, page;
    const origin = 'https://wish.test';
    let markup, articleIds, inactiveIds;
    let requestLog, wishlistResponse, answerWishlist, expectedWrite;
    async function handleRequest(route) {
        const {pathname,origin:host} = new URL(route.request().url());
        const method=route.request().method();
        if(host!==origin) {
            unexpectedRequests.push(method+' '+host+pathname);
            return route.abort();
        }
        if(pathname==='/')return route.fulfill({contentType:'text/html; charset=utf-8',body:markup});
        if(pathname==='/base.js'||pathname==='/chunks.js') return route.fulfill({contentType:'text/javascript',body:pathname==='/base.js'?base:chunks});
        const request=method+' '+pathname;
        requestLog.push(request);
        if(method==='GET'&&pathname==='/rest/io/itemWishList') {
            return route.fulfill({status:200,json:await wishlistResponse});
        }
        if(request !== expectedWrite) {
            unexpectedRequests.push(request);
            return route.fulfill({status:405,body:''});
        }
        expectedWrite=null;
        if(method==='POST'&&pathname==='/rest/io/itemWishList') {
            assert.equal(new URLSearchParams(route.request().postData()).get('variationId'),'905');
            articleIds.push(905);
        } else if(method==='DELETE'&&/^\/rest\/io\/itemWishList\/\d+$/.test(pathname)) {
            const id=Number(pathname.split('/').pop());
            articleIds=articleIds.filter(x=>x!==id);
            inactiveIds=inactiveIds.filter(x=>x!==id);
        } else throw Error('Unexpected manual action '+request);
        await route.fulfill({status:200,json:{data:true,events:{}}});
    }
    async function newSession() {
        if(ctx) await ctx.close();
        ctx=await browser.newContext({serviceWorkers:'block'});
        await ctx.route('**/*',handleRequest);
        page=await ctx.newPage();
        page.on('pageerror',e=>browserErrors.push(e.message));
        page.on('console',msg=>{if(msg.type()==='error') browserErrors.push(msg.text());});
    }
    async function boot(opts) {
        const {a=[],i=[],fixed=true,lang='de',reload=false,keepSaved=false,ssr=false,count=false,heart=false,originalTranslations=false}=opts;
        if(!reload && !keepSaved) {
            articleIds=[...a];
            inactiveIds=[...i];
        }
        const savedBefore={active:[...articleIds],inactive:[...inactiveIds]};
        assert.deepEqual(savedBefore,{active:a,inactive:i});
        requestLog=[];
        wishlistResponse=new Promise(resolve=>{answerWishlist=resolve;});
        const group=originalTranslations ? layouts[lang].originalTranslations : layouts[lang].translations;
        const input={active:ssr?articleIds:[],inactive:ssr?inactiveIds:[],sessionIds:[...articleIds,...inactiveIds],dictionary:readGroup(group),lang,count,heart};
        const rendered=ssr?await serverMarkup(input):'<main id="vue-app"></main>';
        markup='<!doctype html><html lang="'+lang+'"><head>'+(fixed?layouts[lang].markup:'')+group+'</head><body>'+rendered+
            '<script src="/base.js"></script><script src="/chunks.js"></script></body></html>';
        if(reload)await page.reload();else await page.goto(origin);
        await page.evaluate(initialise,input);
        const before=await page.evaluate(ssr=>{
            const root=document.querySelector('#vue-app');
            const empty=!!root.querySelector('p.text-muted.text-center');
            const text=root.querySelector('.mt-5 .h4')?.textContent;
            const idLabel=root.querySelector('.badge-danger')?.closest('.position-relative').querySelector('strong').textContent.trim();
            const badge=root.querySelector('.badge-danger')?.textContent.trim();
            fixture.app.$mount(root,ssr);
            return {empty,text,idLabel,badge,rootReused:fixture.app.$el===root};
        },ssr);
        await page.waitForFunction(()=>fixture.store.state.wishList.isLoading);
        assert.equal(await page.locator('.loading-animation').count(),1);
        assert.equal(await page.locator('p.text-muted.text-center').count(),0);
        const documents=await page.evaluate(ids=>fixture.rows(ids),articleIds);
        answerWishlist({data:{documents,inactiveVariationIds:inactiveIds},events:{}});
        await page.waitForFunction(()=>!fixture.store.state.wishList.isLoading);
        await page.evaluate(()=>fixture.Vue.nextTick());
        const observed=await page.evaluate(()=>({
            ids:[...fixture.store.state.wishList.wishListIds],
            badges:[...document.querySelectorAll('.badge-danger')].map(el=>el.textContent.trim()),
            idLabels:[...document.querySelectorAll('.badge-danger')].map(el=>el.closest('.position-relative').querySelector('strong').textContent.trim()),
            rawKeys:[...new Set(document.querySelector('#vue-app').innerText.match(/\w+::Template\.\w+/g)||[])],
            listCount:fixture.app.$children.filter(c=>c.$options.name==='wish-list').length,
            active:[...document.querySelectorAll('.item-name')].map(el=>Number(el.getAttribute('href').split('/').pop())),
            inactive:[...document.querySelectorAll('.badge-danger')].map(el=>Number(el.closest('.position-relative').querySelector('span').textContent)),
            empty:document.querySelector('p.text-muted.text-center')?.textContent.trim()||null,
            unavailable:document.querySelector('.mt-5 .h4')?.textContent.trim()||null,
            component:fixture.app.$children.find(child=>child.$options.name==='wish-list')?.$options.name,errors:fixture.problems
        }));
        assert.deepEqual(observed.errors,[]);assert.equal(observed.component,'wish-list');
        assert.deepEqual(observed.active,a);assert.deepEqual(observed.inactive,i);
        const availability=originalTranslations?'Ceres::Template.wishListInactiveItemAvailability':labels[lang][0];
        const idLabel=originalTranslations?'Ceres::Template.wishListInactiveItemId':labels[lang][1];
        assert.deepEqual(observed.badges,i.map(()=>availability));
        assert.deepEqual(observed.idLabels,i.map(()=>idLabel+':'));
        assert.equal(observed.listCount,1);
        assert.deepEqual(observed.rawKeys.sort(),originalTranslations?[availability,idLabel].sort():[]);
        assert.equal(observed.unavailable,i.length?(fixed?availability:dictionaries[lang].wishListInactiveItems):null);
        const shouldBeEmpty=!a.length&&!i.length;
        assert.equal(observed.empty,(fixed?shouldBeEmpty:(!a.length||i.length))?dictionaries[lang].wishListNoItems:null);
        assert.deepEqual(requestLog,['GET /rest/io/itemWishList']);
        const savedAfter={active:[...articleIds],inactive:[...inactiveIds]};
        assert.deepEqual(savedAfter,savedBefore);
        assert.deepEqual(observed.ids,[...a,...i]);
        assert.equal(new Set(observed.ids).size,observed.ids.length);
        assert.equal(await page.locator('.loading-animation').count(),0);
        return {observed,before,savedBefore,savedAfter,loadingChecked:true,meetsExpectation:!!observed.empty===shouldBeEmpty,requests:[...requestLog]};
    }
    async function clickAndCheck(selector,request,remaining) {
        const start=requestLog.length;
        expectedWrite=request;
        const [response]=await Promise.all([
            page.waitForResponse(r=>r.request().method()+' '+new URL(r.url()).pathname===request),
            selector.click()
        ]);
        assert.equal(response.status(),200);
        await page.waitForFunction(n=>document.querySelector('a.nav-link .badge-right').textContent.trim()===String(n),remaining.length);
        await page.waitForFunction(()=>!fixture.app.$children.find(c=>c.$options.name==='add-to-wish-list').isLoading);
        assert.deepEqual(requestLog.slice(start),[request]);
        assert.deepEqual(await page.evaluate(()=>fixture.store.state.wishList.wishListIds),remaining);
        assert.deepEqual(await page.evaluate(()=>fixture.problems),[]);
        assert.deepEqual([...articleIds,...inactiveIds].sort(),[...remaining].sort());
        results.buttons.push({request,status:response.status(),remaining});
    }
    try {
        await newSession();
        for(const fixed of [false,true])for(const [a,i] of [[[],[]],[[101],[]],[[101],[202]],[[],[202]],[[101,102],[]]]){
            for(const reload of [false,true]){
                const state=await boot({a,i,fixed,reload});results.matrix.push({a,i,fixed,reload,...state});
            }
        }
        for(const lang of ['it','es']){
            const original=await boot({lang,i:[202],originalTranslations:true});
            results.translationBaseline.push({lang,observed:original.observed});
        }
        for(const lang of Object.keys(labels)){
            await boot({lang});
            for(const reload of [false,true]){
                const state=await boot({lang,i:[202],reload});
                results.languages.push({lang,reload,...state});
            }
            const state=await boot({lang,i:[202],ssr:true});
            assert.ok(state.before.rootReused);
            assert.equal(state.before.text,labels[lang][0]);
            assert.equal(state.before.badge,labels[lang][0]);
            assert.equal(state.before.idLabel,labels[lang][1]+':');
            results.hydration.push({lang,i:[202],...state.before});
        }
        for(const [a,i] of [[[],[]],[[101],[202]],[[],[202]]]){
            const {before}=await boot({ssr:true,a,i});
            assert.equal(before.empty,!a.length&&!i.length);assert.ok(before.rootReused);
            if(i.length)assert.equal(before.text,dictionaries.de.wishListInactiveItemAvailability);
            results.hydration.push({a,i,...before});
        }
        await boot({a:[101],i:[202],count:true,heart:true});
        const heart=()=>page.getByRole('button',{name:dictionaries.de.singleItemWishList,exact:true});
        await clickAndCheck(heart(),'POST /rest/io/itemWishList',[101,202,905]);
        const mixed={a:[101,905],i:[202],count:true,heart:true};
        results.persistence.push({step:'reload after add',...await boot({...mixed,reload:true})});
        await newSession(); // Fresh browser context and Vuex store, same simulated account and saved rows.
        results.persistence.push({step:'fresh authenticated fixture session',...await boot({...mixed,keepSaved:true})});
        await clickAndCheck(heart(),'DELETE /rest/io/itemWishList/905',[101,202]);
        results.persistence.push({step:'reload after manual removal',...await boot({a:[101],i:[202],count:true,heart:true,reload:true})});
        const remove=page.locator('[data-testing="remove-wlist-item"]');
        await clickAndCheck(remove.first(),'DELETE /rest/io/itemWishList/101',[202]);
        await clickAndCheck(remove.last(),'DELETE /rest/io/itemWishList/202',[]);
        assert.equal(await page.locator('p.text-muted.text-center').textContent(),dictionaries.de.wishListNoItems);
        assert.deepEqual([articleIds,inactiveIds],[[],[]]);
        assert.deepEqual(unexpectedRequests,[]);
        assert.deepEqual(browserErrors,[]);
        results.browserErrors=browserErrors;
        results.unexpectedRequests=unexpectedRequests;
        const passed=fixed=>results.matrix.filter(m=>m.fixed===fixed&&m.meetsExpectation).length;
        assert.equal(passed(false),6);assert.equal(passed(true),10);
        console.log('Display original '+passed(false)+'/10; override '+passed(true)+'/10; 8 routes per language; '
            +results.languages.length+' language checks; '+results.hydration.length+' SSR/hydration cases; 4 manual writes; persistence across reload and a fresh fixture session.');
        if(output)fs.writeFileSync(output,JSON.stringify(results,null,2)+'\n');
    } finally {await browser.close();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
