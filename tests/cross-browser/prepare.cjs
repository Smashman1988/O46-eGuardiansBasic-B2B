const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const dir = path.join(root, '.cache/cross-browser');
const php = process.env.O46_PHP || (process.platform === 'win32' ? path.join(root,'.cache/php-runtime/php-8.4.23/php.exe') : 'php');
const autoload = process.env.O46_TWIG_AUTOLOAD || path.join(root,'.cache/contact-widget/autoload3.php');
function render(script, args = [], data) {
    const phpArgs = process.platform === 'win32' && !process.env.O46_PHP
        ? ['-d','extension_dir='+path.join(path.dirname(php),'ext'),'-d','extension=mbstring'] : [];
    return execFileSync(php,[...phpArgs,script,autoload,...args],{cwd:root,encoding:'utf8',input:JSON.stringify(data),maxBuffer:12*1024*1024});
}
module.exports = function prepare() {
    fs.mkdirSync(dir,{recursive:true});
    const fragments = JSON.parse(render('tests/cross-browser/render.php'));
    fragments.cards = render('tests/live_shopping_grid.php',['--render-browser']);
    fragments.list = render('tests/live_shopping_grid.php',['--render-list']);
    fragments.listDesc = render('tests/live_shopping_grid.php',['--render-list-desc']);
    fragments.strip = render('tests/live_shopping_grid.php',['--render-strip']);
    const groups = require('../fixtures/facets.json').women.groups.filter(g => ['Marke','Größe'].includes(g.name));
    if (groups.length !== 2) throw Error('Expected size and brand facets');
    fragments.groups = groups;
    const ids = groups.map(g=>g.values[0].id);
    fragments.filters = {};
    fragments.filteredLists = {};
    for (const selected of [[],[ids[0]],[ids[1]],ids]) {
        const params = selected.length ? {facets:selected.join(',')} : {};
        if (selected.length) {
            const total=selected.length===2?1:selected.includes(groups.find(g=>g.name==='Marke').values[0].id)?2:3;
            fragments.filteredLists[selected.join(',')]={total,html:render('tests/live_shopping_grid.php',['--render-list',String(total)])};
        }
        fragments.filters[selected.join(',')]=JSON.parse(render('tests/facets.php',['--render'],{kind:'women',lang:'de',groups,params,selectedFacets:selected})).html;
    }
    for (const [lang, parts] of Object.entries(fragments.languages)) {
        parts.filter=lang==='de' ? fragments.filters[''] :
            JSON.parse(render('tests/facets.php',['--render'],{kind:'women',lang,groups})).html;
    }
    fs.writeFileSync(path.join(dir,'fragments.json'),JSON.stringify(fragments));
};

