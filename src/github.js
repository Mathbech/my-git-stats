// Accès à l'API GraphQL de GitHub. Un seul token (PAT_1) suffit pour commencer.
// Node 20+ fournit fetch() nativement, aucune dépendance HTTP requise.

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

function getToken() {
  const token = process.env.PAT_1 || process.env.GITHUB_TOKEN;
  if (!token)
    throw new Error("Aucun token : définis PAT_1 dans l'environnement.");
  return token;
}

async function graphql(query, variables) {
  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: {
      Authorization: `bearer ${getToken()}`,
      "Content-Type": "application/json",
      "User-Agent": "my-git-stats",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GitHub API HTTP ${res.status}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || "Erreur GraphQL GitHub");
  }
  return json.data;
}

// Garde-fou : plafonne le nombre de pages pour éviter une boucle infinie
// ou une explosion du coût de requêtes (100 repos/page).
const MAX_PAGES = 20;

const STATS_QUERY = `
query userStats($login: String!, $after: String) {
  user(login: $login) {
    name
    login
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestReviewContributions
    }
    pullRequests(first: 1) { totalCount }
    issues(first: 1) { totalCount }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes { stargazers { totalCount } }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

/** Récupère les stats agrégées d'un utilisateur (pagine au-delà de 100 repos). */
export async function fetchStats(username, { includeAllCommits = false } = {}) {
  let after = null;
  let user = null; // métadonnées conservées depuis la 1re page
  let totalStars = 0;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await graphql(STATS_QUERY, { login: username, after });
    if (!data.user) throw new Error(`Utilisateur introuvable : ${username}`);
    if (!user) user = data.user;

    const repos = data.user.repositories;
    totalStars += repos.nodes.reduce(
      (sum, r) => sum + (r.stargazers?.totalCount || 0),
      0,
    );

    if (!repos.pageInfo.hasNextPage) break;
    after = repos.pageInfo.endCursor;
  }

  const commits =
    user.contributionsCollection.totalCommitContributions +
    (includeAllCommits
      ? user.contributionsCollection.restrictedContributionsCount
      : 0);

  return {
    name: user.name || user.login,
    stars: totalStars,
    commits,
    prs: user.pullRequests.totalCount,
    issues: user.issues.totalCount,
    reviews: user.contributionsCollection.totalPullRequestReviewContributions,
    followers: user.followers.totalCount,
  };
}

const LANGS_QUERY = `
query userLangs($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
}`;

/** Récupère et agrège les langages (en octets) d'un utilisateur (pagine au-delà de 100 repos). */
export async function fetchTopLangs(username) {
  const totals = new Map();
  let after = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const data = await graphql(LANGS_QUERY, { login: username, after });
    const user = data.user;
    if (!user) throw new Error(`Utilisateur introuvable : ${username}`);

    for (const repo of user.repositories.nodes) {
      for (const edge of repo.languages.edges) {
        const name = edge.node.name;
        const prev = totals.get(name) || {
          name,
          color: edge.node.color || "#858585",
          size: 0,
        };
        prev.size += edge.size;
        totals.set(name, prev);
      }
    }

    if (!user.repositories.pageInfo.hasNextPage) break;
    after = user.repositories.pageInfo.endCursor;
  }

  const langs = [...totals.values()].sort((a, b) => b.size - a.size);
  const totalSize = langs.reduce((s, l) => s + l.size, 0) || 1;
  return langs.map((l) => ({ ...l, percent: (l.size / totalSize) * 100 }));
}
