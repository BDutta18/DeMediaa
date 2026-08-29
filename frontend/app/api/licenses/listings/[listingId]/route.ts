import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> },
) {
  try {
    const { listingId } = await params
    const backendUrl = getBackendApiBaseUrl()

    const backendResponse = await fetch(`${backendUrl}/api/licenses/listings/${listingId}`)

    if (!backendResponse.ok) {
      const contentType = backendResponse.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorJson = await backendResponse.json()
        return Response.json(errorJson, { status: backendResponse.status })
      }
      return Response.json(
        { success: false, message: "Listing not found" },
        { status: backendResponse.status },
      )
    }

    const data = await backendResponse.json()
    return Response.json(data)
  } catch (error) {
    console.error("[Listing Detail] Error:", error)
    return Response.json({ error: "Failed to fetch listing" }, { status: 500 })
  }
}
