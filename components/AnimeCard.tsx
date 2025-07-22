"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"

interface AnimeCardProps {
  id: string | number
  title: string
  image?: string
  type?: string
  releaseDate?: string | number
  rating?: number
}

const AnimeCard = ({ id, title, image, type, releaseDate, rating }: AnimeCardProps) => {
  // Convert releaseDate to string if it's a number
  const formattedReleaseDate = typeof releaseDate === "number" ? releaseDate.toString() : releaseDate

  // Simple function to handle image errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement
    target.onerror = null // Prevent infinite loop
    target.src = `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`
  }

  // Add a function to properly handle image URLs
  const getProxiedImageUrl = (imageUrl: string | undefined, title: string) => {
    if (!imageUrl || imageUrl === "undefined" || imageUrl === "null") {
      return `/placeholder.svg?height=300&width=200&query=${encodeURIComponent(title)}`
    }

    // Check if the image URL is external (starts with http or https)
    if (imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
      // Use the proxy for external images to avoid CORS issues
      return `/api/proxy-image?url=${encodeURIComponent(imageUrl)}&title=${encodeURIComponent(title)}`
    }

    return imageUrl
  }

  return (
    <Link href={`/anime/${id.toString()}`} className="group">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl mb-2 bg-gray-800">
        <Image
          src={getProxiedImageUrl(image, title) || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating badge */}
        {rating !== undefined && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-2xl">
            {Number(rating).toFixed(1)}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
      {(type || formattedReleaseDate) && (
        <p className="text-xs text-gray-400 mt-1">
          {type && <span>{type}</span>}
          {type && formattedReleaseDate && <span> • </span>}
          {formattedReleaseDate && <span>{formattedReleaseDate}</span>}
        </p>
      )}
    </Link>
  )
}

export default AnimeCard
