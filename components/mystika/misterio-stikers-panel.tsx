"use client";

import { useEffect, useState } from "react";
import {
  STIKERS,
  downloadStiker,
  readOwnedStikers,
  stikerPayCopy,
  stikerProductId,
  type StikerItem,
} from "@/lib/stikers-data";

type PayHandler = (
  productId: string,
  title: string,
  description: string,
  price?: number,
) => void;

interface MisterioStikersPanelProps {
  onRequestPay?: PayHandler;
}

function StikerCard({
  item,
  owned,
  onBuy,
  onDownload,
  downloading = false,
}: {
  item: StikerItem;
  owned: boolean;
  onBuy: () => void;
  onDownload: () => void;
  downloading?: boolean;
}) {
  const aspect =
    item.type === "celular" ? "aspect-[9/16]" : "aspect-[16/9]";

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "rgba(8,5,14,0.85)",
        borderColor: owned ? "rgba(199,125,255,0.5)" : "rgba(199,125,255,0.22)",
        boxShadow: owned ? "0 0 24px rgba(199,125,255,0.15)" : "none",
      }}
    >
      <div
        className={`relative ${aspect} overflow-hidden`}
        style={{ background: item.preview }}
      >
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                left: `${(i * 19 + 7) % 95}%`,
                top: `${(i * 23 + 11) % 90}%`,
                width: i % 3 === 0 ? 2 : 1,
                height: i % 3 === 0 ? 2 : 1,
                opacity: 0.4 + (i % 4) * 0.15,
              }}
            />
          ))}
        </div>
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span
            className="px-2 py-0.5 rounded-full font-mono text-[9px] tracking-[1px] font-bold"
            style={{
              background: "rgba(0,0,0,0.55)",
              color: item.type === "celular" ? "#c77dff" : "#00e5ff",
              border: `1px solid ${item.type === "celular" ? "#c77dff44" : "#00e5ff44"}`,
            }}
          >
            {item.type === "celular" ? "📱 CELULAR" : "🖥️ ESCRITORIO"}
          </span>
        </div>
        {owned && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 rounded-full font-mono text-[9px] font-black tracking-[1px]"
            style={{ background: "#c77dff", color: "#0a0612" }}
          >
            TUYO
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
          <div className="text-xl leading-none mb-1">{item.emoji}</div>
          <div className="font-display font-black text-[15px] text-white leading-tight">
            {item.name}
          </div>
        </div>
      </div>

      <div className="p-3">
        <p className="text-[12px] text-[var(--txt3)] mb-3 leading-[1.6]">
          {item.tagline}
        </p>
        {owned ? (
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="w-full py-2.5 rounded-lg font-mono text-[11px] tracking-[1.5px] font-black transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
            style={{
              background: "rgba(199,125,255,0.2)",
              border: "1px solid rgba(199,125,255,0.45)",
              color: "#c77dff",
            }}
          >
            {downloading ? "PREPARANDO..." : "⬇ DESCARGAR PNG"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onBuy}
            className="w-full py-2.5 rounded-lg font-mono text-[11px] tracking-[1.5px] font-black transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: "rgba(199,125,255,0.12)",
              border: "1px solid rgba(199,125,255,0.35)",
              color: "#e0aaff",
            }}
          >
            COMPRAR — ${item.priceUsd} USD
          </button>
        )}
      </div>
    </div>
  );
}

