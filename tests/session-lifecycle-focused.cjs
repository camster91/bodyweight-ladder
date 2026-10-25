// Targeted session adapter checks. No app boot, browser, user data or full suite.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.join(__dirname,'..'),sessions=require('../ui/session-engine.js');
const source=fs.readFileSync(path.join(root,'ui/workout-session.js'),'utf8'),extras=fs.readFileSync(path.join(root,'ui/workout-extras.js'),'utf8');
let passed=0;
function fixture(saved){
 let now=Date.UTC(2026,9,25,12),stored={},nodes=new Map();
 function element(){return {listeners:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},focus(){},showModal(){this.open=true;},querySelector(s){this.children??=new Map();if(!this.children.has(s))this.children.set(s,element());return this.children.get(s);},querySelectorAll(s){return [this.querySelector(s)];},addEventListener(t,f){(this.listeners[t]??=[]).push(f);},close(){this.open=false;for(const f of this.listeners.close||[])f();},remove(){if(this.id)nodes.delete('#'+this.id);}};}
 const tracks=['push','core','squat'].map(id=>({id,steps:[[id,3,5,12,id==='core'?'sec':'reps','','Floor']]}));
 const c={Date:class extends Date{static now(){return now;}},Math,JSON,Set,LadderSessions:sessions,focusRun:saved?.run||{sessionId:'fixture',started:now,phase:'work',at:0,items:tracks.slice(0,2).map(t=>({id:t.id,key:t.id+':step',goals:[5,5,5],values:[]}))},state:saved?.state||{log:[],sessions:[]},hold:null,buzzed:false,focusUndo:null,drafts:{},completedSets:{},holdNext:{},lastSaveAt:0,storageRecovery:{active:false},workoutToolsPanel:'main',workoutToolsOpen:false,readinessChoice:null,swapChoice:null,
  entryId:e=>e.ts+'|'+e.t,dayOf:ts=>new Date(ts).toISOString().slice(0,10),findTrack:id=>tracks.find(t=>t.id===id),lvlOf:()=>0,keyOf:t=>t.id+':step',spec:t=>t.steps[0],sessionLevel:()=>0,sessionSpec:t=>t.steps[0],goals:()=>[5,5,5],equipmentReady:()=>true,isHidden:()=>false,sessionHasDraft:x=>!!x.advancedDraft,isSec:u=>u.startsWith('sec'),exerciseThumbnail:()=>'<span class="exercise-thumb"><img src="pose.webp" alt=""></span>',
  writeLocal:(k,v)=>{stored[k]=v;return true;},saveLocal:()=>{stored.state=JSON.stringify(c.state);},pushCloud(){},commit(){c.saveLocal();},stopTimer(){c.hold=null;},render(){},closeWorkoutTools(){},announceTimer(){},toast(){},primeAudio(){},workoutCue(){},tick(){},applyComponentSystem(){},esc:x=>x,
  document:{activeElement:null,body:{classList:{add(){},remove(){}},append(d){nodes.set('#'+d.id,d);}},querySelector:()=>null,createElement:element,addEventListener(){}},
  $:s=>nodes.get(s)||null,
  startRest(sec,end){c.restDeadline=end;},startHold(t,side){c.hold={tid:t.id,i:c.holdNext[t.id],goal:5,start:now+10000,side,sides:1};}
 };
 c.focusItem=()=>c.focusRun?.items[c.focusRun.at];c.persistFocus=()=>c.persistWorkoutSession();
 vm.createContext(c);vm.runInContext(source,c);vm.runInContext(extras,c);
 return {c,nodes,element,advance:ms=>now+=ms,snapshot:()=>JSON.parse(JSON.stringify({run:c.focusRun,state:c.state})),stored,confirm:()=>nodes.get('#finishWorkoutToday').querySelector('[data-session-finish-confirm]').listeners.click[0]()};
}
function timerFixture(saved){
 const f=fixture(saved),c=f.c,html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 for(const selector of ['#timer','#timerText','#timer [data-tm=done]','#focusClock','[data-focus=finish]','#focusArc','#focusPrimary'])f.nodes.set(selector,f.element());
 Object.assign(c,{restTick:null,restEnd:0,wake:null,setInterval:()=>1,clearInterval(){},grabWake(){},showTimer(){},softRender(){},pad2:n=>String(n).padStart(2,'0'),focusTime:s=>String(s),focusRestOffset:()=>0,sessionGoals:()=>c.focusItem().goals});
 vm.runInContext(html.slice(html.indexOf('function startRest(sec,deadline){'),html.indexOf('function finishHold(){')),c);
 const stop=html.indexOf('function stopTimer(){');vm.runInContext(html.slice(stop,html.indexOf('\n',stop)),c);
 vm.runInContext(html.slice(html.indexOf('function resumeFocus({background=false}={})'),html.indexOf('function completeFocus(')),c);
 vm.runInContext(html.slice(html.indexOf('function adjustRest(seconds){'),html.indexOf('function addFocusRest()')),c);
 return f;
}
function check(name,fn){fn();passed++;console.log('PASS '+name);}
check('Rep edits and performed sets survive pause, serialization and resume',()=>{
 let f=fixture();f.c.focusItem().values=[7];f.c.focusItem().value=9;f.c.pauseWorkout();const saved=f.snapshot();f=fixture(saved);f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.focusRun.phase,'work');assert.deepEqual(Array.from(f.c.focusItem().values),[7]);assert.equal(f.c.focusItem().value,9);assert.equal(f.c.state.log.length,0);
});
check('Rest pause freezes the remaining duration across reload',()=>{
 let f=fixture();f.c.focusRun.phase='rest';f.c.focusRun.restEnd=f.c.Date.now()+37000;f.c.focusRun.restDuration=90;f.c.pauseWorkout();f=fixture(f.snapshot());f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.focusRun.phase,'rest');assert.equal(f.c.restDeadline-f.c.Date.now(),37000);assert.equal(f.c.focusRun.restDuration,90);
});
check('Hold pause preserves elapsed time, side and first-side result across reload',()=>{
 let f=fixture();f.c.focusRun.at=1;f.c.hold={tid:'core',i:0,goal:20,start:f.c.Date.now()-13000,side:2,sides:2,first:18,focus:true,announcedStart:true};f.c.pauseWorkout();f=fixture(f.snapshot());f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.Date.now()-f.c.hold.start,13000);assert.equal(f.c.hold.side,2);assert.equal(f.c.hold.first,18);assert.equal(f.c.hold.announcedStart,true);assert.equal(f.c.state.log.length,0);
});
check('Preparation pause preserves only the remaining countdown',()=>{
 let f=fixture();f.c.focusRun.at=1;f.c.hold={tid:'core',i:0,goal:20,start:f.c.Date.now()+4000,side:1,sides:1,focus:true};f.c.pauseWorkout();f=fixture(f.snapshot());f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.hold.start-f.c.Date.now(),4000);assert.equal(f.c.state.log.length,0);
});
check('Skip saves performed sets once and leaves untouched targets unrecorded',()=>{
 const f=fixture();f.c.focusItem().values=[8];f.c.handleSessionAction('skip');assert.equal(f.c.state.log.length,1);assert.deepEqual(Array.from(f.c.state.log[0].sets),[8]);assert.equal(f.c.focusRun.items[0].skipped,true);assert.equal(f.c.focusRun.at,1);f.c.handleSessionAction('skip');assert.equal(f.c.state.log.length,1);assert.equal(f.c.focusRun.endStatus,'partial');
});
check('Swap archives performed work and offers only the remaining sets',()=>{
 const f=fixture();f.c.focusItem().values=[8];f.c.handleSessionAction('swap');assert.equal(f.c.state.log.length,1);assert.deepEqual(Array.from(f.c.state.log[0].sets),[8]);assert.equal(f.c.focusItem().goals.length,2);assert.equal(f.c.focusItem().values.length,0);assert.equal(f.c.focusRun.logRefs.length,1);assert.equal(f.c.workoutToolsPanel,'alternatives');
});
check('Finish early saves performed work and records an honest partial outcome',()=>{
 const f=fixture();f.c.focusItem().values=[8];f.c.finishWorkoutToday();assert.equal(f.c.focusRun.phase,'paused');assert.equal(f.c.state.log.length,0);f.confirm();assert.equal(f.c.state.log.length,1);assert.equal(f.c.state.log[0].sets.length,1);assert.equal(f.c.focusRun.endStatus,'partial');assert.equal(f.c.state.sessions.at(-1).performedSets,1);assert.equal(f.c.state.sessions.at(-1).completed,0);assert.equal(f.c.focusRun.items[1].omitted,true);
});
check('Optional extra work preserves old entries and never invents completed sets',()=>{
 const f=fixture();f.c.focusItem().values=[8];f.c.finishWorkoutToday();f.confirm();const oldId=f.c.focusRun.logRefs[0];assert.equal(f.c.addWorkoutExtra('push',{oneSet:true}),true);assert.equal(f.c.focusRun.items.filter(x=>x.id==='push').length,1);assert.equal(f.c.focusItem().goals.length,1);assert.equal(f.c.focusItem().values.length,0);assert.equal(f.c.state.log.length,1);f.c.focusItem().values=[6];f.c.savePendingSessionItem(f.c.focusItem());f.c.advanceWorkoutItem();assert.equal(f.c.state.log.length,2);assert(f.c.focusRun.logRefs.includes(oldId));assert(f.c.state.log[1].ts>f.c.state.log[0].ts);assert.equal(f.c.focusRun.endStatus,'partial');assert.equal(f.c.state.sessions.at(-1).performedSets,2);
});
check('Real timer code resumes an elapsed hold without adding the paused time',()=>{
 let f=timerFixture();f.c.focusRun.at=1;f.c.focusItem().goals=[20,20,20];f.c.startHold(f.c.findTrack('core'));f.c.hold.focus=true;f.advance(23000);f.c.tick();f.c.pauseWorkout();f=timerFixture(f.snapshot());f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.Date.now()-f.c.hold.start,13000);assert.equal(f.nodes.get('#focusClock').textContent,'13s');assert.equal(f.c.state.log.length,0);
});
check('Rest expiry and subtracting the final seconds never auto-start the next hold',()=>{
 const f=timerFixture();f.c.focusRun.at=1;f.c.focusRun.phase='rest';f.c.focusRun.restDuration=90;f.c.focusRun.restEnd=f.c.Date.now()+20000;f.c.startRest(20,f.c.focusRun.restEnd);f.c.adjustRest(-30);assert.equal(f.c.focusRun.phase,'work');assert.equal(f.c.hold,null);assert.equal(f.c.state.log.length,0);assert.equal(f.c.restTick,null);
});
check('Real rest timer preserves its deadline and stops at zero after reload',()=>{
 let f=timerFixture();f.c.focusRun.phase='rest';f.c.focusRun.restDuration=90;f.c.focusRun.restEnd=f.c.Date.now()+37000;f.c.startRest(37,f.c.focusRun.restEnd);f.c.pauseWorkout();f=timerFixture(f.snapshot());f.advance(600000);f.c.resumeWorkout();assert.equal(f.c.restEnd-f.c.Date.now(),37000);f.advance(37000);f.c.tick();assert.equal(f.c.focusRun.phase,'work');assert.equal(f.c.hold,null);assert.equal(f.c.state.log.length,0);
});
check('A fully performed workout becomes completed, with accurate saved-set totals',()=>{
 const f=fixture();for(const x of f.c.focusRun.items){x.values=[6,7,8];f.c.savePendingSessionItem(x);}f.c.advanceWorkoutItem();assert.equal(f.c.focusRun.endStatus,'completed');assert.equal(f.c.state.sessions.at(-1).status,'completed');assert.equal(f.c.state.sessions.at(-1).completed,2);assert.equal(f.c.state.sessions.at(-1).performedSets,6);
});
check('Paused Skip and Swap cannot change or record workout data',()=>{
 const f=fixture();f.c.focusItem().values=[7];f.c.pauseWorkout();const before=JSON.stringify(f.snapshot());f.c.handleSessionAction('skip');f.c.handleSessionAction('swap');assert.equal(JSON.stringify(f.snapshot()),before);
});
check('Invalid saved hold snapshots fall back to ready without recording a set',()=>{
 const f=timerFixture();f.c.focusRun.phase='paused';f.c.focusRun.pauseSnapshot={kind:'hold',tid:'missing',elapsedMs:90000};f.c.resumeWorkout();assert.equal(f.c.focusRun.phase,'work');assert.equal(f.c.hold,null);assert.equal(f.c.state.log.length,0);
});
check('Applying and restoring an alternative preserves the earlier partial work',()=>{
 const f=fixture(),c=f.c,html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 vm.runInContext(html.slice(html.indexOf('function canSwapItem('),html.indexOf('function swapOptions(')),c);
 vm.runInContext(html.slice(html.indexOf('function applySwap('),html.indexOf('function handleSwap(')),c);
 c.$=selector=>({textContent:'',focus(){}});c.focusItem().values=[8];c.handleSessionAction('swap');
 c.swapPreview=()=>({t:c.findTrack('squat'),goals:[5,5,5],light:false,st:c.spec(c.findTrack('squat'))});
 c.applySwap('squat',0);assert.equal(c.focusItem().id,'squat');assert.equal(c.focusItem().goals.length,2);assert.equal(c.state.log.length,1);assert.equal(c.focusRun.logRefs.length,1);
 c.restoreSwap();assert.equal(c.focusItem().id,'push');assert.equal(c.focusItem().goals.length,2);assert.equal(c.state.log.length,1);assert.deepEqual(Array.from(c.state.log[0].sets),[8]);
});
check('Paused preview names the next set and the frozen rest time',()=>{
 const f=fixture();f.c.focusItem().values=[8];f.c.focusRun.phase='rest';f.c.focusRun.restDuration=90;f.c.focusRun.restEnd=f.c.Date.now()+37000;f.c.pauseWorkout();const markup=f.c.sessionPausedView();assert.match(markup,/Up next · Set 2 of 3/);assert.match(markup,/Rest paused · 0:37 left/);assert.match(markup,/<h3>push<\/h3>/);assert.match(markup,/Resume workout/);
});
check('Paused hold preview shows elapsed time and preparation without claiming completion',()=>{
 const f=fixture();f.c.focusRun.at=1;f.c.hold={tid:'core',i:0,goal:5,start:f.c.Date.now()-3000,side:2,sides:2,first:4,focus:true};f.c.pauseWorkout();assert.match(f.c.sessionPausedView(),/Hold paused · 3 seconds elapsed · side 2/);assert.match(f.c.sessionPausedView(),/Continue · Set 1 of 3/);f.c.focusRun.pauseSnapshot.elapsedMs=0;f.c.focusRun.pauseSnapshot.readyMs=4000;assert.match(f.c.sessionPausedView(),/countdown paused · 4 seconds left/);assert.equal(f.c.state.log.length,0);
});
console.log(passed+' focused lifecycle checks passed.');
