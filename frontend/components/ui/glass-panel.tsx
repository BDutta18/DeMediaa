import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function GlassPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

