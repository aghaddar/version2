// API client for Consumet API running locally

import { MOCK_POPULAR_ANIME } from "./mock-data"

// Define the base URL for the Consumet API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
const PROVIDER_PATH = "/anime/animepahe" // Consumet API path for animepahe provider
const HLS_PROXY_URL = "https://hls.shrina.dev/proxy/" // Proxy service for HLS streams

export interface AnimeResult {
  id: string | number
  title: string
  image?: string // Make image optional to match the definition in lib/types.ts
  releaseDate?: string | number
  type?: string
  description?: string
  status?: string
  totalEpisodes?: number
  genres?: string[]
  episodes?: number | Episode[]
  recommendations?: AnimeResult[]
  rating?: number
  watchlistId?: string | number
}

export interface Episode {
  id: string
  number: number
  title?: string
}

export interface Subtitle {
  url: string
  lang: string
  label: string
}

export interface AnimeSource {
  headers: Record<string, string>
  sources: {
    url: string
    isM3U8: boolean
    quality: string
    isDub?: boolean
  }[]
  subtitles?: Subtitle[]
}

// Helper function to safely extract episode count
export function getEpisodeCount(anime: AnimeResult): number {
  if (typeof anime.episodes === "number") {
    return anime.episodes
  } else if (Array.isArray(anime.episodes)) {
    return anime.episodes.length
  } else if (anime.totalEpisodes) {
    return anime.totalEpisodes
  }
  return 0
}

// Helper function to proxy HLS URLs
function proxyHlsUrl(url: string): string {
  if (!url) return url

  // If the URL is already using our proxy, don't double-proxy it
  if (url.startsWith(HLS_PROXY_URL)) {
    return url
  }

  // If it's an HLS stream, proxy it
  if (url.includes(".m3u8")) {
    return `${HLS_PROXY_URL}${encodeURIComponent(url)}`
  }

  return url
}

