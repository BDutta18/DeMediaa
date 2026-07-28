const LOCAL_BACKEND_URL = "http://127.0.0.1:5000"
const PROD_BACKEND_URL = "https://demedia.onrender.com"

export const getBackendApiBaseUrl = (): string => {
  const configured =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_BASE_URL?.trim()

  if (!configured) {
    return process.env.NODE_ENV === "production" ? PROD_BACKEND_URL : LOCAL_BACKEND_URL
  }

  return configured.replace(/\/$/, "")
}

export const getBackendApiBaseUrlCandidates = (): string[] => {
  const explicitConfigured =
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    process.env.BACKEND_API_BASE_URL?.trim()

  if (explicitConfigured) {
    return [explicitConfigured.replace(/\/$/, "")]
  }

  const configured = getBackendApiBaseUrl()
  const normalizedConfigured = configured.replace(/\/$/, "")
  const local = LOCAL_BACKEND_URL.replace(/\/$/, "")
  const prod = PROD_BACKEND_URL.replace(/\/$/, "")

  if (normalizedConfigured === local) return [local, prod]
  if (normalizedConfigured === prod) return [prod, local]

  return [normalizedConfigured, local, prod].filter(
    (url, index, arr) => arr.indexOf(url) === index,
  )
}
