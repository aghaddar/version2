import HeroSliderSkeleton from "@/components/HeroSliderSkeleton"
import AnimeListSkeleton from "@/components/AnimeListSkeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSliderSkeleton />
      <AnimeListSkeleton title="Loading..." />
      <AnimeListSkeleton title="Loading..." />
      <AnimeListSkeleton title="Loading..." />
    </div>
  )
}
