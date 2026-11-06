// Runs after "npm run build". It does not stop the build. It warns about things that must be
// fixed before the finished email goes into Brevo.
const fs = require("fs");
const config = require("../project.config");

const html = fs.readFileSync(config.html, "utf8");
const mjml = fs.readFileSync(config.mjml, "utf8");
const kb = Math.round(Buffer.byteLength(html) / 1024);

const warnings = [];
if (html.includes("REPLACE-WITH-YOUR-HOST")) warnings.push("Image links still say REPLACE-WITH-YOUR-HOST. Upload the images and put their real addresses in the MJML.");
if (/REPLACE:/.test(html)) warnings.push("Some wording still says REPLACE:. Write the real text in the MJML.");
if (/https?:\/\/(www\.)?example\.com/.test(html)) warnings.push("A link still points at example.com. Put in the real address.");
if (/href="https:\/\/(www\.facebook|twitter|www\.instagram|www\.youtube)\.com\/"/.test(html)) warnings.push("The social links go to the site home pages. Put in the client's real pages.");
// every Brevo tag in the MJML must have survived the build
const lost = [...new Set([...mjml.matchAll(/params\.([A-Za-z_]\w*)/g)].map((m) => m[1]))].filter((n) => !html.includes("params." + n));
if (lost.length) warnings.push(`These values are in the MJML but not in the built email: ${lost.join(", ")}. The build removed them.`);
if (kb > 90) warnings.push(`The HTML is ${kb} KB. Gmail clips emails at about 102 KB.`);

console.log(`Built ${config.html} (${kb} KB).`);
if (warnings.length) {
  console.log("\nBefore this goes into Brevo:");
  warnings.forEach((w) => console.log("  - " + w));
} else {
  console.log("No warnings.");
}