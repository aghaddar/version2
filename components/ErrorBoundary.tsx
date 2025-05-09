"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Error boundary caught error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        We're sorry, but there was an error loading this content. Please try again later.
      </p>
      <Button onClick={reset} className="flex items-center bg-purple-600 hover:bg-purple-700">
        <RefreshCw size={16} className="mr-2" />
        Try again
      </Button>
    </div>
  )
}
