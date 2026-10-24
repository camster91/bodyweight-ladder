const fs=require('node:fs'),path=require('node:path'),root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const source=read('ui/workout-session.js').trimEnd(),html=read('index.html'),start='/* LADDER_WORKOUT_SESSION_START */',end='/* LADDER_WORKOUT_SESSION_END */';
if(!html.includes(start)||!html.includes(end))throw Error('Missing workout session markers');
const next=html.replace(/\/\* LADDER_WORKOUT_SESSION_START \*\/[\s\S]*?\/\* LADDER_WORKOUT_SESSION_END \*\//,()=>start+'\n'+source+'\n'+end);
if(process.argv.includes('--check')){if(next!==html)throw Error('Run node scripts/sync-workout-session.cjs');console.log('Workout session source matches served HTML');}else fs.writeFileSync(path.join(root,'index.html'),next);
