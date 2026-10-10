import Link from "next/link";
import { ArrowRight, PencilLine, Share2, Wallet } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { PRODUCT } from "@/lib/product";

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-2xl border border-line bg-ink-900">
        <div className="grid-band absolute inset-0 opacity-60" />
        <div className="absolute -left-24 -top-24 size-72 rounded-full bg-accent-500/10 blur-3xl" />
        <div className="relative px-6 py-16 sm:px-12 sm:py-24">
          <Badge tone="accent" className="mb-6">
            {PRODUCT.heroBadge}
          </Badge>
          <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            {PRODUCT.heroTitle}{" "}
            <span className="text-accent-400">{PRODUCT.heroHighlight}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted">{PRODUCT.heroBody}</p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-accent-500 px-5 py-3 text-sm font-medium text-ink-950 transition-colors hover:bg-accent-400"
            >
              {PRODUCT.createCta}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/activity"
              className="inline-flex items-center gap-2 rounded-lg border border-line bg-ink-850 px-5 py-3 text-sm font-medium transition-colors hover:border-ink-600"
            >
              <ArrowRight className="size-4" />
              View all requests
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">How it works</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              step: "01",
              title: "Create a request",
              body: "Connect your wallet, set the amount, description and recipient, and sign once.",
              icon: PencilLine,
            },
            {
              step: "02",
              title: "Share the link",
              body: "Every request gets a /pay/<id> link. Send it anywhere.",
              icon: Share2,
            },
            {
              step: "03",
              title: "Get paid on-chain",
              body: "The payer connects a wallet and pays. The contract marks it Paid and it shows in the feed.",
              icon: Wallet,
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.step} className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-sm text-accent-500">{s.step}</span>
                  <Icon className="size-4 text-muted" />
                </div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}