import { test } from "node:test";
import assert from "node:assert/strict";
import { renderStatsCard } from "../src/cards/stats.js";
import { renderTopLangsCard } from "../src/cards/top-langs.js";

const stats = {
  name: "Mathbech",
  stars: 6626,
  commits: 1843,
  prs: 214,
  issues: 57,
  reviews: 42,
  followers: 389,
};
const langs = [
  { name: "JavaScript", color: "#f1e05a", percent: 41.2 },
  { name: "TypeScript", color: "#3178c6", percent: 28.7 },
  { name: "Python", color: "#3572A5", percent: 30.1 },
];

function assertWellFormedSvg(svg) {
  assert.ok(svg.startsWith("<svg"), "commence par <svg");
  assert.ok(svg.trimEnd().endsWith("</svg>"), "finit par </svg>");
}

test("renderStatsCard produit un SVG bien formé", () => {
  const svg = renderStatsCard(stats, {
    theme: "ocean_dark",
    show_icons: "true",
  });
  assertWellFormedSvg(svg);
  assert.ok(svg.includes("Mathbech"));
});

test("renderTopLangsCard (normal) produit un SVG bien formé", () => {
  assertWellFormedSvg(renderTopLangsCard(langs, {}));
});

test("renderTopLangsCard (compact) produit un SVG bien formé", () => {
  assertWellFormedSvg(renderTopLangsCard(langs, { layout: "compact" }));
});
