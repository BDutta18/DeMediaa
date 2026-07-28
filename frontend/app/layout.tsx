import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { AppShell } from "@/components/layout/app-shell"

export const metadata: Metadata = {
  title: "DeMedia - Decentralized Publishing Platform",
  description: "Revolutionary Web3 content sharing and tokenization platform",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/dm-logo-mark.svg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/dm-logo-mark.svg",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/dm-logo-mark.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/dm-logo-mark.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const analyticsEnabled = process.env.NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS === "true"

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        {analyticsEnabled ? <Analytics /> : null}
      </body>
    </html>
  )
}
