const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}});
const d=dom.window.document;
const search=q=>{const input=d.querySelector('#exSearch');input.value=q;input.focus();input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));return input;};
try{
 d.querySelector('#tab-ladders').click();const input=search('archer');
 assert.equal(d.activeElement,input);assert.equal(d.querySelector('#exSearchStatus').textContent,'3 ladders found');assert.equal(d.querySelector('#exSearchStatus').getAttribute('role'),'status');
 assert(d.querySelector('[data-search-track="pull"]').textContent.includes('Archer pull-up'));assert(!d.querySelector('[data-search-track="pull"]').hidden);
 console.log('PASS search preserves typing focus and announces results with matching variation names');
 const row=()=>d.querySelector('[data-ui="ex"][data-t="pull"]');row().click();assert.equal(d.activeElement,row());assert.equal(row().getAttribute('aria-expanded'),'true');assert.equal(d.querySelectorAll('.exopen li.search-match').length,1);assert.equal(d.querySelector('.search-match').dataset.stepName,'Archer pull-up');row().click();assert.equal(d.activeElement,row());assert.equal(row().getAttribute('aria-expanded'),'false');
 console.log('PASS exercise expansion preserves keyboard focus and marks the matching ladder step');
 search('zzz-no-match');assert(!d.querySelector('#exNone').hidden);d.querySelector('[data-ui="clearsearch"]').click();assert.equal(d.querySelector('#exSearch').value,'');assert.equal(d.activeElement,d.querySelector('#exSearch'));assert(d.querySelector('#exNone').hidden);assert(d.querySelector('#exSearchStatus').hidden);assert([...d.querySelectorAll('[data-sr]')].every(el=>!el.hidden));assert([...d.querySelectorAll('[data-search-track]')].every(el=>el.hidden));
 console.log('PASS empty search can reset all results without navigation or stale match hints');
 search('<img src=x onerror=alert(1)>');assert(!d.querySelector('#exNone').hidden);assert(!d.querySelector('#exSearchStatus img'));assert.equal(JSON.parse(dom.window.localStorage.getItem('bwl-state')).log.length,0);
 console.log('PASS search handles markup safely and does not change saved training history');
}finally{setImmediate(()=>dom.window.close());}
