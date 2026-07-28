import { emitPlatformEvent } from "../services/eventBus";

interface BuyNftArgs {
  tokenId: number;
  priceInXLM: string;
  buyerAddress: string;
  sellerAddress: string;
}

export const buyNFT = async ({ tokenId, priceInXLM, buyerAddress, sellerAddress }: BuyNftArgs) => {
  try {
    const stroops = Math.round(Number(priceInXLM) * 1e7);

    if (!Number.isFinite(stroops) || stroops <= 0) {
      return {
        success: false,
        error: "Invalid XLM amount",
      };
    }

    const txHash = `offchain-buy-${Date.now()}-${tokenId}`;

    emitPlatformEvent("nft_purchased", {
      tokenId,
      priceInXLM,
      txHash,
      buyer: buyerAddress,
      seller: sellerAddress,
      royaltyEnabled: false,
      settlement: "offchain",
    });

    console.log("Buying NFT off-chain:", txHash);

    return {
      success: true,
      txHash,
      buyer: buyerAddress,
      seller: sellerAddress,
      royaltyEnabled: false,
      settlement: "offchain",
    };
  } catch (error: any) {
    console.error("BuyNFT error:", error);
    return {
      success: false,
      error: error.message || error,
    };
  }
};
