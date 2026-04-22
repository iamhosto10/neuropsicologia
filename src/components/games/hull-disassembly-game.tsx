"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Wrench,
  Loader2,
  Zap,
} from "lucide-react";
import useSound from "use-sound";
import { useHullEngine, HullTelemetry } from "@/hooks/useHullEngine";

interface HullGameProps {
  config: {
    title?: string;
    instruction?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
  onFinishMission?: (telemetry: HullTelemetry, score: number) => Promise<void>;
}

export default function HullDisassemblyGame({
  config,
  onFinishMission,
}: HullGameProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-ship.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playClank] = useSound("/sounds/clank.mp3", { volume: 0.8 });
  const [playDrop] = useSound("/sounds/whoosh-metal.mp3", { volume: 0.6 });
  const [playError] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });
  const [playLevelUp] = useSound("/sounds/ui-correct.mp3", { volume: 0.7 });

  const handleGameFinish = async (
    telemetry: HullTelemetry,
    finalScore: number,
  ) => {
    stopBg();
    setIsSaving(true);
    if (onFinishMission) await onFinishMission(telemetry, finalScore);
    setIsSaving(false);
  };

  const {
    gameState,
    timeLeft,
    score,
    currentStage,
    colCount,
    holes,
    plates,
    selectedHole,
    actions,
  } = useHullEngine(config, handleGameFinish);

  const [fallenCount, setFallenCount] = useState(0);
  useEffect(() => {
    const currentFallen = plates.filter((p) => p.isFallen).length;
    if (currentFallen > fallenCount) {
      if (soundEnabled) playDrop();
      if (currentFallen === plates.length && soundEnabled) {
        setTimeout(() => playLevelUp(), 400);
      }
      setFallenCount(currentFallen);
    } else if (currentFallen === 0 && fallenCount > 0) {
      setFallenCount(0);
    }
  }, [plates, fallenCount, soundEnabled, playDrop, playLevelUp]);

  const onHoleClick = (holeId: number) => {
    const hole = holes.find((h) => h.id === holeId);
    if (!hole?.hasBolt && selectedHole !== null) {
      const isCovered = plates.some(
        (p) => !p.isFallen && p.coveredHoles.includes(holeId),
      );
      if (isCovered && soundEnabled) playError();
      else if (soundEnabled) playClank();
    } else if (hole?.hasBolt && soundEnabled) {
      playClank();
    }
    actions.handleHoleClick(holeId);
  };

  useEffect(() => {
    return () => stopBg();
  }, [stopBg]);

  const startGame = () => {
    if (soundEnabled) playBg();
    setFallenCount(0);
    actions.startGame();
  };

  const isLevelCleared = plates.length > 0 && plates.every((p) => p.isFallen);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              const newVal = !soundEnabled;
              setSoundEnabled(newVal);
              if (newVal && gameState === "playing") playBg();
              if (!newVal) stopBg();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div className="hidden sm:block">
            <p className="text-xs text-slate-400 uppercase">Sector</p>
            <p className="text-xl font-bold text-cyan-400">{currentStage}</p>
          </div>
        </div>
        <div className="text-3xl font-mono font-bold text-slate-200 text-center">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>
        <div className="text-right w-1/3">
          <p className="text-xs text-slate-400 uppercase">Puntaje</p>
          <p className="text-2xl font-mono text-cyan-400">{score}</p>
        </div>
      </div>

      <div
        id="hull-viewport"
        className="relative h-150 w-full bg-slate-800 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-700 shadow-2xl flex items-center justify-center p-2 sm:p-4"
        style={{ touchAction: "manipulation" }}
      >
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#475569 2px, transparent 2px)",
            backgroundSize: "30px 30px",
          }}
        />

        <AnimatePresence>
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-100 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white tracking-widest">
                ENVIANDO REPORTE...
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === "playing" ? (
          <div className="relative w-full max-w-112.5 aspect-square bg-slate-900 rounded-3xl border-8 border-slate-950 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]">
            {plates.map((plate) => (
              <motion.div
                key={plate.id}
                initial={{ y: -50, opacity: 0 }}
                animate={
                  plate.isFallen
                    ? { y: 800, opacity: 0, rotate: (Math.random() - 0.5) * 45 }
                    : { y: 0, opacity: 1, rotate: 0 }
                }
                transition={
                  plate.isFallen
                    ? { duration: 0.8, ease: "easeIn" }
                    : { type: "spring", stiffness: 100 }
                }
                className={`absolute rounded-2xl border-2 border-white/30 shadow-[0_15px_35px_rgba(0,0,0,0.6)] ${plate.color} overflow-hidden`}
                style={{
                  left: `${plate.x}%`,
                  top: `${plate.y}%`,
                  width: `${plate.w}%`,
                  height: `${plate.h}%`,
                  zIndex: plate.zIndex,
                }}
              >
                {/* Textura de Metal Rayado */}
                <div
                  className="absolute inset-0 opacity-30 mix-blend-overlay"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.2) 45%, rgba(255,255,255,0.2) 55%, transparent 55%)",
                    backgroundSize: "8px 8px",
                  }}
                />
                <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
              </motion.div>
            ))}

            {/* MATRIZ DINÁMICA DE AGUJEROS (Depende del nivel) */}
            <div
              className={`absolute inset-0 grid z-50`}
              style={{
                gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${colCount}, minmax(0, 1fr))`,
              }}
            >
              {holes.map((hole) => {
                const isSelected = selectedHole === hole.id;
                // El tamaño del tornillo debe ajustarse si hay 25 agujeros en lugar de 16
                const sizeClass =
                  colCount === 5
                    ? "w-8 h-8 sm:w-10 sm:h-10"
                    : "w-10 h-10 sm:w-12 sm:h-12";
                const holeSize =
                  colCount === 5
                    ? "w-5 h-5 sm:w-6 sm:h-6"
                    : "w-6 h-6 sm:w-8 sm:h-8";

                return (
                  <div
                    key={hole.id}
                    className="relative flex items-center justify-center w-full h-full"
                  >
                    <div
                      className={`${holeSize} rounded-full bg-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.8)] border border-white/10`}
                    />
                    <button
                      onClick={() => onHoleClick(hole.id)}
                      disabled={isLevelCleared}
                      className="absolute inset-0 w-full h-full flex items-center justify-center outline-none"
                    >
                      {hole.hasBolt && (
                        <motion.div
                          animate={{ scale: isSelected ? 1.2 : 1 }}
                          className={`${sizeClass} rounded-full border-4 border-slate-900 shadow-xl flex items-center justify-center transition-colors ${isSelected ? "bg-yellow-400 shadow-[0_0_20px_#facc15]" : "bg-slate-300"}`}
                        >
                          <div className="w-3/5 h-1 bg-slate-500/50 absolute rotate-45 rounded-full" />
                          <div className="w-3/5 h-1 bg-slate-500/50 absolute -rotate-45 rounded-full" />
                        </motion.div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <AnimatePresence>
              {isLevelCleared && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute inset-0 z-60 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-green-500/90 backdrop-blur-sm text-white px-8 py-4 rounded-3xl shadow-[0_0_40px_#22c55e] border-2 border-green-300 text-center">
                    <Zap className="w-12 h-12 mx-auto mb-2 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <h3 className="text-2xl font-black uppercase tracking-widest">
                      Sector {currentStage}
                    </h3>
                    <p className="font-bold">¡Despejado!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          !isSaving && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
              {gameState === "finished" ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <h2 className="text-4xl font-bold text-cyan-400">
                    ¡TIEMPO AGOTADO!
                  </h2>
                  <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                    <p className="text-slate-400 mb-2">Puntaje Final</p>
                    <p className="text-5xl font-mono text-cyan-300">{score}</p>
                    <p className="text-sm text-slate-400 mt-4">
                      Sectores completados:{" "}
                      <span className="text-cyan-400 font-bold">
                        {currentStage - 1}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" /> Nueva Sesión
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                    <Wrench className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {config.title || "Desensamblaje del Casco"}
                  </h2>
                  <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                    <p className="text-slate-300 text-sm sm:text-base">
                      Mueve los tornillos a los agujeros vacíos para despejar
                      las placas. ¡Cuidado! Si llenas los agujeros incorrectos,
                      te quedarás atascado.
                    </p>
                    <p className="text-amber-400 font-bold text-sm bg-amber-900/20 p-3 rounded-lg flex gap-2">
                      <Zap className="w-5 h-5 shrink-0" /> Despeja la mayor
                      cantidad de sectores antes de que acabe el tiempo.
                    </p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                  >
                    <Wrench className="mr-2 h-5 w-5" /> INICIAR PROTOCOLO
                  </Button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
