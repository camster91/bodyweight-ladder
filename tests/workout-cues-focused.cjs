// Focused module checks only; does not boot the app or run the full suite.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../ui/workout-cues.js'),'utf8');
function fixture(saved='null'){
 const events={tones:[],vibrations:[],writes:[],stops:0},handlers={};
 const context={store:{get:()=>saved},writeLocal:(...args)=>events.writes.push(args),navigator:{vibrate:p=>events.vibrations.push(p)},document:{addEventListener:(name,fn)=>handlers[name]=fn,querySelectorAll:()=>[]},announceTimer:()=>{},primeAudio:()=>{},actx:{state:'running',currentTime:1,destination:{},createOscillator:()=>({frequency:{},connect:()=>({connect:()=>{}}),start:t=>events.tones.push(t),stop:()=>events.stops++,disconnect:()=>{}}),createGain:()=>({gain:{setValueAtTime:()=>{},exponentialRampToValueAtTime:()=>{}},disconnect:()=>{}})},focusRun:{restFrom:'push'},equipmentCheck:()=>({compatible:true,requirements:{groups:[{description:'Floor',anyOf:['floor']},{description:'Wall',anyOf:['wall']}]}}),sessionLevel:()=>0,exerciseThumbnail:()=>'<img src="exercise.webp" alt="">',esc:s=>s,isSec:u=>u.startsWith('sec')};
 vm.createContext(context);vm.runInContext(source,context);return {context,events,handlers,run:s=>vm.runInContext(s,context)};
}
let f=fixture();f.run("workoutCue('exercise')");assert.equal(f.events.tones.length,3);assert.equal(f.events.vibrations.length,1);
f.run("cuePrefs.muted=true;saveCuePreferences();workoutCue('start')");assert.equal(f.events.tones.length,3);assert.equal(f.events.stops,6);assert.equal(JSON.parse(f.events.writes[0][1]).muted,true);
f=fixture('{"sound":false,"vibration":true}');f.run("workoutCue('target')");assert.equal(f.events.tones.length,0);assert.equal(f.events.vibrations.length,1);
f=fixture('{"sound":true,"vibration":false}');f.run("workoutCue('rest')");assert.equal(f.events.tones.length,2);assert.equal(f.events.vibrations.length,0);
f=fixture('{broken');f.run("workoutCue('__proto__')");assert.equal(f.events.tones.length,0);assert.equal(f.events.vibrations.length,0);f.run("actx.state='suspended';workoutCue('start')");assert.equal(f.events.tones.length,0);
f=fixture();const markup=f.run("restPreviewMarkup({id:'core'},{values:[],goals:[20]},['Plank',3,20,45,'sec','cue','None'])");assert.match(markup,/Up next/);assert.match(markup,/20 seconds/);assert.match(markup,/Have ready: Wall/);assert.match(markup,/hold waits for you/);assert.match(markup,/exercise.webp/);
const {journeySummaryData,journeyCheckinCopy}=require('../ui/journey-summary.js');const now=Date.UTC(2026,10,25),day=86400000;
const log=[{ts:now-29*day,t:'push',k:'push:step',sets:[5]},{ts:now-day,t:'push',k:'push:step',sets:[6]}],data=journeySummaryData(log,[],now);
assert.equal(data.current.days,1);assert.equal(data.current.sets,1);assert.match(journeyCheckinCopy(data,{days:3}).heading,/first-month/);assert.match(journeyCheckinCopy({...data,partial:3,completed:1},{days:3}).text,/shorter time budget/);assert.match(journeyCheckinCopy({...data,current:{days:0,sets:0}},{days:3}).text,/When you return/);assert.match(journeyCheckinCopy({...data,historyDays:7},{days:3}).heading,/weekly/);
console.log('Focused cue delivery, mute, device settings, preview and month check-in checks passed');
