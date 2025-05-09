"use client"

import { useState } from "react"
import { Share2, Copy, Facebook, Twitter, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface SocialShareMenuProps {
  title: string
  description?: string
  image?: string
  compact?: boolean
}

const SocialShareMenu = ({ title, description, image, compact = false }: SocialShareMenuProps) => {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== "undefined" ? window.location.href : ""

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title,
          text: description,
          url,
        })
        .catch((err) => console.error("Error sharing:", err))
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => console.error("Error copying link:", err))
  }

  const shareToFacebook = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`
    window.open(shareUrl, "_blank")
  }

  const shareToTwitter = () => {
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
    window.open(shareUrl, "_blank")
  }

  const shareByEmail = () => {
    const shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(
      `${description || title}\n\n${url}`,
    )}`
    window.location.href = shareUrl
  }

  // Use Web Share API directly if available and compact mode is not forced
  if (typeof navigator !== "undefined" && "share" in navigator && !compact) {
    return (
      <Button
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2"
        onClick={handleShare}
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm h-auto py-2">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-white">
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700" onClick={copyToClipboard}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700" onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700" onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center cursor-pointer hover:bg-gray-700" onClick={shareByEmail}>
          <Mail className="w-4 h-4 mr-2" />
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SocialShareMenu
