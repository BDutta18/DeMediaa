import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const backendUrl = getBackendApiBaseUrl()

    const backendResponse = await fetch(`${backendUrl}/api/licenses/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!backendResponse.ok) {
      const contentType = backendResponse.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorJson = await backendResponse.json()
        return Response.json(errorJson, { status: backendResponse.status })
      }
      return Response.json({ success: false, message: "License purchase failed" }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return Response.json(data)
  } catch (error) {
    console.error("[License Purchase] Error:", error)
    return Response.json({ error: "Failed to purchase license" }, { status: 500 })
  }
}
