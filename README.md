# Kick Off → Your English: abandoned cart email

The email Kick Off → Your English (Geo English) sends when someone leaves items in their cart.

I design, develop, program and test the email end to end, and I write my side of the API. The client's developer connects it to their application, decides when it is sent, supplies the real values, and keeps the API key. The client, Geo English, has agreed to be named, and its name, address and business details are used here with its permission.

**The email in this repository is a test version.** I built it for this project and made it as close to the real email as I can, so that every check and test here is meaningful. The client's original source files are not published.

**This repository is public and every stage is documented. Read [`BUILD-LOG.md`](BUILD-LOG.md) from the top: it is the story of the build, with the numbers. The raw output behind every number is in [`logs/`](logs/INDEX.md), and the experiments are in the [lab notebook](docs/lab-notebook.md).**

## Who does what

| Part | Who |
| --- | --- |
| The design and build of the email, in light and dark mode, with Outlook and Gmail measures | Me |
| The email as plain, hand-written HTML, proven identical to the MJML build | Me |
| The values the email needs, and the rules for each one: [`docs/data-design.md`](docs/data-design.md) | Me |
| My side of the API: the request, a Node.js reference for the send step, and the checks that refuse bad data | Me |
| The email set up in Brevo and tested, including a real send to my own inbox | Me |
| Testing in real email clients, in light and dark mode | Me |
| Connecting the application, and deciding when the email is sent | Your developer |
| Sending the real values: the customer, the product and the cart link | Your developer |
| The Brevo API key, which never goes in this repository | Your developer |
| The real links, the footer details, the subject line, and whether the email needs an unsubscribe link | The client |

## Rules for a public repository

- **Test data only.** No real customer, order or payment data anywhere. Every value in `data/` is made up.
- **No keys.** `.env` is ignored by Git, and a pre-commit guard blocks any commit that contains a `.env` file or something shaped like a Brevo key. Install it once with `npm run setup:hooks`.
- **A test version, not the original.** The client's name, address and contact details may be used. The client's original source files are not published, and nothing in this repository is them. Anything still to be confirmed with the client is listed under "Open items" in the build log.

## Status

| Stage | What | State |
| --- | --- | --- |
| 1 | The checks: syntax, accessibility, contrast | Done |
| 2 | First check of the draft | Done: fails, first with 12 errors, then 21 once the checks were extended |
| 3 | Fix what the checks found, and the first build | Done: passes, 0 errors |
| 4 | Dark and light mode, Outlook and Gmail measures | Done: light design identical, 0 pixels differ |
| 5 | The data the email needs: JSON, Node.js checks | Done: 26 of 26 data tests, 15 of 15 send tests, design identical, 0 pixels differ |
| 5b | The footer matches the client's finished emails | Done: 2 lines changed, differences only inside the footer |
| 5c | The same email as plain, hand-written HTML | Done: passes the same checks, 0 pixels differ from the MJML build |
| 6 | Brevo: the email, the API call, sandbox, a real send to my own inbox | Done: the real email arrived as it should |
| 7 | Real email clients, light and dark | Not started |
| 8 | Handoff to the client's developer | Not started |

## Quick start

Needs Node.js 20 or newer.

```
npm install
npx playwright install chromium
npm run build           builds dist/email.html in strict mode, then warns about leftovers
npm run check-params    checks data/params.json against the email and the rules
npm test                breaks the data on purpose: every break must be caught
npm run test:send       tests the send script against a simulated Brevo
npm run simulate        the whole Brevo walkthrough against a simulated Brevo
npm run checks          syntax, accessibility and contrast, with the email filled in with the test data
npm run checks:html     the same checks on the plain HTML version
npm run compare-html    proves the plain HTML is pixel-identical to the MJML build, then run it with --scheme dark
npm run compare-light -- <before> <after> [--params data.json] [--scheme dark] [--within-text "words"]
                        proves a change did not alter the design, or changed only the part it should
npm run data-design     rewrites docs/data-design.md from the settings and the email
npm run verify          ready to push? Run it after git init and npm run setup:hooks
npm run send:dry        prints the request to Brevo and sends nothing
npm run record -- stage-name --pipeline    saves the raw output and pictures for a stage
```

`npm run send:sandbox`, `npm run send:live` and `npm run test:brevo` need a `.env` file made from `.env.example`, with your own key, template ID and test address. They are for stage 6.

## What is in the folder

| Path | What it is |
| --- | --- |
| `templates/email.mjml` | The email, in MJML. This is the file I edit |
| `dist/email.html` | The built email. Never edited by hand |
| `plain-html/email.html` | The same email written by hand as plain HTML, with no MJML |
| `project.config.js` | The one settings file: the values, their rules, and what the tests look for |
| `data/` | Made-up test data. `stage4-values.json` holds the exact values typed into the stage 4 email, for the comparison |
| `docs/data-design.md` | The table of values for the developer handoff, generated |
| `check-params.js`, `send.js` | The data checks, and the send script with its dry-run, sandbox and live modes |
| `scripts/` | The tests, the simulated Brevo, the recorder, the Git guard and the setup check |
| `stages/` | The email as it was at the end of each stage, so any change can be compared |
| `reports/` | The report the checks wrote at each stage |
| `logs/` | The raw output of every command at every stage, with the time and the exit code. Start at `logs/INDEX.md` |
| `evidence/` | Pictures of the email at each stage, in light and dark mode, at 600px and 320px |
| `docs/lab-notebook.md` | The experiments and measurements behind each decision |
| `email-checks/` | The checks kit: syntax, accessibility, contrast, palette and the comparison test |
| `BUILD-LOG.md` | Every stage: what I did, why, the numbers, the decisions and the mistakes |