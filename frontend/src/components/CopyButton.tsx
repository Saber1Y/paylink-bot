"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label,
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-line bg-ink-850 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-white",
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-accent-400" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label ?? "Copy"}
    </button>
  );
}
