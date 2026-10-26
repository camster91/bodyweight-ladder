/* Device-only workout cues. No speech, permissions prompt, or workout mutations. */
const LadderCueSettings=(()=>{
 const normalize=p=>({sound:p?.sound!==false,vibration:p?.vibration!==false,muted:p?.muted===true});
 const patterns={rest:[[523,0,.12],[659,.17,.16]],exercise:[[523,0,.1],[659,.14,.1],[784,.28,.16]],start:[[784,0,.18]],target:[[659,0,.14],[523,.2,.18]]};
 const vibrations={rest:[180,80,180],exercise:[90,70,90,70,180],start:[120],target:[150,80,150]};
 return {normalize,patterns,vibrations};
})();
let cuePrefs;try{cuePrefs=LadderCueSettings.normalize(JSON.parse(store.get('bwl-cues','null')));}catch(e){cuePrefs=LadderCueSettings.normalize();}
const activeCueSounds=new Set();
function workoutCue(kind){
 if(cuePrefs.muted||!Object.hasOwn(LadderCueSettings.patterns,kind))return;
 if(cuePrefs.vibration)try{navigator.vibrate?.(LadderCueSettings.vibrations[kind]);}catch(e){}
 if(!cuePrefs.sound||!actx||actx.state!=='running')return;
 try{for(const [frequency,delay,duration]of LadderCueSettings.patterns[kind]){
  const oscillator=actx.createOscillator(),gain=actx.createGain(),start=actx.currentTime+delay;
  oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(.12,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  activeCueSounds.add(oscillator);oscillator.connect(gain).connect(actx.destination);oscillator.start(start);oscillator.stop(start+duration+.02);oscillator.onended=()=>{activeCueSounds.delete(oscillator);oscillator.disconnect();gain.disconnect();};
 }}catch(e){}
}
function cueMuteMarkup(){return `<button type="button" class="cue-mute" data-cue-mute aria-pressed="${cuePrefs.muted}">${cuePrefs.muted?'Unmute cues':'Mute cues'}</button>`;}
function cueSettingsMarkup(){return `<section class="settings-section workout-cue-settings"><h3>Workout cues</h3><div class="cue-preferences"><label><input type="checkbox" data-cue-setting="sound"${cuePrefs.sound?' checked':''}> Sound</label><label><input type="checkbox" data-cue-setting="vibration"${cuePrefs.vibration?' checked':''}> Vibration</label></div>${cueMuteMarkup()}<p class="appearance-note" data-cue-status role="status">${cueStatusText()}</p><p class="appearance-note">Keep the workout visible for timely cues. Availability depends on your browser and device.</p><details class="settings-detail"><summary>When cues play</summary><p class="appearance-note">Rest ending, a new exercise, hold starting and hold target reached. Sound needs browser playback permission; some devices do not support vibration.</p></details></section>`;}
function cueStatusText(){return cuePrefs.muted?'All workout cues are muted. Your sound and vibration choices stay saved.':!cuePrefs.sound&&!cuePrefs.vibration?'Sound and vibration are off.':'Cues use '+[cuePrefs.sound?'sound':'',cuePrefs.vibration?'vibration':''].filter(Boolean).join(' and ')+'.';}
function saveCuePreferences(){
 writeLocal('bwl-cues',JSON.stringify(cuePrefs));
 document.querySelectorAll('[data-cue-mute]').forEach(b=>{b.textContent=cuePrefs.muted?'Unmute cues':'Mute cues';b.setAttribute('aria-pressed',String(cuePrefs.muted));});
 document.querySelectorAll('[data-cue-setting]').forEach(input=>{input.checked=cuePrefs[input.dataset.cueSetting];});
 document.querySelectorAll('[data-cue-status]').forEach(el=>{el.textContent=cueStatusText();});
 if(cuePrefs.muted||!cuePrefs.sound){for(const oscillator of activeCueSounds)try{oscillator.stop();}catch(e){}activeCueSounds.clear();}
 if(cuePrefs.muted||!cuePrefs.vibration)try{navigator.vibrate?.(0);}catch(e){}
 if(!cuePrefs.muted&&cuePrefs.sound)primeAudio();
 announceTimer(cueStatusText());
}
function restPreviewMarkup(t,x,st){
 const changed=focusRun?.restFrom&&focusRun.restFrom!==t.id,check=equipmentCheck(t,sessionLevel(t)),needs=check.requirements.groups.filter(g=>!g.anyOf.includes('floor')).map(g=>g.description);
 return `<section class="rest-preview" aria-label="Next exercise preview"><div class="rest-preview-top"><span class="label">${changed?'Up next':'Next set'}</span>${cueMuteMarkup()}</div><div class="rest-preview-main"><button type="button" class="rest-preview-art" data-ui="technique" aria-label="How to do ${esc(st[0])}">${exerciseThumbnail(t,sessionLevel(t))}<span>How to</span></button><div><h2>${esc(st[0])}</h2><p>Set ${x.values.length+1} of ${st[1]} · ${isSec(st[4])?x.goals[x.values.length]+' seconds'+(st[4].includes('each')?' per side':''):x.goals[x.values.length]+(String(st[4]).startsWith('rounds')?' rounds':' reps')+(st[4].includes('each')?' per side':'')}</p><p class="rest-preview-gear">${needs.length?'Have ready: '+esc(needs.join(' and ')):'Floor space · No extra equipment'}</p></div></div>${!check.compatible?'<p class="rest-preview-note">Check your equipment before starting this saved exercise.</p>':''}${isSec(st[4])?'<p class="rest-preview-note">When rest ends, review the exercise and tap Start. The hold waits for you.</p>':''}</section>`;
}
document.addEventListener('click',e=>{if(!e.target.closest('[data-cue-mute]'))return;cuePrefs.muted=!cuePrefs.muted;saveCuePreferences();});
document.addEventListener('change',e=>{const input=e.target.closest('[data-cue-setting]');if(!input||!['sound','vibration'].includes(input.dataset.cueSetting))return;cuePrefs[input.dataset.cueSetting]=input.checked;saveCuePreferences();});
if(typeof module!=='undefined'&&module.exports)module.exports=LadderCueSettings;
