#!/usr/bin/env node
'use strict';
// Proves that a change did not alter the design.
// Usage: node email-checks/compare-light.js stages/03-dark-light-outlook-gmail.mjml templates/email.mjml [--params data.json] [--scheme dark]
// With --params, both emails are filled in with that data first, so a change that only wires in data can be compared fairly.
// Builds both emails, renders each at three widths with the same stand-in image,
// and counts the pixels that differ. Exits with 1 if any pixel differs.
const fs = require('fs'), path = require('path');
const { PNG } = require('pngjs');
const WIDTHS = [600, 414, 320];

(async () => {
  const args = process.argv.slice(2);
  const opt = name => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
  const [a, b] = args.filter((x, i) => !x.startsWith('--') && !['--params', '--scheme'].includes(args[i - 1]));
  const scheme = opt('--scheme') === 'dark' ? 'dark' : 'light';
  const paramsFile = opt('--params');
  if (!a || !b) { console.error('Usage: node email-checks/compare-light.js <before.mjml> <after.mjml> [--params data.json] [--scheme dark]'); process.exit(2); }
  const mjml = require(require.resolve('mjml', { paths: [process.cwd(), __dirname] }));
  const { chromium } = require('playwright');
  const standIn = (() => { const p = new PNG({ width: 8, height: 8 }); for (let i = 0; i < p.data.length; i += 4) { p.data[i] = 120; p.data[i + 1] = 140; p.data[i + 2] = 170; p.data[i + 3] = 255; } return PNG.sync.write(p); })();
  let fill = html => html;
  if (paramsFile) {
    const nunjucks = require(require.resolve('nunjucks', { paths: [process.cwd(), __dirname] }));
    const env = new nunjucks.Environment(null, { autoescape: true }), params = JSON.parse(fs.readFileSync(paramsFile, 'utf8'));
    fill = html => env.renderString(html, { params });
  }
  const build = async f => fill((await mjml(fs.readFileSync(f, 'utf8'), { validationLevel: 'soft', beautify: true, filePath: path.resolve(f) })).html);
  const [htmlA, htmlB] = [await build(a), await build(b)];
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const shot = async (html, width) => {
    const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 900 } }); const page = await ctx.newPage();
    await page.route('**/*', r => (r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: standIn }) : r.abort()));
    await page.setContent(html, { waitUntil: 'load' }); await page.waitForTimeout(250);
    const buf = await page.screenshot({ fullPage: true }); await ctx.close(); return PNG.sync.read(buf);
  };
  let failed = false;
  for (const w of WIDTHS) {
    const [pa, pb] = [await shot(htmlA, w), await shot(htmlB, w)];
    let diff = -1;
    if (pa.width === pb.width && pa.height === pb.height) { diff = 0; for (let i = 0; i < pa.data.length; i += 4) if (pa.data[i] !== pb.data[i] || pa.data[i + 1] !== pb.data[i + 1] || pa.data[i + 2] !== pb.data[i + 2]) diff++; }
    const same = diff === 0; if (!same) failed = true;
    console.log(`${scheme} mode at ${w}px: ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}, ${diff < 0 ? 'the page sizes differ' : diff + ' pixel(s) differ'} -> ${same ? 'IDENTICAL' : 'DIFFERENT'}`);
  }
  await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
