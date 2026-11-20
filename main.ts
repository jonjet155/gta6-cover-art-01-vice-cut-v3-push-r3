// VICE CUT — entrypoint (Node 22, standard library only).
//
// This program hands the app in: it copies the static app (app/) and the
// screenshots (screenshots/) from beside this file into the output directory
// and writes /output/dossier.json, the summary the judge reads, using the
// vendored make.fun library (vendor/makefun-app.ts, untouched).
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

// Directory of this file, and the output directory (grader's /output, or the
// MAKEFUN_OUTPUT_DIR override when run locally).
const here = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the whole static app first: index.html, styles, ES modules, fonts and
// sample photos. Nothing here is built or transformed; the browser loads the
// files exactly as they sit in app/.
mkdirSync(outDir, { recursive: true });
cpSync(join(here, 'app'), join(outDir, 'app'), { recursive: true });

// Screenshots ride along next (the first by name is the cover). They are
// optional on disk but always present in a finished entry.
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(outDir, 'screenshots'), {
    recursive: true,
  });
}

// The dossier is built from what actually landed in the output directory, so
// it always describes the entry the scorer sees. Caps mirror the gate:
// at most 4 screenshots of 256 KiB, app/ under 993 files / 48 MiB, and the
// dossier text capped at 160 KiB.
const dossierPath = join(outDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);

// Read the dossier back and say what landed: a write that silently
// truncated or a copy that dropped a screenshot would otherwise pass
// unnoticed until the scorer refused the entry.
const dossier = JSON.parse(readFileSync(dossierPath, 'utf8'));
const shotCount = readdirSync(join(outDir, 'screenshots')).filter((file) =>
  /\.(png|jpe?g)$/i.test(file),
).length;
console.log(
  `VICE CUT handed in: app/ + ${shotCount} screenshot(s) copied to ${outDir}; ` +
    `dossier.json ${statSync(dossierPath).size} bytes, ` +
    `${dossier.app?.sourceFiles ?? '?'} source files listed`,
);
