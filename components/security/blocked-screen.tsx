interface BlockedScreenProps {
  ip: string
}

export function BlockedScreen({ ip }: BlockedScreenProps) {
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-black text-red-500"
      style={{ fontFamily: 'var(--font-share-tech), monospace' }}
    >
      <style>{`
        @keyframes mk-block-glitch {
          0%, 100% { transform: translate(0); filter: none; }
          20% { transform: translate(-3px, 2px); filter: hue-rotate(90deg); }
          40% { transform: translate(3px, -2px); filter: hue-rotate(-90deg); }
          60% { transform: translate(-2px, -1px); clip-path: inset(10% 0 60% 0); }
          80% { transform: translate(2px, 1px); clip-path: inset(40% 0 20% 0); }
        }
        @keyframes mk-block-pulse {
          0%, 100% { opacity: 1; text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000; }
          50% { opacity: 0.7; text-shadow: 0 0 8px #ff0000; }
        }
        @keyframes mk-block-scan {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        .mk-block-title { animation: mk-block-glitch 0.35s infinite, mk-block-pulse 1.2s infinite; }
        .mk-block-scanline {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(transparent, rgba(255,0,0,0.35), transparent);
          animation: mk-block-scan 2.5s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="mk-block-scanline" />
      <div className="mk-block-scanline" style={{ animationDelay: '1.2s', opacity: 0.5 }} />

      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,0,0.08) 2px, rgba(255,0,0,0.08) 4px)',
        }}
      />

      <div className="relative z-10 max-w-2xl px-6 text-center">
        <p className="mb-4 text-[11px] tracking-[6px] text-red-800">
          ◈ PROTOCOLO DE SEGURIDAD MYSTIKA ◈
        </p>

        <h1 className="mk-block-title mb-6 text-4xl font-black leading-tight tracking-wider text-red-500 sm:text-6xl">
          ACCESO
          <br />
          PERMANENTEMENTE
          <br />
          REVOCADO
        </h1>

        <div
          className="mx-auto mb-8 max-w-md border border-red-900 bg-red-950/40 p-4 text-left text-[12px] leading-relaxed text-red-400"
          style={{ boxShadow: '0 0 30px rgba(255,0,0,0.2)' }}
        >
          <p className="mb-2 text-red-500">▸ INTRUSIÓN REGISTRADA</p>
          <p className="mb-1">
            IP VINCULADA: <span className="text-red-300">{ip}</span>
          </p>
          <p className="mb-1">MOTIVO: MANIPULACIÓN DEL PORTAL / INSPECCIÓN NO AUTORIZADA</p>
          <p className="mb-1">ESTADO: BLOQUEO ACTIVO EN TODOS LOS NODOS</p>
          <p className="text-red-600">
            Tu huella digital quedó archivada. El portal no volverá a abrirse.
          </p>
        </div>

        <p className="text-[13px] tracking-[3px] text-red-700 animate-pulse">
          TE ESTÁBAMOS OBSERVANDO
        </p>

        <p className="mt-8 text-[10px] tracking-[2px] text-red-900">
          ERROR 0xDEAD · MYSTIKA SECURITY LAYER
        </p>
      </div>
    </div>
  )
}
