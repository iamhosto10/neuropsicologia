// src/components/games/cargo-laboratory-game.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import {
  PackageSearch,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Copy,
  PlusCircle,
  ServerCrash,
} from "lucide-react";
import useSound from "use-sound";
import { useNBackEngine, DEFAULT_SYMBOLS } from "@/hooks/useNBackEngine";

interface CargoLabProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string; // Podemos usarlas como parte de los símbolos si se suben a Sanity
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
    isPractice?: boolean;
  };
}

export default function CargoLaboratoryGame({ config }: CargoLabProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-ship.mp3", {
    loop: true,
    volume: 0.15,
  });
  const [playGood] = useSound("/sounds/ui-correct.mp3", { volume: 0.6 });
  const [playBad] = useSound("/sounds/ui-error.mp3", { volume: 0.6 });

  // Si en Sanity configuraron imágenes personalizadas, las usamos. Si no, usamos los emojis por defecto.
  const customSymbols = config.distractorImages || [];
  if (config.targetImage) customSymbols.push(config.targetImage);
  const finalSymbols =
    customSymbols.length > 2 ? customSymbols : DEFAULT_SYMBOLS;

  const engine = useNBackEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
    symbols: finalSymbols,
    onPlayGood: () => {
      if (soundEnabled) playGood();
    },
    onPlayBad: () => {
      if (soundEnabled) playBad();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (config.isPractice) return;

      setIsSaving(true); // Candado Visual Activo

      console.log("Telemetría N-Back (Memoria):", telemetry);
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

  // Soporte de teclado (Izquierda = Nuevo, Derecha = Repetido)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.gameState !== "playing") return;
      if (e.code === "ArrowLeft") engine.handleInput("new");
      if (e.code === "ArrowRight") engine.handleInput("match");
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
            Modo: <span className="text-purple-400">{engine.nBack}-Back</span>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 text-2xl font-mono text-cyan-400 font-bold">
          {engine.score} PTS
        </div>
      </div>

      {/* VIEWPORT (DOM ENGINE - SIN LAG) */}
      <div className="relative h-125 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col justify-between">
        {/* Fondo Decorativo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #6366f1 0%, transparent 70%)",
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
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Inspección Completada!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">
                    {engine.score}
                  </p>
                </div>
                <Button
                  onClick={handleStart}
                  disabled={isSaving}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                  <PackageSearch className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold">Laboratorio de Carga</h2>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 text-left space-y-4">
                  <p className="text-slate-300">
                    Aparecerán objetos en la pantalla uno por uno.
                  </p>
                  <div className="flex gap-4 items-center">
                    <Button
                      variant="outline"
                      className="border-cyan-500 text-cyan-400 pointer-events-none shrink-0"
                    >
                      ¡REPETIDO!
                    </Button>
                    <span className="text-sm text-slate-400">
                      Si el objeto es <strong>IGUAL</strong> al que salió justo
                      antes.
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Button
                      variant="outline"
                      className="border-purple-500 text-purple-400 pointer-events-none shrink-0"
                    >
                      NUEVO
                    </Button>
                    <span className="text-sm text-slate-400">
                      Si el objeto es <strong>DIFERENTE</strong> al anterior.
                    </span>
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 w-full rounded-xl"
                >
                  <Play className="mr-2" /> COMENZAR INSPECCIÓN
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full w-full z-10 p-6 pb-12">
            {/* ZONA CENTRAL DE IMAGEN */}
            <div className="flex-1 flex items-center justify-center relative">
              <AnimatePresence mode="wait">
                {engine.currentItem && (
                  <motion.div
                    key={engine.currentItem}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-48 h-48 bg-slate-800/80 border-4 border-slate-600 rounded-3xl flex items-center justify-center shadow-2xl relative"
                  >
                    {/* Feedback Overlay */}
                    {engine.feedback === "hit" && (
                      <div className="absolute -top-4 -right-4 bg-green-500 rounded-full p-2 animate-bounce">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    )}
                    {engine.feedback === "miss" && (
                      <div className="absolute -top-4 -right-4 bg-red-500 rounded-full p-2 animate-bounce">
                        <XCircle className="w-8 h-8 text-white" />
                      </div>
                    )}

                    {/* Renderizado de Imagen o Emoji */}
                    {engine.currentItem.startsWith("http") ||
                    engine.currentItem.startsWith("/") ? (
                      <img
                        src={engine.currentItem}
                        alt="Carga"
                        className="w-32 h-32 object-contain"
                        draggable={false}
                      />
                    ) : (
                      <span className="text-8xl">{engine.currentItem}</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-2 gap-4 mt-8 max-w-md mx-auto w-full">
              <Button
                onClick={() => engine.handleInput("new")}
                className="h-24 text-xl sm:text-2xl font-black bg-slate-800 hover:bg-purple-900 border-b-8 border-purple-700 hover:border-purple-600 text-purple-300 rounded-2xl transition-all active:translate-y-2 active:border-b-0"
              >
                <PlusCircle className="mr-2 w-8 h-8" /> NUEVO
              </Button>
              <Button
                onClick={() => engine.handleInput("match")}
                className="h-24 text-xl sm:text-2xl font-black bg-slate-800 hover:bg-cyan-900 border-b-8 border-cyan-700 hover:border-cyan-600 text-cyan-300 rounded-2xl transition-all active:translate-y-2 active:border-b-0"
              >
                <Copy className="mr-2 w-8 h-8" /> ¡REPETIDO!
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
