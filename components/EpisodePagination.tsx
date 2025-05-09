"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Episode } from "@/lib/api"

interface EpisodePaginationProps {
  episodes: Episode[]
  currentEpisodeId: string
  onEpisodeClick: (episodeId: string) => void
  episodesPerPage?: number
}

const EpisodePagination = ({
  episodes,
  currentEpisodeId,
  onEpisodeClick,
  episodesPerPage = 100,
}: EpisodePaginationProps) => {
  const [currentPage, setCurrentPage] = useState(0)

  // Calculate total pages
  const totalPages = Math.ceil(episodes.length / episodesPerPage)

  // Get current page episodes
  const currentEpisodes = episodes.slice(currentPage * episodesPerPage, (currentPage + 1) * episodesPerPage)

  // Navigate to previous page
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Navigate to next page
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Handle episode click with proper navigation
  const handleEpisodeClick = (episodeId: string) => {
    console.log(`Clicked on episode: ${episodeId}`)
    onEpisodeClick(episodeId)
  }

  return (
    <div>
      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 0}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage === 0 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            <ChevronLeft size={16} className="mr-1" />
            Previous
          </button>

          <span className="text-sm text-gray-400">
            Page {currentPage + 1} of {totalPages}
            {totalPages > 1 &&
              ` (Episodes ${currentPage * episodesPerPage + 1}-${Math.min((currentPage + 1) * episodesPerPage, episodes.length)})`}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages - 1}
            className={`flex items-center px-3 py-1 rounded-md ${
              currentPage >= totalPages - 1 ? "text-gray-500 cursor-not-allowed" : "text-gray-300 hover:bg-gray-800"
            }`}
          >
            Next
            <ChevronRight size={16} className="ml-1" />
          </button>
        </div>
      )}

      {/* Episode grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {currentEpisodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => handleEpisodeClick(episode.id)}
            className={`p-2 text-xs rounded-md text-center ${
              episode.id === currentEpisodeId ? "bg-purple-600" : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {episode.number}
          </button>
        ))}
      </div>
    </div>
  )
}

export default EpisodePagination
