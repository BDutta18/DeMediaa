"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type NetworkMode = "testnet" | "mainnet"

export type NetworkConfig = {
  id: NetworkMode
  label: string
  badge: string
  horizonUrl: string
  explorerUrl: string
  friendbotUrl?: string
  passphrase: string
  isTestnet: boolean
}

export const NETWORKS: Record<NetworkMode, NetworkConfig> = {
  testnet: {
    id: "testnet",
    label: "Testnet",
    badge: "● Testnet",
    horizonUrl: "https://horizon-testnet.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/testnet",
    friendbotUrl: "https://friendbot.stellar.org",
    passphrase: "Test SDF Network ; September 2015",
    isTestnet: true,
  },
  mainnet: {
    id: "mainnet",
    label: "Mainnet",
    badge: "● Mainnet",
    horizonUrl: "https://horizon.stellar.org",
    explorerUrl: "https://stellar.expert/explorer/public",
    passphrase: "Public Global Stellar Network ; September 2015",
    isTestnet: false,
  },
}

type NetworkStore = {
  network: NetworkMode
  setNetwork: (network: NetworkMode) => void
  toggleNetwork: () => void
}

export const useNetworkStore = create<NetworkStore>()(
  persist(
    (set, get) => ({
      network: "testnet",
      setNetwork: (network) => set({ network }),
      toggleNetwork: () => set({ network: get().network === "testnet" ? "mainnet" : "testnet" }),
    }),
    {
      name: "demedia-network-mode",
      partialize: (state) => ({ network: state.network }),
    },
  ),
)

export const getNetworkConfig = (network: NetworkMode) => NETWORKS[network]

export const formatNetworkLabel = (network: NetworkMode) => NETWORKS[network].label
