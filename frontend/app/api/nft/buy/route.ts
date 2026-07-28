import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")
    const cosignerAuthHeader = request.headers.get("x-cosigner-authorization")

    if (!authHeader) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = getBackendApiBaseUrl()
    const response = await fetch(`${backendUrl}/api/nft/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        ...(cosignerAuthHeader ? { "x-cosigner-authorization": cosignerAuthHeader } : {}),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (_error) {
    return Response.json({ success: false, message: "Failed to buy NFT" }, { status: 500 })
  }
}
