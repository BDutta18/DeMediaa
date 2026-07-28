"use client"

import { useEffect, useRef } from "react"

export default function IdentityMatrixBackground() {
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
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.4 + 0.1,
        color: ["#00d4ff", "#7c3aed", "#fbbf24"][Math.floor(Math.random() * 3)],
      })
    }

    let mouseX = width() / 2
    let mouseY = height() / 2
    let targetX = mouseX
    let targetY = mouseY

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX
      targetY = e.clientY
    }
    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    const animate = () => {
      mouseX += (targetX - mouseX) * 0.1
      mouseY += (targetY - mouseY) * 0.1

      ctx.fillStyle = "rgba(10, 10, 15, 0.08)"
      ctx.fillRect(0, 0, width(), height())

      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.12)")
      gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.06)")
      gradient.addColorStop(1, "rgba(10, 10, 15, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width(), height())

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.speedX
        p.y += p.speedY

        if (p.x < 0 || p.x > width()) p.speedX *= -1
        if (p.y < 0 || p.y > height()) p.speedY *= -1

        ctx.globalAlpha = p.opacity
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x
          const dy = particles[j].y - p.y
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

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}