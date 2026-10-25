/* Journey views use saved work only. They never schedule, change drafts, or infer recovery. */
function journeyEscape(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function journeyDay(ts){const d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function journeySummaryData(log=[],sessions=[],now=Date.now()){
 const day=86400000,dense=a=>Array.isArray(a)&&Array.from(a).every(v=>Number.isFinite(v)&&v>=0&&v<=9999);
 const work=(Array.isArray(log)?log:[]).filter(e=>e&&Number.isFinite(e.ts)&&e.ts>0&&e.ts<=now&&typeof e.t==='string'&&typeof e.k==='string'&&dense(e.sets)&&e.sets.length>0&&e.sets.length<=8);
 const byRef=new Map();for(const e of work)byRef.set(e.ts+'|'+e.t,e);
 const unique=[...byRef.values()],positive=e=>e.sets.some(v=>v>0),current=unique.filter(e=>e.ts>now-28*day),previous=unique.filter(e=>e.ts>now-56*day&&e.ts<=now-28*day);
 const ledger=typeof LadderSessions!=='undefined'?LadderSessions.normalize(sessions):(Array.isArray(sessions)?sessions:[]);
 const knownRefs=new Set(ledger.flatMap(s=>Array.isArray(s.logRefs)?s.logRefs:[]));
 const bucket=entries=>({days:new Set(entries.filter(positive).map(e=>journeyDay(e.ts))).size,sets:entries.reduce((n,e)=>n+e.sets.length,0),entries:entries.length});
 const terminal=ledger.filter(s=>s&&['completed','partial'].includes(s.status)&&Number.isFinite(s.ended)&&s.ended>now-28*day&&s.ended<=now&&Array.isArray(s.logRefs)&&s.logRefs.some(k=>byRef.has(k)&&positive(byRef.get(k))));
 const groups=new Map();for(const e of current){if(!positive(e))continue;const key=JSON.stringify([e.t,e.k,e.sets.length,e.mode==='light'?'light':'normal']);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(e);}
 const improvements=[];for(const entries of groups.values()){
  entries.sort((a,b)=>a.ts-b.ts);const first=entries[0],last=entries.at(-1),sum=e=>e.sets.reduce((n,v)=>n+v,0),gain=sum(last)-sum(first);
  if(entries.length>1&&journeyDay(first.ts)!==journeyDay(last.ts)&&gain>0)improvements.push({key:last.k,track:last.t,count:last.sets.length,firstTotal:sum(first),lastTotal:sum(last),gain,firstAt:first.ts,lastAt:last.ts,mode:last.mode==='light'?'light':'normal'});
 }
 improvements.sort((a,b)=>b.lastAt-a.lastAt||a.key.localeCompare(b.key));
 return {current:bucket(current),previous:bucket(previous),completed:terminal.filter(s=>s.status==='completed').length,partial:terminal.filter(s=>s.status==='partial').length,
  unclassified:current.filter(e=>positive(e)&&!knownRefs.has(e.ts+'|'+e.t)).length,
  historyDays:unique.length?Math.floor((now-unique.reduce((earliest,e)=>Math.min(earliest,e.ts),now))/day):0,
  weeks:Array.from({length:4},(_,i)=>bucket(current.filter(e=>e.ts>now-(4-i)*7*day&&e.ts<=now-(3-i)*7*day))),improvements};
}
function planningExplanationView(report){
 if(!report||typeof report!=='object')return '';
 const escape=journeyEscape,duration=report.duration||{},estimate=Number.isFinite(duration.estimatedMinutes)?duration.estimatedMinutes:report.estimatedMinutes;
 const budget=Number.isFinite(duration.budgetMinutes)?duration.budgetMinutes:null,next=report.eligibility?.nextEligibleAt,now=Date.now();
 const snapshot=typeof focusRun!=='undefined'&&focusRun?.coaching===report;
 const equipmentExcluded=Number.isSafeInteger(report.equipmentExcluded)&&report.equipmentExcluded>0?report.equipmentExcluded:0;
 const explanation=equipmentExcluded&&duration.reasonCodes?.includes('no-movements')?'The movements in these choices need equipment confirmation before they can enter a new automatic plan. Check your equipment or browse other exercises.':duration.explanation;
 const estimateText=Number.isFinite(estimate)&&estimate>0?'About '+Math.ceil(estimate)+' minutes including rests'+(budget?' · '+budget+'-minute budget':'')+'. Actual time varies.':budget?budget+'-minute budget. No automatic workout is available from these choices yet.':'No automatic workout is available from these choices yet.';
 const nextText=Number.isFinite(next)?next>now?'Next eligible movement: '+new Date(next).toLocaleString(undefined,{weekday:'short',hour:'numeric',minute:'2-digit'})+'.':'The waiting period in this explanation has passed. A new plan checks your latest saved work.':'';
 return `<section class="journey-plan" aria-label="Workout planning explanation"><p class="journey-source">${snapshot?'Saved planning snapshot. Your current workout keeps its original targets.':'Current selection · based on saved work and your choices.'}</p><p class="journey-estimate">${escape(estimateText)}</p>${explanation?`<p>${escape(explanation)}</p>`:''}${equipmentExcluded?`<p>${equipmentExcluded} ${equipmentExcluded===1?'movement needs':'movements need'} confirmed equipment availability.</p>`:''}${nextText?`<p>${escape(nextText)}</p>`:''}<div class="journey-actions"><button data-journey="browse">Browse exercises</button><button data-journey="all">Plan from all exercises</button></div><p class="journey-note">Changing the selection never overrides the 24-hour rule. Saved sets and unfinished work stay protected.</p></section>`;
}
function journeyCheckinCopy(data,prefs,{includeTotals=true}={}){
 if(data.historyDays<28)return {heading:'A quick weekly check-in',text:`Your ${prefs.days}-day weekly participation goal is flexible. Make the next workout fit the time and energy you have.`};
 const heading=data.historyDays<56?'Your first-month check-in':'Your monthly check-in';
 const recap=`${data.current.days} ${data.current.days===1?'day':'days'} with recorded work · ${data.current.sets} ${data.current.sets===1?'set':'sets'} in the last 28 days.`;
 const suggestion=!data.current.days?'When you return, choose a short or lighter workout.':data.partial>=2&&data.partial>data.completed?'Several sessions finished early. A shorter time budget may fit better.':data.improvements.length?'Matching results improved above. Keep your goal or choose a different focus.':'Review time, goals or energy to make the next workout fit.';
 return {heading,text:(includeTotals?recap+' ':'')+suggestion};
}
function monthJourneyView(){
 const now=Date.now(),data=journeySummaryData(state.log,state.sessions,now),escape=journeyEscape,delta=(value,prior)=>value===prior?'Same as the previous 4 weeks':(value>prior?'+':'')+(value-prior)+' vs previous 4 weeks';
 const prefs=typeof LadderCoach!=='undefined'?LadderCoach.prefs(state.prefs?.coach):{days:3};
 const checkin=journeyCheckinCopy(data,prefs,{includeTotals:false});
 const gains=data.improvements.slice(0,3).map(record=>{
  const step=typeof stepByKey==='function'?stepByKey(record.key):null;if(!step)return '';
  const rawUnit=String(step.st[4]),measure=typeof isSec==='function'&&isSec(rawUnit)?'seconds':rawUnit.startsWith('rounds')?'rounds':'reps',side=rawUnit.includes('each')?' per side':'';
  return `<li><b>${escape(step.st[0])}</b><span>${record.firstTotal} → ${record.lastTotal} ${measure}${side} · ${record.count}-set total${record.mode==='light'?' · lighter workout':''}</span></li>`;
 }).join('');
 return `<section class="journey-month" aria-labelledby="journeyMonthTitle"><div class="journey-heading"><h2 id="journeyMonthTitle">Last 4 weeks</h2><p>Saved work over the last 28 days.</p></div>
 <div class="journey-metrics"><div><strong>${data.current.days}</strong><span>${data.current.days===1?'day':'days'} with recorded work</span><small>${escape(delta(data.current.days,data.previous.days))}</small></div><div><strong>${data.current.sets}</strong><span>${data.current.sets===1?'set':'sets'} recorded</span><small>${escape(delta(data.current.sets,data.previous.sets))}</small></div></div>
 <p class="journey-outcomes">${data.completed} completed ${data.completed===1?'session':'sessions'} · ${data.partial} finished early</p>
 ${data.unclassified?'<p class="journey-note">Some earlier exercise history has no session outcome.</p>':''}
 ${gains?`<div class="journey-gains"><h3>Matching results that improved</h3><ul>${gains}</ul></div>`:''}
 ${data.historyDays>=7?`<div class="journey-checkin"><h3>${escape(checkin.heading)}</h3><p>${escape(checkin.text)}</p><div class="journey-actions"><button data-journey="review" data-review="time">Review time</button><button data-journey="review" data-review="goal">Review goal</button><button data-journey="review" data-review="energy">Review energy</button></div></div>`:'<p class="journey-note">Your first weekly check-in appears after 7 days of saved history.</p>'}
 <details class="progress-method"><summary>How this is counted</summary><p>A training day needs at least one positive saved result. Set totals include explicitly recorded zero results. Unfinished drafts are not included.</p>${data.unclassified?'<p>Exercise history without a session outcome contributes to the work totals; its session completion is unknown.</p>':''}${gains?'<p>Improvements compare the first and latest result on separate days, for the same step and number of sets. This describes your log, not a fitness assessment.</p>':''}</details></section>`;
}
if(typeof module!=='undefined'&&module.exports)module.exports={journeySummaryData,planningExplanationView,journeyCheckinCopy,monthJourneyView};
