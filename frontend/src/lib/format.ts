import { formatUnits, type Address } from "viem";
import { NATIVE_TOKEN } from "./types";

export const TOKEN_DECIMALS: Record<string, number> = {
  native: 18,
  usdt: 6,
};

export function shortenAddress(address?: string, size = 4): string {
  if (!address) return "";
  return `${address.slice(0, 2 + size)}...${address.slice(-size)}`;
}

export function isNative(token: Address): boolean {
  return token === NATIVE_TOKEN;
}

export function tokenLabel(token: Address, usdt: Address): string {
  if (isNative(token)) return "BOT";
  if (token.toLowerCase() === usdt.toLowerCase()) return "USDT";
  return "ERC-20";
}

export function decimalsFor(token: Address): number {
  return isNative(token) ? 18 : 6;
}

/** Format a raw amount for display, trimming trailing zeros. */
export function formatAmount(amount: bigint, decimals: number): string {
  const raw = formatUnits(amount, decimals);
  if (!raw.includes(".")) return raw;
  return raw.replace(/\.?0+$/, "");
}

export function formatTime(seconds: bigint): string {
  if (seconds === 0n) return "-";
  return new Date(Number(seconds) * 1000).toLocaleString();
}

export function relativeTime(seconds: bigint): string {
  if (seconds === 0n) return "-";
  const diff = Date.now() - Number(seconds) * 1000;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}
