"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DownloadHistoryItem, NotificationItem, PurchaseHistoryItem } from "@/lib/marketplace"

type MarketplaceStore = {
  wishlistTokenIds: string[]
  followedCreators: string[]
  notifications: NotificationItem[]
  recentPurchases: PurchaseHistoryItem[]
  recentDownloads: DownloadHistoryItem[]
  unreadNotifications: number
  syncWishlist: (tokenIds: string[]) => void
  toggleWishlistToken: (tokenId: string) => void
  syncFollows: (creatorAddresses: string[]) => void
  toggleFollowCreator: (creatorAddress: string) => void
  syncNotifications: (notifications: NotificationItem[]) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  addPurchase: (purchase: PurchaseHistoryItem) => void
  addDownload: (download: DownloadHistoryItem) => void
  clearHistory: () => void
}

const dedupe = (values: string[]) => Array.from(new Set(values))

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      wishlistTokenIds: [],
      followedCreators: [],
      notifications: [],
      recentPurchases: [],
      recentDownloads: [],
      unreadNotifications: 0,
      syncWishlist: (tokenIds) => set({ wishlistTokenIds: dedupe(tokenIds) }),
      toggleWishlistToken: (tokenId) =>
        set((state) => {
          const exists = state.wishlistTokenIds.includes(tokenId)
          return {
            wishlistTokenIds: exists
              ? state.wishlistTokenIds.filter((item) => item !== tokenId)
              : [...state.wishlistTokenIds, tokenId],
          }
        }),
      syncFollows: (creatorAddresses) => set({ followedCreators: dedupe(creatorAddresses) }),
      toggleFollowCreator: (creatorAddress) =>
        set((state) => {
          const exists = state.followedCreators.includes(creatorAddress)
          return {
            followedCreators: exists
              ? state.followedCreators.filter((item) => item !== creatorAddress)
              : [...state.followedCreators, creatorAddress],
          }
        }),
      syncNotifications: (notifications) =>
        set({
          notifications,
          unreadNotifications: notifications.filter((notification) => !notification.read).length,
        }),
      markNotificationRead: (notificationId) =>
        set((state) => {
          const next = state.notifications.map((notification) =>
            notification._id === notificationId ? { ...notification, read: true } : notification,
          )
          return {
            notifications: next,
            unreadNotifications: next.filter((notification) => !notification.read).length,
          }
        }),
      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
          unreadNotifications: 0,
        })),
      addPurchase: (purchase) =>
        set((state) => ({
          recentPurchases: [purchase, ...state.recentPurchases].slice(0, 30),
        })),
      addDownload: (download) =>
        set((state) => ({
          recentDownloads: [download, ...state.recentDownloads].slice(0, 30),
        })),
      clearHistory: () =>
        set({
          recentPurchases: [],
          recentDownloads: [],
        }),
    }),
    {
      name: "demedia-marketplace-state",
      partialize: (state) => ({
        wishlistTokenIds: state.wishlistTokenIds,
        followedCreators: state.followedCreators,
        notifications: state.notifications,
        recentPurchases: state.recentPurchases,
        recentDownloads: state.recentDownloads,
        unreadNotifications: state.unreadNotifications,
      }),
    },
  ),
)

export const getNotificationPreview = (notification: NotificationItem) => {
  return `${notification.title} - ${notification.message}`
}
