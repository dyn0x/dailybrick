"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, MicOff, Video, VideoOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PreJoinScreenProps {
  userName: string
  onJoin: (options: { audio: boolean; video: boolean }) => void
  isLoading?: boolean
}

export function PreJoinScreen({ userName, onJoin, isLoading = false }: PreJoinScreenProps) {
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [loadingDevices, setLoadingDevices] = useState(true)
  const videoStreamRef = useRef<MediaStream | null>(null)

  const stopVideoStream = () => {
    const stream = videoStreamRef.current
    if (!stream) return

    stream.getTracks().forEach((track) => track.stop())
    videoStreamRef.current = null
    setVideoStream(null)
  }

  // Initialize video preview
  useEffect(() => {
    let isMounted = true

    const initVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        videoStreamRef.current = stream
        setVideoStream(stream)
      } catch (err) {
        console.warn("Could not access camera for preview:", err)
      } finally {
        if (isMounted) {
          setLoadingDevices(false)
        }
      }
    }

    void initVideo()

    return () => {
      isMounted = false
      stopVideoStream()
    }
  }, [])

  // Update video preview with videoEnabled state
  useEffect(() => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        if (track.kind === "video") {
          track.enabled = videoEnabled
        }
      })
    }
  }, [videoEnabled, videoStream])

  const handleJoin = () => {
    stopVideoStream()
    onJoin({ audio: audioEnabled, video: videoEnabled })
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] md:h-[calc(100vh-64px)] flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Video Preview */}
        <div className="relative w-full aspect-video rounded-2xl bg-card border border-border/50 overflow-hidden flex items-center justify-center">
          {videoEnabled && videoStream ? (
            <video
              autoPlay
              muted
              playsInline
              ref={(video) => {
                if (video && videoStream) {
                  video.srcObject = videoStream
                }
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex-col gap-2">
              <VideoOff className="w-12 h-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Camera is off</p>
            </div>
          )}

          {/* User name overlay */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
            <p className="text-sm font-medium text-white">{userName}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {/* Microphone Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
              audioEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-destructive/20 text-destructive hover:bg-destructive/30"
            }`}
            title={audioEnabled ? "Mic on" : "Mic off"}
          >
            {audioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>

          {/* Camera Toggle */}
          <button
            onClick={() => setVideoEnabled(!videoEnabled)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
              videoEnabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-destructive/20 text-destructive hover:bg-destructive/30"
            }`}
            title={videoEnabled ? "Camera on" : "Camera off"}
          >
            {videoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Status Text */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Microphone: <span className="text-foreground font-medium">{audioEnabled ? "On" : "Off"}</span></p>
          <p>Camera: <span className="text-foreground font-medium">{videoEnabled ? "On" : "Off"}</span></p>
        </div>

        {/* Join Button */}
        <Button
          onClick={handleJoin}
          disabled={isLoading}
          size="lg"
          className="w-full rounded-full h-12 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            "Join Now"
          )}
        </Button>
      </div>
    </div>
  )
}
