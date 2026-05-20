'use client'

import { useState, useRef } from 'react'

const universalResponses = [
  {
    title: '✨ El Universo te escuchó',
    message: 'Tu deseo fue recibido por el cosmos. Las fuerzas del universo ya están en movimiento para manifestar lo que pediste. Confía en el proceso y permanece atento a las señales.',
    extra: 'Las mejores cosas llegan cuando menos las esperas. Tu momento está cerca.',
  },
  {
    title: '🌟 Mensaje enviado a las estrellas',
    message: 'Las constelaciones registraron tu intención. Cuando el corazón habla con autenticidad, el universo conspira para hacerlo realidad. Tu energía ya está atrayendo lo que mereces.',
    extra: 'Todo lo que deseas con convicción, el universo trabaja para entregártelo.',
  },
  {
    title: '💫 Tu vibración fue captada',
    message: 'El universo opera en frecuencias, y la tuya acaba de resonar con fuerza. Lo que sembraste hoy en el cosmos germina en silencio y florecerá en el momento perfecto.',
    extra: 'Sigue pensando en positivo. Tu energía es tu mayor imán.',
  },
  {
    title: '🔮 Portal abierto',
    message: 'Tu mensaje cruzó el velo entre el mundo visible e invisible. Los maestros del destino tomaron nota de tu intención. Prepárate: los cambios que buscas ya comenzaron.',
    extra: 'El primer paso siempre es declarar lo que querés. Ya lo diste.',
  },
  {
    title: '🌙 La Luna recibió tu mensaje',
    message: 'En la quietud del cosmos, tu voz fue escuchada. La Luna, guardiana de los deseos más profundos, lleva tu mensaje a los astros. Lo que pediste ya está en camino.',
    extra: 'Confía, descansa y permite que el universo haga su trabajo.',
  },
  {
    title: '💜 El cosmos responde',
    message: 'Cada deseo genuino crea ondas en el universo. Las tuyas ya viajan hacia su destino. No es casualidad que estés aquí hoy. El timing es perfecto.',
    extra: 'Mereces todo lo bueno que está por llegar. El universo lo sabe.',
  },
  {
    title: '⭐ Registrado en las estrellas',
    message: 'Tu intención quedó grabada en la energía del universo. Ahora el cosmos tiene una misión: hacer que suceda. Tu única tarea es creer que es posible. Porque lo es.',
    extra: 'La fe mueve montañas. Tu mensaje ya movió las primeras.',
  },
  {
    title: '🌌 Mensaje en el infinito',
    message: 'El universo infinito recibió tu petición y la amplificó a través de las galaxias. Lo que deseas ya existe en algún plano de la realidad. Solo es cuestión de tiempo que llegue al tuyo.',
    extra: 'El universo nunca dice nunca. Solo dice: en el momento correcto.',
  },
]

const particles = ['✦', '✧', '⋆', '·', '★', '☆', '✶', '✷']

