import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const backendUrl = getBackendApiBaseUrl()

    const backendResponse = await fetch(`${backendUrl}/api/licenses/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!backendResponse.ok) {
      const contentType = backendResponse.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorJson = await backendResponse.json()
        return Response.json(errorJson, { status: backendResponse.status })
      }
      return Response.json(
        { success: false, message: "Failed to fetch licenses" },
        { status: backendResponse.status },
      )
    }

    const data = await backendResponse.json()
    return Response.json(data)
  } catch (error) {
    console.error("[My Licenses] Error:", error)
    return Response.json({ error: "Failed to fetch licenses" }, { status: 500 })
  }
}
