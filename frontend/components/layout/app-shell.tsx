"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import FuturisticNavbar from "@/components/futuristic-navbar"
import { SiteFooter } from "@/components/site-footer"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const showDefaultNav = pathname !== "/"
  return (
    <>
      {showDefaultNav ? <FuturisticNavbar /> : null}
      {children}
      <SiteFooter />
    </>
  )
}
