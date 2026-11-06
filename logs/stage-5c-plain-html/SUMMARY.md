# stage-5c-plain-html

Recorded 2026-11-06T15:00:50.804Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The same email as plain, hand-written HTML. It must be identical to the MJML build.

**Email:** `plain-html/email.html`, filled in with `data/params.json`. Compared with `templates/email.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js plain-html/email.html --params data/params.json --out logs\stage-5c-plain-html` | 0 | PASS: 0 error(s), 1 warning(s). Report: logs\stage-5c-plain-html\email-checks.md |
| 2 | `node email-checks/compare-light.js templates/email.mjml plain-html/email.html --params data/params.json` | 0 | 3 of 3 widths IDENTICAL (light mode) |
| 3 | `node email-checks/compare-light.js templates/email.mjml plain-html/email.html --params data/params.json --scheme dark` | 0 | 3 of 3 widths IDENTICAL (dark mode) |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-5c-plain-html/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 2509 |
| `email-light-320.png` | light | 320px | 320 x 2828 |
| `email-dark-600.png` | dark | 600px | 600 x 2509 |
| `email-dark-320.png` | dark | 320px | 320 x 2828 |
