import { emitPlatformEvent } from "../services/eventBus";
import Nft from "../models/nft.models";

export const mintNFT = async (to: string, metadataURL: string) => {
  try {
    const nextTokenId = (await Nft.countDocuments()) + 1;
    const txHash = `offchain-mint-${Date.now()}-${nextTokenId}`;

    emitPlatformEvent("nft_minted", {
      owner: to,
      metadataURL,
      txHash,
      settlement: "offchain",
    });

    return { success: true, txHash, tokenId: String(nextTokenId) };
  } catch (error: any) {
    console.error("Mint NFT Error:", error);
    return { success: false, error: error.message || error };
  }
};
