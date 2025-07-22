export async function getUserProfile(
  userId: number,
  token: string,
): Promise<{ username: string; profile_url: string }> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://0.0.0.0:3001";
    console.log(`Fetching user profile from: ${API_BASE_URL}/auth/profile`);

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Handle different error status codes
      if (response.status === 401) {
        throw new Error("Unauthorized: Please log in again");
      } else if (response.status === 404) {
        throw new Error("User profile not found");
      }

      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || `Failed to fetch user profile with status: ${response.status}`);
    }

    const userData = await response.json();
    console.log("Fetched user profile:", userData);

    // Extract and return the required fields
    return {
      username: userData.username || `User ${userId}`,
      profile_url: userData.profile_url || userData.avatar_url || "/zoro-profile.png",
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Return default values if the API call fails
    return {
      username: `User ${userId}`,
      profile_url: "/zoro-profile.png",
    };
  }
}