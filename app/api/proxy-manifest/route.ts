import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get("url")
    const referer = searchParams.get("referer") || "https://kwik.cx/"

    if (!url) {
      return new NextResponse("URL parameter is required", { status: 400 })
    }

    console.log(`Proxy manifest request received for URL: ${url}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // Increased to 60 seconds

    try {
      // Check if this is a padorupado.ru URL
      const isPadorupado = url.includes("padorupado.ru")

      // Create appropriate headers based on the domain
      const headers = new Headers()

      if (isPadorupado) {
        // For padorupado.ru, use their own origin as referer and origin
        const urlObj = new URL(url)
        headers.set("Origin", urlObj.origin)
        headers.set("Referer", urlObj.origin + "/")
        headers.set(
          "User-Agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )
        headers.set("Accept", "*/*")
        headers.set("Accept-Language", "en-US,en;q=0.9")
        headers.set("Sec-Fetch-Dest", "empty")
        headers.set("Sec-Fetch-Mode", "cors")
        headers.set("Sec-Fetch-Site", "same-origin")
      } else {
        // For other domains, use standard headers
        headers.set(
          "User-Agent",
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        )
        headers.set("Accept", "*/*")
        headers.set("Accept-Language", "en-US,en;q=0.9")
        headers.set("Origin", "https://kwik.cx")
        headers.set("Referer", referer)
      }

      console.log(`Fetching from: ${url} with headers:`, Object.fromEntries(headers.entries()))

      // Fetch the manifest
      const response = await fetch(url, {
        signal: controller.signal,
        headers,
        cache: "no-store",
        next: { revalidate: 0 },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Failed to fetch manifest: ${response.status} ${response.statusText}`)
        return new NextResponse(`Failed to fetch manifest: ${response.status}`, { status: response.status })
      }

      console.log(`Response status: ${response.status}, headers:`, Object.fromEntries(response.headers.entries()))

      // Get the manifest text
      const manifestText = await response.text()

      // Check if this is a valid HLS manifest
      if (!manifestText.trim().startsWith("#EXTM3U")) {
        console.error("Invalid HLS manifest received:", manifestText.substring(0, 100))
        return new NextResponse("Invalid HLS manifest received", { status: 500 })
      }

      // Import the HLS utils
      const { modifyHlsManifest, resolveSegmentUrls } = await import("@/lib/hls-utils")

      // Modify the manifest to use our proxy for key URLs and resolve segment URLs
      const baseUrl = url // Use the full URL as the base URL, not just the origin
      const modifiedManifest = modifyHlsManifest(manifestText, baseUrl)

      // For master playlists, we need to handle the variant streams
      if (modifiedManifest.includes("#EXT-X-STREAM-INF")) {
        // This is a master playlist, we need to proxy the variant streams too
        const finalManifest = modifiedManifest.replace(/^(?!#)(.+\.m3u8)$/gm, (match) => {
          const variantUrl = new URL(match, url).href
          return `/api/proxy-manifest?url=${encodeURIComponent(variantUrl)}&referer=${encodeURIComponent(referer)}`
        })

        return new NextResponse(finalManifest, {
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
          },
        })
      } else {
        // This is a media playlist, we need to resolve the segment URLs
        const finalManifest = resolveSegmentUrls(modifiedManifest, url)

        return new NextResponse(finalManifest, {
          headers: {
            "Content-Type": "application/vnd.apple.mpegurl",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache",
          },
        })
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error("Error proxying manifest:", error)

      if (error.name === "AbortError") {
        return new NextResponse("Manifest request timed out", { status: 504 })
      }

      return new NextResponse(`Error proxying manifest: ${error.message}`, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in proxy-manifest route:", error)
    return new NextResponse(`Server error: ${error.message}`, { status: 500 })
  }
}
