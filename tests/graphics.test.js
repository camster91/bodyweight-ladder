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
