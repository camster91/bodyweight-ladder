// Checks actual hex fallbacks, including subdued text and the existing action color.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const css=fs.readFileSync(path.join(__dirname,'../ui/section-colors.css'),'utf8'),blocks=[...css.matchAll(/--section-plan:#[\s\S]*?--section-guidance-edge:#[0-9a-f]{6};/g)].map(m=>Object.fromEntries([...m[0].matchAll(/--(section-[a-z-]+):(#\w{6})/g)].map(v=>[v[1],v[2]])));
assert.equal(blocks.length,3);assert.deepEqual(blocks[1],blocks[2]);
const luminance=hex=>{const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722;};
const ratio=(a,b)=>{const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
for(const [i,theme]of ['light','dark'].entries()){
 const palette=blocks[i],inks=i?{text:'#f0f7f3',muted:'#abc1bf',action:'#a4bbff'}:{text:'#172b30',muted:'#52666c',action:'#2555d5'};
 for(const role of ['plan','training','progress','guidance']){
  const fill=palette['section-'+role],measure=Object.fromEntries(Object.entries(inks).map(([k,v])=>[k,+ratio(v,fill).toFixed(2)]));
  for(const [label,value]of Object.entries(measure))assert(value>=4.5,`${theme} ${role} ${label} ${value}`);
  const edge=ratio(palette['section-'+role+'-edge'],fill);assert(edge>=3,`${theme} ${role} edge ${edge}`);
  console.log(theme,role,JSON.stringify({...measure,edge:+edge.toFixed(2)}));
 }
}
