# Handoff: abandoned cart email

For the client's developer. It covers what you receive, what you set up once, what your application sends, and what is still open.

## What you receive

| File | What it is |
| --- | --- |
| `dist/email.html` | The finished email. This is what goes into Brevo |
| `plain-html/email.html` | The same email written by hand, with no build step. It looks identical |
| `docs/data-design.md` | The six values your application sends, and the rules for each |
| `send.js` | My reference for the send step, in Node.js, with a dry run, a sandbox mode and a live mode |

## Set it up in Brevo, once

1. In Brevo, go to Transactional, then Templates, then New Template.
2. Give it a name and a subject line, and choose a verified sender.
3. Choose the option to paste your own HTML, and paste the whole of `dist/email.html`.
4. Click Save and Activate.
5. Copy the template ID from the list. Your application sends it with every request.

## What your application sends

One request to Brevo's transactional email endpoint, with the template ID and six values. The values below are made up.

```json
{
  "to": [{ "email": "customer@example.test", "name": "Alex" }],
  "templateId": 12,
  "params": {
    "firstName": "Alex",
    "productName": "Kick Off Your English Ebook CAT01",
    "productImageUrl": "https://res.cloudinary.com/xrzqkwov/image/upload/Screenshot_2024-04-04_094501.png",
    "price": "$19.99 AUD",
    "quantity": "1",
    "cartUrl": "https://shop.example.test/cart/restore?cart=TEST-0001"
  }
}
```

The rules, in short. The full table is in `docs/data-design.md`.
- Every value is text, including the quantity.
- `firstName` is optional. Without it the heading reads "Your Cart... below".
- The price arrives already formatted, with its currency.
- The quantity is a whole number from 1 to 999.
- The two addresses start with `https://`, have no spaces, and carry no password, secret or username.
- No value contains `<`, `>`, or Brevo tags such as `{{`. No value looks like a card number or a Brevo key.
- The whole `params` object stays under 100 KB.
- The email shows one product. A cart with several products sends the main one.

## What you supply

| What | Who |
| --- | --- |
| The six values, at the moment the email is sent | Your application |
| When the email is sent | Your application |
| The Brevo API key, kept in your own settings and never in a repository | You |
| The template ID, from your own Brevo account | You |

## Still to come from the client

- The four social links and the three footer links, which are placeholders on `example.com`.
- The subject line.
- Whether the email needs an unsubscribe link.
- Whether showing one product is enough.

## Test your side

With your own key, template ID and test address in a `.env` file:
- `npm run send:dry` prints the request and sends nothing.
- `npm run send:sandbox` checks the request with Brevo and sends nothing. It does not show how the email looks.
- `npm run send:live` sends one real email to your test address, after you type SEND.

If Brevo answers with a message about an unknown IP address, add the address under Security, then Authorized IPs, in Brevo.

## What has and has not been tested

The email is checked for syntax, accessibility and contrast, in light and dark mode. It was sent for real through Brevo, and opened in Gmail on the web and on a phone, and in Apple Mail. What each one showed is in `evidence/stage-7-clients/RESULTS.md`. **Outlook, in any version, was not tested.** The rounded Outlook button and the Outlook dark-mode rules are unproven.

Questions: Linley Bignoux, [linleyb.com](https://linleyb.com/)