import { Suspense } from "react"
import HeroSlider from "@/components/HeroSlider"
import HeroSliderSkeleton from "@/components/HeroSliderSkeleton"
import AnimeList from "@/components/AnimeList"
import AnimeListSkeleton from "@/components/AnimeListSkeleton"
import { getPopularAnime, getRecentEpisodes, getFeaturedAnime } from "@/lib/api"

async function getAnimeData() {
  try {
    console.log("Fetching anime data for home page from Consumet API...")

    // Get popular anime from Consumet API
    const popularAnime = await getPopularAnime()
    console.log(`Retrieved ${popularAnime.length} popular anime titles from Consumet API`)

    // Get recent episodes from Consumet API
    const recentEpisodes = await getRecentEpisodes()
    console.log(`Retrieved ${recentEpisodes.length} recent episodes from Consumet API`)

    // Get featured anime from Consumet API
    const featuredAnime = await getFeaturedAnime()
    console.log(`Retrieved ${featuredAnime.length} featured anime for slider from Consumet API`)

    // For recommended, we'll just use the popular anime for demo purposes
    const recommendedAnime = [...popularAnime].sort(() => Math.random() - 0.5)

    return {
      popularAnime,
      recentEpisodes,
      recommendedAnime,
      featuredAnime,
    }
  } catch (error) {
    console.error("Error in getAnimeData from Consumet API:", error)
    // Return empty arrays as fallback
    return {
      popularAnime: [],
      recentEpisodes: [],
      recommendedAnime: [],
      featuredAnime: [],
    }
  }
}

export default async function Home() {
  const { popularAnime, recentEpisodes, recommendedAnime, featuredAnime } = await getAnimeData()

  return (
    <div className="min-h-screen bg-black text-white">
      <Suspense fallback={<HeroSliderSkeleton />}>
        <HeroSlider
          featuredAnime={featuredAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
            description: anime.description || "No description available.", // Ensure description is always defined
          }))}
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Most Popular" />}>
        <AnimeList
          title="Most Popular"
          animeList={popularAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/popular"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Trending Anime" />}>
        <AnimeList
          title="Trending Anime"
          animeList={recommendedAnime.map((anime: any) => ({
            ...anime,
            releaseDate: typeof anime.releaseDate === "number" ? anime.releaseDate.toString() : anime.releaseDate,
          }))}
          viewAllLink="/trending"
        />
      </Suspense>
    </div>
  )
}
