// One anonymous document read. No cookies, no redirect, no asset or shop-function requests.
const fs = require('node:fs');
const versions = require('../../resources/asset-versions.json');
async function inspect() {
    const response = await fetch('https://b2b.outlet46.de/alle-artikel/',{redirect:'manual',signal:AbortSignal.timeout(12000)});
    if (response.status !== 200) return {status:'blocked',http:response.status};
    const html = await response.text();
    const assets = [];
    for (const [,attribute] of html.matchAll(/<(?:link|script)\b[^>]*?\b(?:href|src)=["']([^"']+)["']/gi)) {
        const match = attribute.match(/\/plugin\/(\d+)\/guardiansbasicb2b\/(css\/main\.min\.css|js\/core\.min\.js)\?v=(\d+)\b/i);
        if (match) assets.push({pluginset:match[1],asset:match[2],version:Number(match[3])});
    }
    const confirmed = assets.length>0 && assets.every(a=>a.pluginset==='426') &&
        ['css/main.min.css','js/core.min.js'].every(name=>assets.some(a=>a.asset===name && a.version===versions[name]));
    return {status:confirmed?'matching HTML references only':'blocked',assets};
}
inspect().catch(error=>({status:'blocked',reason:error.name})).then(result=>{
    const dir='.cache/cross-browser';
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(dir+'/preview.json',JSON.stringify(result,null,2));
    console.log(JSON.stringify(result));
});

