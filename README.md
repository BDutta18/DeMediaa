<p align="center">
  <img src="frontend/public/dm-logo-mark.svg" alt="DeMedia Logo" width="120" />
</p>

<h1 align="center">DeMedia</h1>

<p align="center">
  Decentralized Publishing for the Creator Economy
</p>

<p align="center">
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar-Mainnet-7B2D8B?style=for-the-badge&logo=stellar" alt="Stellar Mainnet" /></a>
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar-Testnet-7B2D8B?style=for-the-badge&logo=stellar" alt="Stellar Testnet" /></a>
</p>

<p align="center">
  <a href="https://de-media-xi.vercel.app/">Live Demo</a> •
  <a href="https://youtu.be/gBS61AKJD3o">Demo Video</a> •
  <a href="https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform">Feedback Form</a>
</p>

---

## Screenshots

| Homepage | Gallery |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/cf7a13f0-7af3-43af-aee9-4aa302d1c140" alt="Homepage" width="400" /> | <img src="https://github.com/user-attachments/assets/9490cba9-d328-479e-8270-cb3aed37b51f" alt="Gallery" width="400" /> |

| Dashboard | Mobile View |
|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/886fea58-ba26-431b-ac04-dcea322c41bf" alt="Dashboard" width="400" /> | <img src="https://github.com/user-attachments/assets/151ed43d-20dc-4b57-912b-0c3f71430f3f" alt="Mobile View" width="200" /> |

---

DeMedia is a decentralized media content platform built on Stellar with Soroban smart contracts. The current architecture keeps only the minimal content registry on-chain and moves the expensive NFT, royalty, escrow, and subscription flows off-chain.

## Table of Contents

