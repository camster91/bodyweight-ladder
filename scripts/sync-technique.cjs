const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),file=path.join(root,'index.html'),read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const html=read(file),source=read(path.join(root,'ui/technique-guides.js')).trimEnd();
const next=html.replace(/\/\* LADDER_TECHNIQUE_START \*\/[\s\S]*?\/\* LADDER_TECHNIQUE_END \*\//,()=> '/* LADDER_TECHNIQUE_START */\n'+source+'\n/* LADDER_TECHNIQUE_END */');
if(!html.includes('/* LADDER_TECHNIQUE_START */'))throw Error('Missing technique markers');
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-technique.cjs');console.log('Technique source matches served HTML');}else fs.writeFileSync(file,next);
