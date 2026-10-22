// Development maintenance only. The committed index.html remains ready to serve.
const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8').replace(/\r\n/g,'\n');
let html=read('index.html');
const sources={CSS:read('ui/controls.css')+'\n'+read('ui/app-foundation.css'),JS:read('ui/controls.js')};
for(const [kind,source] of Object.entries(sources)){const start=`/* LADDER_CONTROLS_${kind}_START */`,end=`/* LADDER_CONTROLS_${kind}_END */`;if(!html.includes(start)||!html.includes(end))throw new Error('Missing inline controls markers');html=html.replace(new RegExp('/\\* LADDER_CONTROLS_'+kind+'_START \\*/[\\s\\S]*?/\\* LADDER_CONTROLS_'+kind+'_END \\*/'),start+'\n'+source.trimEnd()+'\n'+end);}
if(process.argv.includes('--check')){if(html!==read('index.html')){console.error('Inline controls differ from ui/ sources. Run node scripts/sync-controls.cjs');process.exit(1);}console.log('Inline controls match reusable sources');}else{fs.writeFileSync(path.join(root,'index.html'),html);console.log('Synchronized inline controls; no runtime build required');}
