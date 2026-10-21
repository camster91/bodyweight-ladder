const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const now=Date.now(),D=864e5;
function boot(seed,cloud){ const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{}; if(seed) w.localStorage.setItem('bwl-state',JSON.stringify(seed));
  if(cloud){ const ref={get:async()=>{ if(cloud.off) throw {code:'unavailable'}; return cloud.doc?{exists:true,data:()=>JSON.parse(JSON.stringify(cloud.doc))}:{exists:false}; }, set:async d=>{ if(cloud.off) throw {code:'unavailable'}; cloud.doc=JSON.parse(JSON.stringify(d)); }, onSnapshot:()=>()=>{}};
    w.claude={use:async n=>n==='db'?{doc:()=>ref}:n==='user'?{id:async()=>'u'}:null}; } }}); return dom.window; }
const st=w=>JSON.parse(w.localStorage.getItem('bwl-state'));
(async()=>{
  // Redo setup keeps progress + current hidden list
  const log=[{ts:now-D,t:'push',k:'push:archer-push-up',sets:[6,6,6]}];
  let w=boot({v:2,log,levels:{push:'push:archer-push-up'},prefs:{setupDone:true,hidden:{crab:true}}}); await sleep(50); let d=w.document;
  d.querySelector('#tab-ladders').click(); d.querySelector('[data-ui=setup]').click();
  ok(d.querySelector('[data-ui=stog][data-v=keep][aria-pressed=true]'),'redo defaults to Keep my current steps');
  ok(d.querySelector('[data-ui=stog][data-v=Strength][aria-pressed=true]'),'redo starts from current types');
  d.querySelector('[data-ui=stog][data-v=strong]').click(); d.querySelector('[data-ui=finish]').click();
  let s=st(w); ok(s.levels.push==='push:archer-push-up','logged Push keeps its step: '+s.levels.push);
  ok(s.levels.pull==='pull:pull-up','unlogged Pull moves to strong start: '+s.levels.pull);
  // Offline new phone setup must not override account
  const cloud={doc:{v:2,levels:{push:'push:archer-push-up'},stamps:{'levels.push':now-D},prefs:{setupDone:true},log:[],deleted:[],custom:[],routines:[]},off:true};
  w=boot(null,cloud); await sleep(1700+1600); d=w.document;
  ok(d.body.textContent.includes("Can't reach your account"),'offline new phone waits');
  d.querySelector('[data-ui=forcesetup]').click(); d.querySelector('[data-ui=stog][data-v=new]').click(); d.querySelector('[data-ui=finish]').click();
  ok(st(w).levels.push==='push:incline-push-up','offline setup applied locally');
  cloud.off=false; const local=st(w);
  w=boot(local,cloud); await sleep(120);
  ok(cloud.doc.levels.push==='push:archer-push-up' && st(w).levels.push==='push:archer-push-up','account level wins after reconnect');
  // Hold: countdown stop, two sides
  w=boot({v:2,prefs:{setupDone:true},levels:{core:'core:side-plank'},log:[{ts:now-3*D,t:'core',k:'core:side-plank',sets:[20,20,20]}]}); await sleep(50); d=w.document;
  d.querySelector('[data-ui=min][data-m="0"]').click();
  if(!d.querySelector('#card-core')) d.querySelector('.mini[data-t=core]').click();
  d.querySelector('[data-act=hold][data-t=core]').click(); await sleep(500); d.querySelector('#timer [data-tm=done]').click();
  ok(d.querySelector('#in-core-0').value==='25' && d.querySelector('#timer').hidden,'stop during countdown cancels ('+d.querySelector('#in-core-0').value+')');
  d.querySelector('[data-act=hold][data-t=core]').click(); await sleep(3000+3100); d.querySelector('#timer [data-tm=done]').click();
  ok(d.querySelector('#timer').textContent.includes('side 2'),'side 2 starts after side 1');
  await sleep(3000+1100); d.querySelector('#timer [data-tm=done]').click(); await sleep(30);
  ok(d.querySelector('#in-core-0').value==='1','records the weaker side ('+d.querySelector('#in-core-0').value+')');
  // rest blocked during hold
  d.querySelector('#timer [data-tm=stop]')?.click();
  d.querySelector('[data-act=hold][data-t=core]').click(); d.querySelector('[data-act=rest][data-t=core]').click();
  ok(d.querySelector('#timer').textContent.includes('Set 2'),'Rest does not throw away a hold');
  // history delete undo
  d.querySelector('#timer [data-tm=cancel]').click();
  d.querySelector('#tab-history').click(); d.querySelector('[data-ui=selentry]').click(); d.querySelector('[data-ui=delentry]').click();
  ok(st(w).log.length===0,'deleted'); d.querySelector('#toastUndo').click(); ok(st(w).log.length===1,'history delete can be undone');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
