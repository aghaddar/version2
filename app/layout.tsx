import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "./vidstack.css" // Import Vidstack CSS
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { AuthProvider } from "@/lib/auth-context"
import ApiStatusIndicator from "@/components/ApiStatusIndicator"
// Import the SuppressHydrationWarning component
import SuppressHydrationWarning from "@/components/SuppressHydrationWarning"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AnimePlus - Anime Streaming Platform",
  description: "Watch your favorite anime shows and movies",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Wrap the AuthProvider with SuppressHydrationWarning
  return (
    <html lang="en">
      <body className={inter.className}>
        <SuppressHydrationWarning>
          <AuthProvider>
            <Navbar />
            {/* Added pt-16 to account for the fixed navbar height */}
            <main className="flex-grow pt-16">{children}</main>
            <Footer />
            <ApiStatusIndicator disabled={process.env.NODE_ENV === "development"} />
          </AuthProvider>
        </SuppressHydrationWarning>
      </body>
    </html>
  )
}
