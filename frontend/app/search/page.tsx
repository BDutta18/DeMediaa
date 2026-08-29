"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Filter,
  Heart,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { resolveMediaUrl } from "@/lib/media"
import {
  marketplaceApi,
  type MarketplaceListing,
  type MarketplaceSortMode,
} from "@/lib/marketplace"

interface UserResult {
  _id: string
  address: string
  name: string
  avatar: string
  bio: string
}

const DEFAULT_CATEGORIES = ["all", "Photography", "Music", "Video", "Software", "Design", "Writing"]

const searchHighlights = [
  { icon: Users, title: "Creator profiles", text: "Find people behind published work." },
  {
    icon: Sparkles,
    title: "Verified identity",
    text: "Wallet-first discovery with clean profile signals.",
  },
  {
    icon: TrendingUp,
    title: "Popularity filters",
    text: "Surface content that is actually moving.",
  },
]

const formatXlm = (value: number) => `${value.toFixed(2)} XLM`

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState<MarketplaceSortMode>("trending")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [contentResults, setContentResults] = useState<MarketplaceListing[]>([])
  const [creatorResults, setCreatorResults] = useState<UserResult[]>([])
  const [trendingResults, setTrendingResults] = useState<MarketplaceListing[]>([])
  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORIES)
  const [loadingContent, setLoadingContent] = useState(true)
  const [loadingCreators, setLoadingCreators] = useState(false)

  useEffect(() => {
    let active = true

    const loadFilters = async () => {
      try {
        const response = await fetch("/api/marketplace/suggestions", { cache: "no-store" })
        const data = await response.json()
        if (!active || !data?.success) return

        const categories = Array.isArray(data.data?.categories)
          ? data.data.categories.filter(Boolean)
          : []
        setCategoryOptions(Array.from(new Set([...DEFAULT_CATEGORIES, ...categories])))
      } catch {
        // Keep the static defaults when suggestions fail.
      }
    }

    loadFilters()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadTrending = async () => {
      try {
        const response = await marketplaceApi.trending({
          category: category === "all" ? undefined : category,
          limit: 6,
        })
        if (active) setTrendingResults(response.data)
      } catch (error) {
        console.error("Failed to load trending content:", error)
      }
    }

    loadTrending()

    return () => {
      active = false
    }
  }, [category])

  useEffect(() => {
    let active = true
    setLoadingContent(true)

    const debounce = setTimeout(async () => {
      try {
        const response = await marketplaceApi.search({
          q: query,
          category,
          sort,
          minPrice,
          maxPrice,
          limit: 24,
        })

        if (!active) return
        setContentResults(response.data)
      } catch (error) {
        console.error("Failed to search content:", error)
        if (active) setContentResults([])
      } finally {
        if (active) setLoadingContent(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(debounce)
    }
  }, [query, category, sort, minPrice, maxPrice])

  useEffect(() => {
    let active = true

    const debounce = setTimeout(async () => {
      if (!query.trim()) {
        setCreatorResults([])
        setLoadingCreators(false)
        return
      }

      setLoadingCreators(true)
      try {
        const response = await fetch(`/api/user/search?name=${encodeURIComponent(query)}`, {
          cache: "no-store",
        })
        const data = await response.json()
        if (!active || !data?.success) return
        setCreatorResults(Array.isArray(data.data) ? data.data : [])
      } catch (error) {
        console.error("Failed to search creators:", error)
        if (active) setCreatorResults([])
      } finally {
        if (active) setLoadingCreators(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(debounce)
    }
  }, [query])

  const contentCount = contentResults.length
  const creatorsCount = creatorResults.length

  const resetFilters = () => {
    setQuery("")
    setCategory("all")
    setSort("trending")
    setMinPrice("")
    setMaxPrice("")
  }

  const filterSummary = useMemo(() => {
    const parts = [category !== "all" ? category : "All categories", sort.replace("-", " ")]
    if (minPrice || maxPrice) {
      parts.push(`${minPrice || "0"}-${maxPrice || "∞"} XLM`)
    }
    return parts.join(" · ")
  }, [category, sort, minPrice, maxPrice])

  return (
    <FeatureShell
      eyebrow="Marketplace search"
      title="Find content, creators, and trends faster."
      description="Search across content by category, price, and popularity while still discovering the creators behind the work."
      stats={[
        ["Results", `${contentCount}`],
        ["Creators", `${creatorsCount}`],
        ["Mode", filterSummary],
      ]}
      actions={
        <button
          onClick={resetFilters}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Filter className="h-4 w-4" />
          Reset filters
        </button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-200" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search content, creators, and tags..."
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/25 pl-11 pr-12 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-300/50"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 p-1.5 text-zinc-400 transition hover:border-cyan-300/50 hover:text-white"
                    aria-label="Clear query"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[360px]">
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none"
                >
                  {categoryOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
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

                <button
                  onClick={resetFilters}
                  className="h-12 rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white transition hover:border-cyan-300/40"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Min price</span>
                <input
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0.0"
                  className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">Max price</span>
                <input
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="100.0"
                  className="h-11 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm text-white outline-none placeholder:text-zinc-500"
                />
              </label>
            </div>
          </section>

          <Tabs defaultValue="content" className="gap-4">
            <TabsList className="rounded-full border border-white/10 bg-black/25 p-1">
              <TabsTrigger value="content" className="rounded-full px-4">
                Content
              </TabsTrigger>
              <TabsTrigger value="creators" className="rounded-full px-4">
                Creators
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              {loadingContent ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"
                    >
                      <Skeleton className="h-48 w-full rounded-2xl" />
                      <Skeleton className="mt-4 h-5 w-2/3" />
                      <Skeleton className="mt-3 h-4 w-full" />
                      <Skeleton className="mt-2 h-4 w-5/6" />
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <Skeleton className="h-9 rounded-xl" />
                        <Skeleton className="h-9 rounded-xl" />
                        <Skeleton className="h-9 rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : contentResults.length ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {contentResults.map((listing) => (
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
                        <div className="absolute left-3 top-3 flex gap-2">
                          <span className="rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                            {listing.category || "General"}
                          </span>
                          {listing.popularityScore > 0 ? (
                            <span className="rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-semibold text-white">
                              Popular
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-semibold text-white">
                              {listing.name}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                              {listing.description}
                            </p>
                          </div>
                          <button
                            className="rounded-full border border-white/10 bg-black/25 p-2 text-rose-300 transition hover:border-rose-300/50"
                            aria-label={`Save ${listing.name} to wishlist`}
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(listing.tags ?? []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-zinc-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Personal</p>
                            <p className="mt-1 font-semibold text-cyan-200">
                              {formatXlm(listing.licenseTypes.personal)}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Rating</p>
                            <p className="mt-1 font-semibold text-amber-200">
                              {listing.averageRating.toFixed(1)}{" "}
                              <Star className="inline-block h-3.5 w-3.5" />
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/25 px-3 py-2">
                            <p className="text-zinc-500">Popularity</p>
                            <p className="mt-1 font-semibold text-violet-200">
                              {listing.popularityScore}
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 flex items-center justify-between gap-3 text-xs text-zinc-500">
                          <span>Sold {listing.totalLicensesSold}</span>
                          <span>{listing.downloadCount} downloads</span>
                          <span>{listing.viewCount} views</span>
                        </div>

                        <Link
                          href={`/post/${listing.nftId}`}
                          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                        >
                          View details
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center">
                  <Search className="mx-auto h-10 w-10 text-zinc-600" />
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    No content matched those filters.
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Try a broader category, lower the price range, or switch to trending to
                    resurface popular drops.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="creators" className="mt-4">
              {loadingCreators ? (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="rounded-3xl border border-white/10 bg-white/[0.05] p-4"
                    >
                      <Skeleton className="h-5 w-1/2" />
                      <Skeleton className="mt-3 h-4 w-2/3" />
                      <Skeleton className="mt-3 h-4 w-full" />
                    </div>
                  ))}
                </div>
              ) : creatorResults.length ? (
                <div className="grid gap-4">
                  {creatorResults.map((user) => (
                    <article
                      key={user._id}
                      className="flex cursor-pointer items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.05] p-4 transition hover:-translate-y-1 hover:border-cyan-300/40"
                      onClick={() => router.push(`/profile/${user.address}`)}
                    >
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                        {user.avatar ? (
                          <img
                            src={resolveMediaUrl(user.avatar)}
                            alt={user.name || "Creator avatar"}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = "/placeholder-user.jpg"
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Users className="h-6 w-6 text-zinc-500" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-white">
                          {user.name || "Unnamed creator"}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-zinc-500">
                          {user.address.slice(0, 8)}...{user.address.slice(-6)}
                        </p>
                        {user.bio ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                            {user.bio}
                          </p>
                        ) : null}
                      </div>
                      <Link
                        href={`/profile/${user.address}`}
                        className="rounded-full border border-white/10 bg-black/25 p-3 text-cyan-200 transition hover:border-cyan-300/40"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </article>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
                  No creators matched "{query}".
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center text-zinc-400">
                  Start typing a creator name to search the wallet network.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-semibold">Trending now</h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Ranked by sales velocity, engagement, ratings, and recency.
            </p>
            <div className="mt-4 space-y-3">
              {trendingResults.map((listing, index) => (
                <Link
                  href={`/post/${listing.nftId}`}
                  key={listing._id}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/25 p-3 transition hover:border-cyan-300/40"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-sm font-semibold text-cyan-200">
                    {index + 1}
                  </div>
                  <img
                    src={resolveMediaUrl(listing.imageURL)}
                    alt={listing.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{listing.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {listing.category || "General"} · {listing.popularityScore} score
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-amber-300" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-cyan-200" />
              <h2 className="text-xl font-semibold">Quick filters</h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  onClick={() => setCategory(item)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    category === item
                      ? "border-cyan-300/60 bg-cyan-300/10 text-cyan-100"
                      : "border-white/10 bg-black/25 text-zinc-300 hover:border-cyan-300/40"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-violet-200" />
              <h2 className="text-xl font-semibold">Discovery tips</h2>
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-400">
              <li>Use popularity sorting to surface content with real demand.</li>
              <li>Lower the max price filter to find budget-friendly licenses fast.</li>
              <li>Switch to creators tab to discover who is building momentum right now.</li>
            </ul>
          </section>
        </aside>
      </div>
    </FeatureShell>
  )
}
