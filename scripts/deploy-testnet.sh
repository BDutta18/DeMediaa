#!/bin/bash
# Deploy only the minimal on-chain registry contract to testnet.

set -e

SOURCE="$1"

if [ -z "$SOURCE" ]; then
    echo "Usage: ./deploy-testnet.sh <YOUR_SECRET_KEY>"
    exit 1
fi

NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org"
PASSPHRASE="Test SDF Network ; September 2015"
WASM_DIR="target/wasm32v1-none/release"

echo "Deploying minimal on-chain registry to testnet..."

CONTENT_REGISTRY_ID=$(stellar contract deploy \
    --wasm "$WASM_DIR/content_registry.wasm" \
    --source-account "$SOURCE" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    --inclusion-fee 100 \
    --optimize)

echo "ContentRegistry: $CONTENT_REGISTRY_ID"

mkdir -p deployment
cat > deployment/testnet-deployment.json << EOF
{
  "network": "testnet",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "contracts": {
    "content_registry": {
      "id": "$CONTENT_REGISTRY_ID",
      "name": "ContentRegistry",
      "wasm": "content_registry.wasm"
    }
  }
}
EOF

echo "Deployment details saved to: deployment/testnet-deployment.json"
