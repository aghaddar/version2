import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Make sure this route is not cached

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      next: { revalidate: 0 }, // Don't cache the response
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `API returned status ${response.status}: ${response.statusText}` },
        { status: response.status },
      )
    }

    try {
      const data = await response.json()
      return NextResponse.json(data)
    } catch (jsonError) {
      // If the response is not JSON, return the text
      const text = await response.text()
      return new Response(text, {
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}
