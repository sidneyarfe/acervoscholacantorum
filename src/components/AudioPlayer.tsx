import { useRef, useState, useEffect, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string | null;
  voiceLabel: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

export function AudioPlayer({ audioUrl, voiceLabel }: AudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Detect iOS/Safari for MediaElement backend (fixes OPUS playback)
  const isIOSSafari = () => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
    return isIOS || isSafari;
  };

  const initWaveSurfer = useCallback(() => {
    if (!containerRef.current || !audioUrl) return;

    // Destroy existing instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    setIsLoading(true);

    const useMediaElement = isIOSSafari();
    
    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "hsl(43 74% 62% / 0.4)",
      progressColor: "hsl(43 74% 62%)",
      cursorColor: "hsl(344 56% 56%)",
      cursorWidth: 2,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 48,
      normalize: true,
      ...(useMediaElement && { backend: "MediaElement" as const }),
    });

    wavesurfer.load(audioUrl);

    wavesurfer.on("ready", () => {
      setIsLoading(false);
      setDuration(wavesurfer.getDuration());
      wavesurfer.setPlaybackRate(playbackRate);
    });

    wavesurfer.on("audioprocess", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("seeking", () => {
      setCurrentTime(wavesurfer.getCurrentTime());
    });

    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    wavesurfer.on("error", (e) => {
      console.error("WaveSurfer error:", e);
      setIsLoading(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl, playbackRate]);

  useEffect(() => {
    const cleanup = initWaveSurfer();
    return () => cleanup?.();
  }, [initWaveSurfer]);

  useEffect(() => {
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(playbackRate);
    }
  }, [playbackRate]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIndex]);
  };

  if (!audioUrl) {
    return (
      <div className="h-12 bg-gold/10 rounded-lg flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Nenhum áudio disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{voiceLabel}</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Waveform Container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gold/10 rounded-lg z-10">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "rounded-lg overflow-hidden bg-gold/5",
            isLoading && "opacity-0"
          )}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={cycleSpeed}
          className="rounded-full min-w-[60px]"
        >
          <span className="text-xs font-mono">{playbackRate}x</span>
        </Button>
        
        <Button
          variant="gold"
          size="icon"
          className="w-14 h-14 rounded-full"
          onClick={togglePlayPause}
          disabled={isLoading}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>
        
        <div className="w-[60px]" /> {/* Spacer for symmetry */}
      </div>
    </div>
  );
}
