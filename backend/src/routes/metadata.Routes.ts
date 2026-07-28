import { Router } from "express";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import { uploadMetadataToPinata } from "../utils/pinataMetadata";

const router = Router();

router.post("/metadata", walletProtect, async (req, res) => {
  try {
    const { name, description, imageURL } = req.body;
    if (!name || !description || !imageURL)
      return res.status(400).json({ message: "Missing required fields" });

    const metadataURL = await uploadMetadataToPinata(name, description, imageURL);
    res.json({ message: "Metadata uploaded to IPFS", metadataURL });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
});

export default router;