export function MensajeSection() {
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [response, setResponse] = useState<(typeof universalResponses)[0] | null>(null)
  const [showParticles, setShowParticles] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (!message.trim() || isSending) return

    setIsSending(true)
    setShowParticles(true)

    setTimeout(() => {
      const random = universalResponses[Math.floor(Math.random() * universalResponses.length)]
      setResponse(random)
      setSent(true)
      setIsSending(false)
    }, 2200)
  }

  const handleReset = () => {
    setSent(false)
    setMessage('')
    setResponse(null)
    setShowParticles(false)
    setTimeout(() => textareaRef.current?.focus(), 100)
  }

  return (
    <div className="animate-[fadeup_0.4s_ease]">

      {/* Header */}
      <div className="text-center py-1.5 pb-5">
        <div className="font-mono text-[9px] tracking-[5px] text-[var(--mystik3)] flex items-center justify-center gap-3.5 mb-3">
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
          PORTAL DE DESEOS
          <span className="flex-1 max-w-[40px] h-px bg-[var(--border)]" />
        </div>
        <h2
          className="font-display font-black leading-[0.95] tracking-[2px] mb-3"
          style={{ fontSize: 'clamp(28px,7vw,46px)' }}
        >
          Mensaje al{' '}
          <span className="text-[var(--mystik)]" style={{ textShadow: '0 0 24px rgba(179,136,255,.6)' }}>
            Universo
          </span>
        </h2>
        <p className="text-[13px] text-[var(--txt2)] max-w-[360px] mx-auto leading-[1.8] font-light">
          Escribí lo que deseás, necesitás o soñás. El cosmos escucha cada palabra que sale del corazón.
        </p>
      </div>

      {/* Central orb visual */}
      <div className="flex justify-center mb-6">
        <div className="relative flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-700"
            style={{
              background: 'radial-gradient(circle, rgba(179,136,255,0.3) 0%, rgba(179,136,255,0.05) 70%)',
              boxShadow: sent
                ? '0 0 60px rgba(179,136,255,0.7), 0 0 120px rgba(179,136,255,0.3)'
                : '0 0 30px rgba(179,136,255,0.3)',
              animation: isSending ? 'pulse 0.6s ease-in-out infinite' : undefined,
            }}
          >
            {isSending ? '🌀' : sent ? '💌' : '🌌'}
          </div>
          {/* Floating particles */}
          {showParticles && (
            <div className="absolute inset-0 pointer-events-none">
              {particles.map((p, i) => (
                <span
                  key={i}
                  className="absolute text-[var(--mystik)] font-bold"
                  style={{
                    fontSize: `${8 + Math.random() * 8}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animation: `fadeup ${0.8 + Math.random() * 1.2}s ease forwards`,
                    animationDelay: `${i * 0.15}s`,
                    opacity: 0,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      {!sent ? (
        <div className="animate-[fadeup_0.3s_ease]">
          {/* Textarea */}
          <div
            className="relative rounded-xl border overflow-hidden mb-4 transition-all"
            style={{
              borderColor: message.trim() ? 'rgba(179,136,255,0.5)' : 'var(--border)',
              boxShadow: message.trim() ? '0 0 20px rgba(179,136,255,0.1)' : 'none',
              background: 'var(--bg2)',
            }}
          >
            <div className="px-4 pt-3 pb-1">
              <label className="font-mono text-[9px] tracking-[3px] text-[var(--mystik3)]">
                TU MENSAJE AL UNIVERSO
              </label>
            </div>
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí tu deseo, tu sueño, lo que necesitás que el universo escuche hoy..."
              maxLength={500}
              rows={5}
              className="w-full px-4 pb-4 pt-1 bg-transparent resize-none outline-none text-[14px] text-[var(--txt)] leading-[1.7] placeholder:text-[var(--txt3)]"
              style={{ fontFamily: 'inherit' }}
              disabled={isSending}
            />
            <div className="px-4 pb-2 flex justify-end">
              <span className="text-[10px] text-[var(--txt3)] font-mono">
                {message.length}/500
              </span>
            </div>
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-[var(--txt3)] mb-5 leading-relaxed">
            ✦ Escribí con sinceridad. El universo responde a la autenticidad ✦
          </p>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!message.trim() || isSending}
            className="w-full py-4 rounded-xl font-mono text-[13px] tracking-[3px] font-black transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: message.trim()
                ? 'linear-gradient(135deg, rgba(179,136,255,0.2) 0%, rgba(179,136,255,0.08) 100%)'
                : 'var(--bg2)',
              border: `2px solid ${message.trim() ? 'var(--mystik)' : 'var(--border)'}`,
              boxShadow: message.trim() ? '0 0 28px rgba(179,136,255,0.25)' : 'none',
              color: message.trim() ? 'var(--mystik)' : 'var(--txt3)',
            }}
          >
            {isSending ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--mystik)] border-t-transparent rounded-full animate-spin" />
                <span>ENVIANDO AL COSMOS...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🌌</span>
                <span>ENVIAR AL UNIVERSO</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Response */
        response && (
          <div
            className="animate-[fadeup_0.5s_ease] rounded-xl border p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(179,136,255,0.1) 0%, rgba(179,136,255,0.03) 100%)',
              borderColor: 'rgba(179,136,255,0.4)',
              boxShadow: '0 0 40px rgba(179,136,255,0.15)',
            }}
          >
            {/* Top glow line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, transparent, var(--mystik), transparent)' }}
            />

            {/* Tu mensaje (quoted) */}
            <div className="mb-5 p-3 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
              <div className="font-mono text-[8px] tracking-[3px] text-[var(--txt3)] mb-1.5">TU MENSAJE</div>
              <p className="text-[12px] text-[var(--txt3)] italic leading-relaxed line-clamp-3">
                &ldquo;{message}&rdquo;
              </p>
            </div>

            {/* Response title */}
            <div className="font-display font-black text-[20px] text-[var(--mystik)] tracking-[1px] mb-3 text-center">
              {response.title}
            </div>

            {/* Response message */}
            <p className="text-[14px] text-[var(--txt)] leading-[1.8] mb-4 text-center">
              {response.message}
            </p>

            {/* Extra motivational line */}
            <div
              className="p-3 rounded-lg text-center mb-5"
              style={{
                background: 'rgba(179,136,255,0.08)',
                border: '1px solid rgba(179,136,255,0.2)',
              }}
            >
              <p className="text-[13px] text-[var(--mystik)] font-medium italic">
                ✦ {response.extra} ✦
              </p>
            </div>

            {/* Send another */}
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-lg font-mono text-[11px] tracking-[2px] text-[var(--txt2)] border border-[var(--border)] bg-[var(--bg3)] hover:border-[var(--mystik)] hover:text-[var(--mystik)] transition-all"
            >
              ← ENVIAR OTRO MENSAJE
            </button>
          </div>
        )
      )}
    </div>
  )
}
