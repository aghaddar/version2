import AnimeCardSkeleton from "@/components/AnimeCardSkeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-6 py-8 mt-16">
      <div className="h-8 w-64 bg-gray-800 rounded-md animate-pulse mb-6"></div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <AnimeCardSkeleton key={index} />
          ))}
      </div>
    </div>
  )
}
