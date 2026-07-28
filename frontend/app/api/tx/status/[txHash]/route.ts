import { getBackendApiBaseUrl } from "@/lib/backend-url"

export async function GET(
  _request: Request,
  context: { params: Promise<{ txHash: string }> },
) {
  try {
    const { txHash } = await context.params
    const backendUrl = getBackendApiBaseUrl()
    const response = await fetch(`${backendUrl}/api/tx/status/${txHash}`, {
      cache: "no-store",
    })
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    return Response.json(
      { success: false, errorCode: "UNKNOWN", message: "Failed to fetch tx status" },
      { status: 500 },
    )
  }
}
