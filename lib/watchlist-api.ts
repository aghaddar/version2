import type { AnimeResult } from "./types"

// Define the backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Define interfaces for the watchlist API
export interface WatchlistItem {
  id: number
  user_id: number
  anime_title: string
  img_url: string
  anime_type: string
}

export interface WatchlistAnimeResult extends AnimeResult {
  watchlistId: number
  status?: string
  priority?: string
  lastWatchedEpisode?: string
  progressPercentage?: number
}

// Flag to track if we're using local storage fallback
let usingLocalStorageFallback = false

// Helper function to get the JWT token from localStorage
const getToken = (): string | null => {
  if (typeof window !== "undefined") {
    // Try to get token from both possible storage keys
    return localStorage.getItem("auth_token") || localStorage.getItem("token")
  }
  return null
}

// Helper function to extract user ID from JWT token
export const getUserIdFromToken = (): number | null => {
  const token = getToken()
  if (!token) return null

  try {
    // JWT tokens are in the format: header.payload.signature
    const payload = token.split(".")[1]
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload))
    // Extract the user_id from the payload
    return Number.parseInt(decodedPayload.user_id, 10)
  } catch (error) {
    console.error("Error extracting user ID from token:", error)
    return null
  }
}

// Local storage functions for watchlist fallback
const getLocalWatchlist = (): WatchlistItem[] => {
  if (typeof window === "undefined") return []

  try {
    const userId = getUserIdFromToken()
    if (!userId) return []

    const storedWatchlist = localStorage.getItem(`watchlist_${userId}`)
    return storedWatchlist ? JSON.parse(storedWatchlist) : []
  } catch (error) {
    console.error("Error getting watchlist from local storage:", error)
    return []
  }
}

const saveLocalWatchlist = (watchlist: WatchlistItem[]): void => {
  if (typeof window === "undefined") return

  try {
    const userId = getUserIdFromToken()
    if (!userId) return

    localStorage.setItem(`watchlist_${userId}`, JSON.stringify(watchlist))
  } catch (error) {
    console.error("Error saving watchlist to local storage:", error)
  }
}

const addToLocalWatchlist = (item: WatchlistItem): WatchlistItem => {
  const watchlist = getLocalWatchlist()

  // Check if the anime is already in the watchlist
  const existingIndex = watchlist.findIndex((i) => i.anime_title === item.anime_title)

  if (existingIndex >= 0) {
    // Update existing item
    watchlist[existingIndex] = { ...watchlist[existingIndex], ...item }
  } else {
    // Add new item
    watchlist.push(item)
  }

  saveLocalWatchlist(watchlist)
  return item
}

const removeFromLocalWatchlist = (animeTitle: string): void => {
  const watchlist = getLocalWatchlist()
  const updatedWatchlist = watchlist.filter((item) => item.anime_title !== animeTitle)
  saveLocalWatchlist(updatedWatchlist)
}

const checkInLocalWatchlist = (animeTitle: string): boolean => {
  const watchlist = getLocalWatchlist()
  return watchlist.some((item) => item.anime_title === animeTitle)
}

