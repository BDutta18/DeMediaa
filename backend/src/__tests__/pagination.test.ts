import test from "node:test"
import assert from "node:assert/strict"
import { parsePagination, paginatedResponse } from "../utils/pagination.js"

test("parsePagination returns defaults when query is empty", () => {
  const req = { query: {} } as any
  const result = parsePagination(req)
  assert.equal(result.page, 1)
  assert.equal(result.limit, 20)
  assert.equal(result.skip, 0)
})

test("parsePagination correctly computes skip offset", () => {
  const req = { query: { page: "3", limit: "15" } } as any
  const result = parsePagination(req)
  assert.equal(result.page, 3)
  assert.equal(result.limit, 15)
  assert.equal(result.skip, 30)
})

test("parsePagination clamps limit to maxLimit", () => {
  const req = { query: { page: "1", limit: "500" } } as any
  const result = parsePagination(req, 50)
  assert.equal(result.limit, 50)
})

test("paginatedResponse builds correct metadata", () => {
  const meta = { page: 2, limit: 10, skip: 10 }
  const items = [{ id: 1 }, { id: 2 }]
  const response = paginatedResponse(items, 25, meta)

  assert.equal(response.success, true)
  assert.equal(response.pagination.total, 25)
  assert.equal(response.pagination.totalPages, 3)
  assert.equal(response.pagination.hasNext, true)
  assert.equal(response.pagination.hasPrev, true)
})
