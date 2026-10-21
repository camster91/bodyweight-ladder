// Runs every *.test.js file and reports PASS/FAIL lines. Exit code 1 if anything fails.
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
let failed = 0, passed = 0;
for (const f of fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js')).sort()) {
  const r = spawnSync(process.execPath, [path.join(__dirname, f)], { encoding: 'utf8', timeout: 180000 });
  const lines = (r.stdout || '').split('\n').filter(l => /^(PASS|FAIL)/.test(l));
  const bad = lines.filter(l => l.startsWith('FAIL'));
  passed += lines.length - bad.length; failed += bad.length + (r.status && !bad.length ? 1 : 0);
  console.log(`${bad.length || r.status ? '✗' : '✓'} ${f} (${lines.length - bad.length}/${lines.length})`);
  bad.forEach(l => console.log('   ' + l));
  if (r.status && !bad.length) console.log('   crashed:', (r.stderr || '').split('\n').slice(0, 3).join(' '));
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