- [Architecture](#core-architecture)
- [Screenshots](#screenshots)
- [CI/CD Pipeline](#cicd-pipeline)
- [Security Checklist](#security-checklist)
- [Smart Contracts](#smart-contracts)
- [Feedback Updates](#feedback-driven-updates)
- [API Endpoints](#api-endpoints)
- [Data Indexing](#data-indexing)
- [Environment Variables](#environment)
- [Local Development](#local-development)
- [Required Links](#required-submission-links)

## Core Architecture

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 + TypeScript (`frontend/`) |
| **Backend** | Express + TypeScript (`backend/`) |
| **Smart Contracts** | Soroban Rust (`contracts/`) |
| **Database** | MongoDB |
| **Storage** | Pinata / IPFS |
| **Wallet** | Freighter + StellarWalletsKit |
| **Hosting** | Vercel (frontend) + Render (backend) |

## CI/CD Pipeline

| Badge | Status |
| :--- | :--- |
| **CI Workflow** | [![CI](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml/badge.svg)](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml) |
| **Backend Tests** | [![Backend Tests](https://img.shields.io/badge/Backend%20Tests-3%20passing-brightgreen)](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml) |
| **Frontend Build** | [![Frontend Build](https://img.shields.io/badge/Frontend%20Build-passing-brightgreen)](https://github.com/BDutta18/DeMedia/actions/workflows/ci.yml) |

## Security Checklist

- [x] Wallet signature-based authentication (`/api/wallet/verify`)
- [x] JWT-protected routes for user-specific operations
- [x] Centralized auth middleware validation for protected backend endpoints
- [x] Input validation and required-field checks in upload/profile/nft flows
- [x] Structured API error handling with status codes and failure messages
- [x] Secrets moved to environment variables (`JWT_SECRET`, `PRIVATE_KEY`, `PINATA_JWT`, DB URI)
- [x] Contract transaction finality checks before success confirmation
- [x] Server-side ownership checks before NFT price/sale updates
- [x] Testnet explorer verification references for deployment transactions
- [x] CI checks enabled via GitHub Actions workflow badge

## Smart Contracts

### Mainnet

| Contract | Address |
| :--- | :--- |
| **ContentRegistry** | `CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM` |

**Deployment Tx:** [`902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0`](https://stellar.expert/explorer/public/tx/902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0)

### Testnet

Testnet deployments are generated locally with [`scripts/deploy-testnet.sh`](scripts/deploy-testnet.sh). The script writes a `deployment/testnet-deployment.json` artifact containing the testnet contract ID and deploy transaction hash.

Feedback source: [Google Sheets](https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit?gid=1205493588#gid=1205493588)

### Implemented Changes

| # | Feedback | Status | Commit |
| :--- | :--- | :--- | :--- |
| 1 | Search should be top-priority in navigation | Done | [`0729e62`](https://github.com/BDutta18/DeMedia/commit/0729e62) |
| 2 | Add stronger NFT sorting | Done | [`790064e`](https://github.com/BDutta18/DeMedia/commit/790064e) |
| 3 | Document preview / gallery preview issues | In Progress | [`785c6f0`](https://github.com/BDutta18/DeMedia/commit/785c6f0) |
| 4 | Upload lag while handling documents | Planned | — |
| 5 | Profile picture not showing consistently | Planned | — |
| 6 | UI should be improved | Done | [`789fce7`](https://github.com/BDutta18/DeMedia/commit/789fce7) |
| 7 | Buying NFTs as a V2 feature | Planned (V2) | — |
| 8 | General positive feedback | Logged | — |

## API Endpoints

### Public

| Endpoint | Description |
| :--- | :--- |
| `GET /api/health` | Metric dashboard & health check |
| `GET /api/tx/status/:txHash` | Transaction status lookup |
| `GET /api/tx/events/stream` | Realtime transaction stream (SSE) |

### Auth

| Endpoint | Description |
| :--- | :--- |
| `POST /api/wallet/verify` | Wallet signature verification |
| `GET /api/auth/verify` | JWT verification (Next.js proxy) |

### NFTs

| Endpoint | Description |
| :--- | :--- |
| `GET /api/upload/find` | All indexed NFTs feed |
| `GET /api/upload/my-nfts` | Current user NFTs |
| `POST /api/nft/buy` | Purchase NFT (multisig enforced) |
| `POST /api/nft/buy-multisig` | Purchase NFT alias |

**`POST /api/nft/buy` request:**
```json
{
  "tokenId": 12,
  "priceInXLM": "10.5"
}
```

**Successful response:**
```json
{
  "success": true,
  "txHash": "....",
  "buyer": "G....",
  "seller": "G....",
  "royaltyEnabled": true,
  "multisig": {
    "mode": "2-of-2",
    "approvals": ["G_BUYER...", "G_COSIGNER..."]
  }
}
```

### Users

| Endpoint | Description |
| :--- | :--- |
| `GET /api/wallet/search?name=<query>` | Creator search by name |
| `GET /api/wallet/profile/:address` | Profile details by address |

## Data Indexing

- Primary metadata is persisted in MongoDB and linked to on-chain transaction references.
- NFT/content retrieval is indexed for app consumption through backend collection queries.
- Name-based creator discovery is indexed through search query route handling.
- On-chain finality state is indexed into app-readable status (`pending/success/fail`) for UI tracking.

## What's Fully Integrated

- One upload action runs a complete backend pipeline:
  1. Media upload to IPFS (Pinata)
  2. Metadata creation + upload to IPFS
  3. Content fingerprint registration on the minimal on-chain `ContentRegistry`
  4. NFT mint, royalty, escrow, and subscription state handled off-chain in MongoDB / backend services
  5. MongoDB state sync (including off-chain references)
- Wallet disconnect is wired end-to-end (Freighter/StellarWalletsKit disconnect + local app logout).
- Purchase path is validated in the backend and recorded off-chain.
- Frontend API routes use a single normalized backend base URL helper.
- Explorer links are aligned to the active network configuration.

## Environment Variables

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend base URL for frontend |
| `RPC_URL` | Stellar RPC endpoint |
| `PRIVATE_KEY` | Backend signing key |
| `PINATA_JWT` | Pinata IPFS JWT |
| `PINATA_GATEWAY` | Pinata gateway URL |
| `JWT_SECRET` | JWT signing secret |
| `MONGO_URI` | MongoDB connection string |
| `CONTRACT_ADDRESS_CONTENTREGISTRY` | ContentRegistry contract ID |

## Local Development

```bash
# Clone and install backend
cd backend
npm install
npm run dev

# In a separate terminal — frontend
cd ../frontend
npm install
npm run dev
```

### Verification

```bash
# Backend tests (3 passing)
cd backend && npm test

# Frontend build check
cd frontend && npm run build
```

## Required Submission Links

- **Live demo:** https://de-media-xi.vercel.app/
- **Demo video (full MVP):** https://youtu.be/gBS61AKJD3o
- **User feedback document:** https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit
- **Google Form:** https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform
