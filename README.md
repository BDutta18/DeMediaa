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

## Feedback-Driven Updates

### User Details (30 Feedback Responses)

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Stellar Wallet Address</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><sub>DEBASMIT BOSE</sub></td><td><sub>debasmitbos22@gmail.com</sub></td><td><sub>GDBMOOICQXCNUTYH7XFZ2XCGR7GYLG5UKHG5VRMWEL3YZ255LXBHMV6L</sub></td></tr>
    <tr><td><sub>Shivanjan Saha</sub></td><td><sub>shivanjan2004@gmail.com</sub></td><td><sub>GBRVG3Q65COSUGCQJFASYSF6BGOTA4FGWM33AAFSZWWB3PL3J2HV3GS5</sub></td></tr>
    <tr><td><sub>Rupam Ghosh</sub></td><td><sub>rupamgh32@gmail.com</sub></td><td><sub>GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46</sub></td></tr>
    <tr><td><sub>Himangshu Sharma</sub></td><td><sub>sharmahimangshu17@gmail.com</sub></td><td><sub>GCC6OFBPL43QGAJLJDQIMKHA7MS7KPH3PJKABRDIAMW7MVTPDNCFKF6F</sub></td></tr>
    <tr><td><sub>Ruma Dey</sub></td><td><sub>anonymousdark35@gmail.com</sub></td><td><sub>GBVWV4DVBRTQ2Y3FHIQW7AN25FQDTYRFCI5BRIYFVY2SVVZZ3VFIK5CD</sub></td></tr>
    <tr><td><sub>Adrija Hati</sub></td><td><sub>hati.1.adrija@gmail.com</sub></td><td><sub>GBTEUTHKT3ZT6NZI2FCTJCDKM6XH7GHVIU723GTJ4LHQBB4YHX5A6DWM</sub></td></tr>
    <tr><td><sub>Swastik Chatterjee</sub></td><td><sub>swastikchatterjee2006@gmail.com</sub></td><td><sub>GCPMZX4LZHUH73UDTNMAJONJ6IQWA4UOXV3WXGXQSGDDSKGVAMADR7RF</sub></td></tr>
    <tr><td><sub>Samriddha Mukherjee</sub></td><td><sub>samriddha.m31@gmail.com</sub></td><td><sub>GANGX6WILRGPVTA3PO7JJHEJ3RYSVERIXDAZDY7GKPQ22MBNRGZENTB2</sub></td></tr>
    <tr><td><sub>Subham Kumar Ojha</sub></td><td><sub>ojhas6667@gmail.com</sub></td><td><sub>GDNAVI5ZZTXP5MLGG4VPVVK77YLXQPTVMRDIDQUABMY7SIYQIKHI2EG6</sub></td></tr>
    <tr><td><sub>Manvi Rao</sub></td><td><sub>manvirao3408@gmail.com</sub></td><td><sub>GCJ2H4AXWGUFTBXUMZGATYTVQTKZVRP4CUG6RW4YYQS3Q2VUKKT74QO6</sub></td></tr>
    <tr><td><sub>Gourab Das</sub></td><td><sub>dgourab574@gmail.com</sub></td><td><sub>GBRHOCMCWL7MDGYKYUBL46TLO2PG6HWW5FA4EARG55JGIVTJTF55C6PZ</sub></td></tr>
    <tr><td><sub>Asmita Banerjee</sub></td><td><sub>asmitabanerjee@gmail.com</sub></td><td><sub>GBVYT72WEZFZQMLPHNYJEH7BZ2ZPUWNF5VJBA5IVLMFLGQUSNBMAX2TO</sub></td></tr>
    <tr><td><sub>SOURAV DAS</sub></td><td><sub>souravd25@gmail.com</sub></td><td><sub>GCFESCZZKGOTPPEBN7VJWJIORR7UEZNUTU7DS36FGZAD4EFM7SXUBIR4</sub></td></tr>
    <tr><td><sub>Riya Chakrobarty</sub></td><td><sub>codingjourney@gmail.com</sub></td><td><sub>GB2F2IITHSA2O2G6WIUJNSQXPNTQWXO2H24ZULZQPQKN2AA4PXODAJVC</sub></td></tr>
    <tr><td><sub>Goutam Dutta</sub></td><td><sub>duttagoutam18@gmail.com</sub></td><td><sub>GDBXMGZNK4L6A5GR43BGYPIWBOXWEWXO77ANSTBZM2P3QFFZBCIRSGUW</sub></td></tr>
    <tr><td><sub>Alokesh Dutta</sub></td><td><sub>alokeshdutta69@gmail.com</sub></td><td><sub>GASBDDXPSHOKKU4JAD7F6O5XFCXMYG4UFCAYXMEPNL2F47XFIUMOEPO7</sub></td></tr>
    <tr><td><sub>Washim Akhtar</sub></td><td><sub>imagoodboy@gmail.com</sub></td><td><sub>GAW7GFJQUBEXJVNQ7PKS6AZ33NSBPFNVS6A5XP5MQTZRJSAT4TTYEIUB</sub></td></tr>
    <tr><td><sub>Sahitya Bose</sub></td><td><sub>bosesahitya7@gmail.com</sub></td><td><sub>GAUQI3ZWDMSFLWXEAF4BQLHNSNXI4PBGMFZ7OPZ3LIOM243G3T7LOHHJ</sub></td></tr>
    <tr><td><sub>Sahil Khan</sub></td><td><sub>sahilkhan230@gmail.com</sub></td><td><sub>GDHPFOZRBMNYYJ7XEIWXDOG6Y24SD6JWVJLCEBSPD6LZNA7ENCD2PTHX</sub></td></tr>
    <tr><td><sub>Subho Ghosh</sub></td><td><sub>ghoshsubho9@gmail.com</sub></td><td><sub>GALGZIGLZVS7Z7R2WD33UNPKCXZYGEWJ4OMZDPIK6LVQHLB5JBFSCLCG</sub></td></tr>
    <tr><td><sub>Ziya Kumari</sub></td><td><sub>coderziya32@gmail.com</sub></td><td><sub>GA6QXNIBL3WXD7QS6PSQPVGPF4UN4DJ7N7I3FA6VXQWNAES4SGAKFZFA</sub></td></tr>
    <tr><td><sub>Sonu Dutta</sub></td><td><sub>sonudutta17@gmail.com</sub></td><td><sub>GCHTO5KOROU4I3JI7NOOQSO5IFUX3TIRG5T32E3BTFUJABL3SIGWV26V</sub></td></tr>
    <tr><td><sub>Adrij Dutta</sub></td><td><sub>adrij7@gmail.com</sub></td><td><sub>GBFTBNCBOMRIAIN32MTO6J4TOMRSQIJZQXX7VBK2ICU5RPWOQHBPWOJ7</sub></td></tr>
    <tr><td><sub>Sumit Kundu</sub></td><td><sub>sumitkundu@gmail.com</sub></td><td><sub>GAWYJX5H5R56ELWUVGKHAWR2SGAMORDU22WEG3NBEHE2QU57XVKR4475</sub></td></tr>
    <tr><td><sub>kaustav Roy</sub></td><td><sub>kaustavroy20@gmail.com</sub></td><td><sub>GB2MCNGO62WZGHL5NOKKPGCNA6LBN32VX4PR2LZKZKUQYC7JORO37DZ7</sub></td></tr>
    <tr><td><sub>Mandib Bhowmick</sub></td><td><sub>bhowmickmandib125@gmail.com</sub></td><td><sub>GDRBW2AZKYRSWBCL3NAMLKLTZ5MWCKHCSYVAAF3TBAMG47NPR3QMM2YB</sub></td></tr>
    <tr><td><sub>Avik Guha</sub></td><td><sub>guhaavik24@gmail.com</sub></td><td><sub>GA6LENTHFAG3UY2HK7V24RBGYKIQTPLPG42G5QT26VILKB7KXLUR2ACI</sub></td></tr>
    <tr><td><sub>Ruby Saini</sub></td><td><sub>rubythequeen@gmail.com</sub></td><td><sub>GAQHH4552GI746UQWFBUR6H2K6G4CAY7PHTWIHLDY6NFO7BF33MNGL77</sub></td></tr>
    <tr><td><sub>Ashok Kumar</sub></td><td><sub>kumarashok1997@gmail.com</sub></td><td><sub>GDNR6QK7MO5Y3B5SDABQ4XGQ57UW4OQGZEUEGQKR4WUL2AFSMNHCUR4D</sub></td></tr>
    <tr><td><sub>Satyabrata Dutta</sub></td><td><sub>dsatyabrata53@gmail.com</sub></td><td><sub>GCKFV3G7OVJGJDBTXQ2HCRQHO4ORTBPYS2V5RFKDGKIQYDY5BTSPH4VN</sub></td></tr>
  </tbody>
</table>

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
