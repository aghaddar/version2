const AnimeCardSkeleton = () => {
  return (
    <div className="flex-shrink-0 w-[120px] sm:w-[140px] md:w-[160px]">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-md mb-2 bg-gray-800 animate-pulse"></div>
      <div className="h-4 bg-gray-800 rounded animate-pulse mb-1 w-full"></div>
      <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3"></div>
    </div>
  )
}

export default AnimeCardSkeleton
