/* Pure coaching decisions. Product heuristics, not a diagnosis or measured recovery. */
const LadderCoach=(()=>{
 'use strict';
 const VERSION=1,DAY=86400000,GAP={Strength:48,Weights:48,Tendon:24,Mobility:24,Stretch:24,Custom:36};
 const PATTERNS={push:'push',dip:'push',hold:'push',pull:'pull',row:'pull',hang:'pull',curl:'pull',squat:'legs',knee:'legs',hinge:'hinge',swing:'hinge',core:'core',carry:'carry'};
 const FIRST=['push','squat','core','row','hinge','pull','dip'];
 const validHistory=(log,now)=>(Array.isArray(log)?log:[]).filter(e=>e&&Number.isFinite(e.ts)&&e.ts>0&&e.ts<=now&&typeof e.t==='string'&&typeof e.k==='string'&&Array.isArray(e.sets)&&e.sets.length>0&&e.sets.length<=8&&e.sets.every(v=>Number.isFinite(v)&&v>=0&&v<=9999)).slice().sort((a,b)=>b.ts-a.ts||a.t.localeCompare(b.t));
 const pattern=t=>PATTERNS[t.id]||t.id;
 const frequency=t=>({less:.5,normal:1,more:2}[t.frequency]||1);
 const prefs=p=>({goal:['balanced','strength','movement'].includes(p?.goal)?p.goal:'balanced',days:Number.isInteger(p?.days)&&p.days>=1&&p.days<=7?p.days:3});
 function progression(t,history,now){
  const st=t.step,last=history[0],inc=st.timed?5:1,clamp=v=>Math.min(st.max,Math.max(st.min,v));
  if(!last)return {kind:'start',title:'Start with control',reason:'Begin at the low end. Adjust the number to match what you actually do.',goals:Array(st.sets).fill(st.min)};
  const base=Array.from({length:st.sets},(_,i)=>clamp(last.sets[i]??last.sets.at(-1))),days=[],seen=new Set();
  for(const e of history){const day=e.day||new Date(e.ts).toDateString();if(e.ts<last.ts-28*DAY||e.sets.length!==st.sets||seen.has(day))continue;seen.add(day);days.push(e);if(days.length===4)break;}
  const hasStep=!t.custom&&t.level<t.stepCount-1,result=(kind,title,reason,values=base,level)=>({kind,title,reason,goals:values,...(level===undefined?{}:{level})});
  if(now-last.ts>=21*DAY)return result('return','Rebuild after time away','This step was last recorded at least three weeks ago. Trim one increment from each target, within this step’s range, before building again.',base.map(v=>clamp(v-inc)));
  if(now-last.ts>7*DAY)return result('return','Ease back in','It has been over a week since this step. Repeat your last targets before building again.');
  if(last.effort==='hard'){
   if(days.length>=2&&days[0]===last&&days.slice(0,2).every(e=>e.effort==='hard'&&e.sets.some(v=>v<st.min))&&!t.custom&&t.level>0)return result('down','Try an easier step','Two separate training days felt hard and fell below the range. An easier variation is available.',base,t.level-1);
   return result('hold','Repeat this target','You marked the last exercise hard. Keep the target steady; adjust down if needed.');
  }
  if(last.sets.length!==st.sets)return result('hold','Build a complete baseline','The number of sets changed or the last entry was partial. Repeat these targets before increasing.');
  if(days[0]===last&&days.length>=2&&days.slice(0,2).every(e=>e.sets.every(v=>v>=st.max)&&e.effort!=='hard')&&hasStep)return result('up','Ready for the next step','You reached the top of every set on two separate training days. Try the next variation when you feel ready.',base,t.level+1);
  if(last.sets.some(v=>v<st.min))return result('hold','Keep this manageable','At least one set was below the range. Rebuild at the low end before adding more.');
  if(last.sets.every(v=>v>=st.max))return result('confirm','Confirm this level',hasStep?'You reached the top of the range. Repeat it on another training day before moving up.':'You reached the top of this ladder. Keep the movement controlled; there is no higher step here.');
  const sum=e=>e.sets.reduce((n,v)=>n+v,0);
  if(days[0]===last&&days.length>=3&&last.effort!=='easy'&&days.slice(0,3).every(e=>e.effort!=='easy')&&Math.max(...days.slice(0,3).map(sum))-Math.min(...days.slice(0,3).map(sum))<inc)return result('steady','Consolidate this step','Your total has stayed similar across three training days. Repeat the target and focus on control; no extra reps today.');
  const next=base.slice();let at=-1;for(let i=0;i<next.length;i++)if(next[i]<st.max&&(at<0||next[i]<next[at]))at=i;if(at>=0)next[at]=clamp(next[at]+inc);
  return result('build','One small increase',`Add ${st.timed?'up to 5 seconds':'one rep'} to one of your lower sets. The other targets stay steady.`,next);
 }
 function estimate(t,goals){return (goals.reduce((n,v)=>n+v*(t.step.timed?1:3),0)*(t.step.eachSide?2:1)+(t.step.sets-1)*t.rest)/60+1;}
 function evaluate(t,{history=[],catalog=[],now=0,weekStart=now-7*DAY}={}){
  const log=validHistory(history,now),own=log.filter(e=>e.t===t.id),baseline=own.filter(e=>e.k===t.key&&e.mode!=='light'),active=own.find(e=>e.sets.some(v=>v>0)),p=pattern(t),cadence=GAP[t.group]||36;
  const known=new Map(catalog.map(m=>[m.id,pattern(m)]));known.set(t.id,p);
  const related=log.find(e=>e.t!==t.id&&known.get(e.t)===p&&e.effort==='hard'&&e.sets.some(v=>v>0)&&now-e.ts<cadence*3600000);
  const recent=!!active&&now-active.ts<DAY,caution=recent||!!related;
  const weekSets=log.filter(e=>e.ts>=weekStart&&known.get(e.t)===p).reduce((n,e)=>n+e.sets.filter(v=>v>0).length,0);
  let decision=progression(t,baseline,now);
  const note=recent?'This exercise was recorded in the last 24 hours. It is kept out of the automatic plan.':related?`A related movement was marked hard in the past ${cadence} hours. These targets stay steady.`:'';
  if(caution&&['build','up'].includes(decision.kind)){
   const st=t.step,last=baseline[0],values=Array.from({length:st.sets},(_,i)=>Math.min(st.max,Math.max(st.min,last?.sets[i]??last?.sets.at(-1)??st.min)));
   decision={kind:'hold',title:'Keep the targets steady',reason:note,goals:values};
  }
  return {...decision,version:VERSION,estimatedMinutes:estimate(t,decision.goals),pattern:p,recovery:{recent,caution,note,cadenceHours:cadence,weekSets,hoursSince:active?Math.max(0,(now-active.ts)/3600000):null},evidence:{matchingSessions:baseline.length,distinctDays:new Set(baseline.map(e=>e.day||new Date(e.ts).toDateString())).size,lastEffort:baseline[0]?.effort||null},hasHistory:own.length>0};
 }
 function plan(models,context={}){
  const now=context.now||0,preferences=prefs(context.preferences),allLog=validHistory(context.history,now),decisions=models.map((t,i)=>({t,i,d:evaluate(t,context)}));
  const recent=decisions.filter(x=>x.d.recovery.recent),due=decisions.filter(x=>!x.d.recovery.recent&&x.d.hasHistory),fresh=decisions.filter(x=>!x.d.recovery.recent&&!x.d.hasHistory);
  const selected=[],counts=new Map(),reasons={},budget=Number.isFinite(context.budget)&&context.budget>0?context.budget:0;let used=0;
  const goalWeight=t=>preferences.goal==='strength'&&['Strength','Weights'].includes(t.group)?1.3:preferences.goal==='movement'&&['Mobility','Stretch'].includes(t.group)?1.3:1;
  const firstRank=x=>{const n=FIRST.indexOf(x.t.id);return n<0?99+x.i:n;};
  const priority=x=>{
   const age=x.d.recovery.hoursSince,urgency=age===null?1:Math.max(0,age)/(GAP[x.t.group]||36);
   return urgency*frequency(x.t)*(context.explicit?1:goalWeight(x.t))/(1+x.d.recovery.weekSets/24)/(1+(counts.get(x.d.pattern)||0)*.8)/(x.d.recovery.caution?3:1);
  };
  const add=(x,isNew)=>{selected.push(x);used+=x.d.estimatedMinutes;counts.set(x.d.pattern,(counts.get(x.d.pattern)||0)+1);reasons[x.t.id]=isNew?'Introduce this movement at its starting targets.':x.d.recovery.caution?x.d.recovery.note:`Selected using time since training, ${x.d.recovery.weekSets} sets logged for this movement pattern this week, and your frequency preference.`;};
  const fits=x=>!budget||used+x.d.estimatedMinutes<=budget+1;
  const choose=pool=>{while(pool.length){pool.sort((a,b)=>priority(b)-priority(a)||a.i-b.i);const x=pool.shift();if(fits(x))add(x,false);}};
  choose(due.slice());
  fresh.sort((a,b)=>frequency(b.t)*(context.explicit?1:goalWeight(b.t))-frequency(a.t)*(context.explicit?1:goalWeight(a.t))||firstRank(a)-firstRank(b));
  const cap=allLog.length>0&&!context.explicit?1:Infinity;let added=0;
  while(fresh.length&&added<cap){const x=fresh.shift();if(fits(x)){add(x,true);added++;}}
  if(!selected.length){const fallback=decisions.filter(x=>!x.d.recovery.recent).sort((a,b)=>priority(b)-priority(a)||firstRank(a)-firstRank(b))[0];if(fallback)add(fallback,!fallback.d.hasHistory);}
  const weekDays=new Set(allLog.filter(e=>e.ts>=(context.weekStart??now-7*DAY)&&e.sets.some(v=>v>0)).map(e=>e.day||new Date(e.ts).toDateString())).size;
  const goalName={balanced:'Balanced training',strength:'Strength focus',movement:'Movement focus'}[preferences.goal];
  const summary=`${goalName}. ${weekDays} of ${preferences.days} planned training days recorded this week. ${weekDays>=preferences.days?'Your weekly target is met; another workout is optional.':'This is a planning target, not a requirement to catch up.'}${recent.length?' Exercises recorded in the last 24 hours are left out of the automatic plan.':''}`;
  return {version:VERSION,generatedAt:now,preferences,weekDays,summary,estimatedMinutes:Math.ceil(used),overBudget:!!budget&&used>budget+1,selected:selected.map(x=>({id:x.t.id,decision:x.d,reason:reasons[x.t.id]})),recent:recent.map(x=>x.t.id),available:decisions.filter(x=>!recent.includes(x)&&!selected.includes(x)).map(x=>x.t.id)};
 }
 function adjustSession(items,kind,{budget=10,cost}={}){
  const base=JSON.parse(JSON.stringify(items));
  if(kind==='low')return {items:base.map(x=>({...x,mode:'light',goals:x.goals.map(v=>v===0?0:Math.max(1,Math.floor(v*.8))),coaching:x.coaching?{...x.coaching,title:'Lighter targets today',reason:'You chose low energy. Targets are reduced for this workout; progression stays separate.'}:undefined}))};
  if(kind==='short'){const selected=[];let used=0;for(const x of base){const minutes=cost(x);if(selected.length&&used+minutes>budget)break;selected.push(x);used+=minutes;}return {items:selected,budget,estimate:Math.ceil(used)};}
  return {items:base};
 }
 return {VERSION,pattern,prefs,evaluate,plan,adjustSession,estimate};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=LadderCoach;
