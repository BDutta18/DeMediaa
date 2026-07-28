import { Contract, Keypair, Networks, rpc } from "@stellar/stellar-sdk";

const DEFAULT_TESTNET_RPC_URL = "https://soroban-testnet.stellar.org:443";
let warnedRpcFallback = false;

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const getRpcUrl = (): string => {
  const configured = process.env.RPC_URL?.trim();
  if (configured) return configured;

  if (!warnedRpcFallback) {
    warnedRpcFallback = true;
    console.warn(`RPC_URL is missing. Falling back to ${DEFAULT_TESTNET_RPC_URL}`);
  }

  return DEFAULT_TESTNET_RPC_URL;
};

export const getContractIntegration = async () => {
  const rpcServer = new rpc.Server(getRpcUrl());
  const signer = Keypair.fromSecret(requireEnv("PRIVATE_KEY"));
  const sourceAccount = await rpcServer.getAccount(signer.publicKey());

  const contractIds = {
    contentRegistry: requireEnv("CONTRACT_ADDRESS_CONTENTREGISTRY"),
  };

  return {
    rpcServer,
    signer,
    sourceAccount,
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
    contractIds,
    contracts: {
      contentRegistry: new Contract(contractIds.contentRegistry),
    },
  };
};
