import { Request, Response } from "express"
import { asyncHandler } from "../utils/asyncHandler"
import License from "../models/license.models"
import Listing from "../models/listing.models"
import Nft from "../models/nft.models"
import { emitPlatformEvent } from "../services/eventBus"

const LICENSE_MULTIPLIERS = {
  personal: 1,
  commercial: 3,
  exclusive: 10,
}

export const createListing = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address
  const { tokenId, personalPrice, commercialPrice, exclusivePrice, royaltyBps } = req.body

  if (!tokenId) {
    return res.status(400).json({ success: false, message: "tokenId is required" })
  }

  const nft = await Nft.findOne({ tokenId: String(tokenId) })
  if (!nft) {
    return res.status(404).json({ success: false, message: "NFT not found" })
  }

  if (
    nft.author.toLowerCase() !== userAddress.toLowerCase() &&
    nft.owner.toLowerCase() !== userAddress.toLowerCase()
  ) {
    return res
      .status(403)
      .json({ success: false, message: "Only the creator or owner can list for licensing" })
  }

  const existing = await Listing.findOne({ tokenId: String(tokenId) })
  if (existing && existing.active) {
    return res
      .status(400)
      .json({ success: false, message: "Active listing already exists for this token" })
  }

  const personal = personalPrice ?? nft.price ?? 1
  const commercial = commercialPrice ?? personal * LICENSE_MULTIPLIERS.commercial
  const exclusive = exclusivePrice ?? personal * LICENSE_MULTIPLIERS.exclusive

  const listing = await Listing.findOneAndUpdate(
    { tokenId: String(tokenId) },
    {
      nftId: (nft._id as any).toString(),
      tokenId: String(tokenId),
      creator: userAddress,
      contentHash: nft.contentId || "",
      name: nft.name,
      description: nft.description,
      imageURL: nft.imageURL,
      licenseTypes: {
        personal,
        commercial,
        exclusive,
      },
      royaltyBps: royaltyBps ?? 1000,
      active: true,
    },
    { new: true, upsert: true },
  )

  emitPlatformEvent("license_created", {
    listingId: (listing._id as any).toString(),
    tokenId: String(tokenId),
    creator: userAddress,
    prices: { personal, commercial, exclusive },
  })

  res.status(201).json({
    success: true,
    message: "License listing created",
    data: listing,
  })
})

export const getListings = asyncHandler(async (req: Request, res: Response) => {
  const { creator, active, page = "1", limit = "20" } = req.query

  const filter: any = {}
  if (creator) filter.creator = String(creator).toLowerCase()
  if (active !== undefined) filter.active = active === "true"

  const pageNum = Math.max(1, parseInt(String(page), 10))
  const limitNum = Math.min(50, Math.max(1, parseInt(String(limit), 10)))
  const skip = (pageNum - 1) * limitNum

  const [listings, total] = await Promise.all([
    Listing.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Listing.countDocuments(filter),
  ])

  res.status(200).json({
    success: true,
    data: listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  })
})

export const getListing = asyncHandler(async (req: Request, res: Response) => {
  const { listingId } = req.params

  const listing = await Listing.findById(listingId)
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" })
  }

  res.status(200).json({ success: true, data: listing })
})

export const getListingByToken = asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params

  const listing = await Listing.findOne({ tokenId: String(tokenId) })
  if (!listing) {
    return res.status(404).json({ success: false, message: "No active listing for this token" })
  }

  res.status(200).json({ success: true, data: listing })
})

export const purchaseLicense = asyncHandler(async (req: Request, res: Response) => {
  const buyerAddress = (req as any).user.address
  const { listingId, licenseType } = req.body

  if (!listingId || !licenseType) {
    return res
      .status(400)
      .json({ success: false, message: "listingId and licenseType are required" })
  }

  if (!["personal", "commercial", "exclusive"].includes(licenseType)) {
    return res.status(400).json({ success: false, message: "Invalid license type" })
  }

  const listing = await Listing.findById(listingId)
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" })
  }

  if (!listing.active) {
    return res.status(400).json({ success: false, message: "Listing is no longer active" })
  }

  if (listing.creator.toLowerCase() === buyerAddress.toLowerCase()) {
    return res
      .status(400)
      .json({ success: false, message: "Creator cannot purchase their own license" })
  }

  const existingLicense = await License.findOne({
    listingId,
    buyer: buyerAddress.toLowerCase(),
    status: "active",
  })
  if (existingLicense) {
    return res
      .status(400)
      .json({ success: false, message: "You already hold an active license for this content" })
  }

  const price = listing.licenseTypes[licenseType as keyof typeof listing.licenseTypes]
  if (!price || price <= 0) {
    return res.status(400).json({ success: false, message: "License type not available" })
  }

  const royaltyAmount = (price * listing.royaltyBps) / 10000
  const txHash = `license-purchase-${Date.now()}-${listing.tokenId}`

  const license = await License.create({
    listingId,
    nftId: listing.nftId,
    tokenId: listing.tokenId,
    creator: listing.creator,
    buyer: buyerAddress.toLowerCase(),
    contentHash: listing.contentHash,
    licenseType,
    price,
    royaltyBps: listing.royaltyBps,
    royaltyAmount,
    currency: "XLM",
    txHash,
    status: "active",
  })

  await Listing.findByIdAndUpdate(listingId, {
    $inc: { totalLicensesSold: 1, totalRevenue: price },
  })

  emitPlatformEvent("license_purchased", {
    licenseId: (license._id as any).toString(),
    listingId,
    tokenId: listing.tokenId,
    buyer: buyerAddress,
    seller: listing.creator,
    licenseType,
    price,
    royaltyAmount,
    txHash,
  })

  res.status(200).json({
    success: true,
    message: `License acquired successfully`,
    data: {
      license,
      txHash,
      price,
      royaltyAmount,
      licenseType,
    },
  })
})

export const getMyLicenses = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address

  const licenses = await License.find({
    buyer: userAddress.toLowerCase(),
    status: "active",
  }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    count: licenses.length,
    data: licenses,
  })
})

export const getCreatorLicenses = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address

  const licenses = await License.find({
    creator: userAddress.toLowerCase(),
    status: "active",
  }).sort({ createdAt: -1 })

  const listings = await Listing.find({ creator: userAddress.toLowerCase() })

  const totalRevenue = licenses.reduce((sum: number, l: any) => sum + l.price, 0)
  const totalRoyalties = licenses.reduce((sum: number, l: any) => sum + l.royaltyAmount, 0)

  res.status(200).json({
    success: true,
    data: {
      licenses,
      listings,
      stats: {
        totalLicensesSold: licenses.length,
        totalRevenue,
        totalRoyalties,
        activeListings: listings.filter((l: any) => l.active).length,
      },
    },
  })
})

export const verifyLicense = asyncHandler(async (req: Request, res: Response) => {
  const { listingId } = req.params
  const buyerAddress = (req as any).user.address

  const license = await License.findOne({
    listingId,
    buyer: buyerAddress.toLowerCase(),
    status: "active",
  })

  res.status(200).json({
    success: true,
    data: {
      licensed: !!license,
      license: license || null,
    },
  })
})

export const deactivateListing = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address
  const { listingId } = req.params

  const listing = await Listing.findById(listingId)
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" })
  }

  if (listing.creator.toLowerCase() !== userAddress.toLowerCase()) {
    return res
      .status(403)
      .json({ success: false, message: "Only the creator can deactivate a listing" })
  }

  listing.active = false
  await listing.save()

  res.status(200).json({
    success: true,
    message: "Listing deactivated",
    data: listing,
  })
})
