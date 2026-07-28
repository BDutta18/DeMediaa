import { Router } from "express";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import {
  createListing,
  getListings,
  getListing,
  getListingByToken,
  purchaseLicense,
  getMyLicenses,
  getCreatorLicenses,
  verifyLicense,
  deactivateListing,
} from "../controllers/license.Controller";

const router = Router();

router.get("/listings", getListings);
router.get("/listings/:listingId", getListing);
router.get("/listings/token/:tokenId", getListingByToken);

router.post("/listings", walletProtect, createListing);
router.post("/purchase", walletProtect, purchaseLicense);
router.post("/deactivate/:listingId", walletProtect, deactivateListing);

router.get("/my", walletProtect, getMyLicenses);
router.get("/creator", walletProtect, getCreatorLicenses);
router.get("/verify/:listingId", walletProtect, verifyLicense);

export default router;
