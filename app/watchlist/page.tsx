"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getUserWatchlist,
  removeAnimeFromWatchlist,
  convertWatchlistItemsToAnimeResults,
  type WatchlistAnimeResult,
} from "@/lib/watchlist-api"
import { useAuth } from "@/lib/auth-context"
import { X, AlertCircle, CheckCircle2, Filter, SortAsc } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getEpisodeCount } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function WatchlistPage() {
  const { user, isAuthenticated } = useAuth()
  const [watchlist, setWatchlist] = useState<WatchlistAnimeResult[]>([])
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistAnimeResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingAnimeId, setRemovingAnimeId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [sortOption, setSortOption] = useState<string>("default")
  const router = useRouter()

  useEffect(() => {
    // Listen for auth state changes
    const fetchWatchlist = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false)
        setError("You need to be logged in to view your watchlist")
        return
      }

      try {
        setIsLoading(true)
        const watchlistItems = await getUserWatchlist()
        const animeResults = convertWatchlistItemsToAnimeResults(watchlistItems)
        setWatchlist(animeResults)
        setFilteredWatchlist(animeResults)
        setError(null)
      } catch (err: any) {
        console.error("Error fetching watchlist:", err)
        setError(err.message || "Failed to load watchlist")
        // Set empty arrays to ensure we don't show any items on error
        setWatchlist([])
        setFilteredWatchlist([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWatchlist()

    // Listen for watchlist updates
    const handleWatchlistUpdate = () => {
      fetchWatchlist()
    }

    window.addEventListener("watchlistUpdated", handleWatchlistUpdate)
    return () => {
      window.removeEventListener("watchlistUpdated", handleWatchlistUpdate)
    }
  }, [isAuthenticated, user])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...watchlist]

    // Apply status filter
    if (statusFilter) {
      result = result.filter((anime) => anime.status === statusFilter)
    }

    // Apply sorting
    switch (sortOption) {
      case "title-asc":
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        result.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "status":
        result.sort((a, b) => {
          const statusOrder = { Watching: 1, "On Hold": 2, Completed: 3, Dropped: 4 }
          const statusA = (a.status as keyof typeof statusOrder) || "Watching"
          const statusB = (b.status as keyof typeof statusOrder) || "Watching"
          return statusOrder[statusA] - statusOrder[statusB]
        })
        break
      case "progress":
        result.sort((a, b) => (b.progressPercentage || 0) - (a.progressPercentage || 0))
        break
      // Default sorting is by watchlistId (most recently added first)
      default:
        result.sort((a, b) => (b.watchlistId || 0) - (a.watchlistId || 0))
    }

    setFilteredWatchlist(result)
  }, [watchlist, statusFilter, sortOption])

  const handleRemoveFromWatchlist = async (animeId: string) => {
    try {
      setRemovingAnimeId(animeId)
      await removeAnimeFromWatchlist(animeId)

      // Update the local state to remove the anime
      setWatchlist((prevWatchlist) => prevWatchlist.filter((anime) => anime.id.toString() !== animeId))

      setSuccessMessage("Anime removed from watchlist")
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      console.error("Error removing from watchlist:", err)
      setError(err.message || "Failed to remove from watchlist")
      setTimeout(() => setError(null), 3000)
    } finally {
      setRemovingAnimeId(null)
    }
  }

  // Function to get proxied image URL
  const getProxiedImageUrl = (imageUrl: string | undefined, title: string) => {
    if (!imageUrl || imageUrl === "undefined" || imageUrl === "null") {
      return `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`
    }

    // Check if the URL is already proxied
    if (imageUrl.startsWith("/api/proxy-image")) {
      return imageUrl
    }

    // Check if it's a relative URL
    if (imageUrl.startsWith("/")) {
      return imageUrl
    }

    // Proxy external images to avoid CORS issues
    return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-500">You need to be logged in to view your watchlist</p>
        </div>
        <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-500">My Watchlist</h1>

        <div className="flex space-x-2">
          {/* Status Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                {statusFilter || "All Status"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Watching")}>Watching</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>Completed</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("On Hold")}>On Hold</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Dropped")}>Dropped</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center">
                <SortAsc className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOption("default")}>Recently Added</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("title-asc")}>Title (A-Z)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("title-desc")}>Title (Z-A)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("status")}>Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOption("progress")}>Progress</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 flex items-center">
          <CheckCircle2 className="text-green-500 mr-2" />
          <p className="text-green-500">{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="relative aspect-[2/3] w-full">
                <Skeleton className="h-full w-full" />
              </div>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWatchlist.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-lg">
          <p className="text-xl mb-4">
            {statusFilter ? `No anime with status "${statusFilter}" found` : "Your watchlist is empty"}
          </p>
          {statusFilter ? (
            <Button onClick={() => setStatusFilter(null)}>Show All</Button>
          ) : (
            <Button onClick={() => router.push("/")}>Browse Anime</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWatchlist.map((anime) => (
            <Card key={anime.watchlistId} className="overflow-hidden group relative">
              <Link href={`/anime/${anime.id}`}>
                <div className="relative aspect-[2/3] w-full">
                  <Image
                    src={getProxiedImageUrl(anime.image, anime.title) || "/placeholder.svg"}
                    alt={anime.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-center p-4">{anime.description || "No description available"}</p>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-2 left-2">
                    <Badge
                      className={`
                        ${anime.status === "Watching" ? "bg-blue-500" : ""}
                        ${anime.status === "Completed" ? "bg-green-500" : ""}
                        ${anime.status === "On Hold" ? "bg-yellow-500" : ""}
                        ${anime.status === "Dropped" ? "bg-red-500" : ""}
                      `}
                    >
                      {anime.status || "Watching"}
                    </Badge>
                  </div>

                  {/* Priority indicator */}
                  <div className="absolute top-2 right-2">
                    <Badge
                      className={`
                        ${anime.priority === "High" ? "bg-red-500" : ""}
                        ${anime.priority === "Medium" ? "bg-yellow-500" : ""}
                        ${anime.priority === "Low" ? "bg-green-500" : ""}
                      `}
                    >
                      {anime.priority || "Medium"}
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  {anime.progressPercentage !== undefined && anime.progressPercentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                      <div className="h-full bg-green-500" style={{ width: `${anime.progressPercentage}%` }} />
                    </div>
                  )}

                  {/* Episode count */}
                  {getEpisodeCount(anime) && (
                    <div className="absolute bottom-2 left-2 bg-black/70 text-xs px-2 py-1 rounded">
                      {getEpisodeCount(anime)} episodes
                    </div>
                  )}
                </div>
              </Link>

              <CardContent className="p-4">
                <h3 className="font-bold truncate">{anime.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500">{anime.type || "TV"}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-100"
                    onClick={() => handleRemoveFromWatchlist(anime.title)} // Use title as ID
                    disabled={removingAnimeId === anime.id.toString()}
                  >
                    {removingAnimeId === anime.id.toString() ? (
                      <span className="animate-spin">⟳</span>
                    ) : (
                      <X size={18} />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
