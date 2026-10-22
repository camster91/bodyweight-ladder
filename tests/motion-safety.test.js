const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
let preferenceChanged;
const media={matches:true,addEventListener(type,callback){if(type==='change')preferenceChanged=callback;}};
const seed={v:2,log:[],prefs:{setupDone:true,sets:{push:1}},routines:[{id:'one',name:'One exercise',items:['push']}]};
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.matchMedia=()=>media;w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify(seed));w.localStorage.setItem('bwl-filter','r:one');}});
const w=dom.window,d=w.document,click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click();};
const stored=()=>JSON.parse(w.localStorage.getItem('bwl-state'));
try{
 click('[data-focus=plus]');assert.equal(d.querySelector('#focusValue').textContent,'6');assert.equal(d.querySelector('.focus-number-previous').getAttribute('aria-hidden'),'true');
 for(let i=0;i<20;i++)click('[data-focus=plus]');assert.equal(d.querySelector('#focusValue').textContent,'26');assert.equal(JSON.parse(w.localStorage.getItem('bwl-focus')).items[0].value,26);assert.equal(stored().log.length,0);
 console.log('PASS animated rep changes update the real value immediately under repeated taps');
 media.matches=false;preferenceChanged({matches:false});assert.equal(d.querySelector('#focusValue').textContent,'26');assert.equal(d.querySelector('.focus-number-previous'),null);assert.equal(d.querySelector('.focus-number-current'),null);
 console.log('PASS enabling Reduce Motion during a number roll keeps only the current value');
 media.matches=true;preferenceChanged({matches:true});click('[data-focus=complete]');assert.equal(stored().log.length,1);assert.deepEqual(stored().log[0].sets,[26]);assert.equal(d.querySelector('.focus-stage').dataset.phase,'finished');assert(d.querySelector('.focus-pulse'));assert(d.querySelector('.focus-celebrate'));
 console.log('PASS celebration and ripple start after the workout is saved without waiting for animation events');
 media.matches=false;preferenceChanged({matches:false});assert.equal(d.querySelector('.focus-pulse'),null);assert.equal(d.querySelector('.focus-celebrate'),null);assert.equal(stored().log.length,1);assert(d.querySelector('.finish-mark'));assert(!d.querySelector('[data-focus=progress]').disabled);
 console.log('PASS enabling Reduce Motion during celebration clears effects and preserves the saved workout');
 click('[data-focus=undo]');assert.equal(stored().log.length,0);assert.equal(d.querySelector('#focusValue').textContent,'26');assert.equal(d.querySelector('.focus-pulse'),null);
 console.log('PASS Undo reverses a completed animated workout and restores its recorded value');
}finally{w.close();}
process.exit(0);
