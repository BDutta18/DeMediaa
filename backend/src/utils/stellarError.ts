export type WalletTxErrorCode =
  | "WALLET_NOT_FOUND"
  | "WALLET_REJECTED"
  | "INSUFFICIENT_BALANCE"
  | "NETWORK_MISMATCH"
  | "UNKNOWN";

const includesAny = (value: string, terms: string[]): boolean =>
  terms.some((term) => value.includes(term));

export const classifyWalletTxError = (error: unknown): WalletTxErrorCode => {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error);

  const message = raw.toLowerCase();

  if (includesAny(message, ["not found", "not installed", "wallet unavailable"])) {
    return "WALLET_NOT_FOUND";
  }

  if (includesAny(message, ["rejected", "declined", "denied", "cancelled", "canceled"])) {
    return "WALLET_REJECTED";
  }

  if (
    includesAny(message, [
      "insufficient",
      "op_underfunded",
      "tx_insufficient_balance",
      "underfunded",
    ])
  ) {
    return "INSUFFICIENT_BALANCE";
  }

  if (includesAny(message, ["network", "passphrase", "wrong network"])) {
    return "NETWORK_MISMATCH";
  }

  return "UNKNOWN";
};
