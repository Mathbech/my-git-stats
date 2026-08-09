# Contribuer à my-git-stats

Merci de vouloir contribuer ! Ce projet est ouvert : **aucun accès en écriture n'est nécessaire**. Tout passe par un _fork_ et une _pull request_.

## En bref

1. **Forke** le dépôt (bouton _Fork_ en haut à droite sur GitHub).
2. **Clone** ton fork puis crée une branche :
   ```bash
   git clone https://github.com/<ton-compte>/my-git-stats.git
   cd my-git-stats
   git checkout -b feat/ma-fonctionnalite
   ```
3. **Installe et lance** :
   ```bash
   npm install
   cp .env.local.example .env.local   # ajoute ton PAT GitHub dans .env.local
   npm run dev
   ```
4. **Vérifie** avant de pousser :
   ```bash
   npm run lint      # style + erreurs
   npm run format    # applique Prettier
   npm test          # tests unitaires
   ```
5. **Pousse** ta branche et ouvre une **Pull Request** vers `dev`.

## Prérequis

- Node.js >= 22 (la CI teste sur 22 et 24).
- Un _Personal Access Token_ GitHub pour les tests contre l'API réelle. Il va **uniquement** dans `.env.local` (ignoré par git). Ne committe jamais de token.

## Conventions

- **Branches** : `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- **Commits** : messages clairs à l'impératif. Les [Conventional Commits](https://www.conventionalcommits.org/) sont appréciés mais pas obligatoires.
- **Signature** : les commits doivent être signés (GPG/SSH) pour apparaître « Verified ». Configure `git config commit.gpgsign true` et ta `user.signingkey`. Voir la [doc GitHub](https://docs.github.com/authentication/managing-commit-signature-verification).
- **Style** : ESLint + Prettier gèrent le formatage. Ne te bats pas contre eux, lance `npm run format`.
- **Tests** : ajoute ou mets à jour les tests quand tu changes une logique (`test/`). Le smoke test hors-ligne (`npm run smoke`) doit toujours passer.

## Que peut-on faire ?

Regarde les _issues_ ouvertes, en particulier celles étiquetées `good first issue`. Des idées d'évolution sont listées dans le README (nouvelles cartes, cache, pagination…). Pour un changement important, ouvre d'abord une issue pour en discuter avant de coder.

## Checklist de PR

- [ ] `npm run lint` passe.
- [ ] `npm test` passe.
- [ ] La description explique le _quoi_ et le _pourquoi_.
- [ ] Pas de secret ni de `.env.local` committé.

Toute PR est relue avant d'être fusionnée. Merci !
