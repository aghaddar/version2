"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Episode } from "@/lib/types"

interface PaginatedEpisodeListProps {
  episodes: Episode[]
  animeId: string
  currentEpisodeId?: string | number
  episodesPerPage?: number
}

export default function PaginatedEpisodeList({
  episodes,
  animeId,
  currentEpisodeId,
  episodesPerPage = 100,
}: PaginatedEpisodeListProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Calculate which page contains the current episode
  useEffect(() => {
    if (currentEpisodeId && episodes.length > 0) {
      const currentEpisodeIndex = episodes.findIndex((ep) => ep.id.toString() === currentEpisodeId.toString())
      if (currentEpisodeIndex !== -1) {
        const page = Math.floor(currentEpisodeIndex / episodesPerPage)
        setCurrentPage(page)
      }
    }
  }, [currentEpisodeId, episodes, episodesPerPage])

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Helper function to create the correct URL for episodes that might contain slashes
  const getEpisodeUrl = (episode: Episode) => {
    // Split the episodeId by slashes to create the correct route
    const parts = episode.id.toString().split("/")
    return `/watch/${animeId}/${parts.join("/")}`
  }

  // Get current page episodes
  const currentEpisodes = episodes.slice(currentPage * episodesPerPage, (currentPage + 1) * episodesPerPage)

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          Episodes {currentPage * episodesPerPage + 1} -{" "}
          {Math.min((currentPage + 1) * episodesPerPage, episodes.length)}
          {episodes.length > 0 ? ` (of ${episodes.length})` : ""}
        </h3>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {currentEpisodes.map((episode) => (
          <Link
            key={episode.id}
            href={getEpisodeUrl(episode)}
            className={cn(
              "block text-center py-2 px-3 rounded-md transition-colors",
              currentEpisodeId === episode.id.toString()
                ? "bg-purple-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-200",
            )}
          >
            Episode {episode.number}
          </Link>
        ))}
      </div>
    </div>
  )
}
