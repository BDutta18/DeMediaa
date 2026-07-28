import { Router } from "express";
import multer from "multer";
import fs from "fs";
import pkg from "js-sha3";
const { keccak256 } = pkg; // ✅ standard Keccak-256 hashing

import { uploadToPinata } from "../utils/pinataUpload";
import { uploadContentToBlockchain } from "../web3/uploadContent";
import { walletProtect } from "../middlewares/walletAuthMiddleware";
import { buyNFT } from "../web3/buyNFT";
import { classifyWalletTxError } from "../utils/stellarError";
import Nft from "../models/nft.models";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../utils/jwtSecret";
const router = Router();
const upload = multer({ dest: "uploads/" });

const decodeAddressFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { address?: string };
    const address = decoded?.address?.trim();
    return address ? address.toUpperCase() : null;
  } catch {
    return null;
  }
};

router.post("/upload-content", walletProtect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // 1️⃣ Upload to Pinatao
    const IpfsHash = await uploadToPinata(filePath);

    // 2️⃣ Compute keccak256 hash of file (fixed)
    const fileHash = "0x" + keccak256(fileBuffer);

    // 3️⃣ Call smart contract (register content)
    const result = await uploadContentToBlockchain(IpfsHash, fileHash);

    if (!result.success) {
      fs.unlinkSync(filePath); // ensure cleanup if blockchain call fails
      return res.status(500).json({ message: "Blockchain registration failed", error: result.error });
    }

    // 4️⃣ Clean up temp file
    fs.unlinkSync(filePath);

    res.json({
      message: "✅ Content uploaded & registered successfully",
      ipfsCID: IpfsHash,
      fileHash,
      txHash: result.txHash,
      contentId: result.contentId,
    });
  } catch (error) {
    console.error(error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); // safe cleanup on error
    res.status(500).json({ message: "Upload error", error });
  }
});

router.post("/buy", walletProtect, async (req, res) => {
  try {
    const buyerAddress = (req as any).user.address as string;
    const cosignerAuthHeader = req.headers["x-cosigner-authorization"];
    const cosignerToken = Array.isArray(cosignerAuthHeader)
      ? cosignerAuthHeader[0]
      : cosignerAuthHeader;
    const { tokenId, priceInXLM } = req.body as { tokenId?: number; priceInXLM?: string };

    if (!tokenId || !priceInXLM) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "tokenId and priceInXLM are required",
      });
    }

    if (!cosignerToken || !cosignerToken.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        errorCode: "MULTISIG_COSIGNER_MISSING",
        message: "Missing cosigner authorization header (x-cosigner-authorization: Bearer <token>)",
      });
    }

    const cosignerAddress = decodeAddressFromToken(cosignerToken.split(" ")[1]);
    if (!cosignerAddress) {
      return res.status(401).json({
        success: false,
        errorCode: "MULTISIG_COSIGNER_INVALID",
        message: "Invalid or expired cosigner token",
      });
    }

    if (cosignerAddress.toLowerCase() === buyerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "MULTISIG_DISTINCT_SIGNER_REQUIRED",
        message: "Buyer and cosigner must be different wallets",
      });
    }

    const nft = await Nft.findOne({ tokenId: String(tokenId) });

    if (!nft) {
      return res.status(404).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "NFT not found",
      });
    }

    if (!nft.forSale) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "NFT is not listed for sale",
      });
    }

    if (nft.owner.toLowerCase() === buyerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "Owner cannot buy their own NFT",
      });
    }

    if (nft.owner.toLowerCase() === cosignerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "MULTISIG_CONFLICT_OF_INTEREST",
        message: "Seller cannot act as the cosigner",
      });
    }

    const result = await buyNFT({
      tokenId,
      priceInXLM,
      buyerAddress,
      sellerAddress: nft.owner,
    });

    if (!result.success) {
      const errorCode = classifyWalletTxError(result.error);
      return res.status(500).json({
        success: false,
        errorCode,
        message: "NFT purchase failed",
        detail: result.error,
      });
    }

    nft.owner = buyerAddress;
    nft.forSale = false;
    nft.price = 0;
    await nft.save();

    return res.status(200).json({
      success: true,
      txHash: result.txHash,
      buyer: result.buyer,
      seller: result.seller,
      royaltyEnabled: false,
      settlement: "offchain",
      multisig: {
        mode: "2-of-2",
        approvals: [buyerAddress, cosignerAddress],
      },
    });
  } catch (error) {
    const errorCode = classifyWalletTxError(error);
    return res.status(500).json({
      success: false,
      errorCode,
      message: "NFT purchase failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

router.post("/buy-multisig", walletProtect, async (req, res) => {
  try {
    const buyerAddress = (req as any).user.address as string;
    const cosignerAuthHeader = req.headers["x-cosigner-authorization"];
    const cosignerToken = Array.isArray(cosignerAuthHeader)
      ? cosignerAuthHeader[0]
      : cosignerAuthHeader;
    const { tokenId, priceInXLM } = req.body as { tokenId?: number; priceInXLM?: string };

    if (!tokenId || !priceInXLM) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "tokenId and priceInXLM are required",
      });
    }

    if (!cosignerToken || !cosignerToken.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        errorCode: "MULTISIG_COSIGNER_MISSING",
        message: "Missing cosigner authorization header (x-cosigner-authorization: Bearer <token>)",
      });
    }

    const cosignerAddress = decodeAddressFromToken(cosignerToken.split(" ")[1]);
    if (!cosignerAddress) {
      return res.status(401).json({
        success: false,
        errorCode: "MULTISIG_COSIGNER_INVALID",
        message: "Invalid or expired cosigner token",
      });
    }

    if (cosignerAddress.toLowerCase() === buyerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "MULTISIG_DISTINCT_SIGNER_REQUIRED",
        message: "Buyer and cosigner must be different wallets",
      });
    }

    const nft = await Nft.findOne({ tokenId: String(tokenId) });
    if (!nft) {
      return res.status(404).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "NFT not found",
      });
    }

    if (!nft.forSale) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "NFT is not listed for sale",
      });
    }

    if (nft.owner.toLowerCase() === buyerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "Owner cannot buy their own NFT",
      });
    }

    if (nft.owner.toLowerCase() === cosignerAddress.toLowerCase()) {
      return res.status(400).json({
        success: false,
        errorCode: "MULTISIG_CONFLICT_OF_INTEREST",
        message: "Seller cannot act as the cosigner",
      });
    }

    const result = await buyNFT({
      tokenId,
      priceInXLM,
      buyerAddress,
      sellerAddress: nft.owner,
    });

    if (!result.success) {
      const errorCode = classifyWalletTxError(result.error);
      return res.status(500).json({
        success: false,
        errorCode,
        message: "NFT purchase failed",
        detail: result.error,
      });
    }

    nft.owner = buyerAddress;
    nft.forSale = false;
    nft.price = 0;
    await nft.save();

    return res.status(200).json({
      success: true,
      txHash: result.txHash,
      buyer: result.buyer,
      seller: result.seller,
      royaltyEnabled: false,
      settlement: "offchain",
      multisig: {
        mode: "2-of-2",
        approvals: [buyerAddress, cosignerAddress],
      },
    });
  } catch (error) {
    const errorCode = classifyWalletTxError(error);
    return res.status(500).json({
      success: false,
      errorCode,
      message: "NFT multisig purchase failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
