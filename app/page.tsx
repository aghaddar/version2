import { Suspense } from "react"
import HeroSlider from "@/components/HeroSlider"
import HeroSliderSkeleton from "@/components/HeroSliderSkeleton"
import AnimeList from "@/components/AnimeList"
import AnimeListSkeleton from "@/components/AnimeListSkeleton"
import { getPopularAnime, getRecentEpisodes, getFeaturedAnime, getTopAiringAnime, getMostFavoriteAnime, getLatestCompletedAnime, getRecentAddedAnime } from "@/lib/api"

async function getAnimeData() {
  try {
    console.log("Fetching anime data for home page from Consumet API...")

    // Get popular anime from Consumet API
    const popularAnime = await getPopularAnime()
    console.log(`Retrieved ${popularAnime.length} popular anime titles from Consumet API`)

    // Get recent episodes from Consumet API
    const recentEpisodes = await getRecentEpisodes()
    console.log(`Retrieved ${recentEpisodes.length} recent episodes from Consumet API`)

    // Get top airing anime from Consumet API
    const topAiringAnime = await getTopAiringAnime()
    console.log(`Retrieved ${topAiringAnime.length} top airing anime from Consumet API`)

    // Get most favorite anime from Consumet API
    const mostFavoriteAnime = await getMostFavoriteAnime()
    console.log(`Retrieved ${mostFavoriteAnime.length} most favorite anime from Consumet API`)

    // Get latest completed anime from Consumet API
    const latestCompletedAnime = await getLatestCompletedAnime()
    console.log(`Retrieved ${latestCompletedAnime.length} latest completed anime from Consumet API`)

    // Get recent added anime from Consumet API
    const recentAddedAnime = await getRecentAddedAnime()
    console.log(`Retrieved ${recentAddedAnime.length} recent added anime from Consumet API`)

    // Get featured anime from Consumet API
    const featuredAnime = await getFeaturedAnime()
    console.log(`Retrieved ${featuredAnime.length} featured anime for slider from Consumet API`)

    // For recommended, we'll just use the popular anime for demo purposes
    const recommendedAnime = [...popularAnime].sort(() => Math.random() - 0.5)

    return {
      popularAnime,
      recentEpisodes,
      topAiringAnime,
      mostFavoriteAnime,
      latestCompletedAnime,
      recentAddedAnime,
      recommendedAnime,
      featuredAnime,
    }
  } catch (error) {
    console.error("Error in getAnimeData from Consumet API:", error)
    // Return empty arrays as fallback
    return {
      popularAnime: [],
      recentEpisodes: [],
      topAiringAnime: [],
      mostFavoriteAnime: [],
      latestCompletedAnime: [],
      recentAddedAnime: [],
      recommendedAnime: [],
      featuredAnime: [],
    }
  }
}

export default async function Home() {
  const { popularAnime, recentEpisodes, topAiringAnime, mostFavoriteAnime, latestCompletedAnime, recentAddedAnime, recommendedAnime, featuredAnime } = await getAnimeData()

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

      <Suspense fallback={<AnimeListSkeleton title="Recent Episodes" />}>
        <AnimeList
          title="Recent Episodes"
          animeList={recentEpisodes.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/recent-episodes"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Top Airing Anime" />}>
        <AnimeList
          title="Top Airing Anime"
          animeList={topAiringAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/top-airing"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Most Favorite Anime" />}>
        <AnimeList
          title="Most Favorite Anime"
          animeList={mostFavoriteAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/most-favorite"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Latest Completed Anime" />}>
        <AnimeList
          title="Latest Completed Anime"
          animeList={latestCompletedAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/latest-completed"
        />
      </Suspense>

      <Suspense fallback={<AnimeListSkeleton title="Recently Added Anime" />}>
        <AnimeList
          title="Recently Added Anime"
          animeList={recentAddedAnime.map((anime: any) => ({
            ...anime,
            releaseDate: anime.releaseDate?.toString(),
          }))}
          viewAllLink="/recent-added"
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
