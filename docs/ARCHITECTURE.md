# DeMedia MVP Architecture

## 1) System Overview

DeMedia is a three-layer MVP:

- `frontend/` (Next.js): wallet auth, profile, gallery, upload, marketplace views
- `backend/` (Express): API orchestration, auth, mint pipeline, DB persistence
- `contracts/` (Soroban Rust): on-chain content registry, NFT minting, escrow/royalty logic

Storage and infra:

- MongoDB for off-chain indexing and query performance
- Pinata/IPFS for media + metadata hosting
- Stellar Testnet + Soroban RPC for transaction execution

## 2) Core User Flows

### A. Wallet Login

1. User connects wallet from frontend auth page.
2. User signs login message.
3. Backend verifies signature and returns JWT.
4. Frontend stores JWT and enables protected routes.

### B. Upload + Mint (Single Pipeline)

1. Frontend uploads media + metadata payload to backend.
2. Backend uploads file to Pinata (IPFS CID A).
3. Backend uploads JSON metadata to Pinata (IPFS CID B).
4. Backend registers media fingerprint (`ContentRegistry.register_content`).
5. Backend mints NFT (`ContentNFT.mint`) with metadata URL.
6. Backend stores synchronized NFT document in MongoDB.

### C. Marketplace Purchase

1. Buyer triggers purchase from frontend.
2. Backend invokes escrow purchase path.
3. Tx lifecycle tracked with pending/success/fail.
4. Event stream updates UI state in near real time.

## 3) Data Model (High Level)

### User (MongoDB)

- `address`, `name`, `email`, `avatar`, `bio`
- profile personalization: `banner`, `accentColor`, `showcaseTitle`

### NFT (MongoDB)

- `author`, `owner`, `name`, `description`
- `imageURL`, `metadataURL`, `ipfsHash`
- `tokenId`, `txHash`, optional registry references
- `forSale`, `price`

## 4) Reliability and Error Handling

- Wallet error classification: not found / rejected / insufficient balance / network mismatch
- Pinata key failures return explicit actionable errors
- Tx finality polling handles propagation delays (`NOT_FOUND` retry behavior)
- Media rendering uses robust URL normalization for IPFS/gateway formats

## 5) Real-time and State Sync

- SSE endpoint streams transaction + platform events from backend
- Frontend subscribes to stream for status updates without full refresh

## 6) Security Notes

- JWT-protected APIs for private user actions
- Wallet signature verification for login
- Secrets kept in environment variables (`PINATA_JWT`, `PRIVATE_KEY`, etc.)

## 7) CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) validates:

- frontend lint/build
- backend build/test
- contract build
