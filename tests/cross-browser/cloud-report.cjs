// Reporting uses only Node built-ins so setup failures can still produce an artifact.
const fs = require('node:fs');
const path = require('node:path');
const profiles = require('./profiles.cjs');
const dir = '.cache/cross-browser';
const overviewDir = '.cache/browser-overview';
const env = process.env;
const project = env.PROJECT;
function read(file) {
    try { return JSON.parse(fs.readFileSync(file,'utf8')); }
    catch (error) {
        if (error.code !== 'ENOENT') console.error('Unreadable report '+file, error.message);
        return null;
    }
}
const write = (file,value) => fs.writeFileSync(file,JSON.stringify(value,null,2));
const summary = text => { if(env.GITHUB_STEP_SUMMARY) fs.appendFileSync(env.GITHUB_STEP_SUMMARY,text+'\n'); };
const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const counts = () => ({passed:0, failed:0, skipped:0, blocked:0});

async function launch() {
    const p = profiles[project];
    const pw = require('playwright');
    const browser = await pw[p.engine].launch({channel:p.channel,headless:false});
    try {
        const version = {project,engine:p.engine,device:p.device,version:browser.version(),
            playwright:require('@playwright/test/package.json').version};
        write(path.join(dir,'browser.json'),version);
        console.log(version);
    } finally {await browser.close();}
}
function cases(report) {
    const list = [];
    function walk(suite) {
        for(const spec of suite.specs || []) for(const test of spec.tests) {
            if(test.projectName===project) list.push({id:spec.id,title:spec.title,test});
        }
        for(const child of suite.suites || []) walk(child);
    }
    if(report) walk(report);
    return list;
}
function failureKind(run, annotations) {
    if (run.status === 'timedOut' || /Timeout(?:Error| .*exceeded)/i.test(run.error?.message || '')) return 'Timeout';
    if (annotations.some(a=>a.type==='theme-defect')) return 'Bestätigter Theme-Fehler';
    if (annotations.some(a=>a.type==='browser-incompatibility')) return 'Bestätigte Browserinkompatibilität';
    if (/Unmodelled request|Theme fragment changed|ENOENT/i.test(run.error?.message || '')) return 'Fixture oder Testumgebung';
    return 'Funktionsabweichung, Ursache im Trace prüfen';
}
function classify() {
    fs.mkdirSync(dir,{recursive:true});
    const result = read(path.join(dir,'results.json'));
    const browser = read(path.join(dir,'browser.json'));
    const planned = cases(read(path.join(dir,'planned.json')));
    const actual = new Map(cases(result).map(row=>[row.id,row.test]));
    const totals = counts(), findings = [];
    for(const {id,title} of planned) {
        const test = actual.get(id), run = test?.results?.at(-1);
        const annotations = [...(test?.annotations||[]),...(run?.annotations||[])];
        let status = 'blocked', reason = 'Prüfung nicht ausgeführt';
        if(run?.status==='passed' && test.status==='expected') {status='passed';reason='';}
        else if(run?.status==='skipped' && annotations.some(a=>a.type==='not-applicable')) {
            status='skipped';reason='Touchprofil erforderlich';
        } else if(run?.status==='skipped') {
            reason=annotations.find(a=>a.type==='blocked')?.description || 'Übersprungen ohne Funktionsnachweis';
        } else if(run && run.status!=='interrupted') {
            status='failed';reason=failureKind(run,annotations)+' · '+(run.error?.message||run.status);
        }
        totals[status]++;
        if(status!=='passed') findings.push({title,status,reason});
    }
    const stages={tooling:env.TOOLING,installation:env.INSTALLATION,launch:env.LAUNCH,suite:env.SUITE};
    const issues=[];
    for(const [name,outcome] of Object.entries(stages)) if(outcome!=='success') issues.push(name+' = '+outcome);
    if(env.INSTALLATION==='failure') issues.push('Browser oder Systemabhängigkeiten konnten nicht bereitgestellt werden');
    if(env.LAUNCH==='failure') issues.push('Browserstart fehlgeschlagen');
    if(!browser?.version) issues.push('Browserstart ohne Versionsnachweis');
    if(!planned.length || !totals.passed) issues.push('Kein positiver Testnachweis');
    if(actual.size!==planned.length || planned.some(r=>!actual.has(r.id))) issues.push('Ergebnis unvollständig');
    if(!fs.existsSync(path.join(dir,'report/index.html'))) issues.push('HTML-Einzelbericht fehlt');
    if(result?.errors?.length) issues.push(...result.errors.map(e=>e.message||String(e)));
    const status=totals.failed?'FEHLGESCHLAGEN':(issues.length||totals.blocked)?'UNVOLLSTÄNDIG':'BESTANDEN';
    const row={project,tag:env.GITHUB_REF_NAME,commit:env.TEST_COMMIT,browser,planned:planned.length,totals,status,stages,issues,findings};
    write(path.join(dir,'profile.json'),row);
    summary('### '+project+' · '+status+'\n\n'+JSON.stringify(totals)+'\n\n'+issues.map(escape).join(' · '));
    if(status!=='BESTANDEN') process.exitCode=1;
}
function overview() {
    fs.mkdirSync(overviewDir,{recursive:true});
    const tag=env.GITHUB_REF_NAME,commit=env.TEST_COMMIT;
    const rows=Object.keys(profiles).map(name=>{
        const row=read(path.join(overviewDir,'storefront-'+name,'profile.json'));
        if(row && row.project===name && row.commit===commit && row.tag===tag) return row;
        return {project:name,status:'BLOCKIERT',totals:null,issues:['Passendes Profil-Artefakt fehlt'],findings:[]};
    });
    const preview=read(path.join(overviewDir,'preview-identification','preview.json'));
    const pass=rows.every(r=>r.status==='BESTANDEN') && env.MATRIX_RESULT==='success';
    const status=pass?'BESTANDEN':rows.some(r=>r.status==='FEHLGESCHLAGEN')?'FEHLGESCHLAGEN':'UNVOLLSTÄNDIG';
    const total=counts();
    for(const row of rows) if(row.totals) for(const key of Object.keys(total)) total[key]+=row.totals[key];
    const totalsText=total.passed+' bestanden · '+total.failed+' fehlgeschlagen · '+total.skipped+' übersprungen · '+total.blocked+' blockiert';
    const unplanned=rows.filter(row=>!row.planned).length;
    const table=rows.map(r=>{
        const rel='storefront-'+r.project+'/report/index.html';
        const name=fs.existsSync(path.join(overviewDir,rel))?'<a href="'+rel+'">'+r.project+'</a>':r.project;
        return '<tr><th>'+name+'</th>'+[profiles[r.project].device,r.browser?.version||'–',r.browser?.playwright||'–',r.status,...Object.keys(counts()).map(k=>r.planned?r.totals?.[k]??'–':'–')].map(c=>'<td>'+escape(c)+'</td>').join('')+'</tr>';
    }).join('');
    const notes=rows.filter(r=>r.issues.length||r.findings.length).map(r=>'<h3>'+r.project+'</h3><ul>'+[...r.issues,...r.findings.map(f=>f.title+' · '+f.status+' · '+f.reason)].map(v=>'<li>'+escape(v)+'</li>').join('')+'</ul>').join('');
    fs.writeFileSync(path.join(overviewDir,'index.html'),'<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>B2B-Browserprüfung</title><style>body{font:16px/1.5 system-ui;margin:3vw;color:#193b38}table{border-collapse:collapse}th,td{text-align:left;padding:.5em;border-bottom:1px solid #ccd}li{white-space:pre-wrap;overflow-wrap:anywhere}article{overflow:auto}a{color:#156359}</style><h1>B2B-Browserprüfung · '+status+'</h1><p>'+totalsText+(unplanned?' · Testzahl unbekannt für '+unplanned+' Profil(e)':'')+'</p><p>Tag <b>'+escape(tag)+'</b> · Commit <code>'+escape(commit)+'</code> · develop</p><p>Twig-Fixtures mit den Theme-Assets dieses Commits. Native Cross-Browser-Abnahme und physische Geräte bleiben offen. Anonyme Vorschauerkennung: '+escape([preview?.status||'nicht ausgeführt',preview?.reason].filter(Boolean).join(' · '))+'.</p><article><table><tr><th>Profil / Einzelbericht</th><th>Geräteprofil</th><th>Browser</th><th>Playwright</th><th>Status</th><th>Bestanden</th><th>Fehler</th><th>Übersprungen</th><th>Blockiert</th></tr>'+table+'</table></article>'+notes+'<p>Einzelberichte enthalten Schritte, Browserdiagnostik und bei Testfehlern Screenshots und Traces. Ein Setupfehler vor dem Browserstart hat keine Browseraufnahme. Für die Ursachenklärung betroffene Browser vergleichen und die erste Abweichung im Trace mit der Twig-Fixture und dem Theme-Code abgleichen. Ein reproduzierter Theme-Fehler oder eine Browserinkompatibilität erhält erst nach dieser Gegenprüfung eine entsprechende Kennzeichnung.</p></html>');
    write(path.join(overviewDir,'overview.json'),{status,tag,commit,totals:total,profilesWithoutPlan:unplanned,preview,rows});
    summary('## B2B · '+status+'\n\n'+escape(tag)+' · '+commit+'\n\n'+totalsText+'\n\n'+rows.map(r=>'- '+r.project+' · '+r.status).join('\n')+'\n\nArtefakt **b2b-browser-report** entpacken und **index.html** öffnen.');
    if(!pass) process.exitCode=1;
}
(async()=>{
    switch(process.argv[2]) {
        case 'launch': return launch();
        case 'profile': return classify();
        case 'overview': return overview();
        default: throw Error('Expected launch, profile or overview');
    }
})().catch(error=>{console.error(error);process.exitCode=1;});
