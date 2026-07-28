const DEFAULT_PLACEHOLDER = "/placeholder.svg"

const isLikelyIpfsHash = (value: string): boolean => {
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(value) || /^bafy[a-z0-9]{20,}$/i.test(value)
}

export const resolveMediaUrl = (value?: string | null, fallback: string = DEFAULT_PLACEHOLDER): string => {
  if (!value) return fallback

  const raw = value.trim()
  if (!raw) return fallback

  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw
  }

  const maybeHostPath = raw.match(/^([a-z0-9.-]+\.[a-z]{2,})(\/.+)?$/i)
  const normalized = raw.startsWith("//")
    ? `https:${raw}`
    : raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : maybeHostPath
        ? `https://${raw}`
        : raw

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      const parsed = new URL(normalized)
      const cleanPath = parsed.pathname.replace(/^\/+/, "")
      if (cleanPath.startsWith("ipfs/")) {
        return `https://ipfs.io/ipfs/${cleanPath.slice("ipfs/".length)}`
      }

      const firstSegment = cleanPath.split("/")[0]
      if (isLikelyIpfsHash(firstSegment)) {
        return `https://ipfs.io/ipfs/${cleanPath}`
      }

      return normalized
    } catch {
      return fallback
    }
  }

  if (normalized.startsWith("ipfs://")) {
    const path = normalized.replace("ipfs://", "").replace(/^ipfs\//, "")
    return `https://ipfs.io/ipfs/${path}`
  }

  if (normalized.includes("/ipfs/")) {
    const idx = normalized.indexOf("/ipfs/")
    const path = normalized.slice(idx + "/ipfs/".length)
    return `https://ipfs.io/ipfs/${path}`
  }

  if (isLikelyIpfsHash(normalized)) {
    return `https://ipfs.io/ipfs/${normalized}`
  }

  return normalized.startsWith("/") ? normalized : fallback
}
