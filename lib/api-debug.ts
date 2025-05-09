// Add a dedicated API debugging utility

/**
 * API debugging utility for tracking requests and responses
 */
export const apiDebug = {
  enabled: true, // Set to false to disable all debug logging

  /**
   * Log API request details
   */
  request: (url: string, options?: RequestInit) => {
    if (!apiDebug.enabled) return

    console.group(`🔷 API Request: ${options?.method || "GET"} ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)

    if (options?.headers) {
      console.log("Headers:", options.headers)
    }

    if (options?.body) {
      try {
        const body = typeof options.body === "string" ? JSON.parse(options.body) : options.body
        console.log("Body:", body)
      } catch (e) {
        console.log("Body: [unparseable]", options.body)
      }
    }

    console.groupEnd()
  },

  /**
   * Log API response details
   */
  response: (url: string, status: number, data: any) => {
    if (!apiDebug.enabled) return

    const isSuccess = status >= 200 && status < 300
    console.group(`${isSuccess ? "✅" : "❌"} API Response: ${status} ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)
    console.log("Status:", status)

    if (data) {
      if (data.sources) {
        console.log(
          "Sources:",
          data.sources.map((s: any) => ({
            quality: s.quality,
            isM3U8: s.isM3U8,
            isDub: s.isDub,
            url: s.url.substring(0, 50) + "...", // Truncate long URLs
          })),
        )
      } else {
        console.log("Data:", data)
      }
    }

    console.groupEnd()
  },

  /**
   * Log API errors
   */
  error: (url: string, error: any) => {
    if (!apiDebug.enabled) return

    console.group(`❌ API Error: ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)
    console.error("Error:", error)

    // Try to extract more useful information from the error
    if (error instanceof Error) {
      console.error("Message:", error.message)
      console.error("Stack:", error.stack)
    }

    console.groupEnd()
  },
}

/**
 * Enhanced fetch function with debugging
 */
export async function debugFetch<T>(url: string, options?: RequestInit): Promise<T> {
  apiDebug.request(url, options)

  try {
    const response = await fetch(url, options)
    const contentType = response.headers.get("content-type")

    let data: any
    if (contentType?.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    apiDebug.response(url, response.status, data)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return data as T
  } catch (error) {
    apiDebug.error(url, error)
    throw error
  }
}
