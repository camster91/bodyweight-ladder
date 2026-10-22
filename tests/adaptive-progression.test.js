const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}});
const w=dom.window,D=864e5,now=Date.now();
const entry=(days,sets,effort,t='push',k='push:push-up')=>({ts:now-days*D,t,k,sets,...(effort?{effort,effortAt:now-days*D+1}:{})});
function decide(log,id='push'){w.eval(`state.log=${JSON.stringify(log)};idx=null;`);return JSON.parse(w.eval(`JSON.stringify(progression(findTrack('${id}')))`));}
const pass=(name,fn)=>{fn();console.log('PASS '+name);};
try{
pass('one small increment is added to a lower set, including timed holds',()=>{
 assert.deepEqual(decide([entry(2,[8,7,6],'steady')]).goals,[8,7,7]);
 assert.deepEqual(decide([entry(2,[20,20,20],'easy','core','core:plank')],'core').goals,[25,20,20]);
});
pass('hard effort holds targets and a week away suppresses increases',()=>{
 assert.deepEqual(decide([entry(2,[8,7,6],'hard')]).goals,[8,7,6]);
 assert.equal(decide([entry(8,[8,7,6],'easy')]).kind,'return');
});
pass('two recent distinct training days are required for a higher variation',()=>{
 assert.equal(decide([entry(2,[12,12,12])]).kind,'confirm');
 assert.equal(decide([entry(2,[12,12,12]),entry(2.01,[12,12,12])]).kind,'confirm');
 const p=decide([entry(2,[12,12,12],'steady'),entry(4,[12,12,12],'easy')]);assert.equal(p.kind,'up');assert.equal(p.level,4);
 assert.notEqual(decide([entry(2,[12,12,12]),entry(40,[12,12,12])]).kind,'up');
 assert.notEqual(decide([entry(2,[12,12,12]),entry(4,[12,12,12],'hard')]).kind,'up');
});
pass('repeated hard misses suggest an easier step while one miss never does',()=>{
 assert.equal(decide([entry(2,[4,4,4],'hard')]).kind,'hold');
 const p=decide([entry(2,[4,4,4],'hard'),entry(4,[4,4,3],'hard')]);assert.equal(p.kind,'down');assert.equal(p.level,2);
});
pass('plateaus compare matching set counts across distinct days, not extra volume',()=>{
 assert.equal(decide([entry(2,[8,8,8]),entry(4,[8,8,8]),entry(6,[8,8,8])]).kind,'steady');
 assert.equal(decide([entry(2,[8,8,8],'easy'),entry(4,[8,8,8]),entry(6,[8,8,8])]).kind,'build');
 assert.notEqual(decide([entry(2,[8,8,8]),entry(4,[8,8]),entry(6,[8,8])]).kind,'steady');
 assert.equal(decide([entry(2,[8,8])]).kind,'hold');
});
pass('recommendations stay within bounds and the final ladder never advances',()=>{
 assert(decide([entry(2,[0,0,0])]).goals.every(v=>v>=5&&v<=12));
 w.eval(`state.levels.push=keyOf(findTrack('push'),6);`);
 assert.notEqual(decide([entry(2,[8,8,8],null,'push','push:pseudo-planche-push-up'),entry(4,[8,8,8],null,'push','push:pseudo-planche-push-up')]).kind,'up');
 w.eval(`state.levels.push=keyOf(findTrack('push'),3);`);
});
pass('effort survives reload and converges with old copies in both merge orders',()=>{
 const raw={v:2,prefs:{setupDone:true},log:[entry(2,[8,8,8],'hard')]};
 const normalize=o=>JSON.parse(w.eval(`JSON.stringify(normalize(${JSON.stringify(o)}))`));
 const rated=normalize(raw),old=normalize({...raw,log:raw.log.map(({effort,effortAt,...e})=>e)});
 const merged=(a,b)=>JSON.parse(w.eval(`JSON.stringify(merge(${JSON.stringify(a)},${JSON.stringify(b)}))`));
 assert.equal(merged(old,rated).log[0].effort,'hard');assert.equal(merged(rated,old).log[0].effort,'hard');
 const cleared=normalize({...raw,log:raw.log.map(({effort,...e})=>({...e,effortAt:e.effortAt+1}))});
 assert.equal(merged(cleared,rated).log[0].effort,undefined);assert.equal(merged(rated,cleared).log[0].effort,undefined);
 assert.equal(normalize({...raw,log:raw.log.map(e=>({...e,effort:'invalid'}))}).log[0].effort,undefined);
});
pass('feedback changes no reps or entry identity and undo removes its effect',()=>{
 w.eval(`state.log=[];idx=null;focusRun=null;render();`);
 const click=s=>{assert(w.document.querySelector(s),s);w.document.querySelector(s).click();};
 for(let i=0;i<3;i++){if(i)click('[data-focus="skip"]');click('[data-focus="complete"]');}
 const before=JSON.parse(w.localStorage.getItem('bwl-state')).log[0];
 click('[data-coach="effort"][data-effort="hard"]');
 const after=JSON.parse(w.localStorage.getItem('bwl-state')).log[0];assert.deepEqual(after.sets,before.sets);assert.equal(after.ts,before.ts);assert.equal(after.effort,'hard');
 click('[data-focus="undo"]');assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,0);assert.equal(w.document.querySelector('.effort-check'),null);
});
pass('targets stay frozen after history changes and stale prompts cannot change a partial exercise',()=>{
 w.eval(`state.log=${JSON.stringify([entry(2,[12,12,12]),entry(4,[12,12,12])])};idx=null;focusRun=null;minutes=5;render();`);
 const original=w.eval('JSON.stringify(focusItem().goals)');
 w.eval(`state.log.push(${JSON.stringify(entry(1,[8,8,8],'hard'))});idx=null;render();`);
 assert.equal(w.eval('JSON.stringify(focusItem().goals)'),original);assert(w.document.querySelector('.coach-inline').textContent.includes('Targets kept'));
 w.document.querySelector('[data-focus="complete"]').click();
 w.eval(`handleCoach({dataset:{coach:'level',t:'push',level:'4'}})`);
 assert.equal(w.eval('lvlOf(findTrack("push"))'),3);assert.equal(w.eval('focusItem().values.length'),1);
});
}finally{w.close();}process.exit(0);
