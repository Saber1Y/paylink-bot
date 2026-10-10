"use client";

import { useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { ArrowUpRight, CircleCheck, Clock, XCircle } from "lucide-react";
import { erc20Abi, payAbi } from "@/lib/abi/contractAbi";
import { explorerAddress, explorerTx } from "@/config/chains";
import { getNetwork, isDeployed } from "@/config/contracts";
import { useRequest } from "@/lib/useRequests";
import {
  decimalsFor,
  formatAmount,
  formatTime,
  shortenAddress,
  tokenLabel,
} from "@/lib/format";
import { PRODUCT } from "@/lib/product";
import { STATUS, type PaymentRequest } from "@/lib/types";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";

function shortError(e: unknown): string {
  const err = e as { shortMessage?: string; message?: string };
  return err.shortMessage || err.message?.split("\n")[0] || "Transaction failed.";
}

function statusTone(status: number) {
  if (status === 1) return "success" as const;
  if (status === 2) return "danger" as const;
  return "warning" as const;
}

export function PayView({ idStr }: { idStr: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paidHash, setPaidHash] = useState<string | null>(null);

  let id: bigint | undefined;
  try {
    id = BigInt(idStr);
  } catch {
    id = undefined;
  }

  const { data, isLoading, isError, refetch } = useRequest(id);
  const request = data as unknown as PaymentRequest | undefined;

  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const network = getNetwork(chainId);
  const deployed = isDeployed(network.contract);

  const isNativeTok = request?.token === "0x0000000000000000000000000000000000000000";
  const { data: allowance } = useReadContract({
    address: request?.token,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, network.contract] : undefined,
    query: { enabled: !!address && !!request && !isNativeTok },
  });

  async function onPay() {
    if (!request || !address || !publicClient) return;
    setError(null);
    setBusy(true);
    try {
      const needsApproval =
        !isNativeTok && ((allowance as bigint | undefined) ?? 0n) < request.amount;
      if (needsApproval) {
        const approveHash = await writeContractAsync({
          address: request.token,
          abi: erc20Abi,
          functionName: "approve",
          args: [network.contract, request.amount],
          chainId,
        });
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      const hash = await writeContractAsync({
        address: network.contract,
        abi: payAbi,
        functionName: "pay",
        args: [request.id],
        value: isNativeTok ? request.amount : 0n,
        chainId,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setPaidHash(hash);
      refetch();
    } catch (e) {
      setError(shortError(e));
    } finally {
      setBusy(false);
    }
  }

  if (id === undefined || isError) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <XCircle className="mx-auto size-8 text-danger-400" />
        <h1 className="mt-4 text-lg font-semibold">Request not found</h1>
        <p className="mt-1 text-sm text-muted">This payment link does not exist on this network.</p>
      </Card>
    );
  }

  if (isLoading || !request) {
    return (
      <Card className="mx-auto max-w-lg space-y-4 p-8">
        <div className="h-6 w-24 animate-pulse rounded bg-ink-800" />
        <div className="h-12 w-48 animate-pulse rounded bg-ink-800" />
        <div className="h-24 animate-pulse rounded bg-ink-800" />
      </Card>
    );
  }

  const decimals = decimalsFor(request.token);
  const symbol = tokenLabel(request.token, network.usdt);
  const isPaid = request.status === 1;
  const isCancelled = request.status === 2;
  const settled = isPaid || isCancelled || paidHash !== null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-ink-850 px-6 py-6 sm:px-8">
          <div className="flex items-center justify-between">
            <Badge tone="accent">{PRODUCT.name}</Badge>
            <Badge tone={statusTone(request.status)}>
              {statusTone(request.status) === "success" && <CircleCheck className="size-3.5" />}
              {statusTone(request.status) === "warning" && <Clock className="size-3.5" />}
              {STATUS[request.status] ?? "Pending"}
            </Badge>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-mono text-5xl font-semibold tracking-tight">
              {formatAmount(request.amount, decimals)}
            </span>
            <span className="text-2xl text-muted">{symbol}</span>
          </div>
          <p className="mt-3 text-sm text-white">
            {request.description || <span className="text-muted">No description</span>}
          </p>
        </div>

        <dl className="divide-y divide-line px-6 text-sm sm:px-8">
          <Row label="Recipient" value={shortenAddress(request.recipient)} mono />
          <Row label="Created by" value={shortenAddress(request.creator)} mono />
          <Row label="Created" value={formatTime(request.createdAt)} />
          {isPaid && <Row label="Paid by" value={shortenAddress(request.payer)} mono />}
          {isPaid && <Row label="Paid at" value={formatTime(request.paidAt)} />}
          <Row label="Request ID" value={`#${request.id}`} mono />
        </dl>
      </Card>

      <div className="space-y-4">
        <Card className="p-6">
          {paidHash || isPaid ? (
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-accent-500/15 text-accent-400">
                <CircleCheck className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Paid</h2>
              <p className="mt-1 text-sm text-muted">
                This request is settled on BOT Chain.
              </p>
              {paidHash && (
                <a
                  href={explorerTx(chainId, paidHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm text-accent-400 hover:text-accent-300"
                >
                  View transaction <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
          ) : isCancelled ? (
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-danger-400/10 text-danger-400">
                <XCircle className="size-6" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Cancelled</h2>
              <p className="mt-1 text-sm text-muted">The creator cancelled this request.</p>
            </div>
          ) : !address ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold">Pay {formatAmount(request.amount, decimals)} {symbol}</h2>
              <p className="mt-1 text-sm text-muted">Connect a wallet to complete this payment.</p>
              <Button className="mt-5 w-full" onClick={() => connect({ connector: connectors[0] })}>
                Connect Wallet
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold">
                Pay {formatAmount(request.amount, decimals)} {symbol}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Your wallet will send {symbol} directly to the recipient.
              </p>
              <Button className="mt-5 w-full" size="lg" onClick={onPay} disabled={busy || !deployed}>
                {busy ? <Spinner /> : null}
                {busy ? "Waiting for wallet..." : `Pay ${symbol}`}
              </Button>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg border border-danger-400/30 bg-danger-400/10 px-3 py-2 text-sm text-danger-400">
              {error}
            </p>
          )}
        </Card>

        {!settled && (
          <Card className="flex items-center justify-between gap-3 p-4">
            <span className="text-xs text-muted">Share this request</span>
            <CopyButton
              value={typeof window !== "undefined" ? window.location.href : ""}
              label="Copy link"
            />
          </Card>
        )}

        <a
          href={explorerAddress(chainId, network.contract)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-xl border border-line bg-ink-900/80 px-4 py-3 text-xs text-muted transition-colors hover:border-ink-600 hover:text-white"
        >
          <span>All transactions for this contract</span>
          <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-muted">{label}</dt>
      <dd className={mono ? "font-mono text-xs text-white" : "text-white"}>{value}</dd>
    </div>
  );
}
