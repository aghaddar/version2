// Environment variables
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
  jwtSecret: process.env.JWT_SECRET_KEY || "my_super_secret_key",
}
