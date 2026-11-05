#!/usr/bin/env node
'use strict';
// Choose colours by their contrast ratios BEFORE designing with them.
// Usage: node email-checks/palette.js "#0b0b0c" "#ffffff" "#0057d8" "#f2f2f2" [--min 4.5]
// Prints every text-on-background pair, best first, with the WCAG verdict for normal and large text.
const args = process.argv.slice(2);
const minAt = args.indexOf('--min'); const min = minAt > -1 ? parseFloat(args[minAt + 1]) : 0;
const colours = args.filter((a, i) => !a.startsWith('--') && !(minAt > -1 && i === minAt + 1));
const norm = c => { let h = c.trim().toLowerCase().replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); if (!/^[0-9a-f]{6}$/.test(h)) throw new Error(`"${c}" is not a hex colour`); return '#' + h; };
const lum = hex => { const v = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
if (colours.length < 2) { console.error('Give at least two hex colours.'); process.exit(2); }
const list = [...new Set(colours.map(norm))]; const rows = [];
for (const fg of list) for (const bg of list) if (fg !== bg) { const r = ratio(fg, bg); if (r >= min) rows.push({ fg, bg, r }); }
rows.sort((a, b) => b.r - a.r);
const verdict = (r, need) => (r >= need ? 'Pass' : 'Fails');
console.log('| Text | On background | Ratio | Normal text (4.5:1) | Large text (3:1) | Enhanced (7:1) |\n| --- | --- | --- | --- | --- | --- |');
for (const { fg, bg, r } of rows) console.log(`| ${fg} | ${bg} | ${r.toFixed(2)}:1 | ${verdict(r, 4.5)} | ${verdict(r, 3)} | ${verdict(r, 7)} |`);