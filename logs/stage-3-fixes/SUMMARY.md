# stage-3-fixes

Recorded 2026-11-06T14:59:54.906Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The fixed email. The comparison with the draft must find differences.

**Email:** `stages/02-fixed.mjml`. Compared with `stages/01-draft-as-received.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js stages/02-fixed.mjml --out logs\stage-3-fixes` | 0 | PASS: 0 error(s), 9 warning(s). Report: logs\stage-3-fixes\02-fixed-checks.md |
| 2 | `node email-checks/compare-light.js stages/01-draft-as-received.mjml stages/02-fixed.mjml` | 1 | 0 of 3 widths IDENTICAL, 3 DIFFERENT (light mode) |
| 3 | `node email-checks/compare-light.js stages/01-draft-as-received.mjml stages/02-fixed.mjml --scheme dark` | 1 | 0 of 3 widths IDENTICAL, 3 DIFFERENT (dark mode) |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-3-fixes/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 2509 |
| `email-light-320.png` | light | 320px | 320 x 2828 |
| `email-dark-600.png` | dark | 600px | 600 x 2509 |
| `email-dark-320.png` | dark | 320px | 320 x 2828 |
