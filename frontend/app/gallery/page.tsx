"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { resolveMediaUrl } from "@/lib/media"
import { FeatureShell } from "@/components/feature-shell"

interface NFT {
  _id: string
  owner: string
  name: string
  description: string
  imageURL: string
  price: number
  forSale: boolean
  tokenId: string
  createdAt: string
}

export default function GalleryPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const response = await fetch("/api/nfts/all")
        const data = await response.json()
        if (data.success) setNfts(data.data || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(
    () => nfts.filter((nft) => `${nft.name} ${nft.description}`.toLowerCase().includes(query.toLowerCase())),
    [nfts, query],
  )

  return (
    <FeatureShell
      eyebrow="Public gallery"
      title="Verified media, framed like a premium showcase."
      description="Browse tokenized work in a photo-first grid with search, stronger contrast, and polished hover states."
      stats={[
        ["Listed", `${nfts.length}`],
        ["Visible", `${filtered.length}`],
        ["Source", "Public feed"],
      ]}
    >
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search gallery..."
          className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
        />
      </div>

      <section>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-zinc-300">Loading gallery...</div>
        ) : (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {filtered.map((nft, index) => (
              <Link
                href={`/post/${nft._id}`}
                key={nft._id}
                className="group mb-5 block break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-300/40"
              >
                <div className="relative">
                  <img
                    src={resolveMediaUrl(nft.imageURL)}
                    alt={nft.name}
                    loading="lazy"
                    decoding="async"
                    className={`${index % 3 === 0 ? "h-80" : "h-60"} w-full object-cover transition duration-500 group-hover:scale-[1.04]`}
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    {nft.forSale ? `${nft.price.toFixed(2)} XLM` : "Not listed"}
                  </div>
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-lg font-semibold">{nft.name}</h2>
                    <p className="mt-1 text-sm text-zinc-500">by {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}</p>
                  </div>
                  <p className="line-clamp-2 text-sm leading-6 text-zinc-400">{nft.description}</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>#{nft.tokenId}</span>
                    <span>{new Date(nft.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </FeatureShell>
  )
}
