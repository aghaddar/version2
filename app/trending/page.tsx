import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getPopularAnime } from "@/lib/api"
import AnimeCard from "@/components/AnimeCard"

export default async function TrendingPage() {
  // For demo purposes, we'll use the popular anime data and randomize it
  // In a real app, you would have a separate API endpoint for trending anime
  const popularAnime = await getPopularAnime()

  // Randomize the order to simulate different trending data
  const trendingAnime = [...popularAnime].sort(() => Math.random() - 0.5)

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-gray-400 hover:text-white mr-4">
            <ArrowLeft size={20} className="mr-2" />
            Back
          </Link>
          <h1 className="text-3xl font-bold">Trending Anime</h1>
        </div>

        <Suspense fallback={<div className="h-60 flex items-center justify-center">Loading trending anime...</div>}>
          {trendingAnime.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
              {trendingAnime.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  image={anime.image}
                  type={anime.type}
                  releaseDate={anime.releaseDate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-400 mb-4">No trending anime found</p>
              <p className="text-sm text-gray-500">Try again later or check your connection</p>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
