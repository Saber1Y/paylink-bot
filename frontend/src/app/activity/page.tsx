import { ActivityFeed } from "@/components/ActivityFeed";
import { PRODUCT } from "@/lib/product";

export default function ActivityPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-accent-400">{PRODUCT.activityEyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{PRODUCT.activityTitle}</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">{PRODUCT.activityBlurb}</p>
      </div>
      <ActivityFeed />
    </div>
  );
}
