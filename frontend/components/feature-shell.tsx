import type { ReactNode } from "react"

type FeatureShellProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  actions?: ReactNode
  stats?: Array<[string, string]>
}

export function FeatureShell({ eyebrow, title, description, children, actions, stats }: FeatureShellProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#060913] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,0.18),rgba(248,113,113,0.1),rgba(250,204,21,0.08))]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg">{description}</p>
            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {(stats ?? [
              ["Live", "Protocol ready"],
              ["Proof", "On-chain media"],
              ["Identity", "Wallet secured"],
            ]).map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-zinc-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</section>
    </main>
  )
}
