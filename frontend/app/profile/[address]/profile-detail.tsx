"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Share2, ExternalLink, Check, Calendar, LinkIcon } from "lucide-react"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
import { resolveMediaUrl } from "@/lib/media"

interface User {
  _id: string
  address: string
  name?: string
  email?: string
  avatar?: string
  bio?: string
  banner?: string
  accentColor?: string
  showcaseTitle?: string
  createdAt: string
}

interface NFT {
  _id: string
  name: string
  description: string
  imageURL: string
  tokenId: string
}

export default function ProfileDetail({ address }: { address: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, nftsRes] = await Promise.all([fetch(`/api/user/profile/${address}`), fetch("/api/nfts/all")])

        const profileData = await profileRes.json()
        const nftsData = await nftsRes.json()

        if (profileData && profileData.user) {
          setUser(profileData.user)
        }

        if (nftsData.success && nftsData.data) {
          const userNfts = nftsData.data.filter(
            (nft: NFT & { owner: string }) => nft.owner.toLowerCase() === address.toLowerCase(),
          )
          setNfts(userNfts)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  const shareProfile = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: user?.name || "Creator Profile",
          text: user?.bio || "Check out this creator on DeMedia",
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <>
        <ParallaxOrbBackground />        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <ParallaxOrbBackground />        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Profile Not Found</h1>
            <button
              onClick={() => router.push("/search")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform"
            >
              Search Users
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <ParallaxOrbBackground />
      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="glass rounded-3xl p-0 mb-12 overflow-hidden">
            <div
              className="h-40 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${user.accentColor || "#3b82f6"}66, #0a0a0f), url('${resolveMediaUrl(user.banner)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                  {user.avatar ? (
                    <img
                      src={resolveMediaUrl(user.avatar)}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  ) : (
                    user.name?.[0] || "?"
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-[#0a0a0f]" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{user.name || "Anonymous Creator"}</h1>
                <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: user.accentColor || "#3b82f6" }}>
                  {user.showcaseTitle || "My Creation Vault"}
                </p>
                <p className="text-gray-500 font-mono text-sm mb-4">{`${address.slice(0, 6)}...${address.slice(-4)}`}</p>
                {user.bio && <p className="text-gray-400 mb-6 leading-relaxed">{user.bio}</p>}

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <LinkIcon className="w-4 h-4" />
                    {nfts.length} {nfts.length === 1 ? "Creation" : "Creations"}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={shareProfile}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                    {copied ? "Copied!" : "Share Profile"}
                  </button>
                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white transition-all"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Stellar Expert
                  </a>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{user.showcaseTitle || "Creations"}</h2>
          </div>

          {nfts.length === 0 ? (
            <div className="text-center py-20 glass rounded-3xl">
              <p className="text-gray-400 text-lg">No creations yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {nfts.map((nft, index) => (
                <div
                  key={nft._id}
                  className="group relative cursor-pointer"
                  onClick={() => router.push(`/post/${nft._id}`)}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                  <div className="relative rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.45)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-300">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                      <img
                        src={resolveMediaUrl(nft.imageURL)}
                        alt={nft.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 truncate">{nft.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{nft.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

