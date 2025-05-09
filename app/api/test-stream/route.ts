import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "hls"
    const format = searchParams.get("format") || "redirect"
    const quality = searchParams.get("quality") || "720p"

    // Define test streams for different types
    const testStreams = {
      mp4: {
        "720p": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        "480p": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "360p": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
      hls: {
        "720p": "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        "480p":
          "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        "360p": "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      },
      dash: {
        "720p": "https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd",
        "480p": "https://dash.akamaized.net/dash264/TestCases/1a/netflix/exMPD_BIP_TC1.mpd",
        "360p": "https://dash.akamaized.net/envivio/EnvivioDash3/manifest.mpd",
      },
    }

    // Get the appropriate test stream URL
    const streamUrl =
      testStreams[type as keyof typeof testStreams]?.[quality as keyof (typeof testStreams)["mp4"]] ||
      testStreams.hls["720p"]

    console.log(`Test stream request: type=${type}, format=${format}, quality=${quality}, URL=${streamUrl}`)

    if (format === "redirect") {
      // Redirect to the test stream
      return NextResponse.redirect(streamUrl)
    } else if (format === "json") {
      // Return the URL as JSON
      return NextResponse.json({
        url: streamUrl,
        type: type,
        quality: quality,
      })
    } else if (format === "m3u8" && type === "hls") {
      // Return a simple HLS manifest that points to the test stream
      const manifest = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=1000000,RESOLUTION=1280x720
${streamUrl}
`
      return new NextResponse(manifest, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache",
        },
      })
    } else {
      // Default to redirect
      return NextResponse.redirect(streamUrl)
    }
  } catch (error: any) {
    console.error("Error in test-stream route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
