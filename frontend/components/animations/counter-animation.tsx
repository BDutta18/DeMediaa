"use client"

import { useEffect, useRef, useState } from "react"

export function CounterAnimation({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        const start = performance.now()
        const duration = 1300
        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1)
          setValue(Math.floor(end * progress))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
        io.disconnect()
      },
      { threshold: 0.4 },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [end])

  return (
    <span ref={ref}>
      {value.toLocaleString()}
      {suffix}
    </span>
  )
}

