const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom'),cp=require('node:child_process');
const root=path.join(__dirname,'..'),components=require('../ui/components.cjs');
const dom=new JSDOM('<!doctype html><body class="lui">'+components.map(c=>c.html).join('')+'</body>',{runScripts:'outside-only',url:'https://controls.test/'}),w=dom.window,d=w.document;
w.eval(fs.readFileSync(path.join(root,'ui/controls.js'),'utf8'));const ui=w.LadderControls,dispose=ui.bind(d),click=s=>{const el=d.querySelector(s);el.focus();el.click();};
try{
 assert.equal(ui.bind(d),dispose);click('[data-value=light]');assert.equal(d.querySelector('[data-value=light]').getAttribute('aria-pressed'),'true');assert.equal(d.querySelector('[data-value=ready]').getAttribute('aria-pressed'),'false');dispose();click('[data-value=ready]');assert.equal(d.querySelector('[data-value=ready]').getAttribute('aria-pressed'),'false');ui.bind(d);
 console.log('PASS binding is idempotent, disposable and single choices remain exclusive');
 const choice=d.querySelector('[data-lui-choices]');choice.dataset.luiChoices='multiple';click('[data-value=ready]');assert.equal(d.querySelector('[data-value=ready]').getAttribute('aria-pressed'),'true');assert.equal(d.querySelector('[data-value=light]').getAttribute('aria-pressed'),'true');
 console.log('PASS multiple choices independently expose their selected state');
 const input=d.querySelector('#example-sets');input.value='6';input.dispatchEvent(new w.Event('input',{bubbles:true}));assert(d.querySelector('[data-lui-step=up]').disabled);click('[data-lui-step=down]');assert.equal(input.value,'5');input.value='1';input.dispatchEvent(new w.Event('change',{bubbles:true}));assert(d.querySelector('[data-lui-step=down]').disabled);
 console.log('PASS steppers enforce native bounds and refresh buttons after manual edits');
 const tab=d.querySelector('#tab-overview');tab.focus();tab.dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));assert.equal(d.activeElement.id,'tab-history');assert(d.querySelector('#panel-overview').hidden);assert(!d.querySelector('#panel-history').hidden);
 console.log('PASS keyboard tabs update focus, selection and associated panel visibility');
 const b=d.createElement('button'),child=d.createElement('span');child.textContent='Save';let clicked=0;child.addEventListener('click',()=>clicked++);b.append(child);d.body.append(b);ui.setBusy(b,true,'Saving');assert(b.disabled);ui.setBusy(b,false);assert(!b.disabled);assert.equal(b.firstChild,child);child.click();assert.equal(clicked,1);b.disabled=true;ui.setBusy(b,true);ui.setBusy(b,false);assert(b.disabled);
 console.log('PASS loading restores original nodes, child listeners and original disabled state');
 const name=d.querySelector('#example-name');ui.fieldError(name,'Enter a name');assert.equal(name.getAttribute('aria-invalid'),'true');assert(name.getAttribute('aria-describedby').includes('name-hint'));assert(name.getAttribute('aria-describedby').includes('lui-error-'));ui.fieldError(name,'');assert.equal(name.getAttribute('aria-describedby'),'name-hint');assert(!name.hasAttribute('aria-invalid'));
 console.log('PASS field errors preserve hint associations and clear recoverably');
 const range=d.querySelector('#example-range');range.value='90';range.dispatchEvent(new w.Event('input',{bubbles:true}));assert.equal(d.querySelector('#range-value').textContent,'90 seconds');
 console.log('PASS linked native range outputs update without app-specific handlers');
 let undone=0;ui.toast('<img src=x onerror=alert(1)>',{action:()=>undone++});assert(!d.querySelector('.lui-toast img'));assert(d.querySelector('.lui-toast').textContent.includes('<img'));click('.lui-toast button');assert.equal(undone,1);assert(!d.querySelector('.lui-toast'));
 console.log('PASS notifications treat messages as text and execute Undo once');
 const dialog=d.querySelector('#dialog-example'),opener=d.querySelector('[data-lui-dialog=dialog-example]');dialog.showModal=()=>dialog.setAttribute('open','');dialog.close=()=>{dialog.removeAttribute('open');dialog.dispatchEvent(new w.Event('close'));};ui.openDialog(dialog,opener);assert(d.body.classList.contains('lui-dialog-open'));click('#dialog-example [data-lui-close]');assert(!d.body.classList.contains('lui-dialog-open'));assert.equal(d.activeElement,opener);
 console.log('PASS dialog lifecycle locks scrolling and restores its connected opener');
 cp.execFileSync(process.execPath,[path.join(root,'scripts/sync-controls.cjs'),'--check']);cp.execFileSync(process.execPath,[path.join(root,'scripts/build-controls-docs.cjs'),'--check']);assert.equal(components.length,25);assert.equal(new Set(components.map(c=>c.id)).size,25);assert(components.every(c=>fs.existsSync(path.join(root,'docs/controls',c.id+'.md'))));
 console.log('PASS inline app sources stay synchronized and every portable component has documentation');
}finally{w.close();}
