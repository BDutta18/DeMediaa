#!/bin/bash
# Build only the minimal on-chain Soroban contract.

set -e

echo "Building DeMedia minimal on-chain registry..."

rustup target add wasm32v1-none 2>/dev/null || true

cargo build --release --target wasm32v1-none --manifest-path contracts/content_registry/Cargo.toml

echo ""
echo "Build complete! WASM file in: target/wasm32v1-none/release/"
ls -la target/wasm32v1-none/release/content_registry.wasm
