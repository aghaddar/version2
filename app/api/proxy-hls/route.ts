import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Make sure this route is not cached

// Use the new external CORS proxy
const CORS_PROXY_URL = "https://hls.ciphertv.dev/proxy?url="

// Function to rewrite all URLs in M3U8 files to go through our proxy
function rewriteM3U8(content: string, originalUrl: string): string {
  // Get the base URL from the original URL
  const baseUrl = getBaseUrl(originalUrl)

  // Replace relative URLs with absolute URLs that go through our proxy
  return content
    .replace(/^(?!#)(?!https?:\/\/)([^/].+\.m3u8|[^/].+\.ts)$/gm, (match) => {
      // Convert relative URL to absolute
      const absoluteUrl = `${baseUrl}/${match}`
      // Then wrap it with the CORS proxy
      return `${CORS_PROXY_URL}${encodeURIComponent(absoluteUrl)}`
    })
    .replace(
      // Also replace absolute URLs that don't already use our proxy
      /^(https?:\/\/.+\.m3u8|https?:\/\/.+\.ts)$/gm,
      (match) => {
        if (!match.includes(CORS_PROXY_URL)) {
          return `${CORS_PROXY_URL}${encodeURIComponent(match)}`
        }
        return match
      },
    )
}

// Function to get the base URL from a full URL
function getBaseUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    // Get everything up to the last slash in the path
    const pathParts = parsedUrl.pathname.split("/")
    pathParts.pop() // Remove the filename
    return `${parsedUrl.protocol}//${parsedUrl.host}${pathParts.join("/")}`
  } catch (e) {
    console.error("Failed to parse URL:", e)
    return url.substring(0, url.lastIndexOf("/"))
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 })
  }

  try {
    console.log(`Proxying HLS stream: ${url}`)

    // Use the external CORS proxy for the initial request
    const proxyUrl = url.includes(CORS_PROXY_URL) ? url : `${CORS_PROXY_URL}${encodeURIComponent(url)}`

    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: "https://zoro.to/",
        Origin: "https://zoro.to",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Stream returned status ${response.status}: ${response.statusText}` },
        { status: response.status },
      )
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "application/vnd.apple.mpegurl"

    // Get the response as text
    const text = await response.text()

    // If this is an M3U8 file, rewrite the URLs
    let processedText = text
    if (contentType.includes("mpegurl") || url.endsWith(".m3u8")) {
      processedText = rewriteM3U8(text, url)
      console.log("Rewrote M3U8 URLs to use CORS proxy")
    }

    // Create a new response with the processed text and add CORS headers
    const newResponse = new NextResponse(processedText, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })

    return newResponse
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Failed to fetch stream" }, { status: 500 })
  }
}
