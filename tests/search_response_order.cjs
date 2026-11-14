const { readAsset } = require('./theme_assets.cjs');
// Isolated browser regression: real search handlers, controlled response ordering.
// No shop requests; this is not native deployment or INP acceptance.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),acorn=require('acorn');
const {chromium}=require(process.env.O46_PLAYWRIGHT_MODULE||'playwright');
const dir=path.resolve(process.env.O46_SEARCH_ASSETS||path.join(__dirname,'../resources/js'));
const jquery=readAsset(path.join(__dirname,'../resources/js/jquery-3.7.1.min.js'),'utf8');
const report={mode:'ISOLATED_ORIGINAL_HANDLERS_CONTROLLED_RESPONSES',rows:[],errors:[],browserClosed:false};
function handlers(file){
    const source=readAsset(path.join(dir,file),'utf8'),found={};
    function walk(node){
        if(!node?.type)return;
        if(node.type==='AssignmentExpression'&&node.left.type==='MemberExpression'){
            const key=node.left.property.name;
            if((key==='events'&&node.right.type==='NewExpression')||key==='autoCompleteReg'){
                assert.ok(!found[key]);found[key]=source.slice(node.right.start,node.right.end);
                if(key==='events')found.owner=node.left.object.name;
            }
        }
        for(const child of Object.values(node)){if(Array.isArray(child))child.forEach(walk);else if(child?.type)walk(child);}
    }
    walk(acorn.parse(source,{ecmaVersion:'latest'}));assert.ok(found.events&&found.autoCompleteReg&&found.owner);
    return `window.pending=[];window.eGuardians={helper:{autoCompleteReg:(${found.autoCompleteReg})},apiservice:{get:(url,params,cb)=>pending.push({url,params,cb})}};
        (function(${found.owner}){eGuardians.events=${found.events}})(eGuardians);
        eGuardians.events.initLiveSearch(document.querySelector('input'));`;
}
async function scenario(browser,file,code,lang){
    const width=['en','it'].includes(lang)?1440:390,p=await browser.newPage({viewport:{width,height:700}}),errors=[];
    p.setDefaultTimeout(5000);p.on('pageerror',e=>errors.push(e.message));
    try{
        await p.route('**/*',route=>route.abort());
        await p.setContent(`<html lang="${lang}"><div data-eg-search><div class="search-wrap"><form action="/${lang}/search/"><input data-eg-livesearch><button>Search</button></form></div><div class="related-search">Related</div></div></html>`);
        await p.addScriptTag({content:jquery});await p.evaluate(l=>{window.activeLang=l;window.messageServiceTranslations={searchexample:'Suggestions'}},lang);
        await p.addScriptTag({content:code});const input=p.locator('input');
        const fill=async(query,count)=>{await input.fill(query);await p.waitForFunction(n=>pending.length===n,count)};
        const reply=(index,label)=>p.evaluate(({index,label})=>pending[index].cb({data:{item:[{label,url:'/product/'+label}],suggestion:[{label:'Suggestion '+label}]}}),{index,label});
        const snapshot=()=>p.evaluate(()=>({value:document.querySelector('input').value,text:document.querySelector('.row-search-wrap')?.textContent||'',loading:document.querySelector('[data-eg-search]').classList.contains('search-loading'),requests:pending.map(x=>({url:x.url,query:x.params.query}))}));
        const checks=[];
        await fill('alpha',1);await input.fill('');await p.waitForTimeout(450);
        const cleared=await snapshot();await reply(0,'OLD alpha');let actual=await snapshot();
        checks.push({name:'clear while request pending',pass:!cleared.loading&&!actual.loading&&!actual.text,cleared,actual});
        await fill('alpha',2);await fill('beta',3);await reply(2,'NEW beta');await reply(1,'OLD alpha');actual=await snapshot();
        checks.push({name:'latest response wins out of order',pass:actual.text.includes('NEW beta')&&!actual.text.includes('OLD alpha'),actual});
        await fill('alpha',4);await input.fill('beta');await input.fill('alpha');
        // The old A response arrives before the new debounce fires: value equality alone is insufficient.
        await reply(3,'OLD alpha');const duringDebounce=await snapshot();
        await p.waitForFunction(()=>pending.length===5);await reply(4,'LATEST alpha');actual=await snapshot();
        checks.push({name:'A-B-A rejects older identical query before debounce fires',pass:!duringDebounce.text.includes('OLD alpha')&&actual.text.includes('LATEST alpha')&&!actual.text.includes('OLD'),duringDebounce,actual});
        await input.fill('a');await p.waitForTimeout(450);actual=await snapshot();
        checks.push({name:'short input removes full suggestion row and loader',pass:!actual.text&&!actual.loading&&actual.requests.length===5,actual});
        const endpoint='/rest/'+(['it','es'].includes(lang)?'guardiansbasicb2b':'io')+'/item/search/autocomplete/';
        checks.push({name:'existing debounce and language endpoint preserved',pass:actual.requests.length===5&&actual.requests.every(x=>x.url===endpoint)});
        report.rows.push({file,lang,width,checks,status:checks.every(x=>x.pass)&&!errors.length?'PASS':'FAIL',errors});
    }catch(error){report.rows.push({file,lang,width,status:'TECHNICAL_ABORT',error:String(error),errors});}
    finally{await p.close();}
}
(async()=>{
    const browser=await chromium.launch({headless:true,executablePath:process.env.O46_BROWSER_EXECUTABLE});
    try{
        const tasks=[];
        for(const name of ['main','cat','item','vue'])for(const suffix of ['.js','.min.js']){
            const file=name+suffix,code=handlers(file);
            for(const lang of ['de','en','fr','it','es'])tasks.push(()=>scenario(browser,file,code,lang));
        }
        for(let i=0;i<tasks.length;i+=4)await Promise.all(tasks.slice(i,i+4).map(run=>run()));
    }finally{await browser.close();report.browserClosed=true;if(process.argv[2])fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2)+'\n');}
    const counts=report.rows.reduce((r,x)=>(r[x.status]=(r[x.status]||0)+1,r),{});
    console.log(JSON.stringify({scenarios:report.rows.length,counts,browserClosed:report.browserClosed}));
    assert.equal(report.rows.filter(x=>x.status==='PASS').length,40,'All source/minified/language scenarios pass');
})().catch(error=>{console.error(error);process.exitCode=1});
