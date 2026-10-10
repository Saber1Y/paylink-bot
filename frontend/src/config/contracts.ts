import { isAddress, type Address } from "viem";
import { botMainnet, botTestnet } from "./chains";

export type NetworkContracts = {
  contract: Address;
  usdt: Address;
};

const ZERO = "0x0000000000000000000000000000000000000000" as Address;

export const networks: Record<number, NetworkContracts> = {
  [botTestnet.id]: {
    contract: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_TESTNET || ZERO) as Address,
    usdt: (process.env.NEXT_PUBLIC_TESTNET_USDT_ADDRESS || ZERO) as Address,
  },
  [botMainnet.id]: {
    contract: (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_MAINNET || ZERO) as Address,
    usdt: (process.env.NEXT_PUBLIC_MAINNET_USDT_ADDRESS || ZERO) as Address,
  },
};

export function getNetwork(chainId?: number): NetworkContracts {
  if (chainId && networks[chainId]) return networks[chainId];
  return networks[botTestnet.id];
}

export function isDeployed(address: Address): boolean {
  return address !== ZERO && isAddress(address);
}