# Lab notebook: Kick Off → Your English, abandoned cart email

The experiments and measurements behind each decision, in the order they happened. The decisions are in [`BUILD-LOG.md`](../BUILD-LOG.md). The raw output of every stage is in [`logs/`](../logs/INDEX.md) and the pictures are in [`evidence/`](../evidence/).

Each entry says what I wanted to know, how I found out, what I found, and what I decided. Entries 1 to 13 come from the first pass through the project, and entries 14 to 18 from rebuilding it in this repository.

---

## 1. Does a strict build catch these faults? (stage 1)

**Question.** I planned to rely on MJML's strict build. Does it catch the faults that matter?
**Method.** I wrote small emails with one fault each and built them in strict mode with MJML 5.4.1.
**Result.** Strict mode refused an invalid unit, a colour with no `#`, and an unknown attribute. It **accepted** a missing `</mj-body>`, a repeated attribute, and an `mj-button` with no link.
**Decision.** Build source checks for the faults strict mode lets through. The draft later confirmed it: it passed the strict build and still had 21 errors.
**Saved:** [`email-checks/example/`](../email-checks/example/), [`logs/stage-1-checks-kit/`](../logs/stage-1-checks-kit/SUMMARY.md)

## 2. Do the checks agree with measuring by hand? (stage 1)

**Question.** Can I trust the contrast numbers the checks produce?
**Method.** In the first pass I ran the checks on a finished Kick Off email, the payment failure email, whose contrast I had already worked out by hand. That email belongs to a private project, so it is not in this repository.
**Result.** They agreed to two decimal places (12.63, 13.74, 3.98, 5.62 and 3.12 in light mode). The run also found four links with no accessible name, the social icons, which I had missed in that email.
**Decision.** Trust the numbers. Test every new check on a real email, not only on invented ones.

## 3. Why is the draft wider than the screen? (stage 2)

**Question.** The checks said the draft needed sideways scrolling at 320px. What was making it wide?
**Method.** I rendered the draft at 320px and listed every element wider than the screen, then read the HTML MJML had built for the button.
**Result.** The page was **440px wide**, at 414px as well as 320px. The button had a fixed `width="380px"` inside a column with 30px of padding on each side: 380 + 60 = 440. Because the button had no link, MJML drew it as a `<p>` 310px wide, so the `.button` rule in the style block never applied.
**Decision.** Remove the fixed width and give the button a link.
**Saved:** [`evidence/stage-2-first-check/email-light-320.png`](../evidence/stage-2-first-check/email-light-320.png) is 440px wide, and shows the email stopping at the edge of a 320px screen.

## 4. Where do the Facebook and Twitter icons really go? (stage 2)

**Question.** The checks warned about share links. What did MJML build?
**Method.** I compiled the draft and listed every link in the built HTML.
**Result.** `name="facebook"` built `facebook.com/sharer/sharer.php?u=your-facebook-link`, and `name="twitter"` built `twitter.com/intent/tweet?url=your-twitter-link`. Those are share links, not links to the brand's page. Instagram and YouTube built plain links, with the unusable addresses `your-instagram-link` and `your-youtube-link`.
**Decision.** Use `facebook-noshare` and `twitter-noshare`, and replace every link with a full https address.

## 5. Which footer colours pass? (stage 3)

**Question.** Two footer colours failed contrast. What replaces them?
**Method.** I used the palette tool on the candidates.

| Text | On `#4c78a3` (before) | On `#35597f` (candidate) |
| --- | --- | --- |
| `#ffffff` | 4.64:1 | 7.27:1 |
| `#ffd166` | 3.22:1 | 5.05:1 |
| `#ffa500` | 2.35:1 | 3.68:1, still fails |

I also measured the white icon glyphs on the orange `#ee7226`: 2.97:1, just under the 3:1 icons need. Black on that orange is 7.07:1.
**Decision.** The three blue sections become `#35597f`. The brand name in orange becomes the gold `#FFD166`, because the orange still fails. The icon backgrounds become black, which gives 21:1.

## 6. How wide should the button be? (stage 3)

**Question.** With the fixed width gone, how should the button behave?
**Method.** Two versions, each measured at 320, 600 and 1000px: the link's width, and the width of the blue cell around it.

| Version | Page at 320px | Link | Blue cell |
| --- | --- | --- | --- |
| `width="100%"`, with the `.button` rule kept | 320 | 254px | 260px at 320px, **540px at 600px** |
| `width="100%"`, with the rule removed | 320 | 254px | the same as above |
| No fixed width, rule removed | 320 | 254px | **254px** at 320, 600 and 1000px |

**Result.** With `width="100%"` the blue cell stretches to 540px but only the 254px link inside it can be clicked. With no fixed width the blue and the link are the same thing, 254 × 70px at every size.
**Decision.** No fixed width, and remove the `.button` rule, which put `display:flex` on a table cell and did nothing useful.

## 7. Which file does the size check measure? (stage 4)

