'use strict';
// Accessibility and contrast checks on the BUILT email, rendered in a real browser (Chromium).
// Dark mode is emulated with prefers-color-scheme. Outlook's own dark mode is not, so it still needs real clients.

const AXE_PATH = require.resolve('axe-core/axe.min.js');
// Rules that apply to an email. Page-level rules such as landmarks and "one h1" are left out because they only add noise here.
const EMAIL_AXE_RULES = ['color-contrast', 'image-alt', 'image-redundant-alt', 'link-name', 'button-name', 'html-has-lang', 'html-lang-valid', 'document-title', 'meta-viewport',
  'td-headers-attr', 'th-has-data-cells', 'presentation-role-conflict', 'role-img-alt', 'list', 'listitem', 'link-in-text-block', 'target-size', 'empty-heading', 'heading-order',
  'aria-valid-attr', 'aria-valid-attr-value', 'aria-allowed-attr', 'aria-roles', 'duplicate-id'];
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

// ---- runs inside the page: every piece of text, its colour, and the background it really sits on
function pageContrast() {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return { r: 0, g: 0, b: 0, a: 0 }; const p = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  const darkCanvas = matchMedia('(prefers-color-scheme: dark)').matches && /dark/.test(getComputedStyle(document.documentElement).colorScheme || '');
  const canvas = darkCanvas ? { r: 18, g: 18, b: 18, a: 1 } : { r: 255, g: 255, b: 255, a: 1 };
  const backgroundOf = el => {
    const layers = []; let image = false;
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') image = true;
      const c = parse(cs.backgroundColor);
      if (c.a > 0) { layers.push(c); if (c.a === 1) break; }
    }
    let base = canvas; for (const l of layers.reverse()) base = over(l, base);
    return { c: base, image };
  };
  const shown = el => { const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0 || parseFloat(cs.fontSize) === 0) return false; const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; };
  const pairs = new Map();
  for (const el of document.body.querySelectorAll('*')) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
    if (!shown(el)) continue;
    const cs = getComputedStyle(el), bg = backgroundOf(el), fg = over(parse(cs.color), bg.c);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight, 10) >= 700, large = size >= 24 || (size >= 18.66 && bold);
    const l1 = lum(fg), l2 = lum(bg.c), ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const key = hex(fg) + '|' + hex(bg.c) + '|' + (large ? 'L' : 'N');
    const row = pairs.get(key) || { fg: hex(fg), bg: hex(bg.c), ratio: Math.round(ratio * 100) / 100, large, size, count: 0, sample: (el.innerText || el.textContent).trim().replace(/\s+/g, ' ').slice(0, 44), image: bg.image, isLink: !!el.closest('a') };
    row.count++; row.size = Math.min(row.size, size); pairs.set(key, row);
  }
  return [...pairs.values()].sort((a, b) => a.ratio - b.ratio);
}

// ---- runs inside the page: structure facts
function pageFacts() {
  const text = n => (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim();
  return {
    lang: document.documentElement.getAttribute('lang'), title: document.title.trim(),
    viewport: !!document.querySelector('meta[name=viewport]'), colourScheme: !!document.querySelector('meta[name=color-scheme]'),
    images: [...document.images].map(i => ({ src: i.getAttribute('src') || '', alt: i.getAttribute('alt'), w: i.getAttribute('width'), h: i.getAttribute('height') })),
    links: [...document.querySelectorAll('a')].map(a => ({ href: a.getAttribute('href') || '', text: text(a), label: a.getAttribute('aria-label'), imgAlt: (a.querySelector('img') || {}).alt || '' })),
    layoutTables: [...document.querySelectorAll('table')].filter(t => !t.querySelector('th') && t.getAttribute('role') !== 'presentation').length,
    headings: [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(h => ({ level: +h.tagName[1], text: text(h).slice(0, 50) })),
    overflowX: document.documentElement.scrollWidth > window.innerWidth + 1,
    emoji: [...new Set((document.body.innerText.match(/\p{Extended_Pictographic}/gu) || []))].filter(e => !'\u00a9\u00ae\u2122'.includes(e)),
  };
}

async function open(browser, html, scheme, width) {
  const ctx = await browser.newContext({ colorScheme: scheme, viewport: { width, height: 1000 } });
  const page = await ctx.newPage();
  await page.route('**/*', r => (r.request().resourceType() === 'image' ? r.fulfill({ status: 200, contentType: 'image/png', body: PNG }) : r.abort()));
  await page.setContent(html, { waitUntil: 'load' });
  return { ctx, page };
}
async function runAxe(page) {
  await page.addScriptTag({ path: AXE_PATH });
  return page.evaluate(async rules => {
    const known = new Set(axe.getRules().map(r => r.ruleId));
    const res = await axe.run(document, { runOnly: { type: 'rule', values: rules.filter(r => known.has(r)) }, resultTypes: ['violations', 'incomplete'] });
    const pick = list => list.map(v => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, sample: v.nodes.slice(0, 2).map(n => n.html.replace(/\s+/g, ' ').slice(0, 110)) }));
    return { violations: pick(res.violations), review: pick(res.incomplete) };
  }, EMAIL_AXE_RULES);
}

