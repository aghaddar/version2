"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, CheckCircle, Loader2 } from "lucide-react"
import { addAnimeToWatchlist, checkAnimeInWatchlist, removeAnimeFromWatchlist } from "@/lib/watchlist-api"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"

interface WatchlistButtonProps {
  animeId: string | number
  title: string
  imageUrl?: string // Made optional
  className?: string // Added className prop
}

export default function WatchlistButton({ animeId, title, imageUrl = "", className = "" }: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!isAuthenticated) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const inWatchlist = await checkAnimeInWatchlist(title) // Use title as the ID for your backend
        setIsInWatchlist(inWatchlist)
      } catch (error) {
        console.error("Error checking watchlist:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkWatchlist()

    // Listen for watchlist updates
    const handleWatchlistUpdate = () => {
      checkWatchlist()
    }

    window.addEventListener("watchlistUpdated", handleWatchlistUpdate)
    return () => {
      window.removeEventListener("watchlistUpdated", handleWatchlistUpdate)
    }
  }, [animeId, isAuthenticated, title])

  const handleAddToWatchlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to add anime to your watchlist",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAdding(true)
      // Use a placeholder image URL if none is provided
      const imageToUse = imageUrl || `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`
      await addAnimeToWatchlist(title, title, imageToUse) // Use title as both ID and title
      setIsInWatchlist(true)
      toast({
        title: "Added to watchlist",
        description: `${title} has been added to your watchlist.`,
        variant: "default",
      })

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    } catch (error: any) {
      console.error("Error adding to watchlist:", error)

      // Provide a more helpful error message based on the error
      let errorMessage = error.message || "Failed to add to watchlist. Please try again."

      // If it's a 404 error, provide a more specific message
      if (errorMessage.includes("404") || errorMessage.includes("not available")) {
        errorMessage = "The watchlist service is currently unavailable. Please try again later or contact support."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveFromWatchlist = async () => {
    if (!isAuthenticated) {
      return
    }

    try {
      setIsRemoving(true)
      await removeAnimeFromWatchlist(title) // Use title as the ID for your backend
      setIsInWatchlist(false)
      toast({
        title: "Removed from watchlist",
        description: `${title} has been removed from your watchlist.`,
        variant: "default",
      })

      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent("watchlistUpdated"))
    } catch (error: any) {
      console.error("Error removing from watchlist:", error)

      // Provide a more helpful error message based on the error
      let errorMessage = error.message || "Failed to remove from watchlist. Please try again."

      // If it's a 404 error, provide a more specific message
      if (errorMessage.includes("404") || errorMessage.includes("not available")) {
        errorMessage = "The watchlist service is currently unavailable. Please try again later or contact support."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsRemoving(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={handleAddToWatchlist} className={className}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add to Watchlist
      </Button>
    )
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (isInWatchlist) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleRemoveFromWatchlist}
        disabled={isRemoving}
        className={`bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20 hover:text-green-600 ${className}`}
      >
        {isRemoving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Removing...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            In Watchlist
          </>
        )}
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={handleAddToWatchlist} disabled={isAdding} className={className}>
      {isAdding ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add to Watchlist
        </>
      )}
    </Button>
  )
}
