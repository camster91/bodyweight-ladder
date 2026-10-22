const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const windows=[];
function boot(storage={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);}});windows.push(dom.window);return dom.window;}
const get=(w,expr)=>JSON.parse(w.eval(`JSON.stringify(${expr})`));
const click=(w,s)=>{assert(w.document.querySelector(s),s);w.document.querySelector(s).click();};
const choose=(w,k)=>click(w,`[data-readiness="choose"][data-kind="${k}"]`);
const pass=(name,fn)=>{fn();console.log('PASS '+name);};
try{
pass('readiness is optional and preview/cancel changes no targets, preferences or logs',()=>{
 const w=boot(),before=get(w,'focusRun'),saved=w.localStorage.getItem('bwl-state');assert(!w.document.querySelector('.readiness-check').open);
 choose(w,'low');assert(w.document.querySelector('.readiness-preview'));assert.deepEqual(get(w,'focusRun'),before);click(w,'[data-readiness="cancel"]');assert.deepEqual(get(w,'focusRun'),before);assert.equal(w.localStorage.getItem('bwl-state'),saved);
 choose(w,'ready');assert.deepEqual(get(w,'focusRun.items'),before.items);assert.equal(w.localStorage.getItem('bwl-state'),saved);
});
pass('lighter targets apply only after confirmation, never compound, and restore exactly',()=>{
 const w=boot(),base=get(w,'focusRun.items'),saved=w.localStorage.getItem('bwl-state');
 choose(w,'low');click(w,'[data-readiness="apply"]');const light=get(w,'focusRun.items');
 assert.deepEqual(light.map(x=>x.id),base.map(x=>x.id));light.forEach((x,i)=>{assert.deepEqual(x.goals,base[i].goals.map(v=>Math.max(1,Math.floor(v*.8))));assert.equal(x.mode,'light');assert.equal(x.goals.length,base[i].goals.length);});
 choose(w,'low');click(w,'[data-readiness="apply"]');assert.deepEqual(get(w,'focusRun.items'),light);
 assert.equal(w.localStorage.getItem('bwl-state'),saved);click(w,'[data-readiness="reset"]');assert.deepEqual(get(w,'focusRun.items'),base);
});
pass('short workout preserves plan priority and original time setting, and can switch back',()=>{
 const w=boot(),base=get(w,'focusRun.items'),time=w.eval('minutes');choose(w,'short');const p=get(w,'readinessPreview("short")');assert(p.items.length<base.length);
 click(w,'[data-readiness="apply"]');assert.deepEqual(get(w,'focusRun.items').map(x=>x.id),base.slice(0,p.items.length).map(x=>x.id));assert.equal(w.eval('minutes'),time);assert.equal(w.localStorage.getItem('bwl-min'),null);
 choose(w,'low');click(w,'[data-readiness="apply"]');assert.equal(w.eval('focusRun.items.length'),base.length);click(w,'[data-readiness="reset"]');assert.deepEqual(get(w,'focusRun.items'),base);
});
pass('refresh preserves lighter and shorter workouts plus their reversible baseline',()=>{
 for(const kind of ['low','short']){let w=boot();const base=get(w,'focusRun.items');choose(w,kind);click(w,'[data-readiness="apply"]');const expected=get(w,'focusRun.items');
 w=boot({'bwl-state':w.localStorage.getItem('bwl-state'),'bwl-focus':w.localStorage.getItem('bwl-focus')});assert.deepEqual(get(w,'focusRun.items'),expected);click(w,'[data-readiness="reset"]');assert.deepEqual(get(w,'focusRun.items'),base);}
});
pass('started sets lock adaptation, and Undo reopens it without losing history',()=>{
 const w=boot();choose(w,'low');click(w,'[data-readiness="apply"]');click(w,'[data-focus="complete"]');assert.equal(w.document.querySelector('.readiness-check'),null);const locked=get(w,'focusRun.items');
 w.eval('applyReadiness("ready")');assert.deepEqual(get(w,'focusRun.items'),locked);click(w,'[data-focus="undo"]');assert(w.document.querySelector('.readiness-check'));assert.equal(get(w,'state.log').length,0);
});
pass('lighter saved results remain in history but do not distort normal progression or merge tags',()=>{
 const w=boot();choose(w,'low');click(w,'[data-readiness="apply"]');
 for(let i=0;i<3;i++){if(i)click(w,'[data-focus="skip"]');click(w,'[data-focus="complete"]');}
 const e=get(w,'state.log[0]');assert.equal(e.mode,'light');assert.equal(w.eval('progression(findTrack("push")).kind'),'start');
 const old={...e};delete old.mode;w.eval(`state.log=dedupe([${JSON.stringify(e)},${JSON.stringify(old)}]);idx=null;`);assert.equal(get(w,'state.log[0]').mode,'light');
 assert.equal(w.eval(`normalize({v:2,log:[${JSON.stringify(e)}]}).log[0].mode`),'light');click(w,'#tab-history');assert(w.document.querySelector('#progressLog').textContent.includes('Lighter day'));
});
pass('partial lighter sets retain their targets and session marker across midnight',()=>{
 const w=boot();choose(w,'low');click(w,'[data-readiness="apply"]');const expected=get(w,'focusItem().goals');click(w,'[data-focus="complete"]');
 w.eval(`{const s=JSON.parse(focusRun.signature);s[0]='Yesterday';focusRun.signature=JSON.stringify(s);render();}`);
 assert.deepEqual(get(w,'focusItem().goals'),expected);assert.equal(w.eval('focusItem().mode'),'light');assert.equal(w.eval('focusItem().values.length'),1);
});
pass('a 5 minute plan still keeps its first exercise and timed targets stay positive',()=>{
 const w=boot({'bwl-min':'5'});const p=get(w,'readinessPreview("short")');assert(p.items.length>=1);assert.equal(p.budget,5);
 w.eval(`minutes=0;focusRun=null;render();`);choose(w,'low');click(w,'[data-readiness="apply"]');assert(get(w,'focusRun.items').every(x=>x.goals.every(v=>v>=1)));
});
pass('adapted workouts hide variation changes and restoring the original brings advice back',()=>{
 const w=boot();w.eval(`state.log=[{ts:Date.now()-2*DAY,t:'push',k:'push:push-up',sets:[12,12,12]},{ts:Date.now()-4*DAY,t:'push',k:'push:push-up',sets:[12,12,12]}];idx=null;focusRun=null;render();`);
 assert(w.document.querySelector('[data-coach="level"]'));
 for(const kind of ['short','low']){choose(w,kind);click(w,'[data-readiness="apply"]');assert.equal(w.document.querySelector('[data-coach="level"]'),null);w.eval(`handleCoach({dataset:{coach:'level',t:'push',level:'4'}})`);assert.equal(w.eval('lvlOf(findTrack("push"))'),3);click(w,'[data-readiness="reset"]');assert(w.document.querySelector('[data-coach="level"]'));}
});
pass('advanced set completion locks adaptation and advanced holds use lighter goals',()=>{
 const w=boot();click(w,'[data-act="complete"][data-t="push"][data-i="0"]');assert.equal(w.document.querySelector('.readiness-check'),null);assert.equal(w.eval('canAdjustReadiness()'),false);
 click(w,'[data-act="complete"][data-t="push"][data-i="0"]');choose(w,'low');click(w,'[data-readiness="apply"]');
 const goal=w.eval('lightSessionItem(findTrack("core")).goals[0]');w.eval('startHold(findTrack("core"))');assert.equal(w.eval('hold.goal'),goal);w.eval('stopTimer()');
});
}finally{windows.forEach(w=>w.close());}process.exit(0);
