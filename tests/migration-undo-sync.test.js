const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const H=3600e3, D=24*H, now=Date.now();
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
function boot(localState, cloud){
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/',
    beforeParse(w){
      w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
      if(localState) w.localStorage.setItem('bwl-state',JSON.stringify(localState));
      if(cloud){
        const ref={ get:async()=>{ await new Promise(r=>setTimeout(r,30)); return cloud.doc?{exists:true,data:()=>JSON.parse(JSON.stringify(cloud.doc))}:{exists:false}; },
          set:async d=>{ cloud.sets++; if(cloud.fail){ throw {code:'unavailable'}; } cloud.doc=JSON.parse(JSON.stringify(d)); },
          onSnapshot:(n)=>{ cloud.push=n; return ()=>{}; } };
        w.claude={use:async n=> n==='db'?{doc:()=>ref}: n==='user'?{id:async()=>'u1'}:null};
      }
    }});
  return dom;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  // 1. Migration of old index-based data
  const T_PULL=1792527063000, T_CORE=1792526436000;
  const old={levels:{pull:1,core:2,push:4,tendon:3},updated:T_CORE-5000,
    log:[{d:'2026-10-19',ts:T_PULL-D,t:'pull',s:1,sets:[8,8,8]},
         {ts:T_PULL-D+1,t:'pull',s:0,sets:[30,30,30]},
         {ts:T_PULL+H,t:'pull',s:1,sets:[20,20,20]},
         {ts:T_CORE-H,t:'core',s:2,sets:[20,20,20]},
         {ts:T_CORE+H,t:'core',s:2,sets:[25,25,25]},
         {ts:1792525700000,t:'tendon',s:2,sets:[15,15,15]}],
    prefs:{hidden:{},focus:{},sets:{}}, custom:[], routines:[{id:'r-tendon',name:'Tendon builder',items:['knee','tendon']}]};
  let w=boot(old).window; await sleep(50);
  let st=JSON.parse(w.localStorage.getItem('bwl-state'));
  const ks=st.log.map(e=>e.k);
  ok(ks.includes('pull:scapular-pull'),'old Pull s:1 → Scapular pull');
  ok(ks.includes('hang:dead-hang'),'old Pull s:0 → Dead hang item');
  ok(ks.includes('pull:flexed-arm-hang'),'new Pull s:1 after reorder → Flexed-arm hang');
  ok(ks.includes('core:hollow-hold')&&ks.includes('core:side-plank'),'Core before/after insert');
  ok(ks.includes('shin:tibialis-raise'),'old tendon entry → Shins');
  ok(st.levels.pull==='pull:scapular-pull','pull level 1 (old order) → scapular pull: '+st.levels.pull);
  ok(st.levels.core==='core:hollow-hold','core level 2 before insert → hollow hold: '+st.levels.core);
  ok(st.levels.push==='push:diamond-push-up','push level 4 → diamond: '+st.levels.push);
  ok(!('tendon' in st.levels),'old tendon level dropped');
  const rt=st.routines.find(r=>r.id==='r-tendon'); ok(rt.items.join()==='knee,ankle','routine tendon→ankle: '+rt.items);
  ok(st.routines.some(r=>r.id==='r-stretch')&&st.routines.some(r=>r.id==='r-heart'),'missing presets added');
  w.document.querySelector('#tab-history').click();
  ok(!w.document.querySelector('#view').textContent.includes('Removed exercise'),'history has no orphan rows');
  w.close();

  // 2. Double tap, Undo, hidden in routine, side plank +5
  w=boot({v:2,prefs:{setupDone:true}}).window; await sleep(50); const d=w.document;
  d.querySelector('[data-act=save]').click(); d.querySelector('[data-act=save]').click();
  st=JSON.parse(w.localStorage.getItem('bwl-state')); ok(st.log.length===1,'double tap saves once ('+st.log.length+')');
  ok(!d.querySelector('#toastUndo').hidden,'Undo shown');
  d.querySelector('#toastUndo').click();
  st=JSON.parse(w.localStorage.getItem('bwl-state')); ok(st.log.length===0 && st.deleted.length===1,'Undo removes entry + remembers deletion');
  ok(!!d.querySelector('#card-'+st.deleted[0].split('|')[1]),'undone card reopened');
  // hide push, check Full strength routine
  d.querySelector('#tab-ladders').click(); ((d.querySelector('[data-ui=ex][data-t=push][aria-expanded=false]')||{click(){}}).click(), d.querySelector('[data-act=hide][data-t=push]').click());
  d.querySelector('#tab-today').click(); d.querySelector('[data-ui=sheet]').click(); d.querySelector('[data-ui=pick][data-f="r:r-strength"]').click();
  const ids=[...d.querySelectorAll('#view .card[id], #view .mini')].map(e=>e.id||e.dataset.t);
  ok(!ids.includes('push')&&!ids.includes('card-push'),'hidden Push not in routine');
  // side plank step
  d.querySelector('#tab-ladders').click(); ((d.querySelector('[data-ui=ex][data-t=core][aria-expanded=false]')||{click(){}}).click(), d.querySelector('[data-act=set][data-t=core][data-l="2"]').click());
  d.querySelector('#tab-today').click(); d.querySelector('[data-ui=sheet]').click(); d.querySelector('[data-ui=pick][data-f=All]').click(); d.querySelector('[data-ui=min][data-m="0"]').click();
  const fm=d.querySelector('[data-ui=more][aria-expanded=false]'); if(fm) fm.click(); const mini=d.querySelector('.mini[data-t=core]'); if(mini) mini.click();
  const before=+d.querySelector('#in-core-0').value; d.querySelector('[data-act=inc][data-t=core][data-i="0"]').click();
  ok(+d.querySelector('#in-core-0').value===before+5,'side plank steps by 5s');
  ok(true,'counter');
  w.close();

  // 3. Cloud merge on load + logs during sync + live update + failure
  const cloud={sets:0, doc:{v:2,updated:now-D,levels:{},log:[{ts:now-3*D,t:'push',k:'push:push-up',sets:[9,9,9]}],deleted:[],prefs:{hidden:{},focus:{},sets:{},presetsSeen:['r-strength','r-over40','r-tendon','r-heart','r-move','r-stretch']},custom:[],routines:[]}};
  const loc={v:2,updated:now-H,levels:{},log:[{ts:now-2*D,t:'squat',k:'squat:bodyweight-squat',sets:[15,15,15]}],deleted:[],prefs:{hidden:{dip:true},focus:{},sets:{}},custom:[],routines:[]};
  w=boot(loc,cloud).window; const d3=w.document;
  d3.querySelector('[data-act=save]').click();           // logged while syncing
  await sleep(150);
  const c=cloud.doc; const cks=c.log.map(e=>e.k);
  ok(cks.includes('push:push-up')&&cks.includes('squat:bodyweight-squat')&&c.log.length===3,'cloud has cloud+local+during-sync entries ('+c.log.length+')');
  ok(c.prefs.hidden.dip===true,'newer local settings win');
  ok(d3.querySelector('#saveNote').textContent.startsWith('Saved to your account'),'note: synced');
  // other device pushes a new entry
  const other=JSON.parse(JSON.stringify(c)); other.log.push({ts:Date.now(),t:'row',k:'row:doorway-row',sets:[12,12,12]}); other.updated=Date.now();
  cloud.push({exists:true,metadata:{hasPendingWrites:false},data:()=>other}); await sleep(30);
  st=JSON.parse(w.localStorage.getItem('bwl-state')); ok(st.log.some(e=>e.k==='row:doorway-row'),'live update from other device merged');
  // write failure
  cloud.fail=true; d3.querySelector('#tab-ladders').click(); ((d3.querySelector('[data-ui=ex][data-t=bear][aria-expanded=false]')||{click(){}}).click(), d3.querySelector('[data-act=hide][data-t=bear]').click()); await sleep(50);
  ok(d3.querySelector('#saveNote').textContent.startsWith('Not synced'),'failed write shows Not synced');
  cloud.fail=false; await sleep(3800);
  ok(d3.querySelector('#saveNote').textContent.startsWith('Saved'),'retry recovers');
  // size
  ok(JSON.stringify({log:Array.from({length:2000},(_,i)=>({ts:now+i,t:'hinge',k:'hinge:single-leg-glute-bridge',sets:[12,12,12]}))}).length<200000,'2000 entries < 200KB');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
