// Maintenance only: production serves the embedded, dependency-free journey views.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/journey-summary.js').trimEnd(),original=read('index.html');
const start='/* LADDER_JOURNEY_START */',end='/* LADDER_JOURNEY_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing journey markers');
const next=original.replace(/\/\* LADDER_JOURNEY_START \*\/[\s\S]*?\/\* LADDER_JOURNEY_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Embedded journey views differ; run node scripts/sync-journey.cjs');console.log('Embedded journey views match source');}
else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded journey views synchronized');}
