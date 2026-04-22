"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  Crosshair,
  Navigation,
  Anchor,
  Loader2,
} from "lucide-react";
import useSound from "use-sound";
import { useDockingEngine, DockingTelemetry } from "@/hooks/useDockingEngine";

interface StarDockingProps {
  config: {
    title?: string;
    instruction?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
  // Función universal que recibe desde el page.tsx para guardar el progreso
  onFinishMission?: (
    telemetry: DockingTelemetry,
    score: number,
  ) => Promise<void>;
}

export default function StarDockingGame({
  config,
  onFinishMission,
}: StarDockingProps) {
  // --- ESTADOS DE UI Y AUDIO ---
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // CANDADO VISUAL (SOP)

  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-ship.mp3", {
    loop: true,
    volume: 0.3,
  });
  const [playRotate] = useSound("/sounds/ui-click.mp3", { volume: 0.4 });
  const [playSuccess] = useSound("/sounds/ui-correct.mp3", { volume: 0.6 });
  const [playError] = useSound("/sounds/wall-crash.mp3", { volume: 0.5 });

  // --- CONEXIÓN CON EL CEREBRO (HOOK) ---
  const handleGameFinish = async (
    telemetry: DockingTelemetry,
    finalScore: number,
  ) => {
    stopBg();
    setIsSaving(true); // Bloqueamos la UI mientras guarda
    if (onFinishMission) {
      await onFinishMission(telemetry, finalScore);
    }
    setIsSaving(false);
  };

  const {
    gameState,
    timeLeft,
    score,
    targetAngle,
    currentAngle,
    feedback,
    settings,
    actions,
  } = useDockingEngine(config, handleGameFinish);

  // --- WRAPPERS DE ACCIÓN CON SONIDO ---
  const handleRotate = (dir: "left" | "right") => {
    if (soundEnabled && feedback === null && gameState === "playing")
      playRotate();
    actions.rotate(dir);
  };

  const handleDock = () => {
    if (gameState !== "playing" || feedback !== null) return;
    actions.attemptDock();
  };

  // Efectos de sonido para el feedback
  useEffect(() => {
    if (!soundEnabled || feedback === null) return;
    if (feedback === "success") playSuccess();
    if (feedback === "error") playError();
  }, [feedback, soundEnabled, playSuccess, playError]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing" || feedback !== null) return;
      if (e.code === "ArrowLeft") handleRotate("left");
      if (e.code === "ArrowRight") handleRotate("right");
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleDock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, feedback, handleRotate, handleDock]);

  // Limpieza final de audio
  useEffect(() => {
    return () => stopBg();
  }, [stopBg]);

  const startGame = () => {
    if (soundEnabled) playBg();
    actions.startGame();
  };

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
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-slate-400 uppercase">Tolerancia</p>
            <p className="text-sm font-bold text-cyan-400">
              ±{settings.errorMargin}°
            </p>
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

      {/* VIEWPORT PRINCIPAL */}
      <div
        id="docking-viewport"
        className="relative h-150 w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-between p-4 sm:p-6"
        style={{ touchAction: "manipulation" }}
      >
        {/* Fondo del Espacio */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
          }}
        />

        {/* --- PANTALLA DE GUARDANDO (CANDADO VISUAL) --- */}
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
                GUARDANDO TELEMETRÍA...
              </h3>
              <p className="text-slate-400 mt-2">
                Transfiriendo datos a la base principal.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {gameState === "playing" ? (
          <>
            {/* ZONA DE ACOPLAMIENTO (Centro Gráfico) */}
            <div className="relative flex-1 flex flex-col items-center justify-center w-full z-10">
              {/* Estación Espacial (Objetivo) */}
              <div className="relative w-64 h-64 mb-8">
                {/* Anillo exterior decorativo */}
                <div className="absolute inset-0 rounded-full border-16 border-slate-800/50" />

                {/* Puerto de Acoplamiento (Rotado dinámicamente) */}
                <motion.div
                  animate={{ rotate: targetAngle }}
                  transition={{ type: "spring", stiffness: 50 }}
                  className="absolute inset-0 rounded-full border-16 border-transparent border-t-cyan-500/80 drop-shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-start justify-center"
                >
                  {/* Indicador del puerto */}
                  <div className="w-8 h-8 bg-cyan-400 -mt-4 rounded-sm shadow-[0_0_15px_#22d3ee]" />
                </motion.div>

                {/* Feedback Visual */}
                <AnimatePresence>
                  {feedback && (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center z-30"
                    >
                      <div
                        className={`px-6 py-2 rounded-full font-bold text-2xl tracking-widest text-white shadow-2xl ${feedback === "success" ? "bg-green-500 shadow-green-500/50" : "bg-red-600 shadow-red-500/50"}`}
                      >
                        {feedback === "success" ? "¡ACOPLADO!" : "¡ERROR!"}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* NAVE DEL JUGADOR (Rotada por el usuario) */}
                <motion.div
                  animate={{ rotate: currentAngle }}
                  // Animación instantánea (tween) para respuesta táctil inmediata sin lag elástico
                  transition={{ type: "tween", duration: 0.1 }}
                  className="absolute inset-0 flex items-center justify-center z-20"
                >
                  {/* Diseño de la nave (Apunta hacia "arriba" por defecto) */}
                  <div className="w-20 h-32 flex flex-col items-center">
                    {/* Nariz de la nave */}
                    <div
                      className={`w-0 h-0 border-l-20 border-l-transparent border-r-20 border-r-transparent border-b-30 transition-colors ${feedback === "success" ? "border-b-green-400" : feedback === "error" ? "border-b-red-500" : "border-b-white"}`}
                    />
                    {/* Cuerpo */}
                    <div
                      className={`w-10 h-20 rounded-b-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-colors ${feedback === "success" ? "bg-green-500" : feedback === "error" ? "bg-red-600" : "bg-slate-300"}`}
                    />
                  </div>
                </motion.div>
              </div>

              {/* Información de rotación (Opcional, para guiar al inicio) */}
              <div className="bg-slate-900/60 px-4 py-2 rounded-full border border-slate-700 backdrop-blur-sm">
                <p className="font-mono text-slate-300">
                  Nave:{" "}
                  <span className="text-white font-bold">{currentAngle}°</span>
                </p>
              </div>
            </div>

            {/* CONTROLES DE PILOTAJE */}
            <div className="w-full max-w-sm flex items-center justify-between gap-4 z-10 pb-4 shrink-0">
              <Button
                onClick={() => handleRotate("left")}
                disabled={feedback !== null}
                className="h-20 flex-1 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <RotateCcw className="w-8 h-8 -scale-x-100" />
              </Button>

              <Button
                onClick={handleDock}
                disabled={feedback !== null}
                className="h-24 flex-[1.5] bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white font-bold text-xl tracking-widest rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all active:scale-95 flex flex-col gap-1"
              >
                <Anchor className="w-6 h-6" /> ACOPLAR
              </Button>

              <Button
                onClick={() => handleRotate("right")}
                disabled={feedback !== null}
                className="h-20 flex-1 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <RotateCcw className="w-8 h-8" />
              </Button>
            </div>
          </>
        ) : (
          /* PANTALLAS DE INICIO / FIN (Bloqueadas si isSaving es true) */
          !isSaving && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
              {gameState === "finished" ? (
                <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                  <h2 className="text-4xl font-bold text-cyan-400">
                    ¡Turno Terminado!
                  </h2>
                  <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                    <p className="text-slate-400 mb-2">Puntaje Final</p>
                    <p className="text-5xl font-mono text-cyan-300">{score}</p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                  >
                    <Play className="mr-2 h-5 w-5" /> Jugar Otra Vez
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                    <Crosshair className="w-12 h-12 text-cyan-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {config.title || "Acoplamiento Estelar"}
                  </h2>
                  <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                    <p className="text-slate-300 text-lg leading-relaxed">
                      {config.instruction ||
                        "Usa los botones para rotar tu nave y alinearla con el puerto de la estación espacial. Cuando esté alineada, presiona ACOPLAR."}
                    </p>
                  </div>
                  <Button
                    onClick={startGame}
                    className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                  >
                    <Navigation className="mr-2 h-5 w-5" /> INICIAR SECUENCIA
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
