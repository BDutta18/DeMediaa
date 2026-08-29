import { NextRequest } from "next/server"
import { getBackendApiBaseUrl } from "@/lib/backend-url"

const proxyRequest = async (request: NextRequest, path: string[] = []) => {
  const backendUrl = getBackendApiBaseUrl()
  const url = new URL(request.url)
  const backendPath = path.length ? `/${path.join("/")}` : ""

  const headers: Record<string, string> = {}
  const authHeader = request.headers.get("authorization")
  if (authHeader) headers.Authorization = authHeader

  const cosignerHeader = request.headers.get("x-cosigner-authorization")
  if (cosignerHeader) headers["x-cosigner-authorization"] = cosignerHeader

  const contentType = request.headers.get("content-type")
  if (contentType) headers["Content-Type"] = contentType

  const backendResponse = await fetch(`${backendUrl}/api/marketplace${backendPath}${url.search}`, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
  })

  const responseContentType = backendResponse.headers.get("content-type") || ""
  if (responseContentType.includes("application/json")) {
    const data = await backendResponse.json()
    return Response.json(data, { status: backendResponse.status })
  }

  const text = await backendResponse.text()
  return new Response(text, {
    status: backendResponse.status,
    headers: responseContentType ? { "content-type": responseContentType } : undefined,
  })
}

// Next.js 16: params is a Promise in route handlers
export async function GET(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params
  return proxyRequest(request, path)
}