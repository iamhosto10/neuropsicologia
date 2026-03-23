"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Headphones, Play, Pause, Loader2 } from "lucide-react";

interface AudioPlayerBlockProps {
  title: string;
  audioUrl: string;
}

export default function AudioPlayerBlock({
  title,
  audioUrl,
}: AudioPlayerBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#3b82f6",
      barWidth: 4,
      barGap: 3,
      barRadius: 4,
      height: 60,
      url: audioUrl,
      cursorColor: "transparent",
    });

    wavesurferRef.current = wavesurfer;

    wavesurfer.on("ready", () => setIsReady(true));
    wavesurfer.on("play", () => setIsPlaying(true));
    wavesurfer.on("pause", () => setIsPlaying(false));
    wavesurfer.on("finish", () => setIsPlaying(false));

    return () => {
      wavesurfer.destroy();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <Card className="my-12 overflow-hidden rounded-3xl border-slate-100 shadow-md">
      <CardHeader className="bg-blue-50 p-5 flex flex-row items-center gap-3 border-b border-blue-100 space-y-0">
        <div className="bg-white p-2 rounded-full shadow-sm">
          <Headphones className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-black text-blue-900 m-0">{title}</h3>
      </CardHeader>

      <CardContent className="p-6 md:p-8 bg-white flex flex-col sm:flex-row items-center gap-6">
        <button
          onClick={togglePlay}
          disabled={!isReady}
          className="w-16 h-16 shrink-0 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isReady ? (
            <Loader2 className="w-8 h-8 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-8 h-8 fill-current" />
          ) : (
            <Play className="w-8 h-8 fill-current ml-1" />
          )}
        </button>

        <div className="flex-1 w-full">
          <div ref={containerRef} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
