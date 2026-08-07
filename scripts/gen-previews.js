// Génère les aperçus de la galerie du README (SVG) dans /assets, avec des
// données factices. Lancer :  node scripts/gen-previews.js
// Puis convertir en PNG si besoin (voir README).
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { renderStatsCard } from "../src/cards/stats.js";
import { renderTopLangsCard } from "../src/cards/top-langs.js";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "assets");
mkdirSync(outDir, { recursive: true });

const stats = { name: "Mathbech", stars: 6626, commits: 1843, prs: 214, issues: 57, followers: 389 };
const langs = [
  { name: "JavaScript", color: "#f1e05a", percent: 41.2 },
  { name: "TypeScript", color: "#3178c6", percent: 28.7 },
  { name: "Python", color: "#3572A5", percent: 15.1 },
  { name: "CSS", color: "#563d7c", percent: 9.4 },
  { name: "Shell", color: "#89e051", percent: 5.6 },
];

const themes = ["default", "dark", "radical", "ocean_dark", "tokyonight"];

const files = [];
for (const theme of themes) {
  files.push([`stats-${theme}.svg`, renderStatsCard(stats, { theme })]);
}
files.push(["langs-normal-default.svg", renderTopLangsCard(langs, { theme: "default" })]);
files.push(["langs-compact-tokyonight.svg", renderTopLangsCard(langs, { theme: "tokyonight", layout: "compact" })]);
files.push(["langs-compact-ocean.svg", renderTopLangsCard(langs, { theme: "ocean_dark", layout: "compact" })]);

for (const [name, svg] of files) {
  writeFileSync(join(outDir, name), svg);
  console.log("écrit", name);
}
console.log(`\n${files.length} aperçus dans assets/`);
