"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const width = () => window.innerWidth
    const height = () => window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      opacity: number
    }> = []

    const colors = [
      "rgba(59, 130, 246, ",
      "rgba(2, 132, 199, ",
      "rgba(220, 38, 38, ",
      "rgba(139, 92, 246, ",
    ]

    const particleCount = 60
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 1.5 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.4 + 0.2,
      })
    }

    const maxDistance = 150
    let animationFrameId: number
    let frame = 0

    const animate = () => {
      frame++
      ctx.fillStyle = "rgba(10, 10, 15, 0.15)"
      ctx.fillRect(0, 0, width(), height())

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width()) p.vx *= -1
        if (p.y < 0 || p.y > height()) p.vy *= -1
        p.x = Math.max(0, Math.min(width(), p.x))
        p.y = Math.max(0, Math.min(height(), p.y))

        ctx.fillStyle = p.color + p.opacity + ")"
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        if (frame % 2 === 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[j].x - p.x
            const dy = particles[j].y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < maxDistance) {
              const alpha = (1 - dist / maxDistance) * 0.2
              ctx.strokeStyle = p.color + alpha + ")"
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas ref={canvasRef} className="fixed inset-0 -z-10 pointer-events-none" style={{ background: "#0a0a0f" }} />
  )
}