import { test } from "node:test";
import assert from "node:assert/strict";
import { calculateRank } from "../src/rank.js";

const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

test("un profil vide donne le niveau le plus bas", () => {
  const { level, percentile } = calculateRank({});
  assert.equal(level, "C");
  assert.ok(percentile > 87.5 && percentile <= 100);
});

test("un profil très actif donne un meilleur rang qu'un profil faible", () => {
  const strong = calculateRank({
    commits: 5000,
    prs: 500,
    issues: 300,
    reviews: 100,
    stars: 10000,
    followers: 2000,
  });
  const weak = calculateRank({ commits: 10, stars: 1 });
  assert.ok(LEVELS.indexOf(strong.level) < LEVELS.indexOf(weak.level));
  assert.ok(strong.percentile < weak.percentile);
});

test("le niveau retourné fait toujours partie de l'échelle", () => {
  const { level } = calculateRank({ commits: 250, prs: 50, stars: 50 });
  assert.ok(LEVELS.includes(level));
});
