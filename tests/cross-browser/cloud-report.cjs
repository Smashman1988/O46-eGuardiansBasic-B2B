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
const PASS = 'BESTANDEN';
const LIMITED = 'BESTANDEN MIT EINSCHRÄNKUNGEN';
const FAILED = 'FEHLGESCHLAGEN';
const INCOMPLETE = 'UNVOLLSTÄNDIG';
const successful = status => status === PASS || status === LIMITED;
const labels = {passed:'Bestanden', failed:'Fehler', skipped:'Nicht anwendbar', limited:'Eingeschränkt', blocked:'Blockiert'};
const counts = () => Object.fromEntries(Object.keys(labels).map(key=>[key,0]));
const backgroundTitle = 'Echter Hintergrundtab mit und ohne Breakpointwechsel';
const swipeTitle = 'Wischgeste wechselt das Galeriebild im Touchprofil';

function limitation(spec, run, annotations) {
    if (spec.file !== 'background.spec.cjs' || spec.title !== backgroundTitle ||
        !['firefox','webkit'].includes(profiles[project].engine) ||
        !annotations.some(a=>a.type==='blocked' && a.description==='Browser lieferte nach Tabwechsel kein bestätigtes hidden')) return;
    const attachment = run.attachments?.find(a=>a.name==='tab-lifecycle' && a.contentType==='application/json');
    if (!attachment?.body) return;
    let measurements;
    try { measurements=JSON.parse(Buffer.from(attachment.body,'base64').toString('utf8')); }
    catch { return; }
    if (!Array.isArray(measurements) || measurements.length!==1) return;
    const sample=measurements[0], before=sample?.before;
    if (sample?.peak!==null || sample.desktop || sample.after || before?.visibility!=='visible' ||
        before.width!==768 || typeof before.focused!=='boolean' || before.panel!=='o46-menu' ||
        typeof before.root!=='string' || !before.root.split(' ').includes('menu-open') ||
        !Array.isArray(before.expanded) || !before.expanded.includes('true') || !Array.isArray(before.lock) || !before.lock.includes('hidden')) return;
    return 'Nach dem Tabwechsel blieb visibilityState=visible bei '+before.width+' px, hasFocus='+before.focused+'. Der Prüflauf erreichte den Hintergrundzustand nicht.';
}

