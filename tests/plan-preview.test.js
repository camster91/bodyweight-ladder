const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function boot(previous){return new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};if(previous)w.localStorage.setItem('bwl-state',JSON.stringify(previous));}});}
const windows=[];
try{
 for(const level of ['new','some','strong']){
  const dom=boot(),w=dom.window;windows.push(w);
  w.eval(`setupDraft={groups:new Set(['Strength','Tendon','Weights']),gear:new Set(),level:'${level}'};setupStage=4;tab='setup';setupWanted=true;render();`);
  const d=w.document,preview=d.querySelector('.onboard-plan');assert(preview&&!preview.open);
  const rows=[...d.querySelectorAll('[data-preview-track]')];assert(rows.length>0);assert.equal(rows.length,w.eval('setupAvailableCount()'));
  assert(!d.querySelector('[data-preview-track="pull"], [data-preview-track="hang"], [data-preview-track="carry"], [data-preview-track="swing"]'));
  const stored=w.localStorage.getItem('bwl-state');preview.open=true;rows[0].open=true;rows[0].querySelector('.plan-progression').open=true;
  assert.equal(w.localStorage.getItem('bwl-state'),stored);
  const starts=rows.map(el=>({id:el.dataset.previewTrack,lvl:+el.dataset.previewStep}));
  d.querySelector('[data-ui="finish"]').click();
  for(const {id,lvl}of starts){assert.equal(w.eval(`lvlOf(findTrack('${id}'))`),lvl);assert(!w.eval(`isHidden('${id}')`));}
  assert.equal(w.eval('state.log.length'),0);
  console.log(`PASS ${level} preview matches committed starting steps, respects equipment, and browsing records nothing`);
 }
 const dom=boot({v:2,log:[{ts:Date.now()-864e5,t:'push',k:'push:archer-push-up',sets:[6,6,6]}],levels:{push:'push:archer-push-up'},prefs:{setupDone:true}}),w=dom.window;windows.push(w);
 w.eval(`setupDraft={groups:new Set(['Strength','Weights']),gear:new Set(['bar','weights']),level:'new'};setupStage=4;tab='setup';setupWanted=true;render();`);
 assert.equal(w.document.querySelector('[data-preview-track="push"]').dataset.previewStep,'5');
 assert(w.document.querySelector('[data-preview-track="pull"]'));assert(w.document.querySelector('[data-preview-track="carry"]'));
 const saved=w.localStorage.getItem('bwl-state');w.document.querySelector('.onboard-plan').open=true;w.document.querySelector('[data-ui="skip"]').click();assert.equal(w.localStorage.getItem('bwl-state'),saved);
 console.log('PASS repeat setup previews logged levels accurately and cancelling preserves the saved plan');
}finally{windows.forEach(w=>w.close());}
process.exit(0);
