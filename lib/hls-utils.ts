/**
 * Resolves segment URLs in an HLS manifest to absolute URLs
 */
export function resolveSegmentUrls(manifestText: string, baseUrl: string): string {
  // Special handling for padorupado.ru
  const isPadorupado = baseUrl.includes("padorupado.ru")

  // Log the manifest for debugging
  console.log("Processing manifest:", manifestText.substring(0, 200) + "...")

  // First, handle segment URLs (.ts files)
  let result = manifestText.replace(/^(?!#)(.+\.ts)$/gm, (match) => {
    try {
      // Skip if it's already an absolute URL or if it's our proxy URL
      if (match.startsWith("http") || match.startsWith("/api/proxy")) {
        return match
      }

      // Create a proxied URL for the segment
      const absoluteUrl = new URL(match, baseUrl).href
      console.log(`Proxying segment: ${absoluteUrl}`)

      // For padorupado.ru, add special handling
      if (isPadorupado) {
        return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&domain=padorupado`
      }

      return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(baseUrl)}`
    } catch (e) {
      console.error("Error resolving segment URL:", e)
      return match
    }
  })

  // Also handle .m4s segments (used in some HLS streams)
  result = result.replace(/^(?!#)(.+\.m4s)$/gm, (match) => {
    try {
      // Skip if it's already an absolute URL or if it's our proxy URL
      if (match.startsWith("http") || match.startsWith("/api/proxy")) {
        return match
      }

      // Create a proxied URL for the segment
      const absoluteUrl = new URL(match, baseUrl).href

      // For padorupado.ru, add special handling
      if (isPadorupado) {
        return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&domain=padorupado`
      }

      return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(baseUrl)}`
    } catch (e) {
      console.error("Error resolving m4s segment URL:", e)
      return match
    }
  })

  // Handle .jpg segments (some HLS streams use .jpg extension for segments)
  result = result.replace(/^(?!#)(.+\.jpg)$/gm, (match) => {
    try {
      // Skip if it's already an absolute URL or if it's our proxy URL
      if (match.startsWith("http") || match.startsWith("/api/proxy")) {
        return match
      }

      // Create a proxied URL for the segment
      const absoluteUrl = new URL(match, baseUrl).href
      console.log(`Proxying jpg segment: ${absoluteUrl}`)

      // For padorupado.ru, add special handling
      if (isPadorupado) {
        return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&domain=padorupado`
      }

      return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(baseUrl)}`
    } catch (e) {
      console.error("Error resolving jpg segment URL:", e)
      return match
    }
  })

  // Handle .key files specifically
  result = result.replace(/#EXT-X-KEY:METHOD=([^,]+),URI="([^"]+)"/g, (match, method, uri) => {
    try {
      // Skip if it's already an absolute URL or if it's our proxy URL
      if (uri.startsWith("http") || uri.startsWith("/api/proxy")) {
        return match
      }

      // Create a proxied URL for the key
      const absoluteUrl = new URL(uri, baseUrl).href

      // For padorupado.ru, add special handling
      if (isPadorupado) {
        return `#EXT-X-KEY:METHOD=${method},URI="/api/proxy-key?url=${encodeURIComponent(absoluteUrl)}&domain=padorupado"`
      }

      return `#EXT-X-KEY:METHOD=${method},URI="/api/proxy-key?url=${encodeURIComponent(absoluteUrl)}&referer=${encodeURIComponent(baseUrl)}"`
    } catch (e) {
      console.error("Error resolving key URI:", e)
      return match
    }
  })

  // Log the processed manifest for debugging
  console.log("Processed manifest:", result.substring(0, 200) + "...")

  return result
}

/**
 * Modifies an HLS manifest to use our proxy for key URLs
 */
export function modifyHlsManifest(manifestText: string, baseUrl: string): string {
  // Special handling for padorupado.ru
  const isPadorupado = baseUrl.includes("padorupado.ru")

  // Replace key URLs with our proxy
  let result = manifestText.replace(/#EXT-X-KEY:METHOD=([^,]+),URI="([^"]+)"/g, (match, method, uri) => {
    try {
      // Skip if it's already our proxy URL
      if (uri.startsWith("/api/proxy")) {
        return match
      }

      // Create a proxied URL for the key
      const absoluteKeyUrl = uri.startsWith("http") ? uri : new URL(uri, baseUrl).href

      // For padorupado.ru, add special handling
      if (isPadorupado) {
        return `#EXT-X-KEY:METHOD=${method},URI="/api/proxy-key?url=${encodeURIComponent(absoluteKeyUrl)}&domain=padorupado"`
      }

      return `#EXT-X-KEY:METHOD=${method},URI="/api/proxy-key?url=${encodeURIComponent(absoluteKeyUrl)}&referer=${encodeURIComponent(baseUrl)}"`
    } catch (e) {
      console.error("Error modifying key URL:", e)
      return match
    }
  })

  // For padorupado.ru, we need to handle segment URLs directly in the master manifest
  if (isPadorupado) {
    // Handle segment URLs in the manifest
    const lines = result.split("\n")
    const processedLines = lines.map((line) => {
      // Skip comment lines and lines that don't contain URLs
      if (line.startsWith("#") || !line.trim()) {
        return line
      }

      // Handle segment URLs that might be relative
      if (
        line.endsWith(".ts") ||
        line.endsWith(".m4s") ||
        line.endsWith(".jpg") ||
        line.includes(".ts?") ||
        line.includes(".m4s?") ||
        line.includes(".jpg?")
      ) {
        try {
          // Only process if it's not already an absolute URL
          if (!line.startsWith("http") && !line.startsWith("/api/proxy")) {
            const absoluteUrl = new URL(line, baseUrl).href
            return `/api/proxy-video?url=${encodeURIComponent(absoluteUrl)}&domain=padorupado`
          }
        } catch (e) {
          console.error("Error processing segment URL:", e)
        }
      }

      return line
    })

    result = processedLines.join("\n")
  }

  return result
}
