// src/components/games/space-cleanup-game.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Star,
  Zap,
  RotateCcw,
  Play,
  AlertTriangle,
  Volume2,
  VolumeX,
} from "lucide-react";
import useSound from "use-sound";
import { useRouter } from "next/navigation";
import { saveMissionProgress } from "@/app/actions/mission.actions";
import { useSpaceCleanupEngine } from "@/hooks/useSpaceCleanupEngine";

interface SpaceCleanupProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
    kidId: string;
    missionId: string;
    energyReward: number;
  };
}

export default function SpaceCleanupGame({ config }: SpaceCleanupProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-space.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playGood] = useSound("/sounds/laser-shoot.mp3", { volume: 0.4 });
  const [playBad] = useSound("/sounds/error-buzz.mp3", { volume: 0.5 });
  const [playWin] = useSound("/sounds/combo-powerup.mp3", { volume: 0.6 });

  const triggerGlitchEffect = () => {
    const container = document.getElementById("game-viewport");
    if (container) {
      container.classList.add("bg-red-900/50", "animate-shake");
      setTimeout(
        () => container.classList.remove("bg-red-900/50", "animate-shake"),
        200,
      );
    }
  };

  const engine = useSpaceCleanupEngine({
    duration: config.duration || 60,
    difficulty: config.difficulty || "medium",
    targetImage: config.targetImage,
    distractorImages: config.distractorImages,
    onHit: () => {
      if (soundEnabled) playGood();
    },
    onMiss: () => {
      if (soundEnabled) playBad();
    },
    onTriggerGlitch: triggerGlitchEffect,
    onFinish: async (finalScore, telemetry) => {
      stopBg();
      if (soundEnabled && telemetry[0].result === "win") playWin();
      setIsSaving(true);

      // SOLUCIÓN 3: Evitamos enviar 'NaN' a Sanity asegurando un valor numérico
      const baseReward = Number(config.energyReward) || 50;
      const reward =
        telemetry[0].result === "win" ? baseReward : Math.floor(baseReward / 2);

      await saveMissionProgress(
        config.kidId,
        config.missionId,
        reward,
        telemetry,
      );
      router.push("/hq");
    },
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newVal = !prev;
      if (newVal && engine.gameState === "playing") playBg();
      if (!newVal) stopBg();
      return newVal;
    });
  };

  const handleStart = () => {
    if (soundEnabled) playBg();
    engine.startGame();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      <div
        className={`flex justify-between items-center bg-slate-900 p-4 rounded-t-xl border-b-4 transition-colors duration-300 shadow-lg ${engine.energy < 30 ? "border-red-600" : "border-cyan-600"}`}
      >
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={toggleSound}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors hidden sm:block shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div className="flex items-center gap-2 w-full">
            <Zap
              className={`w-5 h-5 ${engine.energy < 30 ? "text-red-500 fill-red-500 animate-pulse" : "text-yellow-400 fill-yellow-400"}`}
            />
            <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
              <div
                className={`h-full transition-all duration-300 ${engine.energy < 30 ? "bg-red-500" : "bg-yellow-400"}`}
                style={{ width: `${engine.energy}%` }}
              />
            </div>
          </div>
        </div>
        <div className="text-3xl font-bold font-mono text-slate-200">
          {engine.timeLeft}s
        </div>
        <div className="text-xl font-mono text-cyan-400 w-1/3 text-right">
          PTS: {engine.score}
        </div>
      </div>

      <div
        id="game-viewport"
        className="relative h-[500px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
        }}
      >
        {isSaving && (
          <div className="absolute inset-0 z-[110] bg-black/80 flex items-center justify-center backdrop-blur-sm">
            <p className="text-cyan-400 font-bold text-2xl animate-pulse">
              Sincronizando Bitácora...
            </p>
          </div>
        )}

        {engine.gameState !== "playing" && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm text-white p-8 text-center animate-in fade-in duration-300">
            {engine.gameState === "finished" ? (
              <div className="space-y-6">
                {engine.gameResult === "win" ? (
                  <>
                    <h2 className="text-4xl font-bold text-yellow-400 animate-bounce">
                      ¡Misión Cumplida!
                    </h2>
                    <p className="text-xl text-slate-300">
                      Has recolectado suficiente energía.
                    </p>
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-yellow-500/30">
                      <p className="text-slate-400 uppercase text-sm tracking-wider mb-2">
                        Puntaje Final
                      </p>
                      <p className="text-5xl font-mono font-bold text-cyan-300">
                        {engine.score}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500">
                      <AlertTriangle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-4xl font-bold text-red-500">
                      Misión Abortada
                    </h2>
                    <p className="text-xl text-slate-300 max-w-md">
                      La nave se quedó sin energía.
                    </p>
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-red-900/50">
                      <p className="text-slate-400 text-sm">
                        Puntaje alcanzado: {engine.score}
                      </p>
                    </div>
                  </>
                )}
                <Button
                  onClick={handleStart}
                  size="lg"
                  className={`text-lg px-8 py-6 rounded-xl shadow-lg group transition-all ${engine.gameResult === "win" ? "bg-cyan-600 hover:bg-cyan-500" : "bg-red-600 hover:bg-red-500"}`}
                >
                  <RotateCcw className="mr-2 h-5 w-5 group-hover:-rotate-180 transition-transform" />{" "}
                  Intentar de Nuevo
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg">
                <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                  {config.targetImage ? (
                    <img
                      src={config.targetImage}
                      alt="Objetivo"
                      className="w-16 h-16 object-contain"
                    />
                  ) : (
                    <Star className="w-10 h-10 text-cyan-400" />
                  )}
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Operación Limpieza"}
                </h2>
                <p className="text-lg text-slate-300">
                  {config.instruction ||
                    "Haz clic solo en los objetivos azules."}
                </p>
                <div className="flex gap-4 justify-center text-sm text-slate-400 bg-slate-900/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    {config.targetImage ? (
                      <img
                        src={config.targetImage}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Star className="w-6 h-6 text-cyan-400" />
                    )}{" "}
                    +Puntos
                  </div>
                  <div className="flex items-center gap-2">
                    {config.distractorImages &&
                    config.distractorImages.length > 0 ? (
                      <img
                        src={config.distractorImages[0]}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Trash2 className="w-6 h-6 text-red-400" />
                    )}{" "}
                    -Energía
                  </div>
                </div>
                <Button
                  onClick={handleStart}
                  size="lg"
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl animate-pulse"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" /> INICIAR MISIÓN
                </Button>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {engine.items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ top: -80, left: `${item.x}%`, rotate: item.rotation }}
              animate={{ top: "120%", rotate: item.rotation + 180 }}
              transition={{ duration: item.speed, ease: "linear" }}
              onAnimationComplete={() => engine.removeItem(item.id)}
              onPointerDown={() => engine.handleInteraction(item)}
              className="absolute w-20 h-20 flex items-center justify-center focus:outline-none touch-none select-none z-10"
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform active:scale-95 transition-transform overflow-hidden ${item.type === "target" ? "bg-cyan-500/20 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-red-500/20 border-2 border-red-500/50"}`}
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.type}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                ) : item.type === "target" ? (
                  <Star className="w-8 h-8 text-cyan-200 fill-cyan-400" />
                ) : (
                  <Trash2 className="w-8 h-8 text-red-400" />
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>

        <div
          className="absolute inset-0 pointer-events-none opacity-20 z-0"
          style={{
            backgroundImage: "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>
    </div>
  );
}
