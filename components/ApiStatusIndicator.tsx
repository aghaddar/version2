"use client"

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

interface ApiStatusIndicatorProps {
  apiUrl?: string
  pollingInterval?: number // in milliseconds
  disabled?: boolean // Add option to disable checks completely
}

const ApiStatusIndicator = ({
  apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL,
  pollingInterval = 60000, // Default: check every minute
  disabled = false, // Disable by default in preview environments
}: ApiStatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [showIndicator, setShowIndicator] = useState(true)

  const [shouldRunChecks, setShouldRunChecks] = useState(!disabled)

  useEffect(() => {
    if (!shouldRunChecks) {
      return
    }

    // Check status immediately on mount
    checkApiStatus()

    // Set up polling
    const intervalId = setInterval(checkApiStatus, pollingInterval)

    // Add event listeners for online/offline status
    window.addEventListener("online", checkApiStatus)
    window.addEventListener("offline", () => setIsOnline(false))

    // Clean up on unmount
    return () => {
      clearInterval(intervalId)
      window.removeEventListener("online", checkApiStatus)
      window.removeEventListener("offline", () => setIsOnline(false))
    }
  }, [apiUrl, pollingInterval, shouldRunChecks])

  const checkApiStatus = async () => {
    if (isChecking) return

    setIsChecking(true)
    try {
      // First try to check if we're online at all
      if (!navigator.onLine) {
        setIsOnline(false)
        setLastChecked(new Date())
        setIsChecking(false)
        return
      }

      // Use a simple image request as a ping - this avoids CORS issues
      // We're just checking if the domain is reachable
      const img = new Image()
      const apiDomain = new URL(apiUrl || "http://local:3001").origin

      // Create a promise that resolves when the image loads or rejects on error
      const pingPromise = new Promise<boolean>((resolve, reject) => {
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false) // Don't reject, just resolve with false

        // Set a random query param to avoid caching
        img.src = `${apiDomain}/favicon.ico?_=${Date.now()}`
      })

      // Add a timeout
      const timeoutPromise = new Promise<boolean>((resolve) => {
        setTimeout(() => resolve(false), 5000)
      })

      // Race the ping against the timeout
      const isReachable = await Promise.race([pingPromise, timeoutPromise])
      setIsOnline(isReachable)
    } catch (error) {
      console.error("API status check failed:", error)
      setIsOnline(false)
    } finally {
      setLastChecked(new Date())
      setIsChecking(false)
    }
  }

  // Don't run checks if disabled
  if (!shouldRunChecks) {
    return null
  }

  // Don't show anything while initial check is happening
  if (isOnline === null) {
    return null
  }

  // Allow user to dismiss the indicator
  if (!showIndicator) {
    return null
  }

  // Format the last checked time
  const lastCheckedText = lastChecked
    ? `Last checked: ${lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    : ""

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${
        isOnline ? "bg-green-900/80 text-green-200" : "bg-red-900/80 text-red-200"
      }`}
      title={lastCheckedText}
    >
      {isOnline ? (
        <CheckCircle size={16} className="text-green-400" />
      ) : (
        <AlertCircle size={16} className="text-red-400" />
      )}

      <span>{isOnline ? "API Online" : "API Offline"}</span>

      <button
        onClick={checkApiStatus}
        disabled={isChecking}
        className="ml-1 p-1 rounded-full hover:bg-black/20"
        aria-label="Check API status"
      >
        <RefreshCw size={14} className={isChecking ? "animate-spin" : ""} />
      </button>

      <button
        onClick={() => setShowIndicator(false)}
        className="ml-1 p-1 rounded-full hover:bg-black/20"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}

export default ApiStatusIndicator
