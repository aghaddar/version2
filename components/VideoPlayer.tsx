"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { getProxiedUrl, getTestStreams } from "@/lib/direct-links"
import { AlertCircle, RefreshCw, Play, Settings, Info } from "lucide-react"
import Hls from "hls.js"

interface VideoSource {
  url: string
  isM3U8: boolean
  quality: string
  isDub?: boolean
}

interface Subtitle {
  url: string
  lang: string
  label: string
}

interface VideoPlayerProps {
  videoSources?: VideoSource[]
  subtitles?: Subtitle[]
  poster?: string
  loading: boolean
  error: string | null
  customStreamUrl?: string // Add this prop to accept a custom stream URL
}

const VideoPlayer = ({
  videoSources,
  subtitles,
  poster,
  loading,
  error: initialError,
  customStreamUrl, // Accept the custom stream URL
}: VideoPlayerProps) => {
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null)
  const [isDubbed, setIsDubbed] = useState<boolean>(false)
  const [playerError, setPlayerError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [usingTestStream, setUsingTestStream] = useState(false)
  const [currentSource, setCurrentSource] = useState<string | null>(null)
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null)
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(null)
  const [sourcesInitialized, setSourcesInitialized] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [showDebugPanel, setShowDebugPanel] = useState(false)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [attemptCount, setAttemptCount] = useState(0)
  const [usingHls, setUsingHls] = useState(false)
  const [usingCustomStream, setUsingCustomStream] = useState(false)

  // Use a simple ref for the player element
  const playerRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  const sourceRef = useRef<VideoSource | null>(null)
  const allSourcesRef = useRef<VideoSource[]>([])
  const qualitiesRef = useRef<string[]>([])
  const subtitlesRef = useRef<Subtitle[]>([])
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debugLogRef = useRef<string[]>([])

  // Add to debug log
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toISOString().substr(11, 8)
    const logMessage = `[${timestamp}] ${message}`
    debugLogRef.current = [...debugLogRef.current.slice(-50), logMessage]
    console.log(logMessage)
  }

  // Parse quality from source quality string (e.g., "SCY · 720p BD" -> "720p")
  const parseQuality = (qualityString: string): string => {
    const match = qualityString.match(/(\d+)p/)
    return match ? match[0] : qualityString
  }

  // Get available qualities from sources
  const getAvailableQualities = (sources: VideoSource[]): string[] => {
    if (!sources || sources.length === 0) return []
    const qualities = sources.map((s) => parseQuality(s.quality))
    return [...new Set(qualities)]
  }

  // Initialize HLS.js
  const initHls = (videoUrl: string) => {
    if (!playerRef.current) return

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      addDebugLog("Using HLS.js for playback")
      setUsingHls(true)

      const hls = new Hls({
        xhrSetup: (xhr, url) => {
          // Log XHR requests for debugging
          addDebugLog(`HLS XHR request: ${url.substring(0, 100)}${url.length > 100 ? "..." : ""}`)

          // If the URL is already proxied or is a blob URL, don't proxy it again
          if (url.includes("cors-proxy") || url.startsWith("blob:")) {
            return
          }

          // Proxy the URL
          const proxiedUrl = getProxiedUrl(url, url.includes(".m3u8") ? "manifest" : "video")
          xhr.open("GET", proxiedUrl, true)
        },
        // Additional HLS.js configuration
        debug: false,
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      })

      // Handle HLS errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        addDebugLog(`HLS error: ${data.type} - ${data.details}`)
        console.error("HLS error:", data)

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              addDebugLog("Fatal network error encountered, trying to recover")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              addDebugLog("Fatal media error encountered, trying to recover")
              hls.recoverMediaError()
              break
            default:
              addDebugLog("Fatal error, cannot recover")
              hls.destroy()
              setPlayerError("Failed to play video. HLS playback error.")
              setErrorDetails(`HLS error: ${data.type} - ${data.details}`)
              break
          }
        }
      })

      // Attach HLS to video element
      hls.loadSource(videoUrl)
      hls.attachMedia(playerRef.current)

      // Store the HLS instance
      hlsRef.current = hls

      // Play when loaded
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        addDebugLog("HLS manifest parsed successfully")
        playerRef.current?.play().catch((e) => {
          addDebugLog(`Auto-play failed: ${e.message}`)
        })
      })
    } else if (playerRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      // For browsers that support HLS natively (Safari)
      addDebugLog("Using native HLS support")
      playerRef.current.src = videoUrl
      playerRef.current.addEventListener("loadedmetadata", () => {
        playerRef.current?.play().catch((e) => {
          addDebugLog(`Auto-play failed: ${e.message}`)
        })
      })
    } else {
      // Fallback for browsers without HLS support
      addDebugLog("No HLS support available, trying direct playback")
      playerRef.current.src = videoUrl
    }
  }

  // Use custom stream URL if provided - this runs on component mount
  useEffect(() => {
    if (customStreamUrl) {
      addDebugLog(`Using custom stream URL: ${customStreamUrl}`)
      setUsingCustomStream(true)
      setCurrentSource(customStreamUrl)
      setDebugInfo(`Using custom stream: ${customStreamUrl.substring(0, 50)}...`)

      // Initialize HLS for the custom stream
      initHls(customStreamUrl)
    }
  }, [customStreamUrl])

  // Initialize subtitles
  useEffect(() => {
    if (subtitles && subtitles.length > 0) {
      addDebugLog(`Initializing with ${subtitles.length} subtitles`)
      subtitlesRef.current = [...subtitles]

      // Find English subtitle or use the first one
      const englishSubtitle = subtitles.find(
        (sub) =>
          sub.lang.toLowerCase().includes("english") ||
          sub.label.toLowerCase().includes("english") ||
          sub.lang.toLowerCase() === "en",
      )

      if (englishSubtitle) {
        addDebugLog(`Found English subtitle: ${englishSubtitle.label}`)
        setSelectedSubtitle(englishSubtitle.lang)
        const proxiedSubUrl = getProxiedUrl(englishSubtitle.url, "subtitle")
        setCurrentSubtitle(proxiedSubUrl)
      } else {
        addDebugLog(`No English subtitle found, using first available: ${subtitles[0].label}`)
        setSelectedSubtitle(subtitles[0].lang)
        const proxiedSubUrl = getProxiedUrl(subtitles[0].url, "subtitle")
        setCurrentSubtitle(proxiedSubUrl)
      }
    }
  }, [subtitles])

  // Initialize player with sources
  const initializeWithSources = (sources: VideoSource[]) => {
    if (!sources || sources.length === 0) {
      addDebugLog("No sources available for initialization")
      return
    }

    // Skip initialization if we're using a custom stream
    if (usingCustomStream) {
      addDebugLog("Using custom stream, skipping source initialization")
      return
    }

    addDebugLog(`Initializing with ${sources.length} sources`)
    allSourcesRef.current = [...sources]

    // Log all sources for debugging
    sources.forEach((source, index) => {
      addDebugLog(
        `Source ${index + 1}: ${source.quality} - ${source.url.substring(0, 100)}${source.url.length > 100 ? "..." : ""}`,
      )
    })

    // Get available qualities
    const qualities = getAvailableQualities(sources)
    qualitiesRef.current = qualities

    if (qualities.length > 0) {
      // Prefer 720p if available, otherwise use the highest quality
      const preferredQuality = qualities.includes("720p")
        ? "720p"
        : qualities.sort((a, b) => {
            const aNum = Number.parseInt(a.replace("p", "")) || 0
            const bNum = Number.parseInt(b.replace("p", "")) || 0
            return bNum - aNum
          })[0]

      addDebugLog(`Setting initial quality to: ${preferredQuality}`)

      // Find the source for the preferred quality
      const preferredSource = sources.find((s) => parseQuality(s.quality) === preferredQuality && !s.isDub)

      // If no source found for preferred quality, use the first source
      const sourceToUse = preferredSource || sources[0]

      // Store the source for playback
      sourceRef.current = sourceToUse
      addDebugLog(`Selected initial source: ${sourceToUse.quality} - ${sourceToUse.url}`)

      // Set the selected quality state
      setSelectedQuality(preferredQuality)

      // Mark sources as initialized
      setSourcesInitialized(true)

      // Set the current source URL
      const proxiedUrl = getProxiedUrl(sourceToUse.url, sourceToUse.isM3U8 ? "manifest" : "video")
      setCurrentSource(proxiedUrl)
      setDebugInfo(`Using proxied URL: ${proxiedUrl.substring(0, 50)}...`)

      // Initialize HLS if needed
      if (sourceToUse.isM3U8) {
        initHls(proxiedUrl)
      }
    } else {
      addDebugLog("No qualities available from sources")
    }
  }

  // Store all sources when they change
  useEffect(() => {
    addDebugLog(`videoSources changed: ${videoSources ? videoSources.length : 0} sources`)

    // Skip if we're using a custom stream
    if (usingCustomStream) {
      addDebugLog("Using custom stream, skipping source initialization")
      return
    }

    if (videoSources && videoSources.length > 0) {
      initializeWithSources(videoSources)
    } else if (customStreamUrl) {
      // If no video sources but we have a custom URL, use that
      addDebugLog("No video sources received, using custom stream URL")
      setUsingCustomStream(true)
      setCurrentSource(customStreamUrl)
      setDebugInfo(`Using custom stream: ${customStreamUrl.substring(0, 50)}...`)
      initHls(customStreamUrl)
    } else {
      addDebugLog("No video sources received and no custom stream URL")
      // Reset state when no sources are available
      setSourcesInitialized(false)
      sourceRef.current = null
      setSelectedQuality(null)
      setCurrentSource(null)
    }
  }, [videoSources, usingCustomStream, customStreamUrl])

  // Check if dubbed versions are available
  const hasDubbed = videoSources ? videoSources.some((s) => s.isDub) : false

  // Play test stream when all else fails
  const playTestStream = () => {
    setUsingTestStream(true)
    setUsingCustomStream(false)
    setIsLoading(false)
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    // Use a reliable test HLS stream
    const testStreamUrl = getTestStreams().hls
    const proxiedUrl = getProxiedUrl(testStreamUrl)
    setCurrentSource(proxiedUrl)
    setDebugInfo(`Using test HLS stream: ${proxiedUrl.substring(0, 50)}...`)

    addDebugLog("Playing test stream: " + testStreamUrl)

    // Initialize HLS for the test stream
    initHls(proxiedUrl)
  }

  // Play direct MP4 fallback
  const playDirectMp4Fallback = () => {
    setUsingTestStream(true)
    setUsingCustomStream(false)
    setIsLoading(false)
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    // Use a reliable direct MP4 fallback
    const mp4FallbackUrl = getTestStreams().mp4
    const proxiedUrl = getProxiedUrl(mp4FallbackUrl)
    setCurrentSource(proxiedUrl)
    setDebugInfo(`Using MP4 fallback: ${proxiedUrl.substring(0, 50)}...`)

    addDebugLog("Playing MP4 fallback: " + mp4FallbackUrl)

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
      setUsingHls(false)
    }

    // Set the source directly for MP4
    if (playerRef.current) {
      playerRef.current.src = proxiedUrl
    }
  }

  // Try to play a source directly (without proxy)
  const playDirectSource = () => {
    setUsingTestStream(true)
    setUsingCustomStream(false)
    setIsLoading(false)
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    // Use a reliable direct MP4 that allows CORS
    const directUrl = "https://cdn.jwplayer.com/videos/pZxWPRg4-Zq6530MP.mp4"
    setCurrentSource(directUrl)
    setDebugInfo(`Using direct source: ${directUrl}`)

    addDebugLog("Playing direct source: " + directUrl)

    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
      setUsingHls(false)
    }

    // Set the source directly
    if (playerRef.current) {
      playerRef.current.src = directUrl
    }
  }

  // Try using internal proxy
  const useInternalProxy = () => {
    setUsingTestStream(true)
    setUsingCustomStream(false)
    setIsLoading(false)
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    if (sourceRef.current) {
      const internalProxyUrl = `/api/proxy-video?url=${encodeURIComponent(sourceRef.current.url)}`
      setCurrentSource(internalProxyUrl)
      setDebugInfo(`Using internal proxy: ${internalProxyUrl.substring(0, 50)}...`)
      addDebugLog("Using internal proxy: " + internalProxyUrl)

      // Initialize HLS if needed
      if (sourceRef.current.isM3U8) {
        initHls(internalProxyUrl)
      } else {
        // Clean up any existing HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
          setUsingHls(false)
        }

        // Set the source directly
        if (playerRef.current) {
          playerRef.current.src = internalProxyUrl
        }
      }
    } else {
      // If no source is available, use a test stream with internal proxy
      const testStreamUrl = getTestStreams().mp4
      const internalProxyUrl = `/api/proxy-video?url=${encodeURIComponent(testStreamUrl)}`
      setCurrentSource(internalProxyUrl)
      setDebugInfo(`Using internal proxy with test stream: ${internalProxyUrl.substring(0, 50)}...`)
      addDebugLog("Using internal proxy with test stream: " + internalProxyUrl)

      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
        setUsingHls(false)
      }

      // Set the source directly
      if (playerRef.current) {
        playerRef.current.src = internalProxyUrl
      }
    }
  }

  // Try using a different proxy
  const useAlternativeProxy = () => {
    setUsingTestStream(true)
    setUsingCustomStream(false)
    setIsLoading(false)
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    if (sourceRef.current) {
      // Use a different CORS proxy service
      const alternativeProxyUrl = `https://corsproxy.io/?${encodeURIComponent(sourceRef.current.url)}`
      setCurrentSource(alternativeProxyUrl)
      setDebugInfo(`Using alternative proxy: ${alternativeProxyUrl.substring(0, 50)}...`)
      addDebugLog("Using alternative proxy: " + alternativeProxyUrl)

      // Initialize HLS if needed
      if (sourceRef.current.isM3U8) {
        initHls(alternativeProxyUrl)
      } else {
        // Clean up any existing HLS instance
        if (hlsRef.current) {
          hlsRef.current.destroy()
          hlsRef.current = null
          setUsingHls(false)
        }

        // Set the source directly
        if (playerRef.current) {
          playerRef.current.src = alternativeProxyUrl
        }
      }
    } else {
      // If no source is available, use a test stream with alternative proxy
      const testStreamUrl = getTestStreams().mp4
      const alternativeProxyUrl = `https://corsproxy.io/?${encodeURIComponent(testStreamUrl)}`
      setCurrentSource(alternativeProxyUrl)
      setDebugInfo(`Using alternative proxy with test stream: ${alternativeProxyUrl.substring(0, 50)}...`)
      addDebugLog("Using alternative proxy with test stream: " + alternativeProxyUrl)

      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
        setUsingHls(false)
      }

      // Set the source directly
      if (playerRef.current) {
        playerRef.current.src = alternativeProxyUrl
      }
    }
  }

  // Update source when quality or language changes
  useEffect(() => {
    // Don't change anything if we're using a test stream or custom stream
    if (usingTestStream || usingCustomStream) return

    // Don't do anything if sources haven't been initialized yet
    if (!sourcesInitialized) return

    // Reset player error
    setPlayerError(null)
    setErrorDetails(null)
    setAttemptCount(0)

    // Log current state for debugging
    addDebugLog(`Quality changed to: ${selectedQuality}`)

    if (!selectedQuality) {
      addDebugLog("No quality selected, using current source")
      return
    }

    if (!videoSources || videoSources.length === 0) {
      addDebugLog("No video sources available")
      return
    }

    // Find the best source based on selected quality and language preference
    const source = videoSources.find(
      (s) => parseQuality(s.quality) === selectedQuality && (isDubbed ? s.isDub : !s.isDub),
    )

    if (!source) {
      addDebugLog(`No matching source found for quality ${selectedQuality} and isDubbed=${isDubbed}`)

      // Try to find any source with the selected quality
      const anySourceWithQuality = videoSources.find((s) => parseQuality(s.quality) === selectedQuality)

      if (anySourceWithQuality) {
        addDebugLog(`Found alternative source with quality ${selectedQuality}`)
        sourceRef.current = anySourceWithQuality
        const proxiedUrl = getProxiedUrl(anySourceWithQuality.url, anySourceWithQuality.isM3U8 ? "manifest" : "video")
        setCurrentSource(proxiedUrl)
        setDebugInfo(`Using alternative source: ${proxiedUrl.substring(0, 50)}...`)

        // Initialize HLS if needed
        if (anySourceWithQuality.isM3U8) {
          initHls(proxiedUrl)
        } else {
          // Clean up any existing HLS instance
          if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
            setUsingHls(false)
          }

          // Set the source directly
          if (playerRef.current) {
            playerRef.current.src = proxiedUrl
          }
        }
        return
      }

      // If still no source found, use the first available source
      if (videoSources.length > 0) {
        addDebugLog(`No source found for quality ${selectedQuality}, using first available source`)
        sourceRef.current = videoSources[0]
        const proxiedUrl = getProxiedUrl(videoSources[0].url, videoSources[0].isM3U8 ? "manifest" : "video")
        setCurrentSource(proxiedUrl)
        setDebugInfo(`Using first available source: ${proxiedUrl.substring(0, 50)}...`)

        // Initialize HLS if needed
        if (videoSources[0].isM3U8) {
          initHls(proxiedUrl)
        } else {
          // Clean up any existing HLS instance
          if (hlsRef.current) {
            hlsRef.current.destroy()
            hlsRef.current = null
            setUsingHls(false)
          }

          // Set the source directly
          if (playerRef.current) {
            playerRef.current.src = proxiedUrl
          }
        }
        return
      }

      setPlayerError("No matching source found for the selected quality and language")
      return
    }

    // Store the source for later use
    sourceRef.current = source
    addDebugLog(`Selected source: ${source.quality} - ${source.url}`)

    // Set the current source URL with proxy
    const proxiedUrl = getProxiedUrl(source.url, source.isM3U8 ? "manifest" : "video")
    setCurrentSource(proxiedUrl)
    setDebugInfo(`Using source: ${proxiedUrl.substring(0, 50)}...`)

    // Initialize HLS if needed
    if (source.isM3U8) {
      initHls(proxiedUrl)
    } else {
      // Clean up any existing HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
        setUsingHls(false)
      }

      // Set the source directly
      if (playerRef.current) {
        playerRef.current.src = proxiedUrl
      }
    }
  }, [selectedQuality, isDubbed, sourcesInitialized, usingTestStream, usingCustomStream, videoSources])

  // Update subtitle when selection changes
  const handleSubtitleChange = (lang: string) => {
    const subtitle = subtitlesRef.current.find((sub) => sub.lang === lang)
    if (subtitle) {
      addDebugLog(`Changing subtitle to: ${subtitle.label}`)
      setSelectedSubtitle(lang)
      const proxiedSubUrl = getProxiedUrl(subtitle.url, "subtitle")
      setCurrentSubtitle(proxiedSubUrl)
    } else {
      addDebugLog(`No subtitle found for language: ${lang}`)
      setSelectedSubtitle(null)
      setCurrentSubtitle(null)
    }
  }

  // Clean up HLS instance on unmount
  useEffect(() => {
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [])

  // Display either the passed error or the player error
  const displayError = initialError || playerError

  // Get available qualities for UI
  const availableQualities = qualitiesRef.current

  // Show controls when mouse moves over video
  const handleMouseMove = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 3000)
  }

  // Handle video errors with detailed information
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoElement = e.currentTarget

    // Get detailed error information
    const errorMessage = "Failed to play video. "
    let details = ""

    if (videoElement.error) {
      const errorCode = videoElement.error.code
      switch (errorCode) {
        case 1: // MEDIA_ERR_ABORTED
          details = "The video playback was aborted."
          break
        case 2: // MEDIA_ERR_NETWORK
          details = "A network error caused the video download to fail."
          break
        case 3: // MEDIA_ERR_DECODE
          details =
            "The video playback was aborted due to a corruption problem or because the video format is not supported."
          break
        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
          details = "The video format is not supported or the URL is invalid."
          break
        default:
          details = `Unknown error (code: ${errorCode}).`
      }

      if (videoElement.error.message) {
        details += ` Additional info: ${videoElement.error.message}`
      }
    }

    // Log the error details
    addDebugLog(`Video error: ${details}`)
    console.error("Video error details:", details)

    // Update state with error information
    setPlayerError(errorMessage)
    setErrorDetails(details)

    // Increment attempt count to track failures
    setAttemptCount((prev) => prev + 1)

    // If we've tried multiple times with the same source, suggest alternatives
    if (attemptCount >= 2) {
      addDebugLog("Multiple playback attempts failed, suggesting alternatives")
    }

    // If this is an HLS error and we're using HLS.js, try to recover
    if (details.includes("HLS") && hlsRef.current) {
      addDebugLog("Attempting to recover from HLS error")
      try {
        hlsRef.current.recoverMediaError()
      } catch (e) {
        addDebugLog(`HLS recovery failed: ${e}`)
      }
    }
  }

  // Toggle debug panel
  const toggleDebugPanel = () => {
    setShowDebugPanel(!showDebugPanel)
  }

  // Button to use the custom stream URL
  const useCustomStream = () => {
    if (customStreamUrl) {
      setUsingCustomStream(true)
      setUsingTestStream(false)
      setIsLoading(false)
      setPlayerError(null)
      setErrorDetails(null)
      setAttemptCount(0)

      setCurrentSource(customStreamUrl)
      setDebugInfo(`Using custom stream: ${customStreamUrl.substring(0, 50)}...`)

      // Initialize HLS for the custom stream
      initHls(customStreamUrl)
    }
  }

  return (
    <div
      className="relative w-full aspect-video bg-gray-900 mb-6 rounded-lg overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
    >
      {loading || isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : displayError ? (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4">
          <div className="max-w-lg">
            <div className="flex items-center justify-center mb-2">
              <AlertCircle size={20} className="text-red-500 mr-2" />
              <p className="text-red-500">{displayError}</p>
            </div>

            {errorDetails && (
              <div className="mb-4 text-sm text-gray-400 bg-gray-800/50 p-2 rounded">
                <p>Error details: {errorDetails}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-center mb-4">
              <button
                onClick={() => {
                  setPlayerError(null)
                  setErrorDetails(null)
                  if (sourceRef.current) {
                    const proxiedUrl = getProxiedUrl(
                      sourceRef.current.url,
                      sourceRef.current.isM3U8 ? "manifest" : "video",
                    )
                    setCurrentSource(proxiedUrl)
                    setDebugInfo(`Retrying with: ${proxiedUrl.substring(0, 50)}...`)

                    // Initialize HLS if needed
                    if (sourceRef.current.isM3U8) {
                      initHls(proxiedUrl)
                    } else {
                      // Clean up any existing HLS instance
                      if (hlsRef.current) {
                        hlsRef.current.destroy()
                        hlsRef.current = null
                        setUsingHls(false)
                      }

                      // Set the source directly
                      if (playerRef.current) {
                        playerRef.current.src = proxiedUrl
                      }
                    }
                  }
                }}
                className="px-4 py-2 bg-purple-600 rounded-md hover:bg-purple-700 text-white flex items-center"
                id="retry-button"
              >
                <RefreshCw size={16} className="mr-2" />
                Retry
              </button>
              {customStreamUrl && (
                <button
                  onClick={useCustomStream}
                  className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 text-white flex items-center"
                  id="custom-stream-button"
                >
                  <Play size={16} className="mr-2" />
                  Use Custom Stream
                </button>
              )}
              <button
                onClick={playTestStream}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center"
                id="test-stream-button"
              >
                <Play size={16} className="mr-2" />
                Try HLS Test Stream
              </button>
              <button
                onClick={playDirectMp4Fallback}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center"
                id="mp4-fallback-button"
              >
                <Play size={16} className="mr-2" />
                MP4 Fallback
              </button>
              <button
                onClick={playDirectSource}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center"
                id="direct-source-button"
              >
                <Play size={16} className="mr-2" />
                Direct Source
              </button>
              <button
                onClick={useInternalProxy}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center"
                id="internal-proxy-button"
              >
                <Play size={16} className="mr-2" />
                Use Internal Proxy
              </button>
              <button
                onClick={useAlternativeProxy}
                className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center"
                id="alternative-proxy-button"
              >
                <Play size={16} className="mr-2" />
                Alternative Proxy
              </button>
            </div>

            <button
              onClick={toggleDebugPanel}
              className="text-xs text-gray-400 hover:text-gray-300 flex items-center mx-auto"
            >
              <Info size={12} className="mr-1" />
              {showDebugPanel ? "Hide Debug Info" : "Show Debug Info"}
            </button>

            {showDebugPanel && (
              <div className="mt-2 text-left text-xs bg-black/50 p-2 rounded max-h-32 overflow-y-auto">
                <p className="font-bold mb-1">Debug Logs:</p>
                {debugLogRef.current.map((log, index) => (
                  <div key={index} className="text-gray-400">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : currentSource ? (
        <div className="w-full h-full">
          {/* Debug info overlay */}
          {debugInfo && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-20">
              {debugInfo}
              <button
                onClick={toggleDebugPanel}
                className="ml-2 text-gray-400 hover:text-white"
                title="Show debug panel"
              >
                <Info size={12} />
              </button>
            </div>
          )}

          {/* Debug panel */}
          {showDebugPanel && (
            <div className="absolute bottom-16 left-0 right-0 bg-black/80 text-white text-xs p-2 max-h-32 overflow-y-auto z-30">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-bold">Debug Logs</h4>
                <button
                  onClick={() => setShowDebugPanel(false)}
                  className="text-xs px-2 py-1 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
              {debugLogRef.current.map((log, i) => (
                <div key={i} className="text-xs mb-1">
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* Video player with subtitles */}
          <video
            ref={playerRef}
            poster={poster}
            className="w-full h-full"
            controls
            crossOrigin="anonymous"
            onError={handleVideoError}
            autoPlay
            id="video-player"
          >
            {/* Add subtitle track if available */}
            {currentSubtitle && <track src={currentSubtitle} kind="subtitles" srcLang="en" label="English" default />}
          </video>

          {/* Quality, language, and subtitle controls */}
          {showControls && !usingTestStream && !usingCustomStream && (
            <div className="absolute top-4 right-4 bg-black/70 rounded-md p-2 flex flex-col gap-2 z-10">
              <div className="flex items-center justify-between mb-1">
                <Settings size={16} className="text-gray-300 mr-2" />
                <span className="text-xs text-gray-300">Settings</span>
              </div>

              {/* Quality selector */}
              {availableQualities.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Quality</span>
                  <div className="flex flex-wrap gap-1">
                    {availableQualities.map((quality) => (
                      <button
                        key={quality}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedQuality === quality ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => setSelectedQuality(quality)}
                        id={`quality-${quality}`}
                      >
                        {quality}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Language selector (SUB/DUB) */}
              {hasDubbed && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Language</span>
                  <div className="flex gap-1">
                    <button
                      className={`px-2 py-1 text-xs rounded ${!isDubbed ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => setIsDubbed(false)}
                      id="language-sub"
                    >
                      SUB
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded ${isDubbed ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"}`}
                      onClick={() => setIsDubbed(true)}
                      id="language-dub"
                    >
                      DUB
                    </button>
                  </div>
                </div>
              )}

              {/* Subtitle selector */}
              {subtitlesRef.current.length > 0 && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-400">Subtitles</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      className={`px-2 py-1 text-xs rounded ${
                        !selectedSubtitle ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                      }`}
                      onClick={() => {
                        setSelectedSubtitle(null)
                        setCurrentSubtitle(null)
                      }}
                      id="subtitle-off"
                    >
                      Off
                    </button>
                    {subtitlesRef.current.map((sub) => (
                      <button
                        key={sub.lang}
                        className={`px-2 py-1 text-xs rounded ${
                          selectedSubtitle === sub.lang ? "bg-purple-600" : "bg-gray-700 hover:bg-gray-600"
                        }`}
                        onClick={() => handleSubtitleChange(sub.lang)}
                        id={`subtitle-${sub.lang}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">No video source available</p>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
