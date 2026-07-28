import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tokenId: string }> }
) {
  try {
    const { tokenId } = await params
    const backendUrl = getBackendApiBaseUrl()

    const backendResponse = await fetch(`${backendUrl}/api/copyright/fingerprint/${tokenId}`)

    if (!backendResponse.ok) {
      const contentType = backendResponse.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorJson = await backendResponse.json()
        return Response.json(errorJson, { status: backendResponse.status })
      }
      return Response.json({ success: false, message: "Fingerprint not found" }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return Response.json(data)
  } catch (error) {
    console.error("[Fingerprint] Error:", error)
    return Response.json({ error: "Failed to fetch fingerprint" }, { status: 500 })
  }
}
