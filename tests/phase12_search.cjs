// Real DOM/jQuery comparison with controlled API responses and debounce scheduling.
// No shop access and no synthetic timing claim; counts cover the active functions.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const assert = require('node:assert/strict'), acorn = require('acorn');
const { chromium } = require(process.env.O46_PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), baseline = 'e14291483ab2d0f77f1b3c5302665923da1cbb1c';
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const before = f => cp.execFileSync('git', ['show', baseline + ':' + f], {cwd:root,encoding:'utf8',maxBuffer:4e6});
function method(source, name) {
    const matches=[];
    function visit(n) {
        if (!n?.type) return;
        if(n.type==='AssignmentExpression' && n.left.property?.name===name) {
            const v=n.right.type==='LogicalExpression'?n.right.right:n.right;
            if(v.type==='FunctionExpression') matches.push(source.slice(v.start,v.end));
        }
        for(const v of Object.values(n)) {if(Array.isArray(v))v.forEach(visit);else if(v?.type)visit(v);}
    }
    visit(acorn.parse(source,{ecmaVersion:'latest'}));assert.equal(matches.length,1,name);return matches[0];
}
const versions=[
    {name:'before',search:before('resources/js/search.js'),core:before('resources/js/core.js')},
    {name:'source',search:read('resources/js/search.js'),core:read('resources/js/core.js')},
    {name:'min',search:read('resources/js/core.min.js'),core:read('resources/js/core.min.js')}
];
const queries=['alpha','[a]+','a\\bc','(a.*)','^$?{}','"<&>','Ärger','Caffè','ÉCOLE','niño','straße','😀 mode','  alpha  '];
const rows=[];
async function scenario(browser,version,lang) {
    const p=await browser.newPage({viewport:{width:lang==='en'?1440:390,height:720}}),errors=[];
    p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.abort());
    try {
        await p.setContent(`<html lang="${lang}"><div data-eg-search><div class="search-wrap"><form action="https://fixture.invalid/${lang}/custom-search/"><input data-eg-livesearch></form></div><div class="related-search">Related</div></div></html>`);
        await p.addScriptTag({content:read('resources/js/jquery-3.7.1.min.js')});
        await p.evaluate(({search,helper,lang})=>{
            window.activeLang=lang;window.messageServiceTranslations={searchexample:'Suggestions '+lang};
            window.pending=[];window.timers=new Map();let next=0;
            window.setTimeout=(fn,delay)=>{timers.set(++next,{fn,delay});return next};
            window.clearTimeout=id=>timers.delete(id);
            window.flush=()=>{const batch=[...timers.values()];timers.clear();batch.forEach(t=>{if(t.delay!==400)throw Error('Changed debounce');t.fn()});return batch.length};
            window.eGuardians={events:{},helper:{autoCompleteReg:eval('('+helper+')')},apiservice:{get:(url,params,callback)=>pending.push({url,params,callback})}};
            window.input=document.querySelector('input');window.counts={};
            const count=(key,n=1)=>counts[key]=(counts[key]||0)+n;
            const jq=window.$;
            window.$=new Proxy(jq,{apply(target,receiver,args){
                if(args[0]===input)count('inputWrappers');
                if(Array.isArray(args[0])){count('arrayWrappers');count('copiedArraySlots',args[0].length)}
                if(args[0]==='.list-autocomplete')count('listSelectors');
                return Reflect.apply(target,receiver,args);
            }});
            for(const name of ['val','get','children']){const fn=jq.fn[name];jq.fn[name]=function(...args){
                if(name==='val'&&!args.length&&this[0]===input)count('valueReads');
                if(name==='get'&&!args.length)count('arrayCopies');
                if(name==='children')count('childrenCollections');
                return fn.apply(this,args);
            }}
            const action=Object.getOwnPropertyDescriptor(HTMLFormElement.prototype,'action');
            Object.defineProperty(HTMLFormElement.prototype,'action',{...action,get(){count('formActionReads');return action.get.call(this)}});
            window.RegExp=new Proxy(window.RegExp,{construct(target,args){if(args[1]==='i')count('highlightCompiles');return Reflect.construct(target,args)}});
            eGuardians.events.initLiveSearch=eval('('+search+')');
            eGuardians.events.initLiveSearch(input);eGuardians.events.initLiveSearch(input);
            window.enter=query=>{input.value=query;input.dispatchEvent(new Event('input',{bubbles:true}))};
            window.snapshot=()=>{
                const copy=document.querySelector('[data-eg-search]').cloneNode(true);
                // The later Escape fix deliberately adds combobox metadata. Compare
                // all pre-existing markup unchanged; search_escape.cjs tests real ARIA.
                const omit=(node,name,expected)=>{if(expected.test(node.getAttribute(name)||''))node.removeAttribute(name)};
                for(const node of copy.querySelectorAll('[data-eg-livesearch]')){
                    omit(node,'role',/^combobox$/);omit(node,'aria-autocomplete',/^list$/);
                    omit(node,'aria-expanded',/^(true|false)$/);omit(node,'aria-controls',/^eg-autocomplete-\d+$/);
                    omit(node,'aria-activedescendant',/^eg-autocomplete-\d+-\d+$/);
                }
                for(const node of copy.querySelectorAll('.row-search-wrap')){
                    omit(node,'role',/^listbox$/);omit(node,'id',/^eg-autocomplete-\d+$/);
                }
                for(const node of copy.querySelectorAll('.list-autocomplete, .list-autocomplete-suggestion')){
                    omit(node,'role',/^group$/);
                    for(const item of node.children){
                        omit(item,'role',/^option$/);omit(item,'id',/^eg-autocomplete-\d+-\d+$/);
                        omit(item,'aria-selected',/^(true|false)$/);
                    }
                }
                return {html:copy.outerHTML,value:input.value};
            };
            document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault()});
        },{search:method(version.search,'initLiveSearch'),helper:method(version.core,'autoCompleteReg'),lang});
        const data=await p.evaluate(queries=>{
            const rendered=[];
            for(const query of queries){
                enter(query);const scheduled=flush();counts={};
                const response={data:{
                    item:Array.from({length:20},(_,i)=>({label:i+' '+query.toUpperCase()+' <img src=x onerror="window.injected=1"> & '+query,url:'/product/'+i,image:''})),
                    suggestion:Array.from({length:12},(_,i)=>({label:query+' suggestion '+i}))
                }};
                pending.at(-1).callback(response,200);
                rendered.push({query,scheduled,state:snapshot(),counts:{...counts},request:pending.at(-1).params});
            }
            enter('no hits');flush();counts={};pending.at(-1).callback({data:{item:[],suggestion:[]}},200);const emptyResponseCounts={...counts};
            enter('alpha');flush();pending.at(-1).callback({data:{item:[{label:'ALPHA',url:'/one'},{label:'alpha 2',url:'/two'}],suggestion:[]}},200);
            counts={};const keys=[];
            for(const keyCode of [40,40,40,38,13]){const e=$.Event('keydown',{keyCode});$(input).trigger(e);keys.push({keyCode,prevented:e.isDefaultPrevented(),...snapshot()})}
            const keyboardCounts={...counts};
            const requestsBefore=pending.length;counts={};enter('fast');enter('faster');enter('fastest');
            const pendingTimers=timers.size;const burstCounts={...counts};flush();
            const burstRequests=pending.length-requestsBefore;
            const old=pending.at(-1);enter('other');enter('fastest');old.callback({data:{item:[{label:'STALE'}],suggestion:[]}},200);
            const stale=snapshot();flush();pending.at(-1).callback({},503);const failure=snapshot();
            enter('recovered');flush();pending.at(-1).callback({data:{item:[{label:'Recovered <script>window.injected=2</script>',url:'/recovered'}],suggestion:[]}},200);
            const recovery=snapshot();enter('');const emptyPending=timers.size;flush();const empty=snapshot();
            const legacy=[];
            for(const query of queries.concat([''])){input.value=query;for(const label of ['ALPHA <script>bad()</script>','0','ÄRGER Caffè École Niño',query])legacy.push(eGuardians.helper.autoCompleteReg($(input),label)[0].outerHTML)}
            return {rendered,emptyResponseCounts,keys,keyboardCounts,pendingTimers,burstRequests,burstCounts,stale,failure,recovery,empty,emptyPending,legacy,
                injected:window.injected||0,handlers:($._data(input,'events').input||[]).length,delays:[...timers.values()].map(t=>t.delay)};
        },queries);
        assert.equal(data.injected,0);assert.deepEqual(errors,[]);assert.equal(data.handlers,1);
        assert.equal(data.emptyResponseCounts.highlightCompiles||0,0,'No matcher for an empty result');
        assert.equal(data.pendingTimers,1);assert.equal(data.burstRequests,1);assert.equal(data.emptyPending,1);
        assert.ok(!data.stale.html.includes('STALE'));assert.ok(!data.failure.html.includes('row-search-wrap'));
        assert.ok(data.recovery.html.includes('Recovered &lt;script&gt;'));assert.ok(!data.empty.html.includes('row-search-wrap'));
        return {version:version.name,lang,...data};
    } finally {await p.close()}
}
(async()=>{
    const browser=await chromium.launch({executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try {for(const lang of ['de','en','fr','it','es']){
        const original=await scenario(browser,versions[0],lang);rows.push(original);
        for(const version of versions.slice(1)){
            const current=await scenario(browser,version,lang);
            for(const key of ['keys','stale','failure','recovery','empty','legacy'])assert.deepEqual(current[key],original[key],lang+' '+key);
            for(let i=0;i<queries.length;i++){
                const a=original.rendered[i],b=current.rendered[i];assert.deepEqual(b.state,a.state,lang+' '+queries[i]);
                const expected={...a.request,types:['it','es'].includes(lang)?['item','suggestion']:['item','category','suggestion']};
                assert.deepEqual(b.request,expected);assert.equal(a.counts.highlightCompiles,25);assert.equal(b.counts.highlightCompiles,1);
                assert.equal(a.counts.formActionReads,5);assert.equal(b.counts.formActionReads,1);
                assert.equal(a.counts.copiedArraySlots,32);assert.equal(b.counts.copiedArraySlots||0,0);
            }
            assert.equal(original.keyboardCounts.arrayCopies,5);assert.equal(current.keyboardCounts.arrayCopies||0,0);
            assert.equal(original.keyboardCounts.listSelectors,12);assert.equal(current.keyboardCounts.listSelectors,4);
            rows.push(current);
        }
    }}finally{await browser.close();}
    const report={status:'PASS',baseline,scenarios:rows.length,renderComparisons:queries.length*10,legacyHelperComparisons:(queries.length+1)*4*10,rows};
    if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify({status:'PASS',scenarios:rows.length,renderComparisons:report.renderComparisons,legacyHelperComparisons:report.legacyHelperComparisons}));
})().catch(e=>{console.error(e);process.exitCode=1});
