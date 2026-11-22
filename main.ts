// Midnight Gallery — entrypoint for make.fun's "Make the best heist game" bounty.
// Copies game/ and screenshots/ into the output directory and writes the
// dossier.json the gate compares byte for byte with buildDossier's own output.
// Runs on Node 22 with the standard library only; nothing is installed.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The grader hands the entry a writable /output; outside the grader the
// MAKEFUN_OUTPUT_DIR environment variable stands in for it.
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The repository root is the directory holding this file.
const REPO_ROOT = dirname(fileURLToPath(import.meta.url));

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyEntryDir(name: string): void {
  const source = join(REPO_ROOT, name);
  const target = join(OUTPUT_DIR, name);
  if (!existsSync(source)) {
    throw new Error(`missing ${name}/ in the repository`);
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });
  cpSync(source, target, { recursive: true });
}

// (dossier step follows)
function writeDossier(): void {
  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
}

// Hand the game in: copy the game and its screenshots, then write the
// dossier from them. The two runs the grader makes must write the same
// bytes, and they do: copying is content-only and buildDossier is
// deterministic over the same directory.
copyEntryDir('game');
copyEntryDir('screenshots');
writeDossier();
