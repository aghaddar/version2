"use client"
import { Share2, Download, Clock, Calendar, Star, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Episode } from "@/lib/api"
import WatchlistButton from "./WatchlistButton"

interface AnimeInfoProps {
  id: string
  title: string
  episodeNumber: number | null
  description: string
  type?: string
  status?: string
  releaseDate?: string
  totalEpisodes?: number
  prevEpisode: Episode | null
  nextEpisode: Episode | null
  animeId: string
  image?: string
}

const AnimeInfo = ({
  id,
  title,
  episodeNumber,
  description,
  type,
  status,
  releaseDate,
  totalEpisodes,
  prevEpisode,
  nextEpisode,
  animeId,
  image,
}: AnimeInfoProps) => {
  const shareAnime = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${title} - Episode ${episodeNumber}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Error sharing:", err))
    } else {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => alert("Link copied to clipboard!"))
        .catch((err) => console.error("Error copying link:", err))
    }
  }

  // Helper function to create the correct URL for episodes that might contain slashes
  const getEpisodeUrl = (episode: Episode | null) => {
    if (!episode) return "#"

    // Split the episodeId by slashes to create the correct route
    const parts = episode.id.toString().split("/")
    return `/watch/${animeId}/${parts.join("/")}`
  }

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-2">
        {title}
        {episodeNumber && ` - Episode ${episodeNumber}`}
      </h1>

      {/* Metadata */}
      <div className="flex flex-wrap items-center text-sm text-gray-300 mb-4 gap-y-2">
        {type && (
          <div className="flex items-center mr-4">
            <Info className="w-4 h-4 mr-1" />
            <span>{type}</span>
          </div>
        )}

        {releaseDate && (
          <div className="flex items-center mr-4">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{releaseDate}</span>
          </div>
        )}

        {status && (
          <div className="flex items-center mr-4">
            <Clock className="w-4 h-4 mr-1" />
            <span>{status}</span>
          </div>
        )}

        {totalEpisodes && (
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1" />
            <span>{totalEpisodes} Episodes</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-300 mb-6">{description}</p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mt-4">
        {/* Episode Navigation */}
        <div className="flex gap-2 sm:gap-3 mr-auto">
          <Link
            href={getEpisodeUrl(prevEpisode)}
            className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
              prevEpisode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-800 opacity-50 cursor-not-allowed"
            }`}
            aria-disabled={!prevEpisode}
            onClick={(e) => !prevEpisode && e.preventDefault()}
          >
            Previous
          </Link>

          <Link
            href={getEpisodeUrl(nextEpisode)}
            className={`px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm ${
              nextEpisode ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-800 opacity-50 cursor-not-allowed"
            }`}
            aria-disabled={!nextEpisode}
            onClick={(e) => !nextEpisode && e.preventDefault()}
          >
            Next
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Replace the old watchlist button with the new WatchlistButton component */}
          <WatchlistButton
            animeId={animeId}
            title={title}
            imageUrl={image}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          />

          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2"
            onClick={shareAnime}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:text-white text-xs sm:text-sm h-auto py-2"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AnimeInfo
