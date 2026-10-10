# PayLink

Payment request links for **BOT Chain**.
Create a payment request with an amount, description and wallet address, share the `/pay/<id>` link, and the payer settles it with any wallet. Everything is stored on-chain - no backend, no database, no indexer.

## User flow

1. **Create** - connect a wallet, enter recipient, amount, asset (`BOT` native or `USDT`) and a description, sign `createRequest` once.
2. **Share** - the app shows a link at `/pay/<id>`.
3. **Pay** - the payer opens the link, reviews the on-chain details, and pays. Native `BOT` is sent with the transaction value; `USDT` first approves the contract, then pays via `transferFrom`. The contract emits `RequestPaid` and marks the request `Paid`.
4. **Verify** - the `/activity` page lists every request straight from contract storage.

## Why read contract state, not logs

BOT Chain's mainnet RPC (`rpc.botchain.ai`) **disables `eth_getLogs`**.
PayLink keeps an on-chain enumerable list of requests and exposes `requestCount()` and `getRequests(offset, limit)`, so the frontend reads history through `eth_call`, which always works. No subgraph, no indexer.

## Contract API

```text
createRequest(recipient, token, amount, description) -> uint256 id
pay(id)                                                  // payable; native or ERC-20
cancel(id)                                               // creator only
getRequest(id)                       -> Request
requestCount()                       -> uint256
getRequests(offset, limit)           -> Request[]
idsByCreator(creator)                -> uint256[]
```

Supported assets: native `BOT` uses `token == address(0)`. Any standard ERC-20 works; the frontend is preconfigured for BOT Chain `USDT`.

## Networks

| Network | Chain ID | RPC | Explorer |
| --- | --- | --- | --- |
| BOT Chain (mainnet) | 677 | `https://rpc.botchain.ai` | `https://scan.botchain.ai` |
| BOT Chain - Bohr (testnet) | 968 | `https://rpc.bohr.life` | `https://bohrscan.com` |

USDT addresses:
- Mainnet `0xaBabc7Ddc03e501d190C676BF3d92ef0e6e87a3C`
- Testnet `0x75edC9335175Fc0552D51D48439F229c10420fe3`

## Repository layout

```
PayLink-BOT/
  contracts/            Foundry project
    src/PayLink.sol     The contract
    test/PayLink.t.sol  13 tests (native, USDT, cancel, paging, reverts)
    script/DeployPayLink.s.sol
    deploy.sh           Deploys and writes the address into frontend/.env.local
  frontend/             Next.js 16 app (wagmi + viem + Tailwind v4)
```

## Deploying the contract

Prerequisites: `forge` (Foundry) and a wallet holding BOT for gas. Get testnet BOT from the BOT Chain faucet.

```bash
cd contracts
./deploy.sh 0x<your-private-key> testnet   # then, once happy:
./deploy.sh 0x<your-private-key> mainnet
```

The script runs `forge script` against the right RPC, parses the deployed address, writes it into `frontend/.env.local`, and prints the explorer link. Never commit a real private key.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # normally deploy.sh writes the address here
npm run dev                  # http://localhost:3000
```

| Env var | Purpose |
| --- | --- |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET` | PayLink address on chain 968 |
| `NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET` | PayLink address on chain 677 |
| `NEXT_PUBLIC_TESTNET_USDT_ADDRESS` | USDT on testnet |
| `NEXT_PUBLIC_MAINNET_USDT_ADDRESS` | USDT on mainnet |
| `NEXT_PUBLIC_DEFAULT_CHAIN` | Which network the app opens on: `968` or `677` |

Wallets: any injected EVM wallet (MetaMask and friends), switched between testnet and mainnet in the header.

## Validation

```bash
cd contracts && forge test   # 13 tests pass
cd frontend && npx tsc --noEmit
cd frontend && npm run lint
cd frontend && npm run build
```

## Known limits

- The contract pays the recipient instantly on settlement; there is no escrow or refund path.
- Testnet `USDT` used for demos may be a mock depending on what the BOT Chain bridge offers. Verify the testnet token contract before treating amounts as real USDT.