const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const windows=[];
function boot(storage={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,log:[],prefs:{setupDone:true}}));for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);}});windows.push(dom.window);return dom.window;}
const click=(w,s)=>{const b=w.document.querySelector(s);assert(b,s);b.click();};
const run=w=>JSON.parse(w.localStorage.getItem('bwl-focus'));
const log=w=>JSON.parse(w.localStorage.getItem('bwl-state')).log;
const storage=w=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
try{
 let w=boot(),d=w.document;
 assert(d.querySelector('[data-focus=complete]'));assert(!d.querySelector('.focus-workout').open);assert(!d.querySelector('.focus-edit').open);assert(!d.querySelector('.focus-technique').open);
 console.log('PASS Focus presents one set with workout, editing and technique collapsed');
 const initial=run(w).items.map(x=>x.id);
 click(w,'[data-focus=plus]');const reps=+d.querySelector('#focusValue').textContent;
 click(w,'[data-focus=complete]');assert.equal(log(w).length,0);assert.equal(run(w).phase,'rest');assert.equal(run(w).items[0].values[0],reps);
 const before=run(w).restEnd;click(w,'[data-focus=add]');assert.equal(run(w).restEnd,before+30000);
 click(w,'[data-focus=undo]');assert.equal(run(w).phase,'work');assert.equal(run(w).items[0].values.length,0);assert.equal(+d.querySelector('#focusValue').textContent,reps);
 console.log('PASS set completion starts rest without saving a full exercise; adding time and Undo work');
 const ring=boot();click(ring,'[data-focus=complete]');assert.equal(ring.document.querySelector('#focusSaved').textContent,'');
 ring.eval('focusRun.restDuration=90;focusRun.restEnd=restEnd=Date.now()+45000;persistFocus();tick()');
 const arc=()=>+ring.document.querySelector('#focusArc').getAttribute('stroke-dashoffset');assert(Math.abs(arc()-50)<.1);
 const resumedRing=boot(storage(ring));assert(Math.abs(+resumedRing.document.querySelector('#focusArc').getAttribute('stroke-dashoffset')-50)<1);
 click(ring,'[data-focus=add]');assert.equal(run(ring).restDuration,120);assert(Math.abs(arc()-37.5)<.1);
 click(ring,'#tab-history');click(ring,'#timer [data-tm=add]');assert.equal(run(ring).restDuration,150);click(ring,'#tab-today');assert(Math.abs(arc()-30)<.1);
 console.log('PASS countdown ring tracks elapsed rest, survives refresh, and handles both add-time controls');
 click(w,'[data-focus=complete]');const saved=storage(w);w.close();w=boot(saved);d=w.document;
 assert.equal(run(w).phase,'rest');assert.equal(run(w).items[0].values[0],reps);assert(!d.querySelector('#timer').hidden);click(w,'[data-focus=skip]');assert.equal(d.querySelector('.focus-eyebrow').textContent,'Set 2 of 3');
 console.log('PASS refresh resumes partial sets and the real rest deadline');
 click(w,'[data-focus=complete]');click(w,'[data-focus=skip]');click(w,'[data-focus=complete]');
 assert.equal(log(w).length,1);assert.equal(run(w).items[0].entry,log(w)[0].ts+'|'+initial[0]);assert.deepEqual(run(w).items.map(x=>x.id),initial);assert.equal(run(w).at,1);
 assert(d.querySelector('#focusSaved').textContent.includes('Push-up saved'));assert.equal(d.querySelector('#focusAnnouncement').textContent,'Push-up saved');assert.equal(d.querySelector('#focusAnnouncement').getAttribute('role'),'status');
 console.log('PASS only a saved exercise gets the quiet accessible confirmation');
 // A second completion call during rest cannot write another entry.
 w.eval('completeFocus()');assert.equal(log(w).length,1);
 click(w,'[data-focus=undo]');assert.equal(log(w).length,0);assert.equal(run(w).at,0);assert.equal(run(w).items[0].values.length,2);assert.equal(run(w).phase,'work');
 assert.equal(d.querySelector('#focusSaved').textContent,'');
 click(w,'[data-focus=complete]');assert.equal(log(w).length,1);assert.notEqual(log(w)[0].ts,JSON.parse(saved['bwl-state']).log[0]?.ts);
 console.log('PASS final set saves once, advances a frozen plan, and Undo removes that saved entry');
 // Timed and unilateral work uses the existing elapsed-time and weaker-side rules.
 click(w,'[data-focus=skip]');
 const core=run(w).items.findIndex(x=>x.id==='core');assert(core>=0);click(w,`[data-focus=choose][data-i="${core}"]`);
 click(w,'[data-focus=hold]');assert(d.querySelector('[data-focus=finish]').disabled);click(w,'[data-focus=cancel]');assert.equal(run(w).items[core].values.length,0);
 click(w,'[data-focus=hold]');w.eval('hold.start=Date.now()-9000;tick()');click(w,'[data-focus=finish]');assert.equal(run(w).items[core].values[0],9);assert.equal(run(w).phase,'rest');
 console.log('PASS timed sets use measured seconds; countdown cancellation records nothing');
 const side=boot({'bwl-state':JSON.stringify({v:2,log:[],levels:{core:'core:side-plank'},prefs:{setupDone:true}})});
 const ci=run(side).items.findIndex(x=>x.id==='core');click(side,`[data-focus=choose][data-i="${ci}"]`);click(side,'[data-focus=hold]');
 side.eval('hold.start=Date.now()-20000;tick()');click(side,'[data-focus=finish]');assert.equal(side.eval('hold.side'),2);assert.equal(run(side).items[ci].values.length,0);
 side.eval('hold.start=Date.now()-12000;tick()');click(side,'[data-focus=finish]');assert.equal(run(side).items[ci].values[0],12);
 console.log('PASS unilateral Focus holds time both sides and record the weaker side');
 click(w,'[data-focus=skip]');w.eval('focusRun.phase="rest";focusRun.restEnd=Date.now()-1;restEnd=focusRun.restEnd;tick()');assert.equal(run(w).phase,'work');
 console.log('PASS expired rest automatically returns to the next set');
 const corrupt=storage(w);corrupt['bwl-focus']=JSON.stringify({v:1,items:[null],signature:run(w).signature});const repaired=boot(corrupt);assert(repaired.document.querySelector('#focusPrimary'));
 console.log('PASS malformed local session is replaced safely without changing workout history');
 const rollover=storage(w),oldRun=run(w);oldRun.signature=oldRun.signature.replace(new Date().toDateString(),'Previous day');rollover['bwl-focus']=JSON.stringify(oldRun);
 const nextDay=boot(rollover);assert.notEqual(run(nextDay).signature,oldRun.signature);assert.deepEqual(run(nextDay).items.find(x=>x.id==='core').values,oldRun.items.find(x=>x.id==='core').values);assert.deepEqual(log(nextDay),log(w));
 console.log('PASS a new day rebuilds the plan while preserving included unfinished sets and saved history');
 // Finish a reps-only routine end to end, then reload the completion screen.
 const seed={v:2,log:[],prefs:{setupDone:true},routines:[{id:'test',name:'Two moves',items:['push','squat']}]};
 let q=boot({'bwl-state':JSON.stringify(seed),'bwl-filter':'r:test'});
 for(let i=0;i<6;i++){click(q,'[data-focus=complete]');if(i<5)click(q,'[data-focus=skip]');}
 assert.equal(run(q).phase,'finished');assert.equal(log(q).length,2);assert(log(q).every(e=>e.sets.length===3));
 const done=storage(q);q.close();q=boot(done);assert.equal(run(q).phase,'finished');assert(q.document.querySelector('.focus-stage').textContent.includes('Workout complete.'));click(q,'[data-focus=progress]');assert.equal(q.document.querySelector('#viewTitle').textContent,'Progress');
 console.log('PASS a whole workout saves each exercise once and remains complete after refresh');
}finally{windows.forEach(w=>w.close());}
process.exit(0);
