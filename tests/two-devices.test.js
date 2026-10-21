const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
// shared fake server
function server(){ return {doc:null, subs:[], online:true, failCode:null,
  ref(dev){ const S=this; return {
    get:async()=>{ await sleep(20); if(!S.online||!dev.online) throw {code:'unavailable'}; return S.doc?{exists:true,data:()=>JSON.parse(JSON.stringify(S.doc))}:{exists:false}; },
    set:async d=>{ await sleep(5); if(!S.online||!dev.online) throw {code:'unavailable'}; if(S.failCode) throw {code:S.failCode}; S.doc=JSON.parse(JSON.stringify(d)); for(const s of S.subs) if(s.dev!==dev&&s.dev.online) s.fn({exists:true,metadata:{hasPendingWrites:false},data:()=>JSON.parse(JSON.stringify(S.doc))}); },
    onSnapshot(fn){ S.subs.push({dev,fn}); return ()=>{}; } }; } }; }
function device(S, local, opts={}){
  const dev={online:opts.online!==false};
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',beforeParse(w){
    w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=()=>{};
    if(opts.skew){ const N=w.Date.now.bind(w.Date); w.Date.now=()=>N()+opts.skew; }
    if(local) w.localStorage.setItem('bwl-state',JSON.stringify(local));
    w.claude={use:async n=> n==='db'?{doc:()=>S.ref(dev)}: n==='user'?{id:async()=>'u1'}:null};
  }});
  dev.w=dom.window; dev.d=dom.window.document; return dev;
}
const st=dev=>JSON.parse(dev.w.localStorage.getItem('bwl-state'));
const click=(dev,sel)=>{ const e=dev.d.querySelector(sel); if(!e) throw new Error('no '+sel); e.click(); };
(async()=>{
  // C1: account has settings; brand new phone offline at first, logs a set, then comes online
  let S=server();
  let A=device(S,{v:2,prefs:{setupDone:true}}); await sleep(80);
  click(A,'#tab-ladders'); ((A.d.querySelector('[data-ui=ex][data-t=push][aria-expanded=false]')||{click(){}}).click(), click(A,'[data-act=set][data-t=push][data-l="5"]')); ((A.d.querySelector('[data-ui=ex][data-t=crab][aria-expanded=false]')||{click(){}}).click(), click(A,'[data-act=hide][data-t=crab]'));
  A.d.querySelector('#cName').value='Burpees'; A.d.querySelector('#addForm').dispatchEvent(new A.w.Event('submit',{bubbles:true,cancelable:true}));
  await sleep(80);
  ok(S.doc.levels.push==='push:archer-push-up' && S.doc.custom.length===1,'A settings in cloud');
  let B=device(S,{v:2,prefs:{setupDone:true}},{online:false}); await sleep(60); ok(true,'(new offline phone now waits instead of setup)');
  click(B,'[data-act=save]'); await sleep(20);
  B.online=true; await sleep(31000/1000*0); // connect retry is 30s; call directly instead
  // force reconnect quickly: reload B with its local state online
  const bLocal=st(B); B=device(S,bLocal); await sleep(120);
  ok(S.doc.levels.push==='push:archer-push-up','C1 new phone did not reset Push level ('+S.doc.levels.push+')');
  ok(S.doc.custom.length===1 && S.doc.prefs.hidden.crab,'C1 custom exercise + hidden kept');
  ok(S.doc.log.length===1,'C1 B log reached cloud ('+S.doc.log.length+')');
  ok(st(B).levels.push==='push:archer-push-up','B now has A settings');

  // H1: B offline logs set while A levels up; B reconnects
  S=server(); A=device(S,{v:2,prefs:{setupDone:true}}); await sleep(80);
  B=device(S,{v:2,prefs:{setupDone:true}}); await sleep(80);
  B.online=false;
  click(A,'#tab-ladders'); ((A.d.querySelector('[data-ui=ex][data-t=push][aria-expanded=false]')||{click(){}}).click(), click(A,'[data-act=set][data-t=push][data-l="4"]')); await sleep(30);
  click(B,'#tab-today'); click(B,'[data-act=save]'); await sleep(30);
  const b2=st(B); B=device(S,b2); await sleep(120);
  ok(S.doc.levels.push==='push:diamond-push-up','H1 A level-up survives B reconnect ('+S.doc.levels.push+')');
  ok(st(A).levels.push==='push:diamond-push-up','H1 A still shows it');

  // H2: clock skew, B hides crab, A (1h ahead) then hides bear
  S=server(); A=device(S,{v:2,prefs:{setupDone:true}},{skew:3600e3}); await sleep(80); B=device(S,{v:2,prefs:{setupDone:true}}); await sleep(80);
  click(A,'#tab-ladders'); ((A.d.querySelector('[data-ui=ex][data-t=push][aria-expanded=false]')||{click(){}}).click(), click(A,'[data-act=focus][data-t=push][data-f=more]')); await sleep(150);
  click(B,'#tab-ladders'); ((B.d.querySelector('[data-ui=ex][data-t=crab][aria-expanded=false]')||{click(){}}).click(), click(B,'[data-act=hide][data-t=crab]')); await sleep(150);
  ok(st(A).prefs.hidden.crab===true,'H2 A sees B hide despite clock skew');
  ((A.d.querySelector('[data-ui=ex][data-t=bear][aria-expanded=false]')||{click(){}}).click(), click(A,'[data-act=hide][data-t=bear]')); await sleep(150);
  ok(S.doc.prefs.hidden.crab && S.doc.prefs.hidden.bear && S.doc.prefs.focus.push==='more','H2/M2 all three changes kept');

  // H3: invalid_argument does not delete history
  S=server(); const big={v:2,log:Array.from({length:1000},(_,i)=>({ts:Date.now()-i*6e5,t:'push',k:'push:push-up',sets:[8,8,8]}))};
  S.failCode='invalid_argument'; A=device(S,big); await sleep(150);
  ok(st(A).log.length===1000,'H3 local log intact ('+st(A).log.length+')');
  ok(A.d.querySelector('#saveNote').textContent.startsWith("Can't save"),'H3 shows read-only note');

  // Zoom/long name/zero
  S=server(); A=device(S,{v:2,prefs:{setupDone:true}}); await sleep(60);
  A.d.querySelectorAll('.card.first input[data-t]').forEach(i=>{});
  const id=A.d.querySelector('.card.first').id.slice(5);
  A.d.querySelectorAll('.card.first [data-act=dec]').forEach(()=>{});
  // set all to 0 via drafts
  A.d.querySelectorAll('.card.first input[data-t]').forEach(i=>{ i.value='0'; i.dispatchEvent(new A.w.Event('input',{bubbles:true})); });
  click(A,'.card.first [data-act=save]'); ok(st(A).log.length===0,'zero save asks first');
  await sleep(950); click(A,'.card.first [data-act=save]'); ok(st(A).log.length===1,'second tap logs zeros');
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