**Question.** At stage 3 the kit said the fixed email was 37.1 KB, but the file `npm run build` wrote was 41,732 bytes, which is 40.8 KB. Why the difference?
**Method.** I built the same email two ways: with the MJML programming interface's default settings, and with formatting switched on.
**Result.** The default output is the unformatted one, and it is the smaller. With formatting on, it is **41,732 bytes, identical to the file `npm run build` writes**. The kit was measuring the unformatted version.
**Decision.** Measure the formatted HTML, which is the file that gets pasted into Brevo. After the change the kit says 40.8 KB for that email. Both are far under Gmail's 102 KB clipping limit.

## 8. The dark palette (stage 4)

**Question.** Which dark colours, and do they pass?
**Method.** Chosen with the palette tool, then measured by the checks in dark mode.

| Surface | Light | Dark | Text on it, in dark mode |
| --- | --- | --- | --- |
| Page | `#dfe0e7` | `#121212` | |
| White panels | `#FFFFFF` | `#1c1c1e` | `#f2f2f2`: 15.2:1. The support link in white: 17.01:1 |
| Product band | `#F0F0F0` | `#2a2a2d` | `#f2f2f2`: 12.78:1 |

The orange frame, the `#0055FF` button, the two footers and the black icons stay the same in both modes. The lowest ratio in the whole email is 5.05:1.
**Decision.** Use these.

## 9. Did dark mode change the light design? (stage 4)

**Question.** Adding dark mode must not alter light mode. How do I prove it?
**Method.** Render both emails in light mode with the same stand-in images, at three widths, and count the pixels that differ. I built the test first, in `email-checks/compare-light.js`, and tried it before changing the email.
**Result.** The test passed an email against itself, and it failed the draft against the fixed email: at 320px the draft was 440 × 2814 and the fixed email 320 × 2926, so the page sizes differ. After the change, the previous stage against this one: **0 pixels differ** at 600, 414 and 320px (pages 2547, 2849 and 2926px tall on my computer).
**Decision.** Keep the test, and use it at every stage that must not change the design.
**Saved:** [`logs/stage-4-dark-light/`](../logs/stage-4-dark-light/SUMMARY.md)

## 10. What can a pipeline check, and what can it not? (stage 5)

**Question.** The earlier pipeline checked that a value was present, short enough and safe. Is that enough for a cart email?
**Method.** I listed the six values and asked what a wrong one would look like.
**Result.** A quantity of "one" or a price of "free" would pass every existing rule. The pipeline had no way to say a value must look a certain way.
**Decision.** Add a format rule to the check script, and a deliberate break for each format to the tests. The tests now have 26 cases.

## 11. Did wiring in the data change the design? (stage 5)

**Question.** Replacing six typed-in values with tags must change nothing a reader sees.
**Method.** The comparison test, in light and in dark mode, filling both emails in with the exact values from the previous stage.
**Result.** **0 pixels differ**, in light and in dark, at 600, 414 and 320px. With a different customer (another name and cart link), a few thousand pixels differ, so the test can tell.
**Saved:** [`logs/stage-5-data/`](../logs/stage-5-data/SUMMARY.md)

## 12. Does the key guard really block a key? (stage 0b)

**Question.** This repository is public. Does the pre-commit guard stop a Brevo key being committed?
**Method.** Before the first commit, I installed the guard and tried two commits with fake keys: a file containing something shaped like a Brevo key, and a `.env` file forced past `.gitignore`.
**Result.** The key-shaped file: **blocked**. The `.env` file: **blocked**. After removing both, `git log` showed no commits, so nothing had slipped through. The first real commit, which includes `.env.example`, was allowed.
**Decision.** Keep the guard, and make `npm run setup:hooks` the first command after `git init`.

## 13. Which footer, and did only the footer change? (stage 5, follow-up)

**Question.** The test version's footer address and phone differed from the finished Kick Off emails. Which wording is right, and can I prove the change touched only the footer?
**Method.** I searched the finished emails for the wording, then compared the new email with the previous stage in light and dark mode, allowing differences only inside the footer text block.
**Result.** Every finished email says "1 Rua Des Bambous, Fortaleza, Ceara, Brazil" and "Tel +55 85 99601 2344". The test version said "Ceara 80001" and "+ 55 788 07 8124". After the change, every width said `CHANGED ONLY INSIDE`, with none outside the footer.
**A false alarm in the first pass.** My first attempt marked the new footer block with a class name, and reported pixels outside it. They were real: at 600px the old address wrapped onto two lines and the new one fits on one, so the old text block was taller, and the leftover pixels were where the old last line had been. The test was measuring only the new block.
**Decision.** Find the block by its wording in both emails, so the old and new heights are both covered, and add no class name. The MJML changes by the two footer lines and nothing else. The test also had to fail when something outside the footer changed, and it does.
**Saved:** [`logs/stage-5b-footer-confirmed/`](../logs/stage-5b-footer-confirmed/SUMMARY.md)

## 14. Is hand-written HTML the same email as the MJML build? (stage 5c)

