import test from "node:test"
import assert from "node:assert/strict"
import { rateLimiter } from "../middlewares/rateLimiter.js"

test("rateLimiter allows requests under limit", () => {
  const limiter = rateLimiter(5, 10000)
  const req = { headers: {}, socket: { remoteAddress: "127.0.0.1" } } as any
  let calledNext = false

  limiter(req, {} as any, () => {
    calledNext = true
  })

  assert.equal(calledNext, true)
})

test("rateLimiter blocks requests over limit with 429", () => {
  const limiter = rateLimiter(1, 10000)
  const req = { headers: {}, socket: { remoteAddress: "192.168.1.100" } } as any
  let sentStatus = 0
  let sentBody: any = null

  const res = {
    setHeader() {},
    status(code: number) {
      sentStatus = code
      return this
    },
    json(body: any) {
      sentBody = body
      return this
    },
  } as any

  // First request passes
  limiter(req, res, () => {})

  // Second request triggers 429
  limiter(req, res, () => {})

  assert.equal(sentStatus, 429)
  assert.equal(sentBody.code, "RATE_LIMITED")
})
