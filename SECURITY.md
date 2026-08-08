# Politique de sécurité

## Versions supportées

Le projet est en développement actif ; seule la dernière version de la branche
par défaut reçoit des correctifs de sécurité.

## Signaler une vulnérabilité

**Merci de ne pas ouvrir d'issue publique pour une faille de sécurité.**

Signale-la en privé via l'onglet **Security → Report a vulnerability** du dépôt
GitHub ([Private vulnerability reporting](https://github.com/Mathbech/my-git-stats/security/advisories/new)),
ou par email à **contact@bebech.fr**.

Merci d'inclure, si possible :

- une description du problème et de son impact ;
- les étapes pour le reproduire (URL, paramètres, payload) ;
- la version / le commit concerné.

Tu peux t'attendre à un premier retour sous quelques jours. Une fois le correctif
disponible, ta contribution au signalement sera créditée si tu le souhaites.

## Bonnes pratiques rappelées

- Aucun secret (token GitHub, etc.) ne doit être committé : ils vivent dans
  `.env.local`, ignoré par git.
- Le token utilisé en production reste sur le serveur ; il n'est jamais exposé
  dans le code ni dans les logs.
