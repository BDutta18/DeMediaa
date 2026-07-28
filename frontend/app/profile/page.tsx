import type { Metadata } from "next"
import ProfileClient from "./profile-client"

type ProfilePageProps = {
  searchParams?: {
    setup?: string
  }
}

export const metadata: Metadata = {
  title: "Profile | DeMedia",
  description: "Create and manage your creator identity on DeMedia.",
}

export default function ProfilePage({ searchParams }: ProfilePageProps) {
  return <ProfileClient initialIsNewProfile={searchParams?.setup === "1"} />
}
