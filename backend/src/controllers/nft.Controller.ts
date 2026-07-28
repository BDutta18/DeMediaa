import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import Nft from "../models/nft.models";
import { emitPlatformEvent } from "../services/eventBus";

/**
 * @desc    Get all NFTs
 * @route   GET /api/upload/find
 * @access  Public
 */
export const getAllNFTs = asyncHandler(async (req: Request, res: Response) => {
  const nfts = await Nft.find();

  res.status(200).json({
    success: true,
    count: nfts.length,
    data: nfts,
    message:
      nfts.length > 0
        ? `✅ Found ${nfts.length} NFTs`
        : "No NFTs found for the given hash",
  });
});

/**
 * @desc    Get NFTs owned by logged-in user
 * @route   GET /api/nft/my
 * @access  Private
 */
export const myNFTs = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address;

  const nfts = await Nft.find({ owner: userAddress });

  res.status(200).json({
    success: true,
    count: nfts.length,
    data: nfts,
    message:
      nfts.length > 0
        ? `✅ Found ${nfts.length} NFTs for user ${userAddress}`
        : `No NFTs found for user ${userAddress}`,
  });
});

/**
 * @desc    Set or update NFT price
 * @route   PUT /api/nft/:tokenId/price
 * @access  Private
 */
export const setNFTPrice = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address;
  const { tokenId } = req.params;
  const { price } = req.body;

  if (!price || price < 0) {
    return res.status(400).json({
      success: false,
      message: "❌ Please provide a valid price (>= 0)",
    });
  }

  const nft = await Nft.findOne({ tokenId });

  if (!nft) {
    return res.status(404).json({
      success: false,
      message: "❌ NFT not found",
    });
  }

  if (nft.owner.toLowerCase() !== userAddress.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "🚫 You are not the owner of this NFT",
    });
  }

  nft.price = price;
  await nft.save();

  res.status(200).json({
    success: true,
    message: `💰 Price updated to ${price} for NFT ${tokenId}`,
    data: nft,
  });
});

/**
 * @desc    Toggle NFT for sale status
 * @route   PUT /api/nft/:tokenId/sale
 * @access  Private
 */
export const toggleNFTSale = asyncHandler(async (req: Request, res: Response) => {
  const userAddress = (req as any).user.address;
  const { tokenId } = req.params;
  const { forSale } = req.body;

  if (typeof forSale !== "boolean") {
    return res.status(400).json({
      success: false,
      message: "❌ Please provide a valid 'forSale' boolean value",
    });
  }

  const nft = await Nft.findOne({ tokenId });

  if (!nft) {
    return res.status(404).json({
      success: false,
      message: "❌ NFT not found",
    });
  }

  if (nft.owner.toLowerCase() !== userAddress.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "🚫 You are not the owner of this NFT",
    });
  }

  nft.forSale = forSale;
  await nft.save();

  emitPlatformEvent("nft_sale_toggled", {
    tokenId,
    forSale,
    owner: userAddress,
  });

  res.status(200).json({
    success: true,
    message: `🛒 NFT ${tokenId} is now ${forSale ? "listed for sale" : "not for sale"}`,
    data: nft,
  });
});
