import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const rootArg = process.argv[2] || ".";
const port = Number(process.argv[3] || process.env.PORT || 3000);
const root = path.resolve(process.cwd(), rootArg);

const types = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".glb", "model/gltf-binary"],
  [".mp4", "video/mp4"],
]);

const safePath = (urlPath) => {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded === "/" ? "/index.html" : decoded;
  const filePath = path.resolve(root, `.${clean}`);
  if (!filePath.startsWith(root)) return null;
  return filePath;
};

const server = createServer((request, response) => {
  const filePath = safePath(request.url || "/");
  const fallback = path.join(root, "index.html");
  const target = filePath && existsSync(filePath) && statSync(filePath).isFile() ? filePath : fallback;

  if (!existsSync(target)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const type = types.get(path.extname(target).toLowerCase()) || "application/octet-stream";
  response.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": target.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  createReadStream(target).pipe(response);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Galaxy Defender running at http://127.0.0.1:${port}/`);
});
