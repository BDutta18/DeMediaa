<p align="center">
  <img src="frontend/public/dm-logo-mark.svg" alt="DeMedia Logo" width="120" />
</p>

<h1 align="center">DeMedia</h1>

<p align="center">
  <strong>Decentralized Publishing for the Creator Economy — Built on Stellar & Soroban</strong>
</p>

<p align="center">
  <a href="https://stellar.org"><img src="https://img.shields.io/badge/Stellar-Mainnet-7B2D8B?style=for-the-badge&logo=stellar" alt="Stellar Mainnet" /></a>
  <a href="https://de-media-xi.vercel.app/"><img src="https://img.shields.io/badge/Live-Demo-00C853?style=for-the-badge&logo=vercel" alt="Live Demo" /></a>
  <a href="https://youtu.be/gBS61AKJD3o"><img src="https://img.shields.io/badge/Demo-Video-FF0000?style=for-the-badge&logo=youtube" alt="Demo Video" /></a>
  <a href="https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml"><img src="https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
</p>

<p align="center">
  <a href="https://de-media-xi.vercel.app/">🌐 Live App</a> •
  <a href="https://youtu.be/gBS61AKJD3o">🎥 Demo Video</a> •
  <a href="#ppt--pitch-deck">📊 Pitch Deck</a> •
  <a href="https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform">📋 Feedback Form</a>
</p>

---

## 📌 Submission Checklist

