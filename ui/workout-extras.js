/* Explicit workout extensions; never an automatic recovery recommendation. */
function workoutExtraEntries(run=focusRun){
 const refs=new Set([...(run?.logRefs||[]),...(run?.items||[]).map(x=>x.entry).filter(Boolean)]),latest=new Map();
 for(const entry of state.log){
  if(!refs.has(entryId(entry))||!Array.isArray(entry.sets)||!entry.sets.length)continue;
  const t=findTrack(entry.t);if(!t||isHidden(t.id)||!t.steps.some((_,i)=>keyOf(t,i)===entry.k))continue;
  if(!latest.has(entry.t)||entry.ts>latest.get(entry.t).ts)latest.set(entry.t,entry);
 }
 return [...latest.values()];
}
function addWorkoutExtra(tid,{oneSet=false}={}){
 if(!focusRun||focusRun.phase!=='finished')return false;
 const t=findTrack(tid);if(!t||isHidden(t.id))return false;
 const oldEntry=oneSet?workoutExtraEntries().find(e=>e.t===tid):null;
 if(oneSet&&!oldEntry)return false;
 let x=focusRun.items.find(item=>item.id===tid),level=oneSet?t.steps.findIndex((_,i)=>keyOf(t,i)===oldEntry.k):lvlOf(t);
 if(level<0)level=lvlOf(t);
 if(!equipmentReady(t,level))return false;
 if(!x&&focusRun.items.length>=100){toast('This workout already has the maximum number of exercises. Finish here and plan another workout.');return false;}
 const st=spec(t,level),normal=goals(t,level,st);
 const last=oldEntry?.sets?.at(-1)??x?.goals?.at(-1)??normal[0];
 const target=Number.isFinite(last)&&last>=0&&last<=9999?last:st[2];
 const nextGoals=oneSet?[target]:normal.slice();
 // Preserve every completed entry before reusing an ID. Workout adapters and
 // draft maps are keyed by track ID, so duplicate items would corrupt drafts.
 focusRun.logRefs=[...new Set([...(focusRun.logRefs||[]),...focusRun.items.map(item=>item.entry).filter(Boolean)])];
 const next={id:tid,key:keyOf(t,level),goals:nextGoals,values:[],restartAfter:nextSessionLogTs(tid),extra:true};
 if(x){const at=focusRun.items.indexOf(x);focusRun.items[at]=next;focusRun.at=at;}
 else {focusRun.items.push(next);focusRun.at=focusRun.items.length-1;}
 delete drafts[tid];delete completedSets[tid];delete holdNext[tid];
 delete focusRun.endStatus;delete focusRun.ended;delete focusRun.pauseSnapshot;delete focusRun.pausedAt;
 focusRun.phase='work';focusRun.restEnd=0;focusRun.extrasCount=(Number.isSafeInteger(focusRun.extrasCount)?focusRun.extrasCount:0)+1;
 focusUndo=null;readinessChoice=null;swapChoice=null;
 persistFocus();return true;
}
function openWorkoutExtras(opener=document.activeElement){
 if(!focusRun||focusRun.phase!=='finished'||document.getElementById('workoutExtras'))return;
 const session=focusRun,d=document.createElement('dialog');d.id='workoutExtras';d.className='workout-tools workout-extras';d.setAttribute('aria-labelledby','workoutExtrasTitle');
 const completed=workoutExtraEntries(session).map(entry=>({entry,t:findTrack(entry.t)}));
 const tracks=compatibleTracks(allTracks().filter(t=>!isHidden(t.id)));
 const completedRows=completed.map(({entry,t})=>{const level=t.steps.findIndex((_,i)=>keyOf(t,i)===entry.k),st=spec(t,level);return `<button type="button" class="settings-row" data-session-extra="set" data-extra-track="${esc(t.id)}"><span class="settings-row-copy"><span class="settings-row-title">One more set of ${esc(st[0])}</span><span class="settings-row-detail">Keep your saved sets and add one optional set.</span></span><span aria-hidden="true">+</span></button>`;}).join('');
 const trackRows=tracks.map(t=>{const st=spec(t),recent=state.log.some(e=>e.t===t.id&&Date.now()-e.ts<86400000&&e.ts<=Date.now()&&e.sets.some(v=>v>0));return `<button type="button" class="settings-row" data-session-extra="add" data-extra-track="${esc(t.id)}"><span class="settings-row-copy"><span class="settings-row-title">Add ${esc(st[0])}</span><span class="settings-row-detail">${recent?'Recently recorded. Optional extra work, not a recovery recommendation.':esc(targetText(st))+' · Optional extra exercise.'}</span></span><span aria-hidden="true">+</span></button>`;}).join('');
 d.innerHTML=`<div class="workout-tools-head"><h2 id="workoutExtrasTitle">Add to this workout</h2><button type="button" data-extra-close aria-label="Close extra exercises" autofocus>×</button></div><div class="workout-tools-body"><p>Your completed work stays saved. Add only what you want to do; nothing is recorded until you complete it.</p>${completedRows?`<section><h3>One more set</h3>${completedRows}</section>`:''}<section><h3>Add an exercise</h3><p class="cue">These are equipment-compatible choices, not automatic recommendations. Recently recorded movements are labelled.</p>${trackRows||'<p>No confirmed compatible movements are available. Update equipment or finish for today.</p>'}</section><button type="button" data-equipment-open>Review equipment</button><button type="button" data-extra-close>Done for today</button></div>`;
 let added=false;
 d.querySelectorAll('[data-extra-close]').forEach(b=>b.addEventListener('click',()=>d.close()));
 d.addEventListener('click',e=>{
  const action=e.target.closest('[data-extra-track]');
  if(action){if(focusRun!==session)return;added=addWorkoutExtra(action.dataset.extraTrack,{oneSet:action.dataset.sessionExtra==='set'});if(added){d.close();render();announceTimer('Extra work added. Your completed sets are kept.');document.querySelector('#focusPrimary')?.focus({preventScroll:true});}return;}
  if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}
 });
 d.addEventListener('close',()=>{d.remove();if(!added){if(opener?.isConnected)opener.focus({preventScroll:true});else document.querySelector('[data-session-extra="open"]')?.focus({preventScroll:true});}},{once:true});
 document.body.append(d);if(typeof applyComponentSystem==='function')applyComponentSystem(d);d.showModal();
}
document.addEventListener('click',e=>{const opener=e.target.closest('[data-session-extra="open"]');if(opener)openWorkoutExtras(opener);});
