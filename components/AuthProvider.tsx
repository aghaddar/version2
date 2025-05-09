"use client"

import { AuthProvider as LibAuthProvider } from "@/lib/auth-context"
import type { ReactNode } from "react"

export function AuthProvider({ children }: { children: ReactNode }) {
  return <LibAuthProvider>{children}</LibAuthProvider>
}
