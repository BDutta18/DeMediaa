import {
  BASE_FEE,
  TransactionBuilder,
  Contract,
  xdr,
  rpc,
  Keypair,
  Networks,
  nativeToScVal,
} from "@stellar/stellar-sdk";
import { emitPlatformEvent } from "../services/eventBus";
import { waitForTransactionFinality } from "../services/txTracker";
import { getContractIntegration } from "./contractIntegration";

export const uploadContentToBlockchain = async (
  cid: string,
  fileHash: string,
  price: number = 0,
  paymentToken: string = "",
  retryCount: number = 0
): Promise<{ success: boolean; txHash?: string; contentId?: string; error?: unknown }> => {
  void price;
  void paymentToken;

  try {
    const { rpcServer, signer, sourceAccount, networkPassphrase, contractIds } = await getContractIntegration();

    let sendRes: { hash: string };
    let statusRpc = rpcServer;

    try {
      const tx = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase,
      })
        .addOperation(
          new Contract(contractIds.contentRegistry).call(
            "register_content",
            xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccount(signer.xdrPublicKey())),
            xdr.ScVal.scvString(fileHash)
          )
        )
        .setTimeout(30)
        .build();

      const preppedTx = await rpcServer.prepareTransaction(tx);
      preppedTx.sign(signer);
      sendRes = await rpcServer.sendTransaction(preppedTx);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("Bad union switch")) {
        throw err;
      }

      // Fallback path for edge RPC/XDR incompatibilities.
      const fallbackRpc = new rpc.Server(process.env.RPC_URL ?? "https://soroban-testnet.stellar.org:443");
      const fallbackSigner = Keypair.fromSecret(process.env.PRIVATE_KEY!);
      const fallbackAccount = await fallbackRpc.getAccount(fallbackSigner.publicKey());

      const fallbackTx = new TransactionBuilder(fallbackAccount, {
        fee: BASE_FEE,
        networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
      })
        .addOperation(
          new Contract(contractIds.contentRegistry).call(
            "register_content",
            nativeToScVal(fallbackSigner.publicKey(), { type: "address" }),
            nativeToScVal(fileHash, { type: "string" })
          )
        )
        .setTimeout(30)
        .build();

      const preparedFallback = await fallbackRpc.prepareTransaction(fallbackTx);
      preparedFallback.sign(fallbackSigner);
      sendRes = await fallbackRpc.sendTransaction(preparedFallback);
      statusRpc = fallbackRpc;
    }

    const finality = await waitForTransactionFinality(statusRpc, sendRes.hash, {
      action: "register_content",
      cid,
      fileHash,
    });

    if (finality.status !== "success") {
      return { success: false, error: "Transaction failed before finality", txHash: sendRes.hash };
    }

    emitPlatformEvent("nft_minted", {
      txHash: sendRes.hash,
      contentId: fileHash,
      cid,
    });

    return {
      success: true,
      txHash: sendRes.hash,
      contentId: fileHash,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Error(Contract, #3)") ||
      message.includes("HostError: Error(Contract, #3)") ||
      message.includes("ScErrorType::Contract")
    ) {
      // Contract-level duplicate/already-registered style failures are treated as idempotent success.
      return {
        success: true,
        txHash: undefined,
        contentId: fileHash,
      };
    }

    const accountMatch = message.match(/Account not found:\s*([A-Z0-9]+)/i);

    if (accountMatch?.[1]) {
      const missingAddress = accountMatch[1];
      const isTestnet =
        (process.env.RPC_URL || "").includes("testnet") ||
        (process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET) === Networks.TESTNET;

      if (isTestnet && retryCount < 1) {
        try {
          const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(missingAddress)}`;
          const fundRes = await fetch(friendbotUrl);
          if (fundRes.ok) {
            return await uploadContentToBlockchain(cid, fileHash, price, paymentToken, retryCount + 1);
          }
          const fundDetail = await fundRes.text();
          console.error(`Friendbot funding failed for ${missingAddress}:`, fundDetail);
        } catch (friendbotError) {
          console.error(`Friendbot funding error for ${missingAddress}:`, friendbotError);
        }
      }

      const friendlyError = new Error(
        `Stellar source account not found on network for PRIVATE_KEY public key ${missingAddress}.`
      );
      (friendlyError as any).code = "STELLAR_SOURCE_ACCOUNT_NOT_FOUND";
      (friendlyError as any).address = missingAddress;
      console.error("UploadContent error:", friendlyError.message);
      return { success: false, error: friendlyError };
    }

    console.error("UploadContent error:", error);
    return { success: false, error };
  }
};
