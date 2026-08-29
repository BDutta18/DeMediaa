import { Router } from "express";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import { requireFields, validateRating } from "../middlewares/validateBody";
import {
  followCreator,
  getCreatorAnalytics,
  getFollows,
  getMarketplaceHistory,
  getMarketplaceSearch,
  getNotifications,
  getReviews,
  getSearchSuggestions,
  getTrendingContent,
  getWishlist,
  logContentDownload,
  logContentShare,
  logContentView,
  markAllNotificationsRead,
  markNotificationRead,
  markHelpfulReview,
  removeWishlistItem,
  saveReview,
  saveWishlistItem,
  unfollowCreator,
} from "../controllers/marketplace.Controller";

const router = Router();

router.get("/search", getMarketplaceSearch);
router.get("/trending", getTrendingContent);
router.get("/suggestions", getSearchSuggestions);

router.get("/analytics/creator", walletProtect, getCreatorAnalytics);

router.get("/wishlist", walletProtect, getWishlist);
router.post("/wishlist", walletProtect, requireFields(["nftId", "tokenId", "creator", "name", "imageURL"]), saveWishlistItem);
router.delete("/wishlist/:tokenId", walletProtect, removeWishlistItem);

router.get("/follows", walletProtect, getFollows);
router.post("/follows", walletProtect, requireFields(["creatorAddress"]), followCreator);
router.delete("/follows/:creatorAddress", walletProtect, unfollowCreator);

router.get("/reviews/:tokenId", getReviews);
router.post("/reviews", walletProtect, requireFields(["nftId", "tokenId", "creator", "rating", "title", "body"]), validateRating(), saveReview);
router.patch("/reviews/:reviewId/helpful", walletProtect, markHelpfulReview);

router.get("/notifications", walletProtect, getNotifications);
router.patch("/notifications/:notificationId/read", walletProtect, markNotificationRead);
router.patch("/notifications/read-all", walletProtect, markAllNotificationsRead);

router.get("/history", walletProtect, getMarketplaceHistory);

router.post("/content/:tokenId/view", logContentView);
router.post("/content/:tokenId/download", walletProtect, logContentDownload);
router.post("/content/:tokenId/share", logContentShare);

export default router;
