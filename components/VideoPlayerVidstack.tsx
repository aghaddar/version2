"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"
import { useToast } from "@/hooks/use-toast"

interface VideoPlayerProps {
  src?: string
  subtitleUrl?: string
  fallbackStreamUrl?: string
  title?: string
  autoPlay?: boolean
  onError?: (error: Error) => void
  debug?: boolean
}

export default function VideoPlayerVidstack({
  src,
  subtitleUrl,
  fallbackStreamUrl,
  title = "Video",
  autoPlay = true,
  onError,
  debug = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const hlsRef = useRef<Hls | null>(null)

  // Use the external CORS proxy
  const CORS_PROXY_URL = "https://cors-proxy-shrina.btmd4n.easypanel.host/proxy?url="

  // Log for debugging
  const logDebug = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[VideoPlayer] ${message}`, ...args)
    }
  }

  // Function to proxy HLS URLs through the CORS proxy
  const proxyHlsUrl = (url: string): string => {
    if (!url) return url

    // If the URL is already using our proxy, don't double-proxy it
    if (url.includes(CORS_PROXY_URL)) {
      return url
    }

    // Proxy the URL
    return `${CORS_PROXY_URL}${encodeURIComponent(url)}`
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Function to initialize HLS
    const initializeHls = (streamUrl: string) => {
      logDebug(`Initializing HLS with URL: ${streamUrl}`)

      // Destroy existing HLS instance if it exists
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }

      // Check if HLS is supported
      if (Hls.isSupported()) {
        const hls = new Hls({
          // Configure HLS.js to handle all URLs through our proxy
          xhrSetup: (xhr, url) => {
            // If the URL doesn't already use our proxy, proxy it
            if (!url.includes(CORS_PROXY_URL) && !url.startsWith("/api/")) {
              const proxiedUrl = proxyHlsUrl(url)
              logDebug(`Proxying URL: ${url} -> ${proxiedUrl}`)
              xhr.open("GET", proxiedUrl, true)
              // Don't return anything (void)
            }
            // Don't return anything (void)
          },
          // Other HLS.js options
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferHole: 0.5,
          lowLatencyMode: false,
        })

        hlsRef.current = hls

        // Bind HLS to video element
        hls.attachMedia(video)
        hls.on(Hls.Events.MEDIA_ATTACHED, () => {
          logDebug("HLS media attached")
          hls.loadSource(streamUrl)

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            logDebug("HLS manifest parsed")
            if (autoPlay) {
              video.play().catch((e) => {
                logDebug("Autoplay prevented:", e)
                toast({
                  title: "Autoplay Blocked",
                  description: "Please click play to start the video",
                })
              })
            }
          })
        })

        // Error handling
        hls.on(Hls.Events.ERROR, (_, data) => {
          logDebug("HLS error:", data)

          if (data.fatal) {
            logDebug("Fatal HLS error:", data)
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                logDebug("Network error, trying to recover...")
                hls.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                logDebug("Media error, trying to recover...")
                hls.recoverMediaError()
                break
              default:
                logDebug("Fatal error, cannot recover")
                // Try fallback URL if available
                if (fallbackStreamUrl && streamUrl !== fallbackStreamUrl) {
                  logDebug("Switching to fallback stream")
                  // Make sure fallback is also proxied
                  const proxiedFallback = proxyHlsUrl(fallbackStreamUrl)
                  initializeHls(proxiedFallback)
                } else {
                  setError("Failed to load video. Please try again later.")
                  if (onError) {
                    onError(new Error(`HLS fatal error: ${data.type}`))
                  }
                }
                break
            }
          } else {
            // For non-fatal errors, just log them
            logDebug("Non-fatal HLS error:", data)
          }
        })
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // For Safari, which has native HLS support
        logDebug("Using native HLS support")
        video.src = streamUrl
        video.addEventListener("loadedmetadata", () => {
          if (autoPlay) {
            video.play().catch((e) => {
              logDebug("Autoplay prevented:", e)
            })
          }
        })
      } else {
        logDebug("HLS not supported by this browser")
        setError("Your browser does not support HLS playback.")
        if (onError) {
          onError(new Error("HLS not supported"))
        }
      }
    }

    // Add subtitle track if provided
    if (subtitleUrl) {
      logDebug(`Adding subtitle track: ${subtitleUrl}`)
      const track = document.createElement("track")
      track.kind = "subtitles"
      track.label = "English"
      track.srclang = "en"
      track.src = subtitleUrl
      track.default = true

      // Remove any existing tracks
      while (video.firstChild) {
        video.removeChild(video.firstChild)
      }

      video.appendChild(track)
    }

    // Initialize with src or fallback
    if (src) {
      logDebug(`Using provided source: ${src}`)
      // Make sure to proxy the source URL
      const proxiedSrc = proxyHlsUrl(src)
      initializeHls(proxiedSrc)
    } else if (fallbackStreamUrl) {
      logDebug(`Using fallback source: ${fallbackStreamUrl}`)
      // Make sure to proxy the fallback URL
      const proxiedFallback = proxyHlsUrl(fallbackStreamUrl)
      initializeHls(proxiedFallback)
    } else {
      logDebug("No video source provided")
      setError("No video source provided.")
    }

    // Event listeners
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const onDurationChange = () => {
      setDuration(video.duration)
    }

    const onPlay = () => {
      setIsPlaying(true)
    }

    const onPause = () => {
      setIsPlaying(false)
    }

    const onVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const onVideoError = () => {
      logDebug("Video error:", video.error)
      setError("Error playing video. Please try again later.")
      if (onError && video.error) {
        onError(new Error(`Video error: ${video.error.message}`))
      }
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("durationchange", onDurationChange)
    video.addEventListener("play", onPlay)
    video.addEventListener("pause", onPause)
    video.addEventListener("volumechange", onVolumeChange)
    video.addEventListener("error", onVideoError)
    document.addEventListener("fullscreenchange", onFullscreenChange)

    return () => {
      // Clean up
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("durationchange", onDurationChange)
      video.removeEventListener("play", onPlay)
      video.removeEventListener("pause", onPause)
      video.removeEventListener("volumechange", onVolumeChange)
      video.removeEventListener("error", onVideoError)
      document.removeEventListener("fullscreenchange", onFullscreenChange)

      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, fallbackStreamUrl, subtitleUrl, autoPlay, onError, toast, debug])

  // Format time in MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Handle play/pause
  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play().catch((e) => {
        logDebug("Play prevented:", e)
      })
    }
  }

  // Handle seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newTime = Number.parseFloat(e.target.value)
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  // Handle volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = Number.parseFloat(e.target.value)
    video.volume = newVolume
    setVolume(newVolume)
    if (newVolume === 0) {
      video.muted = true
      setIsMuted(true)
    } else if (isMuted) {
      video.muted = false
      setIsMuted(false)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  // Toggle fullscreen
  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (!document.fullscreenElement) {
      video.requestFullscreen().catch((e) => {
        logDebug("Fullscreen request failed:", e)
      })
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center p-4">
            <p className="text-lg font-semibold mb-2">{error}</p>
            <button
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className="w-full h-full"
            playsInline
            onClick={togglePlay}
            crossOrigin="anonymous"
            id="video-player"
          />

          {/* Custom controls - shown on hover or when paused */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity opacity-0 hover:opacity-100 flex flex-col gap-2">
            {/* Title */}
            <div className="text-white font-medium truncate">{title}</div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-white text-xs">{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="flex-grow h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                id="seek-slider"
                name="seek-slider"
              />
              <span className="text-white text-xs">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Play/Pause button */}
                <button onClick={togglePlay} className="text-white">
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    </svg>
                  )}
                </button>

                {/* Volume control */}
                <div className="flex items-center gap-2">
                  <button onClick={toggleMute} className="text-white">
                    {isMuted || volume === 0 ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                          clipRule="evenodd"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                    id="volume-slider"
                    name="volume-slider"
                  />
                </div>
              </div>

              {/* Fullscreen button */}
              <button onClick={toggleFullscreen} className="text-white">
                {isFullscreen ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 9V4.5M9 9H4.5M15 9H19.5M15 9V4.5M15 15v4.5M15 15h4.5M9 15H4.5M9 15v4.5"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
