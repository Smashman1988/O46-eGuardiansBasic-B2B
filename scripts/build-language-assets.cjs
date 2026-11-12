// Replace only the existing modal handler/UI object in the four shipped bundles.
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
if(require.main===module)(async()=>{
    const report=[];
    for(const name of ['cat','item','main','vue']){
        const source=fs.readFileSync(`resources/js/${name}.js`,'utf8'),a=parts(source),file=`resources/js/${name}-020726.min.js`;
        let output=fs.readFileSync(file,'utf8');const b=parts(output);
        for(const key of Object.keys(b).sort((x,y)=>b[y].start-b[x].start)){
            const result=await minify('window.__languageBuild='+source.slice(a[key].start,a[key].end),{compress:false,mangle:true,format:{comments:false}});
            const expression=acorn.parse(result.code,{ecmaVersion:'latest'}).body[0].expression.right;
            output=output.slice(0,b[key].start)+result.code.slice(expression.start,expression.end)+output.slice(b[key].end);
        }
        acorn.parse(output,{ecmaVersion:'latest'});fs.writeFileSync(file,output);report.push({file,bytes:Buffer.byteLength(output),unchangedOutsideModal:true});
    }
    console.log(JSON.stringify(report));
})().catch(error=>{console.error(error);process.exitCode=1});
