import AnimeCardSkeleton from "./AnimeCardSkeleton"

interface AnimeListSkeletonProps {
  title: string
}

const AnimeListSkeleton = ({ title }: AnimeListSkeletonProps) => {
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-4 px-6">
        <h2 className="text-xl font-bold">{title}</h2>
      </div>

      <div className="flex overflow-x-auto scrollbar-hide px-4 sm:px-6 space-x-3 sm:space-x-4 pb-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <AnimeCardSkeleton key={index} />
          ))}
      </div>
    </div>
  )
}

export default AnimeListSkeleton
