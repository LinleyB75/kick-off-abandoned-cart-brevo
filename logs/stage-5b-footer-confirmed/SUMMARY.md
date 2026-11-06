# stage-5b-footer-confirmed

Recorded 2026-11-06T15:11:49.096Z on Node v24.22.2. MJML 5.4.1, Playwright 1.64.1, axe-core 4.14.0.

**Context:** The footer takes the client finished wording, two lines. Only the footer may change. The whole pipeline is run again on the finished project.

**Email:** `stages/05-footer-confirmed.mjml`, filled in with `data/params.json`. Compared with `stages/04-data-wired.mjml`.

## Commands, with the raw output saved beside this file

| # | Command | Exit code | The line that matters |
| --- | --- | --- | --- |
| 1 | `node email-checks/run.js stages/05-footer-confirmed.mjml --params data/params.json --out logs\stage-5b-footer-confirmed` | 0 | PASS: 0 error(s), 8 warning(s). Report: logs\stage-5b-footer-confirmed\05-footer-confirmed-checks.md |
| 2 | `node email-checks/compare-light.js stages/04-data-wired.mjml stages/05-footer-confirmed.mjml --params data/params.json --within-text "Rua Des Bambous"` | 0 | 0 of 3 widths IDENTICAL, 3 CHANGED ONLY INSIDE the named area (light mode) |
| 3 | `node email-checks/compare-light.js stages/04-data-wired.mjml stages/05-footer-confirmed.mjml --params data/params.json --scheme dark --within-text "Rua Des Bambous"` | 0 | 0 of 3 widths IDENTICAL, 3 CHANGED ONLY INSIDE the named area (dark mode) |
| 4 | `npm run build` | 0 | Built dist/email.html (44 KB). |
| 5 | `npm run check-params` | 0 | OK: the names match and the values pass the safety rules. |
| 6 | `npm test` | 0 | 26 of 26 behave as expected. |
| 7 | `npm run test:send` | 0 | 15 PASS, 0 FAIL, 0 WARN. All send.js tests passed (against a simulated Brevo server,  |
| 8 | `npm run simulate` | 0 | 9 PASS, 0 FAIL, 1 WARN |
| 9 | `npm run data-design` | 0 | Wrote docs/data-design.md (6 values, 1 optional). |
| 10 | `npm run verify` | 0 | All checks passed. Ready to push. |

An exit code of 1 from a check means the check failed. For a stage that starts from a faulty draft, that is the expected result.

## Pictures

Saved in `evidence/stage-5b-footer-confirmed/`. The real images were loaded.

| Picture | Mode | Screen width | Page size |
| --- | --- | --- | --- |
| `email-light-600.png` | light | 600px | 600 x 2509 |
| `email-light-320.png` | light | 320px | 320 x 2828 |
| `email-dark-600.png` | dark | 600px | 600 x 2509 |
| `email-dark-320.png` | dark | 320px | 320 x 2828 |
