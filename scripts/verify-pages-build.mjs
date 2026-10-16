import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const base = "/selector-filamentos/";
const dist = resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const html = await readFile(resolve(dist, "index.html"), "utf8");
const scriptPath = html.match(/<script[^>]+src="([^"]+)"/)?.[1];
const stylePath = html.match(/<link[^>]+href="(\/selector-filamentos\/assets\/[^\"]+\.css)"/)?.[1];
assert.ok(scriptPath?.startsWith(`${base}assets/`), "the built module uses the repository project path");
assert.ok(stylePath, "the built stylesheet uses the repository project path");
assert.match(html, /<link rel="canonical" href="https:\/\/solvo-herramientas\.github\.io\/selector-filamentos\/">/, "the canonical URL is retained");
assert.match(html, /<meta property="og:url" content="https:\/\/solvo-herramientas\.github\.io\/selector-filamentos\/">/, "the social URL is retained");

const jsFile = resolve(dist, scriptPath.slice(base.length));
const js = await readFile(jsFile, "utf8");
const logoPath = js.match(/\/selector-filamentos\/assets\/logo-solvo-[\w-]+\.png/)?.[0];
assert.ok(logoPath, "the bundled logo uses the project path");
const assets = [scriptPath, stylePath, logoPath];
for (const asset of assets) await stat(resolve(dist, asset.slice(base.length)));

const css = await readFile(resolve(dist, stylePath.slice(base.length)), "utf8");
assert.match(css, /\[hidden\]\s*\{display:none!important\}/, "the global hidden attribute survives utility generation");
assert.match(css, /@media\s*\(width<=900px\)/, "the built stylesheet preserves the inclusive mobile breakpoint");
assert.match(css, /bottom:var\(--wizard-viewport-offset,0px\)/, "fixed mobile actions use the measured viewport offset");
assert.match(css, /scroll-margin-block:36px calc\(var\(--wizard-actions-height,0px\) \+ 36px\)/, "focused fields retain clearance from fixed actions");
assert.match(css, /@media\s*\(prefers-reduced-motion:reduce\)/, "reduced-motion variants are emitted");
assert.match(css, /transform:none!important/, "reduced-motion variants override directional translations");
assert.match(css, /@starting-style/, "the native dialog retains its entry transition");
assert.match(css, /@media print/, "print variants are emitted");
assert.match(css, /:root\[data-theme=dark\]/, "the explicit dark theme survives the build");
assert.match(css, /:root:not\(\[data-theme=light\]\)/, "the explicit light theme still overrides automatic dark mode");


const contentTypes = { ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png" };
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url, "http://localhost").pathname;
  if (!pathname.startsWith(base)) {
    response.writeHead(404).end();
    return;
  }
  const relativePath = pathname.slice(base.length) || "index.html";
  const file = resolve(dist, relativePath);
  if (!file.startsWith(`${dist}/`)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(file);
    response.writeHead(200, { "content-length": body.length, "content-type": contentTypes[extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise((resolveListen, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolveListen);
});
try {
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const page = await fetch(`${origin}${base}`);
  assert.equal(page.status, 200, "the built site is served at the GitHub Pages project path");
  assert.match(await page.text(), /<title>Selector de Filamentos/);
  for (const asset of assets) {
    const response = await fetch(`${origin}${asset}`);
    assert.equal(response.status, 200, `${asset} is available over HTTP`);
    assert.ok(Number(response.headers.get("content-length") ?? 0) > 0 || (await response.arrayBuffer()).byteLength > 0, `${asset} has content`);
  }
} finally {
  await new Promise((resolveClose, reject) => server.close((error) => error ? reject(error) : resolveClose()));
}

console.log("Verified project-path HTML, canonical/social metadata, emitted JavaScript/CSS/logo files, Tailwind responsive/motion/print/theme output, and HTTP availability under /selector-filamentos/.");
