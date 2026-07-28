import type { Metadata } from "next"
import PostDetail from "./post-detail"
import { getBackendApiBaseUrl } from "@/lib/backend-url"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const baseUrl = getBackendApiBaseUrl()
    const response = await fetch(`${baseUrl}/api/upload/find`)
    const data = await response.json()

    const nft = data.success ? data.data.find((n: any) => n._id === id) : null

    if (!nft) {
      return {
        title: "Post Not Found | DeMedia",
        description: "The requested post could not be found.",
      }
    }

    return {
      title: `${nft.name} | DeMedia`,
      description: nft.description || "View this amazing NFT on DeMedia",
      openGraph: {
        title: nft.name,
        description: nft.description,
        images: [nft.imageURL],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: nft.name,
        description: nft.description,
        images: [nft.imageURL],
      },
    }
  } catch (error) {
    return {
      title: "DeMedia",
      description: "Decentralized content creation platform",
    }
  }
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params
  return <PostDetail postId={id} />
}

