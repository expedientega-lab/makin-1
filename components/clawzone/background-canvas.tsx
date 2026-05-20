'use client'

import { useEffect, useRef } from 'react'

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let W = window.innerWidth
    let H = window.innerHeight

    const colors = [
      'rgba(0,212,255,',
      'rgba(0,153,204,',
      'rgba(255,45,120,',
      'rgba(0,255,157,',
      'rgba(255,224,51,',
    ]

    interface Particle {
      x: number
      y: number
      r: number
      vx: number
      vy: number
      c: string
      a: number
      ph: number
    }

    const particles: Particle[] = []
    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 1.2 + 0.2,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 0.3 + 0.05,
        ph: Math.random() * Math.PI * 2,
      })
    }

    let frame = 0

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas!.width = W
      canvas!.height = H
    }

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      frame++

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        const a = p.a * (0.5 + 0.5 * Math.sin(frame * 0.018 + p.ph))
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c + a + ')'
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-50"
    />
  )
}
