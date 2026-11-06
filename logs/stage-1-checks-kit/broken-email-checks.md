# Email checks: email-checks/example/broken-email.mjml

Run on 2026-11-06. MJML 5.4.1, axe-core 4.14.0, Chromium for the browser checks.


## Summary

| Area | Errors | Warnings | Notes |
| --- | --- | --- | --- |
| Syntax | 10 | 7 | 1 |
| Accessibility | 5 | 5 | 7 |
| Contrast | 2 | 0 | 0 |
| Size | 0 | 0 | 2 |

**Result: FAIL.** 17 error(s), 12 warning(s).

## 1. Syntax

**MJML strict build: refused the file** (2 problem(s)).

| Line | Part | Problem |
| --- | --- | --- |
| 8 | mj-section | Attribute background-color has invalid value: FFF for type Color |
| 10 | mj-image | Attribute width has invalid value: 120rpx for type Unit, only accepts (px) units and 1 value(s) |

Checks on the source that a strict build does not make:

| Line | Level | Check | What it means |
| --- | --- | --- | --- |
| 8 | error | colour-no-hash | <mj-section> background-color="FFF" has no # in front of the hex value. |
| 10 | error | unit-invalid | <mj-image> width="120rpx" uses rpx, which is not a CSS unit. |
| 10 | warn | image-alt-filename | An mj-image uses a file name as its alt text ("Screenshot-2024-04-04-100812"). A screen reader will read it out. |
| 12 | error | repeated-attribute | <mj-button> repeats the attribute "background-color". Only the first one is used, so the second is silently ignored. |
| 12 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/pay). |
| 13 | error | button-no-link | An mj-button has no link, so it is drawn as a button that goes nowhere. |
| 14 | warn | social-share-link | The "facebook" icon makes a share link, not a link to your page. Use name="facebook-noshare" to link to your own page. |
| 14 | error | social-no-alt | A social icon link (facebook) has no alt text, so a screen reader announces only "link". Add alt="Facebook" or similar. |
| 14 | warn | placeholder-link | A link still points at a placeholder address (https://example.com/f). |
| 1 | error | unclosed-tag | <mjml> is never closed. |
| 7 | error | unclosed-tag | <mj-body> is never closed. |
| 11 | warn | br-closing-tag | <br></br> is read by browsers as two line breaks. Use <br /> once. |
| 3 | error | style-braces | A style block has 1 "{" and 0 "}". The browser drops every rule after the break. |
| 1 | warn | no-lang | No lang attribute on <mjml>. MJML then writes lang="und", and screen readers have to guess the language. |
| 1 | warn | no-title | No <mj-title>, so the built email has no document title. |
| 1 | info | no-preview | No <mj-preview>, so inbox apps show the first lines of the body as the preview text. |
| 8 | error | strict-build | Strict build: Attribute background-color has invalid value: FFF for type Color (mj-section) |
| 10 | error | strict-build | Strict build: Attribute width has invalid value: 120rpx for type Unit, only accepts (px) units and 1 value(s) (mj-image) |

## 2. Accessibility

| Level | Check | What it means |
| --- | --- | --- |
| warn | lang-und | lang="und" means "undetermined". Set the real language so screen readers pronounce the text correctly. |
| warn | title-missing | The built email has no <title>. |
| info | colour-scheme-missing | No color-scheme meta tag. Apps will not know the email was designed for dark mode. |
| warn | image-alt-filename | 1 image(s) use a file name as alt text. |
| info | image-no-size | 1 image(s) have no width and height, so the layout can jump as they load. |
| info | no-unsubscribe | No unsubscribe link. Marketing emails usually need one. Transactional emails usually do not. Check the rules where your customers are. |
| error | link-no-name | 1 link(s) have no accessible name. |
| warn | link-placeholder | 2 link(s) still point at a placeholder address. |
| info | no-headings | No headings. Screen reader users skim by heading, so a short email can still benefit from one. |
| warn | small-text | Text smaller than 14px: 13px (3 element(s)). |
| info | dark-light-surface | In dark mode, 1 text element(s) still sit on a light background (#ffffff), for example "Light grey text on white second line". |


**axe-core rules, in light and dark mode:**

| Level | Result |
| --- | --- |
| info | [axe, light] Elements must meet minimum color contrast ratio thresholds (1 element(s)). |
| error | [axe, light] Documents must have <title> element to aid in navigation (1 element(s)). |
| error | [axe, light] Links must have discernible text (1 element(s)). |
| info | [axe, dark] Elements must meet minimum color contrast ratio thresholds (1 element(s)). |
| error | [axe, dark] Documents must have <title> element to aid in navigation (1 element(s)). |
| error | [axe, dark] Links must have discernible text (1 element(s)). |

## 3. Contrast

Each row is one text colour on the background it really sits on. Text needs 4.5:1, or 3:1 if it is large (24px, or 18.66px and bold).

**Light mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| Light grey text on white second line | #aaaaaa on #ffffff | 2.32:1 | 4.5:1 | Fails | 13px |
| Pay now | #ffffff on #0057d8 | 6.26:1 | 4.5:1 | Pass | 13px |
| Go | #ffffff on #414141 | 10.21:1 | 4.5:1 | Pass | 13px |

**Dark mode:**

| Text | Colours | Ratio | Needs | Result | Size |
| --- | --- | --- | --- | --- | --- |
| Light grey text on white second line | #aaaaaa on #ffffff | 2.32:1 | 4.5:1 | Fails | 13px |
| Pay now | #ffffff on #0057d8 | 6.26:1 | 4.5:1 | Pass | 13px |
| Go | #ffffff on #414141 | 10.21:1 | 4.5:1 | Pass | 13px |

## 4. What these checks cannot tell you

- **Real email clients.** Dark mode here is the browser's own. Gmail and Outlook recolour emails in their own ways, so they still need testing in the clients your customers use.
- **Screen reader order and wording.** The checks confirm alt text and link names exist. They cannot judge whether the reading order or the wording makes sense. Listen to it once with a screen reader.
- **Background images.** Text over an image cannot be measured automatically.
- **Anything a test cannot see:** tone, clarity and whether a person can act on the email.
