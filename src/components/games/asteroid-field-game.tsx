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
} from "lucide-react";
import useSound from "use-sound";
import { useGoNoGoEngine } from "@/hooks/useGoNoGoEngine"; // Importamos nuestro cerebro

interface AsteroidGameProps {
  config: {
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string; // NUEVO
    missionId: string;
    energyReward: number; // NUEVO
    isPractice?: boolean;
  };
}

export default function AsteroidFieldGame({ config }: AsteroidGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // NUEVO ESTADO
  const router = useRouter(); // NUEVO ROUTER

  // Sonidos
  const [playBackground, { stop: stopBackground }] = useSound(
    "/sounds/ambient-space.mp3",
    { loop: true, volume: 0.3 },
  );
  const [playHit] = useSound("/sounds/laser-shoot.mp3", { volume: 0.5 });
  const [playCrash] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 }); // Volumen más bajo por recomendación clínica
  const [playCombo] = useSound("/sounds/combo-powerup.mp3", { volume: 0.7 });

  // Instanciamos el Motor (Cerebro)
  const engine = useGoNoGoEngine({
    duration: config.duration || 60,
    onHit: (combo) => {
      if (!soundEnabled) return;
      if (combo > 1 && combo % 3 === 0) playCombo();
      else playHit();
    },
    onCrash: () => {
      if (soundEnabled) playCrash();
      // En lugar de inyectar clases al DOM, podríamos usar un estado de 'shake' manejado por framer-motion,
      // pero por ahora mantenemos el visual neutro y sin temblores fuertes.
    },
    onFinish: async (finalScore, telemetry) => {
      stopBackground();
      if (config.isPractice) return;
      console.log(
        "Misión Terminada. Datos Clínicos listos para enviar:",
        telemetry,
      );
      setIsSaving(true); // Mostramos estado de carga

      // 1. Enviamos a la base de datos de Sanity
      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );

      // 2. Redirigimos al cuartel general para ver los cristales!
      router.push("/hq");
      // AQUÍ enviaremos los datos a la Base de Datos en el siguiente paso
    },
  });

  const handleStart = () => {
    if (soundEnabled) playBackground();
    engine.startGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-800 rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          {engine.combo > 1 && (
            <div className="flex items-center gap-2 text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg">
              <Flame className="w-5 h-5 fill-yellow-500" />{" "}
              <span>x{engine.combo}</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-right w-1/3">
          <p className="text-2xl font-mono text-cyan-400">{engine.score}</p>
        </div>
      </div>

      {/* VIEWPORT DEL JUEGO */}
      <div
        onClick={engine.handleAction}
        className="relative h-125 w-full bg-black overflow-hidden rounded-b-xl border-4 border-t-0 border-slate-800 cursor-pointer"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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

        {/* PANTALLAS DE INICIO Y FIN */}
        {engine.gameState !== "playing" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 text-white p-8 text-center">
            {engine.gameState === "finished" ? (
              <div className="space-y-6">
                <h2 className="text-4xl font-bold text-yellow-400">
                  ¡Trayecto Finalizado!
                </h2>
                <p className="text-5xl font-mono text-cyan-300">
                  {engine.score} PTS
                </p>
                <Button
                  onClick={handleStart}
                  className="bg-cyan-600 hover:bg-cyan-500 px-8 py-6 rounded-xl text-lg"
                >
                  <RotateCcw className="mr-2" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Campo de Asteroides</h2>
                <p className="text-slate-300 text-lg max-w-sm mx-auto">
                  Toca rápido si ves{" "}
                  <strong className="text-green-400">VERDE</strong>. <br /> No
                  toques si ves <strong className="text-red-400">ROJO</strong>.
                </p>
                <Button
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-500 px-10 py-6 rounded-xl text-lg w-full"
                >
                  <Play className="mr-2" /> DESPEGAR
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
