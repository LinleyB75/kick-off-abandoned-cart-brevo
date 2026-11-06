# email-checks

The checks I run on an email before it goes anywhere near a client: **syntax**, **accessibility**, **contrast** and **size**, plus a tool for choosing colours.
One command runs the checks and writes a report that can go straight into a blog post or a build log.

## Install (once, in the email project)

```
npm install --save-dev mjml playwright axe-core pngjs nunjucks
npx playwright install chromium
```

## Run

```
node email-checks/run.js templates/email.mjml --params data/params.json
node email-checks/palette.js "#0b0b0c" "#ffffff" "#0057d8" --min 4.5
node email-checks/compare-light.js stages/03-dark-light-outlook-gmail.mjml templates/email.mjml --params data/stage4-values.json --scheme dark
```

| Command | What it does |
| --- | --- |
| `run.js <email.mjml or email.html>` | Runs the checks and writes `reports/<name>-checks.md` and `.json`. Exits with 1 when anything fails, so it can stop a build |
| `--params <data.json>` | Fills in the Brevo tags (`{{ params.x }}` and `{% if %}`) with that test data first, the way Brevo will, so the checks run on the email a customer sees. The report says which data was used |
| `--out <folder>` | Writes the report in that folder instead of `reports/` |
| `--no-browser` | Runs only the syntax checks |
| `palette.js <colours> [--min 4.5]` | Prints the contrast ratio of every text-on-background pair, best first |
| `compare-light.js <before> <after> [--params data.json] [--scheme dark]` | Renders both emails at 600, 414 and 320px, in light mode or in dark mode, and counts the pixels that differ. With `--params`, both emails are filled in with the same data first, so a change that only wires in data can be compared fairly. Exits with 1 if any differ |

## What it checks

| Area | What |
| --- | --- |
| Syntax | The MJML strict build, then 25 source checks that strict mode does not make: unclosed and unexpected closing tags, repeated attributes, buttons with no link, social icons with no alt text, icons that make share links, colours with no `#`, invalid units, file names used as alt text, links that cannot work in an email (`#home`, `your-link`, http, placeholders), a sans-serif font that falls back to serif and the reverse, `<br></br>`, `!important` typos, unbalanced style braces, no `lang`, no title |
| Accessibility | The built email in Chromium, in light and dark mode and at 320px. 24 axe-core rules that apply to email, plus language, title, alt text, link names, layout tables, headings, small text, emoji, a missing unsubscribe link, sideways scrolling, and any text still on a light background in dark mode |
| Contrast | Every piece of text against the background it really sits on, in light and dark mode. 4.5:1 for normal text, 3:1 for large text (24px, or 18.66px and bold). Text over a background image is flagged, not measured |
| Size | The built HTML against Gmail's clipping limit of about 102 KB, and the style blocks against Gmail's limit of about 16,384 characters. Measured on the formatted HTML that `npm run build` writes |

## Why a strict build is not enough

Tested with MJML 5.4.1, strict mode accepted a missing `</mj-body>`, a repeated attribute and an `mj-button` with no link. The source checks cover those.

## What it cannot tell you

- Real email clients. Dark mode here is the browser's own. Gmail and Outlook recolour emails in their own ways.
- Reading order and wording. Listen to the email once with a screen reader.
- Text over a background image. It is flagged, not measured.

## Tested against

A deliberately broken email, in `example/`, with the report it produced: 17 errors and 12 warnings from 22 different checks.

## If Chromium is somewhere else

Set `CHROMIUM_PATH` to the browser's path before running.
