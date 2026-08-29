import type { Metadata } from "next"

interface SeoProps {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: "website" | "article"
}

export const defaultSeo = {
  title: "DeMedia | Decentralized Media Publishing Platform",
  description:
    "Decentralized media content publishing and licensing platform built on Stellar with Soroban smart contracts.",
  url: "https://de-media-xi.vercel.app",
  siteName: "DeMedia",
  image: "/dm-logo-mark.svg",
}

export function constructMetadata({
  title = defaultSeo.title,
  description = defaultSeo.description,
  image = defaultSeo.image,
  url = defaultSeo.url,
  type = "website",
}: SeoProps = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: defaultSeo.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@DeMedia",
    },
    icons: "/favicon.ico",
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://de-media-xi.vercel.app"),
  }
}
