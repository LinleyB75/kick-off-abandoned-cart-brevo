# BUILD-LOG: Kick Off → Your English, abandoned cart email

A real client, Kick Off → Your English (Geo English). A public repository, with test data only.
The client has agreed to be named, and its name, address and business details may be used here.
**The email in this repository is a test version**, built for this project and as close to the real email as I can make it. The client's original source files are not published.
I design, develop, program and test the email end to end, and I write my side of the API.

**How this repository was made.** The decisions, measurements and mistakes below were worked out in a first pass through the project, in a working session. This repository rebuilds that work stage by stage, on my computer, from the same files, and every command in it was run here. The Git history shows when each stage's files were committed. The raw output and the pictures for stages 1 to 5c were recorded afterwards, from the saved snapshots in `stages/`, as the date and time inside each log file show. The recorder itself was written after the stages, not before. Where this history differs from the first pass, the entry says so.

**Tools used:** MJML 5.4.1, Playwright 1.64.1 (Chromium), axe-core 4.14.0, pngjs 7.0.0, nunjucks (a stand-in for Brevo's tag language in tests), dotenv 16, Node.js v24.22.2.

---

## Decision: what is published

| | |
| --- | --- |
| The client's name, address and business details | Used here, with the client's permission |
| The client's original source files | **Not published**. They stay private |
| The email in this repository | A test version, as close to the real email as I can make it |
| The footer address and phone | The wording in the client's finished Kick Off emails |
| Real customer, order or payment data, and API keys | Never in this repository |

Everything in `stages/`, `reports/`, `logs/` and `evidence/` is about the test version. When the blog says "the email", it means the test version, and says so.

---

## Stage 0: the starting point

I started from a test version of the email that I wrote: 177 lines of MJML, as close to the real email as I could make it. The real source stays private. The test version is saved untouched as `stages/01-draft-as-received.mjml`.
It was a cart reminder with a logo, a banner, a product row, a button, social icons and a blue footer.
The draft mixed two brands: the title and the logo text said Frameler eyewear, while the product, price and footer were Kick Off Your English. **Decision: the email is for Kick Off → Your English.**

**Blog note:** the point of the post is that I started from a plain draft, as a developer, and let the checks decide what to fix.

## Stage 0b: the key guard comes before the first commit

This repository is public, so a leaked key would be public too. Before any email file went in, I installed a pre-commit guard (`npm run setup:hooks`) and tested it with fake keys:

| Attempt | Result |
| --- | --- |
| A file containing something shaped like a Brevo key, staged and committed | **Blocked** |
| A `.env` file, forced past `.gitignore` with `git add -f`, then committed | **Blocked** |
| Both removed, then `git log` | No commits yet. Nothing slipped through |
| The first commit: `.gitignore`, `.env.example`, `package.json` and the guard | Allowed |

The first commit is the guard. Every later commit in this repository went through it.

## Stage 1: the checks come first

**What:** before touching the draft, I built three checks and a colour tool, so every later stage is tested the same way.

| Check | What it does |
| --- | --- |
| Syntax | The MJML strict build, plus source checks that strict mode does not make |
| Accessibility | The built email in Chromium, in light and dark mode and at 320px: axe-core rules for email, plus language, title, alt text, link names, headings and small text |
| Contrast | Every piece of text against the background it really sits on, in both modes. 4.5:1 for normal text, 3:1 for large text |
| Palette | Contrast ratios for a set of colours, so colours are chosen by number before they are used |

**Why a strict build is not enough.** I tested MJML 5.4.1 directly. Strict mode accepted a missing `</mj-body>`, a repeated attribute, and an `mj-button` with no link. The source checks cover those.

**Tested the checks before trusting them:**
- A deliberately broken email (`email-checks/example/`): 17 errors and 11 warnings from 21 different checks when the kit was first built. After the share-link check was added in stage 2, the same email gives 17 errors, 12 warnings and 22 checks. The report in that folder is the second one.
- In the first pass, on a finished Kick Off email (the payment failure email, which is a private project), the contrast ratios agreed with my hand measurements to two decimal places, and the checks found four links with no accessible name, the social icons, which I had missed.

**How the kit grew.** The kit in this repository was built up in the order below, one commit at a time:

| When | What was added |
| --- | --- |
| Stage 1 | The syntax, accessibility, contrast and size checks, the palette tool and the report |
| Stage 2 | Links that cannot work in an email, icons that make share links, a font that falls back to the wrong kind, emoji, a missing unsubscribe link, a first heading that is not h1 or h2 |
| Stage 4 | The size measured on the formatted HTML, Gmail's limit on style blocks, light backgrounds in dark mode, and the comparison test |
| Stage 5 | Filling the email in with test data before checking it, and comparing in dark mode |
| Stage 5b | Allowing differences only inside a named part of the email |
| Stage 5c | Accepting plain HTML as well as MJML |
| Documentation | The recorder |

**Evidence:** [`logs/stage-1-checks-kit/`](logs/stage-1-checks-kit/SUMMARY.md). Experiments 1 and 2 in the [lab notebook](docs/lab-notebook.md).

## Stage 2: the first check of the draft

`npm run checks` on `stages/01-draft-as-received.mjml`, first with the kit as it was at the end of stage 1: **FAIL, 12 errors and 4 warnings.** That report is kept in `reports/first-run/`.
Reading the draft myself, I saw three kinds of fault the checks had missed: links like `#home` and `your-link`, a serif fallback on a sans font, and share links. I added a check for each, and the second report, in `reports/`, says **FAIL, 21 errors and 7 warnings.**
**The strict build passed.** Every error came from the checks around it.

**The order of the commits.** The kit's second version was uploaded through GitHub before the draft's own commit, so the history shows the extension first. The two reports show the true order of events.

| Found | Count | What it means for a reader |
| --- | --- | --- |
| Button with no link | 1 | It is drawn as a button and goes nowhere |
| Social icons with no alt text | 4 | A screen reader announces only "link" |
| Links that cannot work in an email | 7 | Four icons use `your-facebook-link` and similar, and three footer links use `#home` and similar |
| Icons that make share links | 2 | Facebook and Twitter build `sharer` links, not links to the brand's page |
| Text too low in contrast | 2 colour pairs, in both modes | `#ffa500` on `#4c78a3` is 2.35:1, and `#ffd166` on `#4c78a3` is 3.22:1. Both need 4.5:1 |
| Wider than the screen | 440px | Sideways scrolling at 320px **and at 414px** |
| No language | 1 | The email builds as `lang="und"` |
| A sans-serif font that falls back to serif | 1 | `Tahoma, serif` |
| A placeholder address | 1 | `support@example.com` |

**Why 440px.** The button had a fixed width of 380px, and its column had 30px of padding on each side. A phone is narrower than that. Because the button had no link, MJML drew it as a `<p>`, so the `.button` rule in the style block never applied.

**Notes, not errors:** two emoji (the screen reader says "light bulb"), no unsubscribe link, the first heading is an h3, no colour-scheme tags, and four images with no height.

**The checks needed correcting too.** The copyright sign was also being counted as an emoji, which I fixed. Lesson: test the checks on real emails, not only on invented ones.

**Blog note:** screenshot the FAIL summary and the contrast table. Take a real phone screenshot of the draft scrolling sideways.

**Evidence:** [`logs/stage-2-first-check/`](logs/stage-2-first-check/SUMMARY.md), and `evidence/stage-2-first-check/email-light-320.png`, which is 440px wide on a 320px screen. Experiments 3 and 4 in the [lab notebook](docs/lab-notebook.md).

## Stage 3: fix what the checks found

Saved as `stages/02-fixed.mjml`. Report: `reports/02-fixed-checks.md`.

| Change | Why |
| --- | --- |
| `<mjml lang="en">` | Screen readers need the language |
| The Frameler title and alt text now say Kick Off → Your English | Fixes the brand mix-up |
| The button has a link, no fixed width, and `Tahoma, sans-serif` | See below |
| Social icons: `facebook-noshare` and `twitter-noshare`, alt text on all four, black icon backgrounds | Page links, not share links. White on the orange was 2.97:1, under the 3:1 icons need |
| Footer links are full https addresses | `#home` goes nowhere in an email |
| The three blue footer sections are `#35597f`, and the orange text is `#FFD166` | Contrast, see below |
| Support address is `support@geoenglish.com.br` | It matches the client's other emails |
| "Product ?" is now "Product?" | A stray space |

**The button took two attempts.** First I made it `width="100%"`. Measuring showed the blue cell would be 540px wide while the link inside it stayed 254px, so most of the visible button could not be clicked. The final version has no fixed width. The button is **254 × 70px at every screen size**, and the blue and the link are the same thing.

| Text | Before | After |
| --- | --- | --- |
| Brand name in the footer | `#ffa500` on `#4c78a3`: 2.35:1 | `#FFD166` on `#35597f`: 5.05:1 |
| Address and phone | `#ffd166` on `#4c78a3`: 3.22:1 | `#FFD166` on `#35597f`: 5.05:1 |
| Footer links | `#ffffff` on `#4c78a3`: 4.64:1 | `#ffffff` on `#35597f`: 7.27:1 |

**Result: PASS, 0 errors and 0 contrast failures.** The 9 warnings are all the placeholder links. The lowest contrast in the email is 5.05:1.

**The first build.** `npm run build` compiles the email in strict mode and writes `dist/email.html`, **41,732 bytes** for this stage. The checks also run on that built HTML on its own, with no MJML involved, and pass with 0 errors and 1 warning, the placeholder links. To see strict mode work, I built the deliberately broken email: it refused the colour with no `#` and the `rpx` unit, and said nothing about the missing closing tags, which is why the source checks exist.

**Blog note:** the before and after tables are the heart of this section. Screenshot the button measurement.

**Evidence:** [`logs/stage-3-fixes/`](logs/stage-3-fixes/SUMMARY.md). Experiments 5 and 6 in the [lab notebook](docs/lab-notebook.md): the footer colour options and the button width measurements.

## Stage 4: dark and light mode, with Outlook and Gmail measures

The rule: **light mode must not change.** I built the comparison test first, and showed it could fail, before changing the email. Saved as `stages/03-dark-light-outlook-gmail.mjml`. Report: `reports/03-dark-light-outlook-gmail-checks.md`.

**Dark mode, chosen with the palette tool:**

| Surface | Light | Dark |
| --- | --- | --- |
| Page | `#dfe0e7` | `#121212` |
| White panels | `#FFFFFF` | `#1c1c1e` |
| Product band | `#F0F0F0` | `#2a2a2d` |
| Text | `#333` and `#000` | `#f2f2f2` |
| Support link | `#000` | `#ffffff` |
| Unchanged in both | | the orange frame, the `#0055FF` button, the `#ee7226` and `#35597f` footers, the black icons |

Dark text ratios: `#f2f2f2` on `#1c1c1e` is 15.2:1, on `#2a2a2d` 12.78:1, and white on `#1c1c1e` 17.01:1. The lowest in the whole email is still 5.05:1.

**How it works:**
- `color-scheme` and `supported-color-schemes` tags, and `:root`, tell email applications that the email supports both modes.
- Dark rules sit inside `@media (prefers-color-scheme: dark)`, so light mode cannot change.
- Outlook.com and the Outlook applications mark their dark mode with `data-ogsb` and `data-ogsc`, so they get their own rules.
- Outlook desktop gets a **VML button** (260 × 70px, `arcsize` 17%) for rounded corners. Every other application gets the normal button. The two are wrapped in conditional comments so only one shows.
- Apple Mail and iOS: `format-detection` and `x-apple-data-detectors` stop the address and phone number turning into blue links.
- Gmail: the style blocks are 3,562 characters against a limit of about 16,384, and the built file is 44.0 KB against the 102 KB clipping limit.

**The proof that light did not change.** `npm run compare-light` renders the previous stage and this one in light mode and counts the pixels that differ. The page heights depend on the fonts installed on the computer, so these are the heights on my computer:

| Width | Page | Pixels that differ |
| --- | --- | --- |
| 600px | 600 × 2547 | 0 |
| 414px | 414 × 2849 | 0 |
| 320px | 320 × 2926 | 0 |

The same test run on the draft against the fixed email fails: a large number of pixels differ at 600px, and the page sizes differ at 414px and 320px, because the draft was 440px wide. So the test can tell the difference. The exact count is in the log.

**In dark mode no text sits on a light background**, which was not true before: stage 3 had 10 text elements on white or light grey.

**What this stage cannot prove:**
- Gmail ignores `prefers-color-scheme` and recolours emails itself, so nothing in the email can switch it on. Only testing in Gmail shows what it does.
- Outlook's own engine cannot be tested here. The VML is well formed, but how Outlook draws it needs real Outlook.
- The three hosted images may have white backgrounds, which would show as white blocks in dark mode.

**Blog note:** side-by-side screenshots of light and dark, the comparison output, and the VML button in real Outlook.

**Evidence:** [`logs/stage-4-dark-light/`](logs/stage-4-dark-light/SUMMARY.md), with the light and dark pictures in `evidence/stage-4-dark-light/`. Experiments 7, 8 and 9 in the [lab notebook](docs/lab-notebook.md).

## Stage 5: the data the email needs

Saved as `stages/04-data-wired.mjml`. The full table for a developer is `docs/data-design.md`, generated by `npm run data-design`.

**The problem.** Six things in the email were typed in: the customer's name, the product, its picture, the price, the quantity and the cart link. A real cart email needs each of them to come from the application. Working out exactly what it must send, and refusing anything wrong before it is sent, is my side of the API.

| Value | Required | The rule |
| --- | --- | --- |
| `firstName` | Optional | Text, up to 40 characters. Without it the heading reads "Your Cart... below" |
| `productName` | Required | Text, up to 120 characters. Also the product picture's alt text, which used to be a fixed phrase |
| `productImageUrl` | Required | An https address, no spaces, no username or credential in it |
| `price` | Required | Text, up to 30 characters, with a number in it, sent exactly as it should be shown ("$19.99 AUD") |
| `quantity` | Required | A whole number from 1 to 999, sent as text |
| `cartUrl` | Required | An https address, no spaces, no username or credential in it. Used by the button, and by the Outlook button |

**Decisions.**
- **Every value is text, and the email shows one product, as designed.** A cart with several products sends the main one. Supporting a list is a later change, because the checks read one flat object.
- **The price arrives already formatted.** The application knows the currency and the format. The email should not guess either.
- **A cart link may carry a cart id or token,** because many shops use one to restore a cart. It may not carry a password, a secret or an API key, or a username.
- **No value may look like a card number or a Brevo key,** whichever field it arrives in.

**One gap in my own pipeline.** It could check that a value was present, short enough, and safe. It could not check that a quantity was a number. I added a **format rule** to the check script, and a deliberate break for each format to the tests.

**The tests, run in order:**

| Test | Result |
| --- | --- |
| `npm run build`, the strict build | Passes. The build check warns only about the placeholder links on `example.com` |
| `npm run check-params` | OK: 5 required values, 1 optional, all passing the rules |
| `npm test`, which breaks the data on purpose | **26 of 26** behave as expected: every required value missing, a misspelt name, http, a space, a credential or username in an address, a quantity that is not a number, a price with no number, HTML, Brevo tags, a number instead of text, too long, a card number, a Brevo key, and over 100 KB |
| `npm run test:send`, against a simulated Brevo | **15 of 15** pass: the dry run, the sandbox, typing SEND, a wrong key, a missing key, and refusing bad data before any request |
| `npm run simulate`, the whole walkthrough | 9 pass and 1 warning. The warning is the placeholder links on `example.com`. With `firstName` left out, the same warning is the only one |
| `npm run checks`, with the email filled in with the test data | Passes: 0 errors, 8 warnings, all placeholder links. Contrast 0 failures, 44.0 KB |

**The proof that wiring in the data changed nothing a reader can see.** The comparison test (`npm run compare-light`, with `--scheme dark` for dark mode) fills both emails in with the exact values from the previous stage, then counts the pixels that differ:

| Width | Light | Dark |
| --- | --- | --- |
| 600px | 0 | 0 |
| 414px | 0 | 0 |
| 320px | 0 | 0 |

The same test with a different customer fails: a few thousand pixels differ, so it can tell the difference.

**The key guard is in use from the first commit** (see stage 0b), and `npm run verify` checks that it is installed, that `.env` is ignored and not tracked, and that nothing in the project is shaped like a Brevo key.

**What this stage cannot prove.** The tests use a simulated Brevo with a stand-in for its tag language. Real Brevo may treat the `{% if %}` fallback, an apostrophe, an ampersand or an accented letter differently. Stage 6 sends the email to the real thing.

**Blog note:** the table of values and the 26 deliberate breaks are the core of this section. Screenshot the guard blocking a key.

**Evidence:** [`logs/stage-5-data/`](logs/stage-5-data/SUMMARY.md), and the full test run in [`logs/stage-5b-footer-confirmed/`](logs/stage-5b-footer-confirmed/SUMMARY.md). Experiments 10, 11 and 12 in the [lab notebook](docs/lab-notebook.md).

## Stage 5, follow-up: the footer

Saved as `stages/05-footer-confirmed.mjml`, which is also `templates/email.mjml`. Recorded in [`logs/stage-5b-footer-confirmed/`](logs/stage-5b-footer-confirmed/SUMMARY.md).

**The problem.** The test version's footer did not match the finished Kick Off emails. Now that the client's details can be used here, I found the wording in the payment failure, 2FA, account setup and receipt emails and compared.

| | The test version had | The finished Kick Off emails have |
| --- | --- | --- |
| Address | 1 Rua Des Bambous, Fortaleza, Ceara 80001, Brazil | 1 Rua Des Bambous, Fortaleza, Ceara, Brazil |
| Phone | Tel + 55 788 07 8124 | Tel +55 85 99601 2344 |

**The decision.** I used the finished emails' wording. The change is exactly two lines of MJML.

**The proof that only the footer changed.** The comparison test with `--within-text "Rua Des Bambous"` allows differences only inside the footer text block, as it was and as it is now. At 600px, 414px and 320px, in light and in dark mode, every line says `CHANGED ONLY INSIDE`, with **0 pixels outside the footer**. The pixel counts and positions depend on the computer's fonts, so they are in the log, not here. Without the allowance the same comparison fails, and against the draft it fails even with the allowance, so the test can say no.

**The pipeline, run again after the change:** the strict build passes, the data check is OK, 26 of 26 data tests, 15 of 15 send tests, the simulated walkthrough gives 9 passes and 1 warning, and the email checks give 0 errors with 8 warnings, all placeholder links.

## Stage 5, follow-up: the same email as plain, hand-written HTML

Saved as `plain-html/email.html`. Recorded in [`logs/stage-5c-plain-html/`](logs/stage-5c-plain-html/SUMMARY.md).

**The problem.** Some clients want plain HTML and no build step, and some developers will edit the final HTML. I wanted to show that the plain HTML version is not a different email.

**What it is.** The same email written out by hand as nested tables with inline styles and one style block: the same six Brevo tags, the same dark-mode rules, the Outlook button and the Outlook ghost tables. It is indented so that a person can read it, with a comment above each section. It has no MJML in it.

**The proof.**
- **The same checks.** `npm run checks:html` passes with 0 errors and 1 warning, the placeholder links, and the lowest contrast is the same 5.05:1.
- **The same six tags**, with the same counts: `cartUrl` twice, `productName` twice, and `firstName`, `price`, `productImageUrl` and `quantity` once each.
- **The same pixels.** `npm run compare-html` compares the MJML build with the plain HTML, with the same data filled into both: **0 pixels differ**, in light and in dark mode, at 600px, 414px and 320px (page heights 2547, 2849 and 2926 on my computer).
- **The test can say no.** A copy with one text colour wrong by a single level (`#FFD166` to `#FFD167`) shows hundreds of pixels differing, and a copy with one pixel of extra padding changes the page height.

**A fault the pixel test found in my first attempt.** My first version was identical in light mode and 60 pixels off in dark mode, all in the rounded corners of the white box in the orange band. MJML puts the rounded corner on the table itself, and I had put it on a cell nested two tables deep, so the dark background showed through differently. Moving the corner to the table made it exact.

**What this cannot prove.** The Outlook ghost tables and the VML button follow the same pattern as MJML's own output, but they have not been tried in real Outlook. And "identical" means identical in Chromium, with the same fonts on both sides.

## Stage 6: Brevo

**Done.** I made an API key in Brevo with a short expiry and put it only in `.env`, which Git ignores and the guard blocks. I made the email in Brevo from the built `dist/email.html`, activated it, and put its template ID and my test address in `.env`. Then, in order: `npm run send:dry`, `npm run send:sandbox`, and `npm run test:brevo`, which sends one real email to my own address after I type SEND.

Brevo's current documentation agrees with how the send script works: the sandbox flag goes in the JSON `headers` object, and the sandbox only checks the request, so how the email looks has to be tested with a real send. It also says that Brevo's IP security can reject a request from an address it does not know once its learning phase ends, and that adding the address under Security, Authorized IPs fixes it.

**What I saw in the real inbox.** The email arrived in my own inbox, and everything in it was as it should be. I found no problems. That is one inbox. The other clients are in stage 7.

## Stage 7: real email clients

I sent the real test email, through my own Brevo account, to my own addresses and opened it in Gmail on the web, Gmail on my phone and Apple Mail, in light and dark mode. What each one did, and the pictures, are in [`evidence/stage-7-clients/RESULTS.md`](evidence/stage-7-clients/RESULTS.md).

**Not tested:** Outlook, in any version, and other clients such as Yahoo. I decided to stop here. The Outlook button and the Outlook dark-mode rules are written and checked in Chromium, but they have never been seen in real Outlook, and this log says so.

## Stage 8: handoff

Written as one page for the client's developer: [`docs/handoff.md`](docs/handoff.md). It says what they receive, how to set the email up in Brevo, what their application sends, what they supply, what is still open with the client, and what was and was not tested, Outlook included.

---

## What went wrong so far

1. **I missed the social icons' alt text on an earlier email.** The new checks found it.
2. **My first run of the checks missed three kinds of fault.** I found them by reading the file and added checks.
3. **The first fix for the button looked right and was not.** Measuring showed the clickable area was smaller than the visible button.
4. **I wrongly believed strict mode catches a missing closing tag.** Testing showed it does not, and that is why the source checks exist.
5. **The kit measured a different size from the file I would hand over.** It measured unformatted HTML (37.1 KB), and the build writes formatted HTML (40.8 KB at that stage). The kit now measures the same file.
6. **My own pipeline could not check a format.** It could say a quantity was present and short, but not that it was a number. I added a format rule and tested it.
7. **The finished email was cut short on disk.** After a paste, `templates/email.mjml` stopped partway through the button block. The build came out at 23 KB instead of 45 KB, the build check said the cart link had been lost, and the pixel comparison with the plain HTML failed. I restored the file and the comparison then passed. Lesson: after pasting a long file, check its fingerprint and its line count.
8. **I assumed the page heights I measured would be the same on every computer.** They are not: the fonts installed change how text wraps, so the heights differ between my computers. What the comparison test judges is whether two emails match each other on the same computer, so its verdict does not depend on fonts, and the logs record the heights each time.
9. **My first plain HTML version was off by 60 pixels in dark mode.** See the stage 5c entry.

## Open items

- **Real addresses.** The cart link, four social links and three footer links are placeholders on `example.com`.
- **An unsubscribe link.** A commercial email usually needs one. It is platform-specific, so it is decided with the client.
- **Multi-product carts.** The email shows one product. The client should say whether that is enough.
- **Images with white backgrounds** in dark mode. The Gmail and Apple Mail results are in `evidence/stage-7-clients/RESULTS.md`.
- **Real Outlook.** Not tested. The rounded Outlook button and the Outlook dark-mode rules are unproven.

## Where everything is saved

| What | Where |
| --- | --- |
| The email at the end of each stage | `stages/` |
| The email as plain, hand-written HTML | `plain-html/email.html` |
| The report the checks wrote at each stage | `reports/` |
| The raw output of every command, with the time and the exit code, and a summary | `logs/`, starting at [`logs/INDEX.md`](logs/INDEX.md) |
| Pictures of the email in light and dark mode, at 600px and 320px | `evidence/` |
| The email in real clients | `evidence/stage-7-clients/` |
| The experiments and measurements behind each decision | [`docs/lab-notebook.md`](docs/lab-notebook.md) |
| The decisions, the numbers and the mistakes | This file |
| The values the email takes, for the developer handoff | [`docs/data-design.md`](docs/data-design.md) |
| One page for the client's developer | [`docs/handoff.md`](docs/handoff.md) |
| The order things happened in, one commit per stage | The Git history |

The pictures use the real images from the network, so they show the email as a reader would see it. The comparison tests use grey squares in place of the images, so that only layout and colour are compared.

## How this log is kept

At the end of every stage, in this order:

1. Save the email in `stages/`.
2. Run `npm run record -- stage-N-name` with the options for that stage. It saves the raw output and the pictures.
3. Add each experiment and measurement to the [lab notebook](docs/lab-notebook.md), with the question, the method, the result and the decision.
4. Write the entry above with the real numbers, the decisions and the mistakes.
5. Update the status table in the README.
6. Commit.