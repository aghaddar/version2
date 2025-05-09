const HeroSliderSkeleton = () => {
  return (
    <div className="relative w-full h-[500px] overflow-hidden bg-gray-900">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"></div>
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-8 md:p-12 max-w-3xl">
        <div className="h-8 w-3/4 bg-gray-800 rounded-md animate-pulse mb-4"></div>
        <div className="h-4 w-1/3 bg-gray-800 rounded-md animate-pulse mb-6"></div>
        <div className="h-16 w-full bg-gray-800 rounded-md animate-pulse mb-6"></div>
        <div className="flex space-x-4">
          <div className="h-10 w-28 bg-gray-800 rounded-md animate-pulse"></div>
          <div className="h-10 w-36 bg-gray-800 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default HeroSliderSkeleton
