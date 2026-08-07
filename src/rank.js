// Calcul du rang (S, A+, A, A-, B+, B, B-, C+, C), repris de l'algorithme de
// github-readme-stats : somme pondérée de percentiles via CDF exponentielle et
// log-normale. Ce n'est PAS une métrique officielle GitHub, juste un score.

function exponentialCdf(x) {
  return 1 - 2 ** -x;
}

function logNormalCdf(x) {
  // Approximation utilisée par github-readme-stats.
  return x / (1 + x);
}

/**
 * @param {{commits:number, prs:number, issues:number, reviews:number,
 *          stars:number, followers:number, allCommits?:boolean}} p
 * @returns {{ level:string, percentile:number }} percentile : 0 (meilleur) → 100
 */
export function calculateRank({
  commits = 0,
  prs = 0,
  issues = 0,
  reviews = 0,
  stars = 0,
  followers = 0,
  allCommits = false,
}) {
  const COMMITS_MEDIAN = allCommits ? 1000 : 250;
  const COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50;
  const PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25;
  const ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2;
  const REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50;
  const STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10;
  const FOLLOWERS_WEIGHT = 1;

  const TOTAL_WEIGHT =
    COMMITS_WEIGHT +
    PRS_WEIGHT +
    ISSUES_WEIGHT +
    REVIEWS_WEIGHT +
    STARS_WEIGHT +
    FOLLOWERS_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];

  const rank =
    1 -
    (COMMITS_WEIGHT * exponentialCdf(commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponentialCdf(prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponentialCdf(issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponentialCdf(reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * logNormalCdf(stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * logNormalCdf(followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT;

  const percentile = rank * 100;
  const level = LEVELS[THRESHOLDS.findIndex((t) => percentile <= t)];
  return { level, percentile };
}
