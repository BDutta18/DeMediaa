"use client"

import Image from "next/image"
import Link from "next/link"

type BrandLockupProps = {
  compact?: boolean
  className?: string
}

export function BrandLockup({ compact = false, className = "" }: BrandLockupProps) {
  const iconSize = compact ? "h-10 w-10" : "h-11 w-11"
  const textSize = compact ? "text-lg" : "text-xl sm:text-2xl"

    return (
    <Link href="/" className={`inline-flex items-center gap-3 transition hover:opacity-90 ${className}`}>
      <Image src="/dm-logo-mark.svg" alt="DeMedia" width={36} height={36} className={`${iconSize} rounded-xl object-cover`} priority />
      <span className={`font-[family-name:var(--font-display)] font-semibold tracking-tight text-white ${textSize}`}>DeMedia</span>
    </Link>
  )
}
