import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:3001"
  const authHeader = request.headers.get("Authorization")

  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch profile from backend: ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Return the raw data from the backend
    return NextResponse.json({
      message: "Debug profile data",
      backendData: data,
      localData: {
        profileUrl: data.profile_url || data.avatar_url,
        processedUrl: data.profile_url || data.avatar_url,
      },
    })
  } catch (error) {
    console.error("Debug profile error:", error)
    return NextResponse.json({ error: "Failed to fetch profile data" }, { status: 500 })
  }
}
