/* Minimal diagnostics: memory only, never workout data or automatic uploads. */
window.LadderSupport=(()=>{
 'use strict';
 const RELEASE='2026-10-25-clear-progress-backup',events=[];
 const screen=()=>['today','ladders','history','setup'].includes(document.body?.dataset.view)?document.body.dataset.view:'setup';
 function record(kind,line=0,column=0){
  if(!['runtime','promise','image','script','stylesheet','storage'].includes(kind))return;
  const item={kind,screen:screen(),line:Number.isInteger(line)?Math.max(0,Math.min(line,999999)):0,column:Number.isInteger(column)?Math.max(0,Math.min(column,999999)):0};
  const key=JSON.stringify(item),old=events.find(e=>e.key===key);
  if(old){old.count=Math.min(99,old.count+1);return;}
  if(events.length>=20)events.shift();
  events.push({...item,key,count:1});
  if(document.readyState!=='loading')showNotice();
 }
 function snapshot(){
  return {release:RELEASE,screen:screen(),online:navigator.onLine,viewport:{width:innerWidth,height:innerHeight},capabilities:{dialog:typeof HTMLDialogElement!=='undefined',wakeLock:'wakeLock' in navigator},events:events.map(({key,...item})=>({...item}))};
 }
 function showNotice(){
  if(!events.length||document.getElementById('appProblemNotice'))return;
  const target=document.querySelector('.wrap');if(!target)return;
  const notice=document.createElement('section');notice.id='appProblemNotice';notice.className='app-problem-notice';notice.setAttribute('role','status');
  notice.innerHTML='<p>Something didn’t load or run correctly.</p><button data-support-open>Report a problem</button><button data-support-dismiss aria-label="Dismiss problem notice">Dismiss</button>';
  target.prepend(notice);
 }
 function open(opener=document.activeElement){
  if(document.getElementById('appSupport'))return;
  const d=document.createElement('dialog');d.id='appSupport';d.className='app-preferences app-support';d.setAttribute('aria-labelledby','supportTitle');
  d.innerHTML='<div class="preferences-head"><h2 id="supportTitle">Report a problem</h2><button data-support-close aria-label="Close problem report" autofocus>×</button></div><p>Tell us what happened and what you expected. If progress looks wrong, back it up before refreshing.</p><label for="supportMessage">What went wrong?</label><textarea id="supportMessage" maxlength="3000" placeholder="What were you trying to do?"></textarea><label class="support-consent"><input type="checkbox" data-support-include> Include the technical details shown below</label><a class="lui lui-button" data-support-report>Email a private report</a><p>Your email app opens a draft to <strong>hello@ashbi.ca</strong>. Nothing is sent until you send it. No GitHub account needed.</p><p>If no email app opens, copy your message into an email to hello@ashbi.ca. Please leave out health details and progress backups.</p><details><summary>Review technical details</summary><p>Optional. No workout history, error messages, account details or saved progress are included.</p><textarea readonly aria-label="Technical details" spellcheck="false" data-support-details></textarea><div class="support-actions"><button data-support-copy>Copy report</button><button data-support-clear>Clear errors</button></div></details><p data-support-status role="status" aria-live="polite"></p>';
  const details=d.querySelector('[data-support-details]'),message=d.querySelector('#supportMessage'),include=d.querySelector('[data-support-include]'),status=d.querySelector('[data-support-status]');
  const report=()=> 'Bodyweight Ladder problem\n\n'+(message.value.trim()||'What happened?\n\nWhat did you expect?\n\nSteps to reproduce:')+(include.checked?'\n\nTechnical details:\n'+details.value:'');
  function refresh(){
   const info=JSON.stringify(snapshot(),null,2);details.value=info;
   d.querySelector('[data-support-report]').href='mailto:hello@ashbi.ca?subject='+encodeURIComponent('Bodyweight Ladder — problem report')+'&body='+encodeURIComponent(report());
  }
  refresh();
  const copyButton=d.querySelector('[data-support-copy]');d.querySelector('[data-support-report]').after(copyButton);copyButton.className='support-copy';
  message.addEventListener('input',refresh);include.addEventListener('change',refresh);
  d.querySelector('[data-support-close]').onclick=()=>d.close();
  d.querySelector('[data-support-copy]').onclick=async()=>{
   try{await navigator.clipboard.writeText(report());status.textContent='Report copied. Paste it into an email to hello@ashbi.ca.';}
   catch(_){const copy=document.createElement('textarea');copy.value=report();copy.setAttribute('aria-label','Report to copy');d.append(copy);copy.focus();copy.select();status.textContent='Select and copy the report below using your device’s Copy control.';}
  };
  d.querySelector('[data-support-clear]').onclick=()=>{events.length=0;document.getElementById('appProblemNotice')?.remove();refresh();status.textContent='Error details cleared from this page.';};
  d.addEventListener('close',()=>{d.remove();if(opener?.isConnected)opener.focus({preventScroll:true});},{once:true});
  document.body.append(d);if(typeof applyComponentSystem==='function')applyComponentSystem(d);d.showModal();
 }
 window.addEventListener('error',e=>{
  if(e.target&&e.target!==window){const kind={IMG:'image',SCRIPT:'script',LINK:'stylesheet'}[e.target.tagName];if(kind)record(kind);return;}
  let own=false;try{const url=new URL(e.filename,location.href);own=url.origin===location.origin&&['/','/index.html'].includes(url.pathname);}catch(_){}
  record('runtime',own?e.lineno:0,own?e.colno:0);
 },true);
 window.addEventListener('unhandledrejection',()=>record('promise'));
 document.addEventListener('click',e=>{
  const trigger=e.target.closest('[data-support-open]');if(trigger)open(trigger);
  if(e.target.closest('[data-support-dismiss]'))document.getElementById('appProblemNotice')?.remove();
 });
 document.addEventListener('DOMContentLoaded',showNotice,{once:true});
 return Object.freeze({open,record,snapshot});
})();
