// node tests/premium_header_static.cjs <report.json>
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cp = require('node:child_process');
const postcss = require(process.env.O46_POSTCSS_MODULE || 'postcss');
const root = path.resolve(__dirname, '..');
const baseline = '8eeb24f7732c2cb5558b2dbf148eb85182708f0d';
const refinementBaseline = '4b4503f29e87f732878ebebf0ecccdc14e61dea5';
const polishBaseline = 'cfa78ad2afbcde83e28252358e57c3759f1eaba2';
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replaceAll('\r\n','\n');
const previous = (file, ref=baseline) => cp.execFileSync('git',['show',`${ref}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:8*1024*1024}).replaceAll('\r\n','\n');
const files = cp.execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n');
const report = {baseline,checks:[],sourceSyntax:[],plentyONE:'NOT_RUN'};
function check(name, callback) { callback(); report.checks.push(name); }
function block(source, id) {
    const start = source.search(new RegExp(`<li class="(?:eg-ddown )?cat-${id}">`));
    assert(start>=0,`Missing category ${id}`);
    let depth=0;
    for(const match of source.slice(start).matchAll(/<li\b[^>]*>|<\/li>/g)) {
        depth+=match[0].startsWith('</')?-1:1;
        if(!depth) return source.slice(start,start+match.index+match[0].length).replace(/\s+/g,' ').trim();
    }
    throw new Error(`Unclosed category ${id}`);
}
for(const language of ['DE','EN','FR','IT','ES']) {
    const file=`resources/views/Category/Macros/CategoryTree${language}.twig`;
    const before=previous(file),after=read(file),active=after.replace(/\{#[\s\S]*?#\}/g,'');
    check(`${language}: complete mobile macro unchanged by refinement`,()=>assert.equal(after,previous(file,refinementBaseline)));
    check(`${language}: seven dropdowns and four direct links match actual macro classes`,()=>{
        assert.deepEqual([...active.matchAll(/<li class="eg-ddown cat-(\d+)">/g)].map(m=>Number(m[1])),[4814,4813,81,80,4103,3813,78]);
        assert.deepEqual([...active.matchAll(/<li class="cat-(\d+)">/g)].map(m=>Number(m[1])),[5618,6425,5081,60]);
    });
    const expected=[5618,4814,4813,81,80,4103,6425,3813,78,5081,60];
    check(`${language}: 11 whole category blocks preserve every URL, child, translation and event`,()=> {
        for(const id of expected) assert.equal(block(after,id),block(before,id));
    });
    check(`${language}: shared DOM order and Home activation`,()=>{
        const ids=[...active.matchAll(/<li class="(?:eg-ddown )?cat-(\d+)">/g)].map(m=>Number(m[1]));
        assert.deepEqual(ids,expected);
        assert.equal((active.match(/<li class="eg-ddown cat-4103">/g)||[]).length,1);
    });
}
for(const file of files.filter(f=>/\.json$/.test(f))) {
    check(`JSON ${file}`,()=>JSON.parse(read(file)));
}
for(const file of files.filter(f=>/^resources\/(js|lang)\//.test(f)||/^src\//.test(f)||['config.json','resources/css/checkout.css','resources/css/checkout-120525.min.css','resources/css/contact-widget.css','resources/views/PageDesign/PageDesign.twig','resources/views/PageDesign/Components/ContactWidget.twig','tests/contact_widget.cjs','tests/contact_widget.php','tests/twig_regression.php'].includes(f))) {
    check(`unchanged ${file}`,()=>assert.equal(read(file),previous(file)));
}
const marker='/* B2B Premium-Kompakt header: isolated patch; do not rebuild the legacy CSS. */';
const source=read('resources/css/main.css');
const production=read('resources/css/main-211025.min.css');
check('legacy production CSS unchanged',()=>assert.equal(production.split('\n'+marker)[0],previous('resources/css/main-211025.min.css')));
check('legacy editable CSS unchanged',()=>assert.equal(source.split(marker)[0].trimEnd(),previous('resources/css/main.css').trimEnd()));
check('production CSS parses',()=>postcss.parse(production));
check('isolated source patch parses',()=>postcss.parse(source.split(marker)[1]));
check('critical CSS matches production suffix',()=>assert.equal(read('resources/views/PageDesign/Partials/Head.twig').match(/<style data-premium-header>(.*?)<\/style>/s)[1],production.split(marker+'\n')[1].trim()));
check('both CSS inclusions have polish cache busting without a version bump',()=>assert.equal((read('resources/views/PageDesign/Partials/Head.twig').match(/main-211025\.min\.css\?v=1\.0\.8-header3-\{\{ buildHash \}\}/g)||[]).length,2));
const headerFile='resources/views/PageDesign/Partials/Header/Header.twig';
check('complete Header.twig unchanged by refinement',()=>assert.equal(read(headerFile),previous(headerFile,refinementBaseline)));
check('complete Header.twig including basket, quantity branches, Vue bindings and search unchanged by polish',()=>assert.equal(read(headerFile),previous(headerFile,polishBaseline)));
check('original B2B logo binary unchanged',()=>assert.deepEqual(fs.readFileSync(path.join(root,'resources/images/b2b-outlet46-logo.png')),cp.execFileSync('git',['show',`${polishBaseline}:resources/images/b2b-outlet46-logo.png`],{cwd:root})));
check('logo and basket label rules are independent of viewport or digit count',()=>{
    const patch=source.split(marker)[1];
    assert.match(patch,/\.premium-header \.company-logo img\s*\{[^}]*height: auto;[^}]*object-fit: contain;/);
    assert.match(patch,/\.premium-header \.premium-basket-label\s*\{\s*display: none;/);
    assert.match(patch,/\.premium-header-controls \.header-quant-info,\s*\.premium-header-controls \.header-quant-info2\s*\{[^}]*grid-area: 1 \/ 1;[^}]*width: max-content;[^}]*justify-self: center;/);
    assert.doesNotMatch(patch,/\[data-eg-basket-quantity[\^$*~|]?=/);
});
check('plugin identity and version 1.0.8 unchanged',()=>assert.equal(read('plugin.json'),previous('plugin.json',refinementBaseline)));
const dataAttributes=text=>[...text.matchAll(/\bdata-[\w-]+(?:="[^"]*")?/g)].map(m=>m[0]).sort();
check('all header event and data attributes retained',()=>assert.deepEqual(dataAttributes(read(headerFile)),dataAttributes(previous(headerFile))));
const conditions=text=>[...text.replace(/\{#[\s\S]*?#\}/g,'').matchAll(/\{%[\s\S]*?%\}/g)].map(m=>m[0].replace(/\s+/g,' '));
check('header Twig conditions and service expressions retained',()=>assert.deepEqual(conditions(read(headerFile)),conditions(previous(headerFile))));
check('Head differs only by the generated critical patch and two cache keys',()=>{
    const head=read('resources/views/PageDesign/Partials/Head.twig').replace(/<style data-premium-header>.*?<\/style>\n/s,'').replaceAll('?v=1.0.8-header3-{{ buildHash }}','');
    assert.equal(head,previous('resources/views/PageDesign/Partials/Head.twig'));
});
for(const file of ['resources/css/main.css','resources/css/checkout.css']) {
    const errors=[];
    for(const text of [previous(file),read(file)]) {
        try {postcss.parse(text);errors.push(null);} catch(e) {errors.push({line:e.line,column:e.column,reason:e.reason});}
    }
    check(`pre-existing source syntax unchanged ${file}`,()=>assert.deepEqual(errors[0],errors[1]));
    report.sourceSyntax.push({file,before:errors[0],after:errors[1]});
}
fs.writeFileSync(process.argv[2],JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.checks.length,sourceSyntax:report.sourceSyntax,plentyONE:report.plentyONE}));
