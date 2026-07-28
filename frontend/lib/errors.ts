export type WalletErrorCode =
  | "WALLET_NOT_FOUND"
  | "WALLET_REJECTED"
  | "INSUFFICIENT_BALANCE"
  | "NETWORK_MISMATCH"
  | "AUTH_SERVER_UNREACHABLE"
  | "TIMEOUT"
  | "UNKNOWN"

export const mapWalletError = (error: unknown): { code: WalletErrorCode; message: string } => {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error)

  const message = raw.toLowerCase()

  if (message.includes("timed out") || message.includes("timeout")) {
    return { code: "TIMEOUT", message: "The wallet request timed out. Please try again." }
  }

  if (
    message.includes("wallet") &&
    (message.includes("not found") || message.includes("not installed") || message.includes("unavailable"))
  ) {
    return { code: "WALLET_NOT_FOUND", message: "Wallet not found. Install or enable a Stellar wallet." }
  }

  if (
    message.includes("rejected") ||
    message.includes("declined") ||
    message.includes("denied") ||
    message.includes("cancel") ||
    message.includes("user aborted")
  ) {
    return { code: "WALLET_REJECTED", message: "The request was rejected in your wallet." }
  }

  if (
    message.includes("insufficient") ||
    message.includes("underfunded") ||
    message.includes("tx_insufficient_balance")
  ) {
    return { code: "INSUFFICIENT_BALANCE", message: "Insufficient XLM balance for this transaction." }
  }

  if (message.includes("network") || message.includes("passphrase") || message.includes("switch")) {
    return { code: "NETWORK_MISMATCH", message: "Wrong Stellar network selected in your wallet." }
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed") ||
    message.includes("unable to reach authentication server") ||
    message.includes("service unavailable") ||
    message.includes("verification failed")
  ) {
    return { code: "AUTH_SERVER_UNREACHABLE", message: "Authentication server is unreachable. Please try again in a few seconds." }
  }

  return { code: "UNKNOWN", message: raw }
}
