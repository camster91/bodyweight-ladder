// Keep support available even if the main app script cannot boot.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const html=read(file),source=read(path.join(root,'ui/support.js')).trimEnd();
const start='/* LADDER_SUPPORT_START */',end='/* LADDER_SUPPORT_END */';
if(!html.includes(start)||!html.includes(end))throw Error('Missing support markers');
const next=html.replace(/\/\* LADDER_SUPPORT_START \*\/[\s\S]*?\/\* LADDER_SUPPORT_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-support.cjs');console.log('Support source matches served HTML');}
else fs.writeFileSync(file,next);
