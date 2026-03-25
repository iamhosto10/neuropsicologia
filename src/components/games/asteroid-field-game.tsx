// src/components/games/asteroid-field-game.tsx
"use client";

import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Zap,
  AlertTriangle,
  RotateCcw,
  Play,
  Hexagon,
  Flame,
  Volume2,
  VolumeX,
  ServerCrash,
} from "lucide-react";
import useSound from "use-sound";
import { useGoNoGoEngine } from "@/hooks/useGoNoGoEngine";

interface AsteroidGameProps {
  config: {
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function AsteroidFieldGame({ config }: AsteroidGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBackground, { stop: stopBackground }] = useSound(
    "/sounds/ambient-space.mp3",
    { loop: true, volume: 0.3 },
  );
  const [playHit] = useSound("/sounds/laser-shoot.mp3", { volume: 0.5 });
  const [playCrash] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });
  const [playCombo] = useSound("/sounds/combo-powerup.mp3", { volume: 0.7 });

  const engine = useGoNoGoEngine({
    duration: config.duration || 60,
    onHit: (combo) => {
      if (!soundEnabled) return;
      if (combo > 1 && combo % 3 === 0) playCombo();
      else playHit();
    },
    onCrash: () => {
      if (soundEnabled) playCrash();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBackground();
      if (config.isPractice) return;

      // 🔥 Candado Visual INMEDIATO
      setIsSaving(true);

      console.log("Telemetría Resumida Go/No-Go:", telemetry);

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
    if (soundEnabled) playBackground();
    engine.startGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center z-20 relative shadow-lg">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (soundEnabled) stopBackground();
              else if (engine.gameState === "playing") playBackground();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          {engine.combo > 1 && (
            <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg border border-yellow-600/50">
              <Flame className="w-5 h-5 fill-yellow-500" />{" "}
              <span>x{engine.combo}</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-right w-1/3">
          <p className="text-2xl font-mono text-cyan-400">{engine.score} PTS</p>
        </div>
      </div>

      {/* VIEWPORT DEL JUEGO */}
      <div
        onClick={engine.handleAction}
        className="relative h-125 w-full bg-black overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 cursor-pointer shadow-2xl"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <AnimatePresence mode="wait">
            {engine.currentStimulus === "go" && (
              <motion.div
                key="go"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="relative"
              >
                <div className="w-56 h-56 rounded-full border-12 border-green-500 flex items-center justify-center bg-green-900/20 shadow-[0_0_50px_#22c55e]">
                  <Hexagon className="w-28 h-28 text-green-400" />
                </div>
                <p className="absolute -bottom-16 w-full text-center text-green-400 font-bold text-3xl">
                  ¡YA!
                </p>
              </motion.div>
            )}

            {engine.currentStimulus === "no-go" && (
              <motion.div
                key="nogo"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                className="relative"
              >
                <div className="w-56 h-56 rounded-full border-12 border-red-500 flex items-center justify-center bg-red-900/20 shadow-[0_0_50px_#ef4444]">
                  <AlertTriangle className="w-28 h-28 text-red-500" />
                </div>
                <p className="absolute -bottom-16 w-full text-center text-red-500 font-bold text-3xl">
                  ¡ALTO!
                </p>
              </motion.div>
            )}

            {engine.currentStimulus === "feedback-hit" && (
              <motion.div
                key="hit"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-cyan-400 font-bold text-6xl border-4 border-cyan-400 p-4 rounded-xl bg-slate-900/80">
                  BIEN
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🔥 LA LÓGICA DE RENDERIZADO EXCLUSIVO (Candado Visual) */}
        {isSaving ? (
          <div className="absolute inset-0 z-100 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
            <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <ServerCrash className="w-12 h-12 text-cyan-400 animate-pulse" />
            </div>
            <p className="text-cyan-400 font-bold text-3xl animate-pulse tracking-widest text-center">
              Guardando Progreso...
            </p>
            <p className="text-slate-400 mt-4 text-sm font-mono uppercase text-center">
              Sincronizando Bitácora Clínica.
            </p>
          </div>
        ) : engine.gameState !== "playing" ? (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-8 text-center animate-in fade-in duration-300 pointer-events-auto">
            {engine.gameState === "finished" ? (
              <div className="space-y-6 animate-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Trayecto Finalizado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">
                    {engine.score}
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStart();
                  }}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl disabled:opacity-50"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-bold text-white">
                  Campo de Asteroides
                </h2>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                  <p className="text-slate-300 text-lg mx-auto">
                    Toca rápido si ves{" "}
                    <strong className="text-green-400">VERDE</strong>.<br />
                    <br />
                    No toques si ves{" "}
                    <strong className="text-red-400">ROJO</strong>.
                  </p>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStart();
                  }}
                  disabled={isSaving}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Play className="mr-2 h-5 w-5" /> DESPEGAR
                </Button>
                <p className="text-xs text-slate-500">
                  Puedes usar el mouse, pantalla táctil o la barra espaciadora.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
