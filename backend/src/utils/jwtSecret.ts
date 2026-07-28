const FALLBACK_JWT_SECRET = "demedia-temporary-auth-fallback-change-me"

let warned = false

export const getJwtSecret = (): string => {
  const configured = process.env.JWT_SECRET?.trim()
  if (configured) return configured

  if (!warned) {
    warned = true
    console.warn("JWT_SECRET is missing. Using temporary fallback secret. Set JWT_SECRET in environment.")
  }

  return FALLBACK_JWT_SECRET
}

