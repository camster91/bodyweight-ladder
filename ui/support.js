/* Minimal diagnostics: memory only, never workout data or automatic uploads. */
window.LadderSupport=(()=>{
 'use strict';
 const RELEASE='2026-10-23-support-1',events=[];
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
  d.innerHTML='<div class="preferences-head"><h2 id="supportTitle">Report a problem</h2><button data-support-close aria-label="Close problem report" autofocus>×</button></div><p>Tell us what happened and what you expected. If progress looks wrong, back it up before refreshing.</p><p>Reports open on <strong>public GitHub</strong> and require a GitHub account. Keep health details, names and backup files out of your report.</p><a class="lui lui-button" data-support-report target="_blank" rel="noopener noreferrer">Open a problem report ↗</a><details><summary>Review technical details</summary><p>These stay on this page until you choose to share them. No workout history, error messages, account details or saved progress are included.</p><textarea readonly aria-label="Technical details" spellcheck="false"></textarea><div class="support-actions"><button data-support-copy>Copy details</button><button data-support-clear>Clear errors</button></div></details><p data-support-status role="status" aria-live="polite"></p>';
  const details=d.querySelector('textarea'),status=d.querySelector('[data-support-status]');
  function refresh(){
   const info=JSON.stringify(snapshot(),null,2);details.value=info;
   const body='What happened?\n\nWhat did you expect?\n\nSteps to reproduce\n1. \n\nDevice / browser (optional)\n\nTechnical details (review before submitting)\n```json\n'+info+'\n```\n\nPlease do not attach progress backups or private health information.';
   d.querySelector('[data-support-report]').href='https://github.com/camster91/bodyweight-ladder/issues/new?template=app-problem.md&title='+encodeURIComponent('App problem: ')+'&body='+encodeURIComponent(body);
  }
  refresh();
  d.querySelector('[data-support-close]').onclick=()=>d.close();
  d.querySelector('[data-support-copy]').onclick=async()=>{
   try{await navigator.clipboard.writeText(details.value);status.textContent='Technical details copied.';}
   catch(_){details.focus();details.select();status.textContent='Select and copy the details above using your device’s Copy control.';}
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
