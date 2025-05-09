"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import AnimeCard from "./AnimeCard"

interface Anime {
  id: string
  title: string
  image: string
  type?: string
  releaseDate?: string
}

interface AnimeListProps {
  title: string
  animeList: Anime[]
  viewAllLink?: string
}

const AnimeList = ({ title, animeList, viewAllLink }: AnimeListProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  if (!animeList || animeList.length === 0) {
    return (
      <div className="py-8">
        <div className="flex justify-between items-center mb-4 px-6">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <div className="px-6">
          <div className="bg-gray-900 rounded-lg p-8 text-center">
            <p className="text-gray-400">No content available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4 px-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="flex items-center">
          <div className="hidden sm:flex space-x-2 mr-4">
            <button
              onClick={() => scroll("left")}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
              aria-label="Scroll left"
              suppressHydrationWarning
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-1 rounded-full bg-gray-800 hover:bg-gray-700"
              aria-label="Scroll right"
              suppressHydrationWarning
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm text-purple-500 hover:text-purple-400">
              See all
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6 space-x-3 sm:space-x-4 pb-4"
      >
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

export default AnimeList
