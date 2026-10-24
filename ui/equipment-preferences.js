/* App adapter: changing availability never deletes performed work or history. */
function equipmentCheck(t,level=lvlOf(t),st=spec(t,level)){
 return LadderEquipment.check(st[6],state.prefs.equipment,{stepName:st[0]});
}
function equipmentReady(t,level=lvlOf(t)){
 const result=equipmentCheck(t,level);
 if(result.compatible)return true;
 const step=spec(t,level);
 const messages=[...result.missing.map(label=>label+' is marked unavailable.'),...result.unknown.map(label=>'Confirm availability: '+label+'.')];
 openEquipmentPreferences(document.activeElement,{title:step[0],message:messages.join(' ')});
 return false;
}
function compatibleTracks(tracks){return tracks.filter(t=>equipmentCheck(t).compatible);}
function openEquipmentPreferences(opener=document.activeElement,reason){
 const existing=document.getElementById('equipmentPreferences');
 if(existing){existing.querySelector('select')?.focus();return;}
 const d=document.createElement('dialog');d.id='equipmentPreferences';d.className='app-preferences equipment-preferences';d.setAttribute('aria-labelledby','equipmentTitle');
 const caps=LadderEquipment.normalize(state.prefs.equipment),baseline=['floor','wall','chair'],keys=Object.keys(LadderEquipment.CAPABILITIES);
 const field=key=>`<label class="equipment-setting" for="equipment-${key}"><span>${esc(LadderEquipment.CAPABILITIES[key])}</span><select id="equipment-${key}" data-equipment-key="${key}">${[['true','Available'],['false','Not available'],['unknown','Unconfirmed']].map(([value,label])=>`<option value="${value}"${value===(caps[key]===null?'unknown':String(caps[key]))?' selected':''}>${label}</option>`).join('')}</select></label>`;
 const reasonText=typeof reason==='string'?reason:reason?.message;
 d.innerHTML=`<div class="preferences-head"><h2 id="equipmentTitle">Your equipment</h2><button type="button" data-equipment-close aria-label="Close equipment settings" autofocus>×</button></div>${reasonText?`<section class="equipment-reason" role="status">${reason?.title?`<h3>${esc(reason.title)}</h3>`:''}<p>${esc(reasonText)}</p></section>`:''}<p>Confirm what you can use. Unconfirmed supports stay out of new automatic workouts. Your recorded sets and current workout are kept.</p><p class="cue">Availability does not certify that furniture or equipment can support your weight. Confirm the specific support and load needed for the exercise.</p><form data-equipment-form><fieldset><legend>Home basics</legend>${baseline.map(field).join('')}</fieldset><fieldset><legend>Equipment and supports</legend>${keys.filter(key=>!baseline.includes(key)).map(field).join('')}</fieldset><p class="cue">Changes can update a workout before its first set. Started and paused workouts keep their saved exercises.</p><div class="equipment-actions"><button type="submit" class="primary">Save equipment</button><button type="button" data-equipment-close>Cancel</button></div></form>`;
 let rerender=false;
 d.querySelectorAll('[data-equipment-close]').forEach(b=>b.addEventListener('click',()=>d.close()));
 d.addEventListener('click',e=>{if(e.target===d){const rect=d.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)d.close();}});
 d.querySelector('[data-equipment-form]').addEventListener('submit',e=>{
  e.preventDefault();
  const next=Object.fromEntries([...d.querySelectorAll('[data-equipment-key]')].map(input=>[input.dataset.equipmentKey,input.value==='unknown'?null:input.value==='true']));
  const canRebuild=typeof canAdjustReadiness==='function'&&canAdjustReadiness()&&focusRun?.phase!=='paused';
  state.prefs.equipment=LadderEquipment.normalize(next);commit();
  if(canRebuild)focusRun=null;
  rerender=true;d.close();
 });
 d.addEventListener('close',()=>{
  d.remove();
  if(rerender)render();
  if(opener?.isConnected&&(!opener.closest('dialog')||opener.closest('dialog').open))opener.focus({preventScroll:true});
  else (document.querySelector('[data-equipment-open]')||document.querySelector('.appearance-toggle'))?.focus({preventScroll:true});
 },{once:true});
 document.body.append(d);if(typeof applyComponentSystem==='function')applyComponentSystem(d);d.showModal();
}
document.addEventListener('click',e=>{const opener=e.target.closest('[data-equipment-open]');if(opener)openEquipmentPreferences(opener);});
