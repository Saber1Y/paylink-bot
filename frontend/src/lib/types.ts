import type { Address } from "viem";

export type PaymentRequest = {
  id: bigint;
  creator: Address;
  recipient: Address;
  token: Address;
  amount: bigint;
  status: number;
  description: string;
  createdAt: bigint;
  paidAt: bigint;
  payer: Address;
};

export const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000" as Address;

export const STATUS = ["Pending", "Paid", "Cancelled"] as const;