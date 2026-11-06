# stage-2-first-check

Recorded 2026-11-06T14:59:34.594Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The checks on the draft as received. Failing is the expected result.

**Email:** `stages/01-draft-as-received.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js stages/01-draft-as-received.mjml --out logs\stage-2-first-check` | 1 | FAIL: 21 error(s), 7 warning(s). Report: logs\stage-2-first-check\01-draft-as-received-checks.md |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-2-first-check/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 2509 |
| `email-light-320.png` | light | 320px | 440 x 2715 |
| `email-dark-600.png` | dark | 600px | 600 x 2509 |
| `email-dark-320.png` | dark | 320px | 440 x 2715 |
