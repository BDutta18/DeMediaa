import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ error: "Authentication required" }, { status: 401 })
    }

    const formData = await request.formData()

    const backendUrl = getBackendApiBaseUrl()
    const backendResponse = await fetch(`${backendUrl}/api/upload/upload`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let the browser set it with boundary
      },
    })

    if (!backendResponse.ok) {
      const contentType = backendResponse.headers.get("content-type")
      if (contentType?.includes("application/json")) {
        const errorJson = await backendResponse.json()
        return Response.json(errorJson, { status: backendResponse.status })
      }
      const error = await backendResponse.text()
      return Response.json({ success: false, message: error || "Upload failed" }, { status: backendResponse.status })
    }

    const data = await backendResponse.json()
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return Response.json({ error: "Failed to upload content" }, { status: 500 })
  }
}
