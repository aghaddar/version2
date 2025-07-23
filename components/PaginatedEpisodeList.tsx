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
  const [search, setSearch] = useState("")

  // Filter episodes by search
  const filteredEpisodes = episodes.filter((ep) => {
    const searchLower = search.toLowerCase()
    return (
      ep.number.toString().includes(searchLower) ||
      (ep.title && ep.title.toLowerCase().includes(searchLower))
    )
  })

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(0)
  }, [search])

  const totalPages = Math.ceil(filteredEpisodes.length / episodesPerPage)

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
  const currentEpisodes = filteredEpisodes.slice(currentPage * episodesPerPage, (currentPage + 1) * episodesPerPage)

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search episode number or title..."
          className="w-full max-w-xs px-3 py-2 rounded-full bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-medium">
          <span className="text-xs sm:text-base">Episodes {currentPage * episodesPerPage + 1} - {Math.min((currentPage + 1) * episodesPerPage, episodes.length)}{episodes.length > 0 ? ` (of ${episodes.length})` : ""}</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            aria-label="Previous page"
            className="rounded-full transition-colors hover:bg-purple-600 active:bg-purple-600 active:opacity-70 text-xs sm:text-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs sm:text-sm">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next page"
            className="rounded-full transition-colors hover:bg-purple-600 active:bg-purple-600 active:opacity-70 text-xs sm:text-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {currentEpisodes.map((episode) => (
          <Link
            key={episode.id}
            href={getEpisodeUrl(episode)}
            className={cn(
              "flex items-center justify-center aspect-square w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium transition-colors",
              currentEpisodeId === episode.id.toString()
                ? "bg-purple-600 text-white"
                : "bg-gray-800 hover:bg-gray-700 text-gray-200",
            )}
          >
            {episode.number}
          </Link>
        ))}
      </div>
    </div>
  )
}
