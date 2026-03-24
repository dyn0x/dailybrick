"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { AuthPage } from "@/components/auth-page"
import { Spinner } from "@/components/ui/spinner"
import { getCurrentUser, onAuthStateChange } from "@/lib/dailybrick-api"

export default function AuthRoutePage() {
  const router = useRouter()
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

    const { data } = onAuthStateChange(async (_event, session) => {
      if (!isMounted) return
      setUser(session?.user ?? null)
    })

    return () => {
      isMounted = false
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!isBooting && user) {
      router.replace("/")
    }
  }, [isBooting, router, user])

  if (isBooting || user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <AuthPage
      onLogin={() => {
        void getCurrentUser().then((current) => {
          if (current) {
            router.replace("/")
          }
        })
      }}
    />
  )
}
