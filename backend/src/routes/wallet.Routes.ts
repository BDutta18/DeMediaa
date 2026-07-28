import { Router } from "express";
import { verifyWalletSignature } from "../controllers/walletAuth.Controller";
import { updateUserProfile, getUserProfile, getUserProfileByAddress } from "../controllers/user.Controller";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import { searchUsersByName } from "../controllers/search.Controller";

const router = Router();

// 🧾 Wallet login (no auth required)
router.post("/verify", verifyWalletSignature);

// 👤 Get logged-in user info (requires JWT)
router.get("/me", walletProtect, getUserProfile);

// ✏️ Update profile (requires JWT)
router.put("/update-profile", walletProtect, updateUserProfile);

// 🔍 Get any user's profile by address (public)
router.get("/profile/:address", getUserProfileByAddress);


router.get("/search", searchUsersByName);

export default router;
