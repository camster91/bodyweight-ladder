// Maintenance only: production serves the dependency-free, embedded module.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/equipment.js').trimEnd(),original=read('index.html');
const start='/* LADDER_EQUIPMENT_START */',end='/* LADDER_EQUIPMENT_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing equipment markers');
const next=original.replace(/\/\* LADDER_EQUIPMENT_START \*\/[\s\S]*?\/\* LADDER_EQUIPMENT_END \*\//,start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Embedded equipment module differs; run node scripts/sync-equipment.cjs');console.log('Embedded equipment module matches source');}else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded equipment module synchronized');}
