"use client"

import * as React from "react"
import { Maximize2, Minimize2, Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function clock(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00"
  }

  const whole = Math.floor(seconds)
  const minutes = Math.floor(whole / 60)
  const rest = whole % 60

  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const shellRef = React.useRef<HTMLDivElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [fullscreen, setFullscreen] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)

  React.useEffect(() => {
    function onChange() {
      setFullscreen(document.fullscreenElement === shellRef.current)
    }

    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  function togglePlay() {
    const video = videoRef.current
    if (!video) {
      return
    }

    if (video.paused) {
      void video.play()
      return
    }

    video.pause()
  }

  async function enterFullscreen() {
    const shell = shellRef.current
    if (!shell || document.fullscreenElement) {
      return
    }

    await shell.requestFullscreen()
  }

  async function exitFullscreen() {
    if (!document.fullscreenElement) {
      return
    }

    await document.exitFullscreen()
  }

  function seek(next: number) {
    const video = videoRef.current
    if (!video) {
      return
    }

    video.currentTime = next
    setTime(next)
  }

  return (
    <div
      ref={shellRef}
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-md",
        fullscreen && "h-screen max-h-screen rounded-none",
      )}
    >
      <video
        ref={videoRef}
        src={url}
        className={cn(
          "w-full bg-muted",
          fullscreen ? "min-h-0 flex-1 object-contain" : "aspect-video",
        )}
        title={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onClick={togglePlay}
      />
      <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-card p-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(time, duration || 0)}
          aria-label="Video position"
          onChange={(event) => seek(Number(event.target.value))}
          className="h-1 w-full cursor-pointer accent-primary"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            className="size-11 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label={playing ? "Pause" : "Play"}
            onClick={togglePlay}
          >
            {playing ? <Pause className="fill-current" /> : <Play className="fill-current" />}
          </Button>
          <p className="min-w-16 text-sm text-muted-foreground">
            {clock(time)} / {clock(duration)}
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              aria-label="Fullscreen"
              onClick={() => void enterFullscreen()}
              disabled={fullscreen}
            >
              <Maximize2 />
              Fullscreen
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              aria-label="Exit fullscreen"
              onClick={() => void exitFullscreen()}
              disabled={!fullscreen}
            >
              <Minimize2 />
              Minimize
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
