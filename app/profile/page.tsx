"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { User, Mail, Save, Upload, Key, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { updateUserProfile, uploadProfilePicture, changePassword, getUserProfile } from "@/lib/auth-api"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { user, token, isAuthenticated, updateUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [username, setUsername] = useState("")
  const [profileImage, setProfileImage] = useState<string>("/zoro-profile.png")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  // Function to refresh user data
  const refreshUserData = async () => {
    if (isAuthenticated && token && user?.userID) {
      try {
        const userData = await getUserProfile(user.userID, token)
        // Update the local user data with the fetched data
        updateUser({
          username: userData.username,
          avatarURL: userData.profile_url || userData.avatar_url,
        })

        // Update the form state
        setUsername(userData.username || "")
        setProfileImage(userData.profile_url || userData.avatar_url || "/zoro-profile.png")
      } catch (err) {
        console.error("Failed to fetch user data:", err)
      }
    }
  }

  // Update form with user data when available
  useEffect(() => {
    if (user) {
      setUsername(user.username || "")
      setProfileImage(user.avatarURL || "/zoro-profile.png")
    }
  }, [user])

  // Add useEffect to refresh user data when the page loads
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && token && user?.userID) {
        try {
          const userData = await getUserProfile(user.userID, token)
          // Update the local user data with the fetched data
          updateUser({
            username: userData.username,
            avatarURL: userData.profile_url || userData.avatar_url,
          })

          // Update the form state
          setUsername(userData.username || "")
          setProfileImage(userData.profile_url || userData.avatar_url || "/zoro-profile.png")
        } catch (err) {
          console.error("Failed to fetch user data:", err)
        }
      }
    }

    fetchUserData()
  }, [isAuthenticated, token, user?.userID])

  // Handle profile image selection
  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !token) {
      setError("You must be logged in to update your profile")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      let profileUrl = user?.avatarURL

      // If a new profile image was selected, upload it
      if (selectedFile) {
        try {
          const uploadResult = await uploadProfilePicture(token, selectedFile)
          profileUrl = uploadResult.profile_url
          console.log("Profile picture uploaded successfully:", profileUrl)
        } catch (uploadErr) {
          console.error("Error uploading profile picture:", uploadErr)
          // Continue with username update even if image upload fails
        }
      }

      // Update the username (even if image upload fails)
      if (username !== user?.username) {
        await updateUserProfile(token, {
          username,
        })
      }

      // Update the user in the auth context
      updateUser({
        username,
        avatarURL: profileUrl,
      })

      // Force a refresh of user data from the backend
      await refreshUserData()

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated || !token) {
      setPasswordError("You must be logged in to change your password")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match")
      return
    }

    setIsLoading(true)
    setPasswordError(null)

    try {
      await changePassword(token, {
        old_password: oldPassword,
        new_password: newPassword,
      })

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      })

      // Reset password fields
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordForm(false)
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  // Add this function to the profile page component
  const debugProfileData = async () => {
    if (!token) {
      toast({
        title: "Error",
        description: "You must be logged in to debug profile data",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/debug-profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch debug data: ${response.status}`)
      }

      const data = await response.json()
      console.log("Debug profile data:", data)

      toast({
        title: "Debug Data",
        description: "Check the console for debug information",
      })
    } catch (error) {
      console.error("Debug error:", error)
      toast({
        title: "Debug Error",
        description: error instanceof Error ? error.message : "Failed to debug profile data",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>

      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex flex-col items-center">
            <div
              className="w-32 h-32 rounded-full overflow-hidden mb-4 cursor-pointer border-2 border-gray-700 hover:border-purple-500 transition-colors"
              onClick={handleImageClick}
            >
              <Image
                src={profileImage || "/placeholder.svg"}
                alt={username}
                width={128}
                height={128}
                className="object-cover"
              />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
            <Button variant="outline" size="sm" onClick={handleImageClick} className="flex items-center">
              <Upload size={14} className="mr-1" />
              Change Avatar
            </Button>
            <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
          </div>

          <form onSubmit={handleProfileUpdate} className="flex-1 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                  value={user?.email || ""}
                  readOnly
                  className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-md w-full focus:outline-none cursor-not-allowed opacity-80"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed</p>
            </div>

            {showPasswordForm ? (
              <div className="space-y-4 border border-gray-700 rounded-md p-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <h3 className="text-sm font-medium text-gray-300">Change Password</h3>

                <div>
                  <Label htmlFor="current-password" className="text-sm text-gray-400">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-gray-800 text-white mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="new-password" className="text-sm text-gray-400">
                    New Password
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-gray-800 text-white mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password" className="text-sm text-gray-400">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-gray-800 text-white mt-1"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handlePasswordChange}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowPasswordForm(false)
                      setPasswordError(null)
                      setOldPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Change Password</label>
                <Button type="button" variant="outline" onClick={() => setShowPasswordForm(true)} className="w-full">
                  <Key size={16} className="mr-2" />
                  Change Password
                </Button>
              </div>
            )}

            <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white mt-4" disabled={isLoading}>
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>
        <Button type="button" variant="outline" onClick={debugProfileData} className="mt-4">
          Debug Profile Data
        </Button>
      </div>
    </div>
  )
}
