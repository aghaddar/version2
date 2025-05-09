export default function Loading() {
  return (
    <div className="bg-black min-h-screen pb-12">
      <div className="container mx-auto px-4 py-6">
        <div className="h-6 w-24 bg-gray-800 rounded-md animate-pulse mb-4"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="relative w-full aspect-video bg-gray-900 mb-6 rounded-lg overflow-hidden animate-pulse"></div>

            <div className="h-8 w-1/2 bg-gray-800 rounded-md animate-pulse mb-2"></div>
            <div className="h-4 w-1/3 bg-gray-800 rounded-md animate-pulse mb-4"></div>
            <div className="h-24 w-full bg-gray-800 rounded-md animate-pulse mb-6"></div>

            <div className="flex space-x-4 mb-8">
              <div className="h-10 w-24 bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-10 w-24 bg-gray-800 rounded-md animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-800 rounded-md animate-pulse"></div>
            </div>

            <div className="mt-8 bg-gray-900 p-4 rounded-lg animate-pulse h-40"></div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900 p-4 rounded-lg animate-pulse h-96"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
