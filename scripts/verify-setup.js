// Checks the project is ready to push: the right files, no key-shaped strings, the guard installed.
//   npm run verify
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

let problems = 0;
const ok = (m) => console.log("  OK      " + m);
const bad = (m) => { problems++; console.log("  FIX     " + m); };
const note = (m) => console.log("  NOTE    " + m);
const run = (cmd) => { try { return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return null; } };
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : "");

console.log("1. The files that should exist");
for (const f of ["package.json", ".gitignore", ".env.example", "project.config.js", "check-params.js", "send.js", "data/params.json",
  "templates/email.mjml", "scripts/make-dist.js", "scripts/check-build.js", "scripts/test-checks.js", "scripts/test-send.js",
  "scripts/simulated-brevo.js", "scripts/brevo-walkthrough.js", "scripts/install-hooks.js", "scripts/verify-setup.js", "scripts/data-design.js", "scripts/record-stage.js", "docs/lab-notebook.md", "BUILD-LOG.md"]) {
  fs.existsSync(f) ? ok(f) : bad(`${f} is missing`);
}

console.log("\n2. Stray files");
const strays = fs.readdirSync(".").filter((n) => / /.test(n) && /\.js$/.test(n)); // for example "scripts test-send.js"
strays.length ? strays.forEach((n) => bad(`"${n}" is in the main folder with a space in its name. It belongs in scripts/ without the space`)) : ok("none found");
if (/"name":\s*"my-email-project"/.test(read("package.json"))) note('package.json still says "my-email-project". Give the project its own name');

console.log("\n3. Git and the guard");
if (!fs.existsSync(".git")) bad('There is no .git folder. Run "git init"');
else {
  fs.existsSync(".git/hooks/pre-commit") ? ok("the pre-commit guard is installed") : bad("the pre-commit guard is not installed. Run npm run setup:hooks");
  if (fs.existsSync(".env")) {
    run("git check-ignore -q .env") !== null ? ok(".env exists and Git ignores it") : bad(".env exists but Git is NOT ignoring it. Check .gitignore");
    run("git ls-files .env") ? bad(".env is tracked by Git. Run: git rm --cached .env") : ok(".env is not tracked");
  } else note("there is no .env yet (that is fine until you test against Brevo)");
}

console.log("\n4. Anything shaped like a Brevo key");
const KEY = /xkeysib-[A-Za-z0-9]{32,}|xsmtpsib-[A-Za-z0-9]{32,}/;
const skip = new Set(["node_modules", ".git", "simulated-inbox"]);
const hits = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skip.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (!(/^\.env/.test(e.name) && e.name !== ".env.example") && fs.statSync(p).size < 2e6 && KEY.test(read(p))) hits.push(p);
  }
})(".");
hits.length ? hits.forEach((p) => bad(`${p} contains something shaped like a Brevo key (the key is not shown here)`)) : ok("none found in the project files");

console.log("\n5. The email itself");
const mjml = read("templates/email.mjml");
/REPLACE/.test(mjml) ? bad("templates/email.mjml still has REPLACE text in it") : ok("no REPLACE text left in the MJML");
if (!fs.existsSync("dist/email.html")) bad("dist/email.html does not exist. Run npm run build");
else if (fs.statSync("dist/email.html").mtimeMs < Math.max(fs.statSync("templates/email.mjml").mtimeMs, fs.statSync("data/params.json").mtimeMs)) bad("dist/email.html is older than the MJML or the params. Run npm run build");
else ok("dist/email.html is up to date");

console.log(problems ? `\n${problems} thing(s) to fix before you push.` : "\nAll checks passed. Ready to push.");
process.exit(problems ? 1 : 0);