"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password reset logic here
    console.log({ email })
    setIsSubmitted(true)
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Left side - Anime Image */}
      <div className="hidden md:block md:w-1/2 relative">
        <Image src="/jujutsu-kaisen-collage.png" alt="Anime characters" fill className="object-cover" priority />
        <div className="absolute bottom-4 left-4 text-white/70 text-sm">
          <span>© AnimePlus</span>
        </div>
      </div>

      {/* Right side - Forgot Password Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <Link href="/login" className="flex items-center text-gray-400 hover:text-white mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-500 mb-2">Forgot Password</h1>
            <p className="text-gray-400">
              {isSubmitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive password reset instructions"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
              >
                Reset Password
              </Button>
            </form>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-center">
              <p className="text-white mb-4">
                If an account exists with <span className="text-purple-400">{email}</span>, you will receive password
                reset instructions.
              </p>
              <Button
                onClick={() => setIsSubmitted(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md"
              >
                Try another email
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
