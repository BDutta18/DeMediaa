"use client"

import { useEffect, useRef } from "react"

export default function FloatingOrbsBackground() {
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

    const orbs: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []

    for (let i = 0; i < 5; i++) {
      orbs.push({
        x: Math.random() * width(),
        y: Math.random() * height(),
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 120 + 80,
        color: ["#3b82f6", "#0284c7", "#dc2626"][i % 3],
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, width(), height())

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i]
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x - orb.radius < 0 || orb.x + orb.radius > width()) orb.vx *= -1
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > height()) orb.vy *= -1

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        gradient.addColorStop(0, orb.color + "30")
        gradient.addColorStop(0.5, orb.color + "15")
        gradient.addColorStop(1, orb.color + "00")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      }

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