function factFindings(facts, htmlBytes, contrastLight) {
  const f = [], add = (id, level, message) => f.push({ area: 'accessibility', id, level, message });
  if (!facts.lang) add('lang-missing', 'error', 'The built email has no lang attribute.');
  else if (facts.lang === 'und') add('lang-und', 'warn', 'lang="und" means "undetermined". Set the real language so screen readers pronounce the text correctly.');
  if (!facts.title) add('title-missing', 'warn', 'The built email has no <title>.');
  if (!facts.viewport) add('viewport-missing', 'warn', 'No viewport meta tag, so phones may shrink the email.');
  if (!facts.colourScheme) add('colour-scheme-missing', 'info', 'No color-scheme meta tag. Apps will not know the email was designed for dark mode.');
  const bad = (pred, id, level, msg) => { const n = facts.images.filter(pred).length; if (n) add(id, level, `${n} ${msg}`); };
  bad(i => i.alt === null, 'image-no-alt', 'error', 'image(s) have no alt attribute.');
  bad(i => i.alt && /\.(png|jpe?g|webp|gif)$|screenshot|gemini|dall-?e|\d{6,}/i.test(i.alt), 'image-alt-filename', 'warn', 'image(s) use a file name as alt text.');
  bad(i => !i.w || !i.h, 'image-no-size', 'info', 'image(s) have no width and height, so the layout can jump as they load.');
  const named = l => l.text || l.label || l.imgAlt;
  const dyn = h => /^\{\{|^\{%/.test(h);
  const nL = facts.links.filter(l => !l.href || l.href === '#').length; if (nL) add('link-empty', 'error', `${nL} link(s) have an empty or "#" address.`);
  const nF = facts.links.filter(l => l.href.startsWith('#') && l.href !== '#').length; if (nF) add('link-fragment', 'error', `${nF} link(s) point at a spot on the page (#...), which goes nowhere in an email.`);
  const nR = facts.links.filter(l => l.href && !l.href.startsWith('#') && !dyn(l.href) && !/^(https?:|mailto:|tel:|sms:)/i.test(l.href)).length; if (nR) add('link-not-absolute', 'error', `${nR} link(s) are not full addresses (for example "your-facebook-link"), so they cannot work in an email.`);
  if (facts.emoji.length) add('emoji', 'info', `Emoji in the text (${facts.emoji.join(' ')}). Screen readers read each one aloud by name, for example "light bulb".`);
  if (!facts.links.some(l => /unsubscribe|manage (your )?(email )?preferences|opt.?out/i.test(l.text))) add('no-unsubscribe', 'info', 'No unsubscribe link. Marketing emails usually need one. Transactional emails usually do not. Check the rules where your customers are.');
  const nN = facts.links.filter(l => l.href && !named(l)).length; if (nN) add('link-no-name', 'error', `${nN} link(s) have no accessible name.`);
  const nG = facts.links.filter(l => /^(click here|here|read more|more|link|learn more)$/i.test(l.text)).length; if (nG) add('link-generic', 'warn', `${nG} link(s) say only "here" or "read more", which means nothing out of context.`);
  const nP = facts.links.filter(l => /example\.(com|org|net)/i.test(l.href)).length; if (nP) add('link-placeholder', 'warn', `${nP} link(s) still point at a placeholder address.`);
  const nH = facts.links.filter(l => /^http:\/\//i.test(l.href)).length; if (nH) add('link-http', 'warn', `${nH} link(s) use http, not https.`);
  const byText = {}; for (const l of facts.links) if (l.text && l.href) (byText[l.text.toLowerCase()] = byText[l.text.toLowerCase()] || new Set()).add(l.href);
  const amb = Object.entries(byText).filter(([, s]) => s.size > 1).length; if (amb) add('link-ambiguous', 'info', `${amb} link text(s) go to different addresses.`);
  if (facts.layoutTables) add('table-role', 'warn', `${facts.layoutTables} layout table(s) lack role="presentation", so a screen reader may announce them as data tables.`);
  if (facts.headings.length && facts.headings[0].level > 2) add('heading-start', 'info', `The first heading is an h${facts.headings[0].level} ("${facts.headings[0].text}"). Start at h1 or h2 so the order makes sense.`);
  if (!facts.headings.length) add('no-headings', 'info', 'No headings. Screen reader users skim by heading, so a short email can still benefit from one.');
  facts.headings.forEach((h, i) => { if (i && h.level - facts.headings[i - 1].level > 1) add('heading-skip', 'warn', `Heading level jumps from h${facts.headings[i - 1].level} to h${h.level} ("${h.text}").`); });
  const small = contrastLight.filter(p => p.size < 14); if (small.length) add('small-text', 'warn', `Text smaller than 14px: ${[...new Set(small.map(p => p.size + 'px'))].join(', ')} (${small.reduce((a, p) => a + p.count, 0)} element(s)).`);
  const kb = htmlBytes / 1024;
  if (kb > 102) f.push({ area: 'size', id: 'gmail-clip', level: 'error', message: `${kb.toFixed(1)} KB. Gmail clips emails over about 102 KB and hides the rest behind "View entire message".` });
  else if (kb > 90) f.push({ area: 'size', id: 'gmail-near', level: 'warn', message: `${kb.toFixed(1)} KB is close to Gmail's 102 KB clipping limit.` });
  else f.push({ area: 'size', id: 'size-ok', level: 'info', message: `${kb.toFixed(1)} KB, under Gmail's 102 KB clipping limit.` });
  return f;
}
function contrastFindings(pairs, scheme) {
  const f = [];
  for (const p of pairs) {
    const need = p.large ? 3 : 4.5;
    if (p.image) f.push({ area: 'contrast', id: 'contrast-image', level: 'warn', message: `[${scheme}] "${p.sample}" sits over a background image, so its ratio cannot be measured here. Check it by eye.` });
    else if (p.ratio < need) f.push({ area: 'contrast', id: 'contrast-fail', level: 'error', message: `[${scheme}] ${p.fg} on ${p.bg} is ${p.ratio}:1, needs ${need}:1 ("${p.sample}", ${p.count} element(s)).` });
  }
  return f;
}

async function checkBuilt(html) {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  try {
    const out = { findings: [], contrast: {}, axe: {}, facts: null };
    for (const scheme of ['light', 'dark']) {
      const { ctx, page } = await open(browser, html, scheme, 600);
      out.contrast[scheme] = await page.evaluate(pageContrast);
      out.axe[scheme] = await runAxe(page);
      if (scheme === 'light') out.facts = await page.evaluate(pageFacts);
      await ctx.close();
    }
    const phone = await open(browser, html, 'light', 320); const pf = await phone.page.evaluate(pageFacts); await phone.ctx.close();
    out.findings.push(...factFindings(out.facts, Buffer.byteLength(html), out.contrast.light));
    if (pf.overflowX) out.findings.push({ area: 'accessibility', id: 'overflow-320', level: 'warn', message: 'At 320px wide the email needs sideways scrolling.' });
    for (const s of ['light', 'dark']) out.findings.push(...contrastFindings(out.contrast[s], s));
    for (const s of ['light', 'dark']) for (const v of out.axe[s].violations) out.findings.push({ area: 'accessibility', id: 'axe-' + v.id, level: v.id === 'color-contrast' ? 'info' : (v.impact === 'minor' ? 'warn' : 'error'), message: `[axe, ${s}] ${v.help} (${v.count} element(s)).` });
    return out;
  } finally { await browser.close(); }
}
module.exports = { checkBuilt };
