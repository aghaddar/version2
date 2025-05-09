"use client"

import { useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, ListPlus, History, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface UserProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  profileImage?: string | null
}

const UserProfileDropdown = ({ isOpen, onClose, userName, profileImage }: UserProfileDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleLogout = () => {
    logout()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-14 right-0 w-64 bg-[#15161c] rounded-md shadow-lg overflow-hidden z-50 border border-gray-800"
    >
      {/* User info section */}
      <div className="flex flex-col items-center py-6">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
          <Image
            src={profileImage || "/zoro-profile.png"}
            alt={userName}
            width={64}
            height={64}
            className="object-cover"
          />
        </div>
        <h3 className="text-white text-lg font-medium">{userName}</h3>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-700"></div>

      {/* Menu items */}
      <div className="py-2">
        <Link
          href="/profile"
          className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-white"
          onClick={onClose}
        >
          <User size={20} className="mr-3" />
          <span>Profile</span>
        </Link>

        <Link
          href="/watchlist"
          className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-white"
          onClick={onClose}
        >
          <ListPlus size={20} className="mr-3" />
          <span>Watchlist</span>
        </Link>

        <Link
          href="/history"
          className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-white"
          onClick={onClose}
        >
          <History size={20} className="mr-3" />
          <span>Watch History</span>
        </Link>

        <div className="border-t border-gray-700 my-1"></div>

        <button
          className="flex items-center px-4 py-3 hover:bg-gray-800 transition-colors text-[#f84550] w-full text-left"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-3" />
          <span>log out</span>
        </button>
      </div>
    </div>
  )
}

export default UserProfileDropdown
