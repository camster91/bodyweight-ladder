// Maintenance only: production serves the already-embedded, dependency-free engine.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/coaching-engine.js').trimEnd(),original=read('index.html');
const start='/* LADDER_COACH_START */',end='/* LADDER_COACH_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing coaching markers');
const next=original.replace(/\/\* LADDER_COACH_START \*\/[\s\S]*?\/\* LADDER_COACH_END \*\//,start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Embedded coaching engine differs; run node scripts/sync-coaching.cjs');console.log('Embedded coaching engine matches source');}else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded coaching engine synchronized');}
