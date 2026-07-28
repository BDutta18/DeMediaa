import { type NextRequest, NextResponse } from "next/server"
import { getBackendApiBaseUrlCandidates } from "@/lib/backend-url"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrls = getBackendApiBaseUrlCandidates()
    const attempts: Array<{ url: string; reason: string }> = []

    for (const backendUrl of backendUrls) {
      const targetUrl = `${backendUrl}/api/wallet/verify`
      console.log(`Proxying verification request to: ${targetUrl}`)

      try {
        const response = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(10000),
        })

        const contentType = response.headers.get("content-type")

        if (!response.ok) {
          const errorData = contentType?.includes("application/json")
            ? await response.json()
            : await response.text()

          console.error(`Backend verification failed (${response.status}) on ${backendUrl}:`, errorData)

          if (response.status >= 400 && response.status < 500) {
            return NextResponse.json(
              typeof errorData === "string" ? { message: errorData } : errorData,
              { status: response.status },
            )
          }

          attempts.push({
            url: backendUrl,
            reason: typeof errorData === "string" ? errorData : JSON.stringify(errorData),
          })
          continue
        }

        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          attempts.push({ url: backendUrl, reason: `Invalid non-JSON response: ${text}` })
          continue
        }

        const data = await response.json()
        return NextResponse.json(data, { status: 200 })
      } catch (error) {
        attempts.push({
          url: backendUrl,
          reason: error instanceof Error ? error.message : "Unknown network error",
        })
      }
    }

    return NextResponse.json(
      {
        message: "Unable to reach authentication server",
        detail: attempts,
      },
      { status: 503 },
    )
  } catch (error) {
    console.error("Verification proxy error:", error)
    return NextResponse.json(
      { message: "Verification failed", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
