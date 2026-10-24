const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const html=read('index.html'),source=read('ui/journey-session.css').trimEnd();
const next=html.replace(/\/\* LADDER_JOURNEY_CSS_START \*\/[\s\S]*?\/\* LADDER_JOURNEY_CSS_END \*\//,()=> '/* LADDER_JOURNEY_CSS_START */\n'+source+'\n/* LADDER_JOURNEY_CSS_END */');
if(next===html&&!html.includes('LADDER_JOURNEY_CSS_START'))throw Error('Missing journey CSS markers');
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-journey-css.cjs');console.log('Journey CSS matches served HTML');}else fs.writeFileSync(path.join(root,'index.html'),next);
