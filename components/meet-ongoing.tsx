"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react"
import { Button } from "@/components/ui/button"

export function MeetOngoing() {
  const router = useRouter()
  const [session, setSession] = useState<null | { token: string; roomName: string; audio: boolean; video: boolean }>(null)
  const [serverUrl, setServerUrl] = useState<string>("")

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setServerUrl((process.env.NEXT_PUBLIC_LIVEKIT_URL || "").trim())
    try {
      const raw = sessionStorage.getItem("livekit_session")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.token && parsed.roomName) {
          setSession({ token: parsed.token, roomName: parsed.roomName, audio: !!parsed.audio, video: !!parsed.video })
        }
      }
    } catch (err) {
      // ignore
    } finally {
      setLoaded(true)
    }
  }, [])

  const handleLeave = () => {
    try {
      sessionStorage.removeItem("livekit_session")
    } catch {}
    router.push("/meet")
  }

  // Redirect only after initial load to avoid setState during render
  useEffect(() => {
    if (loaded && !session) {
      router.replace("/meet")
    }
  }, [loaded, session, router])
  if (!loaded) {
    return (
      <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Preparing meeting...</p>
      </div>
    )
  }

  if (!session) {
    // loaded but no session -> redirect effect will run; show empty placeholder
    return null
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] relative">
      <LiveKitRoom
        video={session.video}
        audio={session.audio}
        token={session.token}
        serverUrl={serverUrl}
        connectOptions={{ autoSubscribe: true, maxRetries: 0 }}
        options={{ publishDefaults: { simulcast: false } }}
        className="w-full h-full"
      >
        <VideoConference />
        <RoomAudioRenderer />
      </LiveKitRoom>
      <div className="absolute right-4 bottom-4 z-10">
        <Button size="sm" variant="destructive" onClick={handleLeave}>Leave</Button>
      </div>
    </div>
  )
}
