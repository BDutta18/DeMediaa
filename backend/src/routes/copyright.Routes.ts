import { Router } from "express";
import multer from "multer";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import { checkCopyright, getFingerprint, getSimilarContent } from "../controllers/copyright.Controller";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/check", walletProtect, upload.single("file"), checkCopyright);
router.get("/fingerprint/:tokenId", getFingerprint);
router.get("/similar/:tokenId", getSimilarContent);

export default router;
