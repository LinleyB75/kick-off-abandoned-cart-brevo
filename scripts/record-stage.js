#!/usr/bin/env node
'use strict';
// Records a stage: runs the commands, saves their raw output, and takes pictures of the email.
// Everything lands in logs/<stage>/ and evidence/<stage>/, so the blog can be written from the record.
//
//   npm run record -- stage-5-data --email templates/email.mjml --params data/params.json --pipeline
//
//   <stage>                 a short name for the folder, for example stage-5-data
//   --email <file>          the email to check and photograph, MJML or plain HTML (default: templates/email.mjml)
//   --params <file.json>    fill the email in with this data first
//   --compare <before>      also run the light and dark comparison against another email (MJML or HTML)
//   --compare-params <file> fill both emails in with this data for the comparison
//   --within <selector>     the comparison may differ, but only inside this part of the email
//   --within-text <words>   the same, finding that part by words that appear in it
//   --pipeline              also run the build, the data checks, all the tests and the simulated Brevo
//   --standin               use grey stand-ins for images (when there is no network)
//   --note "text"           a line of context that goes at the top of the summary
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');

const args = process.argv.slice(2);
const opt = n => (args.includes(n) ? args[args.indexOf(n) + 1] : null);
const slug = args.find((a, i) => !a.startsWith('--') && !['--email', '--params', '--compare', '--compare-params', '--note', '--within', '--within-text'].includes(args[i - 1]));
if (!slug) { console.error('Usage: npm run record -- <stage-name> [--email f.mjml] [--params f.json] [--compare before.mjml] [--pipeline] [--standin] [--note "..."]'); process.exit(2); }
const email = opt('--email') || 'templates/email.mjml', params = opt('--params'), compare = opt('--compare'), compareParams = opt('--compare-params') || params;
const logDir = path.join('logs', slug), picDir = path.join('evidence', slug);
fs.mkdirSync(logDir, { recursive: true }); fs.mkdirSync(picDir, { recursive: true });

