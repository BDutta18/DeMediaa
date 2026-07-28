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
    const backendResponse = await fetch(`${backendUrl}/api/upload/avatar`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await backendResponse.json()
    return Response.json(data, { status: backendResponse.status })
  } catch (error) {
    return Response.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}
