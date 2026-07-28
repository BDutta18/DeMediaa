import { uploadContentToBlockchain } from "./web3/uploadContent";
import { mintNFT } from "./utils/mintNFT";
import { buyNFT } from "./web3/buyNFT";
import { getContractIntegration } from "./web3/contractIntegration";

export const CONTRACT_ENV_KEYS = [
  "PRIVATE_KEY",
  "CONTRACT_ADDRESS_CONTENTREGISTRY",
] as const;

export interface ContractAddressMap {
  contentRegistry: string;
}

export interface BuyNftParams {
  tokenId: number;
  priceInXLM: string;
  buyerAddress: string;
  sellerAddress: string;
}

const getMissingEnvKeys = (): string[] =>
  CONTRACT_ENV_KEYS.filter((key) => !process.env[key]);

export const getConfiguredContractAddresses = (): ContractAddressMap => {
  const missing = getMissingEnvKeys();
  if (missing.length > 0) {
    throw new Error(`Missing required contract integration env vars: ${missing.join(", ")}`);
  }

  return {
    contentRegistry: process.env.CONTRACT_ADDRESS_CONTENTREGISTRY!,
  };
};

export const verifyContractIntegration = async () => {
  const context = await getContractIntegration();
  return {
    ok: true,
    networkPassphrase: context.networkPassphrase,
    sourceAddress: context.signer.publicKey(),
    contractIds: context.contractIds,
  };
};

export const contractIntegration = {
  getContext: getContractIntegration,
  getConfiguredContractAddresses,
  verifyContractIntegration,
  registerContent: uploadContentToBlockchain,
  mintContentNft: mintNFT,
  buyNftWithRoyalty: (params: BuyNftParams) => buyNFT(params),
};
