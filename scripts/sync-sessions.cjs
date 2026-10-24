// Maintenance only: the static site serves the embedded, dependency-free module.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/session-engine.js').trimEnd(),original=read('index.html');
const start='/* LADDER_SESSIONS_START */',end='/* LADDER_SESSIONS_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing session markers');
const next=original.replace(/\/\* LADDER_SESSIONS_START \*\/[\s\S]*?\/\* LADDER_SESSIONS_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Embedded session engine differs; run node scripts/sync-sessions.cjs');console.log('Embedded session engine matches source');}
else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded session engine synchronized');}
