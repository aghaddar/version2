import { NextResponse } from "next/server"
import { MOCK_POPULAR_ANIME } from "@/lib/mock-data"

export async function GET() {
  try {
    console.log("API route: /api/anime/animepahe/recent-episodes called")

    // Create mock recent episodes by slicing the popular anime array
    const recentEpisodes = MOCK_POPULAR_ANIME.slice(0, 4).map((anime) => ({
      ...anime,
      episodeNumber: Math.floor(Math.random() * 12) + 1,
      episodeId: `${anime.id}-episode-${Math.floor(Math.random() * 12) + 1}`,
    }))

    console.log(`Returning ${recentEpisodes.length} recent episodes`)

    return NextResponse.json({
      currentPage: 1,
      hasNextPage: false,
      results: recentEpisodes,
    })
  } catch (error) {
    console.error("Error in animepahe recent-episodes API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
