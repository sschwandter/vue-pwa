// Guardrail: the surface colors live in theme.js (consumed by the build) but are
// mirrored by hand in src/style.css :root tokens, because CSS can't import JS.
// This check fails the build if the two drift apart. See ARCHITECTURE.md.
//
// Run with: npm run check-theme  (also runs as part of npm run build)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { surface } from "../theme.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cssPath = join(root, "src", "style.css");
const css = await readFile(cssPath, "utf8");

const fail = (msg) => {
  console.error(`check-theme: ${msg}`);
  process.exit(1);
};

// The dark scheme is the :root default; the light scheme overrides --surface
// inside the prefers-color-scheme: light media block.
const lightBlock = css.match(
  /@media\s*\(prefers-color-scheme:\s*light\)\s*\{[\s\S]*?\}\s*\}/
);
if (!lightBlock) fail("could not find the prefers-color-scheme: light block in style.css");

const surfaceIn = (text, where) => {
  const m = text.match(/--surface:\s*(#[0-9a-fA-F]{3,8})/);
  if (!m) fail(`could not find a --surface token in ${where}`);
  return m[1].toLowerCase();
};

// The first --surface in the file is the :root (dark) default.
const cssDark = surfaceIn(css, ":root");
const cssLight = surfaceIn(lightBlock[0], "the light media block");

const themeDark = surface.dark.toLowerCase();
const themeLight = surface.light.toLowerCase();

const mismatches = [];
if (cssDark !== themeDark)
  mismatches.push(`dark:  theme.js=${themeDark}  style.css=${cssDark}`);
if (cssLight !== themeLight)
  mismatches.push(`light: theme.js=${themeLight}  style.css=${cssLight}`);

if (mismatches.length) {
  fail(
    "theme.js and src/style.css --surface tokens disagree:\n  " +
      mismatches.join("\n  ") +
      "\nUpdate both so they match (see ARCHITECTURE.md)."
  );
}

console.log("check-theme: theme.js and style.css surface colors match.");
