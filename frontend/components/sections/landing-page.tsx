"use client"

import Image from "next/image"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useRef } from "react"
import { GlowButton } from "@/components/ui/glow-button"
import { GlassPanel } from "@/components/ui/glass-panel"
import { useLenis } from "@/hooks/use-lenis"
import { BrandLockup } from "@/components/brand-lockup"

const realPhotography = [
  {
    src: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1800&q=85",
    label: "Creator studio",
  },
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=85",
    label: "Publishing desk",
  },
  {
    src: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=85",
    label: "Creative team",
  },
  {
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1800&q=85",
    label: "Editorial review",
  },
]

function Hero() {
  const ref = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.2])

  return (
    <section ref={ref} className="relative min-h-[110vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2400&q=75"
        alt="Creators collaborating around digital content"
        className="absolute inset-0 h-full w-full object-cover opacity-35"
      />
      <motion.div
        style={{ scale }}
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.72)_0%,rgba(5,8,22,0.82)_58%,#050816_100%)]"
      />
      <motion.div style={{ opacity }} className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,#050816_100%)]" />
      <div className="absolute left-0 top-1 z-20 sm:left-2 sm:top-3">
        <BrandLockup />
      </div>
      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-7xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mt-7 max-w-5xl text-balance text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-8xl">
          Own Your Content.
          <br />
          <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
            Control Your Identity.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-zinc-300 sm:text-lg">
          A cinematic, creator-first operating system for publishing, proving, monetizing, and governing digital media.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <GlowButton href="/auth">Launch App</GlowButton>
          <GlowButton href="/dashboard" variant="ghost">
            Explore Protocol
          </GlowButton>
        </div>
      </div>
    </section>
  )
}

function StickyStory() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-xs tracking-[0.2em] text-cyan-300">OWNERSHIP ENGINE</p>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Production-grade trust, told in motion.
          </h2>
          <p className="mt-5 max-w-xl text-zinc-300">
            Apple-style narrative flow meets Web3 integrity. Every interaction reveals where content comes from, who owns it, and how value moves.
          </p>
        </div>
        <div className="space-y-5">
          {[
            ["01", "Upload & Fingerprint", "Content enters with metadata verification and immutable hashing."],
            ["02", "Mint Ownership", "Creator rights become programmable assets with transparent custody."],
            ["03", "Monetize Flows", "Licensing, royalties, and subscriptions stream through policy rails."],
            ["04", "Govern with Community", "Proposals, voting, treasury execution, and accountable upgrades."],
          ].map(([id, title, text], i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassPanel className="p-6">
                <p className="text-xs tracking-[0.2em] text-cyan-300">{id}</p>
                <h3 className="mt-2 text-2xl font-medium">{title}</h3>
                <p className="mt-3 text-zinc-300">{text}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function VisualGallery() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24">
      <h2 className="text-center text-4xl font-semibold sm:text-6xl">The Interface of Digital Ownership</h2>
      <p className="mx-auto mt-5 max-w-2xl text-center text-zinc-300">
        Rich, layered visual language designed for creators, DAOs, media organizations, and protocol-native teams.
      </p>
      <div className="mt-14 grid gap-4 sm:grid-cols-2">
        {realPhotography.map((photo, i) => (
          <motion.div
            key={photo.src}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -8, scale: 1.01 }}
          >
            <GlassPanel className="group overflow-hidden p-2">
              <div className="relative overflow-hidden rounded-xl">
                <img
                  src={photo.src}
                  alt={`${photo.label} for DeMedia`}
                  loading="lazy"
                  decoding="async"
                  className="h-[300px] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.6)_100%)]" />
                <p className="absolute bottom-4 left-4 text-sm text-zinc-100">{photo.label}</p>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function MetricsBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <GlassPanel className="grid gap-5 p-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["250K+", "Verified Assets"],
          ["50K+", "Creators"],
          ["1M+", "On-chain Transactions"],
          ["99.9%", "Verification Accuracy"],
        ].map(([v, l]) => (
          <div key={l}>
            <p className="text-4xl font-semibold">{v}</p>
            <p className="mt-2 text-sm text-zinc-300">{l}</p>
          </div>
        ))}
      </GlassPanel>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[linear-gradient(120deg,rgba(79,140,255,0.2),rgba(123,97,255,0.18),rgba(0,212,255,0.2))] p-10 sm:p-16">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-semibold sm:text-6xl">Take Back Ownership of Digital Media</h2>
          <p className="mx-auto mt-5 max-w-2xl text-zinc-200">
            Built for teams who care about product quality and protocol truth.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <GlowButton href="/auth">Start Building</GlowButton>
            <GlowButton href="/content" variant="ghost">
              Documentation <ArrowUpRight className="ml-2 h-4 w-4" />
            </GlowButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingPage() {
  useLenis()
  return (
    <main className="bg-[#050816] text-white">
      <Hero />
      <StickyStory />
      <VisualGallery />
      <MetricsBand />
      <FinalCta />
    </main>
  )
}
