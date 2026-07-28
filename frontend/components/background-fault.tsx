"use client"

import { useEffect, useRef } from "react"

export default function ArchiveBackground() {
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

    const waves: Array<{
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      color: string
      alpha: number
    }> = []

    for (let i = 0; i < 50; i++) {
      waves.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        radius: 1.5 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        color: ["#3b82f6", "#0284c7", "#dc2626", "#1e40af"][Math.floor(Math.random() * 4)],
        alpha: 0.3 + Math.random() * 0.5,
      })
    }

    let animationId: number
    let frame = 0

    const animate = () => {
      frame++
      ctx.fillStyle = "rgba(10, 10, 15, 0.12)"
      ctx.fillRect(0, 0, width(), height())

      for (let i = 0; i < waves.length; i++) {
        const w = waves[i]
        w.x += w.vx
        w.y += w.vy

        if (w.x < 0 || w.x > width()) w.vx *= -1
        if (w.y < 0 || w.y > height()) w.vy *= -1

        ctx.globalAlpha = w.alpha
        ctx.fillStyle = w.color
        ctx.beginPath()
        ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2)
        ctx.fill()

        if (frame % 3 === 0) {
          for (let j = i + 1; j < waves.length; j++) {
            const other = waves[j]
            const dx = w.x - other.x
            const dy = w.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 200) {
              ctx.beginPath()
              ctx.moveTo(w.x, w.y)
              ctx.lineTo(other.x, other.y)
              ctx.strokeStyle = w.color
              ctx.globalAlpha = (1 - dist / 200) * 0.12
              ctx.lineWidth = 0.5
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }} />
}