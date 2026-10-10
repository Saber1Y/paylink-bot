#!/usr/bin/env bash
# Deploy PayLink to BOT Chain and wire the address into the frontend.
#
# Usage:
#   ./deploy.sh <private-key> [testnet|mainnet]   # explicit key (for scripting)
#   ./deploy.sh [testnet|mainnet]                # reads PRIVATE_KEY from this dir's .env
#
# The wallet needs BOT for gas. Testnet BOT comes from the BOT Chain faucet.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve the network first so a bare "./deploy.sh testnet" works.
if [[ "$#" -ge 1 && "$1" == testnet || "$#" -ge 1 && "$1" == mainnet ]]; then
  NETWORK="$1"
  KEY="${PRIVATE_KEY:-}"
else
  KEY="${1:-${PRIVATE_KEY:-}}"
  NETWORK="${2:-testnet}"
fi

# Fall back to contracts/.env (gitignored) when no key is given elsewhere.
if [[ -z "$KEY" && -f "$SCRIPT_DIR/.env" ]]; then
  KEY="$(grep -E '^PRIVATE_KEY=' "$SCRIPT_DIR/.env" | tail -1 | cut -d= -f2-)"
fi

if [[ -z "$KEY" ]]; then
  echo "Usage: ./deploy.sh [testnet|mainnet]   (PRIVATE_KEY from contracts/.env)"
  echo "   or: ./deploy.sh <private-key> [testnet|mainnet]"
  exit 1
fi

if [[ "$KEY" == 0x0000000000000000000000000000000000000000000000000000000000000000 ]]; then
  echo "PRIVATE_KEY is still the placeholder. Put your real key in contracts/.env."
  exit 1
fi

case "$NETWORK" in
  testnet)
    RPC="https://rpc.bohr.life"
    CHAIN_ID=968
    EXPLORER="https://bohrscan.com"
    ENV_KEY="NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET"
    ;;
  mainnet)
    RPC="https://rpc.botchain.ai"
    CHAIN_ID=677
    EXPLORER="https://scan.botchain.ai"
    ENV_KEY="NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET"
    ;;
  *)
    echo "Unknown network: $NETWORK (expected testnet|mainnet)"
    exit 1
    ;;
esac

echo "=== Deploying PayLink to BOT Chain $NETWORK (chain $CHAIN_ID) ==="
echo "RPC:      $RPC"
echo "Explorer: $EXPLORER"
echo

cd "$SCRIPT_DIR"
forge create src/PayLink.sol:PayLink \
  --rpc-url "$RPC" \
  --private-key "$KEY" \
  --chain "$CHAIN_ID" \
  --broadcast \
  2>&1 | tee /tmp/paylink-deploy.log

ADDRESS="$(grep -oE 'Deployed to: 0x[a-fA-F0-9]{40}' /tmp/paylink-deploy.log | awk '{print $NF}' | tail -1)"

if [[ -z "$ADDRESS" ]]; then
  echo
  echo "Deployment may have succeeded but the address could not be parsed."
  echo "Check the output above."
  exit 1
fi

echo
echo "=== Deployed ==="
echo "PayLink: $ADDRESS"
echo "Explorer: $EXPLORER/address/$ADDRESS"

FRONTEND_ENV="$ROOT_DIR/frontend/.env.local"
if [[ -f "$FRONTEND_ENV" ]]; then
  if grep -q "$ENV_KEY" "$FRONTEND_ENV"; then
    sed -i.bak "s|$ENV_KEY=.*|$ENV_KEY=$ADDRESS|" "$FRONTEND_ENV"
  else
    echo "$ENV_KEY=$ADDRESS" >> "$FRONTEND_ENV"
  fi
  echo "Updated frontend/.env.local: $ENV_KEY=$ADDRESS"
else
  echo "$ENV_KEY=$ADDRESS" > "$FRONTEND_ENV"
  echo "Created frontend/.env.local with $ENV_KEY=$ADDRESS"
fi
