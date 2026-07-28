"use client"

import { useEffect, useRef } from "react"

export default function WaveGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)
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

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        color: ["#3b82f6", "#0284c7", "#dc2626"][Math.floor(Math.random() * 3)],
        opacity: Math.random() * 0.4 + 0.2,
      })
    }

    let animationId: number
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

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        if (frame % 2 === 0) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = p.x - particles[j].x
            const dy = p.y - particles[j].y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 150) {
              ctx.strokeStyle = p.color
              ctx.globalAlpha = (1 - dist / 150) * 0.15
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(particles[j].x, particles[j].y)
              ctx.stroke()
            }
          }
        }
      }

      ctx.globalAlpha = 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}