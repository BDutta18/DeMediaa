import crypto from "crypto";
import fs from "fs";

const HAMMING_THRESHOLD = 10;

export interface ContentFingerprintResult {
  sha256: string;
  phash: string;
  dhash: string;
  ahash: string;
  crc32: string;
  ssdeep: string;
  width: number;
  height: number;
  fileSize: number;
}

export interface CopyrightMatch {
  tokenId: string;
  author: string;
  ipfsHash: string;
  similarity: number;
  matchType: "exact" | "near-duplicate" | "similar";
  matchedHash: string;
}

function computeSHA256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function computeCRC32(buffer: Buffer): string {
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    crc = table[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function extractImagePixels(buffer: Buffer): {
  pixels: number[];
  width: number;
  height: number;
} {
  let offset = 0;

  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    offset = 8;
    while (offset < buffer.length - 12) {
      const length = buffer.readUInt32BE(offset);
      const type = buffer.toString("ascii", offset + 4, offset + 8);
      if (type === "IHDR") {
        const w = buffer.readUInt32BE(offset + 8);
        const h = buffer.readUInt32BE(offset + 12);
        return { pixels: extractPNGPixels(buffer), width: w, height: h };
      }
      offset += 12 + length;
    }
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return extractJPEGPixels(buffer);
  }

  return generateFallbackPixels(buffer);
}

function extractPNGPixels(buffer: Buffer): number[] {
  const pixels: number[] = [];
  let offset = 8;
  let totalPixels = 0;

  while (offset < buffer.length - 12 && totalPixels < 64 * 64 * 3) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);

    if (type === "IHDR") {
      offset += 12 + length;
      continue;
    }
    if (type === "IDAT") {
      const dataStart = offset + 8;
      const dataEnd = dataStart + length;
      for (let i = dataStart; i < dataEnd && totalPixels < 64 * 64 * 3; i++) {
        pixels.push(buffer[i]);
        totalPixels++;
      }
    }
    if (type === "IEND") break;
    offset += 12 + length;
  }

  return pixels;
}

function extractJPEGPixels(buffer: Buffer): { pixels: number[]; width: number; height: number } {
  const pixels: number[] = [];
  let width = 64;
  let height = 64;
  let offset = 2;

  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xff) {
      offset++;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd9) break;

    if (marker === 0xc0 || marker === 0xc2) {
      if (offset + 9 < buffer.length) {
        height = buffer.readUInt16BE(offset + 5);
        width = buffer.readUInt16BE(offset + 7);
      }
    }

    const segLen = buffer.readUInt16BE(offset + 2);
    const dataStart = offset + 4;
    for (let i = dataStart; i < dataStart + segLen - 2 && pixels.length < 64 * 64 * 3; i++) {
      pixels.push(buffer[i]);
    }
    offset += 2 + segLen;
  }

  return { pixels, width, height };
}

function generateFallbackPixels(buffer: Buffer): {
  pixels: number[];
  width: number;
  height: number;
} {
  const pixels: number[] = [];
  for (let i = 0; i < 64 * 64 * 3 && i < buffer.length; i++) {
    pixels.push(buffer[i]);
  }
  while (pixels.length < 64 * 64 * 3) {
    pixels.push(0);
  }
  return { pixels, width: 64, height: 64 };
}

function grayscaleFromPixels(pixels: number[], w: number, h: number): number[] {
  const gray: number[] = [];
  const size = Math.min(w, 64) * Math.min(h, 64);

  for (let i = 0; i < size; i++) {
    const idx = i * Math.floor(pixels.length / Math.max(size, 1));
    const r = pixels[idx] || 0;
    const g = pixels[idx + 1] || 0;
    const b = pixels[idx + 2] || 0;
    gray.push(Math.round(0.299 * r + 0.587 * g + 0.114 * b));
  }
  return gray;
}

function computeDHash(gray: number[], w: number): string {
  let hash = "";
  const size = Math.min(w, 64);
  const rows = Math.min(gray.length / size, 64);

  for (let y = 0; y < rows - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const idx = y * size + x;
      const left = gray[idx] || 0;
      const right = gray[idx + 1] || 0;
      hash += left > right ? "1" : "0";
    }
  }
  return hash;
}

function computePHash(gray: number[], w: number): string {
  const size = 8;
  const blockW = Math.floor(Math.min(w, 64) / size);
  const blockH = Math.floor(Math.min(gray.length / Math.max(w, 1), 64) / size);
  const avgs: number[] = [];

  for (let by = 0; by < size; by++) {
    for (let bx = 0; bx < size; bx++) {
      let sum = 0;
      let count = 0;
      for (let dy = 0; dy < blockH; dy++) {
        for (let dx = 0; dx < blockW; dx++) {
          const px = bx * blockW + dx;
          const py = by * blockH + dy;
          const idx = py * Math.min(w, 64) + px;
          sum += gray[idx] || 0;
          count++;
        }
      }
      avgs.push(count > 0 ? sum / count : 0);
    }
  }

  let hash = "";
  for (let i = 0; i < avgs.length; i++) {
    for (let j = i + 1; j < avgs.length; j++) {
      hash += avgs[i] > avgs[j] ? "1" : "0";
    }
  }
  return hash.substring(0, 64);
}

