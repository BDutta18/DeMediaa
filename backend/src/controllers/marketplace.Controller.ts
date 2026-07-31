import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Listing from "../models/listing.models";
import License from "../models/license.models";
import Nft from "../models/nft.models";
import {
  ActivityModel,
  DownloadRecordModel,
  FollowModel,
  NotificationModel,
  ReviewModel,
  WishlistModel,
} from "../models/marketplace.models";
import { inferCategory, scoreListing, sortByPopularity } from "../services/marketplaceInsights";

type SortMode = "trending" | "popular" | "newest" | "price-asc" | "price-desc" | "rating";

const normalizeAddress = (value?: string | null): string => {
  return value?.trim().toLowerCase() ?? "";
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getRequestAddress = (req: Request): string => {
  const fromUser = normalizeAddress((req as any).user?.address);
  if (fromUser) return fromUser;

  const fromQuery = normalizeAddress(typeof req.query.address === "string" ? req.query.address : "");
  return fromQuery;
};

const parseNumber = (value: unknown, fallback = 0): number => {
  const parsed = typeof value === "string" ? Number(value) : Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const buildSearchFilter = (query: Request["query"]) => {
  const filter: Record<string, unknown> = { active: true };
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const category = typeof query.category === "string" ? query.category.trim() : "";
  const minPrice = parseNumber(query.minPrice, Number.NEGATIVE_INFINITY);
  const maxPrice = parseNumber(query.maxPrice, Number.POSITIVE_INFINITY);

  if (category && category.toLowerCase() !== "all") {
    filter.category = category;
  }

  if (q) {
    const search = new RegExp(escapeRegExp(q), "i");
    filter.$or = [
      { name: search },
      { description: search },
      { creator: search },
      { tags: { $in: [search] } },
    ];
  }

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    filter["licenseTypes.personal"] = { $gte: minPrice, $lte: maxPrice };
  }

  return filter;
};

const updateSignals = async (tokenId: string) => {
  const [listing, nft] = await Promise.all([
    Listing.findOne({ tokenId: String(tokenId) }),
    Nft.findOne({ tokenId: String(tokenId) }),
  ]);

  if (!listing || !nft) return null;

  const [reviews, downloads, wishlists, views] = await Promise.all([
    ReviewModel.find({ tokenId: String(tokenId), status: "published" }),
    DownloadRecordModel.find({ tokenId: String(tokenId) }),
    WishlistModel.find({ tokenId: String(tokenId) }),
    ActivityModel.countDocuments({ tokenId: String(tokenId), type: "view" }),
  ]);

  const reviewCount = reviews.length;
  const reviewAverage = reviewCount
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;
  const downloadCount = downloads.length;
  const wishlistCount = wishlists.length;
  const totalEngagement = views + downloadCount + wishlistCount + reviewCount;
  const score = scoreListing({
    totalLicensesSold: listing.totalLicensesSold,
    totalRevenue: listing.totalRevenue,
    viewCount: Math.max(listing.viewCount, views),
    downloadCount: Math.max(listing.downloadCount, downloadCount),
    averageRating: reviewAverage,
    ratingCount: reviewCount,
    createdAt: listing.createdAt,
  });

  listing.averageRating = Number(reviewAverage.toFixed(2));
  listing.ratingCount = reviewCount;
  listing.downloadCount = downloadCount;
  listing.viewCount = views;
  listing.popularityScore = score.score + totalEngagement;
  if (!listing.category || listing.category === "General") {
    listing.category = inferCategory(listing.name, listing.description, listing.tags);
  }

  nft.downloadCount = downloadCount;
  nft.viewCount = views;

  await Promise.all([listing.save(), nft.save()]);

  return {
    listing,
    nft,
    reviewCount,
    reviewAverage,
    downloadCount,
    wishlistCount,
    views,
    popularityScore: listing.popularityScore,
    signals: score.signals,
  };
};

const toListingResponse = (listing: any) => {
  const { score } = scoreListing(listing);
  return {
    ...listing.toObject ? listing.toObject() : listing,
    category: listing.category || inferCategory(listing.name, listing.description, listing.tags),
    popularityScore: listing.popularityScore || score,
  };
};

export const getMarketplaceSearch = asyncHandler(async (req: Request, res: Response) => {
  const filter = buildSearchFilter(req.query);
  const sortMode = (typeof req.query.sort === "string" ? req.query.sort : "trending") as SortMode;
  const limit = Math.min(50, Math.max(1, parseNumber(req.query.limit, 24)));

  const listings = await Listing.find(filter).limit(limit * 3);
  const enriched = listings.map((listing) => {
    const score = scoreListing(listing);
    return {
      ...toListingResponse(listing),
      searchScore: score.score,
    };
  });

  const sorted = (() => {
    switch (sortMode) {
      case "price-asc":
        return [...enriched].sort((left, right) => left.licenseTypes.personal - right.licenseTypes.personal);
      case "price-desc":
        return [...enriched].sort((left, right) => right.licenseTypes.personal - left.licenseTypes.personal);
      case "rating":
        return [...enriched].sort((left, right) => right.averageRating - left.averageRating);
      case "newest":
        return [...enriched].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
      case "popular":
        return sortByPopularity(enriched);
      case "trending":
      default:
        return [...enriched].sort((left, right) => (right.searchScore ?? 0) - (left.searchScore ?? 0));
    }
  })().slice(0, limit);

  res.status(200).json({
    success: true,
    data: sorted,
    filters: {
      category: typeof req.query.category === "string" ? req.query.category : "all",
      sort: sortMode,
      limit,
    },
  });
});

export const getTrendingContent = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(24, Math.max(1, parseNumber(req.query.limit, 8)));
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";

  const filter: Record<string, unknown> = { active: true };
  if (category && category.toLowerCase() !== "all") filter.category = category;

  const listings = await Listing.find(filter).limit(100);
  const enriched = listings
    .map((listing) => {
      const scored = scoreListing(listing);
      return {
        ...toListingResponse(listing),
        trendingScore: scored.score,
        trendingSignals: scored.signals,
      };
    })
    .sort((left, right) => right.trendingScore - left.trendingScore)
    .slice(0, limit);

  res.status(200).json({
    success: true,
    data: enriched,
    meta: {
      limit,
      category: category || "all",
    },
  });
});

