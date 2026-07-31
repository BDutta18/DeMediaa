import { FeatureShell } from "@/components/feature-shell"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <FeatureShell
      eyebrow="Marketplace"
      title="A refined storefront for decentralized media."
      description="Browse trending content, sort by price or popularity, and save pieces for later."
      stats={[
        ["Listings", "Loading..."],
        ["Saved", "0"],
        ["Trending", "0"],
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Skeleton className="h-52 rounded-3xl" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <Skeleton className="h-52 w-full rounded-2xl" />
                <Skeleton className="mt-4 h-5 w-2/3" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-72 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    </FeatureShell>
  )
}
