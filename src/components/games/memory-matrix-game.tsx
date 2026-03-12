// src/components/games/memory-matrix-game.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Lock,
  Unlock,
  ShieldAlert,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Grid3X3,
} from "lucide-react";
import useSound from "use-sound";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useMemoryEngine } from "@/hooks/useMemoryEngine";

interface MemoryGameProps {
  config: {
    title?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string; // Requerido para guardar datos
    missionId: string; // Requerido para marcar completada
    energyReward: number; // Requerido para la recompensa
  };
}

export default function MemoryMatrixGame({ config }: MemoryGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);
  const router = useRouter();

  // Sonidos
  const [playBg, { stop: stopBg }] = useSound("/sounds/bg-tech.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playLight] = useSound("/sounds/beep-light.mp3", { volume: 0.6 });
  const [playPress] = useSound("/sounds/beep-press.mp3", { volume: 0.8 });
  const [playGranted] = useSound("/sounds/access-granted.mp3", { volume: 0.7 });
  const [playDenied] = useSound("/sounds/access-denied.mp3", { volume: 0.7 });
  const [playVoiceDirect] = useSound("/sounds/voice-direct.mp3", {
    volume: 0.8,
  });
  const [playVoiceReverse] = useSound("/sounds/voice-reverse.mp3", {
    volume: 0.8,
  });

  const engine = useMemoryEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
    onLightUp: () => {
      if (soundEnabled) playLight();
    },
    onPlayVoice: (isReverse) => {
      if (soundEnabled) isReverse ? playVoiceReverse() : playVoiceDirect();
    },
    onPress: () => {
      if (soundEnabled) playPress();
    },
    onFeedback: (success) => {
      setFeedbackSuccess(success);
      if (soundEnabled) success ? playGranted() : playDenied();
      if (!success) triggerShake();
    },
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      setIsSaving(true);
      console.log("Telemetría Clínica (Memoria):", telemetry);
      await saveMissionProgress(
        config.kidId,
        config.missionId,
        config.energyReward,
        telemetry,
      );
      router.push("/hq");
    },
  });

  const triggerShake = () => {
    const container = document.getElementById("security-panel");
    if (container) {
      container.classList.add("animate-shake", "bg-red-900/30");
      setTimeout(
        () => container.classList.remove("animate-shake", "bg-red-900/30"),
        500,
      );
    }
  };

  const handleStart = () => {
    if (soundEnabled) playBg();
    engine.startGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div className="text-sm font-mono text-slate-400 uppercase hidden sm:block">
            Nivel:{" "}
            <span className="text-cyan-400 font-bold">
              {engine.securityLevel}
            </span>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          00:{(engine.timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3">
          <div className="text-2xl font-mono text-cyan-400">{engine.score}</div>
        </div>
      </div>

      {/* VIEWPORT PRINCIPAL */}
      <div
        id="security-panel"
        className="relative min-h-[600px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-4"
      >
        {isSaving && (
          <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <p className="text-cyan-400 font-bold text-2xl animate-pulse">
              Guardando Progreso...
            </p>
          </div>
        )}

        {engine.gameState === "playing" ? (
          <div className="w-full flex flex-col items-center">
            {/* INSTRUCCIÓN DINÁMICA */}
            <div className="h-16 mb-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {engine.phase === "showing" && (
                  <motion.div
                    key="showing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <p
                      className={`text-2xl font-bold uppercase animate-pulse ${engine.isReverse ? "text-purple-400" : "text-cyan-400"}`}
                    >
                      {engine.isReverse
                        ? "MEMORIZA (INVERSO)"
                        : "MEMORIZA PATRÓN"}
                    </p>
                  </motion.div>
                )}
                {engine.phase === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-500 text-xl flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" /> PROCESANDO...
                  </motion.div>
                )}
                {engine.phase === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p
                      className={`text-2xl font-bold uppercase ${engine.isReverse ? "text-purple-400" : "text-green-400"}`}
                    >
                      {engine.isReverse
                        ? "¡INGRESA AL REVÉS!"
                        : "¡INGRESA CÓDIGO!"}
                    </p>
                    <div className="flex gap-2 justify-center mt-2">
                      {Array.from({ length: engine.currentLengthUI }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < engine.userStepIndex ? "bg-green-400" : "bg-slate-700"}`}
                          />
                        ),
                      )}
                    </div>
                  </motion.div>
                )}
                {engine.phase === "feedback" && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    {/* 👇 AQUÍ USAMOS NUESTRO NUEVO ESTADO 👇 */}
                    {feedbackSuccess ? (
                      <p className="text-3xl font-bold text-green-400 flex items-center gap-2">
                        <Unlock className="w-8 h-8" /> ACCESO CONCEDIDO
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-red-500 flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8" /> ACCESO DENEGADO
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MATRIZ 3x3 */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 z-10 p-6 bg-slate-900/50 rounded-3xl border border-slate-700">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                const isActive = engine.activeButton === index;
                const glowColor = engine.isReverse
                  ? "shadow-[0_0_30px_#c084fc] bg-purple-500 border-purple-300"
                  : "shadow-[0_0_30px_#22d3ee] bg-cyan-400 border-cyan-200";

                return (
                  <motion.button
                    key={index}
                    whileTap={engine.phase === "input" ? { scale: 0.9 } : {}}
                    onClick={() => engine.handleInput(index)}
                    disabled={engine.phase !== "input"}
                    className={`w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 transition-all duration-150
                      ${isActive ? glowColor : "bg-slate-800 border-slate-700"}
                      ${engine.phase === "input" ? "cursor-pointer hover:bg-slate-700" : "cursor-default"}`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-8 text-center text-white">
            <div className="space-y-6 max-w-lg">
              <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                <Grid3X3 className="w-12 h-12 text-cyan-400" />
              </div>
              <h2 className="text-3xl font-bold">
                {config.title || "Panel de Seguridad"}
              </h2>
              <p className="text-slate-300">
                Observa la secuencia y repítela. ¡Cuidado si te piden ingresarla
                al revés!
              </p>
              <Button
                onClick={handleStart}
                className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 w-full rounded-xl"
              >
                <Play className="mr-2" /> HACKEAR PANEL
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
