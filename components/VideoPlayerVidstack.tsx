"use client"

import { useEffect, useRef, useState } from "react"
import Hls from "hls.js"

interface VideoPlayerProps {
  src?: string
  poster?: string
  title?: string
  autoPlay?: boolean
  fallbackStreamUrl?: string
  subtitles?: Array<{
    src: string
    label: string
    srcLang: string
  }>
  onError?: (error: Error) => void
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  className?: string
  debug?: boolean
}

export default function VideoPlayerVidstack({
  src,
  poster,
  title = "Video",
  autoPlay = false,
  fallbackStreamUrl,
  subtitles = [],
  onError,
  onPlay,
  onPause,
  onEnded,
  className = "",
  debug = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  // Use fallbackStreamUrl as the primary source if provided, otherwise use src
  const [currentSrc, setCurrentSrc] = useState(fallbackStreamUrl || src)
  const [hls, setHls] = useState<Hls | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Initialize HLS.js when source changes
  useEffect(() => {
    if (!currentSrc || !videoRef.current) return

    // Clean up previous HLS instance
    if (hls) {
      hls.destroy()
    }

    const isHLS = currentSrc.includes(".m3u8")

    if (isHLS && Hls.isSupported()) {
      const newHls = new Hls({
        enableWorker: false,
        xhrSetup: (xhr, url) => {
          // Add CORS headers for HLS requests
          xhr.withCredentials = false
        },
      })

      newHls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          console.error("HLS.js fatal error:", data.type, data.details)

          if (src && currentSrc !== src && !isUsingFallback) {
            console.log("Switching to alternative stream:", src)
            setIsUsingFallback(true)
            setCurrentSrc(src)
          } else {
            setError(`Playback error: ${data.details}`)
            if (onError) onError(new Error(`HLS.js error: ${data.type} - ${data.details}`))
          }
        }
      })

      try {
        newHls.loadSource(currentSrc)
        newHls.attachMedia(videoRef.current)
        setHls(newHls)

        if (debug) {
          console.log(`HLS.js initialized for source: ${currentSrc}`)
        }
      } catch (e) {
        console.error("Error loading HLS source:", e)
        setError(`Failed to load video: ${e instanceof Error ? e.message : String(e)}`)
        if (onError) onError(e instanceof Error ? e : new Error(String(e)))
      }
    } else {
      // Direct playback for non-HLS sources
      if (videoRef.current) {
        videoRef.current.src = currentSrc
      }
    }

    return () => {
      if (hls) {
        hls.destroy()
        setHls(null)
      }
    }
  }, [currentSrc, src, isUsingFallback, debug, onError])

  // Handle video events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => {
      if (onPlay) onPlay()
    }

    const handlePause = () => {
      if (onPause) onPause()
    }

    const handleEnded = () => {
      if (onEnded) onEnded()
    }

    const handleError = () => {
      const errorMessage = `Video error: ${video.error?.message || "Unknown error"}`
      console.error(errorMessage)
      setError(errorMessage)

      if (src && currentSrc !== src && !isUsingFallback) {
        console.log("Switching to alternative stream after error:", src)
        setIsUsingFallback(true)
        setCurrentSrc(src)
      } else if (onError) {
        onError(new Error(errorMessage))
      }
    }

    // Add event listeners
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)

    // Fullscreen change detection
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      // Remove event listeners
      video.removeEventListener("play", handlePlay)
      video.removeEventListener("pause", handlePause)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [onPlay, onPause, onEnded, onError, src, currentSrc, isUsingFallback])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!videoRef.current) return

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      document.exitFullscreen()
    }
  }

  // If no source is provided, show an error
  if (!currentSrc) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-black text-white">
        <div className="text-center p-4">
          <p className="text-lg font-semibold">No video source available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Video element */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full"
          poster={poster}
          controls
          autoPlay={autoPlay}
          crossOrigin="anonymous"
          playsInline
        >
          {/* Add subtitles if provided */}
          {subtitles.map((subtitle) => (
            <track
              key={subtitle.src}
              src={subtitle.src}
              kind="subtitles"
              label={subtitle.label}
              srcLang={subtitle.srcLang}
            />
          ))}
        </video>

        {/* Custom fullscreen button */}
        <button
          className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 z-10"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
              <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
              <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
              <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white"
            >
              <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
              <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
              <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
              <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
            </svg>
          )}
        </button>
      </div>

      {/* Display error message if there's an error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white z-20">
          <div className="text-center p-4 max-w-md">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error}</p>
            {src && currentSrc !== src && !isUsingFallback && (
              <button
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                onClick={() => {
                  setIsUsingFallback(true)
                  setCurrentSrc(src)
                  setError(null)
                }}
              >
                Try Alternative Stream
              </button>
            )}
          </div>
        </div>
      )}

      {/* Debug info */}
      {debug && (
        <div className="absolute bottom-0 left-0 bg-black bg-opacity-70 text-white text-xs p-2 m-2 rounded z-10">
          <p>Source: {isUsingFallback ? "Alternative" : "Primary"}</p>
          <p>URL: {currentSrc?.substring(0, 50)}...</p>
        </div>
      )}
    </div>
  )
}
