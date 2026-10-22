const assert=require('node:assert/strict'),fs=require('fs'),path=require('path');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),windows=[];
async function boot(seed,url='https://ladder.test/?onboarding=1&ref=preview',draft){const dom=new JSDOM(html,{runScripts:'dangerously',url,pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};if(seed)w.localStorage.setItem('bwl-state',JSON.stringify(seed));if(draft)w.localStorage.setItem('bwl-onboarding',JSON.stringify(draft));}});windows.push(dom.window);await new Promise(r=>setTimeout(r,10));return dom.window;}
const click=(w,s)=>w.document.querySelector(s).click();
(async()=>{try{
 const seed={v:2,log:[{ts:Date.now()-864e5,t:'push',k:'push:archer-push-up',sets:[6,6,6]}],levels:{push:'push:archer-push-up'},prefs:{setupDone:true}};
 let w=await boot(seed);assert.equal(w.document.querySelector('.onboard').dataset.step,'0');assert(w.document.querySelector('#setupTitle').textContent.includes('One set'));assert(!new URL(w.location.href).searchParams.has('onboarding'));assert.equal(new URL(w.location.href).searchParams.get('ref'),'preview');const before=w.localStorage.getItem('bwl-state');click(w,'[data-ui=skip]');assert.equal(w.localStorage.getItem('bwl-state'),before);assert(w.document.querySelector('#focusPrimary'));
 console.log('PASS introduction link opens the welcome for existing users and Cancel preserves their progress');
 w=await boot(seed,'https://ladder.test/');assert.equal(w.document.querySelector('.onboard'),null);assert(w.document.querySelector('#focusPrimary'));
 console.log('PASS ordinary visits still open Today without forcing existing users through onboarding');
 w=await boot(null,undefined,{v:1,stage:3,groups:['Strength'],gear:['bar'],level:'new'});assert.equal(w.document.querySelector('.onboard').dataset.step,'0');click(w,'[data-ui=onext]');assert.equal(w.document.querySelector('[data-v=Strength]').getAttribute('aria-pressed'),'true');click(w,'[data-ui=onext]');assert.equal(w.document.querySelector('[data-v=bar]').getAttribute('aria-pressed'),'true');
 console.log('PASS introduction link also opens the welcome while retaining unfinished answers');
}finally{windows.forEach(w=>w.close());}process.exit(0);})().catch(e=>{console.error(e);process.exit(1)});
