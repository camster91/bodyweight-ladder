/* Durable session summaries. Pure helpers: no storage, timers, or implicit logging. */
const LadderSessions=(()=>{
 'use strict';
 const VERSION=1,STATUSES=['active','paused','completed','partial'];
 const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
 const text=x=>typeof x==='string'&&x.length>0&&x.length<=300&&!/[\u0000-\u001f]/.test(x);
 const time=x=>Number.isSafeInteger(x)&&x>0&&x<=8640000000000000;
 const count=x=>Number.isSafeInteger(x)&&x>=0&&x<=1000000;
 const number=x=>Number.isFinite(x)&&x>=0&&x<=9999;
 const dense=x=>Array.isArray(x)&&Array.from({length:x.length},(_,i)=>Object.hasOwn(x,i)).every(Boolean);
 const refs=x=>Array.isArray(x)?[...new Set(x.filter(text))].sort():[];
 const terminal=x=>x==='completed'||x==='partial';
 function record(x){
  if(!object(x)||!text(x.id)||!time(x.started)||!time(x.updated)||!STATUSES.includes(x.status))return null;
  if(!['planned','completed','skipped','performedSets'].every(k=>count(x[k])))return null;
  if(x.completed+x.skipped>x.planned)return null;
  const ended=terminal(x.status)&&time(x.ended)&&x.ended>=x.started?x.ended:null;
  if(terminal(x.status)&&ended===null)return null;
  return {id:x.id,started:x.started,updated:Math.max(x.started,x.updated,ended||0),ended,status:x.status,
   planned:x.planned,completed:x.completed,skipped:x.skipped,performedSets:x.performedSets,logRefs:refs(x.logRefs)};
 }
 function combine(a,b){
  // Equal clocks are resolved by canonical content, independent of device/merge order.
  const tie=x=>JSON.stringify([STATUSES.indexOf(x.status),x.ended,x.planned,x.completed,x.skipped,x.performedSets]);
  const winner=a.updated===b.updated?(tie(a)>tie(b)?a:b):(a.updated>b.updated?a:b);
  return {...winner,started:Math.min(a.started,b.started),logRefs:refs([...a.logRefs,...b.logRefs])};
 }
 function normalize(input){
  const records=new Map();
  for(const x of Array.isArray(input)?input:[]){const r=record(x);if(r)records.set(r.id,records.has(r.id)?combine(records.get(r.id),r):r);}
  return [...records.values()].sort((a,b)=>a.started-b.started||a.id.localeCompare(b.id));
 }
 function merge(a,b){return normalize([...(Array.isArray(a)?a:[]),...(Array.isArray(b)?b:[])]);}
 function upsert(records,value){return merge(records,[value]);}
 function performed(item){
  if(!object(item)||!Array.isArray(item.goals)||item.goals.length<1||item.goals.length>8)return [];
  const size=item.goals.length,d=item.advancedDraft;
  if(d!==undefined){
   if(!object(d)||!object(d.values)||!dense(d.done))return [];
   const keys=Object.keys(d.values),validIndex=i=>Number.isInteger(i)&&i>=0&&i<size;
   if(keys.some(k=>!/^\d$/.test(k)||!validIndex(+k)||typeof d.values[k]!=='string'||!/^\d{0,4}$/.test(d.values[k])))return [];
   if(new Set(d.done).size!==d.done.length||d.done.some(i=>!validIndex(i)||!Object.hasOwn(d.values,i)||d.values[i]===''))return [];
   return d.done.slice().sort((a,b)=>a-b).map(i=>Number(d.values[i]));
  }
  return dense(item.values)&&item.values.length<=size&&item.values.every(number)?item.values.slice():[];
 }
 function summarize(run,{now=Date.now(),status,log=[]}={}){
  if(!object(run)||!Array.isArray(run.items)||!time(run.started)||!time(now))return null;
  const id=run.sessionId||run.id||'session-'+run.started;
  const selected=status||run.status||(run.phase==='finished'?'completed':'active');
  const lookup=new Map();
  for(const e of Array.isArray(log)?log:[]){
   if(object(e)&&time(e.ts)&&text(e.t)&&dense(e.sets)&&e.sets.length>0&&e.sets.length<=8&&e.sets.every(number))lookup.set(e.ts+'|'+e.t,e);
  }
  const logRefs=refs([...(Array.isArray(run.logRefs)?run.logRefs:[]),...run.items.map(x=>x?.entry)]).filter(k=>lookup.has(k));
  const completed=run.items.filter(x=>object(x)&&!x.skipped&&!x.omitted&&text(x.entry)&&lookup.has(x.entry)&&Array.isArray(x.goals)&&lookup.get(x.entry).sets.length>=x.goals.length&&x.goals.length>0).length;
  const skipped=run.items.filter(x=>object(x)&&x.skipped===true).length;
  return record({id,started:run.started,updated:Math.max(now,run.started),ended:terminal(selected)?Math.max(now,run.started):null,status:selected,
   planned:run.items.length,completed,skipped,performedSets:logRefs.reduce((n,k)=>n+lookup.get(k).sets.length,0),logRefs});
 }
 return {VERSION,normalize,merge,upsert,performed,summarize};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LadderSessions;
