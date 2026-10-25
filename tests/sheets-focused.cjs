// Isolated sheet rendering and form checks. No app boot or user data.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8'),equipment=require('../ui/equipment.js'),planning=require('../ui/journey-summary.js').planningExplanationView;
const esc=s=>String(s).replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
function base(){const dom=new JSDOM('<main id="view"></main>');const w=dom.window;w.HTMLDialogElement.prototype.showModal=function(){this.setAttribute('open','');};w.HTMLDialogElement.prototype.close=function(){this.removeAttribute('open');this.dispatchEvent(new w.Event('close'));};return {dom,w};}
let checks=0;function check(name,fn){fn();checks++;console.log('PASS '+name);}
function equipmentSheet(reason){const f=base(),c={document:f.w.document,LadderEquipment:equipment,state:{prefs:{equipment:{floor:true,wall:true,chair:false,bar:false,bench:true,mat:null}}},focusRun:{phase:'paused'},esc,applyComponentSystem(){},canAdjustReadiness:()=>false,commit(){c.saved=true;},render(){}};vm.createContext(c);vm.runInContext(fs.readFileSync('ui/equipment-preferences.js','utf8'),c);c.openEquipmentPreferences(null,reason);return {...f,c};}
check('Equipment starts with five common fields and keeps all 24 choices',()=>{
 const f=equipmentSheet(),d=f.w.document.querySelector('#equipmentPreferences');assert.equal(d.querySelector('details').open,false);assert.equal(d.querySelector('form>fieldset').querySelectorAll('select').length,5);const inputs=[...d.querySelectorAll('[data-equipment-key]')];assert.equal(inputs.length,24);assert.equal(new Set(inputs.map(i=>i.dataset.equipmentKey)).size,24);assert.deepEqual(inputs.map(i=>i.dataset.equipmentKey).sort(),Object.keys(equipment.CAPABILITIES).sort());f.w.close();
});
check('Saving common equipment preserves hidden support values and unknowns',()=>{
 const f=equipmentSheet(),d=f.w.document.querySelector('#equipmentPreferences');d.querySelector('#equipment-floor').value='false';d.querySelector('form').dispatchEvent(new f.w.Event('submit',{bubbles:true,cancelable:true}));assert(f.c.saved);assert.equal(f.c.state.prefs.equipment.floor,false);assert.equal(f.c.state.prefs.equipment.bench,true);assert.equal(f.c.state.prefs.equipment.bar,false);assert.equal(f.c.state.prefs.equipment.mat,null);assert.equal(f.c.focusRun.phase,'paused');f.w.close();
});
check('An equipment blocker opens the extra supports and cancel keeps preferences',()=>{
 const f=equipmentSheet({title:'A support is needed',message:'Confirm your row support.'}),before=JSON.stringify(f.c.state.prefs.equipment),d=f.w.document.querySelector('#equipmentPreferences');assert(d.querySelector('details').open);d.querySelector('#equipment-table').value='true';d.querySelector('[data-equipment-close]').click();assert.equal(JSON.stringify(f.c.state.prefs.equipment),before);assert.equal(f.c.saved,undefined);f.w.close();
});
function planSheet(canUpdate){const f=base(),report={version:1,summary:'Based on your saved choices.',selected:[{id:'push',reason:'Selected using your saved training history.'}],duration:{estimatedMinutes:6,budgetMinutes:10,explanation:'Only equipment-compatible movements are selected.'},equipmentExcluded:2};
 const c={document:f.w.document,planSummaryOpen:true,tab:'today',state:{prefs:{coach:{}}},LadderCoach:{VERSION:1,prefs:()=>({goal:'balanced',days:3})},coachingWeekDays:()=>4,focusRun:{items:[{id:'push'}],coaching:report},plannedMinutes:()=>6,coachGoalName:()=> 'Balanced',findTrack:()=>({id:'push'}),sessionSpec:()=>['Push-up'],esc,planningExplanationView:planning,minutes:10,canAdjustReadiness:()=>canUpdate,applyComponentSystem(){},$:s=>f.w.document.querySelector(s)};vm.createContext(c);vm.runInContext(html.slice(html.indexOf('function mountPlanSummary(){'),html.indexOf('function pendingWorkoutView(){')),c);c.mountPlanSummary();return {...f,c};}
check('Plan leads with goals and keeps the detailed reasoning closed but available',()=>{
 const f=planSheet(false),d=f.w.document.querySelector('#planSummary');assert.equal(d.querySelector('.plan-rationale').open,false);assert.match(d.querySelector('.plan-rationale').textContent,/equipment-compatible/);assert.match(d.querySelector('.plan-rationale').textContent,/2 movements need/);assert.match(d.querySelector('.plan-week-summary').textContent,/4 days trained/);assert.match(d.querySelector('.plan-week-summary').textContent,/goal met/);assert.equal(d.querySelectorAll('#coachDays option').length,7);assert.match(d.querySelector('#planPreferenceNote').textContent,/next workout/);assert(d.querySelector('.plan-done[data-ui="planclose"]'));f.w.close();
});
check('Plan states when choices update the unstarted workout',()=>{const f=planSheet(true);assert.match(f.w.document.querySelector('#planPreferenceNote').textContent,/Updates this workout before your first set/);f.w.close();});
console.log(checks+' focused sheet checks passed.');
if(process.argv.includes('--preview')){
 const styles=[...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m=>m[1]).join('\n');
 for(const [name,render]of [['plan',()=>planSheet(false)],['equipment',()=>equipmentSheet()]]){
  const f=render(),markup=f.w.document.querySelector('dialog').outerHTML;
  fs.writeFileSync('docs/_review-'+name+'.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+name+' component preview</title><style>'+styles+'\nbody{padding:16px;box-sizing:border-box}.preview-note{font:12px system-ui;color:var(--muted);text-align:center}body dialog[open]{position:relative;inset:auto;margin:16px auto;max-height:calc(100dvh - 64px);box-sizing:border-box}</style><body data-view="today"><p class="preview-note">Component preview · synthetic data · '+name+'</p>'+markup+'</body></html>');f.w.close();
 }
 console.log('Local component previews: http://127.0.0.1:4211/docs/_review-plan.html and http://127.0.0.1:4211/docs/_review-equipment.html');
}
