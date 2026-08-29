"use client"

import { useState, useEffect, useCallback } from "react"

/**
 * Syncs a state value with localStorage.
 * Safe for SSR: returns the initialValue during server render.
 *
 * @param key           localStorage key
 * @param initialValue  Default value if no persisted value exists
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue))
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to write key "${key}":`, error)
    }
  }, [key, storedValue])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) =>
        typeof value === "function" ? (value as (prev: T) => T)(prev) : value,
      )
    },
    [],
  )

  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(key)
    }
    setStoredValue(initialValue)
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}