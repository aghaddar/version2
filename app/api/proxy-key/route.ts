import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const referer = searchParams.get("referer") || "https://kwik.cx/"
    const domain = searchParams.get("domain") // Get the domain parameter

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }

    console.log(`Proxying key file from: ${url}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      // Create headers based on the domain
      const headers = new Headers()

      if (domain === "padorupado") {
        // Special headers for padorupado.ru
        const urlObj = new URL(url)
        headers.set(
          "User-Agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )
        headers.set("Accept", "*/*")
        headers.set("Accept-Language", "en-US,en;q=0.9")
        headers.set("Origin", urlObj.origin)
        headers.set("Referer", urlObj.origin + "/")
        headers.set("Sec-Fetch-Dest", "empty")
        headers.set("Sec-Fetch-Mode", "cors")
        headers.set("Sec-Fetch-Site", "same-origin")
      } else {
        // Default headers
        headers.set(
          "User-Agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )
        headers.set("Accept", "*/*")
        headers.set("Accept-Language", "en-US,en;q=0.9")
        headers.set("Origin", "https://kwik.cx")
        headers.set("Referer", referer)
      }

      console.log(`Fetching key file with headers:`, Object.fromEntries(headers.entries()))

      const response = await fetch(url, {
        signal: controller.signal,
        headers,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Failed to fetch key file: ${response.status} ${response.statusText}`)
        return new NextResponse(`Failed to fetch key file: ${response.status}`, {
          status: response.status,
        })
      }

      // Get the content type from the response or default to octet-stream
      const contentType = response.headers.get("content-type") || "application/octet-stream"

      // Stream the response
      const data = await response.arrayBuffer()

      return new NextResponse(data, {
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("Error proxying key file:", error)

      if (error.name === "AbortError") {
        return new NextResponse("Key file request timed out", { status: 504 })
      }

      return new NextResponse(`Error proxying key file: ${error.message}`, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in proxy-key route:", error)
    return new NextResponse(`Server error: ${error.message}`, { status: 500 })
  }
}
