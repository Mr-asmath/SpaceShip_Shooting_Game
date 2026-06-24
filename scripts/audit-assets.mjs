import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const roots = ["design", "assets"];
const rows = [];

async function walk(dir) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    const info = await stat(fullPath);
    rows.push({ path: fullPath.replaceAll("\\", "/"), bytes: info.size });
  }
}

for (const root of roots) await walk(root);

rows.sort((a, b) => b.bytes - a.bytes);
const total = rows.reduce((sum, row) => sum + row.bytes, 0);
const mb = (bytes) => (bytes / 1024 / 1024).toFixed(2);

console.log(`Assets: ${rows.length} files, ${mb(total)} MB total`);
console.log("Largest files:");
for (const row of rows.slice(0, 12)) {
  console.log(`${mb(row.bytes).padStart(8)} MB  ${row.path}`);
}
