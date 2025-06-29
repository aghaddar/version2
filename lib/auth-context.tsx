"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { loginUser, registerUser, getUserProfile, parseJwt, type UserData } from "./auth-api"

interface User {
  userID: number
  username: string
  email: string
  avatarURL?: string
}

interface AuthContextProps {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<boolean>
  register: (credentials: RegisterRequest) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  refreshUserData: () => Promise<void>
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: () => {},
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to refresh user data from the backend
  const refreshUserData = useCallback(async () => {
    if (token && user?.userID) {
      try {
        console.log("Refreshing user data from backend...")
        const userData = await getUserProfile(user.userID, token)
        console.log("Refreshed user data:", userData)

        // Update the user state with the new data
        setUser((prevUser) => {
          if (!prevUser) return null

          const updatedUser = {
            ...prevUser,
            username: userData.username || prevUser.username,
            avatarURL: userData.profile_url || userData.avatar_url || prevUser.avatarURL,
          }

          // Update localStorage
          localStorage.setItem("auth_user", JSON.stringify(updatedUser))

          return updatedUser
        })
      } catch (error) {
        console.error("Failed to refresh user data:", error)
      }
    }
  }, [token, user?.userID])

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token")
    const storedUser = localStorage.getItem("auth_user")

    if (storedToken) {
      // Validate token and check expiration
      const tokenData = parseJwt(storedToken)
      if (tokenData && tokenData.exp * 1000 > Date.now()) {
        setToken(storedToken)

        // Try to get user data from localStorage first
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            setUser(parsedUser)
            console.log("Auth state: User loaded from localStorage", parsedUser)

            // Refresh user data from backend after loading from localStorage
            setTimeout(() => {
              if (parsedUser.userID) {
                getUserProfile(parsedUser.userID, storedToken)
                  .then((userData: UserData) => {
                    const refreshedUser = {
                      ...parsedUser,
                      username: userData.username || parsedUser.username,
                      avatarURL: userData.profile_url || userData.avatar_url || parsedUser.avatarURL,
                    }
                    setUser(refreshedUser)
                    localStorage.setItem("auth_user", JSON.stringify(refreshedUser))
                    console.log("Auth state: User refreshed from API", refreshedUser)
                  })
                  .catch((err) => console.error("Failed to refresh user on init:", err))
              }
            }, 500)
          } catch (e) {
            console.error("Failed to parse stored user", e)
            localStorage.removeItem("auth_user")
          }
        } else {
          // If no stored user data, try to fetch from API
          const userId = Number.parseInt(tokenData.user_id)
          if (!isNaN(userId)) {
            getUserProfile(userId, storedToken)
              .then((userData: UserData) => {
                const user = {
                  userID: userData.user_id || userData.id || userId,
                  username: userData.username,
                  email: userData.email,
                  avatarURL: userData.profile_url || userData.avatar_url,
                }
                setUser(user)
                localStorage.setItem("auth_user", JSON.stringify(user))
                console.log("Auth state: User fetched from API", user)
              })
              .catch((error) => {
                console.error("Failed to fetch user data", error)
                // Token might be invalid, clear it
                localStorage.removeItem("auth_token")
                setToken(null)
              })
          }
        }
      } else {
        // Token expired, clear it
        console.log("Auth state: Token expired")
        localStorage.removeItem("auth_token")
        localStorage.removeItem("auth_user")
      }
    } else if (storedUser) {
      // If we have user data but no token, use the user data
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error("Failed to parse stored user", e)
        localStorage.removeItem("auth_user")
      }
    }

    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginRequest): Promise<boolean> => {
    try {
      const response = await loginUser(credentials.email, credentials.password)

      if (response && response.token) {
        // Parse token to get user ID
        const tokenData = parseJwt(response.token)

        // Create user object
        let userData: User

        if (response.user) {
          // If the response includes user data, use it
          userData = {
            userID: response.user.id || response.user.user_id || 1,
            username: response.user.username,
            email: response.user.email,
            avatarURL: response.user.avatar_url || response.user.profile_url,
          }
        } else if (tokenData && tokenData.user_id) {
          // If no user data in response but token has user_id, create minimal user object
          userData = {
            userID: Number(tokenData.user_id),
            username: credentials.email.split("@")[0],
            email: credentials.email,
          }
        } else {
          // Fallback for demo
          userData = {
            userID: 1,
            username: credentials.email.split("@")[0],
            email: credentials.email,
          }
        }

        // Save to state
        setToken(response.token)
        setUser(userData)

        // Save to localStorage
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("auth_user", JSON.stringify(userData))

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (credentials: RegisterRequest): Promise<boolean> => {
    try {
      // Call the registerUser function from auth-api.ts
      const response = await registerUser(credentials.username, credentials.email, credentials.password)

      if (response) {
        // If registration returns a token directly, use it
        if (response.token) {
          const userData = {
            userID: response.user?.id || response.user?.user_id || 1,
            username: credentials.username,
            email: credentials.email,
            avatarURL: response.user?.avatar_url || response.user?.profile_url,
          }

          setToken(response.token)
          setUser(userData)

          localStorage.setItem("auth_token", response.token)
          localStorage.setItem("auth_user", JSON.stringify(userData))

          return true
        }

        // Otherwise, log in after registration
        return await login({
          email: credentials.email,
          password: credentials.password,
        })
      }

      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem("auth_token")
    localStorage.removeItem("auth_user")
  }

  // Add this function to update the user data
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prevUser) => {
      if (!prevUser) return null

      const updatedUser = { ...prevUser, ...userData }
      console.log("Updating user data:", updatedUser)

      // Update localStorage with the new user data
      localStorage.setItem("auth_user", JSON.stringify(updatedUser))

      return updatedUser
    })
  }, [])

  // Include updateUser in the context value
  const value: AuthContextProps = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
