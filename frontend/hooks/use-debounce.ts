"use client"

import { useState, useEffect } from "react"

/**
 * Returns a debounced copy of `value` that only updates after
 * `delayMs` milliseconds have passed without a new value.
 *
 * @param value    The value to debounce
 * @param delayMs  Debounce delay in milliseconds (default: 300)
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
