const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),windows=[];
function boot(storage={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));for(const[k,v]of Object.entries(storage))w.localStorage.setItem(k,v);}});windows.push(dom.window);return dom.window;}
const get=(w,e)=>JSON.parse(w.eval(`JSON.stringify(${e})`)),click=(w,s)=>{assert(w.document.querySelector(s),s);w.document.querySelector(s).click();};
const pass=(n,f)=>{f();console.log('PASS '+n);};
try{
pass('preview and cancellation leave the workout, saved levels and history unchanged',()=>{
 const w=boot(),before=get(w,'focusRun'),saved=w.localStorage.getItem('bwl-state');click(w,'[data-swap="choose"][data-t="push"][data-level="1"]');assert(w.document.querySelector('.swap-preview'));assert.deepEqual(get(w,'focusRun'),before);click(w,'[data-swap="cancel"]');assert.deepEqual(get(w,'focusRun'),before);assert.equal(w.localStorage.getItem('bwl-state'),saved);
});
pass('same-ladder substitutions and restoration preserve the original plan exactly',()=>{
 const w=boot(),before=get(w,'focusRun.items'),saved=w.localStorage.getItem('bwl-state');w.eval('applySwap("push",1)');assert.equal(w.eval('sessionSpec(findTrack("push"))[0]'),'Incline push-up');assert.equal(w.eval('lvlOf(findTrack("push"))'),3);assert(w.document.querySelector('.swap-applied'));w.eval('restoreSwap()');assert.deepEqual(get(w,'focusRun.items'),before);assert.equal(w.localStorage.getItem('bwl-state'),saved);
});
pass('saving records the actual variation and source, then Undo removes it',()=>{
 const w=boot();w.eval('applySwap("push",1)');for(let i=0;i<3;i++){if(i)click(w,'[data-focus="skip"]');click(w,'[data-focus="complete"]');}
 const e=get(w,'state.log[0]');assert.equal(e.k,'push:incline-push-up');assert.equal(e.insteadOf,'push:push-up');assert.equal(w.eval('state.levels.push'),'push:push-up');click(w,'[data-focus="undo"]');assert.equal(w.eval('state.log.length'),0);assert.equal(w.eval('focusItem().key'),'push:incline-push-up');
});
pass('an alternative already in the workout is used once and both original slots restore',()=>{
 const w=boot({'bwl-min':'0'});w.eval('focusRun.at=focusRun.items.findIndex(x=>x.id==="pull");render();');const before=get(w,'focusRun.items');w.eval('applySwap("row",0)');const items=get(w,'focusRun.items');assert.equal(items.length,before.length-1);assert.equal(items.filter(x=>x.id==='row').length,1);assert(!items.some(x=>x.id==='pull'));assert(w.document.querySelector('.focus-stage h2').textContent.includes('Doorway'));w.eval('restoreSwap()');assert.deepEqual(get(w,'focusRun.items'),before);
});
pass('a new alternative keeps the workout count and logs its own ladder without changing either level',()=>{
 const w=boot({'bwl-min':'0'});w.eval('focusRun.items=focusRun.items.filter(x=>x.id==="pull");focusRun.at=0;render();applySwap("row",0);');assert.equal(w.eval('focusRun.items.length'),1);for(let i=0;i<3;i++){if(i)click(w,'[data-focus="skip"]');click(w,'[data-focus="complete"]');}
 const e=get(w,'state.log[0]');assert.equal(e.t,'row');assert.equal(e.k,'row:doorway-row');assert.equal(e.insteadOf,'pull:jumping-pull-up');assert.equal(w.eval('lvlOf(findTrack("row"))'),1);assert.equal(w.eval('lvlOf(findTrack("pull"))'),2);click(w,'#tab-history');assert(w.document.querySelector('#progressLog').textContent.includes('Instead of Jumping pull-up'));
});
pass('refresh and midnight preserve a partial temporary step without reintroducing its original',()=>{
 let w=boot({'bwl-min':'0'});w.eval('focusRun.at=focusRun.items.findIndex(x=>x.id==="pull");render();applySwap("row",0);');click(w,'[data-focus="complete"]');const g=get(w,'focusItem().goals');w=boot({'bwl-min':'0','bwl-state':w.localStorage.getItem('bwl-state'),'bwl-focus':w.localStorage.getItem('bwl-focus')});assert.equal(w.eval('focusItem().key'),'row:doorway-row');w.eval(`{const s=JSON.parse(focusRun.signature);s[0]='Yesterday';focusRun.signature=JSON.stringify(s);render();}`);assert.equal(w.eval('focusItem().key'),'row:doorway-row');assert.deepEqual(get(w,'focusItem().goals'),g);assert.equal(w.eval('focusItem().values.length'),1);assert(!get(w,'focusRun.items').some(x=>x.id==='pull'));
});
pass('running or partially recorded exercises cannot be swapped and duplicate partial alternatives are excluded',()=>{
 const w=boot();click(w,'[data-focus="complete"]');const before=get(w,'focusRun.items');w.eval('applySwap("push",0);restoreSwap()');assert.deepEqual(get(w,'focusRun.items'),before);assert.equal(w.document.querySelector('.swap-picker'),null);
 const a=boot({'bwl-min':'0'});a.eval('focusRun.items.find(x=>x.id==="row").values=[8];focusRun.at=focusRun.items.findIndex(x=>x.id==="pull");render();');assert(!get(a,'swapOptions()').some(x=>x.id==='row'));
});
pass('timed and unilateral substitute units drive the real hold timer',()=>{
 const w=boot({'bwl-min':'0'});w.eval('state.levels.core=keyOf(findTrack("core"),3);focusRun=null;render();focusRun.at=focusRun.items.findIndex(x=>x.id==="core");render();applySwap("core",2);');assert.equal(w.eval('sessionSpec(findTrack("core"))[4]'),'sec each side');click(w,'[data-focus="hold"]');assert.equal(w.eval('hold.sides'),2);assert.equal(w.eval('hold.goal'),15);assert.equal(w.eval('lvlOf(findTrack("core"))'),3);w.eval('stopTimer()');
});
pass('lighter targets and source markers survive normalization and old-copy merges',()=>{
 const w=boot();w.eval('applyReadiness("low");applySwap("push",1);');assert.deepEqual(get(w,'focusItem().goals'),[6,6,6]);for(let i=0;i<3;i++){if(i)click(w,'[data-focus="skip"]');click(w,'[data-focus="complete"]');}
 const e=get(w,'state.log[0]');assert.equal(e.mode,'light');assert.equal(e.insteadOf,'push:push-up');const old={...e};delete old.mode;delete old.insteadOf;const copies=JSON.stringify([e,old]);assert.equal(w.eval(`normalize({v:2,log:${copies}}).log[0].insteadOf`),'push:push-up');assert.equal(w.eval(`normalize({v:2,log:${copies}}).log[0].mode`),'light');
});
pass('invalid temporary metadata repairs safely and does not write workout history',()=>{
 const w=boot();w.eval('applySwap("push",1);focusItem().swap.original=null;persistFocus();');const a=boot({'bwl-focus':w.localStorage.getItem('bwl-focus')});assert(a.document.querySelector('#focusPrimary'));assert.equal(a.eval('focusItem().key'),'push:push-up');assert.equal(a.eval('state.log.length'),0);
});
}finally{windows.forEach(w=>w.close());}process.exit(0);
