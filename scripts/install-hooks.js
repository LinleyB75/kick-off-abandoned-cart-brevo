// Installs a Git "pre-commit" guard. Run it once, after "git init":   npm run setup:hooks
// The guard blocks a commit that stages a .env file, or contains something shaped like a Brevo key.
const fs = require("fs");
const path = require("path");

if (!fs.existsSync(".git")) { console.error('There is no .git folder here. Run "git init" first.'); process.exit(1); }
const dir = path.join(".git", "hooks");
fs.mkdirSync(dir, { recursive: true });

const hook = `#!/bin/sh
# Blocks a commit that stages a .env file, or contains something shaped like a Brevo key.
for f in $(git diff --cached --name-only --diff-filter=ACM); do
  case "$f" in
    .env.example) ;;
    .env|.env.*|*/.env|*/.env.*) echo "BLOCKED: $f must never be committed"; exit 1 ;;
  esac
done
if git diff --cached -U0 | grep -E -q 'xkeysib-[A-Za-z0-9]{32,}|xsmtpsib-[A-Za-z0-9]{32,}'; then
  echo "BLOCKED: something shaped like a Brevo key is in the staged changes."
  echo "Remove it. If it was a real key, delete that key in Brevo and make a new one."
  exit 1
fi
exit 0
`;
fs.writeFileSync(path.join(dir, "pre-commit"), hook, { mode: 0o755 });
console.log("Installed .git/hooks/pre-commit");