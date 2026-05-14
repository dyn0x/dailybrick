"use client"

import { useEffect, useState } from "react"
import { Loader2, LogOut, VideoOff, X } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react"
import { Button } from "@/components/ui/button"

interface TeamRoomProps {
  open: boolean
  onClose: () => void
  userName: string
  teamCode: string | null
}

type TokenResponse = {
  token?: string
  roomName?: string
  error?: string
}

export function TeamRoom({ open, onClose, userName, teamCode }: TeamRoomProps) {
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? ""

  useEffect(() => {
    if (!open) {
      setToken(null)
      setRoomName(null)
      setLoading(false)
      setError(null)
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const controller = new AbortController()

    const loadToken = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!serverUrl) {
          throw new Error("NEXT_PUBLIC_LIVEKIT_URL is not configured.")
        }
        if (!teamCode) {
          throw new Error("Team code is required to join the room.")
        }

        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName, teamCode }),
          signal: controller.signal,
        })

        const payload = (await response.json().catch(() => null)) as TokenResponse | null
        if (!response.ok) {
          throw new Error(payload?.error ?? "Could not load the team room.")
        }

        if (!payload?.token) {
          throw new Error("Could not load the team room.")
        }

        setToken(payload.token)
        setRoomName(payload.roomName ?? teamCode)
      } catch (err) {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : "Could not load the team room."
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadToken()

    return () => {
      controller.abort()
      document.body.style.overflow = previousOverflow
    }
  }, [open, serverUrl, teamCode, userName])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,186,120,0.12),transparent_55%)]" />

      <div className="relative flex h-full w-full flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Team Room</p>
            <h2 className="text-base font-semibold text-foreground">
              {roomName ?? teamCode ?? "LiveKit Room"}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl border-border" onClick={onClose}>
              <LogOut className="mr-2 h-4 w-4" />
              Leave Room
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close team room">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-5">
          {loading && (
            <div className="flex h-full items-center justify-center rounded-3xl border border-border bg-card/80">
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Connecting your team room...</p>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full items-center justify-center rounded-3xl border border-border bg-card/80 p-6">
              <div className="max-w-md text-center">
                <VideoOff className="mx-auto mb-3 h-7 w-7 text-destructive" />
                <h3 className="text-lg font-semibold text-foreground">Room unavailable</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button className="mt-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && token && serverUrl && (
            <LiveKitRoom
              token={token}
              serverUrl={serverUrl}
              connect={open}
              audio
              video
              className="h-full overflow-hidden rounded-3xl border border-border bg-card/80 shadow-2xl shadow-black/20"
            >
              <RoomAudioRenderer />
              <VideoConference />
            </LiveKitRoom>
          )}
        </div>
      </div>
    </div>
  )
}
