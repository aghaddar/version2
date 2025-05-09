/**
 * Get a proxied URL for a manifest or video segment
 * @param url The original URL to proxy
 * @param type The type of content ('manifest' or 'video')
 * @returns The proxied URL
 */
export function getProxiedUrl(url: string, type: "video" | "manifest" | "key" | "subtitle" = "video"): string {
  // Check if the URL is already proxied to avoid double-proxying
  if (url.includes("cors-proxy-shrina.btmd4n.easypanel.host")) {
    return url
  }

  // Use the exact proxy URL format specified
  return `https://cors-proxy-shrina.btmd4n.easypanel.host/proxy?url=${encodeURIComponent(url)}`
}

/**
 * Get direct test stream URLs that are known to work
 * @returns An object containing test stream URLs
 */
export function getTestStreams() {
  return {
    // Use different test streams that are more likely to work with CORS
    hls: "https://cdn.jwplayer.com/manifests/pZxWPRg4.m3u8",
    mp4: "https://cdn.jwplayer.com/videos/pZxWPRg4-Zq6530MP.mp4",
  }
}
