'use strict';
// Source checks for MJML. A strict build is not enough on its own: in testing with MJML 5.4.1,
// strict mode accepted a missing </mj-body>, a repeated attribute and an mj-button with no link.
// These checks cover what strict mode lets through.

const VOIDISH = new Set(['mj-image', 'mj-divider', 'mj-spacer', 'mj-carousel-image', 'mj-all', 'mj-class', 'mj-font', 'mj-breakpoint', 'mj-include']);
const NAMED = new Set(['transparent', 'white', 'black', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'brown', 'cyan', 'magenta', 'navy', 'teal', 'silver', 'maroon', 'olive', 'lime', 'aqua', 'fuchsia', 'gold', 'indigo', 'violet', 'coral', 'crimson', 'ivory', 'khaki', 'lavender', 'orchid', 'salmon', 'tan', 'tomato', 'turquoise', 'beige', 'azure', 'inherit', 'currentcolor']);
const FILE_LIKE_ALT = /\.(png|jpe?g|webp|gif|svg)$|screenshot|gemini|dall-?e|photoroom|img[_-]?\d|\d{6,}/i;
const TAG_RE = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<(\/?)([A-Za-z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^'">])*?)(\/?)>/g;
const ATTR_RE = /([A-Za-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

function checkSource(src) {
  const f = [];
  const add = (id, level, message, index) => f.push({ area: 'syntax', id, level, message, line: index == null ? null : src.slice(0, index).split('\n').length });
  const stack = [];

  for (const m of src.matchAll(TAG_RE)) {
    if (!m[2]) continue; // a comment
    const [, closing, nameRaw, attrText, selfClose] = m;
    const name = nameRaw.toLowerCase();
    const isMj = name === 'mjml' || name.startsWith('mj-');

    if (!closing) {
      const attrs = {};
      for (const a of attrText.matchAll(ATTR_RE)) {
        const key = a[1].toLowerCase(), val = a[2] != null ? a[2] : a[3];
        if (key in attrs) add('repeated-attribute', 'error', `<${name}> repeats the attribute "${key}". Only the first one is used, so the second is silently ignored.`, m.index);
        attrs[key] = val;
        if (isMj && /(^|-)color$/.test(key)) {
          const v = val.trim().toLowerCase();
          if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(v) && !NAMED.has(v)) add('colour-no-hash', 'error', `<${name}> ${key}="${val}" has no # in front of the hex value.`, m.index);
          else if (v.startsWith('#') && !/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/.test(v)) add('colour-invalid', 'error', `<${name}> ${key}="${val}" is not a valid colour.`, m.index);
        }
        if (isMj && /\d\s*rpx\b/.test(val)) add('unit-invalid', 'error', `<${name}> ${key}="${val}" uses rpx, which is not a CSS unit.`, m.index);
      }
      if (name === 'mj-button' && (!attrs.href || attrs.href.trim() === '' || attrs.href.trim() === '#')) add('button-no-link', 'error', 'An mj-button has no link, so it is drawn as a button that goes nowhere.', m.index);
      if (name === 'mj-image') {
        if (!('alt' in attrs)) add('image-no-alt', 'error', 'An mj-image has no alt attribute.', m.index);
        else if (attrs.alt.trim() !== '' && FILE_LIKE_ALT.test(attrs.alt)) add('image-alt-filename', 'warn', `An mj-image uses a file name as its alt text ("${attrs.alt.slice(0, 40)}"). A screen reader will read it out.`, m.index);
        else if (attrs.alt.trim() === '') add('image-alt-empty', 'info', 'An mj-image has empty alt text, which is right only for a purely decorative image.', m.index);
      }
      if (name === 'mj-social-element' && (attrs.alt == null || attrs.alt.trim() === '') && /^\s*$/.test(src.slice(m.index + m[0].length).split('<')[0])) add('social-no-alt', 'error', `A social icon link (${attrs.name || 'icon'}) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar.`, m.index);
      if (attrs.href !== undefined && /^https?:\/\/(www\.)?example\.(com|org|net)/i.test(attrs.href)) add('placeholder-link', 'warn', `A link still points at a placeholder address (${attrs.href.slice(0, 50)}).`, m.index);
      if (attrs.href !== undefined && attrs.href.trim() === '#') add('empty-link', 'warn', 'A link points at "#", which goes nowhere.', m.index);
      if (attrs.href !== undefined && /^http:\/\//i.test(attrs.href)) add('link-not-https', 'warn', `A link uses http, not https (${attrs.href.slice(0, 50)}).`, m.index);
      if (isMj && !selfClose && !VOIDISH.has(name)) stack.push({ name, index: m.index });
    } else if (isMj) {
      if (VOIDISH.has(name)) continue;
      const top = stack[stack.length - 1];
      if (top && top.name === name) stack.pop();
      else {
        const at = stack.map(s => s.name).lastIndexOf(name);
        if (at === -1) add('unexpected-close', 'error', `Found </${name}> with no matching opening tag.`, m.index);
        else { for (const s of stack.splice(at + 1)) add('unclosed-tag', 'error', `<${s.name}> is never closed.`, s.index); stack.pop(); }
      }
    }
  }
  for (const s of stack) add('unclosed-tag', 'error', `<${s.name}> is never closed.`, s.index);

  for (const m of src.matchAll(/<br\s*>\s*<\/br\s*>/gi)) add('br-closing-tag', 'warn', '<br></br> is read by browsers as two line breaks. Use <br /> once.', m.index);
  for (const m of src.matchAll(/!\s*(imporatnt|importnat|improtant|importent)/gi)) add('important-typo', 'error', `"!${m[1]}" is a misspelling of !important, so the rule is dropped.`, m.index);

  for (const m of src.matchAll(/<mj-style\b[^>]*>([\s\S]*?)<\/mj-style>/gi)) {
    const css = m[1].replace(/\/\*[\s\S]*?\*\//g, '');
    const open = (css.match(/{/g) || []).length, close = (css.match(/}/g) || []).length;
    if (open !== close) add('style-braces', 'error', `A style block has ${open} "{" and ${close} "}". The browser drops every rule after the break.`, m.index);
    if (/<!--/.test(css)) add('style-html-comment', 'warn', 'An HTML comment sits inside a style block. Use /* */ in CSS.', m.index);
  }

  if (!/<mjml\b[^>]*\blang="[A-Za-z-]+"/.test(src)) add('no-lang', 'warn', 'No lang attribute on <mjml>. MJML then writes lang="und", and screen readers have to guess the language.', 0);
  if (!/<mj-title\b/.test(src)) add('no-title', 'warn', 'No <mj-title>, so the built email has no document title.', 0);
  if (!/<mj-preview\b/.test(src)) add('no-preview', 'info', 'No <mj-preview>, so inbox apps show the first lines of the body as the preview text.', 0);
  return f;
}
module.exports = { checkSource };