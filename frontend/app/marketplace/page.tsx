"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileKey2,
  Search,
  ExternalLink,
  Shield,
  ChevronRight,
  Grid3X3,
  List,
} from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { useAuth } from "@/lib/auth-context"
import { resolveMediaUrl } from "@/lib/media"
import { getNetworkConfig, useNetworkStore } from "@/lib/network-store"

interface Listing {
  _id: string
  nftId: string
  tokenId: string
  creator: string
  name: string
  description: string
  imageURL: string
  licenseTypes: {
    personal: number
    commercial: number
    exclusive: number
  }
  royaltyBps: number
  active: boolean
  totalLicensesSold: number
  totalRevenue: number
  createdAt: string
}

export default function MarketplacePage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const network = useNetworkStore((state) => state.network)
  const networkConfig = getNetworkConfig(network)
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "sold">("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = new URLSearchParams()
        if (filter === "active") params.set("active", "true")

        const response = await fetch(`/api/licenses/listings?${params.toString()}`)
        const data = await response.json()
        if (data.success) {
          setListings(data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch listings:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [filter])

  const filtered = listings.filter((listing) => {
    const matchesQuery = `${listing.name} ${listing.description} ${listing.creator}`.toLowerCase().includes(query.toLowerCase())
    if (filter === "sold") return matchesQuery && listing.totalLicensesSold > 0
    return matchesQuery
  })

  const formatPrice = (price: number) => price.toFixed(2)

  return (
    <FeatureShell
      eyebrow="Licensing marketplace"
      title="License verified digital content on-chain."
      description="Browse and acquire personal, commercial, or exclusive licenses for original content registered on the Stellar blockchain."
      stats={[
        ["Listings", `${listings.length}`],
        ["Total Sold", `${listings.reduce((s, l) => s + l.totalLicensesSold, 0)}`],
        ["Marketplace", "Live"],
      ]}
    >
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search marketplace..."
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.05] p-1">
            {(["all", "active", "sold"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  filter === f ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-white/10 bg-white/[0.05] p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-lg p-1.5 transition ${viewMode === "grid" ? "bg-white/10 text-white" : "text-zinc-500"}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-lg p-1.5 transition ${viewMode === "list" ? "bg-white/10 text-white" : "text-zinc-500"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-zinc-300">
          Loading marketplace...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center backdrop-blur">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
            <FileKey2 className="h-8 w-8 text-cyan-200" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">No listings found</h2>
          <p className="mt-2 text-sm text-zinc-400">
            {filter === "all"
              ? "Content creators haven't listed any items for licensing yet."
              : `No ${filter} listings match your search.`}
          </p>
          {isAuthenticated && (
            <Link
              href="/content"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
            >
              List your content
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => (
            <article
              key={listing._id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-300/40"
            >
              <div className="relative overflow-hidden">
                <img
                  src={resolveMediaUrl(listing.imageURL)}
                  alt={listing.name}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg"
                  }}
                />
                {listing.totalLicensesSold > 0 && (
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white">
                    <Shield className="h-3 w-3" />
                    {listing.totalLicensesSold} sold
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold truncate">{listing.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-400">{listing.description}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-[11px] text-zinc-500">Personal</span>
                    <span className="text-sm font-semibold text-cyan-200">{formatPrice(listing.licenseTypes.personal)} XLM</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-[11px] text-zinc-500">Commercial</span>
                    <span className="text-sm font-semibold text-amber-200">{formatPrice(listing.licenseTypes.commercial)} XLM</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <span className="text-[11px] text-zinc-500">Exclusive</span>
                    <span className="text-sm font-semibold text-purple-200">{formatPrice(listing.licenseTypes.exclusive)} XLM</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>#{listing.tokenId}</span>
                  <span>{(listing.royaltyBps / 100).toFixed(0)}% royalty</span>
                </div>

                <Link
                  href={`/post/${listing.nftId}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  View &amp; License
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((listing) => (
            <article
              key={listing._id}
              className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-cyan-300/40"
            >
              <img
                src={resolveMediaUrl(listing.imageURL)}
                alt={listing.name}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold truncate">{listing.name}</p>
                <p className="text-xs text-zinc-500">#{listing.tokenId} - {listing.creator.slice(0, 6)}...{listing.creator.slice(-4)}</p>
              </div>
              <div className="hidden shrink-0 gap-2 sm:flex">
                <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-[10px]">
                  <span className="text-zinc-500">Personal </span>
                  <span className="font-semibold text-cyan-200">{formatPrice(listing.licenseTypes.personal)}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-[10px]">
                  <span className="text-zinc-500">Commercial </span>
                  <span className="font-semibold text-amber-200">{formatPrice(listing.licenseTypes.commercial)}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 px-2.5 py-1 text-[10px]">
                  <span className="text-zinc-500">Exclusive </span>
                  <span className="font-semibold text-purple-200">{formatPrice(listing.licenseTypes.exclusive)}</span>
                </div>
              </div>
              <Link
                href={`/post/${listing.nftId}`}
                className="shrink-0 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                License
              </Link>
            </article>
          ))}
        </div>
      )}
    </FeatureShell>
  )
}
