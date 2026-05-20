'use client'

import { prizes, activityFeed, reviews } from '@/lib/clawzone-data'

interface CajaSectionProps {
  boxesOpened: number
  jackpotAmount: number
  stockCount: number
  onPlay: () => void
}

export function CajaSection({ boxesOpened, jackpotAmount, stockCount, onPlay }: CajaSectionProps) {
  return (
    <div className="animate-[fadeup_0.4s_ease]">
      {/* Title */}
      <div className="text-center py-1.5 pb-[18px]">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] flex items-center justify-center gap-3.5 mb-2.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          CLAW MACHINE DIGITAL
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h1
          className="font-display font-black italic leading-[0.95] tracking-[-1px] mb-2.5"
          style={{ fontSize: 'clamp(42px,10vw,72px)' }}
        >
          Jugás por <span className="text-[var(--neon)]" style={{ textShadow: '0 0 20px rgba(0,212,255,.5)' }}>$1</span>
        </h1>
        <p className="text-[13px] text-[var(--txt2)] max-w-[360px] mx-auto leading-[1.8] font-light">
          Un producto digital premium. La garra baja, agarra algo, y lo que salga es tuyo. Simple.
        </p>
      </div>

      {/* Price Row */}
      <div className="flex gap-3 items-stretch mb-5">
        <div
          className="flex-1 text-center py-6 px-5 bg-[var(--bg2)] border border-[var(--border)] rounded-lg relative overflow-hidden"
        >
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,var(--neon),transparent)' }}
          />
          <div
            className="font-display font-black leading-none italic text-[var(--neon)]"
            style={{
              fontSize: 'clamp(72px,15vw,110px)',
              textShadow: '0 0 30px rgba(0,212,255,.5),0 0 80px rgba(0,212,255,.2)',
            }}
          >
            <span className="text-[40px] align-super">$</span>1
          </div>
          <div className="font-mono text-[9px] tracking-[4px] text-[var(--neon3)] mt-1.5">
            POR JUGADA · SIN SUSCRIPCIÓN · 60 SEG
          </div>
          <div className="inline-flex items-center gap-2 mt-3.5 py-[5px] px-4 rounded bg-[rgba(255,45,120,0.1)] border border-[rgba(255,45,120,0.2)] font-mono text-[10px] text-[#ff7aaa]">
            <s className="text-[var(--txt3)]">Valor: $19 – $89</s> &nbsp;garantizado
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[130px]">
          <div className="flex-1 p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-lg flex flex-col justify-center gap-[3px]">
            <div className="font-mono text-[8px] tracking-[3px] text-[var(--txt3)]">JUGADAS HOY</div>
            <div className="font-display font-bold text-[20px] text-[var(--neon)] tracking-[1px]">
              {boxesOpened.toLocaleString('es')}
            </div>
          </div>
          <div className="flex-1 p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-lg flex flex-col justify-center gap-[3px]">
            <div className="font-mono text-[8px] tracking-[3px] text-[var(--txt3)]">GANADORES</div>
            <div className="font-display font-bold text-[20px] text-[var(--green)] tracking-[1px]" style={{ textShadow: '0 0 10px rgba(0,255,157,.3)' }}>
              12.4k
            </div>
          </div>
          <div className="flex-1 p-3 bg-[var(--bg2)] border border-[var(--border)] rounded-lg flex flex-col justify-center gap-[3px]">
            <div className="font-mono text-[8px] tracking-[3px] text-[var(--txt3)]">TASA ÉXITO</div>
            <div className="font-display font-bold text-[20px] text-[var(--pink)] tracking-[1px]" style={{ textShadow: '0 0 10px rgba(255,45,120,.3)' }}>
              100%
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Grid */}
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] flex items-center gap-3.5 flex-1">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          QUÉ PUEDE SALIR
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {prizes.map((prize, i) => (
          <div
            key={i}
            className={`
              p-3.5 pb-3 text-center rounded-lg bg-[var(--bg2)] border border-[var(--border)]
              transition-all cursor-default relative overflow-hidden
              hover:border-[var(--borderH)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,.3)]
              ${prize.jk ? 'border-[rgba(255,45,120,0.3)]' : ''}
            `}
            style={prize.jk ? { background: 'linear-gradient(145deg,rgba(255,45,120,.06),var(--bg2))' } : {}}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-[var(--neon2)] opacity-0 transition-opacity hover:opacity-50" />
            <div className="text-2xl mb-1.5">{prize.ico}</div>
            <div className="text-[10px] font-semibold text-[var(--txt2)] tracking-[0.5px] mb-1 leading-[1.3]">{prize.nm}</div>
            <div className="font-display font-bold text-[19px]" style={{ color: prize.col }}>
              {prize.p}%
            </div>
            <div className="font-mono text-[8px] text-[var(--txt3)] mt-0.5">val ${prize.v}</div>
            <div className="h-0.5 bg-[var(--txt4)] rounded mt-1.5 overflow-hidden">
              <div
                className="h-full rounded"
                style={{
                  width: `${(prize.p / 30) * 100}%`,
                  background: prize.jk
                    ? 'linear-gradient(90deg,#aa0044,var(--pink))'
                    : 'linear-gradient(90deg,var(--neon3),var(--neon))',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Jackpot Strip */}
      <div
        className="flex items-center justify-between flex-wrap gap-3 p-4 px-5 rounded-lg mb-[18px] border border-[rgba(255,45,120,0.2)] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg,rgba(255,45,120,.08),rgba(0,212,255,.06))' }}
      >
        <div
          className="absolute right-[-8px] top-1/2 -translate-y-1/2 font-display font-black text-[80px] tracking-[4px] text-[rgba(255,45,120,0.04)] pointer-events-none"
        >
          JACKPOT
        </div>
        <div>
          <div className="font-mono text-[9px] tracking-[4px] text-[rgba(255,45,120,0.7)] mb-1">JACKPOT ACUMULADO</div>
          <div
            className="font-display font-black italic text-[36px] text-[var(--pink)]"
            style={{ textShadow: '0 0 20px rgba(255,45,120,.4)' }}
          >
            ${jackpotAmount.toLocaleString('es')}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] tracking-[2px] text-[var(--txt3)]">CAJAS ABIERTAS</div>
          <div className="font-display font-bold text-[20px] text-[var(--neon)] mt-0.5">
            {boxesOpened.toLocaleString('es')}
          </div>
        </div>
      </div>

      {/* Stock Bar */}
      <div className="flex items-center justify-between gap-4 p-3.5 px-[18px] rounded-lg bg-[var(--bg2)] border border-[var(--border)] mb-[18px]">
        <div className="flex-1">
          <div className="font-mono text-[9px] tracking-[3px] text-[var(--txt3)] mb-1.5">UNIDADES DISPONIBLES HOY</div>
          <div className="h-1 bg-[var(--txt4)] rounded overflow-hidden">
            <div
              className="h-full rounded transition-[width] duration-[1.5s]"
              style={{
                width: `${(stockCount / 150) * 100}%`,
                background: 'linear-gradient(90deg,var(--green),var(--neon))',
              }}
            />
          </div>
        </div>
        <div
          className="font-display font-bold text-[34px] text-[var(--green)] whitespace-nowrap"
          style={{ textShadow: '0 0 12px rgba(0,255,157,.3)' }}
        >
          {stockCount}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="border border-[var(--border)] rounded-lg overflow-hidden mb-[18px] bg-[var(--bg1)]">
        <div className="p-2 px-4 bg-[var(--bg2)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="font-mono text-[9px] tracking-[4px] text-[var(--neon3)]">ACTIVIDAD RECIENTE</div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--green)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" style={{ animation: 'livepulse 1.4s infinite' }} />
            EN VIVO
          </div>
        </div>
        <div className="max-h-[180px] overflow-hidden relative">
          <div
            className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
            style={{ background: 'linear-gradient(transparent,var(--bg1))' }}
          />
          {activityFeed.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 p-[9px] px-4 border-b border-[rgba(0,212,255,0.04)] text-xs hover:bg-[var(--neonG)]"
            >
              <div className="text-sm flex-shrink-0">{item.icon}</div>
              <div>
                <span className="font-semibold text-[var(--neon)] font-mono text-[10px]">{item.user}</span>{' '}
                <span className="text-[var(--txt2)]">{item.item}</span>
              </div>
              <div className="font-mono text-[9px] text-[var(--txt3)] whitespace-nowrap ml-auto">{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onPlay}
        className="w-full py-5 border-none rounded-lg cursor-pointer font-display font-black italic text-[22px] tracking-[6px] text-[var(--bg0)] relative overflow-hidden transition-all mb-2.5 hover:-translate-y-[3px]"
        style={{
          background: 'linear-gradient(135deg,var(--neon3),var(--neon),#00f0ff,var(--neon))',
          backgroundSize: '200% auto',
          animation: 'ctamove 2.5s linear infinite',
          boxShadow: '0 6px 0 rgba(0,0,0,.5),0 10px 40px rgba(0,212,255,.3)',
        }}
      >
        <span className="relative z-10">🦾 BAJAR LA GARRA — $1</span>
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg,transparent,rgba(255,255,255,.25),transparent)',
            transform: 'translateX(-100%)',
            animation: 'shimmer 2.2s infinite',
          }}
        />
      </button>
      <div className="text-center font-mono text-[9px] tracking-[3px] text-[var(--txt3)] mb-[22px]">
        📦 PRODUCTO DIGITAL &nbsp;·&nbsp; ⚡ 60 SEGUNDOS &nbsp;·&nbsp; 🎮 ACCESO INMEDIATO
      </div>

      {/* Trust Row */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['📦 Producto digital garantizado', '⚡ Entrega en 60 segundos', '🎮 Acceso instantáneo'].map((text, i) => (
          <div
            key={i}
            className="flex-1 min-w-[120px] flex items-center gap-2 justify-center p-2.5 px-3 rounded-md border border-[var(--border)] bg-[var(--bg2)] text-[11px] text-[var(--txt2)] transition-[border-color] hover:border-[var(--borderH)]"
          >
            {text}
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div className="mb-3.5">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--neon3)] flex items-center gap-3.5">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          GANADORES RECIENTES
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-7">
        {reviews.map((review, i) => {
          const avatarColors: Record<string, string> = {
            av1: 'bg-[rgba(255,45,120,0.15)] border-[rgba(255,45,120,0.25)] text-[var(--pink)]',
            av2: 'bg-[rgba(0,212,255,0.1)] border-[rgba(0,212,255,0.2)] text-[var(--neon)]',
            av3: 'bg-[rgba(0,255,157,0.1)] border-[rgba(0,255,157,0.2)] text-[var(--green)]',
            av4: 'bg-[rgba(255,224,51,0.1)] border-[rgba(255,224,51,0.2)] text-[var(--yellow)]',
          }
          return (
            <div
              key={i}
              className="flex items-start gap-3.5 p-4 rounded-lg bg-[var(--bg2)] border border-[var(--border)] transition-[border-color] hover:border-[var(--borderH)]"
            >
              <div className={`w-9 h-9 rounded-md flex-shrink-0 flex items-center justify-center font-display font-bold text-[15px] border ${avatarColors[review.avatarClass]}`}>
                {review.initial}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[13px] font-bold text-[var(--txt)]">{review.name}</span>
                  <span className="font-mono text-[9px] tracking-[2px] text-[var(--neon3)]">{review.location}</span>
                </div>
                <div className="text-[var(--yellow)] text-[11px] tracking-[2px] mb-1">{review.stars}</div>
                <div className="text-[13px] text-[var(--txt2)] leading-[1.6] font-light">{review.message}</div>
                <div className="inline-flex items-center gap-[5px] mt-[5px] py-[3px] px-2.5 rounded bg-[var(--neonG)] border border-[var(--border)] font-mono text-[9px] text-[var(--neon)]">
                  {review.prize}
                </div>
                <div className="font-mono text-[9px] text-[var(--txt3)] mt-1">{review.time}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