export function MisterioStikersPanel({ onRequestPay }: MisterioStikersPanelProps) {
  const [owned, setOwned] = useState<string[]>([]);
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadHint, setDownloadHint] = useState<string | null>(null);

  const runDownload = async (
    item: StikerItem,
    options?: { skipOwnershipCheck?: boolean },
  ) => {
    setDownloadingId(item.id);
    setDownloadHint(null);
    const ok = await downloadStiker(item, {
      skipOwnershipCheck: options?.skipOwnershipCheck,
    });
    setDownloadingId(null);
    if (ok) {
      setDownloadHint(`${item.name} guardado como PNG.`);
    } else if (!options?.skipOwnershipCheck) {
      setDownloadHint(
        "No se pudo descargar. Compralo primero o tocá de nuevo.",
      );
    } else {
      setDownloadHint(
        "No se pudo descargar automáticamente. Tocá ⬇ DESCARGAR PNG.",
      );
    }
    window.setTimeout(() => setDownloadHint(null), 6000);
    return ok;
  };

  useEffect(() => {
    setOwned(readOwnedStikers());

    const onUnlock = (event: Event) => {
      const stikerId = (event as CustomEvent<{ stikerId?: string }>).detail
        ?.stikerId;
      if (!stikerId) return;
      setOwned(readOwnedStikers());
      setJustUnlocked(stikerId);
      window.setTimeout(() => setJustUnlocked(null), 12000);
    };

    const onDownloaded = (event: Event) => {
      const detail = (event as CustomEvent<{ stikerId?: string; ok?: boolean }>)
        .detail;
      if (!detail?.stikerId) return;
      const item = STIKERS.find((s) => s.id === detail.stikerId);
      if (detail.ok) {
        setDownloadHint(
          item
            ? `Descarga iniciada: ${item.name}. Revisá tu carpeta de descargas.`
            : "Descarga iniciada. Revisá tu carpeta de descargas.",
        );
      } else {
        setDownloadHint(
          "No se pudo descargar automáticamente. Tocá ⬇ DESCARGAR PNG en tu stiker.",
        );
      }
      window.setTimeout(() => setDownloadHint(null), 8000);
    };

    window.addEventListener("mystika-stiker-unlock", onUnlock);
    window.addEventListener("mystika-stiker-downloaded", onDownloaded);
    return () => {
      window.removeEventListener("mystika-stiker-unlock", onUnlock);
      window.removeEventListener("mystika-stiker-downloaded", onDownloaded);
    };
  }, []);

  const handleBuy = (item: StikerItem) => {
    if (!onRequestPay) return;
    const { title, description } = stikerPayCopy(item);
    onRequestPay(stikerProductId(item.id), title, description, item.priceUsd);
  };

  const celular = STIKERS.filter((s) => s.type === "celular");
  const pantalla = STIKERS.filter((s) => s.type === "pantalla");
  const unlockedItem = justUnlocked ? STIKERS.find((s) => s.id === justUnlocked) : null;

  return (
    <div
      className="rounded-2xl border p-6 sm:p-8 mb-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(155deg, rgba(199,125,255,0.08) 0%, rgba(8,5,14,0.96) 50%)",
        borderColor: "rgba(199,125,255,0.28)",
        boxShadow: "0 0 40px rgba(199,125,255,0.08)",
      }}
    >
      <div className="font-mono text-[10px] tracking-[3px] text-[#c77dff] mb-2">
        ✦ FONDOS DEL ARCHIVO
      </div>
      <h3 className="font-display font-black text-[22px] sm:text-[26px] text-[var(--txt)] mb-2">
        Stikers & wallpapers místicos
      </h3>
      <p className="text-[14px] sm:text-[15px] text-[var(--txt2)] leading-[1.85] mb-6 max-w-[560px]">
        Pagá y descargá fondos de pantalla exclusivos para tu celular o
        computadora. Al confirmar el pago, la imagen PNG se descarga sola.
      </p>

      {downloadHint && (
        <div
          className="rounded-xl p-3 mb-5 font-mono text-[12px] text-center leading-[1.6]"
          style={{
            background: "rgba(199,125,255,0.1)",
            border: "1px solid rgba(199,125,255,0.3)",
            color: "#e0aaff",
          }}
        >
          {downloadHint}
        </div>
      )}

      {unlockedItem && (
        <div
          className="rounded-xl p-4 mb-6 text-center animate-[fadeup_0.4s_ease]"
          style={{
            background: "rgba(199,125,255,0.12)",
            border: "1px solid rgba(199,125,255,0.35)",
          }}
        >
          <div className="text-3xl mb-2">{unlockedItem.emoji}</div>
          <p className="font-display font-black text-[17px] text-[#e0aaff] mb-1">
            ¡{unlockedItem.name} desbloqueado!
          </p>
          <p className="text-[13px] text-[var(--txt2)] mb-3">
            Ya es tuyo. Si no se descargó sola, tocá el botón de abajo.
          </p>
          <button
            type="button"
            onClick={() => runDownload(unlockedItem)}
            disabled={downloadingId === unlockedItem.id}
            className="px-5 py-2 rounded-lg font-mono text-[11px] tracking-[1.5px] font-black disabled:opacity-60"
            style={{
              background: "rgba(199,125,255,0.25)",
              border: "1px solid #c77dff",
              color: "#e0aaff",
            }}
          >
            {downloadingId === unlockedItem.id
              ? "PREPARANDO..."
              : "⬇ DESCARGAR PNG"}
          </button>
        </div>
      )}

      <div className="mb-6">
        <div className="font-mono text-[10px] tracking-[3px] text-[#c77dff] mb-3">
          📱 PARA CELULAR
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {celular.map((item) => (
            <StikerCard
              key={item.id}
              item={item}
              owned={owned.includes(item.id)}
              onBuy={() => handleBuy(item)}
              onDownload={() => runDownload(item)}
              downloading={downloadingId === item.id}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] tracking-[3px] text-[#00e5ff] mb-3">
          🖥️ PARA ESCRITORIO
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pantalla.map((item) => (
            <StikerCard
              key={item.id}
              item={item}
              owned={owned.includes(item.id)}
              onBuy={() => handleBuy(item)}
              onDownload={() => runDownload(item)}
              downloading={downloadingId === item.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
