import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <FeatureShell
      eyebrow="Notification center"
      title="Watch your marketplace update in near real time."
      description="Track follows, reviews, saves, downloads, and system events in one stream."
      stats={[
        ["Unread", "0"],
        ["Total", "0"],
        ["Live", "Auto refresh"],
      ]}
    >
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-6 w-2/3" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </div>
    </FeatureShell>
  )
}
