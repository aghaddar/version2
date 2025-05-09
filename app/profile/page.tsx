"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { User, Mail, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function ProfilePage() {
  const { user } = useAuth()

  // Use the actual user data from auth context
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    profileImage: "/zoro-profile.png",
  })

  // Update userData when user data is available
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.username || "",
        email: user.email || "",
        profileImage: user.avatarURL || "/zoro-profile.png",
      })
    }
  }, [user])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would save the user data to a database
    alert("Profile updated successfully!")
  }

  const handleResetPassword = () => {
    alert("A mail to reset your password has been sent to your email")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
              <Image
                src={userData.profileImage || "/placeholder.svg"}
                alt={userData.name}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <Button variant="outline" size="sm">
              Change Avatar
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                  className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={userData.email}
                  readOnly
                  className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md w-full focus:outline-none cursor-not-allowed opacity-80"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Change Password</label>
              <Button type="button" variant="outline" onClick={handleResetPassword} className="w-full">
                Send Password Reset Email
              </Button>
            </div>

            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white mt-4">
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
