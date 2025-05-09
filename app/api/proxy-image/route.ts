import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  const title = request.nextUrl.searchParams.get("title") || "anime"

  if (!url) {
    console.error("Missing URL parameter in proxy-image request")
    return new NextResponse("Missing URL parameter", { status: 400 })
  }

  console.log(`Proxying image from: ${url}`)

  try {
    // Determine the domain to set as the referer
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    const referer = `https://${domain}/`

    const response = await fetch(url, {
      headers: {
        // Add common headers that might help with CORS issues
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: referer,
        Origin: referer,
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      cache: "no-store", // Don't use cache for this request
    })

    if (!response.ok) {
      console.error(`Error fetching image: ${response.status} ${response.statusText} for ${url}`)
      // Return a fallback image instead of an error
      return NextResponse.redirect(
        new URL(`/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`, request.url),
      )
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()

    if (imageBuffer.byteLength === 0) {
      console.error(`Empty image response for ${url}`)
      // Return a fallback image instead of an error
      return NextResponse.redirect(
        new URL(`/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`, request.url),
      )
    }

    console.log(`Successfully proxied image from ${url} (${imageBuffer.byteLength} bytes)`)

    // Get the content type from the original response
    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Return the image with the appropriate content type
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Error proxying image:", error)
    // Return a fallback image instead of an error
    return NextResponse.redirect(
      new URL(`/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`, request.url),
    )
  }
}
