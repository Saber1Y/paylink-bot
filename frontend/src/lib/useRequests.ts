"use client";

import { useChainId, useReadContract } from "wagmi";
import { payAbi } from "@/lib/abi/contractAbi";
import { getNetwork } from "@/config/contracts";
import type { PaymentRequest } from "@/lib/types";

export function useRequestCount() {
  const chainId = useChainId();
  const { contract } = getNetwork(chainId);
  return useReadContract({
    address: contract,
    abi: payAbi,
    functionName: "requestCount",
    chainId,
    query: { refetchInterval: 8000 },
  });
}

export function useRequests(offset: number, limit: number) {
  const chainId = useChainId();
  const { contract } = getNetwork(chainId);
  const result = useReadContract({
    address: contract,
    abi: payAbi,
    functionName: "getRequests",
    args: [BigInt(offset), BigInt(limit)],
    chainId,
    query: { refetchInterval: 8000 },
  });
  const requests = (result.data ?? []) as unknown as PaymentRequest[];
  return { ...result, requests };
}

export function useRequest(id: bigint | undefined) {
  const chainId = useChainId();
  const { contract } = getNetwork(chainId);
  return useReadContract({
    address: contract,
    abi: payAbi,
    functionName: "getRequest",
    args: id !== undefined ? [id] : undefined,
    chainId,
    query: { enabled: id !== undefined, refetchInterval: 6000 },
  });
}