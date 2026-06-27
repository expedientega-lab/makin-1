"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const LS_HIGHSCORE = "mystika-misterio-juego-hs";
const ROUND_SEC = 30;
const WORLD = 48;
const MOVE_SPEED = 14;
const NET_SPEED = 38;
const NET_RANGE = 28;
const NET_HIT = 3.6;
const SHOOT_COOLDOWN = 0.16;
const SIGNAL_ICONS = ["✦", "🛸", "🔮", "⚡", "👁️", "🌙"];
const SIGNAL_COLORS = ["#39ff14", "#00e5ff", "#b388ff", "#ffd700", "#ff6b35"];

type GamePhase = "idle" | "countdown" | "playing" | "done";

type WorldSignal = {
  id: number;
  x: number;
  y: number;
  z: number;
  icon: string;
  color: string;
  born: number;
  life: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
};

type FloatText = {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
};

type NetBolt = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dist: number;
  trail: { x: number; y: number }[];
};

type Player = { x: number; y: number; yaw: number };

type GameRefs = {
  player: Player;
  signals: WorldSignal[];
  particles: Particle[];
  floatTexts: FloatText[];
  nets: NetBolt[];
  keys: Set<string>;
  moveX: number;
  moveY: number;
  lookDX: number;
  spawnAcc: number;
  combo: number;
  comboTimer: number;
  lastTime: number;
  shake: number;
  flash: number;
  difficulty: number;
  signalId: number;
  timeLeft: number;
  score: number;
  phase: GamePhase;
  countdown: number;
  captured: number;
  netId: number;
  muzzleFlash: number;
  shootCooldown: number;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function rankFor(score: number) {
  if (score >= 200) return "Maestro del portal";
  if (score >= 120) return "Cazador experto";
  if (score >= 60) return "Explorador activo";
  return "Iniciado místico";
}

function releasePointerLock() {
  if (document.pointerLockElement) {
    document.exitPointerLock?.();
  }
}

function resetPlayerInput(g: GameRefs) {
  g.keys.clear();
  g.moveX = 0;
  g.moveY = 0;
  g.lookDX = 0;
}

export function MisterioFpsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const gameRef = useRef<GameRefs | null>(null);
  const phaseRef = useRef<GamePhase>("idle");
  const runIdRef = useRef(0);
  const pointerLocked = useRef(false);
  const dragLookRef = useRef(false);
  const lastLookXRef = useRef(0);
  const hudSyncRef = useRef(0);

  const [phase, setPhase] = useState<GamePhase>("idle");
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_SEC);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [newRecord, setNewRecord] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [mouseLocked, setMouseLocked] = useState(false);
  const [hudTick, setHudTick] = useState(0);

  const initGame = useCallback((): GameRefs => ({
    player: { x: WORLD / 2, y: WORLD / 2, yaw: 0 },
    signals: [],
    particles: [],
    floatTexts: [],
    nets: [],
    keys: new Set(),
    moveX: 0,
    moveY: 0,
    lookDX: 0,
    spawnAcc: 0,
    combo: 0,
    comboTimer: 0,
    lastTime: 0,
    shake: 0,
    flash: 0,
    difficulty: 1,
    signalId: 0,
    timeLeft: ROUND_SEC,
    score: 0,
    phase: "countdown",
    countdown: 3,
    captured: 0,
    netId: 0,
    muzzleFlash: 0,
    shootCooldown: 0,
  }), []);

  useEffect(() => {
    const hs = parseInt(localStorage.getItem(LS_HIGHSCORE) || "0", 10);
    if (Number.isFinite(hs)) setHighScore(hs);
    setIsTouch("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  const spawnSignal = useCallback((g: GameRefs, inFront = true) => {
    const angle = inFront
      ? g.player.yaw + (Math.random() - 0.5) * 1.4
      : Math.random() * Math.PI * 2;
    const dist = 5 + Math.random() * 12;
    const x = clamp(g.player.x + Math.sin(angle) * dist, 2, WORLD - 2);
    const y = clamp(g.player.y + Math.cos(angle) * dist, 2, WORLD - 2);
    g.signals.push({
      id: ++g.signalId,
      x,
      y,
      z: 0.6 + Math.random() * 0.8,
      icon: SIGNAL_ICONS[Math.floor(Math.random() * SIGNAL_ICONS.length)],
      color: SIGNAL_COLORS[Math.floor(Math.random() * SIGNAL_COLORS.length)],
      born: performance.now(),
      life: Math.max(2200, 3800 - g.difficulty * 120),
    });
  }, []);

  const applyCapture = useCallback(
    (g: GameRefs, sig: WorldSignal, canvasW: number, canvasH: number) => {
      if (!g.signals.some((s) => s.id === sig.id)) return;

      g.signals = g.signals.filter((s) => s.id !== sig.id);
      g.comboTimer = 1.6;
      g.combo = Math.min(8, g.combo + 1);
      const mult = g.combo;
      const pts = 10 * mult;
      g.score += pts;
      g.captured += 1;
      g.shake = 0.35;
      g.flash = 0.25;
      g.difficulty = Math.min(6, 1 + g.captured * 0.12);

      if (g.captured % 5 === 0) {
        g.timeLeft = Math.min(ROUND_SEC + 15, g.timeLeft + 3);
        g.floatTexts.push({
          x: canvasW / 2,
          y: canvasH * 0.3,
          text: "+3s BONUS",
          color: "#ffd700",
          life: 1.2,
        });
      }

      g.floatTexts.push({
        x: canvasW / 2 + (Math.random() - 0.5) * 40,
        y: canvasH / 2 - 20,
        text: mult > 1 ? `+${pts} x${mult}` : `+${pts}`,
        color: sig.color,
        life: 0.9,
      });

      for (let i = 0; i < 14; i++) {
        const a = (Math.PI * 2 * i) / 14;
        g.particles.push({
          x: canvasW / 2,
          y: canvasH / 2,
          vx: Math.cos(a) * (80 + Math.random() * 120),
          vy: Math.sin(a) * (80 + Math.random() * 120),
          life: 0.5 + Math.random() * 0.3,
          color: sig.color,
        });
      }
    },
    []
  );

  const fireNet = useCallback((g: GameRefs) => {
    if (g.shootCooldown > 0) return;
    g.shootCooldown = SHOOT_COOLDOWN;
    g.muzzleFlash = 0.35;
    const yaw = g.player.yaw;
    const vx = Math.sin(yaw) * NET_SPEED;
    const vy = Math.cos(yaw) * NET_SPEED;

    let tx = vx;
    let ty = vy;
    let nearest: WorldSignal | null = null;
    let nearestAng = Infinity;
    for (const sig of g.signals) {
      const dx = sig.x - g.player.x;
      const dy = sig.y - g.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > NET_RANGE) continue;
      const ang = Math.abs(Math.atan2(dx, dy) - yaw);
      const normAng = Math.min(ang, Math.PI * 2 - ang);
      if (normAng < 0.55 && normAng < nearestAng) {
        nearestAng = normAng;
        nearest = sig;
      }
    }
    if (nearest) {
      const dx = nearest.x - g.player.x;
      const dy = nearest.y - g.player.y;
      const len = Math.hypot(dx, dy) || 1;
      tx = (dx / len) * NET_SPEED;
      ty = (dy / len) * NET_SPEED;
    }

    g.nets.push({
      id: ++g.netId,
      x: g.player.x + tx * 0.08,
      y: g.player.y + ty * 0.08,
      vx: tx,
      vy: ty,
      dist: 0,
      trail: [],
    });
  }, []);

  const updateNets = useCallback(
    (g: GameRefs, dt: number, canvasW: number, canvasH: number) => {
      for (const net of [...g.nets]) {
        net.trail.push({ x: net.x, y: net.y });
        if (net.trail.length > 8) net.trail.shift();
        net.x += net.vx * dt;
        net.y += net.vy * dt;
        net.dist += NET_SPEED * dt;

        let hit: WorldSignal | null = null;
        for (const sig of g.signals) {
          if (Math.hypot(sig.x - net.x, sig.y - net.y) < NET_HIT + sig.z * 0.4) {
            hit = sig;
            break;
          }
        }
        if (hit) {
          applyCapture(g, hit, canvasW, canvasH);
          g.nets = g.nets.filter((n) => n.id !== net.id);
          continue;
        }
        if (net.dist >= NET_RANGE) {
          g.nets = g.nets.filter((n) => n.id !== net.id);
        }
      }
    },
    [applyCapture]
  );

  const projectWorld = useCallback(
    (
      wx: number,
      wy: number,
      wz: number,
      player: Player,
      w: number,
      h: number,
      horizon: number
    ) => {
      const dx = wx - player.x;
      const dy = wy - player.y;
      const cos = Math.cos(-player.yaw);
      const sin = Math.sin(-player.yaw);
      const rz = dx * sin + dy * cos;
      const rx = dx * cos - dy * sin;
      if (rz < 0.35) return null;
      const sx = w / 2 + (rx / rz) * (w / 1.12);
      const sy = horizon - (wz * 30) / rz + (1 / rz) * (h * 0.025);
      const scale = clamp(130 / rz, 8, 110);
      return { sx, sy, scale, rz, dist: Math.hypot(dx, dy) };
    },
    []
  );

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, g: GameRefs, w: number, h: number, now: number) => {
      const shakeX = g.shake > 0 ? (Math.random() - 0.5) * g.shake * 10 : 0;
      const shakeY = g.shake > 0 ? (Math.random() - 0.5) * g.shake * 10 : 0;
      g.shake = Math.max(0, g.shake - 0.04);
      g.flash = Math.max(0, g.flash - 0.06);
      g.muzzleFlash = Math.max(0, g.muzzleFlash - 0.05);

      ctx.save();
      ctx.translate(shakeX, shakeY);

      const horizon = h * 0.44;

      const sky = ctx.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, "#030108");
      sky.addColorStop(0.45, "#12082a");
      sky.addColorStop(0.85, "#1a1038");
      sky.addColorStop(1, "#0d0820");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, horizon);

      const neb = ctx.createRadialGradient(w * 0.3, horizon * 0.35, 0, w * 0.5, horizon * 0.4, w * 0.55);
      neb.addColorStop(0, "rgba(179,136,255,0.12)");
      neb.addColorStop(0.5, "rgba(0,229,255,0.05)");
      neb.addColorStop(1, "transparent");
      ctx.fillStyle = neb;
      ctx.fillRect(0, 0, w, horizon);

      const floor = ctx.createLinearGradient(0, horizon, 0, h);
      floor.addColorStop(0, "#0a0618");
      floor.addColorStop(0.35, "#060410");
      floor.addColorStop(1, "#020104");
      ctx.fillStyle = floor;
      ctx.fillRect(0, horizon, w, h - horizon);

      const { player } = g;
      const gridStep = 3;
      const lines: { dist: number; draw: () => void }[] = [];

      const drawGridLine = (x1: number, y1: number, x2: number, y2: number, dist: number, hue: string) => {
        lines.push({
          dist,
          draw: () => {
            ctx.beginPath();
            let started = false;
            for (let t = 0; t <= 1; t += 0.04) {
              const wx = x1 + (x2 - x1) * t;
              const wy = y1 + (y2 - y1) * t;
              const p = projectWorld(wx, wy, 0, player, w, h, horizon);
              if (!p) continue;
              if (!started) {
                ctx.moveTo(p.sx, p.sy);
                started = true;
              } else ctx.lineTo(p.sx, p.sy);
            }
            if (started) {
              const a = clamp(0.28 - dist * 0.006, 0.03, 0.28);
              ctx.strokeStyle = hue.replace("A", String(a));
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          },
        });
      };

      for (let gx = 0; gx <= WORLD; gx += gridStep) {
        const mx = gx - player.x;
        const my = WORLD / 2 - player.y;
        drawGridLine(gx, 0, gx, WORLD, Math.hypot(mx, my), "rgba(0,229,255,A)");
      }
      for (let gy = 0; gy <= WORLD; gy += gridStep) {
        const mx = WORLD / 2 - player.x;
        const my = gy - player.y;
        drawGridLine(0, gy, WORLD, gy, Math.hypot(mx, my), "rgba(179,136,255,A)");
      }

      lines.sort((a, b) => b.dist - a.dist);
      lines.forEach((l) => l.draw());

      for (let i = 0; i < 55; i++) {
        const twinkle = 0.2 + Math.sin(now * 0.003 + i * 1.7) * 0.15;
        const sx = ((i * 137.5 + player.yaw * 50) % w + w) % w;
        const sy = (i * 53) % (horizon * 0.92);
        ctx.fillStyle = `rgba(220,210,255,${twinkle})`;
        ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1.2, i % 3 === 0 ? 2 : 1.2);
      }

      const projected = g.signals
        .map((sig) => {
          const p = projectWorld(sig.x, sig.y, sig.z, player, w, h, horizon);
          if (!p) return null;
          const pulse = 1 + Math.sin(now * 0.007 + sig.id) * 0.1;
          const age = now - sig.born;
          const fade = age > sig.life - 700 ? (sig.life - age) / 700 : 1;
          return { sig, ...p, size: p.scale * pulse, fade };
        })
        .filter(Boolean) as {
        sig: WorldSignal;
        sx: number;
        sy: number;
        size: number;
        dist: number;
        fade: number;
      }[];

      projected.sort((a, b) => b.dist - a.dist);

      for (const p of projected) {
        const alpha = clamp(1 - p.dist * 0.03, 0.3, 1) * p.fade;
        const { sig, sx, sy, size } = p;
        const rot = now * 0.002 + sig.id;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(rot);

        const outer = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size);
        outer.addColorStop(0, `${sig.color}55`);
        outer.addColorStop(0.6, `${sig.color}18`);
        outer.addColorStop(1, "transparent");
        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `${sig.color}${Math.floor(alpha * 180).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 0.5, size * 0.22, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();

        ctx.font = `bold ${size * 0.5}px system-ui`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.shadowColor = sig.color;
        ctx.shadowBlur = 12;
        ctx.fillText(sig.icon, sx, sy - size * 0.05);
        ctx.shadowBlur = 0;
      }

      for (const net of g.nets) {
        const head = projectWorld(net.x, net.y, 0.5, player, w, h, horizon);
        if (!head) continue;

        for (let i = 0; i < net.trail.length; i++) {
          const t = net.trail[i];
          const tp = projectWorld(t.x, t.y, 0.35, player, w, h, horizon);
          if (!tp) continue;
          const a = (i / net.trail.length) * 0.5;
          ctx.fillStyle = `rgba(0,229,255,${a})`;
          ctx.beginPath();
          ctx.arc(tp.sx, tp.sy, head.scale * 0.08 * (i / net.trail.length), 0, Math.PI * 2);
          ctx.fill();
        }

        const glow = ctx.createRadialGradient(head.sx, head.sy, 0, head.sx, head.sy, head.scale * 0.35);
        glow.addColorStop(0, "rgba(255,255,255,0.95)");
        glow.addColorStop(0.35, "rgba(0,229,255,0.8)");
        glow.addColorStop(1, "rgba(179,136,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(head.sx, head.sy, head.scale * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(head.sx, head.sy, head.scale * 0.18, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (const p of [...g.particles]) {
        p.life -= 0.016;
        p.x += p.vx * 0.016;
        p.y += p.vy * 0.016;
        p.vy += 100 * 0.016;
        if (p.life <= 0) {
          g.particles = g.particles.filter((x) => x !== p);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      for (const ft of [...g.floatTexts]) {
        ft.life -= 0.016;
        ft.y -= 36 * 0.016;
        if (ft.life <= 0) {
          g.floatTexts = g.floatTexts.filter((x) => x !== ft);
          continue;
        }
        ctx.font = "bold 17px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.life;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.globalAlpha = 1;
      }

      const cx = w / 2;
      const cy = h / 2;

      for (const sig of g.signals) {
        const dx = sig.x - player.x;
        const dy = sig.y - player.y;
        const cos = Math.cos(-player.yaw);
        const sin = Math.sin(-player.yaw);
        const rz = dx * sin + dy * cos;
        if (rz >= 0.35) continue;
        const worldAng = Math.atan2(dx, dy);
        const rel = worldAng - player.yaw;
        const edgeAng = Math.atan2(Math.sin(rel), Math.cos(rel));
        const margin = 28;
        const ex = cx + Math.sin(edgeAng) * (w * 0.42);
        const ey = cy - Math.cos(edgeAng) * (h * 0.38);
        const clampedX = clamp(ex, margin, w - margin);
        const clampedY = clamp(ey, margin, horizon - margin);

        ctx.save();
        ctx.translate(clampedX, clampedY);
        ctx.rotate(edgeAng);
        ctx.fillStyle = `${sig.color}cc`;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(7, 8);
        ctx.lineTo(-7, 8);
        ctx.closePath();
        ctx.fill();
        ctx.font = "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(sig.icon, 0, 4);
        ctx.restore();
      }

      const pulse = 0.65 + Math.sin(now * 0.012) * 0.2;

      ctx.strokeStyle = `rgba(0,229,255,${pulse})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.lineTo(cx - 3, cy);
      ctx.moveTo(cx + 3, cy);
      ctx.lineTo(cx + 10, cy);
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx, cy - 3);
      ctx.moveTo(cx, cy + 3);
      ctx.lineTo(cx, cy + 10);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fillRect(cx - 1, cy - 1, 2, 2);

      if (g.muzzleFlash > 0) {
        ctx.fillStyle = `rgba(0,229,255,${g.muzzleFlash * 0.45})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (g.flash > 0) {
        ctx.fillStyle = `rgba(179,136,255,${g.flash * 0.3})`;
        ctx.fillRect(0, 0, w, h);
      }

      ctx.globalAlpha = 0.04;
      for (let y = 0; y < h; y += 3) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, y, w, 1);
      }
      ctx.globalAlpha = 1;

      const vig = ctx.createRadialGradient(cx, cy, h * 0.15, cx, cy, h * 0.78);
      vig.addColorStop(0, "transparent");
      vig.addColorStop(1, "rgba(0,0,0,0.5)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      ctx.restore();
    },
    [projectWorld]
  );

  const tick = useCallback(
    (now: number) => {
      const g = gameRef.current;
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const currentPhase = phaseRef.current;

      if (!g || currentPhase === "idle") {
        const demoYaw = now * 0.00035;
        const demoPlayer = { x: WORLD / 2, y: WORLD / 2, yaw: demoYaw };
        const horizon = h * 0.44;
        const sky = ctx.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, "#030108");
        sky.addColorStop(0.5, "#1a1038");
        sky.addColorStop(1, "#0d0820");
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, w, horizon);
        const neb = ctx.createRadialGradient(w * 0.5, horizon * 0.3, 0, w * 0.5, horizon * 0.5, w * 0.6);
        neb.addColorStop(0, "rgba(179,136,255,0.15)");
        neb.addColorStop(1, "transparent");
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, w, horizon);
        const floor = ctx.createLinearGradient(0, horizon, 0, h);
        floor.addColorStop(0, "#0a0618");
        floor.addColorStop(1, "#020104");
        ctx.fillStyle = floor;
        ctx.fillRect(0, horizon, w, h - horizon);

        for (let i = 0; i < 40; i++) {
          const tw = 0.25 + Math.sin(now * 0.003 + i) * 0.2;
          ctx.fillStyle = `rgba(220,210,255,${tw})`;
          ctx.fillRect((i * 97 + now * 0.02) % w, (i * 41) % (horizon * 0.9), 2, 2);
        }

        const demoSignals = [
          { x: WORLD / 2 + 8, y: WORLD / 2 + 6, z: 1, icon: "🛸", color: "#00e5ff" },
          { x: WORLD / 2 - 5, y: WORLD / 2 + 10, z: 0.8, icon: "✦", color: "#39ff14" },
          { x: WORLD / 2 + 3, y: WORLD / 2 + 14, z: 1.1, icon: "🔮", color: "#b388ff" },
        ];
        for (const ds of demoSignals) {
          const p = projectWorld(ds.x, ds.y, ds.z + Math.sin(now * 0.004 + ds.x) * 0.15, demoPlayer, w, h, horizon);
          if (!p) continue;
          const size = p.scale * (1 + Math.sin(now * 0.006) * 0.08);
          ctx.font = `bold ${size * 0.5}px system-ui`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = ds.color;
          ctx.shadowBlur = 16;
          ctx.fillStyle = "rgba(255,255,255,0.9)";
          ctx.fillText(ds.icon, p.sx, p.sy);
          ctx.shadowBlur = 0;
        }

        ctx.strokeStyle = `rgba(0,229,255,${0.5 + Math.sin(now * 0.008) * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 14, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      g.phase = currentPhase;

      const dt = g.lastTime ? Math.min((now - g.lastTime) / 1000, 0.05) : 0.016;
      g.lastTime = now;

      if (currentPhase === "countdown") {
        drawFrame(ctx, g, w, h, now);
      } else if (currentPhase === "playing") {
        const speed = MOVE_SPEED;
        const rot = 2.4;
        let mx = g.moveX;
        let my = g.moveY;
        if (g.keys.has("w") || g.keys.has("arrowup")) my = Math.max(my, 1);
        if (g.keys.has("s") || g.keys.has("arrowdown")) my = Math.min(my, -1);
        if (g.keys.has("a")) mx = Math.min(mx, -1);
        if (g.keys.has("d")) mx = Math.max(mx, 1);
        if (g.keys.has("arrowleft")) g.player.yaw -= rot * dt;
        if (g.keys.has("arrowright")) g.player.yaw += rot * dt;

        const inputMag = Math.hypot(mx, my);
        if (inputMag > 1) {
          mx /= inputMag;
          my /= inputMag;
        }

        g.player.yaw += g.lookDX * dt * 2.2;
        g.lookDX *= 0.85;

        const cos = Math.cos(g.player.yaw);
        const sin = Math.sin(g.player.yaw);
        g.player.x = clamp(
          g.player.x + (sin * my + cos * mx) * speed * dt,
          1.5,
          WORLD - 1.5
        );
        g.player.y = clamp(
          g.player.y + (cos * my - sin * mx) * speed * dt,
          1.5,
          WORLD - 1.5
        );

        g.shootCooldown = Math.max(0, g.shootCooldown - dt);
        updateNets(g, dt, w, h);

        g.spawnAcc += dt;
        const spawnRate = Math.max(0.35, 0.95 - g.difficulty * 0.08);
        while (g.spawnAcc >= spawnRate) {
          g.spawnAcc -= spawnRate;
          if (g.signals.length < 8 + Math.floor(g.difficulty)) spawnSignal(g);
        }

        g.signals = g.signals.filter((s) => now - s.born < s.life);

        g.comboTimer -= dt;
        if (g.comboTimer <= 0 && g.combo > 0) g.combo = 0;

        g.timeLeft -= dt;
        if (g.timeLeft <= 0) {
          g.timeLeft = 0;
          phaseRef.current = "done";
          resetPlayerInput(g);
          releasePointerLock();
          dragLookRef.current = false;
          setPhase("done");
          setScore(g.score);
          const prevHs = parseInt(localStorage.getItem(LS_HIGHSCORE) || "0", 10);
          if (g.score > prevHs) {
            setHighScore(g.score);
            setNewRecord(true);
            localStorage.setItem(LS_HIGHSCORE, String(g.score));
          }
        }

        drawFrame(ctx, g, w, h, now);

        if (now - hudSyncRef.current > 120) {
          hudSyncRef.current = now;
          setTimeLeft(Math.ceil(g.timeLeft));
          setScore(g.score);
          setCombo(g.combo);
          setHudTick((t) => t + 1);
        }
      } else if (currentPhase === "done") {
        drawFrame(ctx, g, w, h, now);
      }
    },
    [drawFrame, spawnSignal, updateNets, projectWorld]
  );

  const tickRef = useRef(tick);
  tickRef.current = tick;

  useEffect(() => {
    let active = true;
    const loop = (now: number) => {
      if (!active) return;
      tickRef.current(now);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== "countdown") return;

    const runId = runIdRef.current;
    let remaining = 3;
    setCountdown(3);

    const timer = window.setInterval(() => {
      if (runId !== runIdRef.current) return;
      remaining -= 1;
      if (remaining > 0) {
        setCountdown(remaining);
        const g = gameRef.current;
        if (g) g.countdown = remaining;
        return;
      }

      window.clearInterval(timer);
      setCountdown(0);
      phaseRef.current = "playing";
      setPhase("playing");
      const g = gameRef.current;
      if (g) {
        g.phase = "playing";
        g.lastTime = performance.now();
        spawnSignal(g);
        spawnSignal(g);
        spawnSignal(g);
        spawnSignal(g);
      }
      const wrap = wrapRef.current;
      wrap?.requestPointerLock?.();
    }, 1000);

    return () => window.clearInterval(timer);
  }, [phase, spawnSignal]);

  const startGame = useCallback(() => {
    releasePointerLock();
    dragLookRef.current = false;
    runIdRef.current += 1;
    const g = initGame();
    g.lastTime = performance.now();
    gameRef.current = g;
    phaseRef.current = "countdown";
    hudSyncRef.current = 0;
    setPhase("countdown");
    setCountdown(3);
    setTimeLeft(ROUND_SEC);
    setScore(0);
    setCombo(0);
    setNewRecord(false);
    setMouseLocked(false);
  }, [initGame]);

  useEffect(() => {
    phaseRef.current = phase;
    if (phase !== "playing") {
      releasePointerLock();
      pointerLocked.current = false;
      dragLookRef.current = false;
      const g = gameRef.current;
      if (g) resetPlayerInput(g);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      releasePointerLock();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent, down: boolean) => {
      if (down && e.key === "Escape") {
        releasePointerLock();
        dragLookRef.current = false;
        return;
      }

      const g = gameRef.current;
      if (!g || phaseRef.current !== "playing") return;
      const k = e.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(k)) {
        e.preventDefault();
        if (down) g.keys.add(k);
        else g.keys.delete(k);
      }
      if (down && (k === " " || k === "enter")) {
        e.preventDefault();
        fireNet(g);
      }
    };
    const down = (e: KeyboardEvent) => onKey(e, true);
    const up = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [fireNet]);

  const pointerStartRef = useRef({ x: 0, y: 0, moved: false, button: 0 });

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || phaseRef.current !== "playing") return;
      if (!isTouch && e.button === 0 && document.pointerLockElement !== wrap) {
        wrap.requestPointerLock?.();
      }
      pointerStartRef.current = { x: e.clientX, y: e.clientY, moved: false, button: e.button };
      if (!isTouch && e.button === 2) {
        dragLookRef.current = true;
        lastLookXRef.current = e.clientX;
        wrap.setPointerCapture(e.pointerId);
      }
    },
    [isTouch]
  );

  const touchRef = useRef({
    moveId: -1,
    lookId: -1,
    moveCX: 0,
    moveCY: 0,
    lookOX: 0,
  });

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const g = gameRef.current;
    const wrap = wrapRef.current;
    if (!g || !wrap || phaseRef.current !== "playing") return;

    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const t = touchRef.current;

    if (isTouch) {
      if (t.moveId === e.pointerId) {
        const dx = x - t.moveCX;
        const dy = y - t.moveCY;
        const len = Math.hypot(dx, dy);
        const max = 42;
        const nx = len > max ? (dx / len) * max : dx;
        const ny = len > max ? (dy / len) * max : dy;
        g.moveX = nx / max;
        g.moveY = -ny / max;
      }
      if (t.lookId === e.pointerId) {
        g.lookDX += (x - t.lookOX) * 0.08;
        t.lookOX = x;
      }
    } else if (dragLookRef.current) {
      const dx = e.clientX - lastLookXRef.current;
      lastLookXRef.current = e.clientX;
      g.player.yaw += dx * 0.006;
    } else if (pointerStartRef.current.button === 0) {
      const dx = e.clientX - pointerStartRef.current.x;
      const dy = e.clientY - pointerStartRef.current.y;
      if (Math.hypot(dx, dy) > 6) pointerStartRef.current.moved = true;
    }
  }, [isTouch]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const g = gameRef.current;
    const wrap = wrapRef.current;
    const t = touchRef.current;
    const start = pointerStartRef.current;

    if (!isTouch && e.button === 0 && g && !start.moved) {
      fireNet(g);
    }
    if (!isTouch && e.button === 2) {
      dragLookRef.current = false;
      wrap?.releasePointerCapture(e.pointerId);
    }
    if (t.moveId === e.pointerId) {
      t.moveId = -1;
      if (g) g.moveX = g.moveY = 0;
    }
    if (t.lookId === e.pointerId) t.lookId = -1;
  }, [isTouch, fireNet]);

  const onPointerDownZone = useCallback(
    (e: React.PointerEvent, zone: "move" | "look" | "fire") => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      wrap.setPointerCapture(e.pointerId);
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const t = touchRef.current;

      if (zone === "move") {
        t.moveId = e.pointerId;
        const pad = (e.currentTarget as HTMLElement).getBoundingClientRect();
        t.moveCX = pad.left + pad.width / 2 - rect.left;
        t.moveCY = pad.top + pad.height / 2 - rect.top;
      } else if (zone === "look") {
        t.lookId = e.pointerId;
        t.lookOX = x;
      } else if (zone === "fire") {
        const g = gameRef.current;
        if (g && phaseRef.current === "playing") fireNet(g);
      }
    },
    [fireNet]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== wrapRef.current) return;
      const g = gameRef.current;
      if (!g || phaseRef.current !== "playing") return;
      g.player.yaw += e.movementX * 0.0032;
    };
    document.addEventListener("mousemove", onMouseMove);
    return () => document.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    const onLock = () => {
      const locked = document.pointerLockElement === wrapRef.current;
      pointerLocked.current = locked;
      setMouseLocked(locked);
      if (!locked) dragLookRef.current = false;
    };
    document.addEventListener("pointerlockchange", onLock);
    return () => document.removeEventListener("pointerlockchange", onLock);
  }, []);

  return (
    <div
      className="rounded-2xl border p-4 sm:p-6 mb-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, rgba(0,229,255,0.05) 0%, rgba(179,136,255,0.04) 40%, rgba(8,5,14,0.96) 100%)",
        borderColor: "rgba(0,229,255,0.2)",
        boxShadow: "0 0 40px rgba(179,136,255,0.08)",
      }}
    >
      <div className="font-mono text-[10px] tracking-[3px] text-[#39ff14] mb-2">
        ✦ JUEGO DEL PORTAL — EN VIVO
      </div>
      <h3 className="font-display font-black text-[22px] sm:text-[26px] text-[var(--txt)] mb-2">
        Cazador de señales — primera persona
      </h3>
      <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85] mb-4 max-w-[560px]">
        Atrapá señales místicas en el vacío. Movete con <strong className="text-[#39ff14]">WASD</strong>,
        mirá con el mouse y <strong className="text-[#00e5ff]">dispará redes</strong> con clic o Espacio.
        Combos y +3s cada 5 capturas —{" "}
        <strong className="text-[#39ff14]">{ROUND_SEC}s</strong> para batir tu récord.
      </p>

      <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 font-mono text-[11px] sm:text-[12px]">
        <div
          className="px-3 py-2 rounded-lg"
          style={{
            background: "rgba(57,255,20,0.08)",
            border: "1px solid rgba(57,255,20,0.25)",
            color: "#39ff14",
          }}
        >
          RÉCORD: <strong>{highScore}</strong>
        </div>
        {phase !== "idle" && (
          <>
            <div
              className="px-3 py-2 rounded-lg"
              style={{
                background: "rgba(0,229,255,0.08)",
                border: "1px solid rgba(0,229,255,0.25)",
                color: "#00e5ff",
              }}
            >
              PTS: <strong>{score}</strong>
            </div>
            <div
              className="px-3 py-2 rounded-lg"
              style={{
                background: "rgba(255,107,53,0.08)",
                border: "1px solid rgba(255,107,53,0.25)",
                color: "#ff9100",
              }}
            >
              TIEMPO: <strong>{timeLeft}s</strong>
            </div>
            {combo > 1 && (
              <div
                className="px-3 py-2 rounded-lg animate-pulse"
                style={{
                  background: "rgba(179,136,255,0.12)",
                  border: "1px solid rgba(179,136,255,0.4)",
                  color: "#d4b8ff",
                }}
              >
                COMBO x<strong>{combo}</strong>
              </div>
            )}
          </>
        )}
      </div>

      {phase === "idle" && (
        <div className="flex flex-col items-center gap-3 mb-4">
          <p className="text-[14px] text-[var(--txt2)] text-center max-w-[360px]">
            {isTouch
              ? "Joystick MOVER · zona MIRAR · botón DISPARAR."
              : "Clic en el juego para capturar el mouse · WASD mover · clic/Espacio disparar."}
          </p>
          <button
            type="button"
            onClick={startGame}
            className="px-8 py-3.5 rounded-xl font-mono text-[13px] tracking-[3px] font-black transition-all hover:-translate-y-0.5 active:scale-95 animate-pulse"
            style={{
              background: "linear-gradient(135deg, #2ecc40, #39ff14, #7dffc4)",
              color: "#0a0612",
              boxShadow: "0 6px 24px rgba(57,255,20,0.35)",
            }}
          >
            ENTRAR AL VACÍO
          </button>
        </div>
      )}

      <div
        ref={wrapRef}
        className={`relative w-full rounded-xl overflow-hidden select-none ${
          phase === "playing" ? "touch-none" : ""
        }`}
        style={{
          height: "clamp(300px, 62vw, 480px)",
          border: "1px solid rgba(0,229,255,0.22)",
          cursor: phase === "playing" && !isTouch ? "crosshair" : "default",
          boxShadow: phase === "playing" ? "inset 0 0 60px rgba(0,229,255,0.06)" : undefined,
        }}
        onContextMenu={(e) => e.preventDefault()}
        {...(phase === "playing"
          ? {
              onPointerDown,
              onPointerMove,
              onPointerUp,
              onPointerCancel: onPointerUp,
            }
          : {})}
      >
        <canvas ref={canvasRef} className="block w-full h-full" />

        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-none bg-gradient-to-t from-black/50 via-transparent to-transparent">
            <p className="font-mono text-[11px] tracking-[2px] text-[#39ff14]/80 mb-1">
              VISTA PREVIA EN VIVO
            </p>
            <p className="text-[13px] text-white/70">Tocá ENTRAR AL VACÍO para jugar</p>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none bg-black/30">
            <span
              className="font-display font-black text-[72px] sm:text-[96px] text-[#39ff14]"
              style={{ textShadow: "0 0 40px rgba(57,255,20,0.6)" }}
            >
              {countdown > 0 ? countdown : "¡YA!"}
            </span>
          </div>
        )}

        {phase === "done" && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 p-6 text-center bg-black/55">
            <div className="text-4xl">✦</div>
            <p className="font-display font-black text-[24px] text-white">{score} pts</p>
            <p className="text-[14px] text-[#39ff14] font-mono tracking-[1px]">
              {rankFor(score)}
            </p>
            {newRecord && (
              <p className="text-[12px] text-[#ffd700] font-mono">¡Nuevo récord!</p>
            )}
            <button
              type="button"
              onClick={startGame}
              className="mt-2 px-6 py-3 rounded-xl font-mono text-[12px] tracking-[2px] font-black"
              style={{
                background: "rgba(57,255,20,0.15)",
                border: "1px solid rgba(57,255,20,0.4)",
                color: "#39ff14",
              }}
            >
              OTRA RONDA
            </button>
          </div>
        )}

        {phase === "playing" && isTouch && (
          <>
            <div
              className="absolute bottom-4 left-4 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 border-[#39ff14]/50 bg-black/40 backdrop-blur-sm"
              onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDownZone(e, "move");
              }}
              aria-hidden
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#39ff14] font-bold">
                MOVER
              </span>
            </div>
            <div
              className="absolute bottom-4 right-4 w-32 h-32 sm:w-36 sm:h-36 rounded-full border-2 border-[#00e5ff]/50 bg-black/40 backdrop-blur-sm"
              onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDownZone(e, "look");
              }}
              aria-hidden
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-[#00e5ff] font-bold">
                MIRAR
              </span>
            </div>
            <button
              type="button"
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-8 py-3.5 rounded-xl font-mono text-[12px] tracking-[2px] font-black"
              style={{
                background: "linear-gradient(135deg, rgba(0,229,255,0.25), rgba(0,229,255,0.1))",
                border: "2px solid rgba(0,229,255,0.55)",
                color: "#00e5ff",
                boxShadow: "0 0 24px rgba(0,229,255,0.3)",
              }}
              onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDownZone(e, "fire");
              }}
            >
              DISPARAR
            </button>
          </>
        )}

        {phase === "playing" && !isTouch && !mouseLocked && (
          <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none bg-black/25">
            <p className="font-mono text-[12px] tracking-[1px] text-[#00e5ff] px-4 py-2 rounded-lg border border-[#00e5ff]/30 bg-black/50">
              Clic para capturar el mouse y jugar
            </p>
          </div>
        )}

        {phase === "playing" && !isTouch && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] text-[#00e5ff]/70 tracking-[1px] pointer-events-none text-center px-4">
            WASD mover · mouse mirar · clic/Espacio disparar · Esc soltar mouse
          </div>
        )}
      </div>

      <p className="text-[12px] text-[var(--txt3)] text-center font-mono mt-4">
        Dispará redes a las señales · cada 5 capturas +3s · combos multiplican puntos
      </p>
      <span className="sr-only" aria-live="polite">
        {hudTick > 0 ? `Puntos ${score}, tiempo ${timeLeft}` : ""}
      </span>
    </div>
  );
}
