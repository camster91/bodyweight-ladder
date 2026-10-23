/* Ladder Controls 1.0. Native inputs retain platform semantics; composite controls require bind(). */
(function(global){
 'use strict';
 const bindings=new WeakMap(),busy=new WeakMap(),openers=new WeakMap(),dialogs=new Set();let sequence=0;
 const emit=(el,detail)=>el.dispatchEvent(new CustomEvent('lui:change',{bubbles:true,detail}));
 function updateStepper(group){const i=group.querySelector('input[type=number]');if(!i)return;const v=i.valueAsNumber;group.querySelectorAll('[data-lui-step]').forEach(b=>{b.disabled=i.disabled||(b.dataset.luiStep==='down'&&i.min!==''&&v<=+i.min)||(b.dataset.luiStep==='up'&&i.max!==''&&v>=+i.max);});}
 function activateTab(tab){const group=tab.closest('[data-lui-tabs]');if(!group||tab.disabled)return;group.querySelectorAll('[role=tab]').forEach(b=>{const selected=b===tab;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;const panel=[...group.querySelectorAll('[role=tabpanel]')].find(p=>p.id===b.getAttribute('aria-controls'));if(panel)panel.hidden=!selected;});emit(group,{value:tab.id});}
 function openDialog(dialog,opener=document.activeElement){if(dialog.open)return;if(typeof dialog.showModal!=='function')throw new Error('Ladder dialogs require native dialog support.');openers.set(dialog,opener);dialogs.add(dialog);dialog.addEventListener('close',()=>{dialogs.delete(dialog);document.body.classList.toggle('lui-dialog-open',dialogs.size>0);const target=openers.get(dialog);if(target?.isConnected)target.focus({preventScroll:true});},{once:true});dialog.showModal();document.body.classList.add('lui-dialog-open');const focusTarget=dialog.querySelector('[autofocus]')||dialog.querySelector('h2')||dialog;if(!focusTarget.matches('button,input,select,textarea,a[href],[tabindex]'))focusTarget.tabIndex=-1;focusTarget.focus({preventScroll:true});}
 function setBusy(button,value,label){if(value){if(!busy.has(button))busy.set(button,{disabled:button.disabled,nodes:[...button.childNodes]});button.disabled=true;button.setAttribute('aria-busy','true');if(label)button.textContent=label;}else{const old=busy.get(button);if(!old)return;button.disabled=old.disabled;button.removeAttribute('aria-busy');button.replaceChildren(...old.nodes);busy.delete(button);}}
 function fieldError(input,message){const field=input.closest('.lui-field');if(!field)throw new Error('fieldError requires a .lui-field container');let error=field.querySelector('[data-lui-error]');if(!error){error=document.createElement('p');error.dataset.luiError='';error.setAttribute('aria-live','polite');field.append(error);}if(!error.id){do{error.id='lui-error-'+(++sequence);}while(document.getElementById(error.id)!==error&&document.getElementById(error.id));}const ids=new Set((input.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));if(message){ids.add(error.id);input.setAttribute('aria-invalid','true');}else{ids.delete(error.id);input.removeAttribute('aria-invalid');}error.textContent=message||'';error.hidden=!message;if(ids.size)input.setAttribute('aria-describedby',[...ids].join(' '));else input.removeAttribute('aria-describedby');}
 function toast(message,{action,actionLabel='Undo'}={}){let region=document.getElementById('lui-toast-region');if(!region){region=document.createElement('div');region.id='lui-toast-region';region.className='lui lui-toast-region';region.setAttribute('role','region');region.setAttribute('aria-label','Notifications');document.body.append(region);}const item=document.createElement('div');item.className='lui-toast';const text=document.createElement('span');text.setAttribute('role','status');item.append(text);const opener=document.activeElement;const dismiss=()=>{const restore=item.contains(document.activeElement);item.remove();if(restore&&opener?.isConnected)opener.focus({preventScroll:true});};if(action){const b=document.createElement('button');b.className='lui-button';b.textContent=actionLabel;b.onclick=()=>{dismiss();action();};item.append(b);}const close=document.createElement('button');close.className='lui-button';close.textContent='Dismiss';close.onclick=dismiss;item.append(close);region.replaceChildren(item);text.textContent=message;return dismiss;}
 function refresh(root=document){root.querySelectorAll('[data-lui-stepper]').forEach(updateStepper);root.querySelectorAll('[data-lui-output]').forEach(updateOutput);}
 function updateOutput(input){const output=document.getElementById(input.dataset.luiOutput);if(output)output.textContent=input.value+(input.dataset.luiUnit?' '+input.dataset.luiUnit:'');}
 function bind(root=document){if(bindings.has(root))return bindings.get(root);
  refresh(root);
  const click=e=>{if(e.target.closest('.lui-button[aria-disabled="true"]')){e.preventDefault();return;}const button=e.target.closest('button');if(!button||button.disabled||button.getAttribute('aria-disabled')==='true')return;
   if(button.matches('[data-lui-choice]')){const group=button.closest('[data-lui-choices]');if(group){if(group.dataset.luiChoices==='multiple')button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'));else group.querySelectorAll('[data-lui-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));emit(group,{value:button.dataset.value,selected:button.getAttribute('aria-pressed')==='true'});}}
   if(button.matches('[data-lui-step]')){const group=button.closest('[data-lui-stepper]'),input=group?.querySelector('input[type=number]');if(input&&!input.disabled){if(!Number.isFinite(input.valueAsNumber))input.value=input.min||'0';button.dataset.luiStep==='up'?input.stepUp():input.stepDown();input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));updateStepper(group);}}
   if(button.matches('[role=tab]')&&button.closest('[data-lui-tabs]'))activateTab(button);
   if(button.dataset.luiDialog){const d=document.getElementById(button.dataset.luiDialog);if(d)openDialog(d,button);}
   if(button.hasAttribute('data-lui-close'))button.closest('dialog')?.close();
  };
  const key=e=>{const tab=e.target.closest('[role=tab]'),group=tab?.closest('[data-lui-tabs]');if(!group)return;const vertical=tab.closest('[role=tablist]')?.getAttribute('aria-orientation')==='vertical',keys=vertical?['ArrowUp','ArrowDown']:['ArrowLeft','ArrowRight'];if(![...keys,'Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...group.querySelectorAll('[role=tab]')].filter(b=>!b.disabled),index=tabs.indexOf(tab);const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key===keys[1]?1:-1)+tabs.length)%tabs.length;tabs[next]?.focus();activateTab(tabs[next]);};
  const input=e=>{const group=e.target.closest('[data-lui-stepper]');if(group)updateStepper(group);if(e.target.matches('[data-lui-output]'))updateOutput(e.target);};
  root.addEventListener('click',click);root.addEventListener('keydown',key);root.addEventListener('input',input);root.addEventListener('change',input);
  const dispose=()=>{root.removeEventListener('click',click);root.removeEventListener('keydown',key);root.removeEventListener('input',input);root.removeEventListener('change',input);bindings.delete(root);};bindings.set(root,dispose);return dispose;
 }
function applyAppControls(root=document){
 for(const button of root.querySelectorAll('button')){
  if(button.matches('.lui-button,.lui-tab'))continue;
  let role='secondary';
  if(button.closest('nav'))role='navigation';
  else if(button.id==='syncDot')role='status';
  else if(button.matches('.primary'))role='primary';
  else if(button.matches('.danger,.xdel'))role='destructive';
  else if(button.matches('.appearance-toggle,[data-ui="techniqueclose"],[data-ui="workouttoolsclose"]')||button.closest('.preferences-head,.workout-tools-head,.photo-credits header'))role='icon';
  else if(button.matches('.focus-stepper')||button.closest('.pm,.mini-step'))role='stepper';
  else if(button.matches('.onboard-choice'))role='selection';
  else if(button.closest('.seg,.readiness-options,.effort-options,.appearance-options,.lui-choice'))role='choice';
  else if(button.matches('.exrow,.mini,.opt'))role='row';
  else if(button.matches('.focus-link,.focus-howto,.tool-action,.tool-back,.photo-credit-link,.onboard-back,.onboard-skip,.erow'))role='quiet';
  button.dataset.control=role;
  if(role==='choice'){
   const group=button.closest('.seg,.readiness-options,.effort-options,.appearance-options,.lui-choice');
   if(group){group.classList.add('lui','lui-choice');group.classList.remove('seg');group.dataset.luiManaged='app';button.classList.add('lui-button');}
  }
  if(role==='icon'&&button.closest('.preferences-head,.workout-tools-head,.photo-credits header')){
   button.classList.add('lui-button');button.dataset.icon='';button.parentElement.classList.add('lui');
   if(!button.querySelector('svg')&&['×','✕'].includes(button.textContent.trim()))button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  }
 }
}
 global.LadderControls={version:'1.0.1',bind,refresh,openDialog,setBusy,fieldError,toast,applyAppControls};
})(window);
