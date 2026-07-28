"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { resolveMediaUrl } from "@/lib/media"
import { FeatureShell } from "@/components/feature-shell"

interface NFT {
  _id: string
  name: string
  description: string
  imageURL: string
  tokenId: string
  createdAt: string
}

export default function ContentPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!isAuthenticated) router.push("/auth")
  }, [isAuthenticated, router])

  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem("demedia_token")
        if (!token) return
        const response = await fetch("/api/nfts/my-nfts", { headers: { Authorization: `Bearer ${token}` } })
        const data = await response.json()
        if (data.success) setItems(data.data || [])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(
    () => items.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  )

  if (!isAuthenticated) return null

  return (
    <FeatureShell
      eyebrow="Content library"
      title="Your owned media assets, beautifully organized."
      description="Search, review, and manage verified content in a darker gallery workspace with stronger focus on the media itself."
      stats={[
        ["Assets", `${items.length}`],
        ["Filtered", `${filtered.length}`],
        ["Mode", "Private library"],
      ]}
    >
      <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.05] p-3 backdrop-blur">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your assets..."
          className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/60"
        />
      </div>

      <section>
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-8 text-zinc-300">Loading your library...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center backdrop-blur">
            <h2 className="text-2xl font-semibold">No content yet.</h2>
            <p className="mt-2 text-sm text-zinc-400">Upload your first asset to start building your DeMedia library.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <article key={item._id} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-300/40">
                <img
                  src={resolveMediaUrl(item.imageURL)}
                  alt={item.name}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="p-5">
                  <p className="text-lg font-semibold">{item.name}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{item.description}</p>
                  <p className="mt-4 text-xs text-zinc-500">#{item.tokenId} - {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </FeatureShell>
  )
}