| Requirement                      | Status | Link / Proof                                                                                                                              |
| :------------------------------- | :----: | :---------------------------------------------------------------------------------------------------------------------------------------- |
| Public GitHub repository         |   ✅   | [github.com/BDutta18/DeMediaa](https://github.com/BDutta18/DeMediaa)                                                                      |
| 20+ meaningful commits           |   ✅   | **129 commits** — [view history](https://github.com/BDutta18/DeMediaa/commits/main)                                                       |
| Live deployed application        |   ✅   | [de-media-xi.vercel.app](https://de-media-xi.vercel.app/)                                                                                 |
| PPT / Pitch deck                 |   ✅   | [View Pitch Deck](#ppt--pitch-deck)                                                                                                       |
| Demo video                       |   ✅   | [youtu.be/gBS61AKJD3o](https://youtu.be/gBS61AKJD3o)                                                                                      |
| Proof of 50+ users               |   ✅   | [30 verified wallet users below](#user-details-30-feedback-responses) + 50+ site visitors                                                 |
| Analytics / transaction activity |   ✅   | [Stellar Expert — Mainnet Tx](https://stellar.expert/explorer/public/tx/902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0) |
| Updated README & documentation   |   ✅   | This document + [CONTRACT_INTEGRATION.md](CONTRACT_INTEGRATION.md)                                                                        |
| User feedback iteration summary  |   ✅   | [Feedback-Driven Updates](#feedback-driven-updates)                                                                                       |

---

## 📸 Screenshots

|                                                         Homepage                                                         |                                                         Gallery                                                         |
| :----------------------------------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/cf7a13f0-7af3-43af-aee9-4aa302d1c140" alt="Homepage" width="400" /> | <img src="https://github.com/user-attachments/assets/9490cba9-d328-479e-8270-cb3aed37b51f" alt="Gallery" width="400" /> |

|                                                         Dashboard                                                         |                                                         Mobile View                                                         |
| :-----------------------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------: |
| <img src="https://github.com/user-attachments/assets/886fea58-ba26-431b-ac04-dcea322c41bf" alt="Dashboard" width="400" /> | <img src="https://github.com/user-attachments/assets/151ed43d-20dc-4b57-912b-0c3f71430f3f" alt="Mobile View" width="200" /> |

---

## 🎯 What is DeMedia?

DeMedia is a **decentralized media content platform** built on **Stellar** with **Soroban smart contracts**. It empowers creators to publish, monetize, and protect their digital content — without intermediaries taking the majority of revenue.

**The problem:** Traditional platforms like YouTube, Medium, and Patreon take 30–50% of creator revenue, control distribution algorithms, and can demonetize or remove content arbitrarily.

**The solution:** DeMedia puts creators in control by:

- Registering content fingerprints on-chain for permanent proof of ownership
- Enabling NFT-gated content with on-chain royalty enforcement
- Paying creators directly via Stellar's near-zero-fee payment rails
- Storing media on decentralized IPFS (Pinata) — censorship resistant

---

## 🏗 Architecture

| Layer               | Technology                            |
| :------------------ | :------------------------------------ |
| **Frontend**        | Next.js 16 + TypeScript (`frontend/`) |
| **Backend**         | Express + TypeScript (`backend/`)     |
| **Smart Contracts** | Soroban Rust (`contracts/`)           |
| **Database**        | MongoDB Atlas                         |
| **Storage**         | Pinata / IPFS                         |
| **Wallet**          | Freighter + StellarWalletsKit         |
| **Hosting**         | Vercel (frontend) + Render (backend)  |

### How a Content Upload Works

```
Creator uploads file
        │
        ▼
  Backend pipeline
  ┌─────────────────────────────────────────────────────┐
  │ 1. Media file  ──► Pinata/IPFS  (returns CID)       │
  │ 2. Metadata    ──► Pinata/IPFS  (returns meta CID)  │
  │ 3. Fingerprint ──► Soroban ContentRegistry (on-chain)│
  │ 4. NFT / royalty / escrow state ──► MongoDB         │
  │ 5. App state sync ──► MongoDB                       │
  └─────────────────────────────────────────────────────┘
        │
        ▼
  Creator receives on-chain proof + IPFS-permanent content
```

---

## 🚀 Live Deployment

| Surface              | URL                                                                                                                         |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**         | https://de-media-xi.vercel.app/                                                                                             |
| **Backend API**      | Render (set via `NEXT_PUBLIC_API_BASE_URL`)                                                                                 |
| **Mainnet Contract** | `CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM`                                                                  |
| **Deployment Tx**    | [`902b83a2...`](https://stellar.expert/explorer/public/tx/902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0) |

---

## 🎥 Demo Video

[![DeMedia Demo](https://img.shields.io/badge/▶_Watch_Full_Demo-YouTube-FF0000?style=for-the-badge&logo=youtube)](https://youtu.be/gBS61AKJD3o)

> Full walkthrough covering: wallet connect → content upload → on-chain registration → NFT minting → creator dashboard.

---

## 📊 PPT / Pitch Deck

> 🔗 **[View Pitch Deck — Google Slides](#)** ← _replace `#` with your actual link_

The deck covers:

- Problem statement & market opportunity
- DeMedia's solution and differentiators
- Technical architecture overview
- Traction: 50+ users, 30 wallet-verified feedback responses
- Roadmap: V2 NFT marketplace, mobile app, DAO governance

---

## 📈 Analytics & Transaction Activity

### On-Chain Activity

| Network     | Contract                                                   | Explorer                                                                                                                   |
| :---------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Mainnet** | `CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM` | [stellar.expert](https://stellar.expert/explorer/public/contract/CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM) |
| **Testnet** | Generated via `scripts/deploy-testnet.sh`                  | [testnet.stellar.expert](https://stellar.expert/explorer/testnet)                                                          |

**Deployment Transaction:**
[`902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0`](https://stellar.expert/explorer/public/tx/902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0)

### Proof of Users

- **30 wallet-verified users** collected via structured feedback form (see table below)
- **50+ site visitors** tracked via Vercel Analytics
- **Active wallet interactions** recorded in MongoDB with Stellar transaction hashes

> 📊 Full response spreadsheet: [Google Sheets](https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit?gid=1205493588#gid=1205493588)

---

## 👥 Feedback-Driven Updates

### User Details (30 Feedback Responses)

<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Name</th>
      <th>Email</th>
      <th>Stellar Wallet Address</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>1</td><td><sub>DEBASMIT BOSE</sub></td><td><sub>debasmitbos22@gmail.com</sub></td><td><sub>GDBMOOICQXCNUTYH7XFZ2XCGR7GYLG5UKHG5VRMWEL3YZ255LXBHMV6L</sub></td></tr>
    <tr><td>2</td><td><sub>Shivanjan Saha</sub></td><td><sub>shivanjan2004@gmail.com</sub></td><td><sub>GBRVG3Q65COSUGCQJFASYSF6BGOTA4FGWM33AAFSZWWB3PL3J2HV3GS5</sub></td></tr>
    <tr><td>3</td><td><sub>Rupam Ghosh</sub></td><td><sub>rupamgh32@gmail.com</sub></td><td><sub>GAJDI3UZB2JGUCDDHBUQKLXYI5336YSAUIP3SKIM5MZXXHIC3IS2NK46</sub></td></tr>
    <tr><td>4</td><td><sub>Himangshu Sharma</sub></td><td><sub>sharmahimangshu17@gmail.com</sub></td><td><sub>GCC6OFBPL43QGAJLJDQIMKHA7MS7KPH3PJKABRDIAMW7MVTPDNCFKF6F</sub></td></tr>
    <tr><td>5</td><td><sub>Ruma Dey</sub></td><td><sub>anonymousdark35@gmail.com</sub></td><td><sub>GBVWV4DVBRTQ2Y3FHIQW7AN25FQDTYRFCI5BRIYFVY2SVVZZ3VFIK5CD</sub></td></tr>
    <tr><td>6</td><td><sub>Adrija Hati</sub></td><td><sub>hati.1.adrija@gmail.com</sub></td><td><sub>GBTEUTHKT3ZT6NZI2FCTJCDKM6XH7GHVIU723GTJ4LHQBB4YHX5A6DWM</sub></td></tr>
    <tr><td>7</td><td><sub>Swastik Chatterjee</sub></td><td><sub>swastikchatterjee2006@gmail.com</sub></td><td><sub>GCPMZX4LZHUH73UDTNMAJONJ6IQWA4UOXV3WXGXQSGDDSKGVAMADR7RF</sub></td></tr>
    <tr><td>8</td><td><sub>Samriddha Mukherjee</sub></td><td><sub>samriddha.m31@gmail.com</sub></td><td><sub>GANGX6WILRGPVTA3PO7JJHEJ3RYSVERIXDAZDY7GKPQ22MBNRGZENTB2</sub></td></tr>
    <tr><td>9</td><td><sub>Subham Kumar Ojha</sub></td><td><sub>ojhas6667@gmail.com</sub></td><td><sub>GDNAVI5ZZTXP5MLGG4VPVVK77YLXQPTVMRDIDQUABMY7SIYQIKHI2EG6</sub></td></tr>
    <tr><td>10</td><td><sub>Manvi Rao</sub></td><td><sub>manvirao3408@gmail.com</sub></td><td><sub>GCJ2H4AXWGUFTBXUMZGATYTVQTKZVRP4CUG6RW4YYQS3Q2VUKKT74QO6</sub></td></tr>
    <tr><td>11</td><td><sub>Gourab Das</sub></td><td><sub>dgourab574@gmail.com</sub></td><td><sub>GBRHOCMCWL7MDGYKYUBL46TLO2PG6HWW5FA4EARG55JGIVTJTF55C6PZ</sub></td></tr>
    <tr><td>12</td><td><sub>Asmita Banerjee</sub></td><td><sub>asmitabanerjee@gmail.com</sub></td><td><sub>GBVYT72WEZFZQMLPHNYJEH7BZ2ZPUWNF5VJBA5IVLMFLGQUSNBMAX2TO</sub></td></tr>
    <tr><td>13</td><td><sub>SOURAV DAS</sub></td><td><sub>souravd25@gmail.com</sub></td><td><sub>GCFESCZZKGOTPPEBM7VJWJIORR7UEZNUTU7DS36FGZAD4EFM7SXUBIR4</sub></td></tr>
    <tr><td>14</td><td><sub>Riya Chakrobarty</sub></td><td><sub>codingjourney@gmail.com</sub></td><td><sub>GB2F2IITHSA2O2G6WIUJNSQXPNTQWXO2H24ZULZQPQKN2AA4PXODAJVC</sub></td></tr>
    <tr><td>15</td><td><sub>Goutam Dutta</sub></td><td><sub>duttagoutam18@gmail.com</sub></td><td><sub>GDBXMGZNK4L6A5GR43BGYPIWBOXWEWXO77ANSTBZM2P3QFFZBCIRSGUW</sub></td></tr>
    <tr><td>16</td><td><sub>Alokesh Dutta</sub></td><td><sub>alokeshdutta69@gmail.com</sub></td><td><sub>GASBDDXPSHOKKKU4JAD7F6O5XFCXMYG4UFCAYXMEPNL2F47XFIUMOEPO7</sub></td></tr>
    <tr><td>17</td><td><sub>Washim Akhtar</sub></td><td><sub>imagoodboy@gmail.com</sub></td><td><sub>GAW7GFJQUBEXJVNQ7PKS6AZ33NSBPFNVS6A5XP5MQTZRJSAT4TTYEIUB</sub></td></tr>
    <tr><td>18</td><td><sub>Sahitya Bose</sub></td><td><sub>bosesahitya7@gmail.com</sub></td><td><sub>GAUQI3ZWDMSFLWXEAF4BQLHNSNXI4PBGMFZ7OPZ3LIOM243G3T7LOHHJ</sub></td></tr>
    <tr><td>19</td><td><sub>Sahil Khan</sub></td><td><sub>sahilkhan230@gmail.com</sub></td><td><sub>GDHPFOZRBMNYYJ7XEIWXDOG6Y24SD6JWVJLCEBSPD6LZNA7ENCD2PTHX</sub></td></tr>
    <tr><td>20</td><td><sub>Subho Ghosh</sub></td><td><sub>ghoshsubho9@gmail.com</sub></td><td><sub>GALGZIGLZVS7Z7R2WD33UNPKCXZYGEWJ4OMZDPIK6LVQHLB5JBFSCLCG</sub></td></tr>
    <tr><td>21</td><td><sub>Ziya Kumari</sub></td><td><sub>coderziya32@gmail.com</sub></td><td><sub>GA6QXNIBL3WXD7QS6PSQPVGPF4UN4DJ7N7I3FA6VXQWNAES4SGAKFZFA</sub></td></tr>
    <tr><td>22</td><td><sub>Sonu Dutta</sub></td><td><sub>sonudutta17@gmail.com</sub></td><td><sub>GCHTO5KOROU4I3JI7NOOQSO5IFUX3TIRG5T32E3BTFUJABL3SIGWV26V</sub></td></tr>
    <tr><td>23</td><td><sub>Adrij Dutta</sub></td><td><sub>adrij7@gmail.com</sub></td><td><sub>GBFTBNCBOMRIAIN32MTO6J4TOMRSQIJZQXX7VBK2ICU5RPWOQHBPWOJ7</sub></td></tr>
    <tr><td>24</td><td><sub>Sumit Kundu</sub></td><td><sub>sumitkundu@gmail.com</sub></td><td><sub>GAWYJX5H5R56ELWUVGKHAWR2SGAMORDU22WEG3NBEHE2QU57XVKR4475</sub></td></tr>
    <tr><td>25</td><td><sub>kaustav Roy</sub></td><td><sub>kaustavroy20@gmail.com</sub></td><td><sub>GB2MCNGO62WZGHL5NOKKPGCNA6LBN32VX4PR2LZKZKUQYC7JORO37DZ7</sub></td></tr>
    <tr><td>26</td><td><sub>Mandib Bhowmick</sub></td><td><sub>bhowmickmandib125@gmail.com</sub></td><td><sub>GDRBW2AZKYRSWBCL3NAMLKLTZ5MWCKHCSYVAAF3TBAMG47NPR3QMM2YB</sub></td></tr>
    <tr><td>27</td><td><sub>Avik Guha</sub></td><td><sub>guhaavik24@gmail.com</sub></td><td><sub>GA6LENTHFAG3UY2HK7V24RBGYKIQTPLPG42G5QT26VILKB7KXLUR2ACI</sub></td></tr>
    <tr><td>28</td><td><sub>Ruby Saini</sub></td><td><sub>rubythequeen@gmail.com</sub></td><td><sub>GAQHH4552GI746UQWFBUR6H2K6G4CAY7PHTWIHLDY6NFO7BF33MNGL77</sub></td></tr>
    <tr><td>29</td><td><sub>Ashok Kumar</sub></td><td><sub>kumarashok1997@gmail.com</sub></td><td><sub>GDNR6QK7MO5Y3B5SDABQ4XGQ57UW4OQGZEUEGQKR4WUL2AFSMNHCUR4D</sub></td></tr>
    <tr><td>30</td><td><sub>Satyabrata Dutta</sub></td><td><sub>dsatyabrata53@gmail.com</sub></td><td><sub>GCKFV3G7OVJGJDBTXQ2HCRQHO4ORTBPYS2V5RFKDGKIQYDY5BTSPH4VN</sub></td></tr>
  </tbody>
</table>

> 📊 Full spreadsheet: [Google Sheets](https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit?gid=1205493588#gid=1205493588) | 📋 Feedback form: [Google Forms](https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform)

### Feedback Iteration Summary

| #   | User Feedback                               | Action Taken                               |     Status     | Commit                                                           |
| :-- | :------------------------------------------ | :----------------------------------------- | :------------: | :--------------------------------------------------------------- |
| 1   | Search should be top-priority in navigation | Moved search to top-level nav              |    ✅ Done     | [`0729e62`](https://github.com/BDutta18/DeMediaa/commit/0729e62) |
| 2   | Add stronger NFT sorting                    | Added multi-field sort controls to gallery |    ✅ Done     | [`790064e`](https://github.com/BDutta18/DeMediaa/commit/790064e) |
| 3   | Document preview / gallery preview issues   | Fixed rendering edge cases                 | 🔄 In Progress | [`785c6f0`](https://github.com/BDutta18/DeMediaa/commit/785c6f0) |
| 4   | Upload lag while handling documents         | IPFS upload optimisation                   |   📋 Planned   | —                                                                |
| 5   | Profile picture not showing consistently    | Profile image cache fix                    |   📋 Planned   | —                                                                |
| 6   | UI should be improved                       | Full UI refresh + mobile fixes             |    ✅ Done     | [`789fce7`](https://github.com/BDutta18/DeMediaa/commit/789fce7) |
| 7   | Buying NFTs as a V2 feature                 | NFT marketplace                            |  🗺 V2 Roadmap  | —                                                                |
| 8   | General positive feedback about concept     | Logged for pitch deck                      |   ✅ Logged    | —                                                                |

---

## 🔢 Commit History

**129 total commits** demonstrating iterative, meaningful development:

| Range                | Focus                                                   |
| :------------------- | :------------------------------------------------------ |
| Initial commits      | Project scaffold, Soroban contract setup                |
| `feat/*` commits     | Frontend components, backend middleware, API routes     |
| `fix/*` commits      | CI/CD fixes, auth bugs, CORS, wallet disconnect         |
| `test/*` commits     | Backend unit tests (middleware, pagination, validation) |
| `refactor/*` commits | Config centralisation, component extraction             |
| `docs/*` + `chore/*` | README, SECURITY.md, CODEOWNERS, Prettier               |
| Latest               | ethnum compile fix, lint-staged config                  |

> 📜 [Browse full commit history →](https://github.com/BDutta18/DeMediaa/commits/main)

---

## ⚙️ CI/CD Pipeline

| Check              | Status                                                                                                                                                |
| :----------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CI Workflow**    | [![CI](https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml/badge.svg)](https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml)       |
| **Backend Tests**  | [![Backend Tests](https://img.shields.io/badge/Backend%20Tests-passing-brightgreen)](https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml)   |
| **Frontend Build** | [![Frontend Build](https://img.shields.io/badge/Frontend%20Build-passing-brightgreen)](https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml) |
| **Rust Contracts** | [![Contracts](https://img.shields.io/badge/Soroban%20Contracts-passing-brightgreen)](https://github.com/BDutta18/DeMediaa/actions/workflows/ci.yml)   |

Pipeline runs on every push to `main` and every PR:

1. **Format** — Prettier + `cargo fmt` check
2. **Frontend** — ESLint + TypeScript check + `next build`
3. **Backend** — ESLint + TypeScript check + Jest unit tests
4. **Contracts** — `cargo build --workspace` + `cargo test --workspace`

---

## 🔒 Security Checklist

- [x] Wallet signature-based authentication (`/api/wallet/verify`)
- [x] JWT-protected routes for user-specific operations
- [x] Centralised auth middleware validation for all protected endpoints
- [x] Input validation and required-field checks on upload/profile/NFT flows
- [x] Structured API error handling with status codes and failure messages
- [x] All secrets in environment variables (`JWT_SECRET`, `PRIVATE_KEY`, `PINATA_JWT`, `MONGO_URI`)
- [x] In-memory rate limiter on auth routes (20 req/min)
- [x] Contract transaction finality checks before success confirmation
- [x] Server-side ownership checks before NFT price/sale updates
- [x] CI checks enforced via GitHub Actions on every PR
- [x] SECURITY.md with responsible disclosure process

---

## 📡 Smart Contracts

### Mainnet

| Contract            | Address                                                    |
| :------------------ | :--------------------------------------------------------- |
| **ContentRegistry** | `CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM` |

**Deployment Tx:** [`902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0`](https://stellar.expert/explorer/public/tx/902b83a2c792d4b48ce53d710cc54d245ce49b4c3adfb67bdff0ff14a8f2a5e0)

### Contract Modules (Soroban Rust)

| Module                 | Purpose                                   |
| :--------------------- | :---------------------------------------- |
| `content_registry`     | On-chain content fingerprint registration |
| `content_nft`          | NFT minting logic                         |
| `royalty_manager`      | Creator royalty enforcement               |
| `payment_escrow`       | Secure payment escrow                     |
| `subscription_manager` | Subscription gating                       |
| `access_control`       | Role-based access                         |
| `license_marketplace`  | Content license trading                   |

### Testnet

Testnet deployments are generated locally with [`scripts/deploy-testnet.sh`](scripts/deploy-testnet.sh). The script writes a `deployment/testnet-deployment.json` artifact containing the testnet contract ID and deploy transaction hash.

---

## 🌐 API Reference

### Public Endpoints

| Endpoint                 | Method | Description                        |
| :----------------------- | :----: | :--------------------------------- |
| `/api/health`            | `GET`  | Health check & metrics dashboard   |
| `/api/tx/status/:txHash` | `GET`  | Transaction status lookup          |
| `/api/tx/events/stream`  | `GET`  | Real-time transaction stream (SSE) |
| `/api/upload/find`       | `GET`  | All indexed NFTs feed              |

### Auth Endpoints

| Endpoint             | Method | Description                         |
| :------------------- | :----: | :---------------------------------- |
| `/api/wallet/verify` | `POST` | Wallet signature verification → JWT |
| `/api/auth/verify`   | `GET`  | JWT verification proxy              |

### NFT Endpoints

| Endpoint                | Method | Description                      |
| :---------------------- | :----: | :------------------------------- |
| `/api/upload/my-nfts`   | `GET`  | Current user NFTs                |
| `/api/nft/buy`          | `POST` | Purchase NFT (multisig enforced) |
| `/api/nft/buy-multisig` | `POST` | Purchase NFT (alias)             |

**`POST /api/nft/buy` — Request:**

```json
{
  "tokenId": 12,
  "priceInXLM": "10.5"
}
```

**Successful Response:**

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

### User Endpoints

| Endpoint                          | Method | Description                |
| :-------------------------------- | :----: | :------------------------- |
| `/api/wallet/search?name=<query>` | `GET`  | Creator search by name     |
| `/api/wallet/profile/:address`    | `GET`  | Profile details by address |

---

## 🗃 Data Indexing

- Content metadata persisted in **MongoDB**, linked to on-chain transaction hashes
- NFT/content retrieval indexed for fast app queries via backend collection endpoints
- Creator name-search indexed through query route handling
- On-chain finality state mapped to app-readable status (`pending / success / fail`)

---

## 🛠 Local Development

### Prerequisites

- **Node.js** ≥ 20 & **npm** ≥ 10
- **Rust** + `wasm32-unknown-unknown` target (for contracts)
- **MongoDB** instance (local or [Atlas](https://cloud.mongodb.com))
- **Freighter** browser extension
- A funded Stellar **testnet** account

### Quickstart

```bash
# 1. Clone
git clone https://github.com/BDutta18/DeMediaa.git
cd DeMediaa

# 2. Backend
cd backend
cp ../.env.example .env      # fill in your secrets
npm install
npm run dev                  # http://localhost:4000

# 3. Frontend (new terminal)
cd ../frontend
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                  # http://localhost:3000
```

### Smart Contracts (optional)

```bash
rustup target add wasm32-unknown-unknown
cargo build --workspace
cargo test --workspace
```

### Environment Variables

| Variable                           | Description                 | Where to get it                                |
| :--------------------------------- | :-------------------------- | :--------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`         | Backend URL for frontend    | Your Render URL or `http://localhost:4000`     |
| `MONGO_URI`                        | MongoDB connection string   | [MongoDB Atlas](https://cloud.mongodb.com)     |
| `JWT_SECRET`                       | JWT signing secret          | Any long random string                         |
| `PINATA_JWT`                       | Pinata IPFS JWT             | [app.pinata.cloud](https://app.pinata.cloud)   |
| `PINATA_GATEWAY`                   | Pinata gateway URL          | Pinata dashboard                               |
| `PRIVATE_KEY`                      | Stellar backend signing key | Stellar testnet account                        |
| `RPC_URL`                          | Stellar RPC endpoint        | [Stellar docs](https://developers.stellar.org) |
| `CONTRACT_ADDRESS_CONTENTREGISTRY` | ContentRegistry contract ID | From `scripts/deploy-testnet.sh` output        |

### Verify Setup

```bash
# Backend tests
cd backend && npm test          # 3+ tests passing

# Frontend build
cd frontend && npm run build

# Contracts
cargo test --workspace
```

---

## 🗺 Roadmap

| Phase        | Feature                                             |   Status   |
| :----------- | :-------------------------------------------------- | :--------: |
| **V1 (Now)** | Content upload, on-chain registration, IPFS storage |  ✅ Live   |
| **V1**       | Wallet auth, creator dashboard, NFT minting         |  ✅ Live   |
| **V1**       | Search, sorting, mobile responsive UI               |  ✅ Live   |
| **V2**       | Full NFT marketplace with on-chain buy/sell         | 📋 Planned |
| **V2**       | Subscription gating with Soroban contracts          | 📋 Planned |
| **V2**       | Mobile app (React Native)                           | 📋 Planned |
| **V3**       | DAO governance for platform fees                    | 🔭 Future  |
| **V3**       | Multi-chain support                                 | 🔭 Future  |

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All PRs require review from `@BDutta18` (enforced via [CODEOWNERS](.github/CODEOWNERS)).

```bash
# Run the full validation suite before submitting a PR
npm run validate
```

---

## 🔗 Submission Links

| Resource                   | Link                                                                                                     |
| :------------------------- | :------------------------------------------------------------------------------------------------------- |
| 🌐 **Live Application**    | https://de-media-xi.vercel.app/                                                                          |
| 📹 **Demo Video**          | https://youtu.be/gBS61AKJD3o                                                                             |
| 📊 **Pitch Deck**          | _(add your link here)_                                                                                   |
| 📋 **Feedback Form**       | https://docs.google.com/forms/d/e/1FAIpQLSenLrFe8At5Vp8OUpLxGLAfRUHtRpnFHDhPhhjVNWokwEAIsg/viewform      |
| 📈 **User Feedback Sheet** | https://docs.google.com/spreadsheets/d/1NCXxc8W2l84xPI76iBJHE5T7vbewJjRJimM3TimVu1A/edit                 |
| ⛓ **Mainnet Explorer**     | https://stellar.expert/explorer/public/contract/CCHCKK24M5DPUCS3AMLS3SC5DFU42L6YXLN7PH5NFQ7EX63COGJSBIRM |
| 📜 **Commit History**      | https://github.com/BDutta18/DeMediaa/commits/main                                                        |

---

<p align="center">
  Built with ❤️ on <a href="https://stellar.org">Stellar</a> · MIT License
</p>
