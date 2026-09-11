"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Sparkles,
  Mic
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string;
  currentTime: number;
  duration?: number;
  isPlaying: boolean;
  activeSegmentText?: string;
  activeSpeaker?: string;
  onPlayPauseToggle: () => void;
  onSeek: (time: number) => void;
  onTimeUpdate: (time: number) => void;
}

export default function AudioPlayer({
  audioUrl = "/audio/sample-meeting.wav",
  currentTime,
  duration: propDuration = 210,
  isPlaying,
  activeSegmentText,
  activeSpeaker,
  onPlayPauseToggle,
  onSeek,
  onTimeUpdate,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const [duration, setDuration] = useState<number>(propDuration);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true); // Voice readout enabled by default
  const lastSpokenTextRef = useRef<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  // Web Audio synth tone fallback generator to guarantee audible sound output
  const triggerAudioBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || ((window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext ?? undefined);
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(320 + (currentTime % 5) * 40, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Ignore audio context autoplay restrictions if unhandled
    }
  }, [currentTime]);

  // Synchronize audio element currentTime when parent props change
  useEffect(() => {
    if (audioRef.current && Math.abs(audioRef.current.currentTime - currentTime) > 0.5) {
      audioRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  // Synchronize play/pause state and TTS Voice Readout
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("HTML5 audio playback notice:", err);
          // Fall back to Web Audio oscillator tone if HTML5 media blocked
          triggerAudioBeep();
        });
      }
    } else {
      audioRef.current.pause();
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    }
  }, [isPlaying, triggerAudioBeep]);

  // Handle TTS Voice Speech Output as active transcript segment changes
  useEffect(() => {
    if (isPlaying && ttsEnabled && activeSegmentText && synthRef.current) {
      if (lastSpokenTextRef.current !== activeSegmentText) {
        lastSpokenTextRef.current = activeSegmentText;
        synthRef.current.cancel(); // stop previous speech line

        const textToSpeak = `${activeSpeaker ? activeSpeaker + " says: " : ""}${activeSegmentText}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = playbackRate;
        utterance.volume = isMuted ? 0 : volume;
        synthRef.current.speak(utterance);

        // Also trigger gentle audio beep for feedback
        triggerAudioBeep();
      }
    }
  }, [isPlaying, activeSegmentText, activeSpeaker, ttsEnabled, playbackRate, volume, isMuted, triggerAudioBeep]);

  // Periodic timeupdate timer for smooth progress scrubbing
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        if (audioRef.current && !audioRef.current.paused) {
          onTimeUpdate(audioRef.current.currentTime);
        } else {
          onTimeUpdate(currentTime + 0.5);
        }
      }, 500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTime, onTimeUpdate]);

  // Change playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Format time MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "00:00";
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleNativeTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    onSeek(newTime);
  };

  const skipSeconds = (secs: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + secs));
    onSeek(newTime);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    if (synthRef.current && isMuted) {
      synthRef.current.cancel();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl">
      {/* HTML5 Audio Element with WAV and MP3 sources */}
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleNativeTimeUpdate}
      >
        <source src={audioUrl} type="audio/wav" />
        <source src={audioUrl.endsWith(".wav") ? audioUrl.replace(/\.wav$/, ".mp3") : "/audio/sample-meeting.mp3"} type="audio/mpeg" />
      </audio>

      <div className="flex flex-col gap-3">
        {/* Top Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Audio Title / Voice Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white">Meeting Voice Audio</p>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                    ttsEnabled
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                  title="Toggle Spoken Text-to-Speech voice output"
                >
                  <Mic className="w-3 h-3" />
                  {ttsEnabled ? "Voice Spoken ON" : "Voice Off"}
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                {isPlaying
                  ? activeSpeaker
                    ? `Playing: ${activeSpeaker}...`
                    : "Playing recording..."
                  : "Click transcript line or play button to listen"}
              </p>
            </div>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            {/* Skip Back -10s */}
            <button
              onClick={() => skipSeconds(-10)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Main Play/Pause Button */}
            <button
              onClick={onPlayPauseToggle}
              className="w-11 h-11 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 transition-all"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            {/* Skip Forward +10s */}
            <button
              onClick={() => skipSeconds(10)}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Controls: Speed & Volume */}
          <div className="flex items-center gap-3">
            {/* Playback Rate selector */}
            <button
              onClick={() => {
                const speeds = [1, 1.25, 1.5, 2];
                const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
                setPlaybackRate(speeds[nextIdx]);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-purple-400 hover:bg-slate-700 transition-colors"
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {/* Volume Control */}
            <div className="hidden sm:flex items-center gap-2">
              <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 accent-purple-500 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Timeline Scrubber Bar */}
        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs font-mono font-medium text-purple-400 min-w-[42px]">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 flex items-center">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.1"
              value={currentTime}
              onChange={handleSliderChange}
              className="w-full h-1.5 accent-purple-500 bg-slate-700 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 min-w-[42px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
