# stage-5-data

Recorded 2026-11-06T15:00:34.397Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The six Brevo values replace the typed-in text. With the old values filled in, the email must be identical to the previous stage.

**Email:** `stages/04-data-wired.mjml`, filled in with `data/params.json`. Compared with `stages/03-dark-light-outlook-gmail.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js stages/04-data-wired.mjml --params data/params.json --out logs\stage-5-data` | 0 | PASS: 0 error(s), 8 warning(s). Report: logs\stage-5-data\04-data-wired-checks.md |
| 2 | `node email-checks/compare-light.js stages/03-dark-light-outlook-gmail.mjml stages/04-data-wired.mjml --params data/stage4-values.json` | 0 | 3 of 3 widths IDENTICAL (light mode) |
| 3 | `node email-checks/compare-light.js stages/03-dark-light-outlook-gmail.mjml stages/04-data-wired.mjml --params data/stage4-values.json --scheme dark` | 0 | 3 of 3 widths IDENTICAL (dark mode) |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-5-data/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 2509 |
| `email-light-320.png` | light | 320px | 320 x 2828 |
| `email-dark-600.png` | dark | 600px | 600 x 2509 |
| `email-dark-320.png` | dark | 320px | 320 x 2828 |
