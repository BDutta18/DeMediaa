"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ExternalLink, ImageIcon, Search, Sparkles, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"

interface User {
  _id: string
  address: string
  name: string
  avatar: string
  bio: string
}

const searchHighlights = [
  { icon: Users, title: "Creator profiles", text: "Find people behind published work." },
  { icon: Sparkles, title: "Verified identity", text: "Wallet-first discovery with clean profile signals." },
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  const searchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/user/search?name=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("[v0] Failed to search users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070f] text-white">
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,0.18),rgba(248,113,113,0.1),rgba(250,204,21,0.08))]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <h1 className="mt-6 max-w-4xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:mt-7 sm:text-6xl lg:text-7xl">
                Discover verified creators.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:mt-5 sm:text-lg sm:leading-8">
                Search wallet-backed profiles, creator bios, and public identity records across DeMedia.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {searchHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-black/25 p-4 backdrop-blur">
                  <item.icon className="h-5 w-5 text-cyan-200" />
                  <p className="mt-3 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-cyan-300/20 via-white/10 to-amber-300/20 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-black/30 px-4 py-3 sm:gap-4 sm:px-5">
              <Search className="h-6 w-6 shrink-0 text-cyan-200" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search creators by name..."
                className="min-w-0 flex-1 bg-transparent py-3 text-base text-white outline-none placeholder:text-zinc-500"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:border-cyan-300/50 hover:text-white"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center text-zinc-400">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-cyan-300/20 border-t-cyan-300" />
              <p className="mt-4">Searching creator network...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="grid gap-4">
              {users.map((user, index) => (
                <article
                  key={user._id}
                  className="group relative animate-in cursor-pointer fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => router.push(`/profile/${user.address}`)}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-300/20 via-white/10 to-amber-300/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="relative rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/40 sm:p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-lg">
                        {user.avatar ? (
                          <img
                            src={resolveMediaUrl(user.avatar)}
                            alt={user.name || "Creator avatar"}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = "/placeholder-user.jpg"
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white/[0.04]">
                            <ImageIcon className="h-7 w-7 text-zinc-500" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="mb-1 truncate text-lg font-semibold text-white sm:text-xl">{user.name || "Unnamed User"}</h3>
                        <p className="mb-2 font-mono text-xs text-zinc-400 sm:text-sm">
                          {user.address.slice(0, 8)}...{user.address.slice(-6)}
                        </p>
                        {user.bio ? <p className="line-clamp-1 text-sm text-zinc-500">{user.bio}</p> : null}
                      </div>

                      <button className="self-start shrink-0 rounded-xl border border-white/10 bg-black/25 p-3 text-cyan-200 transition-all hover:bg-white/10 group-hover:scale-105 sm:self-auto" aria-label={`Open ${user.name || "creator"} profile`}>
                        <ExternalLink className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center text-zinc-400">
              <p>No creators found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-10 text-center text-zinc-500">
              <Search className="mx-auto h-10 w-10 text-zinc-600" />
              <p className="mt-4">Start typing to search for creators</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
