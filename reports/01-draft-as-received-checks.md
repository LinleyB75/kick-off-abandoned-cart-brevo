# Email checks: stages/01-draft-as-received.mjml

Run on 2026-11-05. MJML 5.4.1, axe-core 4.14.0, Chromium for the browser checks.

## Summary

| Area | Errors | Warnings | Notes |
| --- | --- | --- | --- |
| Syntax | 12 | 4 | 0 |
| Accessibility | 5 | 3 | 7 |
| Contrast | 4 | 0 | 0 |
| Size | 0 | 0 | 1 |

**Result: FAIL.** 21 error(s), 7 warning(s).

## 1. Syntax

**MJML strict build: passed.**

Checks on the source that a strict build does not make:

| Line | Level | Check | What it means |
| --- | --- | --- | --- |
| 99 | error | button-no-link | An mj-button has no link, so it is drawn as a button that goes nowhere. |
| 99 | warn | font-fallback | font-family "Tahoma, serif" is a sans-serif font that falls back to serif. If it is missing, the text switches to a serif face. End the list with sans-serif. |
| 128 | warn | social-share-link | The "facebook" icon makes a share link, not a link to your page. Use name="facebook-noshare" to link to your own page. |
| 128 | error | social-no-alt | A social icon link (facebook) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar. |
| 128 | error | link-not-absolute | A link uses "your-facebook-link", which is not a full address, so it cannot work in an email. Use a full https:// address. |
| 129 | warn | social-share-link | The "twitter" icon makes a share link, not a link to your page. Use name="twitter-noshare" to link to your own page. |
| 129 | error | social-no-alt | A social icon link (twitter) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar. |
| 129 | error | link-not-absolute | A link uses "your-twitter-link", which is not a full address, so it cannot work in an email. Use a full https:// address. |
| 130 | error | social-no-alt | A social icon link (instagram) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar. |
| 130 | error | link-not-absolute | A link uses "your-instagram-link", which is not a full address, so it cannot work in an email. Use a full https:// address. |
| 131 | error | social-no-alt | A social icon link (youtube) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar. |
| 131 | error | link-not-absolute | A link uses "your-youtube-link", which is not a full address, so it cannot work in an email. Use a full https:// address. |
| 141 | error | link-fragment | A link points at "#data-privacy". A link to a spot on the page goes nowhere in an email. Use a full https:// address. |
| 141 | error | link-fragment | A link points at "#home". A link to a spot on the page goes nowhere in an email. Use a full https:// address. |
| 141 | error | link-fragment | A link points at "#contact-us". A link to a spot on the page goes nowhere in an email. Use a full https:// address. |
| 1 | warn | no-lang | No lang attribute on <mjml>. MJML then writes lang="und", and screen readers have to guess the language. |

## 2. Accessibility

| Level | Check | What it means |
| --- | --- | --- |
| warn | lang-und | lang="und" means "undetermined". Set the real language so screen readers pronounce the text correctly. |
| info | colour-scheme-missing | No color-scheme meta tag. Apps will not know the email was designed for dark mode. |
| info | image-no-size | 4 image(s) have no width and height, so the layout can jump as they load. |
| error | link-fragment | 3 link(s) point at a spot on the page (#...), which goes nowhere in an email. |
| error | link-not-absolute | 2 link(s) are not full addresses (for example "your-facebook-link"), so they cannot work in an email. |
| info | emoji | Emoji in the text (💡 📩). Screen readers read each one aloud by name, for example "light bulb". |
| info | no-unsubscribe | No unsubscribe link. Marketing emails usually need one. Transactional emails usually do not. Check the rules where your customers are. |
| error | link-no-name | 4 link(s) have no accessible name. |
| warn | link-placeholder | 1 link(s) still point at a placeholder address. |
| info | heading-start | The first heading is an h3 ("Item Description:"). Start at h1 or h2 so the order makes sense. |
| warn | overflow-320 | At 320px wide the email needs sideways scrolling. |


**axe-core rules, in light and dark mode:**

| Level | Result |
| --- | --- |
| info | [axe, light] Elements must meet minimum color contrast ratio thresholds (3 element(s)). |
| error | [axe, light] Links must have discernible text (4 element(s)). |
| info | [axe, dark] Elements must meet minimum color contrast ratio thresholds (3 element(s)). |
| error | [axe, dark] Links must have discernible text (4 element(s)). |

## 3. Contrast

Each row is one text colour on the background it really sits on. Text needs 4.5:1, or 3:1 if it is large (24px, or 18.66px and bold).

**Light mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| Kick Off Your English | #ffa500 on #4c78a3 | 2.35:1 | 4.5:1 | Fails | 15px |
| © Kick Off Your English 1 Rua Des Bambous, F | #ffd166 on #4c78a3 | 3.22:1 | 4.5:1 | Fails | 15px |
| Data Privacy \| WebView \| Contact Us | #ffffff on #4c78a3 | 4.64:1 | 4.5:1 | Pass | 15px |
| Return to Your Cart | #ffffff on #0055ff | 5.61:1 | 3:1 | Pass | 20px |
| Follow us on: | #000000 on #ee7226 | 7.07:1 | 4.5:1 | Pass | 16px |
| Still Want This Product ?💡 | #333333 on #ffffff | 12.63:1 | 3:1 | Pass | 24px |
| Item Description: | #000000 on #f0f0f0 | 18.43:1 | 3:1 | Pass | 21.06px |
| Kick Off Your English Ebook CAT01 | #000000 on #f0f0f0 | 18.43:1 | 4.5:1 | Pass | 18px |
| Your Cart Linley... below | #000000 on #ffffff | 21:1 | 3:1 | Pass | 22px |
| If you would like to return to your cart ple | #000000 on #ffffff | 21:1 | 4.5:1 | Pass | 18px |

**Dark mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| Kick Off Your English | #ffa500 on #4c78a3 | 2.35:1 | 4.5:1 | Fails | 15px |
| © Kick Off Your English 1 Rua Des Bambous, F | #ffd166 on #4c78a3 | 3.22:1 | 4.5:1 | Fails | 15px |
| Data Privacy \| WebView \| Contact Us | #ffffff on #4c78a3 | 4.64:1 | 4.5:1 | Pass | 15px |
| Return to Your Cart | #ffffff on #0055ff | 5.61:1 | 3:1 | Pass | 20px |
| Follow us on: | #000000 on #ee7226 | 7.07:1 | 4.5:1 | Pass | 16px |
| Still Want This Product ?💡 | #333333 on #ffffff | 12.63:1 | 3:1 | Pass | 24px |
| Item Description: | #000000 on #f0f0f0 | 18.43:1 | 3:1 | Pass | 21.06px |
| Kick Off Your English Ebook CAT01 | #000000 on #f0f0f0 | 18.43:1 | 4.5:1 | Pass | 18px |
| Your Cart Linley... below | #000000 on #ffffff | 21:1 | 3:1 | Pass | 22px |
| If you would like to return to your cart ple | #000000 on #ffffff | 21:1 | 4.5:1 | Pass | 18px |

## 4. What these checks cannot tell you

- **Real email clients.** Dark mode here is the browser's own. Gmail and Outlook recolour emails in their own ways, so they still need testing in the clients your customers use.
- **Screen reader order and wording.** The checks confirm alt text and link names exist. They cannot judge whether the reading order or the wording makes sense. Listen to it once with a screen reader.
- **Background images.** Text over an image cannot be measured automatically.
- **Anything a test cannot see:** tone, clarity and whether a person can act on the email.
