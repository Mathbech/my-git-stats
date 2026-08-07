// Serveur HTTP maison — API compatible avec github-readme-stats.
// Endpoints : GET /api  et  GET /api/top-langs
import "./src/loadenv.js"; // charge .env avant tout le reste
import express from "express";
import { fetchStats, fetchTopLangs } from "./src/github.js";
import { renderStatsCard } from "./src/cards/stats.js";
import { renderTopLangsCard } from "./src/cards/top-langs.js";
import { parseBool } from "./src/utils.js";
import { logError } from "./src/logger.js";

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

// Réponse d'erreur : statut HTTP réel + AUCUN détail interne dans le corps.
// Un statut != 200 fait que GitHub affiche une image cassée plutôt que du texte.
// no-store : une erreur transitoire n'est jamais mise en cache par GitHub/CDN.
function sendError(res, status) {
  res.status(status);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  // SVG minimal et générique, sans le moindre détail technique.
  res.send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>`,
  );
}

function allowed(username) {
  if (!WHITELIST.length) return true;
  return WHITELIST.includes(String(username).toLowerCase());
}

async function handle(req, res, kind) {
  const username = req.query.username;
  try {
    // Erreurs client : statut réel, corps neutre, pas de fuite d'info.
    if (!username) return sendError(res, 400);
    if (!allowed(username)) return sendError(res, 403);

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
    // Le détail (token manquant, panne API GitHub…) va UNIQUEMENT dans les logs.
    logError(kind, username, err);
    // La page renvoie un 500 sans texte : rien d'exploitable ne s'affiche sur GitHub.
    return sendError(res, 500);
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
