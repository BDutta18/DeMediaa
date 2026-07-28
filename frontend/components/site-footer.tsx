"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, GalleryHorizontalEnd, LayoutDashboard, Library, Search, WalletCards } from "lucide-react"

const footerLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Gallery", href: "/gallery", icon: GalleryHorizontalEnd },
  { label: "Library", href: "/content", icon: Library },
  { label: "Search", href: "/search", icon: Search },
  { label: "Wallet", href: "/wallet", icon: WalletCards },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#03050d] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-4">
            <Image src="/dm-logo-mark.svg" alt="DeMedia logo" width={64} height={64} className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">DeMedia</p>
              <p className="mt-1 text-sm text-zinc-400">Creator ownership, publishing, and verified media rails.</p>
            </div>
          </Link>
          <p className="mt-6 max-w-xl text-sm leading-6 text-zinc-400">
            Built for creators and communities that want media provenance, wallet-native identity, and monetization in one polished workspace.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition hover:border-cyan-300/50 hover:bg-white/[0.08] hover:text-white"
            >
              <span className="inline-flex items-center gap-3">
                <item.icon className="h-4 w-4 text-cyan-300" />
                {item.label}
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-50 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
