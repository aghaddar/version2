import { Suspense } from "react"
import { searchAnime } from "@/lib/api"
import AnimeCard from "@/components/AnimeCard"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Await the searchParams Promise to get the actual object
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ""

  // Only search if there's a query
  const results = query ? await searchAnime(query) : []

  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold">{query ? `Search Results for "${query}"` : "Search Anime"}</h1>
        </div>

        <Suspense fallback={<div className="h-60 flex items-center justify-center">Searching...</div>}>
          {query ? (
            results.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                {results.map((anime) => (
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
              <div className="text-center py-16 bg-gray-900 rounded-lg">
                <p className="text-gray-400 mb-4">No results found for "{query}"</p>
                <p className="text-sm text-gray-500">Try a different search term or browse our popular anime</p>
                <div className="mt-6">
                  <Link href="/popular" className="text-purple-500 hover:text-purple-400 underline">
                    Browse Popular Anime
                  </Link>
                </div>
              </div>
            )
          ) : (
            <div className="text-center py-16 bg-gray-900 rounded-lg">
              <p className="text-gray-400 mb-4">Enter a search term to find anime</p>
              <p className="text-sm text-gray-500">Search by anime title, or browse our collections below</p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/popular" className="text-purple-500 hover:text-purple-400 underline">
                  Popular Anime
                </Link>
                <Link href="/trending" className="text-purple-500 hover:text-purple-400 underline">
                  Trending Anime
                </Link>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </div>
  )
}
