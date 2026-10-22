const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),windows=[];
const at=(days,hour=12)=>{const d=new Date();d.setDate(d.getDate()-days);d.setHours(hour,0,0,0);return +d;};
const entry=(days,t,k,sets,hour)=>({ts:at(days,hour),t,k,sets});
function boot(log,extra={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,log,prefs:{setupDone:true},...extra}));}});windows.push(dom.window);dom.window.document.querySelector('#tab-history').click();return dom.window;}
const records=w=>JSON.parse(w.eval('JSON.stringify(personalBests())'));
const click=(w,s)=>{assert(w.document.querySelector(s),s);w.document.querySelector(s).click();};
try{
 let w=boot([entry(5,'push','push:push-up',[5,5,5]),entry(3,'push','push:push-up',[5,5,5]),entry(1,'squat','squat:bodyweight-squat',[12,12,12])]);
 assert.deepEqual(records(w),[]);assert.equal(w.document.querySelectorAll('.personal-best').length,0);assert(w.document.querySelector('.records-empty'));assert(!/streak|weeks in a row|best run|Nice start|keep showing up/i.test(w.document.querySelector('#view').textContent));
 console.log('PASS first results and ties establish a baseline without invented personal bests or streak pressure');
 const base=entry(7,'push','push:push-up',[5,5,5]),best=entry(5,'push','push:push-up',[8,7,6]),tie=entry(3,'push','push:push-up',[8,7,6]),lower=entry(1,'push','push:push-up',[6,6,6]);
 w=boot([lower,tie,base,best]);const r=records(w);assert.equal(r.length,1);assert.equal(r[0].total,21);assert.equal(r[0].entry.ts,best.ts);assert.equal(r[0].count,3);assert.equal(r[0].gain,6);
 console.log('PASS best totals use chronological evidence and retain the original achievement date after ties or lower results');
 w=boot([base,entry(4,'push','push:push-up',[5,5,5,5]),entry(2,'push','push:diamond-push-up',[9,9,9])]);assert.deepEqual(records(w),[]);
 console.log('PASS adding sets or changing exercise steps cannot produce a personal best');
 w=boot([entry(7,'core','core:plank',[20,20,20]),entry(2,'core','core:plank',[25,25,25]),entry(5,'core','core:side-plank',[10,10,10]),entry(1,'core','core:side-plank',[15,15,15])]);
 assert.equal(records(w).length,2);assert(w.document.querySelector('[data-record="core:plank"]').textContent.includes('75 seconds'));assert(w.document.querySelector('[data-record="core:side-plank"]').textContent.includes('45 seconds per side'));
 console.log('PASS timed and per-side records keep their correct units and separate step comparisons');
 const today=entry(0,'push','push:push-up',[5,5,5],0),again=entry(0,'push','push:push-up',[6,6,6],1),squat=entry(0,'squat','squat:bodyweight-squat',[10,10,10],2);
 // Use timestamps already elapsed today, including when tests run before 2am.
 today.ts=Date.now()-3000;again.ts=Date.now()-2000;squat.ts=Date.now()-1000;
 w=boot([today,again,squat]);const days=JSON.parse(w.eval('JSON.stringify(trainingDays())'));assert.equal(days.length,1);assert.equal(days[0].exercises,2);assert.equal(days[0].sets,9);assert.equal(w.document.querySelector('.training-day').textContent.includes('2 exercises · 9 sets'),true);assert.equal(w.document.querySelector('.progress-stats b').textContent,'1');assert.equal(w.document.querySelectorAll('.progress-stats b')[1].textContent,'9');
 console.log('PASS multiple entries in one local day count as one training day with distinct exercises and actual sets');
 assert.equal(w.document.querySelectorAll('.week-day').length,7);assert.equal(w.document.querySelectorAll('.week-day.active').length,1);assert.equal(w.document.querySelector('.week-day.today .week-count').textContent,'9');
 console.log('PASS weekly activity graphic shows seven calendar days and actual recorded set counts');
 w=boot([base,best]);click(w,'#progressLog>summary');assert(w.document.querySelector('#progressLog').open);click(w,'[data-ui=selentry]');assert(w.document.querySelector('#progressLog').open);click(w,'[data-ui=delentry]');assert.equal(records(w).length,0);assert.equal(w.document.querySelectorAll('.personal-best').length,0);assert(w.document.querySelector('#progressLog').open);click(w,'#toastUndo');assert.equal(records(w).length,1);assert.equal(records(w)[0].total,21);
 console.log('PASS deleting a record recomputes Progress and Undo restores it without closing the workout log');
 w=boot([base,entry(4,'push','push:push-up',[5,5,5,5]),entry(1,'push','push:push-up',[6,6,6,6])]);const text=w.document.querySelector('.progress-exercises').textContent;assert(text.includes('+4 reps'));assert(!text.includes('+9 reps'));assert(text.includes('first 4-set result'));
 console.log('PASS trend gains compare the same set count and name the correct baseline');
 w=boot([base],{levels:{push:'push:diamond-push-up'}});assert(w.document.querySelector('.progress-exercises').textContent.includes('No saved sets on this step yet'));assert.equal(w.document.querySelector('.progress-exercises .spark'),null);
 console.log('PASS an unlogged selected step does not inherit another step\u0027s trend');
 w=boot([]);assert(w.document.querySelector('.progress-empty'));assert.equal(w.document.querySelector('.progress-empty img:not(.brand-symbol)'),null);assert.equal(w.document.querySelectorAll('.personal-best').length,0);
 console.log('PASS empty Progress explains how records begin without sample achievements');
}finally{windows.forEach(w=>w.close());}
process.exit(0);
