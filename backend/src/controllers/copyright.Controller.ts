import { Request, Response } from "express";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler";
import ContentFingerprint from "../models/fingerprint.models";
import {
  computeContentFingerprint,
  findMatches,
  ContentFingerprintResult,
} from "../services/copyrightDetection";

export const checkCopyright = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file provided for copyright check" });
  }

  let filePath: string | undefined;
  try {
    filePath = req.file.path;
    const fingerprint = computeContentFingerprint(filePath as string);

    const existing = await ContentFingerprint.find({}).select(
      "tokenId author ipfsHash phash dhash ahash ssdeep sha256"
    );

    const matches = findMatches(fingerprint, existing);

    const isOriginal = matches.length === 0;
    const hasExactMatch = matches.some((m) => m.matchType === "exact");
    const hasNearDuplicate = matches.some((m) => m.matchType === "near-duplicate");

    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (hasExactMatch) riskLevel = "critical";
    else if (hasNearDuplicate) riskLevel = "high";
    else if (matches.length > 0) riskLevel = "medium";

    res.status(200).json({
      success: true,
      data: {
        isOriginal,
        riskLevel,
        matches: matches.slice(0, 10),
        fingerprint: {
          sha256: fingerprint.sha256,
          phash: fingerprint.phash,
          dhash: fingerprint.dhash,
          ahash: fingerprint.ahash,
          crc32: fingerprint.crc32,
          ssdeep: fingerprint.ssdeep,
          width: fingerprint.width,
          height: fingerprint.height,
          fileSize: fingerprint.fileSize,
        },
        scannedCount: existing.length,
      },
      message: isOriginal
        ? "Content appears to be original"
        : `Found ${matches.length} potential match(es)`,
    });
  } catch (error) {
    console.error("Copyright check error:", error);
    res.status(500).json({
      success: false,
      message: "Copyright detection failed",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

export const getFingerprint = asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params;

  const fingerprint = await ContentFingerprint.findOne({ tokenId });
  if (!fingerprint) {
    return res.status(404).json({ success: false, message: "Fingerprint not found for this token" });
  }

  res.status(200).json({
    success: true,
    data: {
      tokenId: fingerprint.tokenId,
      sha256: fingerprint.sha256,
      phash: fingerprint.phash,
      dhash: fingerprint.dhash,
      ahash: fingerprint.ahash,
      crc32: fingerprint.crc32,
      ssdeep: fingerprint.ssdeep,
      width: fingerprint.width,
      height: fingerprint.height,
      mimeType: fingerprint.mimeType,
      fileSize: fingerprint.fileSize,
      author: fingerprint.author,
      ipfsHash: fingerprint.ipfsHash,
      createdAt: fingerprint.createdAt,
    },
  });
});

export const getSimilarContent = asyncHandler(async (req: Request, res: Response) => {
  const { tokenId } = req.params;

  const target = await ContentFingerprint.findOne({ tokenId });
  if (!target) {
    return res.status(404).json({ success: false, message: "Fingerprint not found" });
  }

  const existing = await ContentFingerprint.find({ tokenId: { $ne: tokenId } }).select(
    "tokenId author ipfsHash phash dhash ahash ssdeep sha256"
  );

  const matches = findMatches(
    {
      sha256: target.sha256,
      phash: target.phash,
      dhash: target.dhash,
      ahash: target.ahash,
      ssdeep: target.ssdeep,
      width: target.width,
      height: target.height,
      fileSize: target.fileSize,
      crc32: target.crc32,
    },
    existing
  );

  res.status(200).json({
    success: true,
    data: {
      tokenId,
      matches: matches.slice(0, 20),
      totalScanned: existing.length,
    },
  });
});

export const saveFingerprint = async (
  nftId: string,
  tokenId: string,
  author: string,
  ipfsHash: string,
  filePath: string
): Promise<ContentFingerprintResult | null> => {
  try {
    const fingerprint = computeContentFingerprint(filePath);

    await ContentFingerprint.create({
      nftId,
      tokenId,
      author: author.toLowerCase(),
      ipfsHash,
      phash: fingerprint.phash,
      dhash: fingerprint.dhash,
      ahash: fingerprint.ahash,
      crc32: fingerprint.crc32,
      ssdeep: fingerprint.ssdeep,
      sha256: fingerprint.sha256,
      width: fingerprint.width,
      height: fingerprint.height,
      fileSize: fingerprint.fileSize,
    });

    return fingerprint;
  } catch (error) {
    console.error("Failed to save fingerprint:", error);
    return null;
  }
};
