'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
  twinkleSpeed: number
  twinklePhase: number
}

export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let stars: Star[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    const initStars = () => {
      stars = []
      const count = Math.floor((canvas.width * canvas.height) / 8000)
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          speed: Math.random() * 0.006 + 0.0015,
          twinkleSpeed: Math.random() * 0.008 + 0.003,
          twinklePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      stars.forEach((star) => {
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        const currentOpacity = star.opacity * twinkle

        // Main star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(179, 136, 255, ${currentOpacity})`
        ctx.fill()

        // Glow effect
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.radius * 3
        )
        gradient.addColorStop(0, `rgba(179, 136, 255, ${currentOpacity * 0.5})`)
        gradient.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Slow drift
        star.y += star.speed
        if (star.y > canvas.height + 10) {
          star.y = -10
          star.x = Math.random() * canvas.width
        }
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: 'linear-gradient(180deg, #0a0612 0%, #150e24 50%, #0f0a1a 100%)' }}
    />
  )
}
