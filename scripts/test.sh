#!/bin/bash

set -e

echo "DeMedia Minimal On-Chain Contract Test Script"
echo "============================================="

echo "Running ContentRegistry tests..."
cargo test --manifest-path contracts/content_registry/Cargo.toml -- --nocapture

echo ""
echo "All tests passed!"
