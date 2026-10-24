// Maintenance only: production serves this adapter inline.
const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/equipment-preferences.js').trimEnd(),original=read('index.html');
const start='/* LADDER_EQUIPMENT_PREFS_START */',end='/* LADDER_EQUIPMENT_PREFS_END */';
if(!original.includes(start)||!original.includes(end))throw Error('Missing equipment preferences markers');
const next=original.replace(/\/\* LADDER_EQUIPMENT_PREFS_START \*\/[\s\S]*?\/\* LADDER_EQUIPMENT_PREFS_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==original)throw Error('Run node scripts/sync-equipment-preferences.cjs');console.log('Embedded equipment preferences match source');}else{fs.writeFileSync(path.join(root,'index.html'),next);console.log('Embedded equipment preferences synchronized');}
