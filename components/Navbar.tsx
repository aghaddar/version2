"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X, Bell, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import UserProfileDropdown from "./UserProfileDropdown"
import { useAuth } from "@/lib/auth-context"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    // Set initial scroll state
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Only search if query is not empty
    if (searchQuery.trim()) {
      // Redirect to search page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)

      // Clear the search input after search
      setSearchQuery("")
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-sm shadow-md" : "bg-gradient-to-b from-black/90 to-black/70"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image src="/animeplus-logo.png" alt="AnimePlus" width={120} height={30} priority />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={`nav-link ${pathname === "/" ? "text-purple-400" : "text-white"}`}>
              Home
            </Link>
            <Link
              href="/trending"
              className={`nav-link ${pathname === "/trending" ? "text-purple-400" : "text-white"}`}
            >
              Trending
            </Link>
            <Link href="/popular" className={`nav-link ${pathname === "/popular" ? "text-purple-400" : "text-white"}`}>
              Popular
            </Link>
          </nav>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 text-white text-sm rounded-full py-1 px-4 pl-9 w-40 lg:w-56 focus:outline-none focus:ring-1 focus:ring-purple-500"
                suppressHydrationWarning
              />
              <Search className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
            </form>

            {/* Notifications */}
            <button className="text-white hover:text-purple-400 transition-colors" suppressHydrationWarning>
              <Bell className="w-5 h-5" />
            </button>

            {/* User Profile */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500"
                    >
                      <Image
                        src={user.avatarURL || "/zoro-profile.png"}
                        alt={user.username}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </button>
                    <UserProfileDropdown
                      isOpen={isProfileOpen}
                      onClose={() => setIsProfileOpen(false)}
                      userName={user.username}
                      profileImage={user.avatarURL}
                    />
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="hidden md:flex items-center text-white hover:text-purple-400 transition-colors"
                  >
                    <User className="w-5 h-5 mr-1" />
                    <span>Login</span>
                  </Link>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden text-white" onClick={toggleMenu}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-900 mt-2 rounded-lg overflow-hidden shadow-lg">
            <div className="p-4">
              <form onSubmit={handleSearch} className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-800 text-white text-sm rounded-full py-2 px-4 pl-9 w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </form>

              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className={`block px-3 py-2 rounded-md ${
                    pathname === "/" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"
                  }`}
                >
                  Home
                </Link>
                <Link
                  href="/trending"
                  className={`block px-3 py-2 rounded-md ${
                    pathname === "/trending" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"
                  }`}
                >
                  Trending
                </Link>
                <Link
                  href="/popular"
                  className={`block px-3 py-2 rounded-md ${
                    pathname === "/popular" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"
                  }`}
                >
                  Popular
                </Link>
                {!user && (
                  <Link
                    href="/auth/login"
                    className="flex items-center px-3 py-2 rounded-md text-white hover:bg-gray-800"
                  >
                    <User className="w-5 h-5 mr-2" />
                    <span>Login</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
