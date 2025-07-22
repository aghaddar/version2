"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function TestApiPage() {
  const [result, setResult] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:3001"

  const testConnection = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test a simple GET request to the backend
      const response = await fetch(`${API_BASE_URL}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        mode: "cors",
      })

      const text = await response.text()
      setResult(`Status: ${response.status}\nResponse: ${text}`)
    } catch (err: any) {
      console.error("Connection test failed:", err)
      setError(`Failed to connect: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Connection Test</h1>

      <div className="mb-4">
        <p>
          Testing connection to: <code className="bg-gray-800 px-2 py-1 rounded">{API_BASE_URL}</code>
        </p>
      </div>

      <Button onClick={testConnection} disabled={loading} className="mb-4">
        {loading ? "Testing..." : "Test Connection"}
      </Button>

      {error && (
        <div className="p-4 mb-4 bg-red-900/30 border border-red-500 rounded">
          <h3 className="font-bold text-red-300">Error</h3>
          <pre className="whitespace-pre-wrap text-red-200">{error}</pre>
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="font-bold mb-2">Result</h3>
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-800 rounded">
        <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Make sure your Golang backend is running on port 3001</li>
          <li>Check that your backend has CORS headers enabled</li>
          <li>Verify that the API endpoints match what your frontend expects</li>
          <li>Check the browser console for more detailed error messages</li>
        </ul>
      </div>
    </div>
  )
}
