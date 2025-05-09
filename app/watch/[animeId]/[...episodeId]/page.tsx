"use client"

import { useEffect, useState } from "react"
import { use } from "react"
import { useRouter } from "next/navigation"
// Update the getEpisodeSources import to include subtitle types
import { getAnimeInfo, getEpisodeSources, type AnimeResult, type AnimeSource } from "@/lib/api"
import VideoPlayer from "@/components/VideoPlayer"
import AnimeInfo from "@/components/AnimeInfo"
import EpisodePagination from "@/components/EpisodePagination"
import RelatedAnime from "@/components/RelatedAnime"
import { ArrowLeft } from "lucide-react"

interface WatchPageProps {
  params: Promise<{
    animeId: string
    episodeId: string[]
  }>
}

export default function WatchPage({ params }: WatchPageProps) {
  // Unwrap the params Promise
  const resolvedParams = use(params)

  // Get the animeId
  const animeId = resolvedParams.animeId

  // Get the episodeId from the catch-all parameter
  // In Next.js, catch-all parameters are provided as arrays
  const episodeIdParts = resolvedParams.episodeId

  // Join the parts to get the full episodeId
  const episodeId = episodeIdParts.join("/")
  console.log(`Constructed episodeId: ${episodeId}`)

  console.log(`Full episodeId: ${episodeId}`)

  const router = useRouter()
  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [sources, setSources] = useState<AnimeSource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!animeId || !episodeId) {
      setError("Invalid anime or episode ID")
      setLoading(false)
      return
    }

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        console.log(`Fetching data for anime: ${animeId}, episode: ${episodeId}`)

        // Fetch anime info
        const info = await getAnimeInfo(animeId)
        setAnimeInfo(info)

        // Find current episode number
        if (info?.episodes) {
          if (Array.isArray(info.episodes)) {
            const episode = info.episodes.find((ep) => ep.id === episodeId)
            if (episode) {
              setCurrentEpisodeNumber(episode.number)
            }
          }
        }

        // Fetch episode sources
        console.log(`Fetching sources for episode ID: ${episodeId}`)

        // Try direct fetch first for debugging
        try {
          // IMPORTANT: Properly encode the episodeId to handle slashes correctly
          const encodedEpisodeId = encodeURIComponent(episodeId)
          const directUrl = `/api/anime/animepahe/watch?episodeId=${encodedEpisodeId}`
          console.log(`Trying direct fetch from: ${directUrl}`)

          const directResponse = await fetch(directUrl, {
            cache: "no-store",
            headers: { Accept: "application/json" },
          })

          console.log(`Direct fetch status: ${directResponse.status}`)

          if (directResponse.ok) {
            const directData = await directResponse.json()
            console.log("Direct fetch data:", directData)

            if (directData && directData.sources && directData.sources.length > 0) {
              console.log(`Direct fetch successful with ${directData.sources.length} sources`)
              setSources(directData)
              setLoading(false)
              return
            } else {
              console.log("Direct fetch returned invalid data structure")
            }
          } else {
            console.log("Direct fetch failed")
          }
        } catch (directError) {
          console.error("Direct fetch error:", directError)
        }

        // Fall back to the regular function
        const episodeSources = await getEpisodeSources(episodeId)

        console.log("Episode sources response:", episodeSources)

        if (episodeSources && episodeSources.sources && episodeSources.sources.length > 0) {
          console.log(`Sources received: ${episodeSources.sources.length} sources`)
          console.log("First source:", episodeSources.sources[0])
          setSources(episodeSources)
        } else {
          console.error("No valid sources found in response:", episodeSources)

          // Provide fallback sources for testing
          const fallbackSources = {
            headers: { Referer: "https://kwik.cx/" },
            sources: [
              {
                url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
                isM3U8: true,
                quality: "720p",
                isDub: false,
              },
            ],
            subtitles: [
              {
                url: "https://cc.2cdns.com/78/cb/78cb3469d6969cb0e35b5f7f6b9f6c6d/eng-2.vtt",
                lang: "en",
                label: "English",
              },
            ],
          }

          console.log("Using fallback sources:", fallbackSources)
          setSources(fallbackSources)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load video. Please try again later.")

        // Still provide fallback sources even on error
        const fallbackSources = {
          headers: { Referer: "https://kwik.cx/" },
          sources: [
            {
              url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
              isM3U8: true,
              quality: "720p",
              isDub: false,
            },
          ],
          subtitles: [
            {
              url: "https://cc.2cdns.com/78/cb/78cb3469d6969cb0e35b5f7f6b9f6c6d/eng-2.vtt",
              lang: "en",
              label: "English",
            },
          ],
        }
        setSources(fallbackSources)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [animeId, episodeId])

  // Find next and previous episodes
  let prevEpisode = null
  let nextEpisode = null

  if (animeInfo?.episodes && Array.isArray(animeInfo.episodes)) {
    const currentIndex = animeInfo.episodes.findIndex((ep) => ep.id === episodeId)

    if (currentIndex > 0) {
      prevEpisode = animeInfo.episodes[currentIndex - 1]
    }

    if (currentIndex >= 0 && currentIndex < animeInfo.episodes.length - 1) {
      nextEpisode = animeInfo.episodes[currentIndex + 1]
    }
  }

  // Helper function to navigate to episodes that might contain slashes
  const navigateToEpisode = (epId: string) => {
    console.log(`Navigating to episode: ${epId}`)
    // No need to split and rejoin - just use the epId directly
    router.push(`/watch/${animeId}/${epId}`)
  }

  return (
    <div className="bg-black min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <button
          onClick={() => router.push(`/anime/${animeId}`)}
          className="flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to anime
        </button>

        <div className="grid grid-cols-1 gap-6">
          {/* Main content - Video and Info */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <VideoPlayer
              videoSources={sources?.sources}
              subtitles={sources?.subtitles}
              poster={animeInfo?.image}
              loading={loading}
              error={error}
            />

            {/* Anime Info with Action Buttons */}
            <AnimeInfo
              id={animeId}
              title={animeInfo?.title || ""}
              episodeNumber={currentEpisodeNumber}
              description={animeInfo?.description || ""}
              type={animeInfo?.type}
              status={animeInfo?.status}
              releaseDate={animeInfo?.releaseDate?.toString()}
              totalEpisodes={animeInfo?.totalEpisodes}
              prevEpisode={prevEpisode}
              nextEpisode={nextEpisode}
              animeId={animeId}
              image={animeInfo?.image}
            />

            {/* Episodes */}
            <div className="mt-8 bg-gray-900 p-4 rounded-lg">
              <h2 className="text-lg font-bold mb-4">All Episodes</h2>
              {animeInfo?.episodes && Array.isArray(animeInfo.episodes) && (
                <EpisodePagination
                  episodes={animeInfo.episodes}
                  currentEpisodeId={episodeId}
                  onEpisodeClick={navigateToEpisode}
                />
              )}
            </div>
          </div>

          {/* Sidebar - Related Anime - Only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-1">
            <RelatedAnime animeList={animeInfo?.recommendations || []} />
          </div>

          {/* Related Anime for mobile - Visible only on smaller screens */}
          <div className="lg:hidden">
            <RelatedAnime animeList={animeInfo?.recommendations || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
