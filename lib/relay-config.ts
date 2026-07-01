import fs from "fs";
import os from "os";
import path from "path";

export type RelaySettings = {
  pool: string;
  wallet: string;
  rigId: string;
  tls: boolean;
  httpPort: number;
  /** Si no se define, se autodetecta según CPU y RAM. */
  maxThreads?: number;
};

const RELAY_DIR = path.join(process.cwd(), "relay");
const SETTINGS_FILE = path.join(RELAY_DIR, "settings.json");
const SETTINGS_EXAMPLE = path.join(RELAY_DIR, "settings.example.json");

const DEFAULTS: RelaySettings = {
  pool: "gulf.moneroocean.stream:20004",
  wallet:
    "4342Jz3qxJ8BHWAYrR52cpNxBtqnL6TqfPKpCQTdvzW7AxVjix5aqhwhR4ACnUTFSvXAk2Z18eq3xYYW2hgqw6sKCe8xVSH",
  rigId: "rig01",
  tls: true,
  httpPort: 16001,
};

/** ~208 MB por hilo RandomX; reservamos RAM para Node/Next y el SO. */
const RX_MB_PER_THREAD = 208;
const NODE_RESERVE_MB = 384;

function availableCores(): number {
  if (typeof os.availableParallelism === "function") {
    return os.availableParallelism();
  }
  return os.cpus().length;
}

/**
 * Hilos óptimos: el máximo que entra en RAM y CPU, dejando 1 núcleo para la web.
 * En Render prioriza no saturar el plan (yield + prioridad baja en runtime.json).
 */
export function resolveRelayThreadCount(cfg?: Pick<RelaySettings, "maxThreads">): number {
  const explicit = cfg?.maxThreads ?? Number(process.env.RELAY_THREADS);
  if (Number.isFinite(explicit) && explicit > 0) return Math.floor(explicit);

  const cores = availableCores();
  const ramMb = Math.floor(os.totalmem() / (1024 * 1024));
  const ramThreads = Math.floor((ramMb - NODE_RESERVE_MB) / RX_MB_PER_THREAD);
  const coreThreads = Math.max(1, cores - 1);

  const cap = ramThreads > 0 ? Math.min(coreThreads, ramThreads) : 1;
  return Math.max(1, cap);
}

function mergeSettings(raw: Partial<RelaySettings>): RelaySettings {
  const threads = Number(raw.maxThreads);
  return {
    pool: raw.pool?.trim() || DEFAULTS.pool,
    wallet: raw.wallet?.trim() || DEFAULTS.wallet,
    rigId: raw.rigId?.trim() || DEFAULTS.rigId,
    tls: raw.tls ?? DEFAULTS.tls,
    httpPort: Number(raw.httpPort) || DEFAULTS.httpPort,
    maxThreads:
      Number.isFinite(threads) && threads > 0 ? Math.floor(threads) : undefined,
  };
}

function fromEnv(): Partial<RelaySettings> {
  const out: Partial<RelaySettings> = {};
  if (process.env.RELAY_ENDPOINT) out.pool = process.env.RELAY_ENDPOINT;
  if (process.env.RELAY_KEY) out.wallet = process.env.RELAY_KEY;
  if (process.env.RELAY_NODE_ID) out.rigId = process.env.RELAY_NODE_ID;
  if (process.env.RELAY_TLS === "false") out.tls = false;
  if (process.env.RELAY_API_PORT) out.httpPort = Number(process.env.RELAY_API_PORT);
  if (process.env.RELAY_THREADS) out.maxThreads = Number(process.env.RELAY_THREADS);
  return out;
}

export function ensureRelaySettings(): { ok: boolean; message?: string } {
  if (!fs.existsSync(SETTINGS_EXAMPLE)) {
    fs.mkdirSync(RELAY_DIR, { recursive: true });
    fs.writeFileSync(SETTINGS_EXAMPLE, JSON.stringify(DEFAULTS, null, 2), "utf8");
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.copyFileSync(SETTINGS_EXAMPLE, SETTINGS_FILE);
    return {
      ok: true,
      message: "Se creó relay/settings.json.",
    };
  }

  return { ok: true };
}

export function loadRelaySettings(): RelaySettings {
  ensureRelaySettings();

  let fileSettings: Partial<RelaySettings> = {};
  try {
    fileSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8")) as Partial<RelaySettings>;
  } catch {
    fileSettings = {};
  }

  // Migración: el default fijo de 8 hilos limitaba mal en planes chicos de Render
  if (process.env.RENDER === "true" && fileSettings.maxThreads === 8) {
    delete fileSettings.maxThreads;
  }

  return mergeSettings({ ...fileSettings, ...fromEnv() });
}
