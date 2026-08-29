"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  BookmarkCheck,
  Check,
  Download,
  ExternalLink,
  MessageSquare,
  Shield,
  Share2,
  Star,
  UserPlus,
  FileKey2,
} from "lucide-react"
import { mapWalletError } from "@/lib/errors"
import { cacheGet, cacheSet } from "@/lib/cache"
import { resolveMediaUrl } from "@/lib/media"
import { getNetworkConfig, useNetworkStore } from "@/lib/network-store"
import { marketplaceApi, type ReviewItem } from "@/lib/marketplace"
import { useMarketplaceStore } from "@/lib/marketplace-store"
import { CopyrightBadge } from "@/components/copyright-badge"

interface NFT {
  _id: string
  owner: string
  author?: string
  name: string
  description: string
  imageURL: string
  metadataURL: string
  ipfsHash: string
  tokenId: string
  txHash: string
  createdAt: string
  price: number
  forSale: boolean
  registryTxHash?: string
  contentId?: string
  artistName?: string
}

interface LicenseType {
  id: string
  name: string
  description: string
  priceMultiplier: number
  rights: string[]
}

const LICENSE_TYPES: LicenseType[] = [
  {
    id: "personal",
    name: "Personal License",
    description: "For personal, non-commercial use only.",
    priceMultiplier: 1,
    rights: ["Personal viewing", "Non-commercial display", "Single device"],
  },
  {
    id: "commercial",
    name: "Commercial License",
    description: "For commercial use in projects and products.",
    priceMultiplier: 3,
    rights: ["Commercial use", "Modification rights", "Up to 1000 copies", "Brand integration"],
  },
  {
    id: "exclusive",
    name: "Exclusive License",
    description: "Full exclusive rights to the content.",
    priceMultiplier: 10,
    rights: [
      "Exclusive ownership",
      "Unlimited commercial use",
      "Full modification",
      "Sublicensing",
      "DRM removal",
    ],
  },
]

