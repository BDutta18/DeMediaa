# Contract Integration Overview

This project integrates Soroban smart contracts through a dedicated backend integration layer.

## Integration Entry Point

- Primary file (judge-facing): `backend/src/contract-integration.ts`
  - Exposes unified methods for contract actions, with the expensive flows now handled off-chain.
  - Exposes integration verification helpers (`getConfiguredContractAddresses`, `verifyContractIntegration`).
  - Validates required env configuration for contract calls.
- Internal wiring file: `backend/src/web3/contractIntegration.ts`
  - Centralized contract + signer + RPC initialization.

## Integrated Contracts

- `CONTRACT_ADDRESS_CONTENTREGISTRY`

## Where Contracts Are Invoked

- Content registration: `backend/src/web3/uploadContent.ts`
  - Calls `register_content` on ContentRegistry as the only on-chain anchor.
- NFT minting: `backend/src/utils/mintNFT.ts`
  - Records NFT state in MongoDB and emits an off-chain event.
- NFT purchase and settlement: `backend/src/web3/buyNFT.ts`
  - Updates backend state and emits an off-chain event.

## API Routes that Trigger On-Chain Calls

- `POST /api/upload/upload` -> upload + content registration + off-chain mint sync
- `POST /api/nft/buy` -> off-chain buy flow with backend multisig validation

## Network

- Default network passphrase: Stellar Testnet
- Override supported with `STELLAR_NETWORK_PASSPHRASE`
