"use client"

type CacheEnvelope<T> = {
  expiresAt: number
  value: T
}

export const cacheSet = <T>(key: string, value: T, ttlMs: number): void => {
  const item: CacheEnvelope<T> = {
    expiresAt: Date.now() + ttlMs,
    value,
  }
  localStorage.setItem(key, JSON.stringify(item))
}

export const cacheGet = <T>(key: string): T | null => {
  const raw = localStorage.getItem(key)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as CacheEnvelope<T>
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key)
      return null
    }
    return parsed.value
  } catch {
    localStorage.removeItem(key)
    return null
  }
}
