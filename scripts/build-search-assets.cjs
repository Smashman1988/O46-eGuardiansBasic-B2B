// Replace only the existing autocomplete handler; keep all other shipped code intact.
const fs=require('node:fs'),assert=require('node:assert/strict'),acorn=require('acorn'),{minify}=require('terser');
function handler(source){
    const found=[];
    function walk(node){
        if(!node?.type)return;
        if(node.type==='AssignmentExpression'&&node.left.type==='MemberExpression'&&node.left.property.name==='initLiveSearch')found.push(node.right);
        for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(walk);else if(value?.type)walk(value);}
    }
    walk(acorn.parse(source,{ecmaVersion:'latest'}));
    assert.equal(found.length,1,'Unique existing autocomplete handler');
    return found[0];
}
module.exports={handler};
if(require.main===module)(async()=>{
    const report=[];
    for(const name of ['cat','item','main','vue']){
        const source=fs.readFileSync(`resources/js/${name}.js`,'utf8'),a=handler(source),file=`resources/js/${name}-020726.min.js`;
        const old=fs.readFileSync(file,'utf8'),b=handler(old);
        const result=await minify('window.__searchBuild='+source.slice(a.start,a.end),{compress:false,mangle:true,format:{comments:false}});
        const expression=acorn.parse(result.code,{ecmaVersion:'latest'}).body[0].expression.right;
        const output=old.slice(0,b.start)+result.code.slice(expression.start,expression.end)+old.slice(b.end);
        acorn.parse(output,{ecmaVersion:'latest'});fs.writeFileSync(file,output);
        report.push({file,bytes:Buffer.byteLength(output),unchangedOutsideAutocomplete:true});
    }
    console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1});
