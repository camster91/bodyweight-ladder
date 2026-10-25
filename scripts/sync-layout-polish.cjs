const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const html=read('index.html'),start='/* LADDER_LAYOUT_POLISH_START */',end='/* LADDER_LAYOUT_POLISH_END */';
const css=start+'\n'+read('ui/layout-polish.css').trimEnd()+'\n'+end;
const a=html.indexOf(start),b=html.indexOf(end,a);
const next=a<0?html.slice(0,html.lastIndexOf('</style>'))+css+'\n'+html.slice(html.lastIndexOf('</style>')):html.slice(0,a)+css+html.slice(b+end.length);
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-layout-polish.cjs');console.log('Layout polish matches served HTML');}else fs.writeFileSync(path.join(root,'index.html'),next);
