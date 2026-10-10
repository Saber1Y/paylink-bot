import { Suspense } from "react";
import { CreateForm } from "@/components/CreateForm";
import { PRODUCT } from "@/lib/product";

export default function CreatePage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-accent-400">{PRODUCT.createEyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{PRODUCT.createTitle}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">{PRODUCT.createBlurb}</p>
      </div>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl border border-line bg-ink-900" />}>
        <CreateForm />
      </Suspense>
    </div>
  );
}
