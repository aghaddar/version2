// API endpoints for authentication and watchlist
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:3001"

// Authentication
export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Login failed")
    }

    const data = await response.json()
    return {
      user: {
        userID: data.user?.id || 1,
        username: data.user?.username || "User",
        email: email,
        avatarURL: data.user?.profile_url || "/zoro-profile.png",
      },
      token: data.token,
    }
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

export async function registerUser(username: string, email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Registration failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}
