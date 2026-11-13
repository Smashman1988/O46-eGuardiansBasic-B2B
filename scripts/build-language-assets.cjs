// Legacy command retained; production assets now use the complete reproducible build.
const fs=require('node:fs'),assert=require('node:assert/strict'),acorn=require('acorn'),{minify}=require('terser');
function parts(source){
    const found={modal:[],modalContent:[]};
    function walk(node){
        if(!node?.type)return;
        if(node.type==='AssignmentExpression'&&node.left.type==='MemberExpression'&&Object.hasOwn(found,node.left.property.name))found[node.left.property.name].push(node.right);
        for(const value of Object.values(node)){if(Array.isArray(value))value.forEach(walk);else if(value?.type)walk(value);}
    }
    walk(acorn.parse(source,{ecmaVersion:'latest'}));
    for(const values of Object.values(found))assert.equal(values.length,1,'Unique existing modal region');
    return Object.fromEntries(Object.entries(found).map(([key,value])=>[key,value[0]]));
}
module.exports={parts};
if (require.main === module) require('./build-js.cjs').build()
    .then(report => console.log(JSON.stringify(report)))
    .catch(error => { console.error(error); process.exitCode = 1; });
