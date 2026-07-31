"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowUpRight,
  Bell,
  Download,
  Heart,
  LineChart as ChartLineIcon,
  MessageSquare,
  Star,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useAuth } from "@/lib/auth-context"
import { marketplaceApi, type CreatorAnalytics, type MarketplaceHistoryResponse, type NotificationItem } from "@/lib/marketplace"
import { useMarketplaceStore } from "@/lib/marketplace-store"
import { formatDistanceToNow } from "date-fns"
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  XAxis,
  YAxis,
} from "recharts"

export default function DashboardPage() {
  const { address, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [history, setHistory] = useState<MarketplaceHistoryResponse["data"] | null>(null)
  const [loading, setLoading] = useState(true)
  const syncNotifications = useMarketplaceStore((state) => state.syncNotifications)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !address) {
      setLoading(false)
      return
    }

    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("demedia_token")
        const [analyticsResult, notificationsResult, historyResult] = await Promise.all([
          marketplaceApi.creatorAnalytics(token, address),
          marketplaceApi.fetchNotifications(token),
          marketplaceApi.fetchHistory(token),
        ])

        if (!active) return

        setAnalytics(analyticsResult.data)
        setNotifications(notificationsResult.data)
        setHistory(historyResult.data)
        syncNotifications(notificationsResult.data)
      } catch (error) {
        console.error("Failed to load dashboard:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [address, isAuthenticated, isLoading, syncNotifications])

  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

  const summaryCards = useMemo(
    () => [
      { label: "Wallet", value: walletLabel, icon: Wallet },
      { label: "Sales", value: analytics ? analytics.totals.sales.toString() : "0", icon: TrendingUp },
      {
        label: "Revenue",
        value: analytics ? `${analytics.totals.revenue.toFixed(2)} XLM` : "0 XLM",
        icon: ChartLineIcon,
      },
      { label: "Downloads", value: analytics ? analytics.totals.downloads.toString() : "0", icon: Download },
      { label: "Followers", value: analytics ? analytics.totals.followers.toString() : "0", icon: Users },
      { label: "Wishlist", value: analytics ? analytics.totals.wishlistAdds.toString() : "0", icon: Heart },
    ],
    [analytics, walletLabel],
  )

  const chartData = analytics?.series ?? []
  const notificationCount = notifications.length
  return (
    <FeatureShell
      eyebrow="Creator analytics"
      title="Your content business, in real time."
      description="Track sales, revenue, downloads, engagement, saves, followers, reviews, and recent activity from one responsive command center."
      actions={
        <>
          <Link href="/upload" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
            Upload Content
          </Link>
          <Link href="/marketplace" className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white">
            Open Marketplace
          </Link>
        </>
      }
      stats={[
        ["Wallet", walletLabel],
        ["Notifications", `${notificationCount}`],
        ["Engagement", analytics ? `${analytics.averages.engagementScore}` : "0"],
      ]}
    >
      {loading || isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-8 w-32" />
                <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
              </div>
            ))}
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">
          <p className="text-lg font-semibold">Connect your wallet to view analytics.</p>
          <button
            onClick={() => router.push("/auth")}
            className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            Go to sign in
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {summaryCards.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{card.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-3 text-cyan-200">
                    <card.icon className="h-5 w-5" />
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Performance</p>
                  <h2 className="mt-2 text-xl font-semibold">Sales, revenue, downloads, and engagement.</h2>
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="mt-6 h-[320px]">
                <ChartContainer
                  config={{
                    sales: { label: "Sales", color: "#67e8f9" },
                    revenue: { label: "Revenue", color: "#f59e0b" },
                    downloads: { label: "Downloads", color: "#a78bfa" },
                    engagement: { label: "Engagement", color: "#34d399" },
                  }}
                >
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="downloads" stroke="var(--color-downloads)" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="engagement" stroke="var(--color-engagement)" strokeWidth={2.5} dot={false} />
                  </RechartsLineChart>
                </ChartContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-cyan-200" />
                  <h2 className="text-xl font-semibold">Notification Center</h2>
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  {notificationCount ? `${notificationCount} unread or recent updates` : "No notifications yet."}
                </p>
                <div className="mt-4 space-y-3">
                  {notifications.slice(0, 4).map((notification) => (
                    <article
                      key={notification._id}
                      className="rounded-2xl border border-white/10 bg-black/25 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{notification.title}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-400">{notification.message}</p>
                        </div>
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.read ? "bg-white/20" : "bg-emerald-400"}`} />
                      </div>
                    </article>
                  ))}
                  {!notifications.length ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                      Your notification center will populate as your content starts moving.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-amber-200" />
                  <h2 className="text-xl font-semibold">Creator signals</h2>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Average rating</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {analytics ? analytics.averages.rating.toFixed(1) : "0.0"}
                      <Star className="ml-2 inline-block h-4 w-4 text-amber-300" />
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Reviews</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{analytics ? analytics.totals.reviews : 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Tabs defaultValue="top-content" className="gap-5">
            <TabsList className="rounded-full border border-white/10 bg-black/25 p-1">
              <TabsTrigger value="top-content" className="rounded-full px-4">
                Top Content
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-full px-4">
                History
              </TabsTrigger>
              <TabsTrigger value="actions" className="rounded-full px-4">
                Actions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top-content" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {(analytics?.listings ?? []).map((listing) => (
                  <article
                    key={listing._id}
                    className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-[0_20px_70px_rgba(0,0,0,0.22)]"
                  >
                    <div className="h-44 bg-gradient-to-br from-cyan-300/20 via-white/5 to-amber-300/20" />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold">{listing.name}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{listing.description}</p>
                        </div>
                        <Link href={`/post/${listing.nftId}`} className="rounded-full border border-white/10 p-2 text-cyan-200">
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Sales</p>
                          <p className="mt-2 font-semibold">{listing.totalLicensesSold}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Revenue</p>
                          <p className="mt-2 font-semibold">{listing.totalRevenue.toFixed(2)} XLM</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Rating</p>
                          <p className="mt-2 font-semibold">{listing.averageRating.toFixed(1)} / 5</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Popularity</p>
                          <p className="mt-2 font-semibold">{listing.popularityScore}</p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <h3 className="text-lg font-semibold">Purchase history</h3>
                  <div className="mt-4 space-y-3">
                    {history?.purchases.slice(0, 5).map((purchase) => (
                      <div key={purchase._id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{purchase.licenseType} license</p>
                            <p className="mt-1 text-sm text-zinc-400">
                              {purchase.price.toFixed(2)} XLM, {formatDistanceToNow(new Date(purchase.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <p className="text-sm text-zinc-500">{purchase.txHash.slice(0, 10)}...</p>
                        </div>
                      </div>
                    ))}
                    {!history?.purchases.length ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                        No purchases yet.
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
                  <h3 className="text-lg font-semibold">Download history</h3>
                  <div className="mt-4 space-y-3">
                    {history?.downloads.slice(0, 5).map((download) => (
                      <div key={download._id} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                        <p className="font-medium">{download.fileName || `Token #${download.tokenId}`}</p>
                        <p className="mt-1 text-sm text-zinc-400">
                          {download.licenseType || "download"} · {formatDistanceToNow(new Date(download.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                    {!history?.downloads.length ? (
                      <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
                        No downloads yet.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-3">
                <Link href="/marketplace" className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40">
                  <h3 className="text-lg font-semibold">Open marketplace</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Review trending content, saved items, and licensing opportunities.</p>
                </Link>
                <Link href="/upload" className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40">
                  <h3 className="text-lg font-semibold">Publish new media</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Upload fresh work and mint it to the network in one guided flow.</p>
                </Link>
                <Link href="/profile" className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:border-cyan-300/40">
                  <h3 className="text-lg font-semibold">Polish your profile</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">Refresh your creator identity, avatar, bio, and showcase title.</p>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </FeatureShell>
  )
}
