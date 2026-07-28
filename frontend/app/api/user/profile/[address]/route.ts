import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function GET(request: Request, context: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await context.params

    if (!address) {
      return Response.json({ success: false, message: "Address is required" }, { status: 400 })
    }

    const backendUrl = getBackendApiBaseUrl()
    const response = await fetch(`${backendUrl}/api/wallet/profile/${address}`)
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    return Response.json({ success: false, message: "Failed to fetch user profile" }, { status: 500 })
  }
}
