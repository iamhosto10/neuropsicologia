"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Beaker,
  Loader2,
  Undo2,
  Zap,
} from "lucide-react";
import useSound from "use-sound";
import {
  useWaterSortEngine,
  WaterSortTelemetry,
} from "@/hooks/useWaterSortEngine";

interface WaterSortProps {
  config: {
    title?: string;
    instruction?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
  onFinishMission?: (
    telemetry: WaterSortTelemetry,
    score: number,
  ) => Promise<void>;
}

export default function WaterSortGame({
  config,
  onFinishMission,
}: WaterSortProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- AUDIO ---
  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-ship.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playClink] = useSound("/sounds/glass-clink.mp3", { volume: 0.6 });
  const [playPour] = useSound("/sounds/pour-water.mp3", { volume: 0.8 });
  const [playError] = useSound("/sounds/error-buzz.mp3", { volume: 0.4 });
  const [playUndo] = useSound("/sounds/rewind.mp3", { volume: 0.5 });
  const [playLevelUp] = useSound("/sounds/ui-correct.mp3", { volume: 0.7 });

  const handleGameFinish = async (
    telemetry: WaterSortTelemetry,
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
    tubes,
    selectedTube,
    canUndo,
    actions,
  } = useWaterSortEngine(config, handleGameFinish);

  // --- WRAPPERS CON EFECTOS DE SONIDO ---
  const onTubeClick = (index: number) => {
    if (selectedTube === null) {
      if (tubes[index].length > 0 && soundEnabled) playClink();
    } else if (selectedTube === index) {
      if (soundEnabled) playClink(); // Deseleccionar
    } else {
      // Intentar verter
      const sourceTop = tubes[selectedTube][tubes[selectedTube].length - 1];
      const targetTop =
        tubes[index].length > 0 ? tubes[index][tubes[index].length - 1] : null;
      const isTargetFull = tubes[index].length >= 4; // TUBE_CAPACITY

      if (isTargetFull || (targetTop !== null && targetTop !== sourceTop)) {
        if (soundEnabled) playError();
      } else {
        if (soundEnabled) playPour();
      }
    }
    actions.handleTubeClick(index);
  };

  const onUndo = () => {
    if (soundEnabled) playUndo();
    actions.undoMove();
  };

  // Monitor para victoria de nivel
  const [prevStage, setPrevStage] = useState(currentStage);
  useEffect(() => {
    if (currentStage > prevStage) {
      if (soundEnabled) playLevelUp();
      setPrevStage(currentStage);
    }
  }, [currentStage, prevStage, soundEnabled, playLevelUp]);

  useEffect(() => {
    return () => stopBg();
  }, [stopBg]);

  const startGame = () => {
    if (soundEnabled) playBg();
    setPrevStage(1);
    actions.startGame();
  };

  // Saber si completó el nivel actual (para mostrar el cartel)
  const isLevelCleared =
    tubes.length > 0 &&
    tubes.every(
      (tube) =>
        tube.length === 0 ||
        (tube.length === 4 && tube.every((color) => color === tube[0])),
    );

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
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

