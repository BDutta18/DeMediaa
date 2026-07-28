import axios from "axios";
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

const uploadMetadataViaSdk = async (metadata: Record<string, string>) => {
  const jwt = process.env.PINATA_JWT?.trim();
  if (!jwt) {
    const missingAuth = new Error("Pinata JWT is required for SDK metadata upload fallback.");
    (missingAuth as any).code = "PINATA_AUTH_MISSING";
    throw missingAuth;
  }

  const pinata = new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: resolveGatewayDomain(),
  });

  const uploadResult = await pinata.upload.public.json(metadata);
  const cid = (uploadResult as any)?.cid;
  if (!cid) {
    const failed = new Error("Pinata SDK metadata upload did not return CID.");
    (failed as any).code = "PINATA_METADATA_FAILED";
    throw failed;
  }

  return `${resolveGatewayBase()}/${cid}`;
};

const getPinataAuthCandidates = () => {
  const candidates: Array<Record<string, string>> = [];

  const jwt = process.env.PINATA_JWT?.trim();
  if (jwt) {
    candidates.push({ Authorization: `Bearer ${jwt}` });
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

export const uploadMetadataToPinata = async (name: string, description: string, imageURL: string) => {
  const metadata = {
    name,
    description,
    image: imageURL,
  };

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
      try {
        res = await axios.post(`${PINATA_BASE_URL}/pinJSONToIPFS`, metadata, {
          headers: {
            "Content-Type": "application/json",
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
    console.log("Metadata uploaded:", hash);
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
      const friendlyError = new Error("Pinata API key has been revoked. Update PINATA_JWT in backend env.");
      (friendlyError as any).code = "PINATA_API_KEY_REVOKED";
      throw friendlyError;
    }

    if (combined.includes("required scopes") || reason === "API_KEY_MISSING_PERMISSIONS") {
      try {
        return await uploadMetadataViaSdk(metadata);
      } catch {
        const friendlyError = new Error("Pinata key is missing required scopes for metadata upload.");
        (friendlyError as any).code = "PINATA_INSUFFICIENT_SCOPES";
        throw friendlyError;
      }
    }

    const message = details || error?.message || "Pinata metadata upload failed";
    const friendlyError = new Error(message);
    (friendlyError as any).code = "PINATA_METADATA_FAILED";
    console.error("Metadata Upload Error:", message);
    throw friendlyError;
  }
};
