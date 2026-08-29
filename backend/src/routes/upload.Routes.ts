import { Router } from "express"
import multer from "multer"
import fs from "fs"
import pkg from "js-sha3"
import { walletProtect } from "../middlewares/walletAuthMiddleware"
import { uploadToPinata } from "../utils/pinataUpload"
import { uploadMetadataToPinata } from "../utils/pinataMetadata"
import { mintNFT } from "../utils/mintNFT"
import { uploadContentToBlockchain } from "../web3/uploadContent"
import Nft from "../models/nft.models"
import { getAllNFTs, myNFTs, toggleNFTSale } from "../controllers/nft.Controller"
import { saveFingerprint } from "../controllers/copyright.Controller"

const { keccak256 } = pkg

const router = Router()
const upload = multer({ dest: "uploads/" })

router.post("/avatar", walletProtect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" })

    const filePath = req.file.path
    const imageURL = await uploadToPinata(filePath)
    fs.unlinkSync(filePath)

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      imageURL,
    })
  } catch (error) {
    console.error("Avatar upload error:", error)
    const code = (error as any)?.code
    const message = error instanceof Error ? error.message : "Avatar upload failed"
    return res.status(500).json({ success: false, code: code || "AVATAR_UPLOAD_FAILED", message })
  }
})

router.post("/upload", walletProtect, upload.single("file"), async (req, res) => {
  let filePath: string | undefined
  try {
    const userAddress = (req as any).user.address
    const { name, description, price } = req.body

    if (!req.file) return res.status(400).json({ message: "No file uploaded" })
    if (!name || !description) {
      return res.status(400).json({ message: "name and description are required" })
    }

    filePath = req.file.path
    const fileBuffer = fs.readFileSync(filePath)

    const imageURL = await uploadToPinata(filePath)
    const imageCid = imageURL.split("/").pop()
    if (!imageCid) {
      return res.status(500).json({ message: "Failed to derive media CID" })
    }

    const metadataURL = await uploadMetadataToPinata(name, description, imageURL)
    const metadataCid = metadataURL.split("/").pop()
    if (!metadataCid) {
      return res.status(500).json({ message: "Failed to derive metadata CID" })
    }

    const fileHash = `0x${keccak256(fileBuffer)}`
    const registryResult = await uploadContentToBlockchain(imageCid, fileHash)
    if (!registryResult.success) {
      const typedError = registryResult.error as
        { code?: string; message?: string; address?: string } | Error | string | undefined
      const detail =
        registryResult.error instanceof Error
          ? registryResult.error.message
          : String(registryResult.error)
      const registryCode =
        typeof typedError === "object" &&
        typedError !== null &&
        "code" in typedError &&
        typedError.code
          ? String(typedError.code)
          : "CONTENT_REGISTRY_FAILED"

      if (registryCode === "STELLAR_SOURCE_ACCOUNT_NOT_FOUND") {
        const missingAddress =
          typeof typedError === "object" && typedError !== null && "address" in typedError
            ? String(typedError.address)
            : ""

        return res.status(500).json({
          success: false,
          code: registryCode,
          message: "Backend signer account is not funded on Stellar testnet.",
          detail,
          action: missingAddress
            ? `Fund ${missingAddress} on Friendbot, then retry upload.`
            : "Fund backend signer account on Friendbot, then retry upload.",
        })
      }

      return res.status(500).json({
        success: false,
        code: registryCode,
        message: "Blockchain content registration failed",
        detail,
      })
    }

    const mintResult = await mintNFT(userAddress, metadataURL)
    if (!mintResult.success || !mintResult.txHash || !mintResult.tokenId) {
      const detail =
        mintResult.error instanceof Error ? mintResult.error.message : String(mintResult.error)
      return res.status(500).json({
        success: false,
        code: "MINT_FAILED",
        message: "NFT mint failed",
        detail,
      })
    }

    const nft = await Nft.create({
      author: userAddress,
      owner: userAddress,
      name,
      description,
      imageURL,
      metadataURL,
      ipfsHash: metadataCid,
      tokenId: mintResult.tokenId,
      txHash: mintResult.txHash,
      registryTxHash: registryResult.txHash,
      contentId: registryResult.contentId,
      price: price ? Number(price) : 0,
      forSale: !!price && Number(price) > 0,
    })

    saveFingerprint(
      (nft._id as any).toString(),
      mintResult.tokenId,
      userAddress,
      metadataCid,
      filePath,
    ).catch((err) => console.error("Fingerprint save error:", err))

    res.status(200).json({
      success: true,
      message: "Media uploaded, content registered, NFT minted, and state synced",
      registry: {
        txHash: registryResult.txHash,
        contentId: registryResult.contentId,
        fileHash,
        mediaCid: imageCid,
      },
      nft,
    })
  } catch (error) {
    console.error("Upload or Mint Error:", error)
    let code = (error as any)?.code
    const message = error instanceof Error ? error.message : "Upload or Mint failed"

    if (
      /required scopes/i.test(message) &&
      (!code || code === "PINATA_UPLOAD_FAILED" || code === "PINATA_METADATA_FAILED")
    ) {
      code = "PINATA_INSUFFICIENT_SCOPES"
    }

    if (code === "PINATA_API_KEY_REVOKED") {
      return res.status(500).json({
        success: false,
        code,
        message,
        action: "Set a valid active PINATA_JWT in backend environment and restart server",
      })
    }

    if (code === "PINATA_INSUFFICIENT_SCOPES") {
      return res.status(500).json({
        success: false,
        code,
        message,
        action:
          "Update Pinata credentials with required scopes (pinFileToIPFS and pinJSONToIPFS), or set PINATA_API_KEY/PINATA_API_SECRET with full pinning access, then restart backend.",
      })
    }

    if (code === "PINATA_AUTH_MISSING") {
      return res.status(500).json({
        success: false,
        code,
        message,
        action:
          "Set PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET in backend environment and restart backend.",
      })
    }

    if (code === "STELLAR_SOURCE_ACCOUNT_NOT_FOUND") {
      return res.status(500).json({
        success: false,
        code,
        message,
        action:
          "Fund the backend signer account on Stellar testnet (Friendbot) using the public key from PRIVATE_KEY, then retry upload.",
      })
    }

    return res.status(500).json({ success: false, code: code || "UPLOAD_OR_MINT_FAILED", message })
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
})

router.get("/find", getAllNFTs)
router.get("/my-nfts", walletProtect, myNFTs)
router.put("/:tokenId/toggle-sale", walletProtect, toggleNFTSale)

export default router
