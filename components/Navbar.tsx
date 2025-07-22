"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, Menu, X, Bell, User, ChevronDown, ChevronUp } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import UserProfileDropdown from "./UserProfileDropdown"
import { useAuth } from "@/lib/auth-context"
import { getZoroGenreList } from "@/lib/api"

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, refreshUserData } = useAuth()
  const [genres, setGenres] = useState<string[]>([])
  const [isGenreOpen, setIsGenreOpen] = useState(false)
  const genreCloseTimeout = React.useRef<NodeJS.Timeout | null>(null)

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

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

  // Add an effect to refresh user data when the navbar mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshUserData().catch((err) => console.error("Failed to refresh user data:", err))
    }
  }, [isAuthenticated, refreshUserData])

  // Fetch genres on mount
  useEffect(() => {
    getZoroGenreList().then(setGenres)
  }, [])

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

  // Log the user data for debugging
  useEffect(() => {
    if (user) {
      console.log("Navbar - Current user data:", user)
      console.log("Navbar - Avatar URL:", user.avatarURL)
    }
  }, [user])

  // If not mounted yet, return null or a simple placeholder to prevent hydration mismatch
  if (!isMounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-[100] bg-black/90">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="w-[120px] h-[30px]"></div>
            <div className="hidden md:block w-[200px]"></div>
            <div className="flex items-center space-x-4">
              <div className="w-[40px]"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        isScrolled ? "bg-black/95 backdrop-blur-sm shadow-md" : "bg-gradient-to-b from-black/90 to-black/70"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo at far left */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center group">
              <Image src="/animeplus-logo.png" alt="AnimePlus" width={120} height={30} priority className="transition-opacity duration-200 group-hover:opacity-70" />
            </Link>
          </div>

          {/* Center: Genre button and search, flex-1 to push right section to edge */}
          <div className="flex-1 flex items-center">
            <div className="hidden md:flex ml-5">
              <div
                className="relative"
                onMouseEnter={() => {
                  if (genreCloseTimeout.current) {
                    clearTimeout(genreCloseTimeout.current)
                  }
                  setIsGenreOpen(true)
                }}
                onMouseLeave={() => {
                  genreCloseTimeout.current = setTimeout(() => setIsGenreOpen(false), 300)
                }}
              >
                <button
                  className="nav-link flex items-center gap-1 text-white hover:text-purple-400 focus:outline-none group"
                  type="button"
                >
                  Genre
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-500 ml-1 ${isGenreOpen ? "rotate-180" : ""} group-hover:rotate-180"}`}
                  />
                </button>
                {/* Animated dropdown always rendered, but hidden with opacity/transform when closed */}
                <div
                  className={`absolute left-0 mt-2 w-[800px] bg-gray-900 rounded-2xl shadow-lg z-50 py-2 px-4 transition-all duration-500 ${isGenreOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}
                  style={{ willChange: 'opacity, transform' }}
                  onMouseEnter={() => {
                    if (genreCloseTimeout.current) {
                      clearTimeout(genreCloseTimeout.current)
                    }
                  }}
                  onMouseLeave={() => {
                    genreCloseTimeout.current = setTimeout(() => setIsGenreOpen(false), 300)
                  }}
                >
                  {(() => {
                    const columns = 5;
                    const rows = Math.ceil(genres.length / columns);
                    // Fill rows left-to-right, then top-to-bottom
                    const grid = Array.from({ length: rows }, (_, rowIdx) =>
                      genres.slice(rowIdx * columns, rowIdx * columns + columns)
                    );
                    return (
                      <div className="flex flex-col gap-1">
                        {grid.map((row, rowIdx) => (
                          <div key={rowIdx} className="flex flex-row gap-8">
                            {row.map((genre: string, colIdx) => (
                              <button
                                key={genre}
                                className="block px-2 py-1 text-left w-full text-white hover:bg-purple-900/30 hover:text-purple-400 transition-colors rounded min-w-[120px]"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setIsGenreOpen(false);
                                  router.push(`/genre/${encodeURIComponent(genre)}`);
                                }}
                                type="button"
                              >
                                {genre}
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            {/* Search Form (already hidden on mobile) */}
            <form onSubmit={handleSearch} className="hidden md:flex relative ml-5 flex-1">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 text-white text-sm rounded-full py-1 px-4 pl-9 w-60 lg:w-80 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:shadow-[0_0_20px_4px_rgba(168,85,247,0.7)] hover:shadow-[0_0_12px_4px_rgba(168,85,247,0.3)] transition-all duration-300"
              />
              <Search className="absolute left-2.5 top-1.5 w-4 h-4 text-gray-400" />
            </form>
          </div>

          {/* User Actions at far right */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Notifications */}
            <button className="text-white hover:text-purple-400 transition-colors group">
              <Bell className="w-5 h-5 group-hover:fill-purple-400" fill="none" />
            </button>

            {/* User Profile */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={toggleProfile}
                      className="flex items-center justify-center w-8 h-8 rounded-full overflow-hidden border-2 border-purple-500 bg-purple-600"
                    >
                      {user.avatarURL ? (
                        <Image
                          src={user.avatarURL || "/placeholder.svg"}
                          alt={user.username}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            // Fallback to default image if the avatar URL fails to load
                            const target = e.target as HTMLImageElement
                            target.style.display = "none"
                            console.log("Image failed to load:", user.avatarURL)

                            // Create a fallback with the first letter
                            const parent = target.parentElement
                            if (parent && !parent.querySelector(".fallback-letter")) {
                              const fallbackDiv = document.createElement("div")
                              fallbackDiv.className = "fallback-letter text-white text-lg font-bold"
                              fallbackDiv.textContent = user.username.charAt(0).toUpperCase()
                              parent.appendChild(fallbackDiv)
                            }
                          }}
                        />
                      ) : (
                        <span className="text-white text-lg font-bold">{user.username.charAt(0).toUpperCase()}</span>
                      )}
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
                    className="hidden md:flex items-center text-white hover:text-purple-400 transition-colors group"
                  >
                    <User className="w-5 h-5 mr-1 group-hover:fill-purple-400" fill="none" />
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
                  className={`block px-3 py-2 rounded-md ${pathname === "/" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"}`}
                >
                  Home
                </Link>
                <Link
                  href="/trending"
                  className={`block px-3 py-2 rounded-md ${pathname === "/trending" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"}`}
                >
                  Trending
                </Link>
                <Link
                  href="/popular"
                  className={`block px-3 py-2 rounded-md ${pathname === "/popular" ? "bg-purple-900/30 text-purple-400" : "text-white hover:bg-gray-800"}`}
                >
                  Popular
                </Link>
                {/* Genre Dropdown Mobile */}
                <div className="relative">
                  <button
                    type="button"
                    className="flex items-center w-full px-3 py-2 rounded-md text-white hover:bg-gray-800 focus:outline-none group"
                    onClick={() => setIsGenreOpen((v) => !v)}
                  >
                    Genre
                    <ChevronDown
                      className={`w-4 h-4 ml-1 transition-transform duration-500 ${isGenreOpen ? "rotate-180" : ""} group-hover:rotate-180"}`}
                    />
                  </button>
                  {(isGenreOpen && genres.length > 0) ? (() => {
                    const columns = 5;
                    const rows = Math.ceil(genres.length / columns);
                    const grid = Array.from({ length: rows }, (_, rowIdx) =>
                      genres.slice(rowIdx * columns, rowIdx * columns + columns)
                    );
                    return (
                      <div
                        className="absolute left-0 mt-1 w-[800px] bg-gray-900 rounded-2xl shadow-lg z-50 py-2 px-4"
                        onMouseEnter={() => {
                          if (genreCloseTimeout.current) {
                            clearTimeout(genreCloseTimeout.current)
                          }
                        }}
                        onMouseLeave={() => {
                          genreCloseTimeout.current = setTimeout(() => setIsGenreOpen(false), 300)
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {grid.map((row, rowIdx) => (
                            <div key={rowIdx} className="flex flex-row gap-8">
                              {row.map((genre: string, colIdx) => (
                                <button
                                  key={genre}
                                  className="block px-2 py-1 text-left w-full text-white hover:bg-purple-900/30 hover:text-purple-400 transition-colors rounded min-w-[120px]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsGenreOpen(false);
                                    router.push(`/genre/${encodeURIComponent(genre)}`);
                                  }}
                                  type="button"
                                >
                                  {genre}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })() : null}
                </div>
                {!user && (
                  <Link
                    href="/auth/login"
                    className="flex items-center px-3 py-2 rounded-md text-white hover:bg-gray-800 group"
                  >
                    <User className="w-5 h-5 mr-2 group-hover:fill-purple-400" fill="none" />
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
