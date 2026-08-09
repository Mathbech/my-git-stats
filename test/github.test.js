import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fetchStats, fetchTopLangs } from "../src/github.js";

// --- Mock de fetch --------------------------------------------------------
// On empile des réponses ; chaque appel à fetch en dépile une et enregistre
// les variables GraphQL envoyées (pour vérifier la transmission du curseur).
let realFetch;
let queue;
let calls;

function ok(data) {
  return { ok: true, json: async () => ({ data }) };
}

function pushResponses(...responses) {
  queue.push(...responses);
}

beforeEach(() => {
  realFetch = globalThis.fetch;
  queue = [];
  calls = [];
  process.env.PAT_1 = "test-token";
  globalThis.fetch = async (_url, opts) => {
    calls.push(JSON.parse(opts.body).variables);
    if (queue.length === 0) throw new Error("Aucune réponse mockée en file");
    return queue.shift();
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

// --- Fabriques de pages ---------------------------------------------------
function statsPage({ stars, hasNextPage, endCursor = null }) {
  return ok({
    user: {
      name: "Mathbech",
      login: "mathbech",
      followers: { totalCount: 389 },
      contributionsCollection: {
        totalCommitContributions: 1800,
        restrictedContributionsCount: 43,
        totalPullRequestReviewContributions: 42,
      },
      pullRequests: { totalCount: 214 },
      issues: { totalCount: 57 },
      repositories: {
        totalCount: 150,
        nodes: stars.map((s) => ({ stargazers: { totalCount: s } })),
        pageInfo: { hasNextPage, endCursor },
      },
    },
  });
}

function langsPage({ edges, hasNextPage, endCursor = null }) {
  return ok({
    user: {
      repositories: {
        nodes: [{ languages: { edges } }],
        pageInfo: { hasNextPage, endCursor },
      },
    },
  });
}

// --- fetchStats -----------------------------------------------------------
test("fetchStats agrège les stars sur une seule page", async () => {
  pushResponses(statsPage({ stars: [10, 5, 1], hasNextPage: false }));
  const s = await fetchStats("mathbech");
  assert.equal(s.stars, 16);
  assert.equal(s.name, "Mathbech");
  assert.equal(s.commits, 1800);
  assert.equal(s.prs, 214);
  assert.equal(s.issues, 57);
  assert.equal(s.reviews, 42);
  assert.equal(s.followers, 389);
  assert.equal(calls.length, 1);
});

test("fetchStats pagine au-delà de 100 repos et transmet le curseur", async () => {
  pushResponses(
    statsPage({ stars: [3], hasNextPage: true, endCursor: "C1" }),
    statsPage({ stars: [4], hasNextPage: false }),
  );
  const s = await fetchStats("mathbech");
  assert.equal(s.stars, 7);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].after, null);
  assert.equal(calls[1].after, "C1");
});

test("fetchStats inclut les commits privés avec includeAllCommits", async () => {
  pushResponses(statsPage({ stars: [1], hasNextPage: false }));
  const s = await fetchStats("mathbech", { includeAllCommits: true });
  assert.equal(s.commits, 1800 + 43);
});

test("fetchStats lève une erreur si l'utilisateur est introuvable", async () => {
  pushResponses(ok({ user: null }));
  await assert.rejects(fetchStats("inconnu"), /introuvable/);
});

// --- fetchTopLangs --------------------------------------------------------
test("fetchTopLangs agrège les langages et calcule les pourcentages", async () => {
  pushResponses(
    langsPage({
      edges: [
        { size: 300, node: { name: "JavaScript", color: "#f1e05a" } },
        { size: 100, node: { name: "Python", color: "#3572A5" } },
      ],
      hasNextPage: false,
    }),
  );
  const langs = await fetchTopLangs("mathbech");
  assert.equal(langs[0].name, "JavaScript");
  assert.equal(langs[0].size, 300);
  assert.equal(Math.round(langs[0].percent), 75);
});

test("fetchTopLangs pagine et cumule un même langage sur plusieurs pages", async () => {
  pushResponses(
    langsPage({
      edges: [{ size: 100, node: { name: "JavaScript", color: "#f1e05a" } }],
      hasNextPage: true,
      endCursor: "L1",
    }),
    langsPage({
      edges: [{ size: 300, node: { name: "JavaScript", color: "#f1e05a" } }],
      hasNextPage: false,
    }),
  );
  const langs = await fetchTopLangs("mathbech");
  assert.equal(langs.length, 1);
  assert.equal(langs[0].size, 400);
  assert.equal(calls[1].after, "L1");
});

test("fetchTopLangs utilise une couleur par défaut si absente", async () => {
  pushResponses(
    langsPage({
      edges: [{ size: 50, node: { name: "Text", color: null } }],
      hasNextPage: false,
    }),
  );
  const langs = await fetchTopLangs("mathbech");
  assert.equal(langs[0].color, "#858585");
});

test("fetchTopLangs lève une erreur si l'utilisateur est introuvable", async () => {
  pushResponses(ok({ user: null }));
  await assert.rejects(fetchTopLangs("inconnu"), /introuvable/);
});

// --- graphql : gestion des erreurs ---------------------------------------
test("graphql lève une erreur sur réponse HTTP non OK", async () => {
  queue.push({ ok: false, status: 502, json: async () => ({}) });
  await assert.rejects(fetchStats("mathbech"), /HTTP 502/);
});

test("graphql lève une erreur si GraphQL renvoie des errors", async () => {
  queue.push({
    ok: true,
    json: async () => ({ errors: [{ message: "Bad credentials" }] }),
  });
  await assert.rejects(fetchStats("mathbech"), /Bad credentials/);
});
