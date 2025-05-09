import axios from "axios"
import { load } from "cheerio"

// Base URLs
const ANIMEPAHE_BASE_URL = "https://animepahe.ru"
const KWIK_BASE_URL = "https://kwik.cx"

/**
 * Fetches video sources from AnimePahe for a specific episode
 * @param episodeId - The episode ID from AnimePahe
 * @returns An object containing video sources and download links
 */
export async function fetchAnimePaheSources(episodeId: string) {
  try {
    console.log(`Fetching sources for episode ID: ${episodeId}`)

    // Step 1: Get the episode page to extract the Kwik player URL
    const episodePageUrl = `${ANIMEPAHE_BASE_URL}/play/${episodeId}`
    const episodePageResponse = await axios.get(episodePageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: ANIMEPAHE_BASE_URL,
      },
    })

    // Parse the episode page HTML
    const $ = load(episodePageResponse.data)

    // Extract available qualities and their Kwik URLs
    const sources = []
    const qualitySelectors = $(".quality-selector a")

    // If there's a quality selector, extract all qualities
    if (qualitySelectors.length > 0) {
      for (let i = 0; i < qualitySelectors.length; i++) {
        const qualityElement = qualitySelectors[i]
        const quality = $(qualityElement).text().trim()
        const kwikId = $(qualityElement).attr("data-src")

        if (kwikId) {
          // Get the Kwik player URL
          const kwikUrl = `${KWIK_BASE_URL}/e/${kwikId}`

          // Extract the actual video URL from Kwik (this is the complex part)
          const videoUrl = await extractKwikVideoUrl(kwikUrl, episodePageUrl)

          if (videoUrl) {
            sources.push({
              url: videoUrl,
              isM3U8: videoUrl.includes(".m3u8"),
              quality: quality,
              isDub: false,
            })
          }
        }
      }
    } else {
      // If no quality selector, try to find the default player
      const playerIframe = $("iframe#player-iframe")
      if (playerIframe.length > 0) {
        const kwikUrl = $(playerIframe).attr("src")
        if (kwikUrl) {
          const videoUrl = await extractKwikVideoUrl(kwikUrl, episodePageUrl)

          if (videoUrl) {
            sources.push({
              url: videoUrl,
              isM3U8: videoUrl.includes(".m3u8"),
              quality: "720p", // Default quality if not specified
              isDub: false,
            })
          }
        }
      }
    }

    // If no sources found, throw an error
    if (sources.length === 0) {
      throw new Error("No video sources found")
    }

    return {
      headers: {
        Referer: KWIK_BASE_URL,
      },
      sources: sources,
      download: `${ANIMEPAHE_BASE_URL}/download/${episodeId}`,
    }
  } catch (error) {
    console.error("Error fetching AnimePahe sources:", error)
    throw error
  }
}

/**
 * Extracts the actual video URL from a Kwik player page
 * This is the most complex part as it involves bypassing obfuscation
 */
async function extractKwikVideoUrl(kwikUrl: string, referer: string): Promise<string | null> {
  try {
    // Get the Kwik player page
    const kwikResponse = await axios.get(kwikUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: referer,
      },
    })

    const $ = load(kwikResponse.data)

    // Look for the obfuscated JavaScript that contains the video URL
    // This is a simplified approach - in reality, this is much more complex
    // as Kwik uses various obfuscation techniques

    // Extract all script tags
    const scripts = $("script")
      .map((i, el) => $(el).html())
      .get()

    // Look for the script that contains the video URL pattern
    let videoUrl = null
    for (const script of scripts) {
      if (script && (script.includes(".mp4") || script.includes(".m3u8"))) {
        // Very basic extraction - in reality, you'd need to deobfuscate the JS
        const urlMatch = script.match(/(https?:\/\/[^"']+\.(mp4|m3u8)[^"']*)/i)
        if (urlMatch && urlMatch[0]) {
          videoUrl = urlMatch[0]
          break
        }
      }
    }

    // If we couldn't find the URL in scripts, try looking for a direct video element
    if (!videoUrl) {
      const videoElement = $("video source")
      if (videoElement.length > 0) {
        videoUrl = $(videoElement).attr("src") || null
      }
    }

    return videoUrl
  } catch (error) {
    console.error("Error extracting Kwik video URL:", error)
    return null
  }
}

/**
 * Searches for anime on AnimePahe
 */
export async function searchAnimePahe(query: string) {
  try {
    const searchUrl = `${ANIMEPAHE_BASE_URL}/api?m=search&q=${encodeURIComponent(query)}`
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: ANIMEPAHE_BASE_URL,
      },
    })

    return response.data.data.map((anime: any) => ({
      id: anime.session,
      title: anime.title,
      image: anime.poster,
      type: anime.type,
      releaseDate: anime.year,
    }))
  } catch (error) {
    console.error("Error searching AnimePahe:", error)
    throw error
  }
}

/**
 * Gets anime info from AnimePahe
 */
export async function getAnimePaheInfo(id: string) {
  try {
    const animeUrl = `${ANIMEPAHE_BASE_URL}/anime/${id}`
    const response = await axios.get(animeUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Referer: ANIMEPAHE_BASE_URL,
      },
    })

    const $ = load(response.data)

    // Extract basic info
    const title = $(".title-wrapper h1").text().trim()
    const image = $(".anime-poster img").attr("src") || ""
    const description = $(".anime-synopsis").text().trim()

    // Extract metadata
    const type = $('.anime-info a[href*="/type/"]').text().trim()
    const status = $('.anime-info a[href*="/status/"]').text().trim()
    const releaseDate = $('.anime-info a[href*="/year/"]').text().trim()

    // Extract genres
    const genres = $('.anime-info a[href*="/genre/"]')
      .map((i, el) => $(el).text().trim())
      .get()

    // Extract episodes (this requires additional API calls in a real implementation)
    // For simplicity, we'll just return a placeholder

    return {
      id,
      title,
      image,
      description,
      type,
      status,
      releaseDate,
      genres,
      // In a real implementation, you would need to make additional API calls to get episodes
      episodes: [],
    }
  } catch (error) {
    console.error("Error getting AnimePahe info:", error)
    throw error
  }
}
