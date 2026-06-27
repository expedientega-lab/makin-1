"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  ORBE_WHEEL_SEGMENTS,
  pickOrbePrize,
  type OrbePrizeType,
} from "@/lib/orbe-data";

function computeTargetRotation(
  startRotation: number,
  winIndex: number,
  segmentAngle: number,
): number {
  const twoPi = 2 * Math.PI;
  const fullSpins = 6 + Math.floor(Math.random() * 3);
  const t = 0.32 + Math.random() * 0.36;
  const desiredPointer = winIndex * segmentAngle + segmentAngle * t;
  let desiredNorm = (3 * Math.PI) / 2 - desiredPointer;
  desiredNorm = ((desiredNorm % twoPi) + twoPi) % twoPi;
  const startNorm = ((startRotation % twoPi) + twoPi) % twoPi;
  let delta = (desiredNorm - startNorm + twoPi) % twoPi;
  if (delta < 0.08) delta += twoPi;
  return startRotation + fullSpins * twoPi + delta;
}

interface OrbSpinWheelProps {
  onSpinComplete: (prizeType: OrbePrizeType) => void;
}

export function OrbSpinWheel({ onSpinComplete }: OrbSpinWheelProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(400);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [ballOrbit, setBallOrbit] = useState(0);
  const [phase, setPhase] = useState<"ready" | "spinning" | "landed">("ready");
  const [landedLabel, setLandedLabel] = useState<string | null>(null);
  const prizeRef = useRef<OrbePrizeType | null>(null);

  const segmentAngle = (2 * Math.PI) / ORBE_WHEEL_SEGMENTS.length;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const size = Math.min(Math.max(w, 260), 400);
      setCanvasSize(Math.floor(size));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvasSize;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const center = size / 2;
    const radius = center - size * 0.1;
    const iconFont = Math.round(size * 0.11);
    const labelFont = Math.round(size * 0.042);
    const centerOrbR = size * 0.16;
    const centerIcon = Math.round(size * 0.14);
    const ballR = Math.max(12, size * 0.028);

    ctx.clearRect(0, 0, size, size);

    ORBE_WHEEL_SEGMENTS.forEach((seg, i) => {
      const startAngle = i * segmentAngle + rotation;
      const endAngle = (i + 1) * segmentAngle + rotation;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = `${seg.color}35`;
      ctx.fill();
      ctx.strokeStyle = `${seg.color}85`;
      ctx.lineWidth = Math.max(2, size * 0.006);
      ctx.stroke();

      const mid = startAngle + segmentAngle / 2;
      const iconDist = radius * 0.56;
      const ix = center + Math.cos(mid) * iconDist;
      const iy = center + Math.sin(mid) * iconDist;
      ctx.save();
      ctx.translate(ix, iy);
      ctx.font = `${iconFont}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(seg.icon, 0, 0);
      ctx.restore();

      const labelDist = radius * 0.8;
      const lx = center + Math.cos(mid) * labelDist;
      const ly = center + Math.sin(mid) * labelDist;
      let textAngle = mid + Math.PI / 2;
      const norm = ((mid % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      if (norm > Math.PI / 2 && norm < (3 * Math.PI) / 2) textAngle += Math.PI;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(textAngle);
      ctx.font = `800 ${labelFont}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff";
      ctx.strokeStyle = "rgba(0,0,0,0.9)";
      ctx.lineWidth = Math.max(3, labelFont * 0.22);
      ctx.lineJoin = "round";
      ctx.strokeText(seg.label, 0, 0);
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(center, center, centerOrbR, 0, 2 * Math.PI);
    ctx.fillStyle = "#0a0612";
    ctx.fill();
    ctx.strokeStyle = "rgba(179,136,255,0.6)";
    ctx.lineWidth = Math.max(4, size * 0.012);
    ctx.stroke();
    ctx.font = `${centerIcon}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔮", center, center);

    if (phase !== "ready") {
      const orbitR = radius + size * 0.04;
      const ballAngle = rotation + ballOrbit;
      const bx = center + Math.cos(ballAngle) * orbitR;
      const by = center + Math.sin(ballAngle) * orbitR;
      ctx.beginPath();
      ctx.arc(bx, by, ballR, 0, 2 * Math.PI);
      const grad = ctx.createRadialGradient(
        bx - ballR * 0.3,
        by - ballR * 0.3,
        2,
        bx,
        by,
        ballR,
      );
      grad.addColorStop(0, "#f0e6ff");
      grad.addColorStop(1, "#7c4dff");
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [rotation, segmentAngle, ballOrbit, phase, canvasSize]);

  const runSpin = useCallback(() => {
    if (isSpinning) return;
    const { prizeType, segmentIndex } = pickOrbePrize();
    prizeRef.current = prizeType;
    setIsSpinning(true);
    setPhase("spinning");
    setLandedLabel(null);

    const targetRotation = computeTargetRotation(
      rotation,
      segmentIndex,
      segmentAngle,
    );
    const duration = 4200;
    const startTime = Date.now();
    const startRotation = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const currentRot =
        startRotation + (targetRotation - startRotation) * eased;
      setRotation(currentRot);
      setBallOrbit(currentRot * 1.15 + elapsed * 0.008);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setPhase("landed");
        const seg = ORBE_WHEEL_SEGMENTS[segmentIndex];
        setLandedLabel(seg.label);
        window.setTimeout(() => {
          if (prizeRef.current) onSpinComplete(prizeRef.current);
        }, 900);
      }
    };
    requestAnimationFrame(animate);
  }, [isSpinning, rotation, segmentAngle, onSpinComplete]);

  return (
    <div className="flex flex-col items-center w-full">
      <div ref={wrapRef} className="relative w-full mb-5 sm:mb-6">
        <div
          className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
          style={{
            top: "-0.25rem",
            fontSize: "clamp(28px, 6vw, 40px)",
            filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.7))",
          }}
        >
          ▼
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-auto mx-auto block"
          style={{
            maxWidth: `${canvasSize}px`,
            filter: "drop-shadow(0 0 40px rgba(179,136,255,0.4))",
          }}
        />
      </div>

      {phase === "landed" && landedLabel && (
        <p
          className="font-display font-bold text-[var(--gold)] mb-4 sm:mb-5 animate-pulse text-center px-2"
          style={{
            fontSize: "clamp(18px, 4.5vw, 26px)",
            textShadow: "0 0 20px rgba(255,215,0,0.45)",
          }}
        >
          ¡CAÍSTE EN {landedLabel.toUpperCase()}!
        </p>
      )}

      <button
        type="button"
        disabled={isSpinning || phase === "landed"}
        onClick={runSpin}
        className="relative w-full max-w-[400px] py-4 sm:py-5 px-6 border-none rounded-2xl cursor-pointer font-display font-bold tracking-[2px] sm:tracking-[3px] text-[var(--bg0)] overflow-hidden transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontSize: "clamp(18px, 4.5vw, 24px)",
          background:
            "linear-gradient(135deg, var(--mystik3), var(--mystik), #d4b8ff)",
          boxShadow:
            "0 10px 0 rgba(0,0,0,.5), 0 16px 48px rgba(179,136,255,.45)",
        }}
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {isSpinning ? (
            <>GIRANDO…</>
          ) : phase === "landed" ? (
            <>ABRIENDO PREMIO…</>
          ) : (
            <>
              <span style={{ fontSize: "clamp(22px, 5vw, 28px)" }}>⚪</span>
              LANZAR BOLA
            </>
          )}
        </span>
      </button>
      <p
        className="text-center font-mono text-[var(--txt3)] mt-3 sm:mt-4 px-2"
        style={{ fontSize: "clamp(12px, 2.8vw, 15px)", letterSpacing: "0.12em" }}
      >
        La bola gira hasta tu premio garantizado
      </p>
    </div>
  );
}
