# my-git-stats

Ton propre service de cartes de stats GitHub en SVG, écrit de zéro — **aucun fork**. Node + Express interrogent l'API GraphQL de GitHub et génèrent les images. L'API reproduit les URLs de github-readme-stats, donc tu passes de Vercel à ton domaine sans rien changer d'autre dans tes READMEs.

```
Navigateur → (CloudFront plus tard) → Caddy/Nginx HTTPS → Node/Express (localhost:9000) → API GitHub
```

## Ce que ça fait aujourd'hui

- `GET /api?username=…` — carte de stats (stars, commits, PRs, issues, followers)
- `GET /api/top-langs?username=…` — top langages (layouts `normal` et `compact`)
- Thèmes (`default`, `dark`, `radical`, `ocean_dark`, `tokyonight`) + surcharges `title_color`, `text_color`, `bg_color`, `theme`, `hide_border`, `show_icons`, `layout`, `langs_count`, `custom_title`, `card_width`, `include_all_commits`
- Cache mémoire + en-têtes `Cache-Control` (pilotés par `CACHE_SECONDS`)
- Whitelist d'usernames pour protéger ton quota d'API

Volontairement minimal : c'est une base propre que **tu** fais évoluer (pin de repos, gist, wakatime, rangs, nouveaux thèmes…).

## Structure

```
server.js              → serveur Express, routes, cache, whitelist
src/github.js          → requêtes GraphQL + agrégation (stars, langages)
src/cards/stats.js     → rendu SVG carte stats
src/cards/top-langs.js → rendu SVG carte langages
src/themes.js          → palette de thèmes
src/utils.js           → helpers (échappement XML, format nombres, couleurs)
scripts/smoke.js       → test hors-ligne (rend les cartes avec données factices)
Dockerfile, docker-compose.yml, .env.example, Caddyfile
```

## Démarrer en local

```bash
npm install
cp .env.example .env      # mets ton PAT_1
npm start                 # http://localhost:9000/api?username=Mathbech
```

Test sans token (rendu seul, données factices) :

```bash
npm run smoke             # écrit scripts/preview-*.svg
```

## Token GitHub

https://github.com/settings/tokens → `Generate new token (classic)` → scopes **`repo`** + **`read:user`** → copie dans `PAT_1` du `.env`.

## Déploiement sur le VPS

```bash
# sur le VPS, dans le dossier du projet
cp .env.example .env && nano .env      # PAT_1 + WHITELIST
docker compose up -d --build
curl -I "http://127.0.0.1:9000/api?username=Mathbech"   # -> 200, image/svg+xml
```

Puis HTTPS via Caddy (le plus simple) :

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile   # édite le domaine
sudo systemctl reload caddy
```

DNS : un enregistrement **A** `stats.tondomaine.com` → IP du VPS.

## Utilisation dans tes READMEs

```md
![Stats](https://stats.tondomaine.com/api?username=Mathbech&show_icons=true&theme=ocean_dark)
![Top langs](https://stats.tondomaine.com/api/top-langs?username=Mathbech&layout=compact&theme=ocean_dark)
```

## CloudFront (plus tard)

Ton VPS = origin (HTTPS). Points clés côté CloudFront :

- **Cache policy** : inclure **toutes les query strings** dans la clé de cache (les cartes ne diffèrent que par `?username=…&theme=…`).
- Respecter les **en-têtes `Cache-Control` de l'origin** plutôt qu'un TTL fixe.
- Activer la **compression** (le SVG se compresse très bien), pas besoin de forwarder les cookies.

## Limites / idées d'évolution

- Stats basées sur les 100 premiers repos (comme l'original) — paginer si besoin.
- Pas encore de carte `pin`, `gist`, `wakatime` ni de rang : à ajouter en suivant le même patron (`src/cards/*` + route dans `server.js`).
- Cache en mémoire (repart à zéro au redémarrage) — passer à Redis si tu montes en charge.
- Un seul token `PAT_1` : tu peux ajouter une rotation `PAT_1..PAT_n` si tu approches des limites d'API.
```
