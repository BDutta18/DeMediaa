"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { disconnectWallet } from "@/lib/wallet-kit"
import { FeatureShell } from "@/components/feature-shell"
import { getNetworkConfig, useNetworkStore } from "@/lib/network-store"
import { Check, Copy } from "lucide-react"

export default function WalletPage() {
  const { address, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const network = useNetworkStore((state) => state.network)
  const networkConfig = getNetworkConfig(network)
  const [balance, setBalance] = useState("0.00")
  const [msg, setMsg] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth")
  }, [isAuthenticated, router])

  useEffect(() => {
    ;(async () => {
      if (!address) return
      try {
        const res = await fetch(`${networkConfig.horizonUrl}/accounts/${address.toUpperCase()}`)
        if (!res.ok) return
        const data = await res.json()
        const xlm = data.balances.find((b: any) => b.asset_type === "native")?.balance || "0"
        setBalance(Number(xlm).toFixed(4))
      } catch {}
    })()
  }, [address, networkConfig.horizonUrl])

  const fund = async () => {
    if (!address) return
    if (!networkConfig.isTestnet) {
      setMsg("Friendbot funding is only available on Testnet.")
      return
    }
    setMsg("Funding testnet wallet...")
    try {
      await fetch(`${networkConfig.friendbotUrl}/?addr=${encodeURIComponent(address.toUpperCase())}`)
      setMsg("Funding requested. Refresh in a few seconds.")
    } catch {
      setMsg("Failed to request funding.")
    }
  }

  const disconnect = async () => {
    try { await disconnectWallet() } catch {}
    logout()
  }

  const copyAddress = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  if (!isAuthenticated) return null

  return (
    <FeatureShell
      eyebrow="Wallet"
      title="Secure, readable wallet controls."
      description="Review your connected Stellar identity, selected network balance, and account actions in one focused panel."
      stats={[
        ["Network", networkConfig.label],
        ["Balance", `${balance} XLM`],
        ["Status", isAuthenticated ? "Connected" : "Locked"],
      ]}
    >
      <section className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs text-zinc-400">Address</p>
            <div className="mt-2 flex items-center gap-2">
              <p className="min-w-0 flex-1 truncate font-mono text-sm">{address}</p>
              <button
                type="button"
                onClick={copyAddress}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-white/[0.1]"
                aria-label="Copy wallet address"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs text-zinc-400">Balance</p>
            <p className="mt-2 text-2xl font-semibold">{balance} XLM</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={fund} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
            {networkConfig.isTestnet ? "Fund Testnet Wallet" : "Mainnet Funding Unavailable"}
          </button>
          <button onClick={disconnect} className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white">Disconnect</button>
        </div>
        {msg ? <p className="mt-4 text-sm text-zinc-300">{msg}</p> : null}
      </section>
    </FeatureShell>
  )
}
