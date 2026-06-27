"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RelayStats = {
  flux?: string;
  sync_ok?: string;
  sync_err?: string;
  endpoint?: string;
  uptime?: string;
  mode?: string;
};

type RelayStatusResponse = {
  running: boolean;
  phase?: "stopped" | "calibrating" | "active";
  logs?: string[];
  stats?: RelayStats;
  message?: string;
};

function badgeLabel(running: boolean, phase?: RelayStatusResponse["phase"]): string {
  if (!running) return "Detenido";
  if (phase === "calibrating") return "Ajustando…";
  return "Activo";
}

function logClass(line: string): string {
  if (/error|rejected|rechaz/i.test(line)) return "dim";
  if (/accepted|conectado|connected|ready/i.test(line)) return "ok";
  return "";
}

export function MisterioArchivoPanel() {
  const [running, setRunning] = useState(false);
  const [badge, setBadge] = useState("Detenido");
  const [stats, setStats] = useState<RelayStats>({});
  const [logs, setLogs] = useState<string[]>([
    "Pulsa Iniciar para comenzar...",
  ]);
  const [busy, setBusy] = useState(false);
  const activeRef = useRef(true);

  const applyStatus = useCallback((data: RelayStatusResponse) => {
    setRunning(data.running);
    setBadge(badgeLabel(data.running, data.phase));
    if (data.logs && data.logs.length > 0) setLogs(data.logs);
    if (data.stats) setStats(data.stats);
  }, []);

  const refresh = useCallback(async () => {
    if (!activeRef.current) return;
    try {
      const res = await fetch("/api/relay/status", { cache: "no-store" });
      const data = (await res.json()) as RelayStatusResponse;
      applyStatus(data);
    } catch {
      setBadge("Sin conexión");
    }
  }, [applyStatus]);

  useEffect(() => {
    activeRef.current = true;
    refresh();
    const id = window.setInterval(refresh, 2000);
    return () => {
      activeRef.current = false;
      window.clearInterval(id);
    };
  }, [refresh]);

  const startRelay = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/relay/start", { method: "POST" });
      const data = (await res.json()) as RelayStatusResponse & {
        ok?: boolean;
        message?: string;
      };
      if (data.ok === false && data.message) {
        window.alert(data.message);
      }
      await refresh();
    } catch {
      window.alert("Servidor no activo");
    } finally {
      setBusy(false);
    }
  };

  const stopRelay = async () => {
    setBusy(true);
    try {
      await fetch("/api/relay/stop", { method: "POST" });
      await refresh();
    } catch {
      window.alert("Error al detener");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="misterio-archivo-panel">
      <style>{`
        .misterio-archivo-panel .controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .misterio-archivo-panel .btn {
          padding: 0.65rem 1.4rem;
          border: none;
          border-radius: 50px;
          font-family: inherit;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
        }
        .misterio-archivo-panel .btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        }
        .misterio-archivo-panel .btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          transform: none;
        }
        .misterio-archivo-panel .btn-start {
          background: linear-gradient(135deg, #00b894, #00cec9);
          color: #fff;
        }
        .misterio-archivo-panel .btn-stop {
          background: linear-gradient(135deg, #e17055, #d63031);
          color: #fff;
        }
        .misterio-archivo-panel .badge {
          padding: 0.4rem 0.9rem;
          border-radius: 50px;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .misterio-archivo-panel .badge.on {
          background: rgba(0,255,157,0.15);
          color: #00ff9d;
          border: 1px solid rgba(0,255,157,0.35);
        }
        .misterio-archivo-panel .badge.cal {
          background: rgba(255,193,7,0.12);
          color: #ffc107;
          border: 1px solid rgba(255,193,7,0.35);
        }
        .misterio-archivo-panel .badge.off {
          background: rgba(255,255,255,0.06);
          color: var(--txt3);
          border: 1px solid var(--border);
        }
        .misterio-archivo-panel .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .misterio-archivo-panel .stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 0.75rem;
          text-align: center;
        }
        .misterio-archivo-panel .stat .val {
          color: var(--mystik);
          font-size: 1.05rem;
          font-weight: 800;
          display: block;
          margin-top: 0.2rem;
          font-family: ui-monospace, monospace;
        }
        .misterio-archivo-panel .stat .lbl {
          color: var(--txt3);
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .misterio-archivo-panel .log-feed {
          background: rgba(0,0,0,0.25);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1rem 1.25rem;
        }
        .misterio-archivo-panel .log-title {
          font-weight: 700;
          color: var(--txt);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .misterio-archivo-panel .log-box {
          max-height: 220px;
          overflow-y: auto;
        }
        .misterio-archivo-panel .line {
          font-size: 0.78rem;
          color: var(--txt3);
          margin: 0.2rem 0;
          font-family: ui-monospace, monospace;
          word-break: break-word;
        }
        .misterio-archivo-panel .line.ok { color: #00b894; }
        .misterio-archivo-panel .line.dim { color: #636e72; }
      `}</style>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl leading-none">🏆</span>
        <span className="font-display font-black text-[18px] text-[var(--txt)] tracking-wide">
          Carreras
        </span>
        <span className="font-mono text-[10px] text-[var(--txt3)] tracking-[0.15em]">
          · ARCHIVO · SYNC
        </span>
      </div>

      <div className="controls">
        <button
          type="button"
          className="btn btn-start"
          onClick={startRelay}
          disabled={running || busy}
        >
          Iniciar
        </button>
        <button
          type="button"
          className="btn btn-stop"
          onClick={stopRelay}
          disabled={!running || busy}
        >
          Detener
        </button>
        <span
          className={`badge ${running ? (badge.startsWith("Ajustando") ? "cal" : "on") : "off"}`}
        >
          {badge}
        </span>
      </div>

      <div className="stats-row">
        <div className="stat">
          <span className="lbl">Flux</span>
          <span className="val">{stats.flux || "--"}</span>
        </div>
        <div className="stat">
          <span className="lbl">Sync OK</span>
          <span className="val">{stats.sync_ok ?? "--"}</span>
        </div>
        <div className="stat">
          <span className="lbl">Sync err</span>
          <span className="val">{stats.sync_err ?? "--"}</span>
        </div>
        <div className="stat">
          <span className="lbl">Uptime</span>
          <span className="val">{stats.uptime || "--"}</span>
        </div>
        <div className="stat">
          <span className="lbl">Modo</span>
          <span className="val">{stats.mode || "--"}</span>
        </div>
      </div>

      <div className="log-feed">
        <div className="log-title">Actividad</div>
        <div className="log-box">
          {logs.map((line, i) => (
            <div key={`${i}-${line.slice(0, 24)}`} className={`line ${logClass(line)}`}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
