"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { ChevronDown, LogOut, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import { botMainnet, botTestnet } from "@/config/chains";
import { shortenAddress } from "@/lib/format";

const SUPPORTED = [botMainnet.id, botTestnet.id];

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const chainId = useChainId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!isConnected) {
    const injectedConnector = connectors[0];
    return (
      <Button
        onClick={() =>
          injectedConnector
            ? connect({ connector: injectedConnector })
            : window.open("https://metamask.io/download/", "_blank")
        }
      >
        <Wallet className="size-4" />
        Connect Wallet
      </Button>
    );
  }

  const onSupported = SUPPORTED.includes(chainId as 677 | 968);
  const networkName =
    chainId === botMainnet.id ? "BOT Chain" : chainId === botTestnet.id ? "BOT Testnet" : `Chain ${chainId}`;

  return (
    <div className="flex items-center gap-2" ref={ref}>
      {!onSupported && (
        <Button
          size="sm"
          variant="outline"
          disabled={isSwitching}
          onClick={() => switchChain({ chainId: botTestnet.id })}
        >
          Switch network
        </Button>
      )}
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-line bg-ink-850 px-3 py-2 text-sm hover:border-ink-600"
        >
          <span className={onSupported ? "size-2 rounded-full bg-accent-400" : "size-2 rounded-full bg-warn-400"} />
          <span className="font-mono text-xs">{shortenAddress(address)}</span>
          <span className="hidden text-xs text-muted sm:inline">{networkName}</span>
          <ChevronDown className="size-3.5 text-muted" />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-line bg-ink-850 shadow-xl">
            <p className="border-b border-line px-3 py-2 text-xs uppercase tracking-wide text-muted">
              Network
            </p>
            {[botTestnet, botMainnet].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  switchChain({ chainId: c.id });
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-ink-800"
              >
                <span>{c.name}</span>
                {chainId === c.id && <span className="size-1.5 rounded-full bg-accent-400" />}
              </button>
            ))}
            <button
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 border-t border-line px-3 py-2 text-left text-sm text-danger-400 hover:bg-ink-800"
            >
              <LogOut className="size-3.5" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
