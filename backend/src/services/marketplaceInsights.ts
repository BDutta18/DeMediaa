import type { IListing } from "../models/listing.models"

export type TrendingSignal = "recent-sales" | "engagement" | "rating" | "velocity"

export interface ListingInsight {
  score: number
  signals: TrendingSignal[]
}

export const inferCategory = (name?: string, description?: string, tags?: string[]): string => {
  const haystack = `${name ?? ""} ${description ?? ""} ${(tags ?? []).join(" ")}`.toLowerCase()

  if (/(photo|image|camera|portrait|gallery|visual)/.test(haystack)) return "Photography"
  if (/(audio|music|song|beat|sound)/.test(haystack)) return "Music"
  if (/(video|motion|film|cinema|clip)/.test(haystack)) return "Video"
  if (/(code|template|snippet|tool|software|app)/.test(haystack)) return "Software"
  if (/(article|ebook|writing|text|guide|story)/.test(haystack)) return "Writing"
  if (/(3d|model|asset|render|design)/.test(haystack)) return "Design"

  return "General"
}

export const scoreListing = (
  listing: Pick<
    IListing,
    | "totalLicensesSold"
    | "totalRevenue"
    | "viewCount"
    | "downloadCount"
    | "averageRating"
    | "ratingCount"
    | "createdAt"
  >,
): ListingInsight => {
  const salesScore = listing.totalLicensesSold * 18
  const revenueScore = listing.totalRevenue * 2
  const engagementScore = (listing.viewCount + listing.downloadCount * 2) * 0.8
  const ratingScore = listing.averageRating * Math.min(listing.ratingCount, 10) * 4
  const ageBoost = Math.max(
    0,
    30 - Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / 86_400_000),
  )

  const signals: TrendingSignal[] = []

  if (listing.totalLicensesSold > 3) signals.push("recent-sales")
  if (listing.viewCount + listing.downloadCount > 25) signals.push("engagement")
  if (listing.averageRating >= 4) signals.push("rating")
  if (ageBoost > 0 && listing.totalLicensesSold > 0) signals.push("velocity")

  return {
    score: Math.round(salesScore + revenueScore + engagementScore + ratingScore + ageBoost),
    signals,
  }
}

export const sortByPopularity = <
  T extends { popularityScore?: number; totalLicensesSold?: number; totalRevenue?: number },
>(
  items: T[],
): T[] => {
  return [...items].sort((left, right) => {
    const leftScore =
      left.popularityScore ?? (left.totalLicensesSold ?? 0) * 15 + (left.totalRevenue ?? 0) * 2
    const rightScore =
      right.popularityScore ?? (right.totalLicensesSold ?? 0) * 15 + (right.totalRevenue ?? 0) * 2

    return rightScore - leftScore
  })
}
