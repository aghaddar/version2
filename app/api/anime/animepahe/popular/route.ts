import { NextResponse } from "next/server"
import { MOCK_POPULAR_ANIME } from "@/lib/mock-data"

export async function GET() {
  try {
    console.log("API route: /api/anime/animepahe/popular called")

    // For a real implementation, you would fetch from an external API here
    // const response = await fetch("https://api.consumet.org/anime/animepahe/popular")
    // const data = await response.json()

    // For now, we'll use our mock data
    const results = MOCK_POPULAR_ANIME

    console.log(`Returning ${results.length} anime results`)

    // Return in the format expected by the frontend
    return NextResponse.json({
      currentPage: 1,
      hasNextPage: false,
      results: results,
    })
  } catch (error) {
    console.error("Error in animepahe popular API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
