"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { FeatureShell } from "@/components/feature-shell"

export default function DashboardPage() {
  const { address } = useAuth()
  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

  return (
    <FeatureShell
      eyebrow="Creator dashboard"
      title="Your media business, at a glance."
      description="Publishing, ownership, earnings, and activity now sit in a sharper command center for day-to-day creator operations."
      actions={
        <>
          <Link href="/upload" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">Upload Content</Link>
          <Link href="/gallery" className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white">Open Gallery</Link>
        </>
      }
      stats={[
        ["Wallet", walletLabel],
        ["Published", "24 assets"],
        ["Revenue", "1,280 XLM"],
      ]}
    >
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Wallet", walletLabel],
          ["Published", "24 assets"],
          ["Revenue", "1,280 XLM"],
          ["Reach", "+14.2%"],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
            <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Performance</h2>
          <div className="mt-6 space-y-5">
            {[
              ["Audience growth", 72],
              ["Verification health", 91],
              ["Marketplace momentum", 64],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">{label}</span>
                  <span>{value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-amber-300" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur">
          <h2 className="text-2xl font-semibold">Shortcuts</h2>
          {[
            ["Library", "/content"],
            ["Wallet", "/wallet"],
            ["Profile", "/profile"],
          ].map(([label, href]) => (
            <Link key={label} href={href} className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-zinc-200 transition hover:border-cyan-300/40 hover:text-white">
              {label}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>
    </FeatureShell>
  )
}