export const getCreatorAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const creatorAddress = getRequestAddress(req);

  if (!creatorAddress) {
    return res.status(400).json({ success: false, message: "Creator address is required" });
  }

  const [listings, licenses, downloads, wishlists, followers, following, reviews, activities] = await Promise.all([
    Listing.find({ creator: { $regex: new RegExp(`^${escapeRegExp(creatorAddress)}$`, "i") } }),
    License.find({ creator: { $regex: new RegExp(`^${escapeRegExp(creatorAddress)}$`, "i") } }),
    DownloadRecordModel.find({ creatorAddress }),
    WishlistModel.find({ creator: creatorAddress }),
    FollowModel.find({ creatorAddress }),
    FollowModel.find({ followerAddress: creatorAddress }),
    ReviewModel.find({ creator: creatorAddress }),
    ActivityModel.find({ creatorAddress }),
  ]);

  const totalRevenue = licenses.reduce((sum, license) => sum + license.price, 0);
  const totalRoyalties = licenses.reduce((sum, license) => sum + license.royaltyAmount, 0);
  const totalSales = licenses.length;
  const totalDownloads = downloads.length;
  const totalWishlistAdds = wishlists.length;
  const averageRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
  const engagementScore = totalSales * 10 + totalDownloads * 6 + totalWishlistAdds * 3 + reviews.length * 8 + followers.length * 12;
  const topListings = sortByPopularity(listings).slice(0, 6).map((listing) => toListingResponse(listing));

  const series = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);

    const salesForDay = licenses.filter((license) => license.createdAt.toISOString().slice(0, 10) === key);
    const downloadsForDay = downloads.filter((download) => download.createdAt.toISOString().slice(0, 10) === key);

    return {
      date: key,
      sales: salesForDay.length,
      revenue: salesForDay.reduce((sum, license) => sum + license.price, 0),
      downloads: downloadsForDay.length,
      engagement: activities.filter((activity) => activity.createdAt.toISOString().slice(0, 10) === key).length,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      creatorAddress,
      totals: {
        sales: totalSales,
        revenue: totalRevenue,
        royalties: totalRoyalties,
        downloads: totalDownloads,
        wishlistAdds: totalWishlistAdds,
        followers: followers.length,
        following: following.length,
        reviews: reviews.length,
      },
      averages: {
        rating: Number(averageRating.toFixed(2)),
        engagementScore: Number(engagementScore.toFixed(0)),
      },
      listings: topListings,
      series,
    },
  });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);
  const wishlist = await WishlistModel.find({ userAddress }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: wishlist });
});

