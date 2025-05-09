// API client for authentication operations

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

// Interface for login response
export interface LoginResponse {
  message?: string
  token: string
  user?: UserData
}

// Interface for user data
export interface UserData {
  user_id?: number
  id?: number
  username: string
  email: string
  avatar_url?: string
  profile_url?: string
}

// Interface for registration response
export interface RegisterResponse {
  message: string
  user: UserData
  token?: string
}

// Login user
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    console.log(`Attempting to login at: ${API_BASE_URL}/auth/login`)

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Login failed with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Register user
export async function registerUser(username: string, email: string, password: string): Promise<RegisterResponse> {
  try {
    console.log(`Attempting to register at: ${API_BASE_URL}/auth/register`)
    console.log("Registration payload:", { username, email, password: "***" })

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    console.log("Registration response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Registration error response:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        throw new Error(errorData.error || `Registration failed with status: ${response.status}`)
      } catch (e) {
        throw new Error(`Registration failed with status: ${response.status}. Response: ${errorText}`)
      }
    }

    const data = await response.json()
    console.log("Registration success response:", data)
    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Get user profile
export async function getUserProfile(userId: number, token: string): Promise<UserData> {
  try {
    console.log(`Fetching user profile at: ${API_BASE_URL}/auth/profile`)

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      throw new Error(errorData.error || `Failed to fetch user profile with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

// Parse JWT token to get user ID
export function parseJwt(token: string): { user_id: string; role: string; exp: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error("Error parsing JWT:", error)
    return null
  }
}
