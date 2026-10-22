const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('fs'),path=require('path');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),{
 runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,
 beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,log:[],prefs:{setupDone:true}}));}
});
const w=dom.window,d=w.document;
const click=s=>{assert(d.querySelector(s),s);d.querySelector(s).click();};
try{
 assert(!d.querySelector('.card.first .technique').open);
 assert(d.querySelector('.card.first h2').textContent);
 console.log('PASS exercise title and logging controls precede collapsed technique');
 const id=d.querySelector('.card.first').id.slice(5);
 const inp=d.querySelector(`#in-${id}-0`);inp.value='7';inp.dispatchEvent(new w.Event('input',{bubbles:true}));
 click(`[data-act=complete][data-t=${id}][data-i="0"]`);
 assert.equal(d.querySelector(`#in-${id}-0`).value,'7');
 assert.equal(d.querySelector(`[data-act=complete][data-t=${id}][data-i="0"]`).getAttribute('aria-pressed'),'true');
 assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,0);
 assert(d.querySelector('.card.first .set-progress').textContent.includes('1 of 3'));
 console.log('PASS marking a set preserves edited reps without writing a history entry');
 const next=d.querySelector('.session-queue .mini').dataset.t;
 click(`.session-queue .mini[data-t=${next}]`);
 assert.equal(d.querySelector('.card.first').id,'card-'+next);
 click(`.session-queue .mini[data-t=${id}]`);
 assert.equal(d.querySelector(`#in-${id}-0`).value,'7');
 console.log('PASS session queue swaps the active exercise and preserves in-progress values');
 click(`[data-act=save][data-t=${id}]`);
 assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,1);
 click('#toastUndo');
 assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,0);
 assert.equal(d.querySelector(`#in-${id}-0`).value,'7');
 console.log('PASS Save exercise writes once and Undo restores the recorded values');
 click(`[data-act=rest][data-t=${id}]`);
 assert(!d.querySelector('#timer').hidden);
 click('#timer [data-tm=stop]');
 assert(d.querySelector('#timer').hidden);
 console.log('PASS rest timer starts and can be dismissed');
 click('#tab-ladders');
 assert(!d.querySelector('.custom-exercise').open);
 assert(d.querySelector('#addForm'));
 console.log('PASS custom exercise creation remains available behind a labeled disclosure');
}finally{dom.window.close();}
process.exit(0);
