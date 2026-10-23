const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',pretendToBeVisual:true,beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,prefs:{setupDone:true},log:[]}));}}),w=dom.window,d=w.document;
const pause=()=>new Promise(r=>setTimeout(r,15));
(async()=>{try{
 await pause();w.innerWidth=390;w.innerHeight=844;const calls=[];w.scrollBy=(x,y)=>calls.push(y);
 const button=d.querySelector('#focusPrimary'),nav=d.querySelector('nav');button.getBoundingClientRect=()=>({top:650,bottom:700});nav.getBoundingClientRect=()=>({top:600,width:390});
 button.focus();await pause();assert.equal(calls.at(-1),112);console.log('PASS keyboard focus reveals the entire workout action above bottom navigation');
 button.blur();calls.length=0;nav.getBoundingClientRect=()=>({top:0,width:100});button.getBoundingClientRect=()=>({top:650,bottom:700});button.focus();await pause();assert.equal(calls.length,0);console.log('PASS side navigation does not cause a spurious vertical scroll');
}finally{w.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
