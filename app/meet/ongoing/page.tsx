"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { AppShell } from "@/components/app-shell"
import { LandingPage } from "@/components/landing-page"
import { getCurrentUser, onAuthStateChange } from "@/lib/dailybrick-api"

export default function MeetOngoing() {
  const [isBooting, setIsBooting] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      try {
        const current = await getCurrentUser()
        if (isMounted) setUser(current)
      } catch {
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setIsBooting(false)
      }
    }

    void bootstrap()

    const { data } = onAuthStateChange((_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  if (isBooting) {
    return <div className="min-h-screen bg-background" />
  }

  if (!user) {
    return <LandingPage />
  }

  return <AppShell />
}
