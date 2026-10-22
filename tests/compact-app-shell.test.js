const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}}),w=dom.window,d=w.document;
const click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click();},pass=(n,f)=>{f();console.log('PASS '+n);};
try{
pass('one closed options surface owns secondary controls without duplicate IDs',()=>{
 assert(!d.querySelector('#workoutTools').hasAttribute('open'));assert(d.querySelector('#workoutTools .readiness-check'));assert(d.querySelector('#workoutTools .focus-technique'));assert(d.querySelector('#workoutTools .swap-picker'));assert(d.querySelector('#workoutTools .focus-workout'));assert(!d.querySelector('.focus-stage .focus-technique'));const ids=[...d.querySelectorAll('[id]')].map(e=>e.id);assert.equal(new Set(ids).size,ids.length);
});
pass('opening and closing options preserves targets and history with explicit dialog semantics',()=>{
 const run=w.localStorage.getItem('bwl-focus'),state=w.localStorage.getItem('bwl-state');click('#workoutToolsButton');assert(d.querySelector('#workoutTools').open);assert.equal(d.querySelector('#workoutTools').getAttribute('aria-labelledby'),'workoutToolsTitle');click('[data-ui="workouttoolsclose"]');assert(!d.querySelector('#workoutTools').open);assert.equal(d.querySelector('#workoutToolsButton').getAttribute('aria-expanded'),'false');assert.equal(w.localStorage.getItem('bwl-focus'),run);assert.equal(w.localStorage.getItem('bwl-state'),state);
});
pass('common options use visible sections and a direct technique button instead of disclosure toggles',()=>{
 click('#workoutToolsButton');for(const name of ['readiness-check','focus-edit','focus-workout'])assert.equal(d.querySelector('#workoutTools .'+name).tagName,'SECTION');assert.equal(d.querySelector('#workoutTools .focus-technique').tagName,'BUTTON');assert.equal(d.querySelectorAll('#workoutTools .mins button').length,6);assert.equal(d.querySelector('[data-ui="min"][data-m="5"]').textContent,'5 min');click('[data-ui="workouttoolsclose"]');
});
pass('alternative chooser has direct navigation and Back without modifying the current plan',()=>{
 const before=w.localStorage.getItem('bwl-focus');click('#workoutToolsButton');click('[data-ui="toolalternatives"]');assert(!d.querySelector('.swap-picker').hidden);assert(d.querySelector('.focus-edit').hidden);assert.equal(d.activeElement,d.querySelector('.tool-back'));click('[data-ui="toolmain"]');assert(!d.querySelector('.focus-edit').hidden);assert(d.querySelector('.swap-picker').hidden);assert.equal(w.localStorage.getItem('bwl-focus'),before);click('[data-ui="workouttoolsclose"]');
});
pass('direct technique access preserves the workout and returns focus to its trigger',()=>{
 const run=w.localStorage.getItem('bwl-focus'),state=w.localStorage.getItem('bwl-state');
 click('#focusHowTo');assert(d.querySelector('#techniqueSheet').open);assert(!d.querySelector('#workoutTools').open);
 assert.equal(d.querySelector('#techniqueTitle').textContent,'Push-up');assert(!d.querySelector('#techniqueSheet details'));
 assert.equal(d.activeElement,d.querySelector('#techniqueTitle'));
 d.querySelector('#techniqueSheet').dispatchEvent(new w.Event('cancel',{cancelable:true}));
 assert(!d.querySelector('#techniqueSheet'));assert.equal(d.activeElement.id,'focusHowTo');
 assert.equal(w.localStorage.getItem('bwl-focus'),run);assert.equal(w.localStorage.getItem('bwl-state'),state);
});
pass('readiness previews stay in options and applying returns to the active workout',()=>{
 click('#workoutToolsButton');click('[data-readiness="choose"][data-kind="low"]');assert(d.querySelector('#workoutTools').open);assert(d.querySelector('.readiness-preview'));click('[data-readiness="apply"]');assert(!d.querySelector('#workoutTools').open);assert.equal(w.eval('focusRun.readiness.kind'),'low');
});
pass('manual editor disclosures survive a rerender inside the sheet',()=>{
 click('#workoutToolsButton');d.querySelector('.focus-advanced').open=true;click('[data-act="complete"][data-t="push"][data-i="0"]');assert(d.querySelector('#workoutTools').open);assert.equal(d.querySelector('.focus-workout').tagName,'SECTION');assert(d.querySelector('.focus-advanced').open);click('[data-act="complete"][data-t="push"][data-i="0"]');click('[data-ui="workouttoolsclose"]');
});
pass('rest controls are directly available without opening options',()=>{
 click('[data-focus="complete"]');assert.equal(w.eval('focusRun.phase'),'rest');assert(d.querySelector('.rest-quick-actions [data-focus="undo"]'));assert(d.querySelector('.rest-quick-actions [data-focus="add"]'));assert(!d.querySelector('#workoutTools [data-focus="undo"]'));click('[data-focus="undo"]');assert(!d.querySelector('#workoutTools').open);assert.equal(w.eval('focusRun.phase'),'work');assert.equal(w.eval('focusItem().values.length'),0);
});
pass('cancel restores focus and changing tabs clears the modal state',()=>{
 click('#workoutToolsButton');d.querySelector('#workoutTools').dispatchEvent(new w.Event('cancel',{cancelable:true}));assert(!d.querySelector('#workoutTools').open);assert.equal(d.activeElement.id,'workoutToolsButton');click('#workoutToolsButton');click('#tab-ladders');assert.equal(w.eval('workoutToolsOpen'),false);assert(!d.body.classList.contains('workout-tools-open'));
});
}finally{w.close();}process.exit(0);
