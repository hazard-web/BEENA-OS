import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync("eslint-report.json", "utf8"));
const root = `${process.cwd()}/`;
let failed = false;

for (const file of report) {
  const rel = file.filePath.startsWith(root)
    ? file.filePath.slice(root.length)
    : file.filePath;
  for (const message of file.messages) {
    failed = true;
    const level = message.severity === 2 ? "error" : "warning";
    const text = String(message.message)
      .replace(/%/g, "%25")
      .replace(/\r/g, "%0D")
      .replace(/\n/g, "%0A");
    const line = message.line || 1;
    const col = message.column || 1;
    console.log(`::${level} file=${rel},line=${line},col=${col}::${text}`);
  }
}

if (failed) process.exit(1);
