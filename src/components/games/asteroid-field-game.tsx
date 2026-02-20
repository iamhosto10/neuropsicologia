"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

// IMPORTAMOS EL HOOK DE SONIDO
// Nota: Si te da error de importación, recuerda hacer 'npm install use-sound'
import useSound from "use-sound";

interface AsteroidGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    distractorImages?: string[];
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

export default function AsteroidFieldGame({ config }: AsteroidGameProps) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  const settings = {
    easy: { initialWindow: 2000, minWindow: 1000, speedIncrement: 50 },
    medium: { initialWindow: 1500, minWindow: 800, speedIncrement: 80 },
    hard: { initialWindow: 1000, minWindow: 500, speedIncrement: 100 },
  }[difficulty];

  // --- SONIDOS ---
  // Reemplaza estas rutas con tus archivos reales en /public/sounds/
  const [playBackground, { stop: stopBackground }] = useSound(
    "/sounds/ambient-space.mp3",
    {
      loop: true,
      volume: 0.3,
    },
  );

  const [playHit] = useSound("/sounds/laser-shoot.mp3", { volume: 0.5 });
  const [playCrash] = useSound("/sounds/error-buzz.mp3", { volume: 0.6 });
  const [playCombo] = useSound("/sounds/combo-powerup.mp3", { volume: 0.7 });
  const [playClick] = useSound("/sounds/ui-click.mp3", { volume: 0.2 }); // Opcional para botones

  // --- ESTADOS ---
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true); // Toggle de sonido

  type StimulusType =
    | "waiting"
    | "go"
    | "no-go"
    | "feedback-hit"
    | "feedback-crash";
  const [currentStimulus, setCurrentStimulus] =
    useState<StimulusType>("waiting");

  // --- REFS ---
  const reactionWindowRef = useRef(settings.initialWindow);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const gameActiveRef = useRef(false);

  // --- LIMPIEZA ---
  const clearGameTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // --- FASE 1: PROGRAMAR ---
  const scheduleNextStimulus = useCallback(() => {
    if (!gameActiveRef.current) return;

    setCurrentStimulus("waiting");

    const baseDelay = Math.max(500, 1500 - speedLevel * 200);
    const randomVariation = Math.random() * 1000;
    const finalDelay = baseDelay + randomVariation;

    clearGameTimer();
    timerRef.current = setTimeout(() => {
      spawnStimulus();
    }, finalDelay);
  }, [speedLevel]);

  // --- FASE 2: APARECER ---
  const spawnStimulus = () => {
    if (!gameActiveRef.current) return;

    const isGo = Math.random() < 0.7;
    setCurrentStimulus(isGo ? "go" : "no-go");
    startTimeRef.current = Date.now();

    clearGameTimer();
    timerRef.current = setTimeout(() => {
      handleFeedback(isGo ? "crash" : "hit", !isGo);
    }, reactionWindowRef.current);
  };

  // --- FASE 3: FEEDBACK ---
  const handleFeedback = (
    type: "hit" | "crash",
    success: boolean,
    bonusPoints: number = 0,
  ) => {
    if (!gameActiveRef.current) return;

    setCurrentStimulus(type === "hit" ? "feedback-hit" : "feedback-crash");

    if (success) {
      const currentCombo = combo + 1;
      setCombo(currentCombo);

      // SONIDOS DE ÉXITO
      if (soundEnabled) {
        if (currentCombo > 1 && currentCombo % 3 === 0) {
          playCombo(); // Sonido especial cada 3 combos
        } else {
          playHit();
        }
      }

      const comboMultiplier = Math.min(currentCombo, 5);
      setScore((s) => s + 100 * comboMultiplier + Math.floor(bonusPoints / 10));

      setSpeedLevel((prev) => Math.min(prev + 0.2, 5));
      reactionWindowRef.current = Math.max(
        reactionWindowRef.current - settings.speedIncrement,
        settings.minWindow,
      );
    } else {
      // SONIDO DE ERROR
      if (soundEnabled) playCrash();

      setCombo(0);
      setSpeedLevel((prev) => Math.max(1, prev - 0.5));
      reactionWindowRef.current = Math.min(
        reactionWindowRef.current + 200,
        settings.initialWindow,
      );
      triggerShake();
    }

    clearGameTimer();
    timerRef.current = setTimeout(() => {
      scheduleNextStimulus();
    }, 1000);
  };

  const handleAction = () => {
    if (gameState !== "playing") return;
    if (currentStimulus !== "go" && currentStimulus !== "no-go") return;

    clearGameTimer();

    if (currentStimulus === "go") {
      const reactionTime = Date.now() - startTimeRef.current;
      const speedBonus = Math.max(0, 1000 - reactionTime);
      handleFeedback("hit", true, speedBonus);
    } else if (currentStimulus === "no-go") {
      handleFeedback("crash", false);
    }
  };

  const triggerShake = () => {
    const container = document.getElementById("cockpit-view");
    if (container) {
      container.classList.add("animate-shake", "bg-red-900/40");
      setTimeout(
        () => container.classList.remove("animate-shake", "bg-red-900/40"),
        500,
      );
    }
  };

  // --- CRONÓMETRO ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            finishGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  // Tecla Espacio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState === "playing") {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, currentStimulus]);

  // --- INICIO Y FIN ---
  const startGame = () => {
    clearGameTimer();
    gameActiveRef.current = true;

    // Iniciar música de fondo
    if (soundEnabled) {
      playClick();
      playBackground();
    }

    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    setSpeedLevel(1);
    reactionWindowRef.current = settings.initialWindow;
    setGameState("playing");

    scheduleNextStimulus();
  };

  const finishGame = () => {
    gameActiveRef.current = false;
    stopBackground(); // Detener música
    clearGameTimer();
    setCurrentStimulus("waiting");
    setGameState("finished");
  };

  // Limpieza al salir de la página
  useEffect(() => {
    return () => {
      stopBackground();
      gameActiveRef.current = false;
      clearGameTimer();
    };
  }, [stopBackground]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          {/* BOTÓN TOGGLE DE SONIDO */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled && gameState === "playing") playBackground();
              if (soundEnabled) stopBackground();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
            title={soundEnabled ? "Silenciar" : "Activar Sonido"}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {combo > 1 && (
            <div className="flex items-center gap-2 animate-pulse text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg border border-yellow-600">
              <Flame className="w-5 h-5 fill-yellow-500" />
              <span className="text-sm">x{combo}</span>
            </div>
          )}
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3">
          <p className="text-xs text-slate-400 uppercase">Puntaje</p>
          <p className="text-2xl font-mono text-cyan-400">{score}</p>
        </div>
      </div>

      {/* VIEWPORT */}
      <div
        id="cockpit-view"
        onClick={handleAction}
        className="relative h-[500px] w-full bg-black overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl cursor-pointer active:scale-[0.99] transition-transform"
        style={{ touchAction: "manipulation" }}
      >
        {/* Fondo animado */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(white 2px, transparent 2px)",
            backgroundSize: "50px 50px",
          }}
        >
          {gameState === "playing" && (
            <div
              className="absolute inset-0 animate-[ping_3s_linear_infinite]"
              style={{ animationDuration: `${2.5 / speedLevel}s` }}
            />
          )}
        </div>

        {/* Zona de Estímulos */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            {/* GO (VERDE) */}
            {currentStimulus === "go" && (
              <motion.div
                key="go"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {config.targetImage ? (
                  <img
                    src={config.targetImage}
                    className="w-56 h-56 object-contain drop-shadow-[0_0_30px_#4ade80]"
                    alt="GO"
                  />
                ) : (
                  <div className="w-56 h-56 rounded-full border-[12px] border-green-500 shadow-[0_0_50px_#22c55e] flex items-center justify-center bg-green-900/20">
                    <Hexagon className="w-28 h-28 text-green-400" />
                  </div>
                )}
                <p className="absolute -bottom-16 left-0 right-0 text-center text-green-400 font-bold text-3xl animate-pulse tracking-widest">
                  ¡YA!
                </p>
              </motion.div>
            )}

            {/* NO-GO (ROJO) */}
            {currentStimulus === "no-go" && (
              <motion.div
                key="nogo"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative"
              >
                {config.distractorImages?.[0] ? (
                  <img
                    src={config.distractorImages[0]}
                    className="w-56 h-56 object-contain drop-shadow-[0_0_30px_#ef4444]"
                    alt="STOP"
                  />
                ) : (
                  <div className="w-56 h-56 rounded-full border-[12px] border-red-500 shadow-[0_0_50px_#ef4444] flex items-center justify-center bg-red-900/20">
                    <AlertTriangle className="w-28 h-28 text-red-500" />
                  </div>
                )}
                <p className="absolute -bottom-16 left-0 right-0 text-center text-red-500 font-bold text-3xl tracking-widest">
                  ¡ALTO!
                </p>
              </motion.div>
            )}

            {/* FEEDBACK HIT */}
            {currentStimulus === "feedback-hit" && (
              <motion.div
                key="hit"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center"
              >
                <div className="text-cyan-400 font-bold text-6xl drop-shadow-[0_0_20px_#22d3ee] border-4 border-cyan-400 p-4 rounded-xl bg-slate-900/80">
                  BIEN
                </div>
                {combo > 1 && (
                  <div className="text-yellow-400 font-mono text-xl mt-4 animate-bounce">
                    +{100 * combo} PTS
                  </div>
                )}
              </motion.div>
            )}

            {/* FEEDBACK CRASH */}
            {currentStimulus === "feedback-crash" && (
              <motion.div
                key="crash"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-red-500 font-bold text-6xl drop-shadow-[0_0_20px_#ef4444] border-4 border-red-500 p-4 rounded-xl bg-slate-900/80"
              >
                MAL
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Pantallas de Inicio / Fin */}
        {gameState !== "playing" && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
            {gameState === "finished" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-yellow-400">
                  ¡Trayecto Finalizado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-yellow-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">{score}</p>
                </div>
                <p className="text-sm text-slate-400">
                  Mejor racha:{" "}
                  <span className="text-yellow-400 font-bold">
                    {combo > 0 ? combo : "Sin racha"}
                  </span>
                </p>
                <Button
                  onClick={startGame}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-green-500/50">
                  <Zap className="w-12 h-12 text-green-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Campo de Asteroides"}
                </h2>
                <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <Hexagon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-300">
                      Si ves <strong>VERDE</strong>: ¡CLIC RÁPIDO!
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-300">
                      Si ves <strong>ROJO</strong>: ¡NO TOQUES NADA!
                    </span>
                  </div>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2 h-5 w-5" /> DESPEGAR
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