export const saveWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);
  const { nftId, tokenId, creator, name, imageURL, priceSnapshot } = req.body as Record<string, string | number | undefined>;

  if (!userAddress || !nftId || !tokenId || !creator || !name || !imageURL) {
    return res.status(400).json({ success: false, message: "nftId, tokenId, creator, name, and imageURL are required" });
  }

  const wishlistItem = await WishlistModel.findOneAndUpdate(
    { userAddress, tokenId: String(tokenId) },
    {
      userAddress,
      nftId: String(nftId),
      tokenId: String(tokenId),
      creator: normalizeAddress(String(creator)),
      name: String(name),
      imageURL: String(imageURL),
      priceSnapshot: parseNumber(priceSnapshot, 0),
    },
    { upsert: true, new: true }
  );

  await ActivityModel.create({
    actorAddress: userAddress,
    type: "wishlist",
    nftId: String(nftId),
    tokenId: String(tokenId),
    creatorAddress: normalizeAddress(String(creator)),
  });

  await NotificationModel.create({
    recipientAddress: normalizeAddress(String(creator)),
    actorAddress: userAddress,
    type: "wishlist",
    title: `${name} saved to wishlist`,
    message: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)} saved your content to their wishlist.`,
    href: `/post/${nftId}`,
    metadata: { tokenId, priceSnapshot: parseNumber(priceSnapshot, 0) },
  });

  await updateSignals(String(tokenId));

  res.status(200).json({ success: true, data: wishlistItem });
});

export const removeWishlistItem = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);
  const { tokenId } = req.params;

  const result = await WishlistModel.deleteOne({ userAddress, tokenId: String(tokenId) });

  res.status(200).json({ success: true, deleted: result.deletedCount > 0 });
});

export const getFollows = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);
  const [following, followers] = await Promise.all([
    FollowModel.find({ followerAddress: userAddress }).sort({ createdAt: -1 }),
    FollowModel.find({ creatorAddress: userAddress }).sort({ createdAt: -1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      following,
      followers,
    },
  });
});

export const followCreator = asyncHandler(async (req: Request, res: Response) => {
  const followerAddress = getRequestAddress(req);
  const { creatorAddress, creatorName, creatorAvatar } = req.body as Record<string, string | undefined>;

  if (!followerAddress || !creatorAddress) {
    return res.status(400).json({ success: false, message: "creatorAddress is required" });
  }

  const normalizedCreator = normalizeAddress(creatorAddress);

  const follow = await FollowModel.findOneAndUpdate(
    { followerAddress, creatorAddress: normalizedCreator },
    {
      followerAddress,
      creatorAddress: normalizedCreator,
      creatorName,
      creatorAvatar,
    },
    { upsert: true, new: true }
  );

  await ActivityModel.create({
    actorAddress: followerAddress,
    type: "follow",
    creatorAddress: normalizedCreator,
  });

  await NotificationModel.create({
    recipientAddress: normalizedCreator,
    actorAddress: followerAddress,
    type: "follow",
    title: "New creator follow",
    message: `${followerAddress.slice(0, 6)}...${followerAddress.slice(-4)} started following you.`,
    href: `/profile/${normalizedCreator}`,
  });

  res.status(200).json({ success: true, data: follow });
});

export const unfollowCreator = asyncHandler(async (req: Request, res: Response) => {
  const followerAddress = getRequestAddress(req);
  const creatorAddress = normalizeAddress(req.params.creatorAddress);

  const result = await FollowModel.deleteOne({ followerAddress, creatorAddress });

  res.status(200).json({ success: true, deleted: result.deletedCount > 0 });
});

export const getReviews = asyncHandler(async (req: Request, res: Response) => {
  const tokenId = String(req.params.tokenId);
  const reviews = await ReviewModel.find({ tokenId, status: "published" }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: reviews });
});

export const saveReview = asyncHandler(async (req: Request, res: Response) => {
  const reviewerAddress = getRequestAddress(req);
  const { nftId, tokenId, creator, rating, title, body } = req.body as Record<string, string | number | undefined>;

  if (!reviewerAddress || !nftId || !tokenId || !creator || !rating || !title || !body) {
    return res.status(400).json({ success: false, message: "All review fields are required" });
  }

  const normalizedCreator = normalizeAddress(String(creator));
  const review = await ReviewModel.findOneAndUpdate(
    { tokenId: String(tokenId), reviewerAddress },
    {
      nftId: String(nftId),
      tokenId: String(tokenId),
      creator: normalizedCreator,
      reviewerAddress,
      rating: Math.min(5, Math.max(1, parseNumber(rating, 5))),
      title: String(title).trim(),
      body: String(body).trim(),
      status: "published",
    },
    { upsert: true, new: true }
  );

  await ActivityModel.create({
    actorAddress: reviewerAddress,
    type: "review",
    nftId: String(nftId),
    tokenId: String(tokenId),
    creatorAddress: normalizedCreator,
    metadata: { rating: review.rating },
  });

  await NotificationModel.create({
    recipientAddress: normalizedCreator,
    actorAddress: reviewerAddress,
    type: "review",
    title: `New review for ${title}`,
    message: `${reviewerAddress.slice(0, 6)}...${reviewerAddress.slice(-4)} left a ${review.rating}/5 review.`,
    href: `/post/${nftId}`,
    metadata: { rating: review.rating, tokenId },
  });

  await updateSignals(String(tokenId));

  res.status(200).json({ success: true, data: review });
});

export const markHelpfulReview = asyncHandler(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const review = await ReviewModel.findByIdAndUpdate(reviewId, { $inc: { helpfulCount: 1 } }, { new: true });

  if (!review) {
    return res.status(404).json({ success: false, message: "Review not found" });
  }

  res.status(200).json({ success: true, data: review });
});

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const recipientAddress = getRequestAddress(req);
  const notifications = await NotificationModel.find({ recipientAddress }).sort({ createdAt: -1 }).limit(100);
  const unread = notifications.filter((notification) => !notification.read).length;

  res.status(200).json({ success: true, data: notifications, unreadCount: unread });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const recipientAddress = getRequestAddress(req);
  const { notificationId } = req.params;

  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, recipientAddress },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }

  res.status(200).json({ success: true, data: notification });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const recipientAddress = getRequestAddress(req);

  await NotificationModel.updateMany({ recipientAddress }, { read: true });
  res.status(200).json({ success: true });
});

export const getMarketplaceHistory = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);

  const [purchases, downloads, shares, views] = await Promise.all([
    License.find({ buyer: userAddress }),
    DownloadRecordModel.find({ userAddress }).sort({ createdAt: -1 }),
    ActivityModel.find({ actorAddress: userAddress, type: "share" }).sort({ createdAt: -1 }),
    ActivityModel.find({ actorAddress: userAddress, type: "view" }).sort({ createdAt: -1 }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      purchases,
      downloads,
      shares,
      views,
    },
  });
});

export const logContentView = asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params;
  const bodyAddress = normalizeAddress((req.body as { address?: string; viewerAddress?: string })?.address ?? (req.body as { address?: string; viewerAddress?: string })?.viewerAddress);
  const viewerAddress = bodyAddress || getRequestAddress(req) || "anonymous";
  const nft = await Nft.findOne({ tokenId: String(tokenId) });
  const listing = await Listing.findOne({ tokenId: String(tokenId) });

  if (!nft || !listing) {
    return res.status(404).json({ success: false, message: "Content not found" });
  }

  nft.viewCount += 1;
  listing.viewCount += 1;

  await Promise.all([
    nft.save(),
    listing.save(),
    ActivityModel.create({
      actorAddress: viewerAddress,
      type: "view",
      nftId: String(nft._id),
      tokenId: String(tokenId),
      creatorAddress: normalizeAddress(listing.creator),
    }),
  ]);

  await updateSignals(String(tokenId));

  res.status(200).json({ success: true, data: { viewCount: listing.viewCount } });
});

export const logContentDownload = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = getRequestAddress(req);
  const { tokenId } = req.params;
  const { licenseType, downloadUrl, fileName } = req.body as Record<string, string | undefined>;

  if (!userAddress) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const [nft, listing] = await Promise.all([
    Nft.findOne({ tokenId: String(tokenId) }),
    Listing.findOne({ tokenId: String(tokenId) }),
  ]);

  if (!nft || !listing) {
    return res.status(404).json({ success: false, message: "Content not found" });
  }

  const download = await DownloadRecordModel.create({
    userAddress,
    nftId: String(nft._id),
    tokenId: String(tokenId),
    creatorAddress: normalizeAddress(listing.creator),
    licenseType,
    source: "download",
    fileName,
    downloadUrl,
  });

  nft.downloadCount += 1;
  listing.downloadCount += 1;
  await Promise.all([nft.save(), listing.save()]);

  await ActivityModel.create({
    actorAddress: userAddress,
    type: "download",
    nftId: String(nft._id),
    tokenId: String(tokenId),
    creatorAddress: normalizeAddress(listing.creator),
    metadata: { licenseType },
  });

  await NotificationModel.create({
    recipientAddress: normalizeAddress(listing.creator),
    actorAddress: userAddress,
    type: "download",
    title: `${nft.name} downloaded`,
    message: `${userAddress.slice(0, 6)}...${userAddress.slice(-4)} downloaded your content.`,
    href: `/post/${nft._id}`,
    metadata: { licenseType, downloadId: download._id.toString() },
  });

  await updateSignals(String(tokenId));

  res.status(200).json({ success: true, data: download });
});

export const logContentShare = asyncHandler(async (req: Request, res: Response) => {
  const actorAddress = getRequestAddress(req) || "anonymous";
  const { tokenId } = req.params;
  const { creatorAddress, href } = req.body as Record<string, string | undefined>;

  await ActivityModel.create({
    actorAddress,
    type: "share",
    tokenId: String(tokenId),
    creatorAddress: normalizeAddress(creatorAddress),
    metadata: { href },
  });

  res.status(200).json({ success: true });
});

export const getSearchSuggestions = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Listing.distinct("category");
  const popularTags = await Listing.aggregate([
    { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      categories: categories.filter(Boolean),
      tags: popularTags.map((tag) => tag._id).filter(Boolean),
    },
  });
});