const clean = s => s.replace(/\x1b\[[0-9;]*m/g, '').replace(/xkeysib-[A-Za-z0-9-]{12,}|xsmtpsib-[A-Za-z0-9-]{12,}/g, 'xkeysib-[masked]');
const rows = []; let n = 0;
function run(label, command) {
  n++; const file = `${String(n).padStart(2, '0')}-${label}.txt`;
  const r = spawnSync(command, { shell: true, encoding: 'utf8', env: process.env, timeout: 240000 });
  const out = clean((r.stdout || '') + (r.stderr || ''));
  fs.writeFileSync(path.join(logDir, file), `# command:   ${command}\n# run at:    ${new Date().toISOString()}\n# node:      ${process.version}\n# exit code: ${r.status}\n\n${out}`);
  const lines = out.split('\n').map(l => l.trim()).filter(Boolean);
  // one clear line saying what the command found
  const tally = x => lines.filter(l => new RegExp('^' + x + '  ').test(l)).length;
  const widths = lines.filter(l => /mode at \d+px/.test(l)), same = widths.filter(l => /IDENTICAL/.test(l)).length, inside = widths.filter(l => /CHANGED ONLY INSIDE/.test(l)).length;
  let key;
  if (widths.length) key = `${same} of ${widths.length} widths IDENTICAL` + (inside ? `, ${inside} CHANGED ONLY INSIDE the named area` : '') + (same + inside < widths.length ? `, ${widths.length - same - inside} DIFFERENT` : '') + ` (${widths[0].match(/^(\w+) mode/)[1]} mode)`;
  else if (tally('PASS') + tally('FAIL') + tally('WARN') > 0 && !/behave as expected/.test(out)) key = `${tally('PASS')} PASS, ${tally('FAIL')} FAIL, ${tally('WARN')} WARN` + (lines.find(l => /^All send\.js|Ready to push/.test(l)) ? '. ' + lines.find(l => /^All send\.js|Ready to push/.test(l)).slice(0, 60) : '');
  else key = [...lines].reverse().find(l => /(^PASS|^FAIL|passed|behave|Ready|^OK:|Built|Wrote)/.test(l)) || lines[lines.length - 1] || '';
  rows.push({ file, command, code: r.status, key: key.slice(0, 170) });
  console.log(`${r.status === 0 ? 'ok  ' : 'exit ' + r.status}  ${label}`);
}

// 1. the commands
const p = params ? ` --params ${params}` : '';
run('email-checks', `node email-checks/run.js ${email}${p} --out ${logDir}`);
if (compare) {
  const cp = compareParams ? ` --params ${compareParams}` : '';
  const wi = opt('--within') ? ` --within "${opt('--within')}"` : opt('--within-text') ? ` --within-text "${opt('--within-text')}"` : '';
  run('compare-light', `node email-checks/compare-light.js ${compare} ${email}${cp}${wi}`);
  run('compare-dark', `node email-checks/compare-light.js ${compare} ${email}${cp} --scheme dark${wi}`);
}
if (args.includes('--pipeline')) {
  for (const [label, cmd] of [['build', 'npm run build'], ['check-params', 'npm run check-params'], ['tests-break-the-data', 'npm test'], ['tests-send', 'npm run test:send'], ['simulated-brevo-walkthrough', 'npm run simulate'], ['data-design-table', 'npm run data-design']]) run(label, cmd);
  if (fs.existsSync('.git')) run('verify-setup', 'npm run verify'); else rows.push({ file: '(not run)', command: 'npm run verify', code: '-', key: 'needs a Git repository: run git init and npm run setup:hooks first' });
}

// 2. the pictures
(async () => {
  const mjml = require(require.resolve('mjml', { paths: [process.cwd()] })), { chromium } = require('playwright'), { PNG } = require('pngjs');
  let html = email.toLowerCase().endsWith('.html') ? fs.readFileSync(email, 'utf8') : (await mjml(fs.readFileSync(email, 'utf8'), { validationLevel: 'soft', beautify: true, filePath: path.resolve(email) })).html;
  if (params) { const nj = require('nunjucks'); html = new nj.Environment(null, { autoescape: true }).renderString(html, { params: JSON.parse(fs.readFileSync(params, 'utf8')) }); }
  const standIn = (() => { const g = new PNG({ width: 8, height: 8 }); for (let i = 0; i < g.data.length; i += 4) { g.data[i] = 120; g.data[i + 1] = 140; g.data[i + 2] = 170; g.data[i + 3] = 255; } return PNG.sync.write(g); })();
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const pics = [];
  for (const scheme of ['light', 'dark']) for (const width of [600, 320]) {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 900 } }), page = await ctx.newPage();
    if (args.includes('--standin')) await page.route('**/*', r => (r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: standIn }) : r.abort()));
    await page.setContent(html, { waitUntil: args.includes('--standin') ? 'load' : 'networkidle' }); await page.waitForTimeout(300);
    const file = path.join(picDir, `email-${scheme}-${width}.png`); await page.screenshot({ path: file, fullPage: true });
    const size = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
    pics.push({ file: path.basename(file), scheme, width, page: size.join(' x ') }); await ctx.close();
  }
  await browser.close();

  // 3. the summary
  const v = n => { try { return require(`${n}/package.json`).version; } catch { return '?'; } };
  const md = [`# ${slug}`, '', `Recorded ${new Date().toISOString()} on Node ${process.version}. MJML ${v('mjml')}, Playwright ${v('playwright')}, axe-core ${v('axe-core')}.`, '',
    opt('--note') ? `**Context:** ${opt('--note')}\n` : '', `**Email:** \`${email}\`${params ? `, filled in with \`${params}\`` : ''}${compare ? `. Compared with \`${compare}\`` : ''}.`, '',
    '## Commands, with the raw output saved beside this file', '', '| # | Command | Exit code | The line that matters |', '| --- | --- | --- | --- |',
    ...rows.map((r, i) => `| ${i + 1} | \`${r.command}\` | ${r.code} | ${r.key.replace(/\|/g, '\\|')} |`), '',
    'An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.', '',
    '## Pictures', '', `Saved in \`evidence/${slug}/\`. ${args.includes('--standin') ? 'The images in the email are grey stand-ins, because this run had no network. Run this command on a machine with a network and the real images are used.' : 'The real images were loaded.'}`, '',
    '| Picture | Mode | Screen width | Page size |', '| --- | --- | --- | --- |', ...pics.map(x => `| \`${x.file}\` | ${x.scheme} | ${x.width}px | ${x.page} |`), ''].join('\n');
  fs.writeFileSync(path.join(logDir, 'SUMMARY.md'), md);

  // 4. the index of every recorded stage
  const stages = fs.readdirSync('logs', { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join('logs', d.name, 'SUMMARY.md'))).map(d => d.name).sort();
  fs.writeFileSync(path.join('logs', 'INDEX.md'), ['# Recorded stages', '', 'Each folder holds the raw output of every command for that stage and a summary. The pictures are in `evidence/`.', '', ...stages.map(s => `- [${s}](${s}/SUMMARY.md): pictures in \`evidence/${s}/\``), ''].join('\n'));
  console.log(`\nSaved: ${logDir}/ (${rows.length} commands) and ${picDir}/ (${pics.length} pictures). Index: logs/INDEX.md`);
})().catch(e => { console.error(e); process.exit(2); });