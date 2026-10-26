/* Durable workout actions. Embedded after app/timer declarations and before boot. */
function sessionPending(x){return !!x&&!x.entry&&!x.skipped&&!x.omitted;}
function sessionTotals(run=focusRun){
 const refs=new Set([...(run?.logRefs||[]),...(run?.items||[]).map(x=>x.entry).filter(Boolean)]);
 const entries=state.log.filter(e=>refs.has(entryId(e))),sets=entries.reduce((n,e)=>n+e.sets.length,0);
 return {entries,exercises:new Set(entries.map(e=>e.t)).size,sets,performedSets:sets,planned:run?.items?.length||0,
  completed:(run?.items||[]).filter(x=>!x.skipped&&!x.omitted&&x.entry&&entries.some(e=>entryId(e)===x.entry&&e.sets.length>=x.goals.length)).length,
  skipped:(run?.items||[]).filter(x=>x.skipped).length};
}
function persistWorkoutSession(){
 if(focusRun){
  if(focusRun.phase!=='finished'){delete focusRun.endStatus;delete focusRun.ended;}
  focusRun.sessionId=focusRun.sessionId||'session-'+focusRun.started+'-'+(globalThis.crypto?.randomUUID?.()||Math.random().toString(36).slice(2));
  if(focusRun.phase==='finished'&&!focusRun.ended)focusRun.ended=Date.now();
  const fullyDone=focusRun.items.length>0&&focusRun.items.every(x=>!x.skipped&&!x.omitted&&x.entry&&state.log.some(e=>entryId(e)===x.entry&&e.sets.length>=x.goals.length));
  const status=focusRun.phase==='finished'?(focusRun.closedEarly||focusRun.endStatus==='partial'||!fullyDone?'partial':'completed'):focusRun.phase==='paused'?'paused':'active';
  if(focusRun.phase==='finished')focusRun.endStatus=status;
  const summary=LadderSessions.summarize(focusRun,{now:Date.now(),status,log:state.log});
  if(summary){
   if(focusRun.ended&&summary.ended)summary.ended=focusRun.ended;
   const old=(state.sessions||[]).find(s=>s.id===summary.id),semantic=s=>{if(!s)return '';const {updated,...rest}=s;return JSON.stringify(rest);};
   if(semantic(old)!==semantic(summary)){
    summary.updated=Math.max(summary.updated,(old?.updated||0)+1);
    state.sessions=LadderSessions.upsert(state.sessions,summary);saveLocal();if(!storageRecovery.active)pushCloud();
   }
  }
 }
 return writeLocal('bwl-focus',JSON.stringify(focusRun));
}
function validSessionPause(p,x=focusItem()){
 if(!p||typeof p!=='object'||!['work','rest','hold'].includes(p.kind))return false;
 const bounded=(n,max)=>Number.isFinite(n)&&n>=0&&n<=max;
 if(p.kind==='work')return true;
 if(p.kind==='rest')return bounded(p.remainingMs,3600000)&&bounded(p.duration,3600);
 return !!x&&p.tid===x.id&&p.key===x.key&&Number.isInteger(p.i)&&p.i>=0&&p.i<x.goals.length&&bounded(p.elapsedMs,86400000)&&bounded(p.readyMs,10000)&&bounded(p.goal,9999)&&[1,2].includes(p.sides)&&Number.isInteger(p.side)&&p.side>=1&&p.side<=p.sides&&(p.first===undefined||bounded(p.first,9999));
}
function pauseWorkout({quiet=false}={}){
 if(!focusRun||focusRun.phase==='finished'||focusRun.phase==='paused')return false;
 if(hold&&hold.tid!==focusItem()?.id){toast('Finish or cancel the running hold before changing this workout. Its timer is still running.');return false;}
 const now=Date.now();let p={kind:'work'};
 if(hold){const h=hold,x=focusItem();p={kind:'hold',tid:h.tid,key:x?.key,i:h.i,goal:h.goal,elapsedMs:Math.max(0,now-h.start),readyMs:Math.max(0,h.start-now),side:h.side,sides:h.sides,focus:!!h.focus,announcedStart:!!h.announcedStart,targetReached:!!buzzed,...(h.first===undefined?{}:{first:h.first})};}
 else if(focusRun.phase==='rest')p={kind:'rest',remainingMs:Math.max(0,Math.min(3600000,focusRun.restEnd-now)),duration:Math.min(3600,focusRun.restDuration||0)};
 focusRun.pauseSnapshot=validSessionPause(p)?p:{kind:'work'};stopTimer();focusRun.phase='paused';focusRun.pausedAt=now;focusUndo=null;persistFocus();
 if(!quiet){closeWorkoutTools();render();announceTimer('Workout paused. Recorded sets are kept. Resume when ready.');document.querySelector('[data-session-action="resume"]')?.focus({preventScroll:true});}
 return true;
}
function resumeWorkout(){
 if(!focusRun||focusRun.phase!=='paused')return;
 const p=validSessionPause(focusRun.pauseSnapshot)?focusRun.pauseSnapshot:{kind:'work'};
 delete focusRun.pauseSnapshot;delete focusRun.pausedAt;focusRun.phase='work';focusRun.resumeDay=dayOf(Date.now());focusUndo=null;
 if(p.kind==='rest'&&p.remainingMs>0){focusRun.phase='rest';focusRun.restDuration=p.duration||p.remainingMs/1000;focusRun.restEnd=Date.now()+p.remainingMs;startRest(p.remainingMs/1000,focusRun.restEnd);}
 if(p.kind==='hold'){
  const t=findTrack(p.tid);if(t){holdNext[t.id]=p.i;startHold(t,p.side);Object.assign(hold,{goal:p.goal,start:Date.now()+p.readyMs-p.elapsedMs,focus:p.focus,announcedStart:p.announcedStart===true,side:p.side,sides:p.sides,...(p.first===undefined?{}:{first:p.first})});buzzed=p.targetReached===true;tick();}
 }
 persistFocus();render();announceTimer('Workout resumed.');$('#focusPrimary')?.focus({preventScroll:true});
}
function autoPauseOlderWorkout(){
 if(!focusRun||!['work','rest'].includes(focusRun.phase)||!Number.isFinite(focusRun.started))return false;
 const today=dayOf(Date.now());
 if(dayOf(focusRun.started)===today||focusRun.resumeDay===today)return false;
 if(!(focusRun.items||[]).some(x=>x.entry||x.skipped||LadderSessions.performed(x).length||sessionHasDraft(x)))return false;
 return pauseWorkout({quiet:true});
}
function clearPendingSessionDraft(x){delete drafts[x.id];delete completedSets[x.id];delete holdNext[x.id];delete x.advancedDraft;delete x.value;}
function nextSessionLogTs(tid){
 let next=Math.max(Date.now(),lastSaveAt+1);for(const entry of state.log)if(entry.t===tid&&Number.isFinite(entry.ts))next=Math.max(next,entry.ts+1);return next;
}
function savePendingSessionItem(x){
 if(!sessionPending(x))return null;
 const vals=LadderSessions.performed(x);if(!vals.length)return null;
 if(!focusRun.sessionId)persistFocus();
 const now=nextSessionLogTs(x.id);lastSaveAt=now;
 const entry={ts:now,t:x.id,k:x.key,sets:vals.slice(),partial:true,sessionId:focusRun.sessionId,...(x.mode==='light'?{mode:'light'}:{}),...(x.swap?{insteadOf:x.swap.original.key}:{})};
 state.log.push(entry);focusRun.logRefs=[...new Set([...(focusRun.logRefs||[]),entryId(entry)])];x.entry=entryId(entry);x.values=vals.slice();clearPendingSessionDraft(x);focusUndo=null;
 commit();persistFocus();return entry;
}
function advanceWorkoutItem(){
 const next=focusRun.items.findIndex(sessionPending);focusRun.restEnd=0;
 if(next<0){focusRun.phase='finished';focusRun.endStatus=focusRun.closedEarly||focusRun.items.some(x=>x.skipped||x.omitted||!x.entry||!state.log.some(e=>entryId(e)===x.entry&&e.sets.length>=x.goals.length))?'partial':'completed';focusRun.ended=Date.now();}
 else{focusRun.at=next;focusRun.phase='work';delete focusRun.pauseSnapshot;primeAudio();workoutCue('exercise');}
 persistFocus();render();$('#focusPrimary')?.focus({preventScroll:true});
}
function finishWorkoutToday({startNew=false}={}){
 if(!focusRun||focusRun.phase==='finished'||$('#finishWorkoutToday'))return;
 if(hold&&hold.tid!==focusItem()?.id){toast('Finish or cancel the running hold before finishing this workout. Its timer is still running.');return;}
 closeWorkoutTools();pauseWorkout({quiet:true});persistFocus();
 const session=focusRun,pending=session.items.filter(sessionPending),pendingSets=pending.reduce((n,x)=>n+LadderSessions.performed(x).length,0),totals=sessionTotals(session),untouched=pending.filter(x=>!LadderSessions.performed(x).length).length;
 const unfinishedHold=session.pauseSnapshot?.kind==='hold'?' The unfinished hold is not a completed set and will not be saved.':'';
 const d=document.createElement('dialog');d.id='finishWorkoutToday';d.className='workout-tools end-workout-sheet';d.setAttribute('aria-labelledby','finishWorkoutTodayTitle');
 d.innerHTML=`<div class="workout-tools-head"><h2 id="finishWorkoutTodayTitle">${startNew?'Save & start today’s plan?':'Finish for today?'}</h2><button type="button" data-session-finish-cancel aria-label="Keep workout paused">×</button></div><div class="workout-tools-body"><div class="finish-save-summary"><p><strong>${totals.sets} ${totals.sets===1?'set':'sets'} already saved</strong></p>${pendingSets?`<p>${pendingSets} performed ${pendingSets===1?'set will':'sets will'} also be saved.</p>`:''}</div><p>${untouched?untouched+' untouched '+(untouched===1?'exercise stays':'exercises stay')+' unrecorded. ':''}Unmarked numbers and targets are not counted.${unfinishedHold}</p><p class="cue">The workout stays paused until you choose.</p><div class="end-workout-actions"><button type="button" class="primary" data-session-finish-confirm>${startNew?'Save & start today’s plan':'Save & finish for today'}</button><button type="button" data-session-finish-cancel>Keep paused</button></div></div>`;
 let accepted=false;
 const close=()=>d.close();d.querySelectorAll('[data-session-finish-cancel]').forEach(b=>b.addEventListener('click',close));
 d.querySelector('[data-session-finish-confirm]').addEventListener('click',()=>{
  if(focusRun!==session){close();return;}accepted=true;
  for(const x of session.items){savePendingSessionItem(x);if(!x.skipped&&(!x.entry||!state.log.some(e=>entryId(e)===x.entry&&e.sets.length>=x.goals.length)))x.omitted=true;}
  const full=session.items.every(x=>!x.skipped&&!x.omitted&&x.entry&&state.log.some(e=>entryId(e)===x.entry&&e.sets.length>=x.goals.length));
  stopTimer();delete session.pauseSnapshot;session.closedEarly=session.closedEarly||!full;session.phase='finished';session.endStatus=full&&!session.closedEarly?'completed':'partial';session.ended=Date.now();focusUndo=null;commit();persistFocus();
  if(startNew){focusRun=null;readinessChoice=null;swapChoice=null;persistFocus();}
  close();render();announceTimer(startNew?'Previous workout saved. Today’s plan is ready.':'Workout finished. Performed sets are saved.');$('#focusPrimary')?.focus({preventScroll:true});
 });
 d.addEventListener('cancel',e=>{e.preventDefault();close();});
 d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();});
 d.addEventListener('close',()=>{d.remove();document.body.classList.remove('end-workout-open');if(!accepted){render();document.querySelector('[data-session-action="resume"]')?.focus({preventScroll:true});}},{once:true});
 document.body.append(d);applyComponentSystem(d);document.body.classList.add('end-workout-open');d.showModal();d.querySelector('[data-session-finish-cancel]').focus({preventScroll:true});
}
function workoutPauseMarkup(){
 if(!focusRun||!['work','rest'].includes(focusRun.phase)||!focusRun.items.some(sessionPending))return '';
 return '<button type="button" id="workoutPauseButton" class="workout-pause" data-session-action="pause" aria-label="Pause workout"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 5v10M13 5v10"/></svg><span>Pause</span></button>';
}
function workoutActionsMarkup(){
 if(!focusRun||focusRun.phase==='finished')return '';
 const paused=focusRun.phase==='paused';
 return `<div class="workout-session-actions" role="group" aria-label="Workout actions"><button type="button" data-session-action="skip"${paused?' disabled':''}>Skip exercise</button><button type="button" data-session-action="swap"${paused?' disabled':''}>Swap exercise</button><button type="button" data-session-action="finish">Finish for today</button></div>`;
}
function sessionPausedView(){
 const x=focusItem(),t=x&&findTrack(x.id),p=validSessionPause(focusRun?.pauseSnapshot,x)?focusRun.pauseSnapshot:null;
 const older=focusRun&&dayOf(focusRun.started)!==dayOf(Date.now()),started=older?new Date(focusRun.started).toLocaleDateString(undefined,{month:'short',day:'numeric'}):'';
 const st=t?sessionSpec(t):null,index=p?.kind==='hold'?p.i:x?.advancedDraft?.done?x.goals.findIndex((_,i)=>!x.advancedDraft.done.includes(i)):x?.values?.length||0;
 const set=Math.min(Math.max(0,index)+1,x?.goals?.length||1),clock=ms=>{const s=Math.ceil(ms/1000);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
 const status=p?.kind==='rest'?'Rest paused · '+clock(p.remainingMs)+' left':p?.kind==='hold'?p.readyMs>0?'Get-ready countdown paused · '+Math.ceil(p.readyMs/1000)+' seconds left':'Hold paused · '+Math.floor(p.elapsedMs/1000)+' seconds elapsed'+(p.sides>1?' · side '+p.side:''):'Ready when you are.';
 const preview=t?`<div class="paused-next">${exerciseThumbnail(t,sessionLevel(t))}<div><p class="label">${p?.kind==='hold'?'Continue':'Up next'} · Set ${set} of ${x.goals.length}</p><h3>${esc(st[0])}</h3><p>${esc(p?.kind==='hold'?p.goal:x.goals[set-1])} ${isSec(st[4])?'seconds':'reps'}${st[4].includes('each')?' each side':''}</p><button type="button" id="focusHowTo" class="focus-howto paused-howto" data-ui="technique" aria-haspopup="dialog" aria-label="How to do ${esc(st[0])}">How to <span aria-hidden="true">→</span></button></div></div>`:'';
 return `<section class="focus-stage focus-paused" aria-labelledby="sessionPausedTitle"><h2 id="sessionPausedTitle">${older?'Unfinished workout':'Workout paused'}</h2>${older?`<p>Started ${esc(started)}</p>`:''}${preview}${p&&p.kind!=='work'?`<p class="paused-status" role="status">${esc(status)}</p>`:''}<p class="paused-save-note">Recorded sets and edits stay on this device.</p><button type="button" class="primary" id="focusPrimary" data-session-action="resume">Resume workout</button><button type="button" class="paused-finish" data-session-action="finish">Finish for today</button>${older?'<button type="button" data-session-action="save-new">Save & start today’s plan</button>':''}</section>`;
}
function handleSessionAction(button){
 const action=typeof button==='string'?button:button?.dataset?.sessionAction;
 if(action==='resume'){resumeWorkout();return;}
 if(action==='save-new'){finishWorkoutToday({startNew:true});return;}
 if(action==='finish'){finishWorkoutToday();return;}
 if(action==='pause'){pauseWorkout();return;}
 if(!focusRun||focusRun.phase==='paused'||focusRun.phase==='finished')return;
 if(hold&&hold.tid!==focusItem()?.id){toast('Finish or cancel the running hold before changing this workout. Its timer is still running.');return;}
 const x=focusItem();if(!x||!sessionPending(x))return;
 if(action==='skip'){
  const complete=LadderSessions.performed(x).length>=x.goals.length;
  stopTimer();savePendingSessionItem(x);if(!complete)x.skipped=true;clearPendingSessionDraft(x);focusUndo=null;closeWorkoutTools();advanceWorkoutItem();announceTimer(complete?'All planned sets were already performed and are now saved.':'Exercise skipped. Performed sets are kept.');return;
 }
 if(action==='swap'){
  const performed=LadderSessions.performed(x).length;
  if(performed>=x.goals.length){stopTimer();savePendingSessionItem(x);closeWorkoutTools();advanceWorkoutItem();announceTimer('All planned sets were already performed and are now saved. No extra set was added.');return;}
  if(typeof swapOptions==='function'&&!swapOptions(x).length){toast('No compatible alternative is available for this movement. You can skip it instead.');return;}
  stopTimer();savePendingSessionItem(x);
  if(performed){x.remainingSets=x.goals.length-performed;x.goals=x.goals.slice(0,x.remainingSets);}
  delete x.entry;x.values=[];clearPendingSessionDraft(x);x.restartAfter=nextSessionLogTs(x.id);focusRun.phase='work';focusRun.restEnd=0;focusUndo=null;swapChoice=null;
  persistFocus();workoutToolsPanel='alternatives';workoutToolsOpen=true;render();document.querySelector('#workoutTools [data-swap="choose"]')?.focus({preventScroll:true});
 }
}
