import type { AnimeResult } from "./api"

// Add anime to watchlist
export function addToWatchlist(anime: AnimeResult): void {
  if (typeof window === "undefined") return

  try {
    const watchlist = getWatchlist()

    // Check if anime is already in watchlist
    if (!watchlist.some((item) => item.id === anime.id)) {
      const updatedWatchlist = [...watchlist, anime]
      localStorage.setItem("animeWatchlist", JSON.stringify(updatedWatchlist))

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new Event("watchlistUpdated"))
    }
  } catch (error) {
    console.error("Error adding to watchlist:", error)
  }
}

// Remove anime from watchlist
export function removeFromWatchlist(animeId: string): void {
  if (typeof window === "undefined") return

  try {
    const watchlist = getWatchlist()
    const updatedWatchlist = watchlist.filter((item) => item.id !== animeId)
    localStorage.setItem("animeWatchlist", JSON.stringify(updatedWatchlist))

    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event("watchlistUpdated"))
  } catch (error) {
    console.error("Error removing from watchlist:", error)
  }
}

// Check if anime is in watchlist
export function isInWatchlist(animeId: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const watchlist = getWatchlist()
    return watchlist.some((item) => item.id === animeId)
  } catch (error) {
    console.error("Error checking watchlist:", error)
    return false
  }
}

// Get watchlist
export function getWatchlist(): AnimeResult[] {
  if (typeof window === "undefined") return []

  try {
    const watchlist = localStorage.getItem("animeWatchlist")
    return watchlist ? JSON.parse(watchlist) : []
  } catch (error) {
    console.error("Error getting watchlist:", error)
    return []
  }
}
