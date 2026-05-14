"use client"

import { useEffect, useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react"
import { Button } from "@/components/ui/button"

interface MeetPageProps {
  userName: string
  teamCode: string | null
  onBack?: () => void
}

type TokenResponse = {
  token?: string
  roomName?: string
  error?: string
}

export function MeetPage({ userName, teamCode, onBack }: MeetPageProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? ""

  useEffect(() => {
    const controller = new AbortController()

    const loadToken = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!serverUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not configured.")
        }

        if (!teamCode) {
          throw new Error("Team code is missing. Please ensure you're part of a team.")
        }

        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, teamCode }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const data: TokenResponse = await response.json()
          throw new Error(data.error || "Failed to get room token.")
        }

        const data: TokenResponse = await response.json()

        if (!data.token || !data.roomName) {
          throw new Error("Invalid token response from server.")
        }

        setToken(data.token)
        setRoomName(data.roomName)
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message)
        }
      } finally {
        setLoading(false)
      }
    }

    void loadToken()

    return () => {
      controller.abort()
    }
  }, [userName, teamCode, serverUrl])

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Connecting to room...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <LogOut className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Connection Error</p>
            <p className="text-xs text-muted-foreground mb-4">{error}</p>
          </div>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
            >
              Go Back
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (!token || !roomName) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Ready to connect...</p>
      </div>
    )
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={serverUrl}
      connectOptions={{
        autoSubscribe: true,
        maxRetries: 0,
      }}
      options={{
        publishDefaults: {
          simulcast: false,
        },
      }}
      className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)]"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  )
}
