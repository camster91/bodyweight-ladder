const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),windows=[];
function boot(log,extra={}){const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log,...extra}));}});windows.push(dom.window);return dom.window;}
try{
 let w=boot([{ts:Date.now()-1000,t:'push',k:'push:push-up',sets:[8,7,6]}]);const original=w.localStorage.getItem('bwl-state');w.document.querySelector('#tab-history').click();let d=w.document;assert.equal(d.querySelector('.recent-exercise strong').textContent,'Push-up');assert.equal(d.querySelector('[data-latest-values]').textContent,'8 · 7 · 6 reps');assert(d.querySelector('.recent-exercise img'));assert.equal(w.localStorage.getItem('bwl-state'),original);
 console.log('PASS recent training exposes the actual latest exercise, photo and recorded values without a data mutation');
 w=boot([{ts:Date.now()-1000,t:'core',k:'core:side-plank',sets:[15,16]}]);w.document.querySelector('#tab-history').click();assert.equal(w.document.querySelector('[data-latest-values]').textContent,'15 · 16 sec per side');
 console.log('PASS latest-result preview preserves seconds and per-side units');
 w=boot([{ts:Date.now()-3000,t:'push',k:'push:push-up',sets:[5,5,5]},{ts:Date.now()-1000,t:'core',k:'core:plank',sets:[20,21,22]}],{levels:{core:'core:side-plank'}});w.document.querySelector('#tab-history').click();d=w.document;assert.equal(d.querySelector('.recent-exercise strong').textContent,'Plank');assert.equal(d.querySelector('[data-latest-values]').textContent,'20 · 21 · 22 sec');assert(!d.querySelector('.recent-exercise img').getAttribute('src').includes('side-plank'));
 console.log('PASS latest preview follows the logged step and timestamp rather than the currently selected variation');
 w=boot([{ts:Date.now()-1000,t:'removed-custom',k:'removed-custom:old',sets:[1]}]);w.document.querySelector('#tab-history').click();assert(!w.document.querySelector('.recent-exercise'));assert(w.document.querySelector('.training-day'));
 w=boot([]);w.document.querySelector('#tab-history').click();assert(!w.document.querySelector('.recent-exercise'));assert(w.document.querySelector('.progress-empty'));
 console.log('PASS removed exercises and empty history do not produce invented preview results');
}finally{setImmediate(()=>windows.forEach(w=>w.close()));}
