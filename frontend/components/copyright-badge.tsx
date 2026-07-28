"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, ChevronDown, ChevronUp } from "lucide-react"

interface FingerprintData {
  tokenId: string
  sha256: string
  phash: string
  dhash: string
  ahash: string
  crc32: string
  ssdeep: string
  width: number
  height: number
  mimeType: string
  fileSize: number
  author: string
  ipfsHash: string
  createdAt: string
}

export function CopyrightBadge({ tokenId }: { tokenId: string }) {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchFingerprint = async () => {
      try {
        const response = await fetch(`/api/copyright/fingerprint/${tokenId}`)
        const data = await response.json()
        if (data.success) {
          setFingerprint(data.data)
        }
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchFingerprint()
  }, [tokenId])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Copyright</p>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          Loading...
        </div>
      </div>
    )
  }

  if (!fingerprint) return null

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Copyright &amp; Provenance</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-400">Fingerprinted</p>
          <p className="text-xs text-muted-foreground">Content verified in the DeMedia registry</p>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {expanded ? "Hide" : "Show"} Provenance Details
      </button>

      {expanded && (
        <div className="mt-2 grid gap-1.5 rounded-xl bg-muted/50 p-3 text-[10px] font-mono text-muted-foreground">
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">SHA-256</span><span className="break-all text-right">{fingerprint.sha256}</span></div>
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">pHash</span><span className="break-all text-right">{fingerprint.phash}</span></div>
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">dHash</span><span className="break-all text-right">{fingerprint.dhash}</span></div>
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">CRC32</span><span>{fingerprint.crc32}</span></div>
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">Size</span><span>{(fingerprint.fileSize / 1024).toFixed(1)} KB</span></div>
          <div className="flex justify-between gap-2"><span className="text-zinc-500 shrink-0">Dimensions</span><span>{fingerprint.width}x{fingerprint.height}</span></div>
        </div>
      )}
    </div>
  )
}
