import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function VerifyRequest() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-gray-900 p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-purple-500/20 p-3 rounded-full">
            <Mail size={32} className="text-purple-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>

        <p className="text-gray-300 mb-6">
          A sign in link has been sent to your email address. Please check your inbox.
        </p>

        <div className="flex flex-col space-y-4">
          <Link href="/auth/login">
            <Button variant="outline" className="w-full">
              Return to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
