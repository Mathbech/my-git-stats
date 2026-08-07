// Serveur HTTP maison — API compatible avec github-readme-stats.
// Endpoints : GET /api  et  GET /api/top-langs
import "./src/loadenv.js"; // charge .env avant tout le reste
import express from "express";
import { fetchStats, fetchTopLangs } from "./src/github.js";
import { renderStatsCard } from "./src/cards/stats.js";
import { renderTopLangsCard } from "./src/cards/top-langs.js";
import { escapeXml, parseBool } from "./src/utils.js";

const app = express();
const PORT = process.env.PORT || 9000;
const CACHE_SECONDS = Math.max(parseInt(process.env.CACHE_SECONDS || "21600", 10), 0);
const WHITELIST = (process.env.WHITELIST || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

// Cache mémoire tout simple : clé = URL complète, valeur = { svg, expires }.
const cache = new Map();

function sendSvg(res, svg) {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader(
    "Cache-Control",
    `max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}, stale-while-revalidate`,
  );
  res.send(svg);
}

function errorCard(message) {
  const msg = escapeXml(message).slice(0, 80);
  return `<svg width="495" height="80" viewBox="0 0 495 80" xmlns="http://www.w3.org/2000/svg">
  <rect x="0.5" y="0.5" rx="4.5" width="494" height="79" fill="#fffefe" stroke="#e4e2e2"/>
  <text x="25" y="35" fill="#e5534b" font-size="16" font-weight="700" font-family="Segoe UI, sans-serif">Something went wrong</text>
  <text x="25" y="58" fill="#434d58" font-size="12" font-family="Segoe UI, sans-serif">${msg}</text>
</svg>`;
}

function allowed(username) {
  if (!WHITELIST.length) return true;
  return WHITELIST.includes(String(username).toLowerCase());
}

async function handle(req, res, kind) {
  const username = req.query.username;
  try {
    if (!username) {
      res.status(400);
      return sendSvg(res, errorCard("Paramètre username manquant"));
    }
    if (!allowed(username)) {
      res.status(403);
      return sendSvg(res, errorCard("username non autorisé (whitelist)"));
    }

    const key = req.originalUrl;
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
      return sendSvg(res, hit.svg);
    }

    let svg;
    if (kind === "stats") {
      const stats = await fetchStats(username, {
        includeAllCommits: parseBool(req.query.include_all_commits, false),
      });
      svg = renderStatsCard(stats, req.query);
    } else {
      const langs = await fetchTopLangs(username);
      svg = renderTopLangsCard(langs, req.query);
    }

    if (CACHE_SECONDS > 0) {
      cache.set(key, { svg, expires: Date.now() + CACHE_SECONDS * 1000 });
    }
    return sendSvg(res, svg);
  } catch (err) {
    console.error(`[${kind}] ${username}:`, err.message);
    res.status(200); // on renvoie quand même une image (200) pour l'affichage
    return sendSvg(res, errorCard(err.message));
  }
}

app.get("/api", (req, res) => handle(req, res, "stats"));
app.get("/api/top-langs", (req, res) => handle(req, res, "langs"));
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) =>
  res.type("text/plain").send("my-git-stats — try /api?username=octocat"),
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`my-git-stats en écoute sur le port ${PORT}`);
});
