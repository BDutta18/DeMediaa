"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, ExternalLink, Filter, Sparkles } from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { marketplaceApi, type NotificationItem } from "@/lib/marketplace"
import { useMarketplaceStore } from "@/lib/marketplace-store"
import { useAuth } from "@/lib/auth-context"

const notificationTone: Record<NotificationItem["type"], string> = {
  sale: "text-emerald-300",
  purchase: "text-cyan-300",
  review: "text-amber-300",
  follow: "text-violet-300",
  wishlist: "text-rose-300",
  download: "text-sky-300",
  system: "text-zinc-300",
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const syncNotifications = useMarketplaceStore((state) => state.syncNotifications)
  const markReadLocal = useMarketplaceStore((state) => state.markNotificationRead)
  const markAllReadLocal = useMarketplaceStore((state) => state.markAllNotificationsRead)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [onlyUnread, setOnlyUnread] = useState(false)

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      setLoading(false)
      return
    }

    let active = true

    const loadNotifications = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("demedia_token")
        const response = await marketplaceApi.fetchNotifications(token)
        if (!active) return
        setNotifications(response.data)
        syncNotifications(response.data)
      } catch (error) {
        console.error("Failed to load notifications:", error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadNotifications()
    const interval = window.setInterval(loadNotifications, 20_000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [isAuthenticated, isLoading, syncNotifications])

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  )

  const visibleNotifications = useMemo(
    () => (onlyUnread ? notifications.filter((notification) => !notification.read) : notifications),
    [notifications, onlyUnread],
  )

  const handleMarkRead = async (notification: NotificationItem) => {
    const token = localStorage.getItem("demedia_token")
    try {
      await marketplaceApi.markNotificationRead(notification._id, token)
      setNotifications((current) =>
        current.map((item) => (item._id === notification._id ? { ...item, read: true } : item)),
      )
      markReadLocal(notification._id)
    } catch (error) {
      console.error("Failed to mark notification read:", error)
    }
  }

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("demedia_token")
    try {
      await marketplaceApi.markAllNotificationsRead(token)
      setNotifications((current) => current.map((item) => ({ ...item, read: true })))
      markAllReadLocal()
    } catch (error) {
      console.error("Failed to mark all notifications read:", error)
    }
  }

  return (
    <FeatureShell
      eyebrow="Notification center"
      title="Watch your marketplace update in near real time."
      description="Track follows, reviews, saves, downloads, and system events in one focused stream."
      stats={[
        ["Unread", `${unreadCount}`],
        ["Total", `${notifications.length}`],
        ["Live", "Auto refresh every 20s"],
      ]}
      actions={
        <>
          <button
            onClick={() => setOnlyUnread((value) => !value)}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
          >
            <Filter className="h-4 w-4" />
            {onlyUnread ? "Show all" : "Show unread"}
          </button>
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </>
      }
    >
      {loading || isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-6 w-2/3" />
              <Skeleton className="mt-3 h-4 w-full" />
            </div>
          ))}
        </div>
      ) : !isAuthenticated ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">
          <p className="text-lg font-semibold">Connect your wallet to unlock notifications.</p>
          <Link href="/auth" className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
            Connect wallet
          </Link>
        </div>
      ) : (
        <Tabs defaultValue="all" className="gap-4">
          <TabsList className="rounded-full border border-white/10 bg-black/25 p-1">
            <TabsTrigger value="all" className="rounded-full px-4">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="rounded-full px-4">
              Unread only
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <div className="space-y-3">
              {visibleNotifications.length ? (
                visibleNotifications.map((notification) => (
                  <article
                    key={notification._id}
                    className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Bell className={`h-4 w-4 ${notificationTone[notification.type]}`} />
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{notification.type}</p>
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-white">{notification.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-400">{notification.message}</p>
                        <p className="mt-3 text-xs text-zinc-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${notification.read ? "bg-white/20" : "bg-emerald-400"}`} />
                        {notification.href ? (
                          <Link
                            href={notification.href}
                            onClick={() => handleMarkRead(notification)}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-cyan-100"
                          >
                            Open
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-zinc-600" />
                  <h3 className="mt-4 text-xl font-semibold text-white">No notifications yet.</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Saves, follows, reviews, and downloads will appear here automatically.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="mt-4">
            <div className="space-y-3">
              {visibleNotifications.filter((notification) => !notification.read).length ? (
                visibleNotifications
                  .filter((notification) => !notification.read)
                  .map((notification) => (
                    <article
                      key={notification._id}
                      className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm uppercase tracking-[0.18em] text-zinc-500">{notification.type}</p>
                          <h3 className="mt-3 text-lg font-semibold text-white">{notification.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">{notification.message}</p>
                        </div>
                        <button
                          onClick={() => handleMarkRead(notification)}
                          className="rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-semibold text-cyan-100"
                        >
                          Mark read
                        </button>
                      </div>
                    </article>
                  ))
              ) : (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.04] p-10 text-center">
                  <Sparkles className="mx-auto h-10 w-10 text-zinc-600" />
                  <h3 className="mt-4 text-xl font-semibold text-white">No unread notifications.</h3>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </FeatureShell>
  )
}
