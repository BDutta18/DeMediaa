import { Request, Response } from "express";
import { rpc } from "@stellar/stellar-sdk";
import { classifyWalletTxError } from "../utils/stellarError";

export const getTransactionStatus = async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        errorCode: "UNKNOWN",
        message: "Transaction hash is required",
      });
    }

    const rpcServer = new rpc.Server(
      process.env.RPC_URL ?? "https://soroban-testnet.stellar.org"
    );

    const tx = await rpcServer.getTransaction(txHash);

    let status: "pending" | "success" | "fail" = "pending";
    if (tx.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      status = "success";
    } else if (tx.status === rpc.Api.GetTransactionStatus.FAILED) {
      status = "fail";
    }

    return res.status(200).json({
      success: true,
      txHash,
      status,
      rawStatus: tx.status,
    });
  } catch (error) {
    const errorCode = classifyWalletTxError(error);
    return res.status(500).json({
      success: false,
      errorCode,
      message: "Failed to fetch transaction status",
      detail: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
