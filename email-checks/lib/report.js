'use strict';
const esc = s => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const table = (head, rows) => rows.length ? ['| ' + head.join(' | ') + ' |', '| ' + head.map(() => '---').join(' | ') + ' |', ...rows.map(r => '| ' + r.map(esc).join(' | ') + ' |')].join('\n') : '_Nothing to report._';
const count = (list, area, level) => list.filter(f => f.area === area && f.level === level).length;

function renderReport({ file, versions, strict, softErrors, findings, result, paramsFile }) {
  const L = [];
  L.push(`# Email checks: ${file}`, '', `Run on ${new Date().toISOString().slice(0, 10)}. MJML ${versions.mjml || 'n/a'}, axe-core ${versions.axe || 'n/a'}, Chromium for the browser checks.`, paramsFile ? `The email was filled in with the test data in \`${paramsFile}\` before the browser checks.` : '', '');
  const areas = [['syntax', 'Syntax'], ['accessibility', 'Accessibility'], ['contrast', 'Contrast'], ['size', 'Size']];
  L.push('## Summary', '', table(['Area', 'Errors', 'Warnings', 'Notes'], areas.map(([a, n]) => [n, count(findings, a, 'error'), count(findings, a, 'warn'), count(findings, a, 'info')])), '');
  L.push(`**Result: ${result.pass ? 'PASS' : 'FAIL'}.** ${result.errors} error(s), ${result.warnings} warning(s).`, '');

  L.push('## 1. Syntax', '');
  L.push(strict.ok ? '**MJML strict build: passed.**' : `**MJML strict build: refused the file** (${strict.errors.length} problem(s)).`, '');
  if (!strict.ok) L.push(table(['Line', 'Part', 'Problem'], strict.errors.map(e => [e.line, e.tagName, e.message.trim()])), '');
  L.push('Checks on the source that a strict build does not make:', '');
  L.push(table(['Line', 'Level', 'Check', 'What it means'], findings.filter(f => f.area === 'syntax').map(f => [f.line == null ? '' : f.line, f.level, f.id, f.message])), '');

  L.push('## 2. Accessibility', '');
  L.push(table(['Level', 'Check', 'What it means'], findings.filter(f => f.area === 'accessibility' && !f.id.startsWith('axe-')).map(f => [f.level, f.id, f.message])), '');
  const ax = findings.filter(f => f.id.startsWith('axe-'));
  L.push('', '**axe-core rules, in light and dark mode:**', '', ax.length ? table(['Level', 'Result'], ax.map(f => [f.level, f.message])) : 'No axe-core violations in light or dark mode.', '');

  L.push('## 3. Contrast', '', 'Each row is one text colour on the background it really sits on. Text needs 4.5:1, or 3:1 if it is large (24px, or 18.66px and bold).', '');
  for (const s of ['light', 'dark']) {
    const rows = (result.contrast[s] || []).map(p => [p.sample, `${p.fg} on ${p.bg}`, p.image ? 'n/a (image)' : p.ratio + ':1', p.large ? '3:1' : '4.5:1', p.image ? 'Check by eye' : (p.ratio >= (p.large ? 3 : 4.5) ? 'Pass' : 'Fails'), p.size + 'px']);
    L.push(`**${s[0].toUpperCase() + s.slice(1)} mode:**`, '', table(['Text', 'Colours', 'Ratio', 'Needs', 'Result', 'Size'], rows), '');
  }
  L.push('## 4. What these checks cannot tell you', '',
    '- **Real email clients.** Dark mode here is the browser\'s own. Gmail and Outlook recolour emails in their own ways, so they still need testing in the clients your customers use.',
    '- **Screen reader order and wording.** The checks confirm alt text and link names exist. They cannot judge whether the reading order or the wording makes sense. Listen to it once with a screen reader.',
    '- **Background images.** Text over an image cannot be measured automatically.',
    '- **Anything a test cannot see:** tone, clarity and whether a person can act on the email.', '');
  return L.join('\n');
}
module.exports = { renderReport };
