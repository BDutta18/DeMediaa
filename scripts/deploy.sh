#!/bin/bash
# Deploy only the minimal on-chain registry contract.

set -e

NETWORK=${1:-testnet}
SOURCE=${2:-}

if [ -z "$SOURCE" ]; then
    echo "Usage: ./deploy.sh <network> <source_secret_key>"
    echo "Example: ./deploy.sh testnet SAMPLE_SECRET_KEY"
    exit 1
fi

WASM_DIR="target/wasm32v1-none/release"

case "$NETWORK" in
    testnet)
        RPC_URL="https://soroban-testnet.stellar.org"
        PASSPHRASE="Test SDF Network ; September 2015"
        INCLUSION_FEE=100
        ;;
    mainnet)
        RPC_URL="https://soroban-rpc.mainnet.stellar.gateway.fm"
        PASSPHRASE="Public Global Stellar Network ; September 2015"
        INCLUSION_FEE=200
        ;;
    *)
        echo "Unsupported network: $NETWORK"
        echo "Use testnet or mainnet."
        exit 1
        ;;
esac

echo "Deploying minimal on-chain registry to $NETWORK..."

CONTENT_REGISTRY_ID=$(stellar contract deploy \
    --wasm "$WASM_DIR/content_registry.wasm" \
    --source-account "$SOURCE" \
    --rpc-url "$RPC_URL" \
    --network-passphrase "$PASSPHRASE" \
    --inclusion-fee "$INCLUSION_FEE" \
    --optimize)

echo "ContentRegistry: $CONTENT_REGISTRY_ID"

mkdir -p deployment
cat > deployment/${NETWORK}-addresses.json << EOF
{
  "network": "$NETWORK",
  "contracts": {
    "content_registry": "$CONTENT_REGISTRY_ID"
  },
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

cat deployment/${NETWORK}-addresses.json
