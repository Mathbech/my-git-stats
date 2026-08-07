// Accès à l'API GraphQL de GitHub. Un seul token (PAT_1) suffit pour commencer.
// Node 20+ fournit fetch() nativement, aucune dépendance HTTP requise.

const GITHUB_GRAPHQL = "https://api.github.com/graphql";

function getToken() {
  const token = process.env.PAT_1 || process.env.GITHUB_TOKEN;
  if (!token) throw new Error("Aucun token : définis PAT_1 dans l'environnement.");
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

const STATS_QUERY = `
query userStats($login: String!) {
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
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: { field: STARGAZERS, direction: DESC }) {
      totalCount
      nodes { stargazers { totalCount } }
    }
  }
}`;

/** Récupère les stats agrégées d'un utilisateur. */
export async function fetchStats(username, { includeAllCommits = false } = {}) {
  const data = await graphql(STATS_QUERY, { login: username });
  const user = data.user;
  if (!user) throw new Error(`Utilisateur introuvable : ${username}`);

  const totalStars = user.repositories.nodes.reduce(
    (sum, r) => sum + (r.stargazers?.totalCount || 0),
    0,
  );
  const commits =
    user.contributionsCollection.totalCommitContributions +
    (includeAllCommits ? user.contributionsCollection.restrictedContributionsCount : 0);

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
query userLangs($login: String!) {
  user(login: $login) {
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges {
            size
            node { name color }
          }
        }
      }
    }
  }
}`;

/** Récupère et agrège les langages (en octets) d'un utilisateur. */
export async function fetchTopLangs(username) {
  const data = await graphql(LANGS_QUERY, { login: username });
  const user = data.user;
  if (!user) throw new Error(`Utilisateur introuvable : ${username}`);

  const totals = new Map();
  for (const repo of user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      const name = edge.node.name;
      const prev = totals.get(name) || { name, color: edge.node.color || "#858585", size: 0 };
      prev.size += edge.size;
      totals.set(name, prev);
    }
  }

  const langs = [...totals.values()].sort((a, b) => b.size - a.size);
  const totalSize = langs.reduce((s, l) => s + l.size, 0) || 1;
  return langs.map((l) => ({ ...l, percent: (l.size / totalSize) * 100 }));
}
