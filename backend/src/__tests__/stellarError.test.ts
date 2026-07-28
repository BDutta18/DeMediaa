import test from "node:test";
import assert from "node:assert/strict";
import { classifyWalletTxError } from "../utils/stellarError.js";

test("classify wallet missing errors", () => {
  const code = classifyWalletTxError("wallet not installed");
  assert.equal(code, "WALLET_NOT_FOUND");
});

test("classify rejected errors", () => {
  const code = classifyWalletTxError("Request rejected by user");
  assert.equal(code, "WALLET_REJECTED");
});

test("classify insufficient balance errors", () => {
  const code = classifyWalletTxError("tx_insufficient_balance");
  assert.equal(code, "INSUFFICIENT_BALANCE");
});
