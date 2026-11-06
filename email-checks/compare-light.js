#!/usr/bin/env node
'use strict';
// Proves that a change did not alter the design, or changed only the part it was meant to.
// Usage: node email-checks/compare-light.js stages/02-fixed.mjml templates/email.mjml [--params data.json] [--scheme dark] [--within ".footer-address"]
// With --params, both emails are filled in with that data first, so a change that only wires in data can be compared fairly.
// Builds both emails, renders each in light mode at three widths with the same stand-in image,
// and counts the pixels that differ, and where they are. Exits with 1 if any pixel differs.
// With --within (a CSS selector) or --within-text (words that appear in that part), differences are allowed,
// but only inside that part of the email, as it was and as it is now.
// It then exits with 1 if any pixel differs outside it, or if the page changes size.
const fs = require('fs'), path = require('path');
const { PNG } = require('pngjs');
const WIDTHS = [600, 414, 320];

(async () => {
  const args = process.argv.slice(2);
  const opt = name => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
  const [a, b] = args.filter((x, i) => !x.startsWith('--') && !['--params', '--scheme', '--within', '--within-text'].includes(args[i - 1]));
  const scheme = opt('--scheme') === 'dark' ? 'dark' : 'light';
  const paramsFile = opt('--params'), withinSel = opt('--within'), withinText = opt('--within-text');
  const within = withinSel || (withinText ? `"${withinText}"` : null);
  if (!a || !b) { console.error('Usage: node email-checks/compare-light.js <before.mjml> <after.mjml> [--params data.json] [--scheme dark] [--within selector | --within-text words]'); process.exit(2); }
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
    const region = within ? await page.evaluate(({ sel, text }) => {
      let e = sel ? document.querySelector(sel) : null;
      if (!sel && text) { const hits = [...document.querySelectorAll('td')].filter(x => x.textContent.includes(text)); e = hits.find(x => !hits.some(y => y !== x && x.contains(y))) || null; } // the innermost cell holding those words
      if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY };
    }, { sel: withinSel, text: withinText }) : null;
    const buf = await page.screenshot({ fullPage: true }); await ctx.close(); return { png: PNG.sync.read(buf), region };
  };
  let failed = false;
  for (const w of WIDTHS) {
    const [A, B] = [await shot(htmlA, w), await shot(htmlB, w)], pa = A.png, pb = B.png;
    let diff = -1, box = null, outside = 0;
    const regions = [A.region, B.region].filter(Boolean); // the older email may not have the class yet
    const area = within && regions.length ? { l: Math.min(...regions.map(r => r.l)), t: Math.min(...regions.map(r => r.t)), r: Math.max(...regions.map(r => r.r)), b: Math.max(...regions.map(r => r.b)) } : null;
    if (pa.width === pb.width && pa.height === pb.height) {
      diff = 0;
      for (let y = 0; y < pa.height; y++) for (let x = 0; x < pa.width; x++) {
        const i = (y * pa.width + x) * 4;
        if (pa.data[i] !== pb.data[i] || pa.data[i + 1] !== pb.data[i + 1] || pa.data[i + 2] !== pb.data[i + 2]) {
          diff++; box = box ? { x0: Math.min(box.x0, x), x1: Math.max(box.x1, x), y0: Math.min(box.y0, y), y1: Math.max(box.y1, y) } : { x0: x, x1: x, y0: y, y1: y };
          if (area && (x < area.l - 1 || x > area.r + 1 || y < area.t - 1 || y > area.b + 1)) outside++;
        }
      }
    }
    let verdict = 'DIFFERENT';
    if (diff === 0) verdict = 'IDENTICAL';
    else if (diff > 0 && area && outside === 0) verdict = `CHANGED ONLY INSIDE ${within}`;
    const ok = verdict === 'IDENTICAL' || verdict.startsWith('CHANGED ONLY INSIDE'); if (!ok) failed = true;
    const where = box ? `, in rows ${box.y0} to ${box.y1} and columns ${box.x0} to ${box.x1}` : '';
    const out = area && diff > 0 ? `, ${outside} outside ${within}` : '';
    console.log(`${scheme} mode at ${w}px: ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}, ${diff < 0 ? 'the page sizes differ' : diff + ' pixel(s) differ' + where + out} -> ${verdict}`);
  }
  await browser.close(); process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });