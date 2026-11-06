# Email checks: stages/04-data-wired.mjml

Run on 2026-11-06. MJML 5.4.1, axe-core 4.14.0, Chromium for the browser checks.
The email was filled in with the test data in `data/params.json` before the browser checks.

## Summary

| Area | Errors | Warnings | Notes |
| --- | --- | --- | --- |
| Syntax | 0 | 7 | 0 |
| Accessibility | 0 | 1 | 5 |
| Contrast | 0 | 0 | 0 |
| Size | 0 | 0 | 2 |

**Result: PASS.** 0 error(s), 8 warning(s).

## 1. Syntax

**MJML strict build: passed.**

Checks on the source that a strict build does not make:

| Line | Level | Check | What it means |
| --- | --- | --- | --- |
| 168 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/facebook). |
| 169 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/twitter). |
| 170 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/instagram). |
| 171 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/youtube). |
| 181 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/privacy). |
| 181 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/web-version). |
| 181 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/contact). |

## 2. Accessibility

| Level | Check | What it means |
| --- | --- | --- |
| info | image-no-size | 4 image(s) have no width and height, so the layout can jump as they load. |
| info | emoji | Emoji in the text (💡 📩). Screen readers read each one aloud by name, for example "light bulb". |
| info | no-unsubscribe | No unsubscribe link. Marketing emails usually need one. Transactional emails usually do not. Check the rules where your customers are. |
| warn | link-placeholder | 7 link(s) still point at a placeholder address. |
| info | heading-start | The first heading is an h3 ("Item Description:"). Start at h1 or h2 so the order makes sense. |
| info | dark-surfaces-ok | In dark mode, no text sits on a light background. |


**axe-core rules, in light and dark mode:**

No axe-core violations in light or dark mode.

## 3. Contrast

Each row is one text colour on the background it really sits on. Text needs 4.5:1, or 3:1 if it is large (24px, or 18.66px and bold).

**Light mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| © Kick Off Your English 1 Rua Des Bambous, F | #ffd166 on #35597f | 5.05:1 | 4.5:1 | Pass | 15px |
| Return to Your Cart | #ffffff on #0055ff | 5.61:1 | 3:1 | Pass | 20px |
| Follow us on: | #000000 on #ee7226 | 7.07:1 | 4.5:1 | Pass | 16px |
| Data Privacy \| WebView \| Contact Us | #ffffff on #35597f | 7.27:1 | 4.5:1 | Pass | 15px |
| Still Want This Product?💡 | #333333 on #ffffff | 12.63:1 | 3:1 | Pass | 24px |
| Item Description: | #000000 on #f0f0f0 | 18.43:1 | 3:1 | Pass | 21.06px |
| Kick Off Your English Ebook CAT01 | #000000 on #f0f0f0 | 18.43:1 | 4.5:1 | Pass | 18px |
| Your Cart Alex... below | #000000 on #ffffff | 21:1 | 3:1 | Pass | 22px |
| If you would like to return to your cart ple | #000000 on #ffffff | 21:1 | 4.5:1 | Pass | 18px |

**Dark mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| © Kick Off Your English 1 Rua Des Bambous, F | #ffd166 on #35597f | 5.05:1 | 4.5:1 | Pass | 15px |
| Return to Your Cart | #ffffff on #0055ff | 5.61:1 | 3:1 | Pass | 20px |
| Follow us on: | #000000 on #ee7226 | 7.07:1 | 4.5:1 | Pass | 16px |
| Data Privacy \| WebView \| Contact Us | #ffffff on #35597f | 7.27:1 | 4.5:1 | Pass | 15px |
| Item Description: | #f2f2f2 on #2a2a2d | 12.78:1 | 3:1 | Pass | 21.06px |
| Kick Off Your English Ebook CAT01 | #f2f2f2 on #2a2a2d | 12.78:1 | 4.5:1 | Pass | 18px |
| Still Want This Product?💡 | #f2f2f2 on #1c1c1e | 15.2:1 | 3:1 | Pass | 22px |
| If you would like to return to your cart ple | #f2f2f2 on #1c1c1e | 15.2:1 | 4.5:1 | Pass | 18px |
| support@geoenglish.com.br | #ffffff on #1c1c1e | 17.01:1 | 4.5:1 | Pass | 18px |

## 4. What these checks cannot tell you

- **Real email clients.** Dark mode here is the browser's own. Gmail and Outlook recolour emails in their own ways, so they still need testing in the clients your customers use.
- **Screen reader order and wording.** The checks confirm alt text and link names exist. They cannot judge whether the reading order or the wording makes sense. Listen to it once with a screen reader.
- **Background images.** Text over an image cannot be measured automatically.
- **Anything a test cannot see:** tone, clarity and whether a person can act on the email.
