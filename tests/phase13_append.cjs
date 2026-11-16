// Invoke the real first append handler (source/minified) with counted dependencies.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),acorn=require('acorn');
const D=path.resolve(process.argv[2]),rows=[];
function handler(source){let result;const tree=acorn.parse(source,{ecmaVersion:'latest'});function visit(n){if(!n||!n.type)return;if(!result&&n.type==='CallExpression'&&n.callee.type==='MemberExpression'&&n.callee.property.name==='on'&&n.arguments[0]?.value==='append.infiniteScroll')result=source.slice(n.arguments[1].start,n.arguments[1].end);for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v?.type)visit(v)}}visit(tree);assert.ok(result,'Real append handler');return result}
for(const min of[false,true])for(const lazy of[false,true]){
    const row={min,lazy};
    for(const version of['before','after']){
        const source=fs.readFileSync((version==='before'?D+'/before/':'')+'resources/js/cat'+(min?'.min':'')+'.js','utf8');
        const counts={wrappers:0,descendantQueries:0,copiedItems:0,timers:0,refreshes:0};
        const $=items=>{counts.wrappers++;counts.copiedItems+=items.length;return {find:selector=>{assert.equal(selector,'.lozad');counts.descendantQueries++;return {length:lazy?24:0}}}};
        const sandbox={$: $,eGuardians:{events:{observeLazyImages(){counts.refreshes++}}},setTimeout(fn,delay){assert.equal(delay,50);counts.timers++;fn()}};
        const append=vm.runInNewContext('('+handler(source)+')',sandbox);
        for(let i=0;i<20;i++)append(null,null,null,Array.from({length:12},()=>({})));
        assert.equal(counts.refreshes,20,'Exactly one refresh per append');
        row[version]=counts;
    }
    assert.deepEqual(row.after,{wrappers:0,descendantQueries:0,copiedItems:0,timers:0,refreshes:20});
    assert.equal(row.before.descendantQueries,20);assert.equal(row.before.wrappers,20);assert.equal(row.before.copiedItems,240);assert.equal(row.before.timers,lazy?0:20);
    rows.push(row);
}
fs.writeFileSync(D+'/append-counts.json',JSON.stringify({status:'PASS',rows,limit:'Instrumented local operations; no browser or server duration claim'},null,2));
console.log(rows.length+' before/after append-operation scenarios PASS');
