const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const dom = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8'), {
  runScripts: 'dangerously', url: 'https://ladder.test/',
  beforeParse(w) {
    w.scrollTo = () => {};
    w.HTMLElement.prototype.scrollIntoView = () => {};
    w.localStorage.setItem('bwl-state', JSON.stringify({ v: 2, log: [], prefs: { setupDone: true } }));
  }
});

try {
  const images = dom.window.eval('TRACKS.flatMap(t => t.steps.map((st,i) => ({name:st[0], thumb:thumbOf(t,i), detail:imgOf(t,i)})))');
  for (const image of images) {
    for (const file of [image.thumb, image.detail]) {
      assert(fs.existsSync(path.join(root, file)), `${image.name}: missing ${file}`);
    }
    assert(!image.thumb.startsWith('img/w/'), `${image.name}: movement diagram in compact thumbnail`);
  }
  console.log(`PASS all ${images.length} exercise steps have existing detail images and single-pose thumbnails`);

  const photoSources = JSON.parse(fs.readFileSync(path.join(root, 'assets/brand/exercises/photo-sources.json'), 'utf8'));
  const credited = new Set(photoSources.map(p => 'assets/brand/exercises/' + p.file));
  const mapped = dom.window.eval('Object.values(EXERCISE_PHOTOS).concat(Object.values(EXERCISE_FAMILY_PHOTOS))');
  for (const file of mapped) {
    assert(credited.has(file), `Uncredited exercise photo: ${file}`);
    const data = fs.readFileSync(path.join(root, file));
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert(data.length < 100000, `Oversized thumbnail: ${file}`);
  }
  for (const p of photoSources) assert(p.author && p.source.startsWith('https://') && p.license_url.startsWith('https://'));
  console.log('PASS all exercise photographs have source credits, licenses and compact local WebP assets');

  const libraryPull = JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="pull"))'));
  const workoutPull = JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="pull"),2,false)'));
  assert(libraryPull.querySelector('.is-photo'));
  assert.equal(workoutPull.querySelector('img').getAttribute('src'), 'img/pull-jump.webp');
  const workoutPush = JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="push"),3,false)'));
  const inclinePush = JSDOM.fragment(dom.window.eval('exerciseThumbnail(TRACKS.find(t=>t.id==="push"),1,false)'));
  assert.notEqual(workoutPush.querySelector('img').getAttribute('src'), inclinePush.querySelector('img').getAttribute('src'));
  assert(!dom.window.eval('exerciseThumbnail({custom:true})').includes('<img'));
  assert(dom.window.eval('viewLadders()').includes('data-photo-credits'));
  console.log('PASS workout images follow the actual variation while library family photos and custom placeholders stay separate');

  const card = dom.window.eval('fullCard(TRACKS.find(t=>t.id==="ankle"), true)');
  const fragment = JSDOM.fragment(card);
  assert(fragment.querySelector('.exercise-figure figcaption').textContent.includes('3 sec down'));
  assert(fragment.querySelector('.exercise-figure img').getAttribute('alt').includes('start position'));
  console.log('PASS movement timing and image descriptions remain readable outside the bitmap');

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
  const maskable = manifest.icons.find(icon => icon.purpose === 'maskable');
  assert(maskable && maskable.sizes === '512x512');
  assert(fs.existsSync(path.join(root, maskable.src)));
  assert(manifest.icons.some(icon => icon.purpose === 'any' && icon.src !== maskable.src));
  console.log('PASS maskable and regular app icons use separate existing assets');
} finally {
  dom.window.close();
}
process.exit(0);
