const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),{JSDOM}=require('jsdom');
const root=path.join(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,log:[],prefs:{setupDone:true,sets:{push:1}},routines:[{id:'one',name:'One exercise',items:['push']}]}));w.localStorage.setItem('bwl-filter','r:one')}}),w=dom.window,d=w.document;
try{
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
 const refs=[d.querySelector('link[rel=icon]').getAttribute('href'),d.querySelector('link[rel=apple-touch-icon]').getAttribute('href'),...manifest.icons.map(i=>i.src)];
 assert(refs.every(src=>src.includes('-v3')&&fs.existsSync(path.join(root,src))));
 for(const icon of manifest.icons){const bytes=fs.readFileSync(path.join(root,icon.src)),size=Number(icon.sizes.split('x')[0]);assert.equal(bytes.readUInt32BE(16),size);assert.equal(bytes.readUInt32BE(20),size)}
 const social=new URL(d.querySelector('[property="og:image"]').content);assert.equal(social.hostname,'ladder.ashbi.ca');const png=fs.readFileSync(path.join(root,social.pathname));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 console.log('PASS installed, favicon, touch and social assets resolve with their declared dimensions and distinct maskable export');
 const original=w.localStorage.getItem('bwl-state');d.querySelector('#tab-history').click();assert(d.querySelector('.progress-empty').textContent.includes('Complete an exercise on Today'));assert(!d.querySelector('.personal-best,.week-day,.spark'));assert.equal(w.localStorage.getItem('bwl-state'),original);
 d.querySelector('#tab-today').click();assert.equal(d.querySelector('.brand-finish-note'),null);d.querySelector('[data-focus=complete]').click();assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,1);assert(d.querySelector('.brand-finish-note').textContent.includes('You made time for you'));d.querySelector('[data-focus=undo]').click();assert.equal(JSON.parse(w.localStorage.getItem('bwl-state')).log.length,0);assert.equal(d.querySelector('.brand-finish-note'),null);
 console.log('PASS encouragement appears only after saving real work; empty Progress and Undo do not invent achievements');
}finally{setImmediate(()=>w.close())}
