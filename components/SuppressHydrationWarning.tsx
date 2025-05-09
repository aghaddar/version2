"use client"

import type React from "react"

import { useEffect, useState } from "react"

export default function SuppressHydrationWarning({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <>{children}</>
  }

  return <div suppressHydrationWarning>{children}</div>
}