function classifyCase(spec,test) {
    const run = test?.results?.at(-1);
    const annotations = [...(test?.annotations||[]),...(run?.annotations||[])];
    const annotated = type=>annotations.some(a=>a.type===type);
    const message = [...new Set([...(run?.errors||[]).map(e=>e.message),run?.error?.message].filter(Boolean))].join('\n');
    const finding = (status,reason,kind,next) => ({status,reason,kind,next,
        message:message || annotations.find(a=>a.type==='skip')?.description || 'Keine Fehlermeldung aufgezeichnet',
        reproducibility:(test?.results?.length||0)+' Versuch(e) in diesem Lauf. Wiederholbarkeit auf derselben Engine separat prüfen.'});
    const setupFailure=annotated('browser-setup') || /(?:^|\n)(?:Error: )?browserType\.(?:launch|connectOverCDP):/m.test(message);
    if (!run || run.status==='interrupted' || setupFailure) {
        return finding('blocked',setupFailure?'Browserstart oder CDP-Verbindung fehlgeschlagen':'Kein vollständiger Testlauf',
            'Testumgebung','Job-Log und Startdiagnose prüfen, dann den Test vollständig ausführen.');
    }
    if (run.status==='passed' && test.status==='expected' && !message) return {status:'passed'};
    if (run.status==='skipped' && !message && test.status==='skipped') {
        if (spec.file==='touch.spec.cjs' && spec.title===swipeTitle && profiles[project].device.startsWith('Desktop ') &&
            annotated('not-applicable')) return finding('skipped','Desktopprofil ohne Touch','Geräteprofil','Wischprüfung in den fünf Touchprofilen auswerten.');
        const reason = limitation(spec,run,annotations);
        if (reason) return finding('limited',reason,'Belegte Grenze der Tab-Automation','Mit einem nachweislich verborgenen Tab auf dieser Engine gegenprüfen.');
        return finding('blocked','Pflichtprüfung übersprungen oder Messbeleg unzureichend','Fehlender Nachweis','Grund, Annotation und Messanhang prüfen und die Pflichtprüfung wiederholen.');
    }
    const kind = failureKind(run,annotations);
    const attribution = kind==='Timeout'?'Zeitlimit erreicht, Produktursache offen':kind;
    return finding('failed',kind,attribution,'Ersten fehlgeschlagenen Schritt mit Trace und Messungen auf diesem Profil reproduzieren.');
}

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
            if(test.projectName===project) list.push({id:spec.id,file:spec.file,title:spec.title,test});
        }
        for(const child of suite.suites || []) walk(child);
    }
    if(report) walk(report);
    return list;
}
function failureKind(run, annotations) {
    if (annotations.some(a=>a.type==='theme-defect')) return 'Bestätigter Theme-Fehler';
    if (annotations.some(a=>a.type==='browser-incompatibility')) return 'Bestätigte Browserinkompatibilität';
    if (run.status === 'timedOut' || /Timeout(?:Error| .*exceeded)/i.test(run.error?.message || '')) return 'Timeout';
    if (/Unmodelled request|Theme fragment changed|ENOENT/i.test(run.error?.message || '')) return 'Fixture oder Testumgebung';
    return 'Funktionsabweichung, Ursache im Trace prüfen';
}
function classify() {
    fs.mkdirSync(dir,{recursive:true});
    const result = read(path.join(dir,'results.json'));
    const browser = read(path.join(dir,'browser.json'));
    const planned = cases(read(path.join(dir,'planned.json')));
    const executed=cases(result);
    const actual = new Map(executed.map(row=>[row.id,row.test]));
    const plannedIds=new Set(planned.map(spec=>spec.id));
    const totals = counts(), findings = [];
    const extra=executed.filter(spec=>!plannedIds.has(spec.id));
    for (const spec of [...planned,...extra]) {
        const finding=classifyCase(spec,actual.get(spec.id));
        totals[finding.status]++;
        if(finding.status!=='passed') findings.push({title:spec.title,...finding});
    }
    const stages={tooling:env.TOOLING,installation:env.INSTALLATION,launch:env.LAUNCH,suite:env.SUITE};
    const issues=[];
    for(const [name,outcome] of Object.entries(stages)) if(outcome!=='success') issues.push(name+' = '+outcome);
    if(env.INSTALLATION==='failure') issues.push('Browser oder Systemabhängigkeiten konnten nicht bereitgestellt werden');
    if(env.LAUNCH==='failure') issues.push('Browserstart fehlgeschlagen');
    if(!browser?.version || browser.project!==project || browser.engine!==profiles[project].engine) issues.push('Passender Browsernachweis fehlt');
    if(!planned.length || !totals.passed) issues.push('Kein positiver Testnachweis');
    if(plannedIds.size!==planned.length || actual.size!==executed.length || extra.length || planned.some(r=>!actual.has(r.id))) issues.push('Ergebnis unvollständig');
    if(!fs.existsSync(path.join(dir,'report/index.html'))) issues.push('HTML-Einzelbericht fehlt');
    if(result?.errors?.length) issues.push(...result.errors.map(e=>e.message||String(e)));
    let status=PASS;
    if(totals.failed) status=FAILED;
    else if(issues.length||totals.blocked) status=INCOMPLETE;
    else if(totals.limited) status=LIMITED;
    const row={project,tag:env.GITHUB_REF_NAME,commit:env.TEST_COMMIT,browser,planned:planned.length,totals,status,stages,issues,findings};
    write(path.join(dir,'profile.json'),row);
    summary('### '+project+' · '+status+'\n\n'+JSON.stringify(totals)+'\n\n'+issues.map(escape).join(' · '));
    for(const finding of findings.filter(f=>f.status==='limited')) {
        summary('**Eingeschränkte Testabdeckung** · '+escape(finding.title)+' · '+escape(finding.reason));
        console.log('::warning::'+project+' · '+finding.reason);
    }
    if(!successful(status)) process.exitCode=1;
}
function overview() {
    fs.mkdirSync(overviewDir,{recursive:true});
    const tag=env.GITHUB_REF_NAME, commit=env.TEST_COMMIT;
    const selected=require('./profile-selection.cjs')(tag,profiles);
    const single=selected.length===1;
    const notScheduled=Object.keys(profiles).filter(name=>!selected.includes(name));
    const full=notScheduled.length===0;
    const mode=full?'Vollständige Matrix':single?'Einzelprofil iPhone':'Desktop-Teilprüfung Chrome und Chromium';
    const rows=selected.map(name=>{
        const dir=path.join(overviewDir,'storefront-'+name);
        const row=read(path.join(dir,'profile.json'));
        if (!row || row.project!==name || row.commit!==commit || row.tag!==tag ||
            !Array.isArray(row.issues) || !Array.isArray(row.findings) ||
            !Object.keys(labels).every(key=>Number.isSafeInteger(row.totals?.[key]) && row.totals[key]>=0)) {
            return {project:name,status:'BLOCKIERT',planned:0,totals:null,issues:['Eingeplantes Profil ohne gültiges Profil-Artefakt'],findings:[]};
        }
        for (const file of ['browser.json','planned.json','results.json','report/index.html']) {
            if (!fs.existsSync(path.join(dir,file))) row.issues.push('Artefakt fehlt: '+file);
        }
        if (row.totals.failed) row.status=FAILED;
        else if (row.issues.length || row.totals.blocked || !row.planned || !row.totals.passed ||
            Object.values(row.totals).reduce((a,b)=>a+b,0)!==row.planned) row.status=INCOMPLETE;
        else if (row.totals.limited && row.status===PASS) row.status=INCOMPLETE;
        return row;
    });
    const preview=full?read(path.join(overviewDir,'preview-identification','preview.json')):null;
    const total=counts();
    for(const row of rows) if(row.totals) for(const key of Object.keys(total)) total[key]+=row.totals[key];
    let status=PASS;
    if(rows.some(r=>r.status===FAILED)) status=FAILED;
    else if(env.MATRIX_RESULT!=='success' || rows.some(r=>!successful(r.status))) status=INCOMPLETE;
    else if(total.limited) status=LIMITED;

    const totalsText=Object.entries(labels).map(([key,label])=>label+' '+total[key]).join(' · ');
    const unplanned=rows.filter(row=>!row.planned).length;
    const started=rows.filter(r=>r.stages?.launch==='success' && r.browser?.version).length;
    let scope='Funktionsprüfungen mit Twig-Fixtures. Fünf Desktopprofile und fünf emulierte Mobilgeräte. Native Shopfunktionen und physische Geräte wurden in dieser Matrix nicht geprüft.';
    if (single) scope=rows[0].totals?.passed ? 'Keine vollständige Cross-Browser-Freigabe – nur iPhone geprüft (WebKit-Geräteemulation).' : 'Einzelprofil iPhone eingeplant. Der Funktionsnachweis und eine vollständige Cross-Browser-Freigabe stehen aus.';
    else if (!full) scope='Teilprüfung mit Twig-Fixtures für Google Chrome und Chromium. Eine vollständige Cross-Browser-Freigabe erfordert alle zehn Profile.';
    const known=rows.flatMap(r=>r.findings.filter(f=>f.kind==='Bestätigte Browserinkompatibilität').map(f=>r.project+' · '+f.title));
    const coverage=total.limited ? 'Eingeschränkte Testabdeckung: '+total.limited+' Hintergrundtab-Prüfung(en) ohne bestätigtes hidden.' : 'Dokumentierte Einschränkungen: 0.';
    const plannedTests=rows.reduce((sum,row)=>sum+(row.planned||0),0);
    const tech=mode+' · Profile '+selected.length+' · '+(unplanned?'Testplan unvollständig':'Geplante Tests '+plannedTests)+' · GitHub-Matrix '+env.MATRIX_RESULT+' · Browserstarts '+started+'/'+selected.length;
    const excluded=full?'':'Nicht eingeplant: '+notScheduled.join(', ')+'.';
    const table=rows.map(r=>{
        const rel='storefront-'+r.project+'/report/index.html';
        const name=fs.existsSync(path.join(overviewDir,rel))?'<a href="'+rel+'">'+r.project+'</a>':r.project;
        const cells=[profiles[r.project].engine,profiles[r.project].device,r.browser?.version||'–',r.browser?.playwright||'–',r.planned||'–',...Object.keys(labels).map(k=>r.planned?r.totals[k]:'–'),r.status];
        return '<tr><th>'+name+'</th>'+cells.map(c=>'<td>'+escape(c)+'</td>').join('')+'</tr>';
    }).join('');
    const notes=rows.filter(r=>r.issues.length || r.findings.length).map(row=>{
        const details=row.findings.map(f=>{
            const affected=rows.filter(r=>r.findings.some(other=>other.title===f.title && other.status===f.status)).map(r=>r.project);
            return [
                '<details><summary>'+escape(labels[f.status]+' · '+f.title)+'</summary>',
                '<p>'+escape(f.reason)+'</p>',
                '<p>'+escape(f.kind+' · '+f.reproducibility)+'</p>',
                '<p>Gleicher Fallstatus in '+escape(affected.join(', '))+'.</p>',
                '<pre>'+escape(f.message)+'</pre><p>'+escape(f.next)+'</p></details>'
            ].join('');
        });
        return '<h3>'+escape(row.project)+' · '+escape(profiles[row.project].engine)+'</h3>'+
            row.issues.map(issue=>'<p>'+escape(issue)+'</p>').join('')+details.join('');
    }).join('');
    const headings=['Profil / Einzelbericht','Engine','Geräteprofil','Browserversion','Playwright','Geplant',...Object.values(labels),'Bewertung'];
    const html=[
        '<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>B2B-Browserprüfung</title>',
        '<style>body{font:16px/1.5 system-ui;margin:3vw;color:#193b38}table{border-collapse:collapse}th,td{text-align:left;padding:.55em;border-bottom:1px solid #ccd}article{overflow:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere}summary{cursor:pointer}a{color:#156359}.coverage{border-left:4px solid #886020;padding:.4em 1em}</style>',
        '<h1>B2B-Browserprüfung · '+status+'</h1><p>'+escape(tech)+'</p><p>'+escape(totalsText)+'</p><p class="coverage"><b>'+escape(coverage)+'</b></p>',
        '<p><strong>'+escape(scope)+'</strong></p>'+(excluded?'<p>'+escape(excluded)+'</p>':'')+'<p>Tag <b>'+escape(tag)+'</b> · Commit <code>'+escape(commit)+'</code> · develop</p><p>Bestätigte Browserinkompatibilitäten: '+escape(known.join(', ')||'keine ausgewiesen')+'. Vorschauerkennung: '+escape([preview?.status||'nicht ausgeführt',preview?.reason].filter(Boolean).join(' · '))+'.</p>',
        '<article><table><tr>'+headings.map(v=>'<th>'+escape(v)+'</th>').join('')+'</tr>'+table+'</table></article>'+notes+'</html>'
    ].join('');
    fs.writeFileSync(path.join(overviewDir,'index.html'),html);
    write(path.join(overviewDir,'overview.json'),{status,mode,selectedProfiles:selected,notScheduled,plannedTests,tag,commit,totals:total,profilesWithoutPlan:unplanned,preview,rows});
    summary('## B2B · '+status+'\n\n**'+coverage+'**\n\n'+tech+'\n\n'+totalsText+'\n\n'+scope+'\n\n'+excluded+'\n\n'+escape(tag)+' · '+escape(commit)+'\n\n'+rows.map(r=>'- '+r.project+' · '+r.status).join('\n')+'\n\nArtefakt **b2b-browser-report** entpacken und **index.html** öffnen.');
    if(total.limited) console.log('::warning::'+coverage);
    if(!successful(status)) process.exitCode=1;
}
(async()=>{
    switch(process.argv[2]) {
        case 'launch': return launch();
        case 'profile': return classify();
        case 'overview': return overview();
        default: throw Error('Expected launch, profile or overview');
    }
})().catch(error=>{console.error(error);process.exitCode=1;});
