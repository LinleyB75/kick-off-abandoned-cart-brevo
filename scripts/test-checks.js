// Proves the checks work: the good data must pass, and every deliberate break must be caught.
// The breaks are made from YOUR MJML and rules, so they follow the email as it changes.
//   npm test
const fs = require("fs");
const config = require("../project.config");
const { checkParams, readTemplate } = require("../check-params");

const template = fs.readFileSync(config.mjml, "utf8");
const good = JSON.parse(fs.readFileSync("data/params.json", "utf8"));
const { required, optional } = readTemplate(template);
const links = config.links || [];
const masked = config.masked || [];
const without = (key) => { const p = { ...good }; delete p[key]; return p; };
const textField = Object.keys(good).find((k) => !links.includes(k) && !masked.includes(k)); // a plain text field to attack
const maxFor = (k) => (config.maxLength || {})[k] || (config.maxLength || {}).default || 200;

// [description, params, expected: "pass" or a piece of the message that must appear]
const cases = [["the example data", good, "pass"]];
for (const k of optional) if (k in good) {
  cases.push([`${k} missing (optional)`, without(k), "pass"]);
  cases.push([`${k} empty (optional)`, { ...good, [k]: "" }, "pass"]);
}
for (const k of required) cases.push([`BREAK: ${k} missing`, without(k), `"${k}" is required`]);
if (required[0]) cases.push([`BREAK: misspelt name (${required[0]}s)`, { ...without(required[0]), [required[0] + "s"]: good[required[0]] }, `"${required[0]}" is required`]);
for (const k of links) {
  cases.push([`BREAK: ${k} is http, not https`, { ...good, [k]: "http://app.example.com/x?token=x" }, "must start with https://"]);
  cases.push([`BREAK: ${k} contains a space`, { ...good, [k]: "https://app.example.com/a b" }, "must not contain spaces"]);
  for (const rule of config.neverInLinks || []) cases.push([`BREAK: ${k} ${rule.why}`, { ...good, [k]: rule.example }, rule.why]);
}
for (const [k, rule] of Object.entries(config.formats || {})) cases.push([`BREAK: ${k} ${rule.why}`, { ...good, [k]: rule.example }, rule.why]);
for (const k of masked) cases.push([`BREAK: ${k} not masked`, { ...good, [k]: "alex.smith" }, "is not masked"]);
if (textField) {
  cases.push([`BREAK: HTML in ${textField}`, { ...good, [textField]: "<b>Alex</b>" }, "could carry HTML"]);
  cases.push([`BREAK: template tags in ${textField}`, { ...good, [textField]: "{{ params.x }}" }, "template tags"]);
  cases.push([`BREAK: a number instead of text in ${textField}`, { ...good, [textField]: 12345 }, "must be text"]);
  cases.push([`BREAK: ${textField} too long`, { ...good, [textField]: "a".repeat(maxFor(textField) + 1) }, "is longer than"]);
  for (const rule of config.never || []) cases.push([`BREAK: ${textField} ${rule.why}`, { ...good, [textField]: rule.example }, rule.why]);
  cases.push(["BREAK: params over 100 KB", { ...good, [textField]: "a".repeat(110 * 1024) }, "Brevo allows up to 100 KB"]);
}

let failed = 0;
for (const [name, params, expected] of cases) {
  const { errors } = checkParams(params, template);
  const ok = expected === "pass" ? errors.length === 0 : errors.some((e) => e.includes(expected));
  if (!ok) failed++;
  const result = expected === "pass" ? (errors.length ? "FAILED (should pass)" : "passed") : ok ? "caught" : "MISSED";
  console.log(`${ok ? "PASS" : "FAIL"}  ${name.padEnd(58)} ${result}`);
  if (!ok) console.log("      got: " + JSON.stringify(errors));
}
console.log(`\n${cases.length - failed} of ${cases.length} behave as expected.`);
process.exit(failed ? 1 : 0);