// Function to get the user's watchlist
export const getUserWatchlist = async (): Promise<WatchlistItem[]> => {
  const token = getToken()
  if (!token) {
    throw new Error("Authentication required")
  }

  // If we're already using local storage fallback, return local data
  if (usingLocalStorageFallback) {
    console.log("Using local storage fallback for watchlist")
    return getLocalWatchlist()
  }

  try {
    const response = await fetch(`${BACKEND_URL}/watchlists/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // If the API returns a 404, switch to local storage fallback
      if (response.status === 404) {
        console.warn("Watchlist API endpoint not found, using local storage fallback")
        usingLocalStorageFallback = true
        return getLocalWatchlist()
      }
      throw new Error(`Failed to fetch watchlist: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching watchlist:", error)

    // If there's a network error, switch to local storage fallback
    if (!usingLocalStorageFallback) {
      console.warn("Error connecting to backend, using local storage fallback")
      usingLocalStorageFallback = true
      return getLocalWatchlist()
    }

    return []
  }
}

// Function to add an anime to the watchlist
export const addAnimeToWatchlist = async (animeId: string, title: string, imageUrl: string): Promise<WatchlistItem> => {
  const token = getToken()
  if (!token) {
    throw new Error("Authentication required")
  }

  // If we're using local storage fallback, add to local storage
  if (usingLocalStorageFallback) {
    console.log("Using local storage fallback to add anime to watchlist")
    const userId = getUserIdFromToken() || 0
    const newItem: WatchlistItem = {
      id: Date.now(),
      user_id: userId,
      anime_title: title,
      img_url: imageUrl,
      anime_type: "TV",
    }

    const savedItem = addToLocalWatchlist(newItem)

    // Dispatch event to notify components of watchlist update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    }

    return savedItem
  }

  try {
    const response = await fetch(`${BACKEND_URL}/watchlists/my/anime`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        anime_title: title,
        img_url: imageUrl,
        anime_type: "TV",
      }),
    })

    if (!response.ok) {
      // If the API returns a 404, switch to local storage fallback
      if (response.status === 404) {
        console.warn("Watchlist API endpoint not found, using local storage fallback")
        usingLocalStorageFallback = true
        return addAnimeToWatchlist(animeId, title, imageUrl)
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to add anime to watchlist: ${response.status}`)
    }

    const result = await response.json()

    // Dispatch event to notify components of watchlist update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    }

    return result
  } catch (error) {
    console.error("Error adding anime to watchlist:", error)

    // If there's a network error, switch to local storage fallback
    if (!usingLocalStorageFallback && error instanceof Error && error.message.includes("fetch")) {
      console.warn("Error connecting to backend, using local storage fallback")
      usingLocalStorageFallback = true
      return addAnimeToWatchlist(animeId, title, imageUrl)
    }

    throw error
  }
}

// Function to remove an anime from the watchlist
export const removeAnimeFromWatchlist = async (animeId: string): Promise<void> => {
  const token = getToken()
  if (!token) {
    throw new Error("Authentication required")
  }

  // If we're using local storage fallback, remove from local storage
  if (usingLocalStorageFallback) {
    console.log("Using local storage fallback to remove anime from watchlist")
    removeFromLocalWatchlist(animeId)

    // Dispatch event to notify components of watchlist update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    }

    return
  }

  try {
    const response = await fetch(`${BACKEND_URL}/watchlists/my/anime/${encodeURIComponent(animeId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // If the API returns a 404, switch to local storage fallback
      if (response.status === 404) {
        console.warn("Watchlist API endpoint not found, using local storage fallback")
        usingLocalStorageFallback = true
        return removeAnimeFromWatchlist(animeId)
      }

      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Failed to remove anime from watchlist: ${response.status}`)
    }

    // Dispatch event to notify components of watchlist update
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    }
  } catch (error) {
    console.error("Error removing anime from watchlist:", error)

    // If there's a network error, switch to local storage fallback
    if (!usingLocalStorageFallback && error instanceof Error && error.message.includes("fetch")) {
      console.warn("Error connecting to backend, using local storage fallback")
      usingLocalStorageFallback = true
      return removeAnimeFromWatchlist(animeId)
    }

    throw error
  }
}

// Function to check if an anime is in the watchlist
export const checkAnimeInWatchlist = async (animeId: string): Promise<boolean> => {
  const token = getToken()
  if (!token) {
    return false // Not authenticated, so not in watchlist
  }

  // If we're using local storage fallback, check local storage
  if (usingLocalStorageFallback) {
    console.log("Using local storage fallback to check if anime is in watchlist")
    return checkInLocalWatchlist(animeId)
  }

  try {
    const response = await fetch(`${BACKEND_URL}/watchlists/my/anime/${encodeURIComponent(animeId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // If the API returns a 404, switch to local storage fallback
      if (response.status === 404) {
        console.warn("Watchlist API endpoint not found, using local storage fallback")
        usingLocalStorageFallback = true
        return checkAnimeInWatchlist(animeId)
      }

      return false // Error means not in watchlist
    }

    const data = await response.json()
    return data.exists
  } catch (error) {
    console.error("Error checking anime in watchlist:", error)

    // If there's a network error, switch to local storage fallback
    if (!usingLocalStorageFallback && error instanceof Error && error.message.includes("fetch")) {
      console.warn("Error connecting to backend, using local storage fallback")
      usingLocalStorageFallback = true
      return checkAnimeInWatchlist(animeId)
    }

    return false
  }
}

// Helper function to convert watchlist items to AnimeResult objects
export const convertWatchlistItemsToAnimeResults = (items: WatchlistItem[]): WatchlistAnimeResult[] => {
  return items.map((item) => ({
    id: item.anime_title, // Using anime_title as ID since that's what your backend uses
    watchlistId: item.id,
    status: "Watching", // Default status
    priority: "Medium", // Default priority
    progressPercentage: 0, // Default progress
    title: item.anime_title,
    image: item.img_url,
    releaseDate: "",
    type: item.anime_type || "TV",
    description: "",
  }))
}
