import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Episode Not Found</h1>
        <p className="text-gray-300 mb-6">The episode you're looking for doesn't exist or is currently unavailable.</p>
        <div className="flex flex-col space-y-4">
          <Link href="/">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
