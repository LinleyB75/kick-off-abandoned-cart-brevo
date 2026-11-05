#!/usr/bin/env node
'use strict';
// Usage: node email-checks/run.js templates/email.mjml [--out reports] [--no-browser]
// Runs the syntax, accessibility and contrast checks and writes a report you can use in a blog post.
const fs = require('fs'), path = require('path');
const { checkSource } = require('./lib/syntax');
const { renderReport } = require('./lib/report');


function packageVersion(entry, name) {
  let dir = path.dirname(entry);
  for (let i = 0; i < 5; i++, dir = path.dirname(dir)) {
    const p = path.join(dir, 'package.json');
    if (fs.existsSync(p)) { const j = JSON.parse(fs.readFileSync(p, 'utf8')); if (j.name === name) return j.version; }
  }
  return 'unknown';
}

(async () => {
  const args = process.argv.slice(2);
  const file = args.find(a => !a.startsWith('--'));
  const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'reports';
  if (!file || !fs.existsSync(file)) { console.error('Usage: node email-checks/run.js <email.mjml | email.html> [--out reports] [--no-browser]'); process.exit(2); }
  const src = fs.readFileSync(file, 'utf8');
  const isMjml = file.toLowerCase().endsWith('.mjml');
  const findings = []; let html = src, strict = { ok: true, errors: [] }; const versions = {};

  if (isMjml) {
    findings.push(...checkSource(src));
    const mjmlPath = require.resolve('mjml', { paths: [process.cwd(), __dirname] });
    const mjml = require(mjmlPath); versions.mjml = packageVersion(mjmlPath, 'mjml');
    const soft = await mjml(src, { validationLevel: 'soft', filePath: path.resolve(file) });
    html = soft.html;
    try { await mjml(src, { validationLevel: 'strict', filePath: path.resolve(file) }); }
    catch (e) { strict = { ok: false, errors: (e.errors || [{ line: '', tagName: '', message: e.message }]).map(x => ({ line: x.line, tagName: x.tagName, message: x.message })) }; }
    for (const e of strict.errors) findings.push({ area: 'syntax', id: 'strict-build', level: 'error', message: `Strict build: ${e.message.trim()} (${e.tagName})`, line: e.line });
  }
  try { versions.axe = require('axe-core/package.json').version; } catch (_) {}

  let contrast = { light: [], dark: [] };
  if (!args.includes('--no-browser')) {
    try { const { checkBuilt } = require('./lib/browser-checks'); const b = await checkBuilt(html); findings.push(...b.findings); contrast = b.contrast; }
    catch (e) { console.error('\nThe browser checks could not run: ' + e.message.split('\n')[0] + '\nInstall them once with:  npm i -D playwright axe-core  then  npx playwright install chromium\n'); findings.push({ area: 'accessibility', id: 'browser-unavailable', level: 'error', message: 'The browser checks did not run.' }); }
  }
  const errors = findings.filter(f => f.level === 'error').length, warnings = findings.filter(f => f.level === 'warn').length;
  const result = { pass: errors === 0, errors, warnings, contrast };
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, path.basename(file).replace(/\.[^.]+$/, '') + '-checks');
  fs.writeFileSync(base + '.md', renderReport({ file, versions, strict, findings, result }));
  fs.writeFileSync(base + '.json', JSON.stringify({ file, versions, strict, findings, contrast }, null, 2));

  for (const area of ['syntax', 'accessibility', 'contrast', 'size']) {
    const list = findings.filter(f => f.area === area && f.level !== 'info');
    console.log(`\n${area.toUpperCase()}: ${list.filter(f => f.level === 'error').length} error(s), ${list.filter(f => f.level === 'warn').length} warning(s)`);
    for (const f of list.slice(0, 12)) console.log(`  ${f.level === 'error' ? 'ERROR' : 'warn '} ${f.line ? 'line ' + f.line + ': ' : ''}${f.message}`);
    if (list.length > 12) console.log(`  ... and ${list.length - 12} more in the report`);
  }
  console.log(`\n${result.pass ? 'PASS' : 'FAIL'}: ${errors} error(s), ${warnings} warning(s). Report: ${base}.md`);
  process.exit(result.pass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });