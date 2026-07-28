"use client"

import { useEffect, useRef } from "react"

export default function OrbitBackground() {
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

    const centerX = width() / 2
    const centerY = height() / 2

    const orbitals: Array<{
      radius: number
      angle: number
      speed: number
      size: number
      color: string
    }> = []

    for (let i = 0; i < 35; i++) {
      orbitals.push({
        radius: 100 + Math.random() * 300,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0005 + Math.random() * 0.0015,
        size: 0.8 + Math.random() * 2,
        color: ["#3b82f6", "#0284c7", "#dc2626"][Math.floor(Math.random() * 3)],
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.08)"
      ctx.fillRect(0, 0, width(), height())

      for (let i = 0; i < orbitals.length; i++) {
        const o = orbitals[i]
        o.angle += o.speed

        const x = centerX + Math.cos(o.angle) * o.radius
        const y = centerY + Math.sin(o.angle) * o.radius

        ctx.fillStyle = o.color
        ctx.beginPath()
        ctx.arc(x, y, o.size, 0, Math.PI * 2)
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }} />
}