// src/components/games/warp-drive-game.tsx
"use client";

import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useState } from "react";
import { useWarpDriveEngine } from "@/hooks/useWarpDriveEngine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Volume2,
  VolumeX,
  ServerCrash,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";
import useSound from "use-sound";

interface WarpDriveGameProps {
  config: {
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
    title?: string;
  };
}

export default function WarpDriveGame({ config }: WarpDriveGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [visualState, setVisualState] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const router = useRouter();

  // Sonidos (Puedes cambiarlos por los tuyos si tienes otros nombres)
  const [playBackground, { stop: stopBackground }] = useSound(
    "/sounds/ambient-space.mp3",
    { loop: true, volume: 0.3 },
  );
  const [playHit] = useSound("/sounds/laser-shoot.mp3", { volume: 0.5 });
  const [playCrash] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });

  // Conectamos el Motor Clínico
  const engine = useWarpDriveEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
  });

  // Efecto manual para guardar (ya que este hook no tiene un onFinish nativo aún)
  if (engine.gameState === "finished" && !isSaving && !config.isPractice) {
    setIsSaving(true);
    stopBackground();

    const telemetry = engine.getTelemetry();
    const earnedCrystals = Math.round(
      (telemetry.accuracyRate / 100) * config.energyReward,
    );

    saveMissionProgress(config.kidId, config.missionId, earnedCrystals, [
      telemetry,
    ]).then(() => {
      router.push("/hq");
    });
  }

  const handleStart = () => {
    if (soundEnabled) playBackground();
    engine.startGame();
  };

  const handleSelectAnswer = (ans: number) => {
    const isCorrect = engine.handleAnswer(ans);

    if (isCorrect) {
      if (soundEnabled) playHit();
      setVisualState("success");
      setTimeout(() => setVisualState("idle"), 300);
    } else {
      if (soundEnabled) playCrash();
      setVisualState("error");
      setTimeout(() => setVisualState("idle"), 400);
    }
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
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 flex justify-end">
          <div className="flex items-center gap-2 bg-slate-800 px-4 py-1 rounded-lg border border-slate-700">
            <Zap className="w-5 h-5 fill-cyan-400 text-cyan-400" />
            <p className="text-2xl font-mono font-bold text-cyan-400">
              {engine.currentScore}
            </p>
          </div>
        </div>
      </div>

      {/* VIEWPORT DEL JUEGO */}
      <div className="relative h-125 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center">
        {/* Efecto visual de fallo (Flash rojo) */}
        <div
          className={`absolute inset-0 bg-red-500/20 pointer-events-none transition-opacity duration-300 ${visualState === "error" ? "opacity-100" : "opacity-0"}`}
        />

        {/* LÓGICA DE RENDERIZADO EXCLUSIVO (Candado Visual) */}
        {isSaving ? (
          <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
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
        ) : engine.gameState === "idle" ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center animate-in fade-in duration-300 pointer-events-auto">
            <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-bold text-white">
                {config.title || "Propulsores Warp"}
              </h2>
              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                <p className="text-slate-300 text-lg mx-auto leading-relaxed">
                  El número del centro es tu núcleo. Súmale la célula que llegue
                  volando y elige el botón correcto para recargar la nave.
                  <br />
                  <strong className="text-cyan-400 mt-2 block">
                    ¡El resultado se convierte en tu nuevo núcleo!
                  </strong>
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-lg px-10 py-6 rounded-xl shadow-[0_0_20px_-5px_#06b6d4] w-full transform hover:scale-105 transition-all"
              >
                <Play className="mr-2 h-5 w-5 fill-white" /> CALIBRAR MOTORES
              </Button>
            </div>
          </div>
        ) : engine.gameState === "finished" && config.isPractice ? (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/80 text-white p-8 text-center animate-in fade-in duration-300 pointer-events-auto">
            <div className="space-y-6 animate-in zoom-in duration-300">
              <h2 className="text-4xl font-bold text-cyan-400">
                ¡Práctica Finalizada!
              </h2>
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                <p className="text-slate-400 mb-2">Aciertos</p>
                <p className="text-5xl font-mono text-cyan-300">
                  {engine.currentScore}
                </p>
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
                className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
              >
                <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
              </Button>
            </div>
          </div>
        ) : (
          /* JUEGO ACTIVO */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 z-10 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-6 justify-center mb-16 mt-8">
              {/* Núcleo Base */}
              <Card
                className={`w-32 h-32 flex items-center justify-center rounded-3xl border-4 transition-all duration-300 ${visualState === "success" ? "bg-cyan-900 border-cyan-400 scale-110 shadow-[0_0_40px_-5px_#22d3ee]" : "bg-slate-900 border-slate-700 shadow-xl"}`}
              >
                <span className="text-7xl font-black text-white">
                  {engine.currentBase}
                </span>
              </Card>

              <span className="text-5xl font-black text-slate-600">+</span>

              {/* Célula Modificadora */}
              <div
                key={engine.currentBase + engine.currentModifier}
                className="w-24 h-24 flex items-center justify-center rounded-full bg-slate-800 border-4 border-purple-500 shadow-[0_0_30px_-5px_#a855f7] animate-in slide-in-from-right-16 fade-in duration-500"
              >
                <span className="text-5xl font-black text-purple-400">
                  {engine.currentModifier}
                </span>
              </div>
            </div>

            {/* Panel de Botones */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mt-auto mb-8">
              {engine.options.map((opt) => (
                <Button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  className={`h-24 text-4xl font-black rounded-2xl border-b-8 transition-all active:scale-95 active:border-b-0 ${
                    visualState === "error"
                      ? "bg-red-900 hover:bg-red-800 text-white border-red-950"
                      : "bg-slate-200 hover:bg-white text-slate-900 border-slate-400 hover:shadow-[0_0_20px_-5px_#fff]"
                  }`}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
