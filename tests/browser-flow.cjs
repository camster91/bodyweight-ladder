// Real browser journeys with isolated browser storage; never uses an owner's profile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require('playwright');
const root = path.join(__dirname, '..');
const output = process.env.QA_OUTPUT;
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname.replace(/\/$/, '/index.html'));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  const types = { '.html': 'text/html', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
  fs.readFile(file, (error, bytes) => {
    res.writeHead(error ? 404 : 200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(error ? '' : bytes);
  });
});
const read = page => page.evaluate(() => ({ run: JSON.parse(localStorage.getItem('bwl-focus')), state: JSON.parse(localStorage.getItem('bwl-state')) }));
const click = (page, selector) => page.locator(selector).click();
async function shot(page, name) {
  if (output) { fs.mkdirSync(output, { recursive: true }); await page.screenshot({ path: path.join(output, name + '.png'), fullPage: true }); }
}
async function run(engine, name, viewport) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce', acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.setDefaultTimeout(7000);
  const url = process.env.QA_URL || `http://127.0.0.1:${server.address().port}`;
  try {
    await page.clock.install();
    await page.goto(url);
    await click(page, '[data-ui="onext"]');
    await click(page, '[data-ui="onext"]');
    await click(page, '[data-ui="onext"]');
    await click(page, '[data-v="new"]');
    await page.reload();
    assert.equal(await page.locator('.onboard').getAttribute('data-step'), '3');
    await click(page, '[data-ui="onext"]');
    await click(page, '[data-ui="finish"]');
    assert((await read(page)).state.prefs.setupDone);
    assert.equal((await read(page)).state.log.length, 0);
    // Choose a repetition exercise from the actual workout queue.
    await click(page, '#workoutToolsButton');
    const repIndex = await page.evaluate(() => focusRun.items.findIndex(x => !isSec(sessionSpec(findTrack(x.id))[4])));
    assert(repIndex >= 0);
    await click(page, `[data-focus="choose"][data-i="${repIndex}"]`);
    if (await page.locator('#workoutTools').isVisible()) await page.keyboard.press('Escape');
    await shot(page, name + '-workout');
    assert(await page.locator('#focusPrimary').isVisible());
    await click(page, '#focusHowTo');
    assert(await page.locator('#techniqueSheet').isVisible());
    await page.keyboard.press('Escape');
    await click(page, '[data-focus="plus"]');
    const value = Number(await page.locator('#focusValue').innerText());
    await click(page, '[data-focus="complete"]');
    assert.equal((await read(page)).run.items[repIndex].values[0], value);
    assert.equal((await read(page)).state.log.length, 0);
    let end = (await read(page)).run.restEnd;
    await click(page, '[data-focus="add"]');
    assert.equal((await read(page)).run.restEnd, end + 30000);
    await click(page, '[data-focus="undo"]');
    assert.equal((await read(page)).run.items[repIndex].values.length, 0);
    await click(page, '[data-focus="complete"]');
    await click(page, '[data-session-action="pause"]');
    const paused = (await read(page)).run.pauseSnapshot;
    await page.clock.fastForward(60000);
    await page.reload();
    assert.equal((await read(page)).run.phase, 'paused');
    assert.deepEqual((await read(page)).run.pauseSnapshot, paused);
    await shot(page, name + '-paused');
    await click(page, '[data-session-action="resume"]');
    assert.equal((await read(page)).run.phase, 'rest');
    await page.reload();
    assert.equal((await read(page)).run.phase, 'rest');
    await click(page, '[data-focus="skip"]');
    // Finish every planned set through rendered controls, including timed holds.
    let actions = 0;
    while ((await read(page)).run.phase !== 'finished') {
      assert(++actions < 100, 'Workout must eventually finish');
      const current = await read(page);
      if (current.run.phase === 'rest') {
        await page.clock.fastForward(current.run.restEnd - await page.evaluate(() => Date.now()) + 500);
        continue;
      }
      if (await page.locator('[data-focus="hold"]').isVisible()) {
        await click(page, '[data-focus="hold"]');
        if (await page.locator('#holdPreparation').isVisible()) await click(page, '[data-hold-prep-ready]');
        await page.clock.fastForward(15000);
        await click(page, '[data-focus="finish"]');
        if (await page.locator('[data-focus="finish"]').isVisible()) {
          await page.clock.fastForward(14000);
          await click(page, '[data-focus="finish"]');
        }
      } else {
        await click(page, '[data-focus="complete"]');
      }
    }
    let finished = await read(page);
    assert.equal(finished.run.endStatus, 'completed');
    assert.equal(finished.state.log.length, finished.run.items.length);
    assert(finished.state.log.every(e => e.sets.length === finished.run.items.find(x => x.id === e.t).goals.length));
    await shot(page, name + '-complete');
    await page.reload();
    assert.equal((await read(page)).run.phase, 'finished');
    assert.deepEqual((await read(page)).state.log, finished.state.log);
    await click(page, '[data-focus="progress"]');
    await click(page, '#progressLog > summary');
    assert.equal(await page.locator('[data-ui="selentry"]').count(), finished.state.log.length);
    await shot(page, name + '-progress');
    await click(page, '[data-ui="selentry"] >> nth=0');
    await click(page, '[data-ui="delentry"]');
    assert.equal((await read(page)).state.log.length, finished.state.log.length - 1);
    await click(page, '#toastUndo');
    assert.equal((await read(page)).state.log.length, finished.state.log.length);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    console.log(`PASS ${name}: setup, technique, reps, Undo, rest, pause/reload/resume, timed sets, completion, history and deletion/Undo`);
  } finally { await browser.close(); }
}
async function edgeCases(engine, name) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.setDefaultTimeout(7000);
  const url = process.env.QA_URL || `http://127.0.0.1:${server.address().port}`;
  await context.addInitScript(() => {
    if (localStorage.getItem('bwl-state')) return;
    localStorage.setItem('bwl-state', JSON.stringify({ v: 2, log: [], levels: { core: 'core:side-plank' }, prefs: { setupDone: true, sets: { push: 2, core: 1 }, equipment: { floor: true, wall: true, counter: true } }, routines: [{ id: 'qa', name: 'QA workout', items: ['push', 'core'] }] }));
    localStorage.setItem('bwl-filter', 'r:qa');
    localStorage.setItem('bwl-focus', JSON.stringify({ v: 1, items: [null] }));
  });
  try {
    await page.clock.install();
    await page.goto(url);
    await click(page, '[data-focus="complete"]');
    await click(page, '[data-focus="undo"]');
    await click(page, '#workoutToolsButton');
    assert(await page.locator('[data-readiness="choose"][data-kind="low"]').isVisible(), 'Undo must unlock check-in for an untouched workout');
    await click(page, '[data-session-action="swap"]');
    await click(page, '[data-swap="choose"][data-t="push"][data-level="1"]');
    await click(page, '[data-swap="apply"]');
    if (await page.locator('#workoutTools').isVisible()) await page.keyboard.press('Escape');
    assert.equal((await read(page)).run.items[0].key, 'push:incline-push-up');
    assert.equal((await read(page)).state.levels.push, 'push:push-up');
    await click(page, '[data-focus="complete"]');
    await click(page, '[data-session-action="pause"]');
    await click(page, '.focus-paused [data-session-action="finish"]');
    await page.keyboard.press('Escape');
    assert.equal((await read(page)).run.phase, 'paused');
    assert.equal((await read(page)).state.log.length, 0);
    await click(page, '[data-session-action="resume"]');
    await click(page, '#workoutToolsButton');
    await click(page, '[data-session-action="skip"]');
    let saved = await read(page);
    assert.equal(saved.state.log.length, 1);
    assert.equal(saved.state.log[0].sets.length, 1);
    assert(saved.state.log[0].partial);
    assert.equal(saved.run.items[0].skipped, true);
    await click(page, '[data-focus="hold"]');
    await click(page, '[data-hold-prep-ready]');
    assert(await page.locator('[data-focus="finish"]').isDisabled());
    await page.clock.fastForward(18000);
    await click(page, '[data-focus="finish"]');
    assert.equal((await read(page)).run.items[1].values.length, 0);
    await page.clock.fastForward(14000);
    await click(page, '[data-session-action="pause"]');
    const pause = (await read(page)).run.pauseSnapshot;
    assert.equal(pause.side, 2);
    assert(pause.first >= 8);
    await page.reload();
    await click(page, '[data-session-action="resume"]');
    await click(page, '[data-focus="finish"]');
    saved = await read(page);
    assert.equal(saved.run.phase, 'finished');
    assert.equal(saved.run.endStatus, 'partial');
    assert.equal(saved.state.log.length, 2);
    assert.equal(saved.state.log.find(e => e.t === 'core').sets[0], Math.floor(pause.elapsedMs / 1000));
    await click(page, '[data-session-extra="open"]');
    await click(page, '[data-session-extra="set"][data-extra-track="push"]');
    assert.equal((await read(page)).run.items.find(x => x.id === 'push').goals.length, 1);
    await click(page, '[data-focus="complete"]');
    assert.equal((await read(page)).state.log.length, 3);
    await click(page, '[data-focus="progress"]');
    await click(page, '.backup-entry button');
    const downloadEvent = page.waitForEvent('download');
    await click(page, '[data-backup-download]');
    const download = await downloadEvent;
    const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(backup.state.log.length, 3);
    assert.equal(backup.state.sessions.at(-1).status, 'partial');
    await page.locator('#backupFile').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
    await click(page, '[data-backup-apply]');
    assert.equal((await read(page)).state.log.length, 3);
    assert.deepEqual(errors, []);
    console.log(`PASS ${name}: 320px layout, Undo check-in, swap, skip with saved partial work, finish cancellation, two-sided hold pause/reload, extras, backup/restore without duplicates`);
  } finally { await browser.close(); }
}
async function recoveryCases(engine, name) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await context.addInitScript(() => {
    if (localStorage.getItem('bwl-state')) return;
    localStorage.setItem('bwl-state', JSON.stringify({ v: 2, log: [], prefs: { setupDone: true }, routines: [{ id: 'qa', name: 'Recovery workout', items: ['push', 'core'] }] }));
    localStorage.setItem('bwl-filter', 'r:qa');
  });
  try {
    await page.goto(process.env.QA_URL || `http://127.0.0.1:${server.address().port}`);
    await page.evaluate(() => {
      window.qaStorageWrite = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === 'bwl-focus') throw new DOMException('Fabricated test failure', 'QuotaExceededError');
        return window.qaStorageWrite.call(this, key, value);
      };
    });
    await click(page, '[data-focus="complete"]');
    assert(await page.locator('#storageWarning').isVisible());
    assert.equal((await read(page)).run.items[0].values.length, 0, 'Failed write must leave the old stored session intact');
    await page.evaluate(() => { Storage.prototype.setItem = window.qaStorageWrite; delete window.qaStorageWrite; });
    await click(page, '[data-backup="retry"]');
    assert.equal(await page.locator('#storageWarning').isVisible(), false);
    await page.reload();
    assert.equal((await read(page)).run.items[0].values.length, 1);
    await click(page, '[data-session-action="pause"]');
    await click(page, '.focus-paused [data-session-action="finish"]');
    await click(page, '[data-session-finish-confirm]');
    const finished = await read(page);
    assert.equal(finished.run.phase, 'finished');
    assert.equal(finished.run.endStatus, 'partial');
    assert.equal(finished.state.log.length, 1);
    assert.equal(finished.state.log[0].sets.length, 1);
    assert.equal(finished.run.items[1].omitted, true);
    await page.reload();
    assert.deepEqual((await read(page)).state.log, finished.state.log);
    assert.deepEqual(errors, []);
    console.log(`PASS ${name}: blocked storage warning, retry/reload recovery, early finish saves performed sets only and persists a partial outcome`);
  } finally { await browser.close(); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await run(chromium, 'chromium-mobile', { width: 390, height: 844 });
    await run(webkit, 'webkit-mobile', { width: 375, height: 812 });
    await run(chromium, 'chromium-desktop', { width: 1440, height: 1000 });
    await edgeCases(chromium, 'chromium-edge-cases');
    await edgeCases(webkit, 'webkit-edge-cases');
    await recoveryCases(chromium, 'chromium-recovery');
    await recoveryCases(webkit, 'webkit-recovery');
  } finally { server.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
