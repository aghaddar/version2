"use client"

import AnimeCard from "./AnimeCard"
import type { AnimeResult } from "@/lib/types"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRef } from "react"

interface RelatedAnimeProps {
  animeList: AnimeResult[]
}

const RelatedAnime = ({ animeList }: RelatedAnimeProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!animeList.length) return null

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = current.clientWidth * 0.75

      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Related Shows</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div ref={scrollContainerRef} className="flex overflow-x-auto scrollbar-hide space-x-3 sm:space-x-4 pb-4">
        {animeList.map((anime) => (
          <div key={anime.id} className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px]">
            <AnimeCard
              id={anime.id}
              title={anime.title}
              image={anime.image}
              type={anime.type}
              releaseDate={anime.releaseDate}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RelatedAnime
