"use client"

import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit"
import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signMessage as freighterSignMessage,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api"
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter"
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils"
import { getNetworkConfig, useNetworkStore } from "@/lib/network-store"

type WalletAddressResult = { address: string }
type WalletSignMessageResult = { signedMessage: string; signerAddress: string }
type WalletSignTransactionResult = { signedTxXdr: string; signerAddress: string }
type WalletNetworkResult = { network: string; networkPassphrase: string }

const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Request timed out")), ms)),
  ])

const withRetry = async <T>(fn: () => Promise<T>, retries = 2): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries) throw err
      await new Promise((r) => setTimeout(r, 300 * (i + 1)))
    }
  }
  throw new Error("Unexpected retry exit")
}

const getKit = () => {
  const selectedNetwork = useNetworkStore.getState().network
  const config = getNetworkConfig(selectedNetwork)
  StellarWalletsKit.init({
    selectedWalletId: FREIGHTER_ID,
    modules: defaultModules(),
    network: config.isTestnet ? Networks.TESTNET : Networks.PUBLIC,
  })
  return StellarWalletsKit
}

const getSelectedNetworkConfig = () => getNetworkConfig(useNetworkStore.getState().network)

export const getSupportedWallets = async () => {
  try {
    return await timeout(getKit().refreshSupportedWallets(), 3000)
  } catch {
    return []
  }
}

export const connectWallet = async () => {
  try {
    const accessResponse: { address?: string; error?: string } = await timeout(
      freighterRequestAccess() as unknown as Promise<Record<string, unknown>>,
      5000,
    )
    if (accessResponse?.error) throw new Error(accessResponse.error)
    if (accessResponse?.address) return { address: accessResponse.address }
  } catch (error) {
    let hasFreighter = false
    try {
      const connected = await timeout(freighterIsConnected() as unknown as Promise<Record<string, unknown>>, 2000)
      hasFreighter = !connected?.error
    } catch {
      // not available, fall through
    }
    if (hasFreighter) throw error
  }

  const kit = getKit()
  const result = await timeout(kit.authModal(), 10000)
  if (result?.address) return result

  const fallback = await kit.getAddress()
  if (fallback?.address) return fallback

  throw new Error("Wallet connected but no address was returned")
}

export const getWalletAddress = async () => {
  try {
    const result: Record<string, unknown> = await freighterGetAddress() as unknown as Record<string, unknown>
    if (!result?.error && result?.address) return { address: result.address as string }
  } catch {
    // fall back to wallet-kit
  }
  return getKit().getAddress()
}

export const signWalletMessage = async (message: string, address?: string) => {
  const config = getSelectedNetworkConfig()
  try {
    const result: { signedMessage?: string; signerAddress?: string; error?: string } = await timeout(
      freighterSignMessage(message, {
        networkPassphrase: config.passphrase,
        ...(address ? { address } : {}),
      }) as unknown as Promise<Record<string, unknown>>,
      30000,
    )
    if (result?.error) throw new Error(result.error)
    if (result?.signedMessage && result?.signerAddress) {
      return { signedMessage: result.signedMessage, signerAddress: result.signerAddress }
    }
  } catch {
    // fall back to wallet-kit
  }

  return getKit().signMessage(message, {
    networkPassphrase: config.passphrase,
    address,
  })
}

export const signWalletTransaction = async (xdr: string, address?: string) => {
  const config = getSelectedNetworkConfig()
  try {
    const result: { signedTxXdr?: string; signerAddress?: string; error?: string } = await timeout(
      freighterSignTransaction(xdr, {
        networkPassphrase: config.passphrase,
        ...(address ? { address } : {}),
      }) as unknown as Promise<Record<string, unknown>>,
      30000,
    )
    if (result?.error) throw new Error(result.error)
    if (result?.signedTxXdr && result?.signerAddress) {
      return { signedTxXdr: result.signedTxXdr, signerAddress: result.signerAddress }
    }
  } catch {
    // fall back to wallet-kit
  }

  return getKit().signTransaction(xdr, {
    networkPassphrase: config.passphrase,
    address,
  })
}

export const getWalletNetwork = async () => {
  try {
    const result: { network?: string; networkPassphrase?: string; error?: string } = await timeout(
      freighterGetNetwork() as unknown as Promise<Record<string, unknown>>,
      5000,
    )
    if (!result?.error && result?.network && result?.networkPassphrase) {
      return { network: result.network, networkPassphrase: result.networkPassphrase }
    }
  } catch {
    // fall back to wallet-kit
  }
  return getKit().getNetwork()
}

export const disconnectWallet = async () => {
  return getKit().disconnect()
}

export const isFreighterInstalled = async () => {
  if (typeof window === "undefined") return false

  try {
    const result: { error?: string } = await timeout(
      freighterIsConnected() as unknown as Promise<Record<string, unknown>>,
      2000,
    )
    if (!result?.error) return true
  } catch {
    // not available via API, try wallet-kit
  }

  try {
    const kit = getKit()
    const supported = await timeout(kit.refreshSupportedWallets(), 3000)
    return supported.some((w) => w.id === FREIGHTER_ID && w.isAvailable)
  } catch {
    return false
  }
}
