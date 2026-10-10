"use client";

import { useState } from "react";
import Link from "next/link";
import { useChainId } from "wagmi";
import { ArrowUpRight, Inbox, RefreshCw } from "lucide-react";
import { explorerAddress } from "@/config/chains";
import { getNetwork, isDeployed } from "@/config/contracts";
import { useRequestCount, useRequests } from "@/lib/useRequests";
import { decimalsFor, formatAmount, relativeTime, shortenAddress, tokenLabel } from "@/lib/format";
import { STATUS, type PaymentRequest } from "@/lib/types";
import { PRODUCT } from "@/lib/product";
import { Badge, Button, Card, Spinner } from "@/components/ui";

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Cancelled", value: "cancelled" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

function statusTone(status: number) {
  if (status === 1) return "success" as const;
  if (status === 2) return "danger" as const;
  return "warning" as const;
}

export function ActivityFeed() {
  const [windowSize, setWindowSize] = useState(10);
  const [filter, setFilter] = useState<Filter>("all");

  const chainId = useChainId();
  const network = getNetwork(chainId);
  const deployed = isDeployed(network.contract);

  const { data: count } = useRequestCount();
  const total = Number((count as bigint | undefined) ?? 0n);
  const offset = Math.max(0, total - windowSize);
  const limit = Math.min(windowSize, total);
  const { requests, isLoading, isFetching, refetch } = useRequests(offset, limit);

  const newestFirst = [...requests].reverse();
  const rows = newestFirst.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === 0;
    if (filter === "paid") return r.status === 1;
    return r.status === 2;
  });

  const hasMore = offset > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={
                "rounded-lg border px-3 py-1.5 text-sm transition-colors " +
                (filter === f.value
                  ? "border-accent-500/60 bg-accent-500/10 text-accent-300"
                  : "border-line bg-ink-850 text-muted hover:border-ink-600 hover:text-white")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">
            {total} request{total === 1 ? "" : "s"} on-chain
          </span>
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? <Spinner className="size-3.5" /> : <RefreshCw className="size-3.5" />}
            Refresh
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-line">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-4 w-10 animate-pulse rounded bg-ink-800" />
                <div className="h-4 flex-1 animate-pulse rounded bg-ink-800" />
                <div className="h-4 w-24 animate-pulse rounded bg-ink-800" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <Inbox className="mx-auto size-8 text-muted" />
            <p className="mt-4 text-sm text-muted">
              {total === 0 ? "No payment requests yet." : "No requests match this filter."}
            </p>
            {total === 0 && (
              <Link
                href="/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-medium text-ink-950 hover:bg-accent-400"
              >
                Create the first one
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => (
              <ActivityRow key={r.id.toString()} request={r} usdt={network.usdt} />
            ))}
          </ul>
        )}
      </Card>

      <div className="flex items-center justify-between">
        {hasMore ? (
          <Button variant="outline" onClick={() => setWindowSize((s) => s + 10)} disabled={isFetching}>
            {isFetching ? <Spinner /> : null}
            Load older
          </Button>
        ) : (
          <span className="text-xs text-muted">
            Showing all {total} request{total === 1 ? "" : "s"}.
          </span>
        )}
        <a
          href={explorerAddress(chainId, network.contract)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white"
        >
          View contract on explorer <ArrowUpRight className="size-3.5" />
        </a>
      </div>

      {!deployed && (
        <p className="text-center text-xs text-warn-400">
          PayLink contract address is not set for this network.
        </p>
      )}
    </div>
  );
}

function ActivityRow({ request, usdt }: { request: PaymentRequest; usdt: `0x${string}` }) {
  const decimals = decimalsFor(request.token);
  const symbol = tokenLabel(request.token, usdt);

  return (
    <li>
      <Link
        href={`/pay/${request.id}`}
        className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ink-850"
      >
        <span className="w-10 font-mono text-xs text-muted">#{request.id.toString()}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm text-white">
              {request.description || "Payment request"}
            </span>
            <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
              {PRODUCT.name}
            </Badge>
          </div>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {request.status === 1 ? "paid to " : "to "}
            {shortenAddress(request.recipient)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-white">
            {formatAmount(request.amount, decimals)} {symbol}
          </p>
          <p className="mt-0.5 text-xs text-muted">{relativeTime(request.createdAt)}</p>
        </div>
        <Badge tone={statusTone(request.status)} className="w-24 justify-center">
          {STATUS[request.status]}
        </Badge>
      </Link>
    </li>
  );
}
