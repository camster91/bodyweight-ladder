const fs=require('node:fs'),path=require('node:path'),esbuild=require('esbuild');
const root=path.resolve(__dirname,'..'),out=path.join(root,'mobile','www');
// Delete only this dedicated generated directory, never the source tree.
if(out!==path.join(root,'mobile','www'))throw Error('Unexpected output directory');
fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
for(const name of ['index.html','manifest.webmanifest','img','assets/brand'])fs.cpSync(path.join(root,name),path.join(out,name),{recursive:true});
esbuild.buildSync({entryPoints:[path.join(root,'mobile/native.js')],outfile:path.join(out,'native.js'),bundle:true,format:'iife',platform:'browser',target:['safari15','chrome100']});
let html=fs.readFileSync(path.join(out,'index.html'),'utf8');
html=html.replace("const RELEASE='2026-10-26-centered-counter'","const RELEASE='2026-10-26-mobile-beta1'");
html=html.replace('<head>','<head>\n<script src="native.js"></script>');
// The installed app has a different storage origin from the website.
html=html.replace('</body>', '<script>window.addEventListener("ladder-native-background",()=>{if(typeof pauseWorkout==="function")pauseWorkout();});</script></body>');
const privacy=fs.readFileSync(path.join(root,'mobile/privacy.html'),'utf8');
html=html.replace('</body>', '<dialog id="mobilePrivacy" style="max-width:36rem;max-height:85svh;overflow:auto;padding:24px;border-radius:20px">'+privacy+'</dialog><script>document.addEventListener("DOMContentLoaded",()=>{const note=document.getElementById("saveNote");if(note){const button=document.createElement("button");button.textContent="Beta privacy";button.style.cssText="display:block;margin:12px auto;min-height:44px";button.onclick=()=>document.getElementById("mobilePrivacy").showModal();note.after(button);}});</script></body>');
fs.writeFileSync(path.join(out,'index.html'),html);
console.log('Packaged only public app assets in mobile/www');
