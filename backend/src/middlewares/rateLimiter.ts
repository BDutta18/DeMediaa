import { Request, Response, NextFunction } from "express"

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

/**
 * Simple in-memory rate limiter.
 * For production, replace with redis-backed solution (e.g. rate-limiter-flexible).
 *
 * @param maxRequests  Maximum requests allowed per window
 * @param windowMs     Window duration in milliseconds
 */
export const rateLimiter = (maxRequests = 60, windowMs = 60_000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
      req.socket.remoteAddress ||
      "unknown"

    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now > entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs })
      next()
      return
    }

    if (entry.count >= maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      res.setHeader("Retry-After", String(retryAfter))
      res.status(429).json({
        success: false,
        code: "RATE_LIMITED",
        message: `Too many requests. Retry after ${retryAfter}s.`,
      })
      return
    }

    entry.count += 1
    next()
  }
}

/** Pre-configured strict limiter for auth routes (20 req / 60 s) */
export const authRateLimiter = rateLimiter(20, 60_000)

/** Pre-configured limiter for upload routes (10 req / 60 s) */
export const uploadRateLimiter = rateLimiter(10, 60_000)