// Fetch function with timeout and error handling
async function safeFetch(url: string, fallbackData: any) {
  try {
    console.log(`Fetching from Consumet API: ${url}`)

    // Use a longer timeout and handle abort errors properly
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log(`Timeout reached for: ${url}`)
      controller.abort()
    }, 15000) // Increase timeout to 15 seconds

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 60 }, // Revalidate every minute
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Consumet API error: ${response.status} ${response.statusText} for ${url}`)
        console.log(`Using fallback data for ${url}`)
        return fallbackData
      }

      const data = await response.json()
      console.log(`Consumet API response for ${url} received successfully`)
      return data
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === "AbortError") {
        console.log(`Request timed out for: ${url}`)
      } else {
        console.error(`Fetch error for ${url}:`, error)
      }

      console.log(`Using fallback data for ${url}`)
      return fallbackData
    }
  } catch (error: any) {
    console.error(`Unexpected error for ${url}:`, error)
    console.log(`Using fallback data for ${url}`)
    return fallbackData
  }
}

export async function getPopularAnime(): Promise<AnimeResult[]> {
  console.log("Getting popular anime from Consumet API...")

  // Construct the URL for the Consumet API popular endpoint
  const url = `${API_BASE_URL}${PROVIDER_PATH}/popular`
  console.log(`Attempting to fetch popular anime from: ${url}`)

  try {
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })

    // Return the results array from the response or fallback to mock data
    if (data && data.results && Array.isArray(data.results)) {
      console.log(`Successfully retrieved ${data.results.length} popular anime from Consumet API`)
      return data.results
    } else {
      console.log("Consumet API response format unexpected, using mock data")
      return MOCK_POPULAR_ANIME
    }
  } catch (error: any) {
    console.error("Error in getPopularAnime:", error)
    console.log("Using mock data due to error")
    return MOCK_POPULAR_ANIME
  }
}

export async function getRecentEpisodes(): Promise<AnimeResult[]> {
  console.log("Getting recent episodes from Consumet API...")

  // Create mock recent episodes as fallback
  const mockRecentEpisodes = MOCK_POPULAR_ANIME.slice(0, 4).map((anime) => ({
    ...anime,
    episodeNumber: Math.floor(Math.random() * 12) + 1,
    episodeId: `${anime.id}-episode-${Math.floor(Math.random() * 12) + 1}`,
  }))

  // Construct the URL for the Consumet API recent episodes endpoint
  const url = `${API_BASE_URL}${PROVIDER_PATH}/recent-episodes`
  console.log(`Attempting to fetch recent episodes from: ${url}`)

  try {
    const data = await safeFetch(url, { results: mockRecentEpisodes })

    // Return the results array from the response or fallback to mock data
    if (data && data.results && Array.isArray(data.results)) {
      console.log(`Successfully retrieved ${data.results.length} recent episodes from Consumet API`)
      return data.results
    } else {
      console.log("Consumet API response format unexpected, using mock data")
      return mockRecentEpisodes
    }
  } catch (error: any) {
    console.error("Error in getRecentEpisodes:", error)
    console.log("Using mock data due to error")
    return mockRecentEpisodes
  }
}

export async function searchAnime(query: string): Promise<AnimeResult[]> {
  if (!query) return []

  console.log(`Searching anime with query: ${query} using Consumet API`)

  // Create filtered mock results as fallback
  const filteredMockResults = MOCK_POPULAR_ANIME.filter((anime) =>
    anime.title.toLowerCase().includes(query.toLowerCase()),
  )

  // Construct the URL for the Consumet API search endpoint
  const url = `${API_BASE_URL}${PROVIDER_PATH}/${encodeURIComponent(query)}`
  console.log(`Searching anime with query URL: ${url}`)

  try {
    const data = await safeFetch(url, { results: filteredMockResults })

    // Return the results array from the response or fallback to mock data
    if (data && data.results && Array.isArray(data.results)) {
      console.log(`Successfully retrieved ${data.results.length} search results from Consumet API`)
      return data.results
    } else {
      console.log("Consumet API response format unexpected, using mock data")
      return filteredMockResults
    }
  } catch (error: any) {
    console.error("Error in searchAnime:", error)
    console.log("Using mock data due to error")
    return filteredMockResults
  }
}

export async function getAnimeInfo(id: string): Promise<AnimeResult | null> {
  if (!id) return null

  console.log(`Getting anime info for ID: ${id} from Consumet API`)

  // Find the anime in our mock data as a fallback
  const mockAnime = MOCK_POPULAR_ANIME.find((anime) => anime.id.toString() === id.toString())
  const mockAnimeInfo = mockAnime
    ? {
        ...mockAnime,
        description: "This is a mock description for the anime. The API is running locally.",
        status: "Ongoing",
        totalEpisodes: 24,
        genres: ["Action", "Adventure", "Fantasy"],
        episodes: Array.from({ length: 12 }, (_, i) => ({
          id: `${id}-episode-${i + 1}`,
          number: i + 1,
          title: `Episode ${i + 1}`,
        })),
        recommendations: MOCK_POPULAR_ANIME.filter((anime) => anime.id.toString() !== id.toString()).slice(0, 5),
      }
    : null

  // Construct the URL for the Consumet API anime info endpoint
  const url = `${API_BASE_URL}${PROVIDER_PATH}/info/${encodeURIComponent(id)}`
  console.log(`Fetching anime info from: ${url}`)

  try {
    const data = await safeFetch(url, mockAnimeInfo)
    return data
  } catch (error: any) {
    console.error("Error in getAnimeInfo:", error)
    console.log("Using mock data due to error")
    return mockAnimeInfo
  }
}

export async function getRelatedAnime(genres: string[]): Promise<AnimeResult[]> {
  console.log("Fetching related anime based on genres from Consumet API:", genres)

  // For related anime, we'll use the popular endpoint as Consumet doesn't have a specific related endpoint
  const url = `${API_BASE_URL}${PROVIDER_PATH}/popular`
  console.log(`Fetching related anime from: ${url}`)

  try {
    const data = await safeFetch(url, { results: MOCK_POPULAR_ANIME })

    // Return the results array from the response or fallback to mock data
    if (data && data.results && Array.isArray(data.results)) {
      console.log(`Successfully retrieved ${data.results.length} related anime from Consumet API`)
      return data.results.slice(0, 4)
    } else {
      console.log("Consumet API response format unexpected, using mock data")
      return MOCK_POPULAR_ANIME.slice(0, 4)
    }
  } catch (error: any) {
    console.error("Error in getRelatedAnime:", error)
    console.log("Using mock data due to error")
    return MOCK_POPULAR_ANIME.slice(0, 4)
  }
}

// Update the getFeaturedAnime function to fetch from Consumet API
export async function getFeaturedAnime(): Promise<AnimeResult[]> {
  console.log("Getting featured anime from Consumet API...")

  // Create mock featured anime as fallback
  const mockFeaturedAnime = MOCK_POPULAR_ANIME.slice(0, 3).map((anime) => ({
    ...anime,
    description: "This is a mock description for the featured anime. The API is running locally.",
  }))

  // Construct the URL for the Consumet API featured endpoint
  // Note: Consumet might not have a dedicated featured endpoint, so we'll use popular and filter
  const url = `${API_BASE_URL}${PROVIDER_PATH}/featured`
  console.log(`Attempting to fetch featured anime from: ${url}`)

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // Revalidate every minute
    })

    if (!response.ok) {
      console.error(`Consumet API error: ${response.status} ${response.statusText} for ${url}`)
      console.log("Using mock featured anime due to API error")
      return mockFeaturedAnime
    }

    const data = await response.json()
    console.log("Featured anime API response:", data)

    // Check if the response is an array
    if (Array.isArray(data)) {
      console.log(`Successfully retrieved ${data.length} featured anime from Consumet API`)
      return data
    }
    // If it's an object with a results property that is an array
    else if (data && Array.isArray(data.results)) {
      console.log(`Successfully retrieved ${data.results.length} featured anime from Consumet API results property`)
      return data.results
    }
    // Fallback to mock data
    else {
      console.warn("Featured anime API did not return an array, using fallback data")
      return mockFeaturedAnime
    }
  } catch (error: any) {
    console.error("Error in getFeaturedAnime:", error)
    console.log("Using mock featured anime due to error")
    return mockFeaturedAnime
  }
}

// Update the getEpisodeSources function to use the custom fallback URL
export async function getEpisodeSources(episodeId: string): Promise<AnimeSource | null> {
  if (!episodeId) {
    console.error("getEpisodeSources called with empty episodeId")
    return null
  }

  // Create fallback sources with the custom URL - now using the proxy
  const fallbackSources = {
    headers: {
      Referer: "https://kwik.cx/",
    },
    sources: [
      {
        url: proxyHlsUrl(
          "https://ef.netmagcdn.com:2228/hls-playback/2f219e7a538f6b41763b2d81888f622d7d999109e4aabe2bf5ebc28de54bf1dd958dfbf6e445f1c6c88acf7779775503c4b0719ce97cec2e5731318a6003ea8a022f782127e4287da2f3917712e14a3b19dd5fcf47922975af8fd214e5d48ce11d1ed7c8611c8abf5324e5c767234b0c542b5d0ad5860297029d86704a4c106d082f5eb8864f1701f63fb4746e94d8a4/master.m3u8",
        ),
        isM3U8: true,
        quality: "720p",
        isDub: false,
      },
    ],
    subtitles: [],
  }

  console.log(`Processing episode ID for Consumet API request: ${episodeId}`)

  try {
    // IMPORTANT: Properly encode the episodeId to handle slashes correctly
    const encodedEpisodeId = encodeURIComponent(episodeId)

    // Construct the URL for the Consumet API watch endpoint
    const url = `${API_BASE_URL}${PROVIDER_PATH}/watch?id=${encodedEpisodeId}`
    console.log(`Attempting to fetch sources from Consumet API: ${url}`)

    try {
      // Make the request with appropriate headers
      const response = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      })

      // Check if the response is OK
      if (!response.ok) {
        // Don't log as error for 500s, just info
        console.log(`Consumet API returned ${response.status} ${response.statusText} for ${url}`)
        console.log("Using fallback sources due to API response status")
        return fallbackSources
      }

      // Try to parse the response as JSON
      const data = await response.json()

      // Validate the response structure
      if (!data || !data.sources || !Array.isArray(data.sources) || data.sources.length === 0) {
        console.log("Consumet API response missing sources array, using fallback")
        return fallbackSources
      }

      // Proxy all HLS URLs in the sources
      const proxiedSources = {
        ...data,
        sources: data.sources.map((source: any) => ({
          ...source,
          url: proxyHlsUrl(source.url),
        })),
      }

      // Log the sources we found
      console.log(
        `Found ${proxiedSources.sources.length} sources from Consumet API:`,
        proxiedSources.sources.map((s: { quality: string; isM3U8: boolean }) => ({
          quality: s.quality,
          isM3U8: s.isM3U8,
        })),
      )

      return proxiedSources
    } catch (fetchError: any) {
      // Fix the TypeScript error by adding type annotation
      console.log(
        "Error fetching from Consumet API, using fallback sources:",
        fetchError instanceof Error ? fetchError.message : "Unknown error",
      )
      return fallbackSources
    }
  } catch (error: any) {
    // Fix the TypeScript error by adding type annotation
    console.log(
      "Exception in getEpisodeSources, using fallback sources:",
      error instanceof Error ? error.message : "Unknown error",
    )
    return fallbackSources
  }
}

export async function fetchEpisodeLinks(animeId: string, episodeId: string) {
  try {
    const animeInfo = await getAnimeInfo(animeId)
    if (!animeInfo) {
      throw new Error("Anime info not found")
    }

    const episodeSources = await getEpisodeSources(episodeId)
    if (!episodeSources) {
      throw new Error("Episode sources not found")
    }

    return {
      title: animeInfo.title,
      sources: episodeSources.sources,
    }
  } catch (error) {
    console.error("Error fetching episode links:", error)
    throw error
  }
}
