"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AnimeResult } from "@/lib/types"
import WatchlistButton from "@/components/WatchlistButton"
import PaginatedEpisodeList from "./PaginatedEpisodeList"

interface AnimePageClientProps {
  animeInfo: AnimeResult | null
  relatedAnime: AnimeResult[]
}

export default function AnimePageClient({ animeInfo, relatedAnime }: AnimePageClientProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [imageError, setImageError] = useState(false)

  if (!animeInfo) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Anime Not Found</h1>
        <p className="text-gray-400 mb-6">The anime you're looking for doesn't exist or has been removed.</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    )
  }

  // Function to get the appropriate image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl || imageUrl === "undefined" || imageUrl === "null" || imageError) {
      return `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(animeInfo?.title || "anime")}`
    }

    // Check if the image URL is external (starts with http or https)
    if (imageUrl.startsWith("http")) {
      // Use the proxy for external images to avoid CORS issues
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
    }

    // For local images (from public directory)
    return imageUrl
  }

  // Extract the first episode for the "Watch Now" button
  const firstEpisode = Array.isArray(animeInfo.episodes) && animeInfo.episodes.length > 0 ? animeInfo.episodes[0] : null

  // Create the watch URL for the first episode
  const watchUrl = firstEpisode ? `/watch/${animeInfo.id}/${firstEpisode.id}` : "#"

  return (
    <div className="bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Anime Title */}
        <h1 className="text-4xl font-bold mb-8">{animeInfo.title}</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Anime Image */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg">
              <Image
                src={getImageUrl(animeInfo.image) || "/placeholder.svg"}
                alt={animeInfo.title}
                fill
                className="object-cover"
                priority
                onError={() => setImageError(true)}
                unoptimized={animeInfo.image?.startsWith("http")}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Link href={watchUrl} className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Play className="mr-2 h-4 w-4" />
                  Watch Now
                </Button>
              </Link>

              <WatchlistButton
                animeId={animeInfo.id}
                title={animeInfo.title || "Unknown Anime"}
                imageUrl={animeInfo.image}
                className="w-full"
              />

              <Button className="w-full" variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Anime Details */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="border-b border-gray-800 mb-6">
              <div className="flex space-x-8">
                <button
                  className={`pb-4 px-1 ${
                    activeTab === "overview"
                      ? "text-white border-b-2 border-purple-600 font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
                <button
                  className={`pb-4 px-1 ${
                    activeTab === "episodes"
                      ? "text-white border-b-2 border-purple-600 font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("episodes")}
                >
                  Episodes
                </button>
                <button
                  className={`pb-4 px-1 ${
                    activeTab === "related"
                      ? "text-white border-b-2 border-purple-600 font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                  onClick={() => setActiveTab("related")}
                >
                  Related
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div>
                <div className="bg-gray-900 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-semibold mb-4">Synopsis</h2>
                  <p className="text-gray-300 whitespace-pre-line">
                    {animeInfo.description || "No description available."}
                  </p>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {animeInfo.type && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Type</h3>
                      <p>{animeInfo.type}</p>
                    </div>
                  )}

                  {animeInfo.status && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Status</h3>
                      <p>{animeInfo.status}</p>
                    </div>
                  )}

                  {animeInfo.releaseDate && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Released</h3>
                      <p>{animeInfo.releaseDate}</p>
                    </div>
                  )}

                  {animeInfo.totalEpisodes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Episodes</h3>
                      <p>{animeInfo.totalEpisodes}</p>
                    </div>
                  )}

                  {animeInfo.genres && animeInfo.genres.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-400 mb-1">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {animeInfo.genres.map((genre) => (
                          <span key={genre} className="px-3 py-1 bg-gray-800 rounded-full text-sm">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "episodes" && (
              <div>
                {Array.isArray(animeInfo?.episodes) && animeInfo.episodes.length > 0 && (
                  <div className="mt-6">
                    <PaginatedEpisodeList episodes={animeInfo.episodes} animeId={animeInfo.id.toString()} />
                  </div>
                )}
                {/* {Array.isArray(animeInfo.episodes) && animeInfo.episodes.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {animeInfo.episodes.map((episode) => (
                      <Link
                        key={episode.id}
                        href={`/watch/${animeInfo.id}/${episode.id}`}
                        className="bg-gray-800 hover:bg-gray-700 rounded-md p-3 transition-colors"
                      >
                        <div className="text-center">
                          <span className="block font-medium">Episode {episode.number}</span>
                          {episode.title && <span className="text-sm text-gray-400">{episode.title}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No episodes available.</p>
                )} */}
              </div>
            )}

            {activeTab === "related" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {relatedAnime.map((anime) => (
                  <Link key={anime.id} href={`/anime/${anime.id}`} className="group">
                    <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                      <Image
                        src={getImageUrl(anime.image) || "/placeholder.svg"}
                        alt={anime.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImageError(true)}
                        unoptimized={anime.image?.startsWith("http")}
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {anime.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
