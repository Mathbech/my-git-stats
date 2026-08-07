// Test hors-ligne : rend les deux cartes avec des données factices,
// vérifie que le SVG est bien formé, et écrit des fichiers d'aperçu.
import { writeFileSync } from "node:fs";
import { renderStatsCard } from "../src/cards/stats.js";
import { renderTopLangsCard } from "../src/cards/top-langs.js";

const fakeStats = { name: "Mathbech", stars: 6626, commits: 1843, prs: 214, issues: 57, reviews: 42, followers: 389 };
const fakeLangs = [
  { name: "JavaScript", color: "#f1e05a", percent: 41.2 },
  { name: "TypeScript", color: "#3178c6", percent: 28.7 },
  { name: "Python", color: "#3572A5", percent: 15.1 },
  { name: "CSS", color: "#563d7c", percent: 9.4 },
  { name: "Shell", color: "#89e051", percent: 5.6 },
];

function assertWellFormed(svg, label) {
  if (!svg.startsWith("<svg")) throw new Error(`${label}: ne commence pas par <svg`);
  if (!svg.trimEnd().endsWith("</svg>")) throw new Error(`${label}: ne finit pas par </svg>`);
  const open = (svg.match(/<[a-zA-Z]/g) || []).length;
  const close = (svg.match(/<\/|\/>/g) || []).length;
  if (close < 1) throw new Error(`${label}: aucune balise fermante`);
  console.log(`OK ${label} (${svg.length} octets, ~${open} balises)`);
}

const stats = renderStatsCard(fakeStats, { theme: "ocean_dark", show_icons: "true" });
const langsCompact = renderTopLangsCard(fakeLangs, { theme: "ocean_dark", layout: "compact" });
const langsNormal = renderTopLangsCard(fakeLangs, {});

assertWellFormed(stats, "stats");
assertWellFormed(langsCompact, "top-langs compact");
assertWellFormed(langsNormal, "top-langs normal");

writeFileSync(new URL("./preview-stats.svg", import.meta.url), stats);
writeFileSync(new URL("./preview-langs-compact.svg", import.meta.url), langsCompact);
writeFileSync(new URL("./preview-langs-normal.svg", import.meta.url), langsNormal);
console.log("Aperçus écrits dans scripts/preview-*.svg");
