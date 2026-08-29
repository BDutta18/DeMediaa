"use client"

export type LicenseType = "personal" | "commercial" | "exclusive"
export type MarketplaceSortMode =
  "trending" | "popular" | "newest" | "price-asc" | "price-desc" | "rating"

export interface MarketplaceListing {
  _id: string
  nftId: string
  tokenId: string
  creator: string
  name: string
  description: string
  category?: string
  tags?: string[]
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
  viewCount: number
  downloadCount: number
  averageRating: number
  ratingCount: number
  popularityScore: number
  createdAt: string
  updatedAt: string
  trendingScore?: number
  trendingSignals?: string[]
  searchScore?: number
}

export interface WishlistItem {
  _id: string
  userAddress: string
  nftId: string
  tokenId: string
  creator: string
  name: string
  imageURL: string
  priceSnapshot: number
  createdAt: string
  updatedAt: string
}

export interface FollowItem {
  _id: string
  followerAddress: string
  creatorAddress: string
  creatorName?: string
  creatorAvatar?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewItem {
  _id: string
  nftId: string
  tokenId: string
  creator: string
  reviewerAddress: string
  rating: number
  title: string
  body: string
  helpfulCount: number
  status: "published" | "flagged" | "hidden"
  createdAt: string
  updatedAt: string
}

export interface NotificationItem {
  _id: string
  recipientAddress: string
  actorAddress?: string
  type: "sale" | "purchase" | "review" | "follow" | "wishlist" | "download" | "system"
  title: string
  message: string
  href?: string
  read: boolean
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface PurchaseHistoryItem {
  _id: string
  listingId: string
  nftId: string
  tokenId: string
  creator: string
  buyer: string
  contentHash: string
  licenseType: LicenseType
  price: number
  royaltyBps: number
  royaltyAmount: number
  currency: string
  txHash: string
  status: "active" | "revoked" | "expired"
  createdAt: string
  updatedAt: string
}

export interface DownloadHistoryItem {
  _id: string
  userAddress: string
  nftId: string
  tokenId: string
  creatorAddress: string
  licenseType?: LicenseType
  source: "purchase" | "download"
  fileName?: string
  downloadUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreatorAnalytics {
  creatorAddress: string
  totals: {
    sales: number
    revenue: number
    royalties: number
    downloads: number
    wishlistAdds: number
    followers: number
    following: number
    reviews: number
  }
  averages: {
    rating: number
    engagementScore: number
  }
  listings: MarketplaceListing[]
  series: Array<{
    date: string
    sales: number
    revenue: number
    downloads: number
    engagement: number
  }>
}

export interface MarketplaceSearchResponse {
  success: boolean
  data: MarketplaceListing[]
  filters?: {
    category?: string
    sort?: MarketplaceSortMode
    limit?: number
  }
}

export interface MarketplaceHistoryResponse {
  success: boolean
  data: {
    purchases: PurchaseHistoryItem[]
    downloads: DownloadHistoryItem[]
    shares: Array<Record<string, unknown>>
    views: Array<Record<string, unknown>>
  }
}

const MARKETPLACE_BASE = "/api/marketplace"

const readToken = () => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("demedia_token")
}

const buildHeaders = (token?: string | null) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  const authToken = token ?? readToken()
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`
  }

  return headers
}

const requestJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${MARKETPLACE_BASE}${path}`, {
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  })

  const data = await response.json()
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || "Marketplace request failed")
  }
  return data as T
}

