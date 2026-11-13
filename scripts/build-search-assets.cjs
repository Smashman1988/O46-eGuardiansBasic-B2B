// Legacy command retained; production assets now use the complete reproducible build.
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
if (require.main === module) require('./build-js.cjs').build()
    .then(report => console.log(JSON.stringify(report)))
    .catch(error => { console.error(error); process.exitCode = 1; });
