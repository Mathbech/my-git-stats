# my-git-stats

[![CI](https://github.com/Mathbech/my-git-stats/actions/workflows/ci.yml/badge.svg)](https://github.com/Mathbech/my-git-stats/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen.svg)](https://nodejs.org)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

[![Quality gate status](https://sonarcloud.io/api/project_badges/measure?project=Mathbech_my-git-stats&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Mathbech_my-git-stats)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=Mathbech_my-git-stats&metric=coverage)](https://sonarcloud.io/summary/new_code?id=Mathbech_my-git-stats)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=Mathbech_my-git-stats&metric=duplicated_lines_density)](https://sonarcloud.io/summary/new_code?id=Mathbech_my-git-stats)

Service de carte de stats GitHub SVG, pour les README de profil GitHub

## Galerie & URLs

Aperçus générés avec des données factices (`node scripts/gen-previews.js`).

### Carte de stats — `/api`

| Thème        | Aperçu                             | URL                                                                     |
| ------------ | ---------------------------------- | ----------------------------------------------------------------------- |
| `default`    | ![](./assets/stats-default.png)    | `https://my-git-stats.bebech.fr/api?username=Mathbech`                  |
| `dark`       | ![](./assets/stats-dark.png)       | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=dark`       |
| `radical`    | ![](./assets/stats-radical.png)    | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=radical`    |
| `ocean_dark` | ![](./assets/stats-ocean_dark.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=ocean_dark` |
| `tokyonight` | ![](./assets/stats-tokyonight.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=tokyonight` |

### Top langages — `/api/top-langs`

| Layout / thème           | Aperçu                                     | URL                                                                                              |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `normal` / `default`     | ![](./assets/langs-normal-default.png)     | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech`                                 |
| `compact` / `tokyonight` | ![](./assets/langs-compact-tokyonight.png) | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech&layout=compact&theme=tokyonight` |
| `compact` / `ocean_dark` | ![](./assets/langs-compact-ocean.png)      | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech&layout=compact&theme=ocean_dark` |

### Paramètres d'URL

Communs : `theme`, `title_color`, `text_color`, `icon_color`, `bg_color`, `border_color`, `hide_border`, `custom_title`, `card_width`.
Stats : `show_icons`, `include_all_commits`, `hide_rank`, `ring_color`.
Top langs : `layout` (`normal`\|`compact`), `langs_count` (1–20).

Thèmes fournis : `default`, `dark`, `radical`, `ocean_dark`, `tokyonight`. Ajoute les tiens dans `src/themes.js`.

Le **rang** (cercle S / A+ / A … C) est un score calculé par le service (`src/rank.js`, même formule que github-readme-stats : somme pondérée de percentiles sur commits, PRs, issues, reviews, stars, followers). Ce n'est **pas** une métrique officielle GitHub. Masque-le avec `hide_rank=true`.

Instance en ligne : `https://my-git-stats.bebech.fr`.

## Idées d'évolution

Cartes `pin` / `gist` / `wakatime`, pagination au-delà de 100 repos, cache Redis, rotation multi-tokens (`PAT_1..PAT_n`). La structure `src/cards/*` + route dans `server.js` est faite pour s'étendre.
