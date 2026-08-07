# my-git-stats

Ton propre service de cartes de stats GitHub en SVG, écrit de zéro — **aucun fork**. Node + Express interrogent l'API GraphQL de GitHub et génèrent les images. L'API reproduit les URLs de github-readme-stats, donc tu remplaces juste `...vercel.app` par ton domaine dans tes READMEs.

```
Navigateur → (CloudFront plus tard) → Apache HTTPS → Node/Express (127.0.0.1:9000) → API GitHub
```

## Galerie & URLs

Aperçus générés avec des données factices (`node scripts/gen-previews.js`).

### Carte de stats — `/api`

| Thème | Aperçu | URL |
| --- | --- | --- |
| `default` | ![](./assets/stats-default.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech` |
| `dark` | ![](./assets/stats-dark.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=dark` |
| `radical` | ![](./assets/stats-radical.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=radical` |
| `ocean_dark` | ![](./assets/stats-ocean_dark.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=ocean_dark` |
| `tokyonight` | ![](./assets/stats-tokyonight.png) | `https://my-git-stats.bebech.fr/api?username=Mathbech&theme=tokyonight` |

### Top langages — `/api/top-langs`

| Layout / thème | Aperçu | URL |
| --- | --- | --- |
| `normal` / `default` | ![](./assets/langs-normal-default.png) | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech` |
| `compact` / `tokyonight` | ![](./assets/langs-compact-tokyonight.png) | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech&layout=compact&theme=tokyonight` |
| `compact` / `ocean_dark` | ![](./assets/langs-compact-ocean.png) | `https://my-git-stats.bebech.fr/api/top-langs?username=Mathbech&layout=compact&theme=ocean_dark` |

### Paramètres d'URL

Communs : `theme`, `title_color`, `text_color`, `icon_color`, `bg_color`, `border_color`, `hide_border`, `custom_title`, `card_width`.
Stats : `show_icons`, `include_all_commits`.
Top langs : `layout` (`normal`\|`compact`), `langs_count` (1–20).

Thèmes fournis : `default`, `dark`, `radical`, `ocean_dark`, `tokyonight`. Ajoute les tiens dans `src/themes.js`.


Instance en ligne : `https://my-git-stats.bebech.fr`.


## Idées d'évolution

Cartes `pin` / `gist` / `wakatime`, calcul du rang, pagination au-delà de 100 repos, cache Redis, rotation multi-tokens (`PAT_1..PAT_n`). La structure `src/cards/*` + route dans `server.js` est faite pour s'étendre.
