import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const param = searchParams.get("param") || "no-param"

    // Return a simple response to test API connectivity
    return NextResponse.json({
      message: "API test endpoint is working",
      receivedParam: param,
      timestamp: new Date().toISOString(),
      env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "not set",
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "not set",
      },
    })
  } catch (error) {
    console.error("Error in test API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