export const marketplaceApi = {
  search: async (
    params: URLSearchParams | Record<string, string | number | boolean | undefined>,
  ) => {
    const query = params instanceof URLSearchParams ? params : new URLSearchParams()
    if (!(params instanceof URLSearchParams)) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return
        query.set(key, String(value))
      })
    }

    return requestJson<MarketplaceSearchResponse>(`/search?${query.toString()}`)
  },
  trending: async (params?: Record<string, string | number | undefined>) => {
    const query = new URLSearchParams()
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value === undefined || value === "") return
      query.set(key, String(value))
    })

    return requestJson<{ success: boolean; data: MarketplaceListing[] }>(
      `/trending?${query.toString()}`,
    )
  },
  creatorAnalytics: async (token?: string | null, address?: string) => {
    const query = new URLSearchParams()
    if (address) query.set("address", address)

    const response = await fetch(`${MARKETPLACE_BASE}/analytics/creator?${query.toString()}`, {
      cache: "no-store",
      headers: buildHeaders(token),
    })
    const data = await response.json()
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Failed to fetch creator analytics")
    }
    return data as { success: boolean; data: CreatorAnalytics }
  },
  fetchWishlist: async (token?: string | null) => {
    const response = await fetch(`${MARKETPLACE_BASE}/wishlist`, {
      cache: "no-store",
      headers: buildHeaders(token),
    })
    const data = await response.json()
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Failed to fetch wishlist")
    }
    return data as { success: boolean; data: WishlistItem[] }
  },
  saveWishlist: async (
    payload: Pick<WishlistItem, "nftId" | "tokenId" | "creator" | "name" | "imageURL"> & {
      priceSnapshot?: number
    },
    token?: string | null,
  ) => {
    return requestJson<{ success: boolean; data: WishlistItem }>("/wishlist", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    })
  },
  removeWishlist: async (tokenId: string, token?: string | null) => {
    return requestJson<{ success: boolean; deleted: boolean }>(
      `/wishlist/${encodeURIComponent(tokenId)}`,
      {
        method: "DELETE",
        headers: buildHeaders(token),
      },
    )
  },
  fetchFollows: async (token?: string | null) => {
    const response = await fetch(`${MARKETPLACE_BASE}/follows`, {
      cache: "no-store",
      headers: buildHeaders(token),
    })
    const data = await response.json()
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Failed to fetch follows")
    }
    return data as { success: boolean; data: { following: FollowItem[]; followers: FollowItem[] } }
  },
  followCreator: async (
    payload: Pick<FollowItem, "creatorAddress"> & Pick<FollowItem, "creatorName" | "creatorAvatar">,
    token?: string | null,
  ) => {
    return requestJson<{ success: boolean; data: FollowItem }>("/follows", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    })
  },
  unfollowCreator: async (creatorAddress: string, token?: string | null) => {
    return requestJson<{ success: boolean; deleted: boolean }>(
      `/follows/${encodeURIComponent(creatorAddress)}`,
      {
        method: "DELETE",
        headers: buildHeaders(token),
      },
    )
  },
  fetchReviews: async (tokenId: string) => {
    return requestJson<{ success: boolean; data: ReviewItem[] }>(
      `/reviews/${encodeURIComponent(tokenId)}`,
    )
  },
  saveReview: async (
    payload: Pick<ReviewItem, "nftId" | "tokenId" | "creator" | "rating" | "title" | "body">,
    token?: string | null,
  ) => {
    return requestJson<{ success: boolean; data: ReviewItem }>("/reviews", {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    })
  },
  markReviewHelpful: async (reviewId: string, token?: string | null) => {
    return requestJson<{ success: boolean; data: ReviewItem }>(
      `/reviews/${encodeURIComponent(reviewId)}/helpful`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
      },
    )
  },
  fetchNotifications: async (token?: string | null) => {
    const response = await fetch(`${MARKETPLACE_BASE}/notifications`, {
      cache: "no-store",
      headers: buildHeaders(token),
    })
    const data = await response.json()
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Failed to fetch notifications")
    }
    return data as { success: boolean; data: NotificationItem[]; unreadCount: number }
  },
  markNotificationRead: async (notificationId: string, token?: string | null) => {
    return requestJson<{ success: boolean; data: NotificationItem }>(
      `/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "PATCH",
        headers: buildHeaders(token),
      },
    )
  },
  markAllNotificationsRead: async (token?: string | null) => {
    return requestJson<{ success: boolean }>("/notifications/read-all", {
      method: "PATCH",
      headers: buildHeaders(token),
    })
  },
  fetchHistory: async (token?: string | null) => {
    const response = await fetch(`${MARKETPLACE_BASE}/history`, {
      cache: "no-store",
      headers: buildHeaders(token),
    })
    const data = await response.json()
    if (!response.ok || data?.success === false) {
      throw new Error(data?.message || "Failed to fetch history")
    }
    return data as MarketplaceHistoryResponse
  },
  logView: async (tokenId: string, viewerAddress?: string) => {
    return requestJson<{ success: boolean; data: { viewCount: number } }>(
      `/content/${encodeURIComponent(tokenId)}/view`,
      {
        method: "POST",
        body: JSON.stringify(viewerAddress ? { address: viewerAddress } : {}),
      },
    )
  },
  logDownload: async (
    tokenId: string,
    payload: { licenseType?: LicenseType; downloadUrl?: string; fileName?: string },
    token?: string | null,
  ) => {
    return requestJson<{ success: boolean; data: DownloadHistoryItem }>(
      `/content/${encodeURIComponent(tokenId)}/download`,
      {
        method: "POST",
        headers: buildHeaders(token),
        body: JSON.stringify(payload),
      },
    )
  },
  logShare: async (
    tokenId: string,
    payload: { creatorAddress?: string; href?: string },
    token?: string | null,
  ) => {
    return requestJson<{ success: boolean }>(`/content/${encodeURIComponent(tokenId)}/share`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(payload),
    })
  },
}
