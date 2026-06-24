import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const copyIfExists = async (from, to = from) => {
  const source = path.join(root, from);
  if (!existsSync(source)) return;
  await cp(source, path.join(dist, to), { recursive: true });
};

await copyIfExists("index.html");
await copyIfExists("src");
await copyIfExists("design");
await copyIfExists("assets");
await copyIfExists("README.md");

console.log("Galaxy Defender static build ready in dist/");
