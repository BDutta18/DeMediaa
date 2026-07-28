"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Calendar, ExternalLink } from "lucide-react"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
import { getBackendApiBaseUrl } from "@/lib/backend-url"
import { resolveMediaUrl } from "@/lib/media"

interface User {
  _id: string
  address: string
  name: string
  avatar: string
  bio: string
  email?: string
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
  createdAt: string
}

export default function UserProfilePage() {
  const params = useParams()
  const address = params.address as string

  const [user, setUser] = useState<User | null>(null)
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Fetch user profile
        const backendUrl = getBackendApiBaseUrl()
        const profileResponse = await fetch(`${backendUrl}/api/wallet/profile/${address}`)
        const profileData = await profileResponse.json()

        if (profileData.success) {
          setUser(profileData.user)
        }

        // Fetch all NFTs and filter by owner
        const nftsResponse = await fetch("/api/nfts/all")
        const nftsData = await nftsResponse.json()

        if (nftsData.success) {
          const userNFTs = nftsData.data.filter((nft: NFT & { owner: string }) => nft.owner === address)
          setNfts(userNFTs)
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [address])

  if (loading) {
    return (
      <>
        <ParallaxOrbBackground />        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500 mb-4" />
            <p>Loading profile...</p>
          </div>
        </main>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <ParallaxOrbBackground />        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-400">
            <p>User not found</p>
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
          <div className="glass rounded-3xl p-0 mb-12 shadow-2xl overflow-hidden">
            <div
              className="h-40 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${user.accentColor || "#3b82f6"}66, #0a0a0f), url('${resolveMediaUrl(user.banner)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-blue-500/30 shadow-2xl flex-shrink-0">
                {user.avatar ? (
                  <img
                    src={resolveMediaUrl(user.avatar)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-4xl font-bold text-blue-400">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-black text-white mb-2">{user.name}</h1>
                <p className="text-sm uppercase tracking-[0.2em] mb-2" style={{ color: user.accentColor || "#3b82f6" }}>
                  {user.showcaseTitle || "My Creation Vault"}
                </p>
                <p className="text-blue-400 font-mono text-sm mb-4">
                  {user.address.slice(0, 10)}...{user.address.slice(-8)}
                </p>
                {user.bio && <p className="text-gray-400 mb-4">{user.bio}</p>}

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <ExternalLink className="w-4 h-4" />
                    {nfts.length} NFTs
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* NFTs Grid */}
          <div>
            <h2 className="text-3xl font-black text-white mb-8">{user.showcaseTitle || "Created NFTs"}</h2>

            {nfts.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <p>No NFTs created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {nfts.map((nft, index) => (
                  <div
                    key={nft._id}
                    className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                    <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                        <img
                          src={resolveMediaUrl(nft.imageURL)}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1 truncate">{nft.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-2">{nft.description}</p>
            
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

