// Charge .env (et .env.local s'il existe) dans process.env, sans dépendance.
// Ordre de priorité : variables déjà définies (shell/systemd) > .env.local > .env
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// Variables déjà présentes au démarrage (shell/systemd) : toujours prioritaires.
const preset = new Set(Object.keys(process.env));

function loadFile(name, { override = false } = {}) {
  try {
    const content = readFileSync(join(root, name), "utf8");
    for (const raw of content.split("\n")) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (preset.has(key)) continue; // shell/systemd gagne toujours
      if (override || !(key in process.env)) process.env[key] = val;
    }
  } catch {
    // Fichier absent : on ignore.
  }
}

// .env d'abord, puis .env.local qui a la priorité (mais pas sur le shell).
loadFile(".env");
loadFile(".env.local", { override: true });
