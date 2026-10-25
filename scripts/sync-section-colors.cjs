const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const html=read('index.html'),start='/* LADDER_SECTION_COLORS_START */',end='/* LADDER_SECTION_COLORS_END */';if(!html.includes(start)||!html.includes(end))throw Error('Missing section color markers');
const a=html.indexOf(start),b=html.indexOf(end,a),next=html.slice(0,a)+start+'\n'+read('ui/section-colors.css').trimEnd()+'\n'+html.slice(b);
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-section-colors.cjs');console.log('Section colors match served HTML');}else fs.writeFileSync(path.join(root,'index.html'),next);
