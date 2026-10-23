const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function boot(){return new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}});}
const dom=boot(),w=dom.window,read=s=>JSON.parse(w.eval(`JSON.stringify(${s})`));
const pass=(name,fn)=>{fn();console.log('PASS '+name);};
const entry=ts=>({ts,t:'push',k:'push:push-up',sets:[8,7,6],effort:'steady',effortAt:ts+1});
const now=Date.now();
function backup(log=[entry(now-864e5)]){const b=read('makeProgressBackup()');b.state.log=log;return b;}
const parse=b=>w.eval(`parseProgressBackup(${JSON.stringify(JSON.stringify(b))})`);
try{
pass('backup round trip retains history, effort, levels, custom exercises and routines',()=>{
 w.eval(`state.log=${JSON.stringify([entry(now-864e5)])};state.custom=[{id:'cabcd1',name:'My exercise',sets:3,min:5,max:12,unit:'reps'}];state.routines.push({id:'my-routine',name:'My routine',items:['cabcd1','push']});commit();`);
 const b=read('makeProgressBackup()'),clean=parse(b);assert.deepEqual(JSON.parse(JSON.stringify(clean.state)),b.state);
});
pass('invalid, unrelated, future, oversized and inconsistent files are rejected without writes',()=>{
 const before=w.localStorage.getItem('bwl-state');
 for(const b of [{}, {...backup(),backupVersion:2}, {...backup(),state:{...backup().state,v:3}},backup([{...entry(now),sets:[-1]}]),backup([{...entry(now),k:'push:unknown'}]),backup([entry(now),entry(now)])])assert.throws(()=>parse(b));
 assert.throws(()=>w.eval(`parseProgressBackup('{bad')`));
 assert.throws(()=>w.eval(`parseProgressBackup(' '.repeat(BACKUP_LIMIT+1))`));
 assert.throws(()=>w.eval(`parseProgressBackup(${JSON.stringify(JSON.stringify(backup()).replace('"state":{','"state":{"__proto__":{},'))})`));
 assert.equal(w.localStorage.getItem('bwl-state'),before);
});
pass('restore adds missing records once and preserves current settings on ties',()=>{
 const b=backup([entry(now-864e5),entry(now-2*864e5)]);b.state.levels.push='push:wall-push-up';
 w.eval(`globalThis.testBackup=parseProgressBackup(${JSON.stringify(JSON.stringify(b))});focusRun=null;`);
 const level=read('state.levels.push');w.eval('applyProgressRestore(testBackup)');
 assert.equal(read('state.log.length'),2);assert.equal(read('state.levels.push'),level);
 w.eval('focusRun=null;applyProgressRestore(testBackup)');assert.equal(read('state.log.length'),2);
 assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,2);
});
pass('deletion markers prevent old backups from resurrecting removed workouts',()=>{
 const e=entry(now-3*864e5),b=backup([e]);w.eval(`state.deleted.push(${JSON.stringify(e.ts+'|push')});globalThis.testBackup=parseProgressBackup(${JSON.stringify(JSON.stringify(b))});focusRun=null;applyProgressRestore(testBackup);`);
 assert(!read('state.log').some(x=>x.ts===e.ts));
});
pass('backups keep historical records for deleted custom exercises',()=>{
 const e={ts:now-5*864e5,t:'cdeleted',k:'cdeleted:x',sets:[4,4]};
 const b=backup([e]);assert.equal(parse(b).state.log[0].k,'cdeleted:x');
});
pass('invalid setting shapes and numeric stamps cannot poison future saves',()=>{
 for(const change of [b=>b.state.stamps.bad='1e999',b=>b.state.prefs.sets.push=99,b=>b.state.prefs.focus.push='broken',b=>b.state.custom[0].id=['cabcd1']]){const b=backup();change(b);assert.throws(()=>parse(b));}
});
pass('blocked writes show a persistent warning and failed restore leaves memory and disk unchanged',()=>{
 const before=read('state'),disk=w.localStorage.getItem('bwl-state');
 const original=w.Storage.prototype.setItem;w.Storage.prototype.setItem=()=>{throw new Error('QuotaExceededError');};
 assert.equal(w.eval('saveLocal()'),false);assert.equal(w.document.querySelector('#storageWarning').hidden,false);
 const b=backup([entry(now-4*864e5)]);w.eval(`globalThis.testBackup=parseProgressBackup(${JSON.stringify(JSON.stringify(b))});focusRun=null;`);
 assert.throws(()=>w.eval('applyProgressRestore(testBackup)'),/could not be verified/);
 assert.deepEqual(read('state'),before);assert.equal(w.localStorage.getItem('bwl-state'),disk);
 w.Storage.prototype.setItem=original;
});
pass('unfinished-workout failures stay visible until both stores can save',()=>{
 const original=w.Storage.prototype.setItem;
 w.Storage.prototype.setItem=function(k,v){if(k==='bwl-focus')throw new Error('Storage denied');return original.call(this,k,v);};
 w.eval('saveLocal();persistFocus();setNote()');assert.equal(w.document.querySelector('#storageWarning').hidden,false);
 assert.match(w.document.querySelector('#storageWarningText').textContent,/unfinished workout/);
 w.Storage.prototype.setItem=original;w.document.querySelector('[data-backup="retry"]').click();assert.equal(w.document.querySelector('#storageWarning').hidden,true);
});
pass('active partial exercise prevents restore without changing data',()=>{
 const before=read('state');w.eval(`focusRun={phase:'work',items:[{values:[8],entry:null}]}`);
 assert.throws(()=>w.eval('applyProgressRestore(testBackup)'),/Finish the current exercise/);assert.deepEqual(read('state'),before);
 w.eval('focusRun=null');
});
pass('backup dialog is available without history and cancel makes no writes',()=>{
 const before=w.localStorage.getItem('bwl-state');w.document.querySelector('.backup-entry button').click();
 assert(w.document.querySelector('#backupFile'));assert(w.document.querySelector('[data-backup-apply]').disabled);
 assert.equal(w.localStorage.getItem('bwl-state'),before);
});
pass('fresh device receives backup settings before setup and full histories are never silently trimmed',()=>{
 w.eval(`state=blank();globalThis.freshBackup=makeProgressBackup();freshBackup.state.prefs.setupDone=true;freshBackup.state.levels.push='push:wall-push-up';globalThis.parsedFresh=parseProgressBackup(JSON.stringify(freshBackup));`);
 assert.equal(w.eval('planProgressRestore(parsedFresh).next.levels.push'),'push:wall-push-up');
 w.eval(`state.log=Array.from({length:LOG_KEEP},(_,i)=>({ts:${now}-i-1,t:'push',k:'push:push-up',sets:[8]}));parsedFresh.state.log=[{ts:${now},t:'push',k:'push:push-up',sets:[8]}];`);
 assert.throws(()=>w.eval('planProgressRestore(parsedFresh)'),/storage limit/);
});
}finally{setTimeout(()=>w.close(),0);}
