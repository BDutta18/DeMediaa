"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ChevronRight,
  Grid3X3,
  Heart,
  List,
  Search,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"
import {
  marketplaceApi,
  type MarketplaceListing,
  type MarketplaceSortMode,
} from "@/lib/marketplace"
import { useMarketplaceStore } from "@/lib/marketplace-store"
import { resolveMediaUrl } from "@/lib/media"
import { useAuth } from "@/lib/auth-context"

const CATEGORIES = ["all", "Photography", "Music", "Video", "Software", "Design", "Writing"]

const formatXlm = (value: number) => `${value.toFixed(2)} XLM`

export default function MarketplacePage() {
  const { isAuthenticated } = useAuth()
  const savedTokenIds = useMarketplaceStore((state) => state.wishlistTokenIds)
  const toggleWishlistToken = useMarketplaceStore((state) => state.toggleWishlistToken)
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [trending, setTrending] = useState<MarketplaceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<MarketplaceSortMode>("trending")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  useEffect(() => {
    let active = true

    const loadMarketplace = async () => {
      setLoading(true)
      try {
        const [browseResult, trendingResult] = await Promise.all([
          marketplaceApi.search({
            q: query,
            category,
            sort,
            minPrice,
            maxPrice,
            limit: 24,
          }),
          marketplaceApi.trending({
            category: category === "all" ? undefined : category,
            limit: 5,
          }),
        ])

        if (!active) return
        setListings(browseResult.data)
        setTrending(trendingResult.data)
      } catch (error) {
        console.error("Failed to load marketplace:", error)
        if (active) {
          setListings([])
          setTrending([])
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    const debounce = setTimeout(loadMarketplace, 250)
    return () => {
      active = false
      clearTimeout(debounce)
    }
  }, [query, category, sort, minPrice, maxPrice])

  const savedCount = useMemo(
    () => listings.filter((listing) => savedTokenIds.includes(listing.tokenId)).length,
    [listings, savedTokenIds],
  )

  const clearFilters = () => {
    setQuery("")
    setCategory("all")
    setSort("trending")
    setMinPrice("")
    setMaxPrice("")
  }

  const handleWishlistToggle = async (listing: MarketplaceListing) => {
    const token = localStorage.getItem("demedia_token")
    if (!token) return

    const isSaved = savedTokenIds.includes(listing.tokenId)
    try {
      if (isSaved) {
        await marketplaceApi.removeWishlist(listing.tokenId, token)
      } else {
        await marketplaceApi.saveWishlist(
          {
            nftId: listing.nftId,
            tokenId: listing.tokenId,
            creator: listing.creator,
            name: listing.name,
            imageURL: listing.imageURL,
            priceSnapshot: listing.licenseTypes.personal,
          },
          token,
        )
      }
      toggleWishlistToken(listing.tokenId)
    } catch (error) {
      console.error("Wishlist update failed:", error)
    }
  }

  return (
    <FeatureShell
      eyebrow="Marketplace"
      title="A refined storefront for decentralized media."
      description="Browse trending content, sort by price or popularity, and save the pieces you want to revisit later."
      actions={
        <>
          <button
            onClick={clearFilters}
            className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Reset filters
          </button>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
            >
              Open dashboard
            </Link>
          ) : null}
        </>
      }
      stats={[
        ["Listings", `${listings.length}`],
        ["Saved", `${savedCount}`],
        ["Trending", `${trending.length}`],
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_160px]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search listings..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/50"
                />
              </div>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
              >
                {CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as MarketplaceSortMode)}
                className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
              >
                <option value="trending">Trending</option>
                <option value="popular">Popular</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex h-12 flex-1 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                    viewMode === "grid"
                      ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-black/25 text-zinc-300"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex h-12 flex-1 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition ${
                    viewMode === "list"
                      ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-black/25 text-zinc-300"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-zinc-400">
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                Popularity-first ranking
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                Wishlist and revisit later
              </span>
              <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                Responsive cards and skeletons
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Min price</span>
                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">Max price</span>
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
                />
              </label>
            </div>
          </section>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <Skeleton className="h-52 w-full rounded-2xl" />
                  <Skeleton className="mt-4 h-5 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-5/6" />
                  <Skeleton className="mt-4 h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : listings.length ? (
            viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => {
                  const isSaved = savedTokenIds.includes(listing.tokenId)
                  return (
                    <article
                      key={listing._id}
                      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_20px_70px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-cyan-300/40"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={resolveMediaUrl(listing.imageURL)}
                          alt={listing.name}
                          loading="lazy"
                          decoding="async"
                          className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                          {listing.category || "General"}
                        </div>
                        <button
                          onClick={() => handleWishlistToggle(listing)}
                          className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/50 p-2 text-rose-300 backdrop-blur"
                          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-white">{listing.name}</h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-400">
                              {listing.description}
                            </p>
                          </div>
                          {listing.totalLicensesSold > 0 ? (
                            <Shield className="h-5 w-5 text-emerald-300" />
                          ) : (
                            <Sparkles className="h-5 w-5 text-amber-300" />
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Personal</p>
                            <p className="mt-1 font-semibold text-cyan-200">
                              {formatXlm(listing.licenseTypes.personal)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Rating</p>
                            <p className="mt-1 font-semibold text-amber-200">
                              {listing.averageRating.toFixed(1)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Score</p>
                            <p className="mt-1 font-semibold text-violet-200">
                              {listing.popularityScore}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                          <span>{listing.totalLicensesSold} sales</span>
                          <span>{listing.downloadCount} downloads</span>
                          <span>{listing.viewCount} views</span>
                        </div>
                        <Link
                          href={`/post/${listing.nftId}`}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                        >
                          View & License
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                {listings.map((listing) => {
                  const isSaved = savedTokenIds.includes(listing.tokenId)
                  return (
                    <article
                      key={listing._id}
                      className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-4 transition hover:border-cyan-300/40 sm:flex-row sm:items-center"
                    >
                      <img
                        src={resolveMediaUrl(listing.imageURL)}
                        alt={listing.name}
                        className="h-20 w-full rounded-2xl object-cover sm:h-24 sm:w-24"
                        onError={(event) => {
                          event.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="truncate text-lg font-semibold text-white">
                              {listing.name}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                              {listing.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleWishlistToggle(listing)}
                            className="rounded-full border border-white/10 bg-black/25 p-2 text-rose-300"
                          >
                            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                          <span>{listing.category || "General"}</span>
                          <span>#{listing.tokenId}</span>
                          <span>{formatXlm(listing.licenseTypes.personal)}</span>
                        </div>
                      </div>
                      <Link
                        href={`/post/${listing.nftId}`}
                        className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 sm:w-auto"
                      >
                        Open
                      </Link>
                    </article>
                  )
                })}
              </div>
            )
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center">
              <Search className="mx-auto h-10 w-10 text-zinc-600" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                No listings match your filters.
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Try a wider category, lower the price band, or switch back to trending content.
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-semibold">Trending content</h2>
            </div>
            <div className="mt-4 space-y-3">
              {trending.map((item, index) => (
                <Link
                  key={item._id}
                  href={`/post/${item.nftId}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 transition hover:border-cyan-300/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-cyan-200">
                    {index + 1}
                  </div>
                  <img
                    src={resolveMediaUrl(item.imageURL)}
                    alt={item.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{item.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {item.category || "General"} · {item.popularityScore} score
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-cyan-200" />
              <h2 className="text-xl font-semibold">Saved items</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Revisit your wishlist and review what is already saved for licensing or later
              discovery.
            </p>
            <div className="mt-4 space-y-2 text-sm text-zinc-300">
              {savedCount ? (
                <p>
                  {savedCount} saved listing{savedCount === 1 ? "" : "s"} in your current results.
                </p>
              ) : (
                <p>No items saved from the current browse set yet.</p>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-300" />
              <h2 className="text-xl font-semibold">Browse tips</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
              <li>Use the heart button to save promising licenses for later.</li>
              <li>Toggle list view on smaller screens for dense scans.</li>
              <li>Let trending guide you when you want the market pulse first.</li>
            </ul>
          </section>
        </aside>
      </div>
    </FeatureShell>
  )
}
