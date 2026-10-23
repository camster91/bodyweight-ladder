const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}}),w=dom.window,d=w.document;
const pass=(n,f)=>{f();console.log('PASS '+n);},click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click();};
const reset=()=>w.eval(`stopTimer();state=blank();state.prefs.setupDone=true;state.prefs.hidden=Object.fromEntries(TRACKS.filter(t=>t.id!=='core').map(t=>[t.id,true]));focusRun=null;tab='today';minutes=5;filter='All';render();`);
try{
pass('skip link targets a focusable main landmark and tab changes have a stable announcement',()=>{
 assert.equal(d.querySelector('.skip-link').getAttribute('href'),'#view');assert.equal(d.querySelector('main').getAttribute('tabindex'),'-1');click('#tab-ladders');assert.equal(d.querySelector('#pageAnnouncement').textContent,'Exercises');click('#tab-today');assert.equal(d.querySelector('#pageAnnouncement').textContent,'Today');
});
pass('hold start and cancellation retain keyboard focus and never record cancelled work',()=>{
 reset();const before=w.eval('state.log.length');click('[data-focus=hold]');assert.equal(d.activeElement.dataset.focus,'cancel');assert.match(d.querySelector('#timerAnnouncement').textContent,/Get ready/);click('[data-focus=cancel]');assert.equal(d.activeElement.id,'focusPrimary');assert.equal(w.eval('state.log.length'),before);assert.match(d.querySelector('#timerAnnouncement').textContent,/No set recorded/);
});
pass('hold milestones announce start and target once without announcing every tick',()=>{
 reset();click('[data-focus=hold]');w.eval('hold.start=Date.now()-1000;tick()');assert.match(d.querySelector('#timerAnnouncement').textContent,/Start holding/);const first=d.querySelector('#timerAnnouncement').textContent;w.eval('tick()');assert.equal(d.querySelector('#timerAnnouncement').textContent,first);w.eval('hold.start=Date.now()-(hold.goal+1)*1000;tick()');assert.match(d.querySelector('#timerAnnouncement').textContent,/target reached/);assert.equal(d.querySelector('#focusClock').getAttribute('role'),'timer');assert.equal(d.querySelector('#focusClock').getAttribute('aria-live'),'off');
});
pass('background refresh preserves a focused workout control',()=>{
 reset();d.querySelector('[data-focus=plus]').focus();w.eval('softRender()');assert.equal(d.activeElement.dataset.focus,'plus');
});
pass('background refresh defers while a dialog is open and preserves its fields',()=>{
 reset();click('#syncDot');const dialog=d.querySelector('#progressBackup');w.eval('softRender()');assert.equal(d.querySelector('#progressBackup'),dialog);assert.equal(w.eval('renderLater'),true);dialog.remove();d.body.classList.remove('preferences-open');
});
pass('automatic rest completion leaves an open dialog and its focus intact',()=>{
 reset();w.eval(`focusRun.phase='rest';focusRun.restEnd=Date.now()-1;startRest(0,focusRun.restEnd);`); // prepare an already expired rest
 click('#syncDot');const dialog=d.querySelector('#progressBackup'),active=d.activeElement;
 w.eval(`focusRun.phase='rest';focusRun.restEnd=Date.now()-1;restEnd=focusRun.restEnd;showTimer('<span id="timerText"></span>');tick();`);
 assert.equal(d.querySelector('#progressBackup'),dialog);assert.equal(d.activeElement,active);assert.equal(w.eval('focusRun.phase'),'work');dialog.remove();
});
}finally{setTimeout(()=>w.close(),0);}
