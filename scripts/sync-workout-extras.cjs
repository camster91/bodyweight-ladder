// Maintenance only: production serves the already-embedded adapter.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/workout-extras.js').trimEnd(),original=read('index.html');
const start='/* LADDER_WORKOUT_EXTRAS_START */',end='/* LADDER_WORKOUT_EXTRAS_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing workout extras markers');
const next=original.replace(/\/\* LADDER_WORKOUT_EXTRAS_START \*\/[\s\S]*?\/\* LADDER_WORKOUT_EXTRAS_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Run node scripts/sync-workout-extras.cjs');console.log('Embedded workout extras match source');}else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded workout extras synchronized');}
