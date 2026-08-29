import test from "node:test"
import assert from "node:assert/strict"
import { createError, errorHandler } from "../middlewares/errorHandler.js"

test("createError sets status and code correctly", () => {
  const err = createError("Not found", 404, "RESOURCE_NOT_FOUND")
  assert.equal(err.message, "Not found")
  assert.equal(err.status, 404)
  assert.equal(err.code, "RESOURCE_NOT_FOUND")
})

test("errorHandler responds with proper HTTP status and error body", () => {
  const err = createError("Unauthorized access", 401, "UNAUTHORIZED")
  let sentStatus = 0
  let sentBody: any = null

  const mockRes = {
    status(code: number) {
      sentStatus = code
      return this
    },
    json(body: any) {
      sentBody = body
      return this
    },
  } as any

  errorHandler(err, {} as any, mockRes, () => {})

  assert.equal(sentStatus, 401)
  assert.equal(sentBody.success, false)
  assert.equal(sentBody.code, "UNAUTHORIZED")
  assert.equal(sentBody.message, "Unauthorized access")
})
