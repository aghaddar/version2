"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getAnimeInfo, type AnimeResult } from "@/lib/api"
import VideoPlayerVidstack from "@/components/VideoPlayerVidstack"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EpisodePagination from "@/components/EpisodePagination"
import SocialShareMenu from "@/components/SocialShareMenu"

// Define types for the API response
interface VideoSource {
  url: string
  quality: string
  isM3U8: boolean
}

interface Subtitle {
  url: string
  lang: string
}

interface VideoData {
  sources: VideoSource[]
  subtitles: Subtitle[]
}

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const animeId = params.animeId as string
  const episodeId = Array.isArray(params.episodeId) ? params.episodeId.join("/") : (params.episodeId as string)

  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [subtitleUrl, setSubtitleUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("")
  const [animeInfo, setAnimeInfo] = useState<AnimeResult | null>(null)
  const [currentEpisodeNumber, setCurrentEpisodeNumber] = useState<number | null>(null)
  const [availableSources, setAvailableSources] = useState<VideoSource[]>([])

  // Use the external CORS proxy
  const CORS_PROXY_URL = "https://cors-proxy-shrina.btmd4n.easypanel.host/proxy?url="

  // Custom stream URL as fallback - now using the external CORS proxy
  const fallbackStreamUrl =
    CORS_PROXY_URL +
    encodeURIComponent(
      "https://ef.netmagcdn.com:2228/hls-playback/2f219e7a538f6b41763b2d81888f622d7d999109e4aabe2bf5ebc28de54bf1dd958dfbf6e445f1c6c88acf7779775503c4b0719ce97cec2e5731318a6003ea8a022f782127e4287da2f3917712e14a3b19dd5fcf47922975af8fd214e5d48ce11d1ed7c8611c8abf5324e5c767234b0c542b5d0ad5860297029d86704a4c106d082f5eb8864f1701f63fb4746e94d8a4/master.m3u8",
    )

  // Backend URL for API requests - use the same base URL as in lib/api.ts
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"

  // Function to proxy HLS URLs through the CORS proxy
  const proxyHlsUrl = (url: string): string => {
    if (!url) return url

    // If the URL is already using our proxy, don't double-proxy it
    if (url.includes(CORS_PROXY_URL)) {
      return url
    }

    // If it's an HLS stream, proxy it
    if (url.includes(".m3u8")) {
      return `${CORS_PROXY_URL}${encodeURIComponent(url)}`
    }

    return url
  }

  useEffect(() => {
    async function loadEpisode() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch anime info to get episodes for pagination
        const info = await getAnimeInfo(animeId)
        setAnimeInfo(info)

        // Find current episode number - Zoro might use a different episode ID format
        if (info?.episodes && Array.isArray(info.episodes)) {
          // Try to find the episode by exact ID first
          let episode = info.episodes.find((ep) => ep.id === episodeId)

          // If not found, try to extract the episode number from the ID
          if (!episode && episodeId) {
            const episodeNumberMatch = episodeId.match(/(\d+)(?!.*\d)/)
            if (episodeNumberMatch) {
              const episodeNumber = Number.parseInt(episodeNumberMatch[0], 10)
              episode = info.episodes.find((ep) => ep.number === episodeNumber)
            }
          }

          if (episode) {
            setCurrentEpisodeNumber(episode.number)
          }
        }

        // Set the title regardless of source availability
        setTitle(`${info?.title || "Anime"} - Episode ${currentEpisodeNumber || ""}`)

        // Set fallback stream immediately to ensure we have something to play
        setVideoUrl(fallbackStreamUrl)

        // Fetch video sources using our custom proxy API
        try {
          // Use the same base URL format as in lib/api.ts
          // For Zoro, we need to use the meta/anilist endpoint
          const targetUrl = `${API_BASE_URL}/meta/anilist/watch/${episodeId}?provider=zoro`
          console.log(`Fetching video sources from: ${targetUrl}`)

          // Use direct fetch since we're using localhost
          const response = await fetch(targetUrl)

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`)
          }

          const data = await response.json()

          if (data?.sources?.length > 0) {
            // Process sources and proxy all HLS URLs through the CORS proxy
            const processedSources = data.sources.map((source: VideoSource) => ({
              ...source,
              url: proxyHlsUrl(source.url),
            }))

            // Sort sources by quality (highest first)
            const sortedSources = [...processedSources].sort((a, b) => {
              const qualityA = Number.parseInt(a.quality.replace("p", "")) || 0
              const qualityB = Number.parseInt(b.quality.replace("p", "")) || 0
              return qualityB - qualityA
            })

            setAvailableSources(sortedSources)
            console.log(
              "Available sources:",
              sortedSources.map((s) => `${s.quality}: ${s.url.substring(0, 50)}...`),
            )

            // Use the highest quality source
            setVideoUrl(sortedSources[0].url)
            console.log(`Using source: ${sortedSources[0].url.substring(0, 50)}...`)
          } else {
            console.log("No sources found in API response, using fallback")
          }

          // Handle subtitles
          if (data?.subtitles?.length > 0) {
            console.log(`Found ${data.subtitles.length} subtitles`)
            const engSubtitle = data.subtitles.find((s: Subtitle) => s.lang.toLowerCase().includes("english"))
            if (engSubtitle) {
              console.log(`Using English subtitle: ${engSubtitle.url}`)
              setSubtitleUrl(engSubtitle.url)
            }
          }
        } catch (sourceError) {
          console.error("Error fetching episode sources:", sourceError)
          console.log("Continuing with fallback stream")
          // We're already using fallback stream, so just log the error
        }
      } catch (err) {
        console.log("Error loading episode info:", err)
        setError("Failed to load episode data.")
        setVideoUrl(fallbackStreamUrl)
      } finally {
        setIsLoading(false)
      }
    }

    loadEpisode()
  }, [animeId, episodeId, currentEpisodeNumber, API_BASE_URL, fallbackStreamUrl, CORS_PROXY_URL])

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
      description: "There was an error playing this video. Using fallback stream.",
    })
    setVideoUrl(fallbackStreamUrl)
  }

  const handleQualityChange = (quality: string) => {
    const source = availableSources.find((s) => s.quality === quality)
    if (source) {
      setVideoUrl(source.url) // URL is already proxied
      toast({
        title: "Quality Changed",
        description: `Switched to ${quality} quality`,
      })
    }
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
            subtitleUrl={subtitleUrl || undefined}
            fallbackStreamUrl={fallbackStreamUrl}
            title={title}
            autoPlay={true}
            onError={handleVideoError}
            debug={true}
          />
        )}
      </div>

      <div className="mt-4">
        <h1 className="text-xl font-bold">{title}</h1>

        {/* Quality selector */}
        {availableSources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm font-medium">Quality:</span>
            <div className="flex flex-wrap gap-2">
              {availableSources.map((source) => (
                <Button
                  key={`quality-${source.quality}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQualityChange(source.quality)}
                  className="text-xs"
                >
                  {source.quality}
                </Button>
              ))}
            </div>
          </div>
        )}
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
