"use client"

import { useEffect, useState } from "react"
import { AlertCircle, Check, ExternalLink, Loader2, ShieldCheck, Wallet, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { connectWallet, getSupportedWallets, getWalletNetwork, isFreighterInstalled, signWalletMessage } from "@/lib/wallet-kit"
import { mapWalletError } from "@/lib/errors"
import { getNetworkConfig, useNetworkStore } from "@/lib/network-store"
import { BrandLockup } from "@/components/brand-lockup"

type AuthStatus = "detect" | "connect" | "connecting" | "sign" | "awaiting-signature" | "verifying" | "success" | "error"

const authHighlights = [
  { icon: ShieldCheck, title: "Gasless signature", text: "Authenticate without sending a transaction." },
  { icon: Zap, title: "Instant workspace", text: "Jump into publishing, wallet, and gallery tools." },
]

function toBase64(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function decodeBase64(value: string) {
  try {
    const binary = atob(value.trim())
    return Uint8Array.from(binary, (char) => char.charCodeAt(0))
  } catch {
    return null
  }
}

function decodeHex(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/^0x/, "")
  if (!/^[0-9a-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) return null
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16)
  return bytes
}

function normalizeSignature(value: string) {
  const decoded = decodeBase64(value) || decodeHex(value)
  if (!decoded) return value
  if (decoded.length === 64) return toBase64(decoded)
  if (decoded.length === 68) return toBase64(decoded.slice(4))
  if (decoded.length > 64) return toBase64(decoded.slice(decoded.length - 64))
  return value
}

const stepLabels: Record<AuthStatus, { title: string; desc: string }> = {
  detect: { title: "Wallet required", desc: "Install Freighter to use your Stellar identity." },
  connect: { title: "Connect to continue", desc: "DeMedia uses a one-time wallet signature. No password is stored." },
  connecting: { title: "Connecting wallet", desc: "Opening Freighter to connect your Stellar account." },
  sign: { title: "Confirm ownership", desc: "Review the connected address, then sign a gasless message." },
  "awaiting-signature": { title: "Awaiting signature", desc: "Check Freighter to sign the verification message." },
  verifying: { title: "Verifying signature", desc: "Confirming your identity on the network." },
  success: { title: "You're signed in", desc: "Redirecting to your workspace..." },
  error: { title: "Connection failed", desc: "Please try again." },
}

export default function AuthPage() {
  const router = useRouter()
  const { login } = useAuth()
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")
  const network = useNetworkStore((state) => state.network)
  const networkConfig = getNetworkConfig(network)
  const [isSecureOrigin, setIsSecureOrigin] = useState(true)
  const [status, setStatus] = useState<AuthStatus>("connect")
  const [walletCount, setWalletCount] = useState(0)
  const [hasFreighter, setHasFreighter] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setIsSecureOrigin(window.location.protocol === "https:" || window.location.hostname === "localhost")
    ;(async () => {
      try {
        const [wallets, freighter] = await Promise.all([getSupportedWallets(), isFreighterInstalled()])
        const available = wallets.filter((wallet) => wallet.isAvailable).length
        setWalletCount(Math.max(available, freighter ? 1 : 0))
        setHasFreighter(freighter)
        setStatus(available || freighter ? "connect" : "detect")
      } catch {
        setStatus("detect")
      }
    })()
  }, [])

  const connect = async () => {
    if (walletCount === 0 && !hasFreighter) {
      setStatus("detect")
      setMessage("Install or enable a Stellar wallet to continue.")
      return
    }
    setStatus("connecting")
    setMessage("")
    try {
      const result = await connectWallet()
      if (!result.address) throw new Error("No wallet address returned")

      const walletNetwork = await getWalletNetwork()
      if (walletNetwork.networkPassphrase !== networkConfig.passphrase) {
        throw new Error(`Please switch Freighter to ${networkConfig.label}.`)
      }

      setAddress(result.address)
      setStatus("sign")
    } catch (error) {
      setStatus("error")
      setMessage(mapWalletError(error).message || "Wallet connection failed.")
    }
  }

  const sign = async () => {
    setStatus("awaiting-signature")
    setMessage("")
    try {
      const timestamp = new Date().toISOString()
      const signedMessage = `Login verification at ${timestamp}`
      const response = await signWalletMessage(signedMessage, address ?? undefined)
      const record = response && typeof response === "object" ? (response as Record<string, unknown>) : {}
      const resolvedAddress =
        (typeof record.signerAddress === "string" && record.signerAddress) ||
        (typeof record.address === "string" && record.address) ||
        address
      const resolvedSignature =
        (typeof record.signedMessage === "string" && record.signedMessage) ||
        (typeof record.signature === "string" && record.signature) ||
        (typeof response === "string" ? response : "")

      if (!resolvedAddress || !resolvedSignature) throw new Error("Wallet returned an invalid signature.")

      setStatus("verifying")
      const payload = {
        address: resolvedAddress,
        message: signedMessage,
        signature: normalizeSignature(resolvedSignature),
        signedMessage: resolvedSignature,
      }
      const verifyUrl = "/api/auth/verify"
      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.token) throw new Error(data.message || data.error || "Verification failed.")

      login(data.address, data.token)
      setStatus("success")

      const profileRes = await fetch(`/api/user/profile/${data.address}`).catch(() => null)
      const profileData = profileRes ? await profileRes.json().catch(() => ({})) : {}
      const profile = profileData?.user
      const hasProfile = Boolean(
        profileRes?.ok && profileData?.success && profile && (profile.name || profile.avatar || profile.bio || profile.banner || profile.showcaseTitle),
      )
      router.push(hasProfile ? "/dashboard" : "/profile?setup=1")
    } catch (error) {
      setStatus("error")
      setMessage(mapWalletError(error).message || "Signature verification failed.")
    }
  }

  const busy = ["connecting", "awaiting-signature", "verifying"].includes(status)
  const step = stepLabels[status]

  const buttonLabel =
    status === "detect" ? "Install Freighter" :
    status === "sign" ? "Sign Message" :
    status === "success" ? "Opening Dashboard" :
    status === "error" ? "Try Again" :
    "Connect Wallet"

  const handleButtonClick = () => {
    if (status === "detect") window.open("https://freighter.app/", "_blank")
    else if (status === "sign") sign()
    else if (status === "error") setStatus("connect")
    else connect()
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070f] text-white">
      <section className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(14,165,233,0.18),rgba(248,113,113,0.1),rgba(250,204,21,0.08))]" />
        <div className="absolute left-1/2 top-8 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-cyan-300/10 blur-3xl" />

        <div>
          <BrandLockup className="-ml-2 sm:-ml-4" />

          {!isSecureOrigin ? (
            <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">
              Freighter only connects from an HTTPS site or localhost. Open this app on `https://` or `localhost`, or enable insecure domains in Freighter
              under Settings &gt; Security &gt; Advanced settings.
            </div>
          ) : null}

          <h1 className="mt-8 max-w-3xl font-[family-name:var(--font-display)] text-5xl font-semibold leading-tight sm:text-7xl">
            Wallet login for verified creators.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-300">
            Enter the creator workspace with a private Stellar signature. No password, no custodial account, just ownership you can prove.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {authHighlights.map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
                <item.icon className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-zinc-400">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-cyan-300/20 via-white/10 to-amber-300/20 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                {busy ? (
                  <Loader2 className="h-7 w-7 text-cyan-200 animate-spin" />
                ) : status === "success" ? (
                  <Check className="h-7 w-7 text-emerald-300" />
                ) : status === "error" ? (
                  <AlertCircle className="h-7 w-7 text-red-300" />
                ) : (
                  <Wallet className="h-7 w-7 text-cyan-200" />
                )}
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-zinc-300">
                {busy ? "In progress" : status === "success" ? "Done" : "Secure login"}
              </span>
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{step.desc}</p>

            {address && status === "sign" ? (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <p className="text-xs text-zinc-500">Connected address</p>
                <p className="mt-1 font-mono text-sm text-cyan-200">{address.slice(0, 8)}...{address.slice(-6)}</p>
              </div>
            ) : null}

            {message ? (
              <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{message}</p>
            ) : null}

            <button
              onClick={handleButtonClick}
              disabled={busy || status === "success"}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {buttonLabel}
              {status === "detect" ? <ExternalLink className="h-4 w-4" /> : null}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
