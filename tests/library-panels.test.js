const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true,hidden:{pull:true}},log:[]}));}});
const d=dom.window.document,click=s=>{d.querySelector(s).focus();d.querySelector(s).click();};
try{
 click('#tab-ladders');click('[data-ui="ex"][data-t="push"]');
 assert(d.querySelector('.library-current h3').textContent.includes('Push-up'));assert(!d.querySelector('.exopen .ctl'));
 click('[data-panel="settings-push"]');const inc=()=>d.querySelector('#librarySheet [data-act="setsInc"]');inc().focus();inc().click();assert.equal(d.activeElement,inc());assert.equal(d.querySelector('#librarySheet .mini-step b').textContent,'4');
 click('[data-ui="libraryclose"]');assert.equal(d.activeElement,d.querySelector('[data-panel="settings-push"]'));assert(!d.body.classList.contains('library-sheet-open'));
 console.log('PASS current step precedes settings and settings preserve focus after changes and dismissal');
 click('[data-panel="hidden"]');click('#librarySheet [data-act="show"]');assert(!d.querySelector('#librarySheet'));assert.equal(d.activeElement,d.querySelector('[data-ui="ex"][data-t="pull"]'));assert(!d.body.classList.contains('library-sheet-open'));
 console.log('PASS restoring final hidden exercise closes management and focuses the restored row');
 click('[data-panel="guide-push"]');assert(d.querySelector('#librarySheet .technique-cue'));assert(d.querySelector('#librarySheet img'));click('[data-ui="libraryclose"]');
 console.log('PASS current technique opens directly with its corresponding photo');
 click('[data-panel="custom"]');d.querySelector('#cName').value='Test stretch';d.querySelector('#cType').value='sec';d.querySelector('#addForm').dispatchEvent(new dom.window.Event('submit',{bubbles:true,cancelable:true}));assert(!d.querySelector('#librarySheet'));const custom=JSON.parse(dom.window.localStorage.getItem('bwl-state')).custom;assert.equal(custom[0].name,'Test stretch');assert.equal(custom[0].unit,'sec');assert.equal(d.activeElement,d.querySelector('[data-panel="custom"]'));
 console.log('PASS custom sheet creates a timed movement and returns to its trigger');
}finally{setImmediate(()=>dom.window.close());}
