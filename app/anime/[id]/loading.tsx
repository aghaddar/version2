export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative w-full h-[500px] overflow-hidden bg-gray-900 animate-pulse"></div>
      <div className="container mx-auto px-6 py-8">
        <div className="h-8 w-1/3 bg-gray-800 rounded-md animate-pulse mb-4"></div>
        <div className="h-4 w-1/4 bg-gray-800 rounded-md animate-pulse mb-6"></div>
        <div className="h-32 w-full bg-gray-800 rounded-md animate-pulse mb-8"></div>

        <div className="h-8 w-1/4 bg-gray-800 rounded-md animate-pulse mb-4"></div>
        <div className="bg-gray-900 p-4 rounded-lg animate-pulse h-40"></div>
      </div>
    </div>
  )
}
