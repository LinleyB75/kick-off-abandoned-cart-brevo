// Checks the example params against the MJML, and refuses anything the rules in project.config.js forbid.
//   npm run check-params                  checks data/params.json
//   node check-params.js some-file.json   checks another file
const fs = require("fs");
const config = require("./project.config");

const MAX_PARAMS_BYTES = 100 * 1024; // Brevo: one params object must not exceed 100 KB

// What the MJML reads. Names used inside {% if params.x %} are optional, the rest are required.
function readTemplate(text) {
  const used = new Set([...text.matchAll(/params\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  const optional = new Set([...text.matchAll(/\{%\s*if\s+params\.([A-Za-z_]\w*)/g)].map((m) => m[1]));
  const required = [...used].filter((n) => !optional.has(n));
  return { used, optional, required };
}

// Rules every text value must pass, whatever the email: a value must never be able to change the email
const TEXT_RULES = [
  [/[<>]/, "contains < or >, so it could carry HTML"],
  [/\{\{|\{%/, "contains template tags, so it could change the email"],
];

function checkParams(params, templateText) {
  const errors = [];
  const notes = [];
  const links = config.links || [];
  const masked = config.masked || [];
  const { used, optional, required } = readTemplate(templateText);

  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return { errors: ["The params must be one JSON object"], notes };
  }

  // 1. Names: everything the MJML reads must be sent
  for (const name of required) {
    const v = params[name];
    if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) {
      errors.push(`"${name}" is required but missing or empty (the MJML reads params.${name})`);
    }
  }
  for (const key of Object.keys(params)) {
    if (!used.has(key)) notes.push(`"${key}" is sent but the MJML never reads it (misspelt, or not needed)`);
  }

  // 2. Every value must be text
  for (const [key, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && typeof v !== "string") errors.push(`"${key}" must be text, not ${Array.isArray(v) ? "a list" : typeof v}`);
  }

  // 3. Rules for link fields
  for (const key of links) {
    const link = params[key];
    if (typeof link !== "string" || link.trim() === "") continue;
    if (!/^https:\/\//i.test(link)) errors.push(`"${key}" must start with https://`);
    if (/\s/.test(link)) errors.push(`"${key}" must not contain spaces`);
    if (link.length > 2000) errors.push(`"${key}" is longer than 2000 characters`);
    for (const rule of config.neverInLinks || []) if (rule.pattern.test(link)) errors.push(`"${key}" ${rule.why}`);
  }

  // 4. Fields that must be masked
  for (const key of masked) {
    const v = params[key];
    if (typeof v === "string" && v.trim() !== "" && !v.includes("*")) errors.push(`"${key}" is not masked. Send it with * characters`);
  }

  // 5. Longest allowed text per field
  const limits = config.maxLength || {};
  for (const [key, v] of Object.entries(params)) {
    if (typeof v !== "string" || links.includes(key)) continue;
    const max = limits[key] || limits.default || 200;
    if (v.length > max) errors.push(`"${key}" is longer than ${max} characters`);
  }

  // 5b. Values that must look a certain way (for example a whole number)
  for (const [key, rule] of Object.entries(config.formats || {})) {
    const v = params[key];
    if (typeof v === "string" && v.trim() !== "" && !rule.pattern.test(v)) errors.push(`"${key}" ${rule.why}`);
  }

  // 6. Safety rules on every text value except the link fields
  for (const [key, v] of Object.entries(params)) {
    if (typeof v !== "string" || links.includes(key)) continue;
    for (const [rule, why] of TEXT_RULES) if (rule.test(v)) errors.push(`"${key}" ${why}`);
    for (const rule of config.never || []) if (rule.pattern.test(v)) errors.push(`"${key}" ${rule.why}`);
  }

  // 7. Size
  const bytes = Buffer.byteLength(JSON.stringify(params));
  if (bytes > MAX_PARAMS_BYTES) errors.push(`The params are ${Math.round(bytes / 1024)} KB. Brevo allows up to 100 KB`);

  return { errors, notes, required, optional: [...optional] };
}

module.exports = { checkParams, readTemplate };

if (require.main === module) {
  const file = process.argv[2] || "data/params.json";
  const params = JSON.parse(fs.readFileSync(file, "utf8"));
  const r = checkParams(params, fs.readFileSync(config.mjml, "utf8"));

  console.log(`Checked ${file} against ${config.mjml}`);
  console.log(`  required: ${r.required.join(", ") || "none"}`);
  console.log(`  optional: ${r.optional.join(", ") || "none"}`);
  if (r.notes.length) {
    console.log("\nNOTES:");
    r.notes.forEach((n) => console.log("  - " + n));
  }
  if (r.errors.length) {
    console.log("\nPROBLEMS:");
    r.errors.forEach((e) => console.log("  - " + e));
    process.exit(1);
  }
  console.log("\nOK: the names match and the values pass the safety rules.");
}