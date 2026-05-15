"use client"

import { useEffect, useState } from "react"
import { Loader2, LogOut } from "lucide-react"
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  VideoTrack,
  RoomAudioRenderer,
  ControlBar,
  TrackRefContext,
  useTracks,
  LayoutContextProvider,
  useCreateLayoutContext,
} from "@livekit/components-react"
import { isTrackReference } from "@livekit/components-core"
import { Track, RoomEvent } from "livekit-client"
import { Button } from "@/components/ui/button"
import { PreJoinScreen } from "@/components/meet-prejoin"

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

function MeetingStage() {
  const layoutContext = useCreateLayoutContext()
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    {
      onlySubscribed: false,
      updateOnlyOn: [RoomEvent.ActiveSpeakersChanged],
    },
  )

  // Custom participant tile ensures consistent placeholder sizing when camera is off
  function ParticipantTileWrapper({ trackRef }: { trackRef: any }) {
    // If it's a real track reference with a video publication and not muted, render VideoTrack
    const showVideo = isTrackReference(trackRef) && trackRef.publication && trackRef.publication.kind === 'video' && !trackRef.publication.isMuted

    return (
      <div className="meet-tile h-full w-full overflow-hidden rounded-[24px] border border-white/8 bg-black/80 shadow-[0_8px_24px_rgba(0,0,0,0.3)] flex items-stretch">
        {showVideo ? (
          <VideoTrack trackRef={trackRef} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black text-white">
            <div className="flex flex-col items-center justify-center gap-3 w-full h-full">
              <div className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-neutral-600/80" />
              <div className="absolute left-4 bottom-4 px-3 py-1.5 rounded-lg bg-black/60">
                <p className="text-sm text-white">Manas</p>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <LayoutContextProvider value={layoutContext} onWidgetChange={() => {}}>
      <div className="flex h-full min-h-0 flex-col bg-[#121212] text-white">
        <div className="flex-1 min-h-0 p-4 md:p-5">
          <div className="meet-stage-shell h-full overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,_rgba(74,144,226,0.16),_transparent_42%),linear-gradient(180deg,_rgba(255,255,255,0.04),_rgba(255,255,255,0.01))] shadow-[0_24px_90px_rgba(0,0,0,0.35)]">
            <GridLayout tracks={tracks} className="meet-grid h-full w-full p-3 md:p-4">
              <TrackRefContext.Consumer>
                {(trackRef) => trackRef && <ParticipantTileWrapper trackRef={trackRef} />}
              </TrackRefContext.Consumer>
            </GridLayout>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 pb-5 pt-2 md:pb-6">
          <div className="meet-control-dock flex flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a]/95 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <ControlBar
              variation="minimal"
              controls={{ microphone: true, camera: true, screenShare: true, chat: true, leave: true, settings: false }}
              className="meet-control-bar"
            />
          </div>
        </div>

        <RoomAudioRenderer />
      </div>
    </LayoutContextProvider>
  )
}

export function MeetPage({ userName, teamCode, onBack }: MeetPageProps) {
  const [stage, setStage] = useState<"prejoin" | "connecting" | "joined">("prejoin")
  const [token, setToken] = useState<string | null>(null)
  const [roomName, setRoomName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)

  const serverUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL?.trim() ?? ""

  const resetToWaitingRoom = () => {
    setStage("prejoin")
    setToken(null)
    setRoomName(null)
    setError(null)
    setAudioEnabled(true)
    setVideoEnabled(true)
  }

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
      setStage("joined")
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
        isLoading={false}
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
              resetToWaitingRoom()
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

  return (
    <LiveKitRoom
      video={videoEnabled}
      audio={audioEnabled}
      token={token}
      serverUrl={serverUrl}
      onDisconnected={resetToWaitingRoom}
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
      <MeetingStage />
    </LiveKitRoom>
  )
}
