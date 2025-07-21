// Update the watch route to properly handle query parameters with slashes
import { NextResponse } from "next/server"

// Replace the entire function with this updated version that doesn't split the episodeId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const episodeId = searchParams.get("episodeId")

    console.log(`API route: /api/anime/zoro/watch called with episodeId: ${episodeId}`)

    if (!episodeId) {
      console.error("Missing episodeId parameter")
      return NextResponse.json({ error: "Episode ID is required" }, { status: 400 })
    }

    // For debugging purposes, log the full URL and parameters
    console.log(`Full request URL: ${request.url}`)
    console.log(`Search params: ${JSON.stringify(Object.fromEntries(searchParams.entries()))}`)

    // Don't split the episodeId - use it as is for the API request
    console.log(`Using full episodeId for API request: ${episodeId}`)

    // Forward the request to the actual Consumet API
    try {
      // Use the Zoro endpoint instead of animepahe
      const consumetApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-consumet-nu.vercel.app/anime/zoro"
      const apiUrl = `${consumetApiUrl}/watch?episodeId=${encodeURIComponent(episodeId)}`

      console.log(`Forwarding request to Consumet API: ${apiUrl}`)

      const apiResponse = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      })

      if (apiResponse.ok) {
        const apiData = await apiResponse.json()
        console.log(`Received response from Consumet API with ${apiData.sources?.length || 0} sources`)

        // Proxy all HLS URLs in the sources
        if (apiData.sources && Array.isArray(apiData.sources)) {
          apiData.sources = apiData.sources.map((source: any) => {
            if (source.url && source.url.includes(".m3u8")) {
              return {
                ...source,
                url: `https://hls.shrina.dev/proxy/${encodeURIComponent(source.url)}`,
              }
            }
            return source
          })
        }

        // Return the actual API response with proxied sources
        return NextResponse.json(apiData, {
          headers: {
            "Cache-Control": "no-store, max-age=0",
            "Content-Type": "application/json",
          },
        })
      } else {
        console.error(`Consumet API error: ${apiResponse.status} ${apiResponse.statusText}`)
        console.log("Falling back to mock sources")
      }
    } catch (apiError) {
      console.error("Error forwarding to Consumet API:", apiError)
      console.log("Falling back to mock sources")
    }

    // Return mock video sources with a consistent structure
    const response = {
      headers: {
        Referer: "https://zoro.to/",
      },
      sources: [
        {
          url:
            "https://hls.shrina.dev/proxy/" + encodeURIComponent("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"), // Public test HLS stream
          isM3U8: true,
          quality: "720p",
          isDub: false,
        },
        {
          url:
            "https://hls.shrina.dev/proxy/" + encodeURIComponent("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"),
          isM3U8: true,
          quality: "480p",
          isDub: false,
        },
        {
          url:
            "https://hls.shrina.dev/proxy/" + encodeURIComponent("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"),
          isM3U8: true,
          quality: "360p",
          isDub: false,
        },
        {
          url:
            "https://hls.shrina.dev/proxy/" + encodeURIComponent("https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"),
          isM3U8: true,
          quality: "720p [English Dub]",
          isDub: true,
        },
      ],
      download: `https://example.com/download/${episodeId}`,
    }

    console.log(`Returning mock sources for episode: ${episodeId}`, {
      sourceCount: response.sources.length,
      firstSource: response.sources[0],
    })

    // Set appropriate headers to prevent caching issues
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error in animepahe watch API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
