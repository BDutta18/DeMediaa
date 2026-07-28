"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Camera, Sparkles, Upload } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"
import { FeatureShell } from "@/components/feature-shell"

interface ProfileData {
  name: string
  email: string
  avatar: string
  bio: string
  banner: string
  showcaseTitle: string
}

const emptyProfile: ProfileData = {
  name: "",
  email: "",
  avatar: "",
  bio: "",
  banner: "",
  showcaseTitle: "My Creation Vault",
}

export default function ProfileClient({ initialIsNewProfile }: { initialIsNewProfile: boolean }) {
  const { isAuthenticated, token, address, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<ProfileData>(emptyProfile)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [isNewProfile, setIsNewProfile] = useState(initialIsNewProfile)
  const [avatarPreview, setAvatarPreview] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth")
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    ;(async () => {
      if (!address) return
      const res = await fetch(`/api/user/profile/${address}`)
      const data = await res.json()
      if (data.success && data.user) {
        setIsNewProfile(false)
        setFormData({
          name: data.user.name || "",
          email: data.user.email || "",
          avatar: data.user.avatar || "",
          bio: data.user.bio || "",
          banner: data.user.banner || "",
          showcaseTitle: data.user.showcaseTitle || "My Creation Vault",
        })
      } else {
        setIsNewProfile(true)
      }
    })()
  }, [address])

  const avatarSource = useMemo(
    () => avatarPreview || resolveMediaUrl(formData.avatar || "/placeholder-user.jpg"),
    [avatarPreview, formData.avatar],
  )

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const uploadAvatar = async (file: File) => {
    if (!token) throw new Error("Sign in again to upload your profile picture.")
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
    setAvatarUploading(true)
    try {
      const formDataPayload = new FormData()
      formDataPayload.append("file", file)

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataPayload,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || data.message || "Avatar upload failed.")

      const uploadedUrl =
        data.url ||
        data.fileUrl ||
        data.avatarUrl ||
        data.path ||
        data.data?.url ||
        data.data?.fileUrl ||
        data.data?.path

      setFormData((current) => ({
        ...current,
        avatar: typeof uploadedUrl === "string" && uploadedUrl ? uploadedUrl : previewUrl,
      }))
      setMessage("Profile picture updated.")
    } finally {
      setAvatarUploading(false)
      setAvatarPreview("")
    }
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const res = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Profile update failed")
      setMessage("Profile updated.")
    } catch (error: any) {
      setMessage(error.message || "Profile update failed.")
    } finally {
      setSaving(false)
    }
  }

  if (isLoading || !isAuthenticated) return null

  return (
    <FeatureShell
      eyebrow={isNewProfile ? "Create profile" : "Profile"}
      title={isNewProfile ? "Create your creator identity." : "Your creator identity, polished."}
      description={
        isNewProfile
          ? "New here? Set up your public creator profile first so your gallery, wallet, and ownership details feel complete."
          : "Shape your public profile with a live preview, cleaner layout, and wallet-first details that feel more premium."
      }
      stats={[
        ["Status", isNewProfile ? "New profile setup" : "Editable profile"],
        ["Wallet", "Connected"],
        ["Vault", formData.showcaseTitle || "My Creation Vault"],
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.05] shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
          <div
            className="h-56 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg,rgba(0,0,0,0.06),rgba(5,8,22,0.82)), url('${resolveMediaUrl(
                formData.banner || "/metaverse-space.jpg",
              )}')`,
            }}
          />
          <div className="-mt-16 px-6 pb-6">
            <div className="relative h-28 w-28">
              <img
                src={avatarSource}
                alt="Profile avatar"
                className="h-28 w-28 rounded-full border-4 border-[#050816] object-cover shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                onError={(event) => {
                  event.currentTarget.src = "/placeholder-user.jpg"
                }}
              />
              <label className="absolute bottom-1 right-1 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-black/70 text-white shadow-lg backdrop-blur transition hover:bg-black">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    event.target.value = ""
                    if (!file) return
                    try {
                      await uploadAvatar(file)
                    } catch (error) {
                      setMessage(error instanceof Error ? error.message : "Avatar upload failed.")
                      setAvatarPreview("")
                    }
                  }}
                  disabled={avatarUploading}
                />
                {avatarUploading ? <Upload className="h-4 w-4 animate-pulse" /> : <Camera className="h-4 w-4" />}
              </label>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-semibold tracking-tight">
                {formData.name || (isNewProfile ? "Create your profile" : "Your Creator Profile")}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Verified Creator
              </span>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">
              {formData.bio ||
                (isNewProfile
                  ? "Add a photo, name, and bio to launch your creator profile."
                  : "Shape how your creator identity appears across DeMedia.")}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Showcase title</p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">{formData.showcaseTitle || "My Creation Vault"}</p>
                <p className="mt-2 text-xs text-zinc-500">Public-facing label for your collection.</p>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Display name"],
              ["email", "Email"],
              ["avatar", "Avatar URL"],
              ["banner", "Banner URL"],
              ["showcaseTitle", "Showcase title"],
            ].map(([name, label]) => (
              <label key={name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</span>
                <input
                  name={name}
                  value={formData[name as keyof ProfileData]}
                  onChange={update}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
                />
              </label>
            ))}
            <label className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Bio</span>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={update}
                rows={6}
                className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button disabled={saving} className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50">
              {saving ? "Saving..." : isNewProfile ? "Create Profile" : "Save Profile"}
            </button>
            {message ? <p className="text-sm text-zinc-300">{message}</p> : null}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Profile", "Public creator card"],
              ["Assets", "Gallery and ownership"],
              ["Identity", "Wallet-backed access"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-zinc-100">{value}</p>
              </div>
            ))}
          </div>
        </form>
      </div>
    </FeatureShell>
  )
}
