// The ONE settings file for this email (with templates/email.mjml and data/params.json).
// It holds the data design: the values your application sends, and the rules every value must pass.
module.exports = {
  name: "Kick Off abandoned cart (test version)",
  mjml: "templates/email.mjml",           // keep these two names: package.json uses them
  html: "dist/email.html",
  brevoTemplateName: "Kick Off abandoned cart (test)",
  subject: "Your cart is waiting",        // the client confirms the real subject

  // ---- The data design. Every value is sent as text. ----
  //   firstName        optional  the customer's first name. Without it the heading reads "Your Cart... below"
  //   productName      required  the product in the cart, as it should be shown
  //   productImageUrl  required  the https address of the product picture
  //   price            required  sent exactly as it should be shown, with the currency, for example "$19.99 AUD"
  //                              (the application knows the currency and the format, so it does the formatting)
  //   quantity         required  a whole number
  //   cartUrl          required  the https address that takes the customer back to their cart
  // Required or optional is read from the MJML: a name used inside {% if params.x %} is optional.
  describe: {
    firstName: "The customer's first name. Without it the heading reads \"Your Cart... below\".",
    productName: "The product in the cart, as it should be shown. Also the picture's alt text.",
    productImageUrl: "The https address of the product picture.",
    price: "Sent exactly as it should be shown, with the currency, for example \"$19.99 AUD\". The application knows the currency and the format.",
    quantity: "A whole number.",
    cartUrl: "The https address that takes the customer back to their cart. Used by the Return to Your Cart button, and by the Outlook version of it.",
  },
  maxLength: { default: 120, firstName: 40, productName: 120, price: 30, quantity: 3 },
  links: ["productImageUrl", "cartUrl"],
  masked: [],

  // A value that has to look a certain way, not only be present and short enough
  formats: {
    quantity: { pattern: /^[1-9]\d{0,2}$/, why: "must be a whole number from 1 to 999", example: "one" },
    price: { pattern: /^(?=.*\d)[^<>]{1,30}$/, why: "must contain a number, for example $19.99 AUD", example: "free" },
  },

  // Text that must never appear in any value, however it got there
  never: [
    { pattern: /\b\d{13,19}\b/, why: "looks like a card number", example: "4111111111111111" },
    { pattern: /xkeysib-|xsmtpsib-/i, why: "looks like a Brevo key", example: "xkeysib-abcdef" },
  ],
  // Text that must never appear in a link
  neverInLinks: [
    { pattern: /[?&](password|secret|api[_-]?key)=/i, why: "carries a credential in the address", example: "https://shop.example.test/cart?password=abc" },
    { pattern: /^https:\/\/[^/]*@/i, why: "has a username in the address", example: "https://user:pass@shop.example.test/cart" },
  ],

  // ---- What the simulated inbox checks in the finished email ----
  renderChecks: (params, { html, text, hrefs, esc }) => {
    const re = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return [
      ["The product name and the price are in the wording", text.includes(esc(params.productName)) && text.includes(esc(params.price))],
      ["The quantity is in the wording", new RegExp("Quantity:\\s*(?:&nbsp;)?\\s*" + re(params.quantity)).test(text)],
      ["The heading shows the first name, or reads correctly without one", params.firstName ? text.includes(esc(params.firstName)) : /Your Cart\.\.\. below/.test(text)],
      ["The Return to Your Cart button goes to the cart link", hrefs.some((h) => h === esc(params.cartUrl))],
      ["The Outlook button has the same cart link", new RegExp('v:roundrect[^>]*href="' + re(esc(params.cartUrl)) + '"').test(html)],
      ["The product picture is the address that was sent", html.includes('src="' + esc(params.productImageUrl) + '"')],
    ];
  },

  // ---- What you look at in the real inbox after npm run test:brevo ----
  inboxChecklist: [
    "The sender and the subject are right",
    "The heading, the product, the price and the quantity are right",
    "Return to Your Cart goes to the right cart, in Outlook as well",
    "It looks right in light mode and in dark mode, on your phone as well",
    "The product picture loads, and nothing is broken",
  ],
};