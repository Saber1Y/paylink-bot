"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useChainId } from "wagmi";
import { getNetwork, isDeployed } from "@/config/contracts";
import {
  botMainnet,
  botTestnet,
  explorerAddress,
  explorerApiBase,
  explorerTx,
  explorerUrl,
} from "@/config/chains";
import { PRODUCT } from "@/lib/product";

const BOTCHAIN_URL = "https://www.botchain.ai";
const X_HANDLE = "use_auralens";

type ReceiptData = { key: string; hash: string | null };

export function FooterProof() {
  const connected = useChainId();
  const chainId = connected ?? botTestnet.id;
  const isMainnet = chainId === botMainnet.id;
  const { contract } = getNetwork(chainId);
  const deployed = isDeployed(contract);

  const key = deployed ? `${chainId}:${contract}` : null;
  const url = deployed
    ? `${explorerApiBase(chainId)}/addresses/${contract}/transactions?limit=1`
    : null;

  const [data, setData] = useState<ReceiptData | null>(null);

  useEffect(() => {
    if (!key || !url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d) => {
        const items = Array.isArray(d?.items) ? d.items : [];
        setData({ key, hash: items[0]?.hash ? String(items[0].hash) : null });
      })
      .catch(() => {
        if (!controller.signal.aborted) setData({ key, hash: null });
      });
    return () => controller.abort();
  }, [key, url]);

  const loading = key !== null && data?.key !== key;
  const receipt = data?.key === key ? data?.hash ?? null : null;

  return (
    <footer className="border-t border-line/70 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-accent-400" />
              <h2 className="text-sm font-semibold">
                Proof on BOT {isMainnet ? "Mainnet" : "Testnet"}
              </h2>
            </div>
            <dl className="mt-4 space-y-3 text-xs">
              <div className="flex gap-3">
                <dt className="w-40 shrink-0 uppercase tracking-wide text-muted">
                  Chain ID
                </dt>
                <dd className="font-mono text-white">{chainId}</dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 shrink-0 uppercase tracking-wide text-muted">
                  Contract Address
                </dt>
                <dd className="font-mono">
                  {deployed ? (
                    <a
                      href={explorerAddress(chainId, contract)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={contract}
                      className="text-accent-300 transition-colors hover:text-accent-200"
                    >
                      {contract.slice(0, 8)}...{contract.slice(-4)}
                    </a>
                  ) : (
                    <span className="text-muted">not deployed on this network</span>
                  )}
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="w-40 shrink-0 uppercase tracking-wide text-muted">
                  Latest Test Receipt
                </dt>
                <dd className="font-mono">
                  {!deployed ? (
                    <span className="text-muted">-</span>
                  ) : loading ? (
                    <span className="text-muted">checking...</span>
                  ) : receipt ? (
                    <>
                      <a
                        href={explorerTx(chainId, receipt)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={receipt}
                        className="text-accent-300 transition-colors hover:text-accent-200"
                      >
                        {receipt.slice(0, 8)}...
                      </a>
                      <span className="ml-2 text-muted">(test payment)</span>
                    </>
                  ) : (
                    <span className="text-muted">no test receipt yet</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <nav className="flex flex-col items-start gap-2 text-sm">
            <a
              href={BOTCHAIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-accent-300"
            >
              Built on BOT Chain <ArrowUpRight className="size-3.5" />
            </a>
            <span className="inline-flex items-center gap-2 text-muted">
              Follow @{X_HANDLE} on X
              <span className="rounded border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                coming soon
              </span>
            </span>
            <a
              href={explorerUrl(chainId)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-white transition-colors hover:text-accent-300"
            >
              BOT Chain Explorer <ArrowUpRight className="size-3.5" />
            </a>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-line/60 pt-5 text-xs text-muted sm:flex-row">
          <span>{PRODUCT.name} - BOT Chain</span>
          <span className="font-mono">Chain 968 (testnet) / 677 (mainnet)</span>
        </div>
      </div>
    </footer>
  );
}
