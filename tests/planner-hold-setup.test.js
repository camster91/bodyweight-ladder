const {JSDOM}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const ok=(c,m)=>console.log((c?'PASS ':'FAIL ')+m); const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const now=Date.now(),H=3600e3,D=24*H;
function boot(seed,extra){ const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://x.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{}; if(seed) w.localStorage.setItem('bwl-state',JSON.stringify(seed)); if(extra) extra(w);}}); return dom.window; }
const ids=d=>[...d.querySelectorAll('#view .card[id], #view .mini')].map(e=>e.id?e.id.slice(5):e.dataset.t);
(async()=>{
  const log=[]; const add=(k,ago)=>log.push({ts:now-ago,t:k.split(':')[0],k,sets:[8,8,8]});
  add('push:push-up',5*D); add('squat:bodyweight-squat',3*D); add('pull:jumping-pull-up',2*D); add('row:doorway-row',30*H); add('core:plank',2*H);
  let w=boot({v:2,log,prefs:{setupDone:true}}); await sleep(50); let d=w.document;
  d.querySelector('[data-ui=min][data-m="0"]').click();
  let plan=ids(d); ok(plan[0]==='push','most overdue first: '+plan.slice(0,5));
  const news=plan.filter(id=>!['push','squat','pull','row','core'].includes(id));
  ok(news.length===1,'only one new move in plan for someone who trains ('+news+')');
  ok(!plan.includes('core'),'done 2h ago not in plan');
  d.querySelector('[data-ui=min][data-m="5"]').click(); ok(ids(d).length===1,'5 min → 1 move');
  d.querySelector('[data-ui=min][data-m="30"]').click(); const n30=ids(d).length; ok(n30>=3&&n30<=7,'30 min → '+n30+' moves');
  d.querySelector('[data-ui=more]').click(); ok(d.body.innerHTML.includes('Try something new'),'More shows new moves group');
  // hold timer on plank-type: set level core plank, but core done 2h ago -> open from done list
  d.querySelector('[data-ui=done]').click(); d.querySelector('.mini[data-t=core]').click();
  d.querySelector('[data-act=hold][data-t=core]').click(); await sleep(3000+2100);
  d.querySelector('#timer [data-tm=done]').click(); await sleep(50);
  ok(d.querySelector('#in-core-0').value==='2','hold fills set 1 with seconds ('+d.querySelector('#in-core-0').value+')');
  ok(d.querySelector('#timer').textContent.includes('Rest'),'rest starts after hold');
  ok(d.querySelector('[data-act=hold][data-t=core]').textContent.includes('set 2'),'next hold is set 2');
  // history delete
  d.querySelector('#tab-history').click(); d.querySelector('[data-ui=selentry]').click(); d.querySelector('[data-ui=delentry]').click();
  ok(JSON.parse(w.localStorage.getItem('bwl-state')).log.length===4,'delete entry from history (2 taps)');
  ok(d.body.innerHTML.includes('Your progress')&&d.querySelector('.spark'),'progress section with sparkline');
  // welcome back
  w=boot({v:2,log:log.map(e=>({...e,ts:e.ts-10*D})),prefs:{setupDone:true}}); await sleep(50); d=w.document;
  ok(d.body.innerHTML.includes('Welcome back'),'welcome back after 10+ days');
  d.querySelector('[data-ui=min][data-m="0"]').click(); d.querySelector('[data-ui=more]')?.click();
  const pc=d.querySelector('#card-push')||(d.querySelector('.mini[data-t=push]').click(),d.querySelector('#card-push'));
  ok(d.querySelector('#in-push-0').value==='8','easy goals: same as last time ('+d.querySelector('#in-push-0').value+')');
  // setup
  w=boot(null); await sleep(50); d=w.document;
  ok(d.querySelector('.setup'),'new user sees setup');
  d.querySelector('[data-ui=onext]').click();d.querySelector('[data-ui=stog][data-v=Mobility]').click();d.querySelector('[data-ui=onext]').click();d.querySelector('[data-ui=onext]').click();d.querySelector('[data-ui=stog][data-v=new]').click();d.querySelector('[data-ui=onext]').click();d.querySelector('[data-ui=finish]').click();
  let st=JSON.parse(w.localStorage.getItem('bwl-state'));
  ok(st.prefs.hidden.frog && st.prefs.hidden.pull && st.prefs.hidden.carry && !st.prefs.hidden.push,'setup hides unchosen types, bar-only and weights');
  ok(st.levels.push==='push:incline-push-up','beginner starts at incline push-up');
  ok(d.querySelector('.card.first'),'lands on Today with a plan');
  d.querySelector('#tab-ladders').click(); d.querySelector('[data-ui=setup]').click();
  ok(d.querySelector('.setup'),'Redo setup opens setup');
  d.querySelector('[data-ui=skip]').click(); ok(d.querySelector('.card.first'),'skip returns to Today');
  // new routine selects itself
  d.querySelector('#tab-ladders').click(); d.querySelector('[data-ui=rtoggle]').click(); d.querySelector('[data-ract=new]').click();
  d.querySelector('#rName').value='Knees'; const cb=d.querySelector('input[data-rt=knee]'); cb.checked=true; cb.dispatchEvent(new w.Event('change',{bubbles:true}));
  d.querySelector('[data-ract=save]').click();
  ok(d.querySelector('.showbtn').textContent.includes('Knees') && ids(d).join()==='knee','new routine opens on Today: '+ids(d));
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
