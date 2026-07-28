import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { PinataSDK } from "pinata";

const PINATA_BASE_URL = "https://api.pinata.cloud/pinning";

const resolveGatewayBase = () => {
  const raw = process.env.PINATA_GATEWAY?.trim();
  if (!raw) return "https://ipfs.io/ipfs";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const trimmed = withProtocol.endsWith("/") ? withProtocol.slice(0, -1) : withProtocol;
  const withoutIpfsSuffix = trimmed.replace(/\/ipfs\/?$/i, "");
  return `${withoutIpfsSuffix}/ipfs`;
};

const resolveGatewayDomain = () => {
  const raw = process.env.PINATA_GATEWAY?.trim();
  if (!raw) return undefined;
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/ipfs\/?$/i, "")
    .replace(/\/$/, "");
};

const uploadToPinataViaSdk = async (filePath: string) => {
  const jwt = process.env.PINATA_JWT?.trim();
  if (!jwt) {
    const missingAuth = new Error("Pinata JWT is required for SDK upload fallback.");
    (missingAuth as any).code = "PINATA_AUTH_MISSING";
    throw missingAuth;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath) || "upload.bin";
  const file = new File([fileBuffer], fileName);

  const pinata = new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: resolveGatewayDomain(),
  });

  const uploadResult = await pinata.upload.public.file(file);
  const cid = (uploadResult as any)?.cid;
  if (!cid) {
    const failed = new Error("Pinata SDK upload did not return CID.");
    (failed as any).code = "PINATA_UPLOAD_FAILED";
    throw failed;
  }

  return `${resolveGatewayBase()}/${cid}`;
};

const getPinataAuthCandidates = () => {
  const candidates: Array<Record<string, string>> = [];

  // Prefer JWT if provided to avoid legacy key/secret conflicts.
  const jwt = process.env.PINATA_JWT?.trim();
  if (jwt) {
    candidates.push({ Authorization: `Bearer ${jwt}` });
    return candidates;
  }

  const apiKey = process.env.PINATA_API_KEY?.trim();
  const apiSecret = process.env.PINATA_API_SECRET?.trim();
  if (apiKey && apiSecret) {
    candidates.push({
      pinata_api_key: apiKey,
      pinata_secret_api_key: apiSecret,
    });
  }

  return candidates;
};

export const uploadToPinata = async (filePath: string) => {
  try {
    const authCandidates = getPinataAuthCandidates();
    if (authCandidates.length === 0) {
      const missingAuth = new Error("Pinata credentials are missing. Set PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET.");
      (missingAuth as any).code = "PINATA_AUTH_MISSING";
      throw missingAuth;
    }

    let res: any = null;
    let lastError: any = null;

    for (const authHeaders of authCandidates) {
      const data = new FormData();
      data.append("file", fs.createReadStream(filePath));

      try {
        res = await axios.post(`${PINATA_BASE_URL}/pinFileToIPFS`, data, {
          maxBodyLength: Infinity,
          headers: {
            "Content-Type": `multipart/form-data; boundary=${(data as any)._boundary}`,
            ...authHeaders,
          },
        });
        break;
      } catch (error: any) {
        lastError = error;
      }
    }

    if (!res) throw lastError;

    const hash = res.data.IpfsHash;
    console.log("Uploaded to IPFS:", hash);
    return `${resolveGatewayBase()}/${hash}`;
} catch (error: any) {
    const reason = error?.response?.data?.error?.reason;
    const details = error?.response?.data?.error?.details;
    const rawData = error?.response?.data;
    const responseMessage =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "";
    const combined = `${details || ""} ${responseMessage || ""} ${typeof rawData === "string" ? rawData : JSON.stringify(rawData || "")} ${error?.message || ""}`.toLowerCase();

    if (reason === "API_KEY_REVOKED") {
      try {
        return await uploadToPinataViaSdk(filePath);
      } catch {
        const friendlyError = new Error("Pinata API key has been revoked. Update PINATA_JWT in backend env.");
        (friendlyError as any).code = "PINATA_API_KEY_REVOKED";
        throw friendlyError;
      }
    }

    if (reason === "API_KEY_MISSING_PERMISSIONS") {
      try {
        return await uploadToPinataViaSdk(filePath);
      } catch {
        const friendlyError = new Error("Pinata key is missing required scopes for file upload.");
        (friendlyError as any).code = "PINATA_INSUFFICIENT_SCOPES";
        throw friendlyError;
      }
    }

    const message = details || error?.message || "Pinata upload failed";
    const friendlyError = new Error(message);
    (friendlyError as any).code = "PINATA_UPLOAD_FAILED";
    console.error("Pinata Upload Error:", message, "Reason:", reason, "Details:", details);
    throw friendlyError;
  }
};
