import { NextResponse } from "next/server"
import { MOCK_POPULAR_ANIME } from "@/lib/mock-data"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log(`API route: /api/anime/animepahe/info/${id} called`)

    // Find the anime in our mock data
    const mockAnime = MOCK_POPULAR_ANIME.find((anime) => anime.id === id)

    if (!mockAnime) {
      return NextResponse.json({ error: "Anime not found" }, { status: 404 })
    }

    // Return the anime with additional mock data
    return NextResponse.json({
      id: mockAnime.id,
      title: mockAnime.title,
      image: mockAnime.image,
      releaseDate: mockAnime.releaseDate,
      type: mockAnime.type,
      description: "This is a mock description for the anime. The API is running locally.",
      status: "Ongoing",
      totalEpisodes: 24,
      genres: ["Action", "Adventure", "Fantasy"],
      episodes: Array.from({ length: 12 }, (_, i) => ({
        id: `${id}-episode-${i + 1}`,
        number: i + 1,
        title: `Episode ${i + 1}`,
      })),
      recommendations: MOCK_POPULAR_ANIME.filter((anime) => anime.id !== id).slice(0, 5),
    })
  } catch (error) {
    console.error("Error in animepahe info API:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
