import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="page-shell min-h-screen py-6 sm:py-8 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="grid gap-2 sm:grid-cols-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </section>
        <aside className="space-y-4">
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-28 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-72 rounded-3xl" />
        </aside>
      </div>
    </main>
  )
}
