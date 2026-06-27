import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LEGACY_DIR = path.join(ROOT, "minar");
const RELAY_DIR = path.join(ROOT, "relay");

function moveIfExists(from: string, to: string) {
  if (!fs.existsSync(from) || fs.existsSync(to)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.renameSync(from, to);
}

function copyIfExists(from: string, to: string) {
  if (!fs.existsSync(from) || fs.existsSync(to)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

/** Migra carpeta y nombres viejos (minar/*) al esquema relay/*. */
export function migrateLegacyRelayLayout() {
  if (!fs.existsSync(LEGACY_DIR)) return;

  fs.mkdirSync(RELAY_DIR, { recursive: true });

  const pairs: [string, string][] = [
    ["config.json", "settings.json"],
    ["config.example.json", "settings.example.json"],
    ["algo-perf.json", "perf-cache.json"],
    ["xmrig.log", "session.log"],
    ["miner.pid", "session.pid"],
    ["xmrig-runtime.json", "runtime.json"],
  ];

  for (const [fromName, toName] of pairs) {
    moveIfExists(path.join(LEGACY_DIR, fromName), path.join(RELAY_DIR, toName));
  }

  moveIfExists(path.join(LEGACY_DIR, "xmrig"), path.join(RELAY_DIR, "bin"));

  const binDir = path.join(RELAY_DIR, "bin");
  if (fs.existsSync(binDir)) {
    const coreWin = path.join(binDir, "core.exe");
    const coreUnix = path.join(binDir, "core");
    if (!fs.existsSync(coreWin) && fs.existsSync(path.join(binDir, "xmrig.exe"))) {
      fs.renameSync(path.join(binDir, "xmrig.exe"), coreWin);
    }
    if (!fs.existsSync(coreUnix) && fs.existsSync(path.join(binDir, "xmrig"))) {
      fs.renameSync(path.join(binDir, "xmrig"), coreUnix);
    }
  }

  // Copiar restos sueltos y luego intentar borrar legacy vacío
  try {
    const left = fs.readdirSync(LEGACY_DIR);
    if (left.length === 0) {
      fs.rmdirSync(LEGACY_DIR);
    }
  } catch {
    /* ignore */
  }
}
