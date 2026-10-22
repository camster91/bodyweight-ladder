const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),windows=[];
async function boot(storage={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};for(const [k,v]of Object.entries(storage))w.localStorage.setItem(k,v);}});windows.push(dom.window);await new Promise(r=>setTimeout(r,10));return dom.window;}
const click=(w,s)=>{assert(w.document.querySelector(s),s);w.document.querySelector(s).click();};
const next=w=>click(w,'[data-ui=onext]');
const stage=w=>+w.document.querySelector('.onboard').dataset.step;
const saved=w=>JSON.parse(w.localStorage.getItem('bwl-state'));
const storage=w=>Object.fromEntries(Object.keys(w.localStorage).map(k=>[k,w.localStorage.getItem(k)]));
(async()=>{try{
 let w=await boot();assert.equal(stage(w),0);assert.equal(w.document.querySelectorAll('.onboard-choice').length,0);assert.equal(saved(w),null);next(w);assert.equal(stage(w),1);assert.equal(w.document.activeElement.id,'setupTitle');assert.equal(w.document.querySelectorAll('[data-kind=gear]').length,0);
 console.log('PASS welcome leads to one focused question and moves keyboard focus to its heading');
 for(const v of ['Strength','Tendon','Mobility','Stretch'])click(w,`[data-ui=stog][data-v=${v}]`);next(w);assert.equal(stage(w),1);assert(w.document.querySelector('#setupError').textContent);assert.equal(saved(w),null);
 click(w,'[data-ui=stog][data-v=Weights]');next(w);assert.equal(stage(w),2);next(w);assert.equal(stage(w),2);assert(w.document.querySelector('#setupError').textContent.includes('weights'));
 console.log('PASS empty focus and weights-only plans without weights cannot advance or write preferences');
 click(w,'[data-ui=stog][data-v=weights]');next(w);assert.equal(stage(w),3);click(w,'[data-ui=stog][data-v=new]');const copy=storage(w);w=await boot(copy);assert.equal(stage(w),3);assert.equal(w.document.querySelector('[data-v=new]').getAttribute('aria-pressed'),'true');assert.equal(saved(w),null);next(w);assert.equal(stage(w),4);assert(w.document.querySelector('.onboard-review').textContent.includes('Carries & swings'));
 console.log('PASS a refresh restores unfinished answers and review without prematurely completing setup');
 click(w,'[data-ui=oedit][data-step="2"]');click(w,'[data-ui=onone]');assert.equal(w.document.querySelector('[data-ui=onone]').getAttribute('aria-pressed'),'true');assert.equal(w.document.querySelector('[data-v=weights]').getAttribute('aria-pressed'),'false');click(w,'[data-ui=oback]');click(w,'[data-ui=stog][data-v=Strength]');next(w);next(w);next(w);assert.equal(stage(w),4);click(w,'[data-ui=finish]');assert(saved(w).prefs.setupDone);assert.equal(saved(w).levels.push,'push:incline-push-up');assert(saved(w).prefs.hidden.pull&&saved(w).prefs.hidden.carry);assert(w.document.querySelector('#focusPrimary'));assert.equal(w.localStorage.getItem('bwl-onboarding'),'null');assert.equal(saved(w).log.length,0);
 console.log('PASS editing reviewed answers applies equipment and starting levels once, then opens the first set');
 const previous={v:2,log:[{ts:Date.now()-864e5,t:'push',k:'push:archer-push-up',sets:[6,6,6]}],levels:{push:'push:archer-push-up'},prefs:{setupDone:true,hidden:{crab:true}}};
 w=await boot({'bwl-state':JSON.stringify(previous)});click(w,'#tab-ladders');click(w,'[data-ui=setup]');assert.equal(stage(w),1);const before=JSON.stringify(saved(w));click(w,'[data-ui=stog][data-v=Strength]');click(w,'[data-ui=skip]');assert.equal(JSON.stringify(saved(w)),before);assert(w.document.querySelector('#focusPrimary'));
 console.log('PASS cancelling repeat setup leaves saved preferences and workout history unchanged');
 w=await boot({'bwl-onboarding':'{"v":1,"stage":99,"groups":null}'});assert.equal(stage(w),0);click(w,'[data-ui=skip]');assert(saved(w).prefs.setupDone);assert(w.document.querySelector('#focusPrimary'));assert.equal(saved(w).log.length,0);
 console.log('PASS malformed drafts fall back safely and setting up later remains available');
}finally{windows.forEach(w=>w.close());}
process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
