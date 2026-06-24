import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const requiredAssets = [
  "dist/index.html",
  "dist/src/game.js",
  "dist/src/ui/styles/start.css",
  "dist/design/images/Background Layer.png",
  "dist/design/images/3d-model/hero.glb",
  "dist/design/images/3d-model/enemy.glb",
  "dist/design/images/video/logo.mp4",
  "dist/design/images/video/game_start.mp4",
  "dist/design/images/video/hero_enter.mp4",
  "dist/design/images/video/hero_stay.mp4",
  "dist/design/images/video/hero_explotion.mp4",
  "dist/design/images/video/enemy_explotion.mp4",
];

const lfsPointerPrefix = "version https://git-lfs.github.com/spec/v1";
let failed = false;

for (const asset of requiredAssets) {
  try {
    const info = await stat(asset);
    if (info.size < 1024) {
      const text = await readFile(asset, "utf8").catch(() => "");
      if (text.startsWith(lfsPointerPrefix)) {
        console.error(`Git LFS pointer copied instead of real asset: ${asset}`);
        failed = true;
        continue;
      }
    }
    console.log(`${asset} ${(info.size / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    console.error(`Missing deploy asset: ${asset}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nDeploy asset verification failed. Run `git lfs pull`, then `npm run build` again.");
  process.exit(1);
}

console.log("\nDeploy asset verification passed.");
