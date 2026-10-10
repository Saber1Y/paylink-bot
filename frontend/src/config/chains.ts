import { defineChain, type Chain } from "viem";

export const botMainnet = defineChain({
  id: 677,
  name: "BOT Chain",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.botchain.ai"] },
  },
  blockExplorers: {
    default: { name: "BOTscan", url: "https://scan.botchain.ai" },
  },
});

export const botTestnet = defineChain({
  id: 968,
  name: "BOT Chain Testnet",
  nativeCurrency: { name: "BOT", symbol: "BOT", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.bohr.life"] },
  },
  blockExplorers: {
    default: { name: "Bohrscan", url: "https://bohrscan.com" },
  },
});

const defaultIsMainnet = process.env.NEXT_PUBLIC_DEFAULT_CHAIN === "677";

/** Default chain first so the app opens on the expected network. */
export const appChains: readonly [Chain, ...Chain[]] = defaultIsMainnet
  ? [botMainnet, botTestnet]
  : [botTestnet, botMainnet];

export const defaultChain = appChains[0];

export const explorerUrl = (chainId: number) =>
  chainId === botMainnet.id
    ? botMainnet.blockExplorers.default.url
    : botTestnet.blockExplorers.default.url;

export const explorerAddress = (chainId: number, address: string) =>
  `${explorerUrl(chainId)}/address/${address}`;

export const explorerTx = (chainId: number, hash: string) =>
  `${explorerUrl(chainId)}/tx/${hash}`;

/** Blockscout-style v2 API base, used by the footer proof block. */
export const explorerApiBase = (chainId: number) =>
  chainId === botMainnet.id
    ? "https://scan.botchain.ai/api/v2"
    : "https://scan.bohr.life/api/v2";
