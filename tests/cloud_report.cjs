// Run with node --test tests/cloud_report.cjs. These are CLI-level checks of the
// same artifacts and exit codes that GitHub Actions consumes.
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {spawnSync} = require('node:child_process');
const profiles = require('./cross-browser/profiles.cjs');
const cli = require.resolve('./cross-browser/cloud-report.cjs');
const background = 'Echter Hintergrundtab mit und ohne Breakpointwechsel';
const swipe = 'Wischgeste wechselt das Galeriebild im Touchprofil';
const before = {visibility:'visible',focused:true,width:768,panel:'o46-menu',root:'menu-open',expanded:['true'],lock:['hidden']};
const evidence = data => ({name:'tab-lifecycle',contentType:'application/json',body:Buffer.from(JSON.stringify(data)).toString('base64')});
const annotation = {type:'blocked',description:'Browser lieferte nach Tabwechsel kein bestätigtes hidden'};
const skipped = {status:'skipped',annotations:[annotation],attachments:[evidence([{peak:null,before}])]};
function spec(title,file,result,project) {
    return {id:file,title,file,tests:[{projectName:project,status:result.status==='passed'?'expected':result.status==='skipped'?'skipped':'unexpected',results:[result]}]};
}
const scenarios = [
    ['ausgeführter Pflichttest','chrome',{status:'passed'},'BESTANDEN','passed'],
    ['belegtes sichtbares WebKit-Dokument','iphone',skipped,'BESTANDEN MIT EINSCHRÄNKUNGEN','limited'],
    ['fehlender Messanhang','iphone',{...skipped,attachments:[]},'UNVOLLSTÄNDIG','blocked'],
    ['bereits verborgenes Dokument','webkit',{...skipped,attachments:[evidence([{peak:null,before:{...before,visibility:'hidden'}}])]},'UNVOLLSTÄNDIG','blocked'],
    ['unzureichende Annotation','firefox',{...skipped,annotations:[]},'UNVOLLSTÄNDIG','blocked'],
    ['unerwartete Chromium-Einschränkung','android',skipped,'UNVOLLSTÄNDIG','blocked'],
    ['spätere Lücke nach erfolgreichem Tabwechsel','webkit',{...skipped,attachments:[evidence([{peak:null,before,after:{}},{peak:992,before}])]},'UNVOLLSTÄNDIG','blocked'],
    ['Fehler mit vorhandener Einschränkungsannotation','webkit',{...skipped,status:'failed',errors:[{message:'Fokus falsch'}]},'FEHLGESCHLAGEN','failed'],
    ['technische Unterbrechung','edge',{status:'interrupted'},'UNVOLLSTÄNDIG','blocked'],
    ['Primärbrowser beim Teststart beendet','edge',{status:'failed',errors:[{message:'Error: browserType.launch: Target closed'}]},'UNVOLLSTÄNDIG','blocked'],
    ['CDP-Startfehler','chromium',{status:'failed',annotations:[{type:'browser-setup'}],errors:[{message:'Startfehler'}]},'UNVOLLSTÄNDIG','blocked'],
    ['Desktop ohne Touch','firefox',{status:'skipped',annotations:[{type:'not-applicable'}]},'BESTANDEN','skipped',swipe],
    ['mobiler Wischtest fehlt','ipad',{status:'skipped',annotations:[{type:'not-applicable'}]},'UNVOLLSTÄNDIG','blocked',swipe],
    ['fremder Test mit gleicher Annotation','firefox',skipped,'UNVOLLSTÄNDIG','blocked','anderer Test']
];
for (const [name,project,result,want,key,title=background] of scenarios) test(name,t=>{
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'o46-reporter-'));
    t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
    const dir=path.join(tmp,'.cache/cross-browser');
    fs.mkdirSync(path.join(dir,'report'),{recursive:true});
    fs.writeFileSync(path.join(dir,'report/index.html'),'<title>Fixture</title>');
    const cases=[spec('Kontrollfall','ok.spec.cjs',{status:'passed'},project),
        spec(title,title===swipe?'touch.spec.cjs':'background.spec.cjs',result,project)];
    for(const file of ['planned','results']) fs.writeFileSync(path.join(dir,file+'.json'),JSON.stringify({specs:cases}));
    fs.writeFileSync(path.join(dir,'browser.json'),JSON.stringify({project,engine:profiles[project].engine,version:'fixture'}));
    const run=spawnSync(process.execPath,[cli,'profile'],{cwd:tmp,encoding:'utf8',env:{...process.env,PROJECT:project,
        GITHUB_STEP_SUMMARY:'',TOOLING:'success',INSTALLATION:'success',LAUNCH:'success',SUITE:'success'}});
    const row=JSON.parse(fs.readFileSync(path.join(dir,'profile.json')));
    assert.equal(row.status,want);
    assert.equal(row.totals[key],key==='passed'?2:1);
    assert.equal(run.status,want.startsWith('BESTANDEN')?0:1);
});
