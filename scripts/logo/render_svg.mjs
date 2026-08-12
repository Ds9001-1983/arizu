// SVG -> PNG rendern mit dem Chromium aus Playwright (kein rsvg/cairo vorhanden).
// Aufruf: node render_svg.mjs <svg-datei> <out.png> [breite] [hintergrund]
import { chromium } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const [file, out, widthArg = "900", bg = "#ffffff"] = process.argv.slice(2);
if (!file || !out) {
  console.error("Aufruf: node render_svg.mjs <svg> <png> [breite] [bg]");
  process.exit(1);
}

const svg = readFileSync(resolve(file), "utf8");
const width = Number(widthArg);

// viewBox auslesen, um die Zielhoehe proportional zu bestimmen.
const vb = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
const ratio = vb ? Number(vb[2]) / Number(vb[1]) : 1;
const height = Math.round(width * ratio);

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 2,
});
await page.setContent(
  `<!doctype html><style>
     html,body{margin:0;padding:0;background:${bg}}
     svg{display:block;width:${width}px;height:${height}px}
   </style>${svg}`,
  { waitUntil: "load" },
);
await page.screenshot({ path: resolve(out), omitBackground: bg === "transparent" });
await browser.close();
console.log(`${out}: ${width}x${height} @2x auf ${bg}`);
