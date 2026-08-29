/**
 * Centralised configuration for the DeMedia backend.
 * All environment variable reads should go through this module.
 */

export const config = {
  // --- Server ------------------------------------------------
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  serviceName: process.env.SERVICE_NAME ?? "demedia-backend",
  appVersion: process.env.APP_VERSION ?? "1.0.0",
  isDev: (process.env.NODE_ENV ?? "development") === "development",

  // --- Database ----------------------------------------------
  mongoUri: process.env.MONGO_URI ?? "",
  dbName: process.env.DB_NAME ?? "phDB",

  // --- Auth --------------------------------------------------
  jwtSecret: process.env.JWT_SECRET ?? "changeme",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",

  // --- Stellar -----------------------------------------------
  privateKey: process.env.PRIVATE_KEY ?? "",
  rpcUrl: process.env.RPC_URL ?? "https://soroban-testnet.stellar.org",
  horizonUrl: process.env.HORIZON_URL ?? "https://horizon-testnet.stellar.org",
  networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015",
  contractContentRegistry: process.env.CONTRACT_ADDRESS_CONTENTREGISTRY ?? "",

  // --- IPFS / Pinata -----------------------------------------
  pinataJwt: process.env.PINATA_JWT ?? "",
  pinataGateway: process.env.PINATA_GATEWAY ?? "https://gateway.pinata.cloud",
} as const

/** Database name constant kept for backward-compat imports. */
export const DB_NAME = config.dbName
