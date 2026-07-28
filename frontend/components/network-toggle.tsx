"use client"

import { useNetworkStore, type NetworkMode } from "@/lib/network-store"

const options: Array<{ id: NetworkMode; label: string }> = [
  { id: "testnet", label: "Testnet" },
  { id: "mainnet", label: "Mainnet" },
]

export function NetworkToggle() {
  const network = useNetworkStore((state) => state.network)
  const setNetwork = useNetworkStore((state) => state.setNetwork)

  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur">
      {options.map((option) => {
        const active = option.id === network
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setNetwork(option.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active ? "bg-white text-black" : "text-zinc-400 hover:text-white"
            }`}
            aria-pressed={active}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export function NetworkBadge() {
  const network = useNetworkStore((state) => state.network)
  const label = network === "testnet" ? "● Testnet" : "● Mainnet"

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] rounded-full border border-white/10 bg-black/45 px-3 py-2 text-xs font-semibold text-zinc-100 shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl">
      {label}
    </div>
  )
}
