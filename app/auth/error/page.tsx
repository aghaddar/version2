"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const errorParam = searchParams.get("error")

    if (errorParam) {
      switch (errorParam) {
        case "Configuration":
          setError("There is a problem with the server configuration.")
          break
        case "AccessDenied":
          setError("Access denied. You do not have permission to sign in.")
          break
        case "Verification":
          setError("The verification link may have been used or is invalid.")
          break
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          setError("There was a problem with the authentication provider.")
          break
        case "OAuthAccountNotLinked":
          setError("This email is already associated with another account.")
          break
        case "EmailSignin":
          setError("The email could not be sent.")
          break
        case "CredentialsSignin":
          setError("Invalid credentials. Please check your email and password.")
          break
        default:
          setError("An unknown error occurred.")
          break
      }
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Authentication Error</h1>

        <p className="text-white mb-6">{error || "An error occurred during authentication."}</p>

        <div className="flex flex-col space-y-4">
          <Link href="/auth/login">
            <Button className="w-full bg-purple-600 hover:bg-purple-700">Try Again</Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
