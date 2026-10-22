const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');let scroll=0;
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){Object.defineProperty(w,'scrollY',{get:()=>scroll});w.scrollTo=(x,y)=>{scroll=typeof x==='object'?x.top:y;};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));w.localStorage.setItem('bwl-appearance','dark');}}),w=dom.window,d=w.document;
const click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click();};
try{
 assert.equal(d.documentElement.dataset.theme,'dark');const saved=w.localStorage.getItem('bwl-state');
 console.log('PASS saved appearance applies before app startup without changing training data');
 for(const tab of ['today','ladders','history']){click('#tab-'+tab);click('.appearance-toggle');assert(d.querySelector('.app-preferences[open]'));assert.equal(d.querySelectorAll('.app-preferences').length,1);click('[data-appearance="light"]');assert.equal(d.documentElement.dataset.theme,'light');assert.equal(d.querySelector('[data-appearance="light"]').getAttribute('aria-pressed'),'true');click('.preferences-head button');assert.equal(d.activeElement,d.querySelector('.appearance-toggle'));}
 assert.equal(w.localStorage.getItem('bwl-state'),saved);
 console.log('PASS all screens share appearance controls, selected state and return focus without altering workouts');
 click('.appearance-toggle');click('[data-appearance="system"]');assert(!d.documentElement.hasAttribute('data-theme'));assert.equal(w.localStorage.getItem('bwl-appearance'),'system');d.querySelector('.app-preferences').dispatchEvent(new w.Event('cancel',{cancelable:true}));assert(!d.querySelector('.app-preferences'));assert(!d.body.classList.contains('preferences-open'));
 console.log('PASS System restores device appearance and Escape dismisses the shared dialog');
 click('#tab-ladders');scroll=420;click('#tab-history');scroll=160;click('#tab-ladders');assert.equal(scroll,420);click('#tab-ladders');assert.equal(scroll,0);click('#tab-history');assert.equal(scroll,160);w.eval("go('history')");assert.equal(scroll,0);
 console.log('PASS tab navigation remembers each screen position while a repeated tab tap returns to top');
}finally{setImmediate(()=>w.close());}
