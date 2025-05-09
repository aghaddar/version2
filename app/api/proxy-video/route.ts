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

    console.log(`Proxying video segment from: ${url}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      // Check if this is a .jpg segment that should be treated as video
      const isJpgSegment = url.toLowerCase().endsWith(".jpg") || url.toLowerCase().includes(".jpg?")

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

      // Handle Range header for seeking support
      const rangeHeader = request.headers.get("Range")
      if (rangeHeader) {
        headers.set("Range", rangeHeader)
      }

      console.log(`Fetching video segment with headers:`, Object.fromEntries(headers.entries()))

      const response = await fetch(url, {
        signal: controller.signal,
        headers,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Failed to fetch video segment: ${response.status} ${response.statusText}`)
        return new NextResponse(`Failed to fetch video segment: ${response.status}`, {
          status: response.status,
        })
      }

      // Get the content type from the response or default to octet-stream
      let contentType = response.headers.get("content-type") || "application/octet-stream"

      // If this is a .jpg segment that should be treated as video, override the content type
      if (isJpgSegment) {
        contentType = "video/mp2t" // MPEG-2 Transport Stream content type for HLS segments
      }

      // Stream the response
      const data = await response.arrayBuffer()

      // Create response headers
      const responseHeaders = new Headers({
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      })

      // Forward Content-Range header if present (for seeking support)
      const contentRange = response.headers.get("Content-Range")
      if (contentRange) {
        responseHeaders.set("Content-Range", contentRange)
      }

      // Forward Content-Length header if present
      const contentLength = response.headers.get("Content-Length")
      if (contentLength) {
        responseHeaders.set("Content-Length", contentLength)
      }

      return new NextResponse(data, {
        headers: responseHeaders,
        status: rangeHeader ? response.status : 200, // Preserve 206 status for partial content
      })
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("Error proxying video segment:", error)

      if (error.name === "AbortError") {
        return new NextResponse("Video segment request timed out", { status: 504 })
      }

      return new NextResponse(`Error proxying video segment: ${error.message}`, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in proxy-video route:", error)
    return new NextResponse(`Server error: ${error.message}`, { status: 500 })
  }
}