**Question.** If I write the email by hand as plain HTML, can I show it is the same email, and not a lookalike?
**Method.** I wrote the HTML out by hand as nested tables with inline styles, kept the six Brevo tags, the dark-mode rules and the Outlook button, and compared it with the MJML build using the comparison test, with the same data filled into both.
**Result.** My first attempt was identical in light mode and **60 pixels off in dark mode**, all in the rounded corners of the white box in the orange band. MJML puts the rounded corner on the table itself, and I had put it on a cell inside two tables, so the dark background showed through differently at the corners. Moving the corner to the table made it exact: **0 pixels differ**, in light and dark, at 600, 414 and 320px.
**Checks on the test.** One text colour wrong by one level out of 255 (`#FFD166` to `#FFD167`) gave hundreds of differing pixels. One pixel of extra padding changed the page height. The kit passes the HTML with 0 errors and 1 warning, the placeholder links.
**Decision.** Keep `plain-html/email.html` as a second deliverable, with `npm run compare-html` as the proof that it still matches. The Outlook ghost tables and the VML button follow the pattern MJML writes, but they are untested in real Outlook.
**Saved:** [`logs/stage-5c-plain-html/`](../logs/stage-5c-plain-html/SUMMARY.md)

## 15. Why did the comparison say the two emails were 700 pixels apart? (stage 5c)

**Question.** The pixel comparison of the MJML build against the plain HTML failed: the MJML side was 600 × 1819, and the plain HTML 600 × 2547. Which one was wrong?
**Method.** The plain side matched the heights this computer had given for the full email before, so I suspected the MJML side. I wrote a small temporary diagnostic that renders both sides the way the test does and prints, for each, the number of images, the height of every image and section, and the page height. Then I checked the file on disk.
**Result.** The MJML side had **4 images and 6 sections, 23,487 characters**, against 10 images and 11 sections for the plain side. It stopped partway through the button block. On disk, `templates/email.mjml` contained the comment `Responsive Button Update` at line 122, and **did not contain** `Geo English Badge` or `</mjml>`. `npm run build` wrote 23,534 bytes instead of about 45,000, and the build check had already said: "These values are in the MJML but not in the built email: cartUrl."
**What it was not.** The compiler was not at fault: `mjml-core` and `mjml-cli` were both 5.4.1. Line endings were not at fault: the same email saved with Windows line endings built to the same 45,023 bytes. The email text I had pasted into the chat was complete.
**Decision.** The working file had been cut short. I restored it from a known-good copy, and the comparison then passed, six lines identical. From now on a long file is checked by its fingerprint and its line count after pasting, and the build check and the pixel test stay in the pipeline: between them they noticed the fault the first time they ran.

## 16. Do the page heights depend on the computer? (stage 4)

**Question.** The comparison test printed a page 2926px tall at 320px, and I had expected 2869px from an earlier run on another computer. Is something wrong?
**Method.** I looked for what differs between the computers.
**Result.** The fonts. This computer has the real Georgia and Tahoma, and the other one substituted its own. At 320px the text wraps differently, so the page is taller. At 600px the text rarely wraps and both computers gave 2547. The draft's width, 440px, was the same on both.
**Decision.** Judge the test by its verdict, `IDENTICAL` or `DIFFERENT`, and by the two sides of each line matching each other. Both emails in a comparison are drawn on the same computer with the same fonts, so the verdict does not depend on whose computer it is. The logs record the heights each time, and the build log uses the heights from this computer.

## 17. What did npm do to the lock file? (stage 4)

**Question.** Adding one package, `pngjs`, changed `package-lock.json` by 583 deleted lines. Is something missing?
**Method.** I listed the removed entries, and ran `npm ls --depth=0`. I also reproduced both installs in a clean folder.
**Result.** The removed entries were all a family of packages, `postcss-*`, `cssnano-utils` and `stylehacks`, which come from MJML itself. In a clean install npm keeps two copies of several of them, one nested inside `mjml-core` and one at the top. This computer's newer npm merged the duplicates on its second install. `npm ls --depth=0` listed `axe-core`, `mjml`, `playwright` and `pngjs` with no `missing` or `extraneous` lines. In the clean folder, an older npm added only 12 lines.
**Decision.** Harmless. Keep the lock file as npm wrote it, and record it here, because a large deletion in a lock file looks alarming when it is not.

## 18. Did the real Brevo behave like the simulated one? (stage 6)

**Question.** The tests so far used a simulated Brevo and a stand-in for Brevo's tag language. Does the real thing agree?
**Method.** With my own Brevo account, a short-lived API key held only in `.env`, and the built `dist/email.html` pasted into a new email in Brevo and activated: `npm run send:dry`, then `npm run send:sandbox`, then `npm run test:brevo`, which sends one real email to my own address after I type SEND.
**Result.** The email arrived in my inbox, and everything in it was as it should be. I found no problems.
**What it does not show.** One inbox. Gmail, Outlook and the other clients can still draw the email differently, and that is stage 7. Brevo's documentation also warns that its IP security can reject a request from an address it does not know once its learning phase ends. It did not here.
**Decision.** The send script and the data design stand as they are.