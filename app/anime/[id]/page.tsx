"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getAnimeInfo, getRelatedAnime, type AnimeResult } from "@/lib/api"
import AnimePageClient from "@/components/AnimePageClient"

interface AnimePageProps {
  params: Promise<{ id: string }>
}

export default function AnimePage({ params }: AnimePageProps) {
  // Unwrap the params Promise
  const resolvedParams = use(params)
  const { id } = resolvedParams

  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [relatedAnime, setRelatedAnime] = useState<AnimeResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      try {
        console.log(`Fetching anime info for: ${id}`)
        const info = await getAnimeInfo(id)
        console.log("Received anime info:", info)

        if (info) {
          // Ensure image URL is properly formatted
          const formattedInfo = {
            ...info,
            image: info.image || `/placeholder.svg?height=500&width=1000&query=${encodeURIComponent(info.title || id)}`,
          }
          setAnimeInfo(formattedInfo)
        } else {
          setAnimeInfo(null)
        }

        // Get related anime
        const related = info?.recommendations || (await getRelatedAnime(info?.genres || []))
        setRelatedAnime(related)
      } catch (error) {
        console.error("Error fetching anime data:", error)
        setError("Failed to load anime data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="h-60 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link href="/">
          <Button>Return Home</Button>
        </Link>
      </div>
    )
  }

  return <AnimePageClient animeInfo={animeInfo} relatedAnime={relatedAnime} />
}
