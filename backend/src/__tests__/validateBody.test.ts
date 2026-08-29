import test from "node:test";
import assert from "node:assert/strict";
import { requireFields, validateRating } from "../middlewares/validateBody.js";

test("requireFields allows requests with all required fields", () => {
  const validator = requireFields(["title", "price"]);
  const req = { body: { title: "Media Item", price: 10 } } as any;
  let calledNext = false;

  validator(req, {} as any, () => {
    calledNext = true;
  });

  assert.equal(calledNext, true);
});

test("requireFields returns 400 when a required field is missing", () => {
  const validator = requireFields(["title", "price"]);
  const req = { body: { title: "Media Item" } } as any;
  let sentStatus = 0;
  let sentBody: any = null;

  const res = {
    status(code: number) {
      sentStatus = code;
      return this;
    },
    json(body: any) {
      sentBody = body;
      return this;
    },
  } as any;

  validator(req, res, () => {});

  assert.equal(sentStatus, 400);
  assert.equal(sentBody.code, "MISSING_FIELDS");
  assert.deepEqual(sentBody.fields, ["price"]);
});

test("validateRating checks rating bounds", () => {
  const validator = validateRating("rating", 1, 5);
  let sentStatus = 0;

  const res = {
    status(code: number) {
      sentStatus = code;
      return this;
    },
    json() {
      return this;
    },
  } as any;

  // Rating 6 is invalid
  validator({ body: { rating: 6 } } as any, res, () => {});
  assert.equal(sentStatus, 400);

  // Rating 4 is valid
  let calledNext = false;
  validator({ body: { rating: 4 } } as any, res, () => {
    calledNext = true;
  });
  assert.equal(calledNext, true);
});
