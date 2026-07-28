import { Router } from "express";
import mongoose from "mongoose";
import { Networks } from "@stellar/stellar-sdk";

const router = Router();

const DEFAULT_HORIZON_URL = "https://horizon-testnet.stellar.org";
const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";

const getMongoStatus = () => {
  const readyState = mongoose.connection.readyState;
  const connected = readyState === 1;

  return {
    status: connected ? "connected" : "disconnected",
    connected,
  };
};

const getStellarVitals = () => {
  const networkPassphrase =
    process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET;
  const network =
    networkPassphrase === Networks.PUBLIC ? "public" : "testnet";
  const horizonUrl = process.env.HORIZON_URL || DEFAULT_HORIZON_URL;
  const rpcUrl = process.env.RPC_URL || DEFAULT_RPC_URL;

  return {
    network,
    networkPassphrase,
    horizonUrl,
    rpcUrl,
    contractConfigured: Boolean(process.env.CONTRACT_ADDRESS_CONTENTREGISTRY),
  };
};

const buildHealthPayload = () => ({
  status: "ok",
  service: process.env.SERVICE_NAME || "demedia-backend",
  version: process.env.APP_VERSION || "1.0.0",
  environment: process.env.NODE_ENV || "development",
  timestamp: new Date().toISOString(),
  uptimeSec: Math.floor(process.uptime()),
  dependencies: {
    mongodb: getMongoStatus(),
    stellar: getStellarVitals(),
  },
});

router.get("/", (_req, res) => {
  res.status(200).json(buildHealthPayload());
});

router.get("/vitals", (_req, res) => {
  res.status(200).json(buildHealthPayload());
});

export default router;
