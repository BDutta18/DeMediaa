import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <FeatureShell
      eyebrow="Creator analytics"
      title="Your content business, in real time."
      description="Track sales, revenue, downloads, and engagement from one command center."
      stats={[
        ["Wallet", "Loading..."],
        ["Notifications", "0"],
        ["Engagement", "0"],
      ]}
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-4 h-8 w-32" />
              <Skeleton className="mt-6 h-24 w-full rounded-2xl" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Skeleton className="h-[420px] rounded-3xl" />
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
        </div>
      </div>
    </FeatureShell>
  )
}
