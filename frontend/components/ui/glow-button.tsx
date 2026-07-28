import Link from "next/link"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

export function GlowButton({
  href,
  children,
  variant = "primary",
  className,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "ghost"
  className?: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-300",
        variant === "primary"
          ? "bg-[linear-gradient(90deg,#4F8CFF,#7B61FF)] text-white shadow-[0_10px_30px_rgba(79,140,255,0.45)] hover:-translate-y-0.5"
          : "border border-white/15 bg-white/5 text-white hover:bg-white/10",
        className,
      )}
    >
      {children}
    </Link>
  )
}

