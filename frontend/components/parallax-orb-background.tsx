"use client"

import { useEffect, useRef } from "react"

export default function ParallaxOrbBackground() {
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
    const width = window.innerWidth
    const height = window.innerHeight

    const farOrbs: Array<{
      x: number
      y: number
      radius: number
      color: string
      speedY: number
    }> = []

    for (let i = 0; i < 3; i++) {
      farOrbs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        color: ["#3b82f6", "#7c3aed", "#fbbf24"][i],
        speedY: (Math.random() - 0.5) * 0.15,
      })
    }

    const particles: Array<{
      x: number
      y: number
      size: number
      speedY: number
      opacity: number
    }> = []

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.4 + 0.1,
      })
    }

    let scrollY = 0

    let rafId: number
    let frame = 0

    const animate = () => {
      frame++
      ctx.clearRect(0, 0, width, height)

      farOrbs.forEach((orb) => {
        orb.y += orb.speedY
        if (orb.y < -orb.radius) orb.y = height + orb.radius
        if (orb.y > height + orb.radius) orb.y = -orb.radius

        const parallaxY = orb.y - scrollY * 0.2

        const gradient = ctx.createRadialGradient(orb.x, parallaxY, 0, orb.x, parallaxY, orb.radius)
        gradient.addColorStop(0, `${orb.color}30`)
        gradient.addColorStop(0.5, `${orb.color}08`)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.fillRect(orb.x - orb.radius, parallaxY - orb.radius, orb.radius * 2, orb.radius * 2)
      })

      ctx.fillStyle = "#ffffff"
      particles.forEach((particle) => {
        particle.y += particle.speedY
        if (particle.y < 0) particle.y = height
        if (particle.y > height) particle.y = 0

        const parallaxY = particle.y - scrollY * 1.2
        ctx.globalAlpha = particle.opacity
        ctx.beginPath()
        ctx.arc(particle.x, parallaxY, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1

      rafId = requestAnimationFrame(animate)
    }

    animate()

    const handleScroll = () => {
      scrollY = window.scrollY
    }
    window.addEventListener("scroll", handleScroll, { passive: true })

    const handleResize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}