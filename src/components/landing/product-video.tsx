"use client";

import { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  TrendingUp,
  Receipt,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function ProductVideo({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(29.6);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleToggleMute = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!videoRef.current) return;
    const nextMuted = !videoRef.current.muted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && !isPlaying) {
      videoRef.current.play().then(() => setIsPlaying(true));
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || 29.6;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 29.6);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = Math.max(0, Math.min(pos * (videoRef.current.duration || 29.6), videoRef.current.duration || 29.6));
    videoRef.current.currentTime = newTime;
    setProgress(pos * 100);
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    const el = videoRef.current?.parentElement;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl overflow-hidden border border-border/80 dark:border-white/10 bg-black shadow-2xl shadow-emerald-950/20 group w-full ${className}`}
    >
      {/* Video Element (Autoplays muted on loop) */}
      <div
        className="relative aspect-video w-full cursor-pointer select-none bg-black flex items-center justify-center"
        onClick={handlePlayPause}
      >
        <video
          ref={videoRef}
          src="/HSA.mp4"
          poster="/brag.jpg"
          preload="auto"
          autoPlay
          muted
          loop
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          className="w-full h-full object-cover"
          aria-label="HSA Plus 30-second product film"
        />

        {/* Minimal Center Pause Indicator (only shown when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center transition-opacity">
            <div className="h-16 w-16 rounded-full bg-[#059669]/90 text-white flex items-center justify-center shadow-xl transform transition-transform hover:scale-105 active:scale-95">
              <Play className="h-7 w-7 text-white translate-x-0.5" />
            </div>
          </div>
        )}

        {/* Floating Sound Toggle Pill (Top-Right) */}
        <div className="absolute top-3.5 right-3.5 z-20 pointer-events-auto">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 hover:bg-black/90 text-white text-xs font-medium border border-white/15 backdrop-blur-md shadow-lg transition-all active:scale-95"
            aria-label={isMuted ? "Unmute video audio" : "Mute video audio"}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] font-mono text-white/90">Sound off</span>
              </>
            ) : (
              <>
                <Volume2 className="h-3.5 w-3.5 text-[#34d399]" />
                <span className="text-[11px] font-mono text-[#34d399]">Sound on</span>
              </>
            )}
          </button>
        </div>

        {/* Floating Bottom Minimal Controls (fades in on hover or when paused) */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-200 z-20 ${
            isHovered || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="relative h-1 w-full bg-white/25 hover:h-2 rounded-full cursor-pointer mb-2.5 transition-all group/bar"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-label="Seek video"
          >
            <div
              className="h-full bg-gradient-to-r from-[#059669] to-[#34d399] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between text-white text-xs px-1">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePlayPause}
                className="p-1 rounded hover:bg-white/15 transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>

              <button
                onClick={handleToggleMute}
                className="p-1 rounded hover:bg-white/15 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-amber-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#34d399]" />
                )}
              </button>

              <span className="font-mono text-[11px] text-white/75">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button
              onClick={handleToggleFullscreen}
              className="p-1 rounded hover:bg-white/15 transition-colors"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StoryMechanic({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-card/70 p-6 md:p-8 shadow-surface ${className}`}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-[#E2E8F0] dark:border-white/10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#059669] uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Why delay reimbursements?
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0C1220] dark:text-white">
            How a $340 doctor visit turns into $1,316
          </h3>
          <p className="mt-2 text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed">
            Say you pay a $340 doctor bill with your regular credit card. If you withdraw that $340 from your HSA right away, that money stops working for you. But if you keep the receipt in HSA Plus and leave the $340 invested, it can grow into{" "}
            <strong className="text-[#0C1220] dark:text-white font-semibold">
              $1,316 over 20 years
            </strong>
            . You can still withdraw your original $340 tax-free whenever you want.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 bg-[#059669]/[0.06] dark:bg-[#059669]/15 border border-[#059669]/20 dark:border-[#059669]/30 rounded-xl px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-[#059669] dark:text-[#34d399]" />
          <div className="text-left">
            <div className="text-[11px] font-mono text-[#059669] dark:text-[#34d399] font-medium uppercase tracking-wider">
              IRS Rule
            </div>
            <div className="text-xs font-semibold text-[#0C1220] dark:text-white">
              No expiration on claims
            </div>
          </div>
        </div>
      </div>

      {/* 3-Step Strategy Flow */}
      <div className="grid sm:grid-cols-3 gap-5 pt-6">
        {/* Card 1 */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-[#FAFAF8] dark:bg-white/[0.03] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-[#64748B] dark:text-slate-400">
                STEP 01
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Paid out of pocket
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold font-mono text-[#0C1220] dark:text-white">
                $340
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                doctor copay or bill
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Pay with your regular credit card. Keep the receipt and hold off on taking money out of your HSA.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-white/10 flex items-center text-[11px] text-[#64748B] dark:text-slate-400">
            <Receipt className="h-3.5 w-3.5 mr-1.5 text-[#059669] dark:text-[#34d399]" />
            Save receipt in HSA Plus
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border-2 border-[#059669]/30 dark:border-[#059669]/40 bg-[#059669]/[0.02] dark:bg-[#059669]/10 p-5 flex flex-col justify-between relative shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-[#059669] dark:text-[#34d399]">
                STEP 02
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#059669]/15 text-[#059669] dark:text-[#34d399]">
                20 yrs at 7%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold font-mono text-[#059669] dark:text-[#34d399]">
                +$976
              </span>
              <span className="text-xs text-[#64748B] dark:text-slate-400">
                growth earned
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Your $340 stays invested in your HSA index funds, compounding tax-free over time into $1,316.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#059669]/20 flex items-center text-[11px] text-[#059669] dark:text-[#34d399] font-medium">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
            Compounding tax-free in your account
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-white/10 bg-[#FAFAF8] dark:bg-white/[0.03] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-[#64748B] dark:text-slate-400">
                STEP 03
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#059669]/15 text-[#059669] dark:text-[#34d399]">
                Tax-free withdrawal
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold font-mono text-[#0C1220] dark:text-white">
                $340 + $976
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 leading-relaxed">
              Pull out your $340 tax-free whenever you need cash. The $976 it earned stays invested.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-white/10 flex items-center text-[11px] text-[#059669] dark:text-[#34d399] font-medium">
            <ArrowRight className="h-3.5 w-3.5 mr-1.5" />
            Reimburse anytime in one click
          </div>
        </div>
      </div>
    </div>
  );
}
