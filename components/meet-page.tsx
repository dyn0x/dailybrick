"use client"

import { useEffect, useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react"
import { Button } from "@/components/ui/button"
import { PreJoinScreen } from "@/components/meet-prejoin"
import { useRouter } from "next/navigation"

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
  const router = useRouter()
  const [stage, setStage] = useState<"prejoin" | "connecting" | "joined">("prejoin")
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? ""

  const handleJoinClick = async (options: { audio: boolean; video: boolean }) => {
    try {
      setStage("connecting")
      setError(null)
      setAudioEnabled(options.audio)
      setVideoEnabled(options.video)

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
      // persist token and preferences to sessionStorage so the ongoing route can pick it up
      try {
        const payload = JSON.stringify({
          token: data.token,
          roomName: data.roomName,
          audio: options.audio,
          video: options.video,
        })
        sessionStorage.setItem("livekit_session", payload)
      } catch {}

      // navigate to ongoing view which will consume the token and connect
      try {
        router.push("/meet/ongoing")
      } catch {}
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to join room"
      setError(errorMsg)
      setStage("prejoin")
    }
  }

  if (stage === "prejoin") {
    return (
      <PreJoinScreen
        userName={userName}
        onJoin={handleJoinClick}
        isLoading={stage === "connecting"}
      />
    )
  }

  if (stage === "connecting") {
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
          <Button
            onClick={() => {
              setError(null)
              setStage("prejoin")
              setToken(null)
              setRoomName(null)
            }}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!token || !roomName) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing room...</p>
      </div>
    )
  }
  // we've stored session and navigated to the ongoing route — show a brief redirecting state
  return (
    <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Redirecting to meeting...</p>
    </div>
  )
}
