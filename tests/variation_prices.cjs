const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const acorn = require('acorn');

// Run the actual IO success callbacks and their shared formatter, also in the
// shipped bundles. Only jQuery's element interface and the IO reply are fixtures.
function findSource(file, predicate) {
    const source = fs.readFileSync('resources/js/' + file, 'utf8'), found = [];
    function walk(node) {
        if (!node?.type) return;
        const result = predicate(node, source);
        if (result) found.push(source.slice(result.start, result.end));
        for (const child of Object.values(node)) if (Array.isArray(child)) child.forEach(walk); else if (child?.type) walk(child);
    }
    walk(acorn.parse(source, {ecmaVersion:'latest'}));
    assert.equal(found.length, 1, file);
    return found[0];
}
const entries = ['item.js','listing-item.js','item.min.js','main.min.js','cat.min.js','vue.min.js'];
const amounts = (v, alt) => v === undefined ? null : {unitPrice:{value:v}, data:{unitPrice:alt}};
const cases = [
    ['4.99','9.99','4,99','9,99','5,00','-50'], [4.99,undefined,'4,99','','',''],
    [4.99,'0.00','4,99','','',''], [4.99,2.5,'4,99','','',''], [4.99,4.99,'4,99','','',''],
    ['N / A',9.99,'','','',''], [4.99,'N / A','4,99','','',''], [undefined,undefined,'','','',''],
    [0,9.99,'0,00','9,99','9,99','-100'], [12.5,25,'12,50','25,00','12,50','-50']
];
for (const entry of entries) {
    const formatter = findSource(entry.includes('.min.')?'core.min.js':'core.js', n =>
        n.type==='AssignmentExpression' && n.left.object?.name==='O46Core' && n.left.property?.name==='updateVariationPrices' && n.right);
    const callback = findSource(entry, (n,s) => n.type==='CallExpression' && n.callee.property?.name==='get' &&
        n.arguments[0]?.type==='BinaryExpression' && s.slice(n.arguments[0].start,n.arguments[0].end).includes('/rest/io/variations/') &&
        n.arguments[2]?.type==='FunctionExpression' && s.slice(n.arguments[2].start,n.arguments[2].end).includes('data-eg-item-nr') && n.arguments[2]);
    const state=new Map();
    function node(key) {
        if (!state.has(key)) state.set(key,{value:'',hidden:false,set(v){this.value=String(v);return this;},html(v){return this.set(v);},text(v){return this.set(v);},
            parent(){return node(key+':parent');}, toggleClass(c,hidden){assert.equal(c,'d-none');this.hidden=hidden;return this;},
            attr(){return this;}, removeClass(){return this;}});
        return state.get(key);
    }
    let dispatched=0;
    const ctx=vm.createContext({Intl, $:node, $itemElement:{find:node}, messageServiceTranslations:{stockWarn3:'ok'}, O46Core:{},
        document:{createEvent:()=>({initEvent(){}}),dispatchEvent(){dispatched++;}}});
    ctx.O46Core.updateVariationPrices=vm.runInContext('('+formatter+')',ctx);
    const apply=vm.runInContext('('+callback+')',ctx);
    for (const [price,rrp,p,r,s,pct] of cases) {
        apply({data:{documents:[{data:{stock:{net:8},images:{variation:[]},variation:{number:'test',availability:{id:1,names:{name:'ok'}}},
            prices:{default:amounts(price,999),rrp:amounts(rrp,1000),graduatedPrices:[]}}}]}});
        for (const [attr,value] of [['price',p],['rrp',r],['rrp-spar',s],['rrp-percent',pct]]) assert.equal(node('[data-eg-item-'+attr+']').value,value,entry+'/'+String(rrp));
        assert.equal(node('[data-eg-item-discount]').hidden,!r);
        assert.equal(node('[data-eg-item-special]').hidden,!!r);
        assert.equal(node('[data-eg-item-price]:parent').hidden,!p);
        assert.equal(node('[data-eg-item-nr]').value,'test'); // Callback continued after setting prices.
    }
    assert.equal(dispatched,cases.length);
}
console.log(entries.length+' source/bundle callbacks × '+cases.length+' sequential IO variation responses PASS');
