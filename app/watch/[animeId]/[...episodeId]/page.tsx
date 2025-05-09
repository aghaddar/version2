"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnimeInfo, getEpisodeSources, type AnimeResult } from "@/lib/api"
import VideoPlayerVidstack from "@/components/VideoPlayerVidstack"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2 } from "lucide-react"
import SocialShareMenu from "@/components/SocialShareMenu"
import EpisodePagination from "@/components/EpisodePagination"
import { useToast } from "@/hooks/use-toast"

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const animeId = params.animeId as string
  const episodeId = Array.isArray(params.episodeId) ? params.episodeId.join("/") : (params.episodeId as string)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("")
  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)

  // Custom stream URL as primary source
  const primaryStreamUrl =
    "https://cors-proxy-shrina.btmd4n.easypanel.host/proxy/https%3A%2F%2Fef.netmagcdn.com%3A2228%2Fhls-playback%2F2f219e7a538f6b41763b2d81888f622d7d999109e4aabe2bf5ebc28de54bf1dd958dfbf6e445f1c6c88acf7779775503c4b0719ce97cec2e5731318a6003ea8a022f782127e4287da2f3917712e14a3b19dd5fcf47922975af8fd214e5d48ce11d1ed7c8611c8abf5324e5c767234b0c542b5d0ad5860297029d86704a4c106d082f5eb8864f1701f63fb4746e94d8a4%2Fmaster.m3u8"

  useEffect(() => {
    async function loadEpisode() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch anime info to get episodes for pagination
        const info = await getAnimeInfo(animeId)
        setAnimeInfo(info)

        // Find current episode number
        if (info?.episodes && Array.isArray(info.episodes)) {
          const episode = info.episodes.find((ep) => ep.id === episodeId)
          if (episode) {
            setCurrentEpisodeNumber(episode.number)
          }
        }

        // Set the title regardless of source availability
        setTitle(`${info?.title || "Anime"} - Episode ${currentEpisodeNumber || ""}`)

        // Always set the primary stream URL first
        setVideoUrl(null) // We'll use the primary stream directly in the player

        // Try to fetch episode sources as a backup
        try {
          const episodeSources = await getEpisodeSources(episodeId)

          if (episodeSources && episodeSources.sources && episodeSources.sources.length > 0) {
            // Find the highest quality source as a backup
            const sources = episodeSources.sources.sort((a, b) => {
              const qualityA = Number.parseInt(a.quality.replace("p", "")) || 0
              const qualityB = Number.parseInt(b.quality.replace("p", "")) || 0
              return qualityB - qualityA
            })

            // Store the API source as a backup
            console.log("Found API source as backup:", sources[0].url)
          } else {
            console.log("No valid API sources found, using only primary stream")
          }
        } catch (sourceError) {
          console.log("Error fetching episode sources, using only primary stream:", sourceError)
        }
      } catch (err) {
        console.log("Error loading episode info, using only primary stream:", err)
        setError("Failed to load episode data. Using primary stream.")
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisode()
  }, [animeId, episodeId, currentEpisodeNumber])

  const handleBack = () => {
    router.push(`/anime/${animeId}`)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: title,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      toast({
        title: "Link copied to clipboard",
        description: "Share this link with your friends",
      })
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleVideoError = (error: Error) => {
    console.error("Video player error:", error)
    toast({
      variant: "destructive",
      title: "Playback Error",
      description: "There was an error playing this video. Using alternative stream.",
    })
  }

  // Ensure episodes is an array before passing to EpisodePagination
  const episodes = animeInfo?.episodes && Array.isArray(animeInfo.episodes) ? animeInfo.episodes : []

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center p-4">
              <p className="text-lg font-semibold mb-2">{error}</p>
              <Button onClick={handleBack}>Go Back</Button>
            </div>
          </div>
        ) : (
          <VideoPlayerVidstack
            src={videoUrl || undefined}
            fallbackStreamUrl={primaryStreamUrl}
            title={title}
            autoPlay={true}
            onError={handleVideoError}
            debug={true}
          />
        )}
      </div>

      <div className="mt-4">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      <div className="mt-6">
        <EpisodePagination
          episodes={episodes}
          currentEpisodeId={episodeId}
          onEpisodeClick={(epId) => router.push(`/watch/${animeId}/${epId}`)}
        />
      </div>

      <SocialShareMenu title={title} description={`Watch ${title} on Anime Stream`} image={animeInfo?.image} />
    </div>
  )
}