        <div className="text-right w-1/3 flex justify-end items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs text-slate-400 uppercase">Puntaje</p>
            <p className="text-xl font-mono text-cyan-400">{score}</p>
          </div>
          {/* BOTÓN DESHACER CLÍNICO */}
          <Button
            onClick={onUndo}
            disabled={!canUndo || isLevelCleared}
            className="bg-amber-600 hover:bg-amber-500 text-white rounded-full p-2 h-10 w-10 disabled:opacity-50 disabled:bg-slate-700 transition-all shadow-md"
            title="Deshacer último movimiento"
          >
            <Undo2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* VIEWPORT PRINCIPAL */}
      <div
        id="lab-viewport"
        className="relative min-h-[500px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-6"
        style={{ touchAction: "manipulation" }}
      >
        {/* Fondo Parallax / Laboratorio */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(6,182,212,0.2) 40px, rgba(6,182,212,0.2) 80px)",
          }}
        />

        <AnimatePresence>
          {isSaving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center"
            >
              <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-4" />
              <h3 className="text-2xl font-bold text-white tracking-widest">
                GUARDANDO DATOS DE LABORATORIO...
              </h3>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === "playing" ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* TUBOS DE ENSAYO (Wrap adaptativo) */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 max-w-3xl z-10">
              {tubes.map((tube, index) => {
                const isSelected = selectedTube === index;

                return (
                  <motion.div
                    key={`tube-${index}`}
                    animate={{ y: isSelected ? -20 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => onTubeClick(index)}
                    className={`
                      relative w-14 h-48 sm:w-16 sm:h-56 cursor-pointer
                      rounded-t-sm rounded-b-full border-x-4 border-b-4 
                      ${isSelected ? "border-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.4)]" : "border-slate-400 shadow-xl"}
                      bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col-reverse
                      transition-colors duration-200
                    `}
                  >
                    {/* Brillo del cristal */}
                    <div className="absolute inset-y-0 left-1 w-2 bg-white/20 rounded-full z-20 pointer-events-none" />

                    {/* BLOQUES DE LÍQUIDO */}
                    {/* flex-col-reverse hace que el índice 0 quede abajo */}
                    <AnimatePresence initial={false}>
                      {tube.map((colorClass, i) => (
                        <motion.div
                          key={`liquid-${index}-${i}`}
                          layout // 🔥 ESTA LÍNEA ES LA MAGIA DE LA FLUIDEZ 🔥
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "25%", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: "tween", duration: 0.2 }}
                          className={`w-full ${colorClass} opacity-90 shadow-[inset_0_-4px_8px_rgba(0,0,0,0.3)] relative`}
                        >
                          {/* Burbujitas (Solo estéticas en la capa superior) */}
                          {i === tube.length - 1 && (
                            <div className="absolute top-1 left-1/4 w-2 h-2 rounded-full bg-white/40 animate-ping" />
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* CARTEL DE SECTOR COMPLETADO */}
            <AnimatePresence>
              {isLevelCleared && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 50 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="absolute z-[60] mt-10 pointer-events-none"
                >
                  <div className="bg-cyan-900/90 backdrop-blur-md text-white px-8 py-4 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.8)] border-2 border-cyan-400 text-center">
                    <Beaker className="w-12 h-12 mx-auto mb-2 text-cyan-300" />
                    <h3 className="text-2xl font-black uppercase tracking-widest">
                      Compuesto {currentStage}
                    </h3>
                    <p className="font-bold text-cyan-200">
                      ¡Sintetizado con éxito!
                    </p>
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
                    ¡LABORATORIO CERRADO!
                  </h2>
                  <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                    <p className="text-slate-400 mb-2">Puntaje Base</p>
                    <p className="text-5xl font-mono text-cyan-300">{score}</p>
                    <p className="text-sm text-slate-400 mt-4">
                      Compuestos Sintetizados:{" "}
                      <span className="text-cyan-400 font-bold">
                        {currentStage - 1}
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" /> Iniciar Nuevo
                    Experimento
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                    <Beaker className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {config.title || "Laboratorio de Fluidos"}
                  </h2>
                  <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                    <p className="text-slate-300 text-sm sm:text-base">
                      Haz clic en un tubo para seleccionarlo y luego en otro
                      para verter el líquido. Tu objetivo es separar todos los
                      colores para que cada tubo tenga un solo color.
                    </p>
                    <p className="text-cyan-400 font-bold text-sm bg-cyan-900/20 p-3 rounded-lg flex items-start gap-2">
                      <Zap className="w-5 h-5 shrink-0 mt-0.5" />
                      <span>
                        Regla Estricta: Solo puedes verter un líquido sobre otro
                        del <strong>MISMO COLOR</strong>, y siempre que el tubo
                        tenga espacio. Si te equivocas, usa el botón Deshacer.
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                  >
                    <Play className="mr-2 h-5 w-5" /> ENTRAR AL LABORATORIO
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
