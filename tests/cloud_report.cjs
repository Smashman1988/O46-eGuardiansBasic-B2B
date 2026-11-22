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

test('Explizite Test-Tags wählen nur die vorgesehene Browserinstallation',()=>{
    const matrix=tag=>spawnSync(process.execPath,[require.resolve('./cross-browser/profiles.cjs'),tag],{encoding:'utf8'});
    const one=matrix('b2b-browser-iphone-001'), all=matrix('b2b-browser-test-004');
    assert.equal(one.status,0);assert.equal(all.status,0);
    assert.deepEqual(JSON.parse(one.stdout).include,[{project:'iphone',install:'webkit'}]);
    const desktop=matrix('b2b-browser-desktop-001');
    assert.equal(desktop.status,0);
    assert.deepEqual(JSON.parse(desktop.stdout).include,[{project:'chrome',install:'chrome'},{project:'chromium',install:'chromium'}]);
    assert.deepEqual(JSON.parse(all.stdout).include.map(p=>p.project),Object.keys(profiles));
    for(const name of ['develop','refs/heads/develop','b2b-browser-ipad-001','']) assert.notEqual(matrix(name).status,0);
});

for(const [name,tag,scope,result,expected,desktopArtifacts] of [
    ['iPhone bestanden','b2b-browser-iphone-001',1,'BESTANDEN','BESTANDEN'],
    ['iPhone eingeschränkt','b2b-browser-iphone-001',1,'BESTANDEN MIT EINSCHRÄNKUNGEN','BESTANDEN MIT EINSCHRÄNKUNGEN'],
    ['iPhone fehlgeschlagen','b2b-browser-iphone-001',1,'FEHLGESCHLAGEN','FEHLGESCHLAGEN'],
    ['iPhone-Artefakt fehlt','b2b-browser-iphone-001',1,null,'UNVOLLSTÄNDIG'],
    ['Vollmatrix mit nur einem Artefakt','b2b-browser-test-004',10,'BESTANDEN','UNVOLLSTÄNDIG'],
    ['Desktop bestanden','b2b-browser-desktop-001',2,null,'BESTANDEN',{chrome:'BESTANDEN',chromium:'BESTANDEN'}],
    ['Desktop mit Pflichtfehler','b2b-browser-desktop-001',2,null,'FEHLGESCHLAGEN',{chrome:'BESTANDEN',chromium:'FEHLGESCHLAGEN'}],
    ['Desktop mit fehlendem Chromium-Artefakt','b2b-browser-desktop-001',2,null,'UNVOLLSTÄNDIG',{chrome:'BESTANDEN'}]
]) test(name,t=>{
    const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'o46-selection-'));
    t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
    const output=path.join(tmp,'.cache/browser-overview');
    const artifacts=desktopArtifacts || (result?{iphone:result}:{});
    for(const [project,status] of Object.entries(artifacts)) {
        const dir=path.join(output,'storefront-'+project);
        fs.mkdirSync(path.join(dir,'report'),{recursive:true});
        const limited=Number(status==='BESTANDEN MIT EINSCHRÄNKUNGEN'), failed=Number(status==='FEHLGESCHLAGEN');
        const row={project,commit:'fixture',tag,status,planned:25,stages:{launch:'success'},
            browser:{version:'fixture'},totals:{passed:25-failed-limited,skipped:0,limited,failed,blocked:0},issues:[],findings:[]};
        fs.writeFileSync(path.join(dir,'profile.json'),JSON.stringify(row));
        for(const file of ['browser.json','planned.json','results.json','report/index.html']) fs.writeFileSync(path.join(dir,file),'{}');
    }
    const run=spawnSync(process.execPath,[cli,'overview'],{cwd:tmp,encoding:'utf8',env:{...process.env,
        GITHUB_REF_NAME:tag,TEST_COMMIT:'fixture',MATRIX_RESULT:'success',GITHUB_STEP_SUMMARY:path.join(tmp,'summary.md')}});
    const overview=JSON.parse(fs.readFileSync(path.join(output,'overview.json')));
    assert.equal(overview.status,expected);
    assert.equal(overview.selectedProfiles.length,scope);
    assert.equal(overview.rows.length,scope);
    assert.equal(overview.notScheduled.length,10-scope);
    const missing=scope-Object.keys(artifacts).length;
    assert.equal(overview.profilesWithoutPlan,missing);
    assert.equal(overview.rows.filter(r=>r.status==='BLOCKIERT').length,missing);
    if(desktopArtifacts) {
        assert.deepEqual(overview.selectedProfiles,['chrome','chromium']);
        assert.deepEqual(overview.notScheduled,Object.keys(profiles).filter(p=>!['chrome','chromium'].includes(p)));
        assert.equal(overview.plannedTests,25*(scope-missing));
    }
    assert.equal(run.status,expected.startsWith('BESTANDEN')?0:1);
    for(const content of [fs.readFileSync(path.join(output,'index.html'),'utf8'),fs.readFileSync(path.join(tmp,'summary.md'),'utf8')]) {
        assert.ok(content.includes(expected));
        assert.ok(content.includes(overview.mode));
        if(scope===1) assert.ok(content.includes('Nicht eingeplant: chromium') && content.includes('Cross-Browser-Freigabe'));
        if(desktopArtifacts) assert.ok(content.includes('Nicht eingeplant: '+overview.notScheduled.join(', ')) && content.includes('Teilprüfung'));
    }
});
