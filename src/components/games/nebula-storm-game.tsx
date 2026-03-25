// src/components/games/nebula-storm-game.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import {
  Rocket,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  ServerCrash,
  ArrowLeft,
  ArrowRight,
  Target,
} from "lucide-react";
import useSound from "use-sound";
import { useFlankerEngine } from "@/hooks/useFlankerEngine";

interface NebulaStormProps {
  config: {
    title?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function NebulaStormGame({ config }: NebulaStormProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-space.mp3", {
    loop: true,
    volume: 0.15,
  });
  const [playGood] = useSound("/sounds/laser-shoot.mp3", { volume: 0.5 });
  const [playBad] = useSound("/sounds/error-buzz.mp3", { volume: 0.5 });

  const engine = useFlankerEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
    onPlayGood: () => {
      if (soundEnabled) playGood();
    },
    onPlayBad: () => {
      if (soundEnabled) playBad();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (config.isPractice) return;

      setIsSaving(true);

      console.log("Telemetría Flanker (Nebulosa):", telemetry);
      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );
      router.push("/hq");
    },
  });

  const handleStart = () => {
    if (soundEnabled) playBg();
    engine.startGame();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.gameState !== "playing") return;
      if (e.code === "ArrowLeft") engine.handleInput("left");
      if (e.code === "ArrowRight") engine.handleInput("right");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [engine]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled) stopBg();
              else if (engine.gameState === "playing") playBg();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div className="text-xs font-bold text-slate-400 uppercase hidden sm:block">
            Combo:{" "}
            <span className="text-yellow-400 font-bold x">{engine.combo}</span>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 text-2xl font-mono text-cyan-400 font-bold">
          {engine.score} PTS
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="relative h-125 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Fondo Nebulosa */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at center, #3b0764 0%, #020617 80%)",
          }}
        />

        {isSaving ? (
          <div className="absolute inset-0 z-100 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <ServerCrash className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest text-center">
              Sincronizando Bitácora...
            </p>
          </div>
        ) : engine.gameState !== "playing" ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-white">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-purple-400">
                  ¡Nebulosa Atravesada!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-purple-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-purple-300">
                    {engine.score}
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-purple-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-purple-500/50">
                  <Target className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-3xl font-bold">Tormenta de Nebulosa</h2>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-left space-y-4">
                  <p className="text-slate-300 text-center text-lg mb-4">
                    Mira SOLO a la nave del centro.
                  </p>
                  <div className="flex gap-4 justify-center items-center text-purple-400">
                    <Rocket className="w-8 h-8 -rotate-90 opacity-50" />
                    <Rocket className="w-8 h-8 -rotate-90 opacity-50" />
                    <Rocket className="w-12 h-12 rotate-90 text-cyan-400" />{" "}
                    {/* La del centro es el objetivo */}
                    <Rocket className="w-8 h-8 -rotate-90 opacity-50" />
                    <Rocket className="w-8 h-8 -rotate-90 opacity-50" />
                  </div>
                  <p className="text-slate-400 text-center text-sm mt-4">
                    Ignora las naves de los lados. Indica la dirección de la
                    nave central (Izquierda o Derecha).
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 w-full rounded-xl"
                >
                  <Play className="mr-2" /> ENTRAR A LA NEBULOSA
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full z-10 p-6 pb-12">
            {/* ZONA DE NAVES */}
            <div className="flex-1 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {engine.currentFleet && !engine.feedback && (
                  <motion.div
                    key={engine.currentFleet.join("-")}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="flex gap-2 sm:gap-6 items-center bg-slate-900/50 p-6 rounded-full border border-slate-700 shadow-2xl"
                  >
                    {engine.currentFleet.map((dir, idx) => {
                      const isCenter = idx === 2;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center justify-center ${isCenter ? "bg-purple-500/20 p-4 rounded-full border-2 border-purple-400 shadow-[0_0_20px_#a855f7]" : ""}`}
                        >
                          <Rocket
                            className={`transition-transform duration-200 
                                ${dir === "left" ? "-rotate-90" : "rotate-90"} 
                                ${isCenter ? "w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" : "w-10 h-10 sm:w-12 sm:h-12 text-slate-500"}`}
                          />
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback Rápido */}
              {engine.feedback && (
                <div
                  className={`absolute text-6xl font-black ${engine.feedback === "hit" ? "text-green-400" : "text-red-500"}`}
                >
                  {engine.feedback === "hit" ? "¡BIEN!" : "¡ERROR!"}
                </div>
              )}
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto w-full">
              <Button
                onClick={() => engine.handleInput("left")}
                className="h-24 text-xl sm:text-2xl font-black bg-slate-800 hover:bg-purple-900 border-b-8 border-purple-700 hover:border-purple-600 text-purple-300 rounded-2xl transition-all active:translate-y-2 active:border-b-0"
              >
                <ArrowLeft className="mr-2 w-8 h-8" /> IZQ
              </Button>
              <Button
                onClick={() => engine.handleInput("right")}
                className="h-24 text-xl sm:text-2xl font-black bg-slate-800 hover:bg-cyan-900 border-b-8 border-cyan-700 hover:border-cyan-600 text-cyan-300 rounded-2xl transition-all active:translate-y-2 active:border-b-0"
              >
                DER <ArrowRight className="ml-2 w-8 h-8" />
              </Button>
            </div>
            <p className="text-center mt-6 text-slate-500 font-bold uppercase tracking-widest text-sm hidden sm:block">
              USA LAS FLECHAS ⬅️ ➡️ DEL TECLADO
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
