const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.join(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'dangerously',url:'https://ladder.test/',beforeParse(w){w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};w.localStorage.setItem('bwl-state',JSON.stringify({v:2,log:[],prefs:{setupDone:true}}));}});
try{
 const steps=dom.window.eval('TRACKS.flatMap(t=>t.steps.map((st,i)=>({key:keyOf(t,i),name:st[0],thumb:thumbOf(t,i),detail:imgOf(t,i),figure:exerciseFigure(t,i),generated:GENERATED_PHOTO_KEYS.has(keyOf(t,i))})))');
 assert.equal(steps.length,78);
 for(const step of steps){
  for(const file of [step.thumb,step.detail]){assert(file.startsWith('assets/brand/exercises/')&&file.endsWith('.webp'),`${step.key}: non-photographic asset ${file}`);assert(fs.existsSync(path.join(root,file)),`${step.key}: missing ${file}`);}
  const figure=JSDOM.fragment(step.figure);assert.equal(figure.querySelector('img').getAttribute('src'),step.detail);assert(figure.querySelector('img').alt.includes(step.name));
  assert.equal(figure.querySelector('figcaption').textContent.includes('AI-generated'),step.generated);assert(!/illustration|shown by Rung|Start → finish/.test(step.figure));
 }
 console.log('PASS all 78 steps use photographic thumbnails and guide images with accurate generated-image disclosures');

 const originals=JSON.parse(fs.readFileSync(path.join(root,'assets/brand/exercises/photo-sources.json'),'utf8'));
 const generated=JSON.parse(fs.readFileSync(path.join(root,'assets/brand/exercises/generated-sources.json'),'utf8'));
 const credited=new Set(originals.map(p=>'assets/brand/exercises/'+p.file).concat(generated.flatMap(p=>Object.values(p.files))));
 for(const step of steps){for(const file of [step.thumb,step.detail]){assert(credited.has(file),`Uncredited asset ${file}`);const bytes=fs.readFileSync(path.join(root,file));assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.toString('ascii',8,12),'WEBP');}assert(fs.statSync(path.join(root,step.thumb)).size<100000,`${step.key}: oversized thumbnail`);}
 for(const record of generated){assert.equal(record.synthetic,true);assert(record.prompt&&record.tool==='ChatGPT built-in image generation');assert(credited.has(record.reference),`Uncredited generation reference ${record.reference}`);assert(fs.existsSync(path.join(root,record.reference)));}
 console.log('PASS photographic assets have provenance, licensed references, disclosure metadata and compact WebP thumbnails');

 const library=JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="pull"))'));
 const workout=JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="pull"),2,false)'));
 assert.equal(library.querySelector('img').src,workout.querySelector('img').src);assert(workout.querySelector('img').src.includes('pull-jumping-pull-up-v2-thumb.webp'));
 const push=JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="push"),3,false)'));
 const incline=JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="push"),1,false)'));
 assert.notEqual(push.querySelector('img').src,incline.querySelector('img').src);
 assert(!dom.window.eval('exerciseThumbnail({custom:true})').includes('<img'));assert.equal(dom.window.eval('exerciseFigure({custom:true})'),'');
 assert(dom.window.eval('viewLadders()').includes('data-photo-credits'));
 console.log('PASS library, workout and substitutions show the selected variation; custom exercises never inherit an unrelated image');

 dom.window.eval('setupDraft=null;setupIntro=true;setupStage=0');
 const welcome=JSDOM.fragment(dom.window.eval('viewSetup()'));
 assert.equal(welcome.querySelectorAll('.onboard-preview img').length,3);
 assert.equal(welcome.querySelectorAll('.onboard-preview svg').length,0);
 for(const img of welcome.querySelectorAll('.onboard-preview img'))assert(fs.existsSync(path.join(root,img.getAttribute('src'))));
 dom.window.eval("setupDraft={groups:new Set(['Mobility']),gear:new Set(),level:'some'};setupIntro=false;setupStage=4");
 const review=JSDOM.fragment(dom.window.eval('viewSetup()'));
 assert.equal(review.querySelector('.onboard-pool img').getAttribute('src'),dom.window.eval('thumbOf(setupAvailableTracks()[0],setupPreviewLevel(setupAvailableTracks()[0]))'));
 const empty=JSDOM.fragment(dom.window.eval('viewHistory()'));
 assert(empty.querySelector('.progress-empty-art img').getAttribute('src').endsWith('.webp'));
 assert(!empty.querySelector('.progress-empty-art .brand-symbol'));
 console.log('PASS welcome, plan review and empty Progress use photos; review imagery follows selected focus');

 const card=JSDOM.fragment(dom.window.eval('fullCard(TRACKS.find(t=>t.id==="ankle"),true)'));
 assert(card.querySelector('.cue').textContent.includes('3 sec down'));assert(card.querySelector('.exercise-reference figcaption').textContent.includes('AI-generated pose reference'));
 assert(!card.querySelector('img[src="img/cheer.webp"]'));
 console.log('PASS movement timing stays in readable text and generated stills do not claim to show a motion sequence');

 const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8')),maskable=manifest.icons.find(i=>i.purpose==='maskable');
 assert(maskable&&maskable.sizes==='512x512');assert(fs.existsSync(path.join(root,maskable.src)));assert(manifest.icons.some(i=>i.purpose==='any'&&i.src!==maskable.src));
 console.log('PASS regular and maskable app icons retain separate existing assets');
}finally{dom.window.close();}
process.exit(0);
