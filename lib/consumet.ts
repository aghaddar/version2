// Direct Consumet API client

export async function getAnimeInfo(id: string) {
  // Construct the full URL with the correct path for Consumet API
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  const url = `${API_BASE_URL}/anime/animepahe/info/${encodeURIComponent(id)}`

  try {
    console.log(`Fetching anime info from Consumet API: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch anime info from Consumet API: ${response.status}`)
    }
    const data = await response.json()
    console.log(`Successfully retrieved anime info for ID ${id} from Consumet API`)
    return data
  } catch (error) {
    console.error("Error in getAnimeInfo from Consumet API:", error)
    return null
  }
}

export async function getEpisodeSources(episodeId: string) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
  const url = `${API_BASE_URL}/anime/animepahe/watch?id=${encodeURIComponent(episodeId)}`

  try {
    console.log(`Fetching episode sources from Consumet API: ${url}`)
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch episode sources from Consumet API: ${response.status}`)
    }
    const data = await response.json()
    console.log(`Successfully retrieved sources for episode ID ${episodeId} from Consumet API`)
    return data
  } catch (error) {
    console.error("Error in getEpisodeSources from Consumet API:", error)
    return null
  }
}
