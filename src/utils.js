// Petites fonctions utilitaires partagées.

/** Échappe les caractères spéciaux XML pour éviter de casser le SVG. */
export function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Formate un nombre : 6626 -> "6.6k". */
export function formatNumber(n) {
  if (n === null || n === undefined) return "0";
  if (n < 1000) return String(n);
  const units = ["k", "M", "B"];
  let u = -1;
  let value = n;
  while (value >= 1000 && u < units.length - 1) {
    value /= 1000;
    u++;
  }
  return `${value.toFixed(1).replace(/\.0$/, "")}${units[u]}`;
}

/** Nettoie une couleur hex venant d'une query string (retire un éventuel #). */
export function sanitizeHex(value, fallback) {
  if (!value) return fallback;
  const v = String(value).replace(/^#/, "");
  return /^([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(v)
    ? `#${v}`
    : fallback;
}

/** Parse un booléen de query string ("true"/"1"). */
export function parseBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value === "true" || value === "1" || value === "";
}