export default function PostDetail({ postId }: { postId: string }) {
  const [nft, setNft] = useState<NFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<"idle" | "pending" | "success" | "fail">(
    "idle",
  )
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "pending" | "success" | "fail">(
    "idle",
  )
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedLicense, setSelectedLicense] = useState<string>("personal")
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState("")
  const [reviewBody, setReviewBody] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [engagementMessage, setEngagementMessage] = useState<string | null>(null)
  const router = useRouter()
  const network = useNetworkStore((state) => state.network)
  const networkConfig = getNetworkConfig(network)
  const wishlistTokenIds = useMarketplaceStore((state) => state.wishlistTokenIds)
  const followedCreators = useMarketplaceStore((state) => state.followedCreators)
  const toggleWishlistToken = useMarketplaceStore((state) => state.toggleWishlistToken)
  const toggleFollowCreator = useMarketplaceStore((state) => state.toggleFollowCreator)
  const syncWishlist = useMarketplaceStore((state) => state.syncWishlist)
  const syncFollows = useMarketplaceStore((state) => state.syncFollows)

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        const cached = cacheGet<NFT>(`demedia_cache_nft_${postId}`)
        if (cached) {
          setNft(cached)
          setLoading(false)
        }

        const response = await fetch("/api/nfts/all")
        const data = await response.json()

        if (data.success) {
          const found = data.data.find((item: NFT) => item._id === postId)

          if (found) {
            const creatorAddress = found.author || found.owner
            const profileResponse = await fetch(`/api/user/profile/${creatorAddress}`)
            const profileData = await profileResponse.json()

            const enriched = {
              ...found,
              artistName:
                profileData.success && profileData.user?.name
                  ? profileData.user.name
                  : `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`,
            }

            setNft(enriched)
            cacheSet(`demedia_cache_nft_${postId}`, enriched, 60_000)
          }
        }
      } catch (error) {
        console.error("Failed to fetch NFT:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [postId])

  useEffect(() => {
    const loadEngagement = async () => {
      try {
        const reviewResponse = await marketplaceApi.fetchReviews(postId)
        setReviews(reviewResponse.data)

        const token = localStorage.getItem("demedia_token")
        if (token && nft?.tokenId) {
          const [wishlistResponse, followResponse] = await Promise.all([
            marketplaceApi.fetchWishlist(token),
            marketplaceApi.fetchFollows(token),
          ])

          syncWishlist(wishlistResponse.data.map((item) => item.tokenId))
          syncFollows(followResponse.data.following.map((item) => item.creatorAddress))
        }

        if (nft?.tokenId) {
          await marketplaceApi.logView(
            nft.tokenId,
            localStorage.getItem("demedia_address") || undefined,
          )
        }
      } catch (error) {
        console.error("Failed to load engagement state:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (nft) {
      loadEngagement()
    }
  }, [nft, postId, syncFollows, syncWishlist])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sharePost = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft?.name,
          text: nft?.description,
          url,
        })
      } catch {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const toggleWishlist = async () => {
    if (!nft) return

    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setEngagementMessage("Sign in to save this content to your wishlist.")
      return
    }

    try {
      if (isWishlisted) {
        await marketplaceApi.removeWishlist(nft.tokenId, token)
        toggleWishlistToken(nft.tokenId)
        setEngagementMessage("Removed from your wishlist.")
      } else {
        await marketplaceApi.saveWishlist(
          {
            nftId: nft._id,
            tokenId: nft.tokenId,
            creator: creatorAddress || nft.owner,
            name: nft.name,
            imageURL: nft.imageURL,
            priceSnapshot: nft.price,
          },
          token,
        )
        toggleWishlistToken(nft.tokenId)
        setEngagementMessage("Saved to your wishlist.")
      }
    } catch (error) {
      setEngagementMessage(error instanceof Error ? error.message : "Wishlist update failed.")
    }
  }

  const toggleFollow = async () => {
    if (!nft || !creatorAddress) return

    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setEngagementMessage("Sign in to follow creators.")
      return
    }

    try {
      if (isFollowingCreator) {
        await marketplaceApi.unfollowCreator(creatorAddress, token)
        toggleFollowCreator(creatorAddress.toLowerCase())
        setEngagementMessage("Unfollowed creator.")
      } else {
        await marketplaceApi.followCreator(
          {
            creatorAddress,
            creatorName: nft.artistName,
          },
          token,
        )
        toggleFollowCreator(creatorAddress.toLowerCase())
        setEngagementMessage("Now following this creator.")
      }
    } catch (error) {
      setEngagementMessage(error instanceof Error ? error.message : "Follow action failed.")
    }
  }

  const submitReview = async () => {
    if (!nft || !creatorAddress) return

    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setEngagementMessage("Sign in to leave a review.")
      return
    }

    if (!reviewTitle.trim() || !reviewBody.trim()) {
      setEngagementMessage("Add a title and short review before submitting.")
      return
    }

    setReviewSubmitting(true)
    try {
      const response = await marketplaceApi.saveReview(
        {
          nftId: nft._id,
          tokenId: nft.tokenId,
          creator: creatorAddress,
          rating: reviewRating,
          title: reviewTitle.trim(),
          body: reviewBody.trim(),
        },
        token,
      )

      setReviews((current) => {
        const next = current.filter(
          (item) => item.reviewerAddress !== response.data.reviewerAddress,
        )
        return [response.data, ...next]
      })
      setReviewTitle("")
      setReviewBody("")
      setReviewRating(5)
      setEngagementMessage("Your review is now live.")
    } catch (error) {
      setEngagementMessage(error instanceof Error ? error.message : "Review submission failed.")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const recordDownload = async () => {
    if (!nft || !creatorAddress) return

    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setDownloadStatus("fail")
      setDownloadMessage("Sign in to save a download record.")
      return
    }

    setDownloadStatus("pending")
    setDownloadMessage("Recording your download and opening the asset...")

    try {
      await marketplaceApi.logDownload(
        nft.tokenId,
        {
          licenseType: selectedLicense as "personal" | "commercial" | "exclusive",
          fileName: nft.name,
          downloadUrl: resolveMediaUrl(nft.imageURL),
        },
        token,
      )

      setDownloadStatus("success")
      setDownloadMessage("Download recorded successfully.")
      window.open(resolveMediaUrl(nft.imageURL), "_blank", "noopener,noreferrer")
    } catch (error) {
      setDownloadStatus("fail")
      setDownloadMessage(error instanceof Error ? error.message : "Download record failed.")
    }
  }

  const priceInXLM = useMemo(() => {
    if (!nft) return "0"
    const base = nft.price > 0 ? nft.price : 0
    const licenseType = LICENSE_TYPES.find((l) => l.id === selectedLicense)
    const multiplier = licenseType?.priceMultiplier ?? 1
    return (base * multiplier).toFixed(2)
  }, [nft, selectedLicense])

  const licenseInfo = useMemo(() => {
    return LICENSE_TYPES.find((l) => l.id === selectedLicense) ?? LICENSE_TYPES[0]
  }, [selectedLicense])

  const creatorAddress = useMemo(() => {
    return nft?.author || nft?.owner || ""
  }, [nft])

  const isWishlisted = Boolean(nft && wishlistTokenIds.includes(nft.tokenId))
  const isFollowingCreator = Boolean(
    creatorAddress && followedCreators.includes(creatorAddress.toLowerCase()),
  )

  const buyNow = async () => {
    if (!nft) return

    if (!nft.forSale || nft.price <= 0) {
      setPurchaseStatus("fail")
      setPurchaseMessage("This item is not currently listed for sale.")
      return
    }

    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setPurchaseStatus("fail")
      setPurchaseMessage("Please authenticate to purchase this content.")
      return
    }

    const storedCosignerToken = localStorage.getItem("demedia_cosigner_token")
    const cosignerTokenInput = window.prompt(
      "Enter cosigner JWT token (must be a different authenticated wallet):",
      storedCosignerToken || "",
    )

    const cosignerToken = cosignerTokenInput?.trim()
    if (!cosignerToken) {
      setPurchaseStatus("fail")
      setPurchaseMessage("A cosigner wallet is required to complete the purchase.")
      return
    }

    localStorage.setItem("demedia_cosigner_token", cosignerToken)

    setPurchaseStatus("pending")
    setPurchaseMessage("Reviewing transaction and submitting purchase...")

    try {
      const response = await fetch("/api/nft/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-cosigner-authorization": `Bearer ${cosignerToken}`,
        },
        body: JSON.stringify({
          tokenId: Number(nft.tokenId),
          priceInXLM,
          licenseType: selectedLicense,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.detail || "Purchase failed")
      }

      const txHash = data.txHash as string
      let finalStatus: "pending" | "success" | "fail" = "pending"

      for (let index = 0; index < 15; index += 1) {
        const statusRes = await fetch(`/api/tx/status/${txHash}`)
        const statusData = await statusRes.json()
        finalStatus = statusData.status ?? "pending"
        if (finalStatus !== "pending") break
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      if (finalStatus === "success") {
        setPurchaseStatus("success")
        setPurchaseMessage(`Content purchased successfully. TX: ${txHash.slice(0, 10)}...`)
        setShowSuccessModal(true)
      } else {
        setPurchaseStatus("fail")
        setPurchaseMessage("Purchase transaction failed.")
      }
    } catch (error) {
      const mapped = mapWalletError(error)
      setPurchaseStatus("fail")
      setPurchaseMessage(mapped.message)
    }
  }

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center py-16">
        <div className="panel-elevated w-full max-w-md p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/35 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading content...</p>
        </div>
      </main>
    )
  }

  if (!nft) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center py-16">
        <div className="panel-elevated w-full max-w-lg p-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">
            Content not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested item may have been removed or has an invalid URL.
          </p>
          <button
            onClick={() => router.push("/gallery")}
            className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to gallery
          </button>
        </div>
      </main>
    )
  }

  const explorerTxUrl = `${networkConfig.explorerUrl}/tx/${nft.txHash}`
  const ownershipProofUrl = nft.registryTxHash
    ? `${networkConfig.explorerUrl}/tx/${nft.registryTxHash}`
    : explorerTxUrl

  return (
    <main className="page-shell min-h-screen overflow-x-hidden py-6 sm:py-8 lg:py-10">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground sm:mb-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel-elevated overflow-hidden p-3 sm:p-4 lg:p-5">
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <img
              src={resolveMediaUrl(nft.imageURL)}
              alt={nft.name}
              className="aspect-square w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <button
              onClick={buyNow}
              disabled={purchaseStatus === "pending" || !nft.forSale || nft.price <= 0}
              className="inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {purchaseStatus === "pending"
                ? "Buying..."
                : `License ${licenseInfo.name.split(" ")[0]} - ${priceInXLM} XLM`}
            </button>

            <button
              onClick={sharePost}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied" : "Share"}
            </button>

            <button
              onClick={toggleWishlist}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold"
            >
              {isWishlisted ? (
                <BookmarkCheck className="h-4 w-4" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
              {isWishlisted ? "Saved" : "Save"}
            </button>

            <button
              onClick={recordDownload}
              disabled={downloadStatus === "pending"}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold disabled:opacity-70"
            >
              <Download className="h-4 w-4" />
              {downloadStatus === "pending" ? "Saving..." : "Download"}
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Current price
              </p>
              <p className="mt-2 text-2xl font-semibold">
                {nft.forSale && nft.price > 0 ? `${priceInXLM} XLM` : "Not listed"}
              </p>
              {nft.forSale && nft.price > 0 && selectedLicense !== "personal" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Base: {nft.price.toFixed(2)} x{licenseInfo.priceMultiplier}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                License type
              </p>
              <div className="mt-2 flex items-center gap-2">
                <FileKey2 className="h-4 w-4 text-primary" />
                <p className="text-lg font-semibold">{licenseInfo.name}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">
              Select license
            </p>
            <div className="grid gap-2">
              {LICENSE_TYPES.map((license) => (
                <button
                  key={license.id}
                  type="button"
                  onClick={() => setSelectedLicense(license.id)}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                    selectedLicense === license.id
                      ? "border-primary/50 bg-primary/10"
                      : "border-border/60 hover:border-border/80"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                      selectedLicense === license.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selectedLicense === license.id && (
                      <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{license.name}</p>
                    <p className="text-xs text-muted-foreground">{license.description}</p>
                  </div>
                  {nft.forSale && nft.price > 0 && (
                    <span className="text-sm font-semibold text-primary shrink-0">
                      {(nft.price * license.priceMultiplier).toFixed(2)} XLM
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-2">
              Included rights
            </p>
            <div className="flex flex-wrap gap-1.5">
              {licenseInfo.rights.map((right) => (
                <span
                  key={right}
                  className="inline-flex items-center rounded-full border border-border/60 bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  {right}
                </span>
              ))}
            </div>
          </div>

          {purchaseMessage ? (
            <p
              className={`mt-3 text-sm ${
                purchaseStatus === "success"
                  ? "text-green-400"
                  : purchaseStatus === "fail"
                    ? "text-red-400"
                    : "text-yellow-300"
              }`}
            >
              {purchaseMessage}
            </p>
          ) : null}
        </section>

        <section className="space-y-5">
          <div className="panel p-4 sm:p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Marketplace item
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h1 className="break-words font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl lg:text-4xl">
                  {nft.name}
                </h1>
                <p className="mt-2 break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {nft.description}
                </p>
              </div>
              <div className="w-fit rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                {nft.forSale ? "Available" : "Owned"}
              </div>
            </div>
          </div>

          <div className="panel p-4 sm:p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Creator</p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                  {nft.artistName}
                  <BadgeCheck className="h-4 w-4 text-cyan-300" />
                </p>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{`${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`}</p>
              </div>
              <button
                onClick={() => router.push(`/profile/${creatorAddress}`)}
                className="inline-flex w-full justify-center rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary sm:w-auto"
              >
                View profile
              </button>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={toggleFollow}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary sm:w-auto"
              >
                <UserPlus className="h-4 w-4" />
                {isFollowingCreator ? "Following" : "Follow creator"}
              </button>
              <button
                onClick={() => router.push(`/profile/${creatorAddress}`)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
                Open creator profile
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Created</p>
              <p className="mt-2 break-words text-sm font-medium">
                {new Date(nft.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="panel p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Royalty</p>
              <p className="mt-2 break-words text-sm font-medium">10% creator royalty</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Ownership type
              </p>
              <p className="mt-2 break-words text-sm font-medium">NFT Certificate</p>
            </div>
            <div className="panel p-4 sm:p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Current owner
              </p>
              <p className="mt-2 break-all font-mono text-sm">{`${nft.owner.slice(0, 8)}...${nft.owner.slice(-6)}`}</p>
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Ownership certificate
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href={ownershipProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary sm:w-auto"
              >
                View Ownership Proof
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link
                href={explorerTxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary sm:w-auto"
              >
                View Transaction
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="panel p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Metadata</p>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground">
              <p className="break-words">Token ID: #{nft.tokenId}</p>
              <p className="break-all">IPFS: {nft.ipfsHash}</p>
              <p className="break-all">Blockchain hash: {nft.txHash}</p>
              {nft.contentId ? <p className="break-all">Content ID: {nft.contentId}</p> : null}
            </div>
          </div>

          <CopyrightBadge tokenId={nft.tokenId} />

          <div className="panel p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-cyan-300" />
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Ratings & reviews
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-border/70 bg-card p-4">
              <p className="text-sm font-semibold">Rate this content</p>
              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className={`rounded-full p-1.5 transition ${reviewRating >= value ? "text-amber-300" : "text-zinc-500"}`}
                      aria-label={`Rate ${value} stars`}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  )
                })}
                <span className="ml-2 text-sm text-muted-foreground">{reviewRating}/5</span>
              </div>

              <div className="mt-4 grid gap-3">
                <input
                  value={reviewTitle}
                  onChange={(event) => setReviewTitle(event.target.value)}
                  placeholder="Review title"
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none"
                />
                <textarea
                  value={reviewBody}
                  onChange={(event) => setReviewBody(event.target.value)}
                  placeholder="Share what stood out about this piece..."
                  rows={4}
                  className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-70"
                >
                  {reviewSubmitting ? "Publishing..." : "Publish review"}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {reviewsLoading ? (
                <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  Loading reviews...
                </div>
              ) : reviews.length ? (
                reviews.map((review) => (
                  <article
                    key={review._id}
                    className="rounded-2xl border border-border/70 bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{review.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {review.reviewerAddress.slice(0, 6)}...{review.reviewerAddress.slice(-4)}{" "}
                          · {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-amber-300">
                        {Array.from({ length: review.rating }).map((_, index) => (
                          <Star key={index} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.body}</p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {review.helpfulCount} found this helpful
                      </p>
                      <button
                        onClick={async () => {
                          try {
                            const result = await marketplaceApi.markReviewHelpful(review._id)
                            setReviews((current) =>
                              current.map((item) => (item._id === review._id ? result.data : item)),
                            )
                          } catch (error) {
                            setEngagementMessage(
                              error instanceof Error ? error.message : "Could not mark helpful.",
                            )
                          }
                        }}
                        className="rounded-full border border-border/70 px-3 py-1 text-xs font-semibold hover:bg-secondary"
                      >
                        Helpful
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  No reviews yet. Be the first to share what you think.
                </div>
              )}
            </div>
          </div>

          {engagementMessage ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-cyan-100">
              {engagementMessage}
            </p>
          ) : null}

          {downloadMessage ? (
            <p
              className={`rounded-2xl border p-4 text-sm ${
                downloadStatus === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : downloadStatus === "fail"
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-200"
              }`}
            >
              {downloadMessage}
            </p>
          ) : null}
        </section>
      </div>

      {showSuccessModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#070b16] p-5 text-white shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15">
              <Shield className="h-7 w-7 text-emerald-300" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold sm:text-3xl">
              Content Licensed Successfully
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">
              {licenseInfo.name} acquired. Ownership NFT generated and added to your collection.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {licenseInfo.rights.map((right) => (
                <span
                  key={right}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-medium text-zinc-300"
                >
                  {right}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                onClick={() => router.push("/wallet")}
                className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black"
              >
                View in Wallet
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
