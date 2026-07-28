"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ExternalLink, Trash2, Upload, Share2 } from "lucide-react"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
import { cacheGet, cacheSet } from "@/lib/cache"
import { resolveMediaUrl } from "@/lib/media"

interface NFT {
  _id: string
  owner: string
  name: string
  description: string
  imageURL: string
  metadataURL: string
  ipfsHash: string
  tokenId: string
  txHash: string
  createdAt: string
}

export default function MyNFTsPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }

    const fetchMyNFTs = async () => {
      try {
        const cached = cacheGet<NFT[]>("demedia_cache_my_nfts")
        if (cached) {
          setNfts(cached)
          setLoading(false)
        }

        const token = localStorage.getItem("demedia_token")
        if (!token) {
          router.push("/auth")
          return
        }

        const response = await fetch("/api/nfts/my-nfts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if (data.success) {
          setNfts(data.data)
          cacheSet("demedia_cache_my_nfts", data.data, 60_000)
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMyNFTs()
  }, [isAuthenticated, router])

  const sharePost = async (nft: NFT) => {
    const url = `${window.location.origin}/post/${nft._id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.name,
          text: nft.description,
          url: url,
        })
      } catch (error) {
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <ParallaxOrbBackground />
      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-wider mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              My Creations
            </h1>
            <p className="text-gray-400 text-lg">Your tokenized masterpieces</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              <p className="mt-4">Loading your NFTs...</p>
            </div>
          ) : nfts.length === 0 ? (
            <div className="text-center py-20">
              <div className="glass rounded-3xl p-12 max-w-lg mx-auto">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-12 h-12 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">No NFTs Yet</h3>
                <p className="text-gray-400 mb-8">Start creating your digital legacy</p>
                <a
                  href="/upload"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform"
                >
                  <Upload className="w-5 h-5" />
                  Upload Your First NFT
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {nfts.map((nft, index) => (
                <div
                  key={nft._id}
                  className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                  <div className="relative rounded-3xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.45)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] transition-all duration-300">
                    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                      <img
                        src={resolveMediaUrl(nft.imageURL)}
                        alt={nft.name}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 truncate">{nft.name}</h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{nft.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-blue-400 font-mono">Token #{nft.tokenId}</span>
                      <span className="text-xs text-gray-500">{new Date(nft.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/post/${nft._id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View
                      </button>
                      <button
                        onClick={() => sharePost(nft)}
                        className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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


