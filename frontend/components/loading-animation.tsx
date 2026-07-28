"use client"

import { useEffect, useState } from "react"

interface LoadingAnimationProps {
  onComplete: () => void
}

export default function LoadingAnimation({ onComplete }: LoadingAnimationProps) {
  const [progress, setProgress] = useState(0)
  const particles = Array.from({ length: 30 }, (_, i) => {
    const rand = (offset: number) => {
      const value = Math.sin((i + 1) * 997 + offset * 101.73) * 10000
      return value - Math.floor(value)
    }

    return {
      width: `${(rand(1) * 4 + 2).toFixed(3)}px`,
      height: `${(rand(2) * 4 + 2).toFixed(3)}px`,
      left: `${(rand(3) * 100).toFixed(3)}%`,
      top: `${(rand(4) * 100).toFixed(3)}%`,
      background: ["#fbbf24", "#eab308", "#facc15"][Math.floor(rand(5) * 3)],
      opacity: Number((rand(6) * 0.5 + 0.2).toFixed(3)),
      animationDelay: `${(rand(7) * 4).toFixed(3)}s`,
    } as const
  })

  useEffect(() => {
    const duration = 3000
    const interval = 30
    const steps = duration / interval

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const newProgress = (currentStep / steps) * 100

      setProgress(newProgress)

      if (currentStep >= steps) {
        clearInterval(timer)
        setTimeout(onComplete, 300)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f] overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle-drift"
            style={{
              width: particle.width,
              height: particle.height,
              left: particle.left,
              top: particle.top,
              background: particle.background,
              opacity: particle.opacity,
              animationDelay: particle.animationDelay,
            }}
          />
        ))}
      </div>

      {/* Central loading content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center space-y-4">
          <h2
            className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-black tracking-wider"
            style={{
              letterSpacing: "0.15em",
              background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(251, 191, 36, 0.5))",
            }}
          >
            DeMedia
          </h2>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#fbbf24] via-[#eab308] to-[#ca8a04] transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 20px rgba(251, 191, 36, 0.8)",
              }}
            />
          </div>

          {/* Percentage counter */}
          <div className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#fbbf24]">
            {Math.round(progress)}%
          </div>

          {/* Loading text */}
          <div className="text-sm text-gray-500 font-mono">
            Initializing Network...
          </div>
        </div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fbbf24]/5 via-transparent to-[#eab308]/5 pointer-events-none" />
    </div>
  )
}
