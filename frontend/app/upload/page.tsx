"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileSearch,
  ImageIcon,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UploadCloud,
} from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { useAuth } from "@/lib/auth-context"

type UploadState = "idle" | "uploading" | "success" | "error"
type CopyrightState = "idle" | "checking" | "done" | "error"

interface CopyrightMatch {
  tokenId: string
  author: string
  ipfsHash: string
  similarity: number
  matchType: "exact" | "near-duplicate" | "similar"
  matchedHash: string
}

interface CopyrightResult {
  isOriginal: boolean
  riskLevel: "low" | "medium" | "high" | "critical"
  matches: CopyrightMatch[]
  fingerprint: {
    sha256: string
    phash: string
    dhash: string
    ahash: string
    crc32: string
    ssdeep: string
    width: number
    height: number
    fileSize: number
  }
  scannedCount: number
}

export default function UploadPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState<UploadState>("idle")
  const [message, setMessage] = useState("")

  const [copyrightStatus, setCopyrightStatus] = useState<CopyrightState>("idle")
  const [copyrightResult, setCopyrightResult] = useState<CopyrightResult | null>(null)
  const [copyrightMessage, setCopyrightMessage] = useState("")
  const [showFingerprint, setShowFingerprint] = useState(false)
  const [showCopyrightDetails, setShowCopyrightDetails] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth")
  }, [isAuthenticated, isLoading, router])

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith("image/")) return ""
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const runCopyrightCheck = async () => {
    if (!file) return

    setCopyrightStatus("checking")
    setCopyrightMessage("Scanning content fingerprints across the registry...")
    setCopyrightResult(null)

    try {
      const token = localStorage.getItem("demedia_token")
      if (!token) throw new Error("Sign in to run copyright check.")

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/copyright/check", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Copyright check failed.")
      }

      setCopyrightResult(data.data)
      setCopyrightStatus("done")

      if (data.data.isOriginal) {
        setCopyrightMessage("Content appears original. No matches found in the registry.")
      } else {
        const exactCount = data.data.matches.filter(
          (m: CopyrightMatch) => m.matchType === "exact",
        ).length
        const nearCount = data.data.matches.filter(
          (m: CopyrightMatch) => m.matchType === "near-duplicate",
        ).length
        const similarCount = data.data.matches.filter(
          (m: CopyrightMatch) => m.matchType === "similar",
        ).length
        const parts: string[] = []
        if (exactCount) parts.push(`${exactCount} exact`)
        if (nearCount) parts.push(`${nearCount} near-duplicate`)
        if (similarCount) parts.push(`${similarCount} similar`)
        setCopyrightMessage(
          `Found ${data.data.matches.length} potential match(es): ${parts.join(", ")}.`,
        )
      }
    } catch (error) {
      setCopyrightStatus("error")
      setCopyrightMessage(error instanceof Error ? error.message : "Copyright check failed.")
    }
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) {
      setStatus("error")
      setMessage("Choose a media file before uploading.")
      return
    }

    if (
      copyrightResult &&
      !copyrightResult.isOriginal &&
      copyrightResult.riskLevel === "critical"
    ) {
      setStatus("error")
      setMessage(
        "Upload blocked: exact content match detected. Please upload original content only.",
      )
      return
    }

    setStatus("uploading")
    setMessage("Uploading media, pinning metadata, and minting ownership...")

    try {
      const token = localStorage.getItem("demedia_token")
      if (!token) throw new Error("Sign in again to upload content.")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      if (price.trim()) formData.append("price", price.trim())

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.action || data.message || data.error || "Upload failed.")
      }

      setStatus("success")
      setMessage("Upload complete. Your content is now registered and minted.")
      setFile(null)
      setName("")
      setDescription("")
      setPrice("")
      setCopyrightResult(null)
      setCopyrightStatus("idle")
      setCopyrightMessage("")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Upload failed.")
    }
  }

  const riskColors = {
    low: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
    medium: "text-amber-300 bg-amber-500/10 border-amber-400/30",
    high: "text-orange-300 bg-orange-500/10 border-orange-400/30",
    critical: "text-red-300 bg-red-500/10 border-red-400/30",
  }

  const riskIcons = {
    low: <ShieldCheck className="h-4 w-4" />,
    medium: <AlertCircle className="h-4 w-4" />,
    high: <ShieldAlert className="h-4 w-4" />,
    critical: <ShieldX className="h-4 w-4" />,
  }

  if (isLoading || !isAuthenticated) return null

  return (
    <FeatureShell
      eyebrow="Creator upload"
      title="Register media, mint ownership, and publish with proof."
      description="Upload your content once and let DeMedia handle file pinning, metadata creation, blockchain registration, and NFT minting."
      stats={[
        ["Storage", "IPFS pinned"],
        ["Proof", "Content hash"],
        ["Mint", "Stellar NFT"],
      ]}
    >
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-4">
          <label className="group flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.05] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:border-cyan-300/60 hover:bg-white/[0.08]">
            <input
              type="file"
              accept="image/*,video/*,audio/*"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null)
                setStatus("idle")
                setMessage("")
                setCopyrightResult(null)
                setCopyrightStatus("idle")
                setCopyrightMessage("")
              }}
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected media preview"
                className="h-full max-h-[340px] w-full rounded-2xl object-cover"
              />
            ) : (
              <>
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                  <UploadCloud className="h-9 w-9 text-cyan-200" />
                </div>
                <h2 className="mt-6 text-2xl font-semibold">Drop your media here</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                  Choose image, video, or audio content to create a verified DeMedia asset.
                </p>
              </>
            )}
            {file ? (
              <div className="mt-5 flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-zinc-300">
                <ImageIcon className="h-4 w-4 text-cyan-200" />
                <span className="truncate">{file.name}</span>
              </div>
            ) : null}
          </label>

          {file && (
            <button
              type="button"
              onClick={runCopyrightCheck}
              disabled={copyrightStatus === "checking"}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/40 hover:bg-white/[0.08] disabled:opacity-60"
            >
              {copyrightStatus === "checking" ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200" />
                  Scanning Registry...
                </>
              ) : (
                <>
                  <FileSearch className="h-4 w-4" />
                  Copyright Check
                </>
              )}
            </button>
          )}

          {copyrightStatus === "checking" && (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4 text-sm text-cyan-200">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200/30 border-t-cyan-200" />
                <p>{copyrightMessage}</p>
              </div>
            </div>
          )}

          {copyrightStatus === "done" && copyrightResult && (
            <div className={`rounded-2xl border p-4 ${riskColors[copyrightResult.riskLevel]}`}>
              <div className="flex items-center gap-2">
                {riskIcons[copyrightResult.riskLevel]}
                <p className="font-semibold capitalize">{copyrightResult.riskLevel} Risk</p>
                <span className="ml-auto text-xs opacity-70">
                  Scanned {copyrightResult.scannedCount} existing works
                </span>
              </div>
              <p className="mt-2 text-sm opacity-90">{copyrightMessage}</p>

              {copyrightResult.matches.length > 0 && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowCopyrightDetails(!showCopyrightDetails)}
                    className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider opacity-70 hover:opacity-100"
                  >
                    {showCopyrightDetails ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                    {showCopyrightDetails ? "Hide" : "Show"} Details
                  </button>
                  {showCopyrightDetails && (
                    <div className="mt-2 space-y-2">
                      {copyrightResult.matches.map((match, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-xl bg-black/20 px-3 py-2 text-xs"
                        >
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              match.matchType === "exact"
                                ? "bg-red-500/20 text-red-300"
                                : match.matchType === "near-duplicate"
                                  ? "bg-orange-500/20 text-orange-300"
                                  : "bg-yellow-500/20 text-yellow-300"
                            }`}
                          >
                            {match.matchType}
                          </span>
                          <span className="text-zinc-300">Token #{match.tokenId}</span>
                          <span className="text-zinc-500">{match.similarity}% similar</span>
                          <span className="ml-auto text-zinc-500">{match.matchedHash}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowFingerprint(!showFingerprint)}
                  className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider opacity-70 hover:opacity-100"
                >
                  {showFingerprint ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  {showFingerprint ? "Hide" : "Show"} Fingerprint
                </button>
                {showFingerprint && (
                  <div className="mt-2 grid gap-1 rounded-xl bg-black/20 p-3 text-[10px] font-mono text-zinc-400">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">SHA-256</span>
                      <span className="break-all text-right">
                        {copyrightResult.fingerprint.sha256}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">pHash</span>
                      <span>{copyrightResult.fingerprint.phash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">dHash</span>
                      <span>{copyrightResult.fingerprint.dhash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">aHash</span>
                      <span>{copyrightResult.fingerprint.ahash}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">CRC32</span>
                      <span>{copyrightResult.fingerprint.crc32}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">SSDEEP</span>
                      <span className="break-all text-right">
                        {copyrightResult.fingerprint.ssdeep}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {copyrightStatus === "error" && (
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
              <p>{copyrightMessage}</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="grid gap-5">
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Asset name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Cinematic creator drop"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={6}
                placeholder="Describe the story, rights, or context behind this media."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">
                Price in XLM
              </span>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>
          </div>

          {message ? (
            <div
              className={`mt-5 flex gap-3 rounded-2xl border p-4 text-sm ${status === "error" ? "border-red-400/30 bg-red-500/10 text-red-100" : status === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-black/25 text-zinc-300"}`}
            >
              {status === "success" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "uploading"}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "uploading" ? "Uploading..." : "Upload and Mint"}
            </button>
            <Link
              href="/content"
              className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50"
            >
              View Library
            </Link>
          </div>
        </div>
      </form>
    </FeatureShell>
  )
}
