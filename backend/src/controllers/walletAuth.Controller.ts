import { Request, Response } from "express";
import { Keypair } from "@stellar/stellar-sdk";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/user.models";
import { getJwtSecret } from "../utils/jwtSecret";

const SIGN_MESSAGE_PREFIX = "Stellar Signed Message:\n";

const tryDecodeBase64 = (value: string): Buffer | null => {
  try {
    const cleaned = value.trim();
    const decoded = Buffer.from(cleaned, "base64");
    if (!decoded.length) return null;
    return decoded;
  } catch {
    return null;
  }
};

const tryDecodeHex = (value: string): Buffer | null => {
  const cleaned = value.trim().toLowerCase().replace(/^0x/, "");
  if (!/^[0-9a-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) return null;
  try {
    const decoded = Buffer.from(cleaned, "hex");
    if (!decoded.length) return null;
    return decoded;
  } catch {
    return null;
  }
};

const dedupeBuffers = (items: Buffer[]): Buffer[] => {
  const seen = new Set<string>();
  const out: Buffer[] = [];
  for (const item of items) {
    const key = item.toString("hex");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
};

const getSignatureCandidates = (signatureRaw: string): Buffer[] => {
  const candidates: Buffer[] = [];

  const base64Decoded = tryDecodeBase64(signatureRaw);
  if (base64Decoded) {
    candidates.push(base64Decoded);
    if (base64Decoded.length === 68) {
      candidates.push(base64Decoded.subarray(4));
    }
    if (base64Decoded.length > 64) {
      candidates.push(base64Decoded.subarray(base64Decoded.length - 64));
    }
  }

  const hexDecoded = tryDecodeHex(signatureRaw);
  if (hexDecoded) {
    candidates.push(hexDecoded);
    if (hexDecoded.length === 68) {
      candidates.push(hexDecoded.subarray(4));
    }
    if (hexDecoded.length > 64) {
      candidates.push(hexDecoded.subarray(hexDecoded.length - 64));
    }
  }

  return dedupeBuffers(candidates);
};

const getMessageCandidates = (message: string): Buffer[] => {
  const rawMessage = Buffer.from(message, "utf8");
  const prefixedMessage = Buffer.from(`${SIGN_MESSAGE_PREFIX}${message}`, "utf8");
  const rawHash = crypto.createHash("sha256").update(rawMessage).digest();
  const prefixedHash = crypto.createHash("sha256").update(prefixedMessage).digest();

  return [prefixedHash, rawHash, prefixedMessage, rawMessage];
};

const isSignatureValid = (address: string, signatureRaw: string, message: string): boolean => {
  const canonicalAddress = address.trim().toUpperCase();
  const kp = Keypair.fromPublicKey(canonicalAddress);
  const signatureCandidates = getSignatureCandidates(signatureRaw);
  const messageCandidates = getMessageCandidates(message);

  for (const candidateSignature of signatureCandidates) {
    if (candidateSignature.length !== 64) continue;

    for (const candidateMessage of messageCandidates) {
      if (kp.verify(candidateMessage, candidateSignature)) {
        return true;
      }
    }
  }

  return false;
};

export const verifyWalletSignature = async (req: Request, res: Response) => {
  console.log("Incoming wallet verify payload:", req.body);

  try {
    const {
      address,
      signature,
      signedMessage,
      message,
    }: {
      address?: string;
      signature?: string;
      signedMessage?: string;
      message?: string;
    } = req.body;

    const signatureRaw = signature ?? signedMessage;

    if (!address || !signatureRaw || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let isVerified = false;
    try {
      isVerified = isSignatureValid(address, signatureRaw, message);
    } catch (error) {
      console.error("Signature verification error:", error);
    }

    if (!isVerified) {
      return res.status(401).json({ message: "Signature verification failed" });
    }

    const canonicalAddress = String(address).trim().toUpperCase();
    const normalizedAddress = canonicalAddress.toLowerCase();

    // Keep auth resilient: if DB is temporarily unavailable, still issue a token.
    let user: any = { address: normalizedAddress, name: "anonymous" };
    try {
      const existingUser = await User.findOne({ address: normalizedAddress });

      if (!existingUser) {
        try {
          user = await User.create({
            address: normalizedAddress,
            name: "anonymous",
          });
          console.log("New user created:", normalizedAddress);
        } catch (createError: any) {
          if (createError?.code === 11000) {
            user = await User.findOne({ address: normalizedAddress });
          } else {
            throw createError;
          }
        }
      } else {
        user = existingUser;
        console.log("Existing user logged in:", normalizedAddress);
      }
    } catch (dbError) {
      console.error("User profile lookup failed, proceeding with minimal profile:", dbError);
    }

    if (!user) {
      user = { address: normalizedAddress, name: "anonymous" };
    }

    const options: SignOptions = {
      expiresIn: (process.env.TOKEN_EXPIRY ?? "7d") as SignOptions["expiresIn"],
    };

    const token = jwt.sign({ address: canonicalAddress }, getJwtSecret(), options);

    return res.json({
      message: "Wallet verified successfully",
      address: canonicalAddress,
      token,
      user,
    });
  } catch (error) {
    console.error("Wallet verify error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
