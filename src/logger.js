// Log d'erreurs : console (visible via journalctl) + fichier projet logs/error.log.
// L'écriture fichier est "best effort" : si le dossier n'est pas accessible en
// écriture (droits www-data), on ne casse pas la requête, on log juste en console.
import { appendFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const logDir = join(root, "logs");
const logFile = join(logDir, "error.log");

let dirReady = false;
async function ensureDir() {
  if (dirReady) return;
  try {
    await mkdir(logDir, { recursive: true });
    dirReady = true;
  } catch {
    // on tentera quand même l'append ; s'il échoue, tant pis (console suffit)
  }
}

/**
 * Journalise une erreur. Le détail complet (message, stack) ne va QUE dans les
 * logs — jamais dans la réponse HTTP.
 */
export async function logError(context, username, err) {
  const detail = err?.stack || err?.message || String(err);
  const line = `[${new Date().toISOString()}] [${context}] user=${username ?? "-"} ${detail}\n`;
  console.error(line.trimEnd());
  try {
    await ensureDir();
    await appendFile(logFile, line);
  } catch (e) {
    console.error("logger: écriture fichier impossible:", e.message);
  }
}