function computeAHash(gray: number[]): string {
  let sum = 0;
  for (const val of gray) sum += val;
  const avg = sum / Math.max(gray.length, 1);

  let hash = "";
  for (const val of gray) {
    hash += val >= avg ? "1" : "0";
  }
  return hash;
}

function computeSSDEEP(buffer: Buffer): string {
  const blockSize = Math.max(3, Math.floor(buffer.length / 64));
  const hashes: string[] = [];

  for (let i = 0; i < buffer.length; i += blockSize) {
    const chunk = buffer.subarray(i, Math.min(i + blockSize, buffer.length));
    const h = crypto.createHash("md5").update(chunk).digest("hex").substring(0, 4);
    hashes.push(h);
  }

  return hashes.slice(0, 16).join(":");
}

function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) {
    const minLen = Math.min(a.length, b.length);
    a = a.substring(0, minLen);
    b = b.substring(0, minLen);
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++;
  }
  return dist;
}

function ssdeepSimilarity(a: string, b: string): number {
  const aParts = a.split(":");
  const bParts = b.split(":");
  const setA = new Set(aParts);
  const bSet = new Set(bParts);
  let intersection = 0;
  for (const p of setA) {
    if (bSet.has(p)) intersection++;
  }
  const union = setA.size + bSet.size - intersection;
  return union > 0 ? (intersection / union) * 100 : 0;
}

export function computeContentFingerprint(filePath: string): ContentFingerprintResult {
  const buffer = fs.readFileSync(filePath);
  const sha256 = computeSHA256(buffer);
  const crc32 = computeCRC32(buffer);
  const ssdeep = computeSSDEEP(buffer);

  const { pixels, width, height } = extractImagePixels(buffer);
  const gray = grayscaleFromPixels(pixels, width, height);
  const actualW = Math.min(width, 64);

  const phash = computePHash(gray, actualW);
  const dhash = computeDHash(gray, actualW);
  const ahash = computeAHash(gray);

  return {
    sha256,
    phash,
    dhash,
    ahash,
    crc32,
    ssdeep,
    width,
    height,
    fileSize: buffer.length,
  };
}

export function findMatches(
  fingerprint: ContentFingerprintResult,
  existingFingerprints: Array<{
    tokenId: string;
    author: string;
    ipfsHash: string;
    phash: string;
    dhash: string;
    ahash: string;
    ssdeep: string;
    sha256: string;
  }>
): CopyrightMatch[] {
  const matches: CopyrightMatch[] = [];

  for (const existing of existingFingerprints) {
    if (fingerprint.sha256 === existing.sha256) {
      matches.push({
        tokenId: existing.tokenId,
        author: existing.author,
        ipfsHash: existing.ipfsHash,
        similarity: 100,
        matchType: "exact",
        matchedHash: "sha256",
      });
      continue;
    }

    const pDist = hammingDistance(fingerprint.phash, existing.phash);
    if (pDist <= HAMMING_THRESHOLD) {
      const similarity = Math.round((1 - pDist / fingerprint.phash.length) * 100);
      matches.push({
        tokenId: existing.tokenId,
        author: existing.author,
        ipfsHash: existing.ipfsHash,
        similarity,
        matchType: pDist <= 3 ? "near-duplicate" : "similar",
        matchedHash: "phash",
      });
      continue;
    }

    const dDist = hammingDistance(fingerprint.dhash, existing.dhash);
    if (dDist <= HAMMING_THRESHOLD) {
      const similarity = Math.round((1 - dDist / fingerprint.dhash.length) * 100);
      matches.push({
        tokenId: existing.tokenId,
        author: existing.author,
        ipfsHash: existing.ipfsHash,
        similarity,
        matchType: "similar",
        matchedHash: "dhash",
      });
      continue;
    }

    const aDist = hammingDistance(fingerprint.ahash, existing.ahash);
    if (aDist <= HAMMING_THRESHOLD) {
      const similarity = Math.round((1 - aDist / fingerprint.ahash.length) * 100);
      matches.push({
        tokenId: existing.tokenId,
        author: existing.author,
        ipfsHash: existing.ipfsHash,
        similarity,
        matchType: "similar",
        matchedHash: "ahash",
      });
      continue;
    }

    const ssdeepSim = ssdeepSimilarity(fingerprint.ssdeep, existing.ssdeep);
    if (ssdeepSim > 60) {
      matches.push({
        tokenId: existing.tokenId,
        author: existing.author,
        ipfsHash: existing.ipfsHash,
        similarity: Math.round(ssdeepSim),
        matchType: "similar",
        matchedHash: "ssdeep",
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}
