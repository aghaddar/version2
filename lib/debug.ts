// Add a debug utility to help troubleshoot API issues

/**
 * Debug utility for logging API requests and responses
 */
export const debugLog = {
  request: (url: string, method = "GET", body?: any) => {
    console.group(`🔷 API Request: ${method} ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)
    if (body) {
      console.log("Body:", body)
    }
    console.groupEnd()
  },

  response: (url: string, status: number, data: any) => {
    const isSuccess = status >= 200 && status < 300
    console.group(`${isSuccess ? "✅" : "❌"} API Response: ${status} ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)
    console.log("Data:", data)
    console.groupEnd()
  },

  error: (url: string, error: any) => {
    console.group(`❌ API Error: ${url}`)
    console.log(`Time: ${new Date().toISOString()}`)
    console.error("Error:", error)
    console.groupEnd()
  },
}

/**
 * Enhanced fetch function with debugging
 */
export async function debugFetch(url: string, options?: RequestInit) {
  debugLog.request(url, options?.method || "GET", options?.body)

  try {
    const response = await fetch(url, options)
    const data = await response.json()

    debugLog.response(url, response.status, data)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return data
  } catch (error) {
    debugLog.error(url, error)
    throw error
  }
}
