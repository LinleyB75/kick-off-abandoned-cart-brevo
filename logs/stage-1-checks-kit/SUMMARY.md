# stage-1-checks-kit

Recorded 2026-11-06T14:59:22.564Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The checks run on a deliberately broken email. Failing is the expected result.

**Email:** `email-checks/example/broken-email.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js email-checks/example/broken-email.mjml --out logs\stage-1-checks-kit` | 1 | FAIL: 17 error(s), 12 warning(s). Report: logs\stage-1-checks-kit\broken-email-checks.md |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-1-checks-kit/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 900 |
| `email-light-320.png` | light | 320px | 320 x 900 |
| `email-dark-600.png` | dark | 600px | 600 x 900 |
| `email-dark-320.png` | dark | 320px | 320 x 900 |
