"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Bot,
  RotateCcw,
  Play,
  Volume2,
  VolumeX,
  ShieldAlert,
} from "lucide-react";
import useSound from "use-sound";

type Direction = "up" | "down" | "left" | "right";
type RuleType = "direct" | "reverse";

interface ReverseGameProps {
  config: {
    title?: string;
    instruction?: string;
    targetImage?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

const opposites: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const directions: Direction[] = ["up", "down", "left", "right"];

export default function ReverseCommunicatorGame({ config }: ReverseGameProps) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  // CORRECCIÓN: Ahora TODAS las dificultades mezclan Verde (Directo) y Rojo (Inverso).
  // Lo único que cambia es el tiempo que tiene el niño para reaccionar.
  const settings = {
    easy: { timePerTurn: 10000 }, // 10 segundos para pensar
    medium: { timePerTurn: 8000 }, // 8 segundos
    hard: { timePerTurn: 4000 }, // 4 segundos (Muy rápido)
  }[difficulty];

  // --- AUDIO ENGINE ---
  const [playBg, { stop: stopBg }] = useSound("/sounds/ambient-ship.mp3", {
    loop: true,
    volume: 0.2,
  });
  const [playCorrect, { stop: stopCorrect }] = useSound(
    "/sounds/ui-correct.mp3",
    { volume: 0.5 },
  );
  const [playError, { stop: stopError }] = useSound("/sounds/ui-error.mp3", {
    volume: 0.6,
  });

  const [playUp, { stop: stopUp }] = useSound("/sounds/voice-up.mp3", {
    volume: 0.8,
  });
  const [playDown, { stop: stopDown }] = useSound("/sounds/voice-down.mp3", {
    volume: 0.8,
  });
  const [playLeft, { stop: stopLeft }] = useSound("/sounds/voice-left.mp3", {
    volume: 0.8,
  });
  const [playRight, { stop: stopRight }] = useSound("/sounds/voice-right.mp3", {
    volume: 0.8,
  });

  const stopAllVoices = useCallback(() => {
    stopUp();
    stopDown();
    stopLeft();
    stopRight();
  }, [stopUp, stopDown, stopLeft, stopRight]);

  // --- ESTADOS ---
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [currentDir, setCurrentDir] = useState<Direction | null>(null);
  const [currentRule, setCurrentRule] = useState<RuleType>("reverse");
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  const [turnProgress, setTurnProgress] = useState(100);

  // Refs
  const turnTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const turnStartTime = useRef<number>(0);
  const timeLimit = useRef(settings.timePerTurn);

  // --- LIMPIEZA ---
  const clearTurnTimers = useCallback(() => {
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, []);

  const playVoice = useCallback(
    (dir: Direction) => {
      if (!soundEnabled) return;
      stopAllVoices();
      if (dir === "up") playUp();
      if (dir === "down") playDown();
      if (dir === "left") playLeft();
      if (dir === "right") playRight();
    },
    [soundEnabled, stopAllVoices, playUp, playDown, playLeft, playRight],
  );

  // --- MANEJO DE ERROR POR TIEMPO ---
  const handleMiss = useCallback(() => {
    clearTurnTimers();
    stopAllVoices();
    stopCorrect();

    setFeedback("miss");
    setCombo(0);
    if (soundEnabled) playError();

    timeLimit.current = settings.timePerTurn;

    setTimeout(() => {
      setGameState((prev) => {
        if (prev === "playing") nextTurn();
        return prev;
      });
    }, 1200);
  }, [
    clearTurnTimers,
    stopAllVoices,
    stopCorrect,
    soundEnabled,
    playError,
    settings.timePerTurn,
  ]);

  // --- GENERAR NUEVO COMANDO ---
  const nextTurn = useCallback(() => {
    clearTurnTimers();
    setFeedback(null);
    setTurnProgress(100);

    const newDir = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDir(newDir);

    // CORRECCIÓN: Ahora siempre hay 50% de probabilidad de ser Verde o Rojo
    const isDirect = Math.random() > 0.5;
    setCurrentRule(isDirect ? "direct" : "reverse");

    playVoice(newDir);
    turnStartTime.current = Date.now();

    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - turnStartTime.current;
      const remaining = Math.max(0, 100 - (elapsed / timeLimit.current) * 100);
      setTurnProgress(remaining);

      if (remaining === 0) handleMiss();
    }, 50);
  }, [clearTurnTimers, handleMiss, playVoice]);

  // --- INPUT DEL USUARIO ---
  const handleInput = useCallback(
    (inputDir: Direction) => {
      if (gameState !== "playing" || feedback !== null || currentDir === null)
        return;

      clearTurnTimers();
      stopAllVoices();
      stopError();

      const expectedDir =
        currentRule === "direct" ? currentDir : opposites[currentDir];

      if (inputDir === expectedDir) {
        // ACIERTO
        const reactionTime = Date.now() - turnStartTime.current;
        const speedBonus = Math.max(
          0,
          Math.floor((timeLimit.current - reactionTime) / 10),
        );

        setCombo((prev) => prev + 1);
        setScore((s) => s + 100 + speedBonus + combo * 20);
        setFeedback("hit");

        if (soundEnabled) playCorrect();
        timeLimit.current = Math.max(800, timeLimit.current - 50);
      } else {
        // ERROR
        setFeedback("miss");
        setCombo(0);
        timeLimit.current = settings.timePerTurn;

        if (soundEnabled) playError();
        triggerShake();
      }

      setTimeout(
        () => {
          setGameState((prev) => {
            if (prev === "playing") nextTurn();
            return prev;
          });
        },
        inputDir === expectedDir ? 800 : 1200,
      );
    },
    [
      gameState,
      feedback,
      currentDir,
      currentRule,
      combo,
      nextTurn,
      soundEnabled,
      playCorrect,
      playError,
      stopAllVoices,
      stopError,
      settings.timePerTurn,
      clearTurnTimers,
    ],
  );

  // --- EFECTOS VISUALES ---
  const triggerShake = () => {
    const container = document.getElementById("captain-screen");
    if (container) {
      container.classList.add("animate-shake", "bg-red-900/30");
      setTimeout(
        () => container.classList.remove("animate-shake", "bg-red-900/30"),
        500,
      );
    }
  };

  // --- CRONÓMETRO GLOBAL ---
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

  // --- SOPORTE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing" || feedback !== null) return;

      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          handleInput("up");
          break;
        case "ArrowDown":
          e.preventDefault();
          handleInput("down");
          break;
        case "ArrowLeft":
          e.preventDefault();
          handleInput("left");
          break;
        case "ArrowRight":
          e.preventDefault();
          handleInput("right");
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, feedback, handleInput]);

  // --- INICIO Y FIN ---
  const startGame = () => {
    if (soundEnabled) playBg();
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    timeLimit.current = settings.timePerTurn;
    setGameState("playing");
    nextTurn();
  };

  const finishGame = () => {
    stopBg();
    stopAllVoices();
    clearTurnTimers();
    setGameState("finished");
  };

  useEffect(() => {
    return () => {
      stopBg();
      stopAllVoices();
      clearTurnTimers();
    };
  }, [stopBg, stopAllVoices, clearTurnTimers]);

  const renderArrow = (dir: Direction, className: string = "") => {
    switch (dir) {
      case "up":
        return <ArrowUp className={className} />;
      case "down":
        return <ArrowDown className={className} />;
      case "left":
        return <ArrowLeft className={className} />;
      case "right":
        return <ArrowRight className={className} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled && gameState === "playing") playBg();
              if (soundEnabled) {
                stopBg();
                stopAllVoices();
              }
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>
          <div className="text-xl font-mono text-cyan-400">PTS: {score}</div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3 flex justify-end">
          {combo > 1 && (
            <div className="animate-bounce text-yellow-400 font-bold bg-yellow-900/30 px-3 py-1 rounded-lg border border-yellow-600">
              x{combo}
            </div>
          )}
        </div>
      </div>

      {/* VIEWPORT PRINCIPAL */}
      <div
        id="captain-screen"
        className="relative min-h-[600px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-between p-4 sm:p-6"
        style={{ touchAction: "none" }}
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at center, #334155 0%, #020617 100%)",
          }}
        />

        {gameState === "playing" ? (
          <>
            {/* BARRA DE TIEMPO DEL TURNO */}
            <div className="w-full max-w-md h-2 bg-slate-800 rounded-full overflow-hidden mt-2 z-10 shrink-0">
              <div
                className={`h-full transition-all duration-75 ${turnProgress > 50 ? "bg-green-500" : turnProgress > 25 ? "bg-yellow-500" : "bg-red-500"}`}
                style={{ width: `${turnProgress}%` }}
              />
            </div>

            {/* PANTALLA DEL COMUNICADOR (Centro) */}
            <div className="relative flex-1 flex items-center justify-center w-full z-10 py-4">
              <AnimatePresence mode="wait">
                {feedback === null && currentDir ? (
                  <motion.div
                    key="command"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                    className="flex flex-col items-center"
                  >
                    {/* AVATAR DEL CAPITÁN */}
                    <div className="w-24 h-24 rounded-full border-4 border-slate-700 bg-slate-800 flex items-center justify-center mb-4 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      {config.targetImage ? (
                        <img
                          src={config.targetImage}
                          className="w-full h-full object-cover"
                          alt="Capitán"
                        />
                      ) : (
                        <Bot className="w-12 h-12 text-slate-400" />
                      )}
                      <div
                        className={`absolute inset-0 opacity-30 ${currentRule === "direct" ? "bg-green-500" : "bg-red-500"}`}
                      />
                    </div>

                    {/* FLECHA DE DIRECCIÓN */}
                    <div
                      className={`p-4 rounded-3xl border-4 ${currentRule === "direct" ? "border-green-500 bg-green-900/20 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)]" : "border-red-500 bg-red-900/20 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.4)]"}`}
                    >
                      {renderArrow(currentDir, "w-20 h-20")}
                    </div>

                    <p className="mt-4 text-lg font-bold uppercase tracking-widest text-slate-300">
                      {currentRule === "direct" ? "¡IGUAL!" : "¡INVERSO!"}
                    </p>
                  </motion.div>
                ) : (
                  feedback && (
                    <motion.div
                      key="feedback"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      className={`text-5xl font-bold ${feedback === "hit" ? "text-green-400 drop-shadow-[0_0_20px_#4ade80]" : "text-red-500 drop-shadow-[0_0_20px_#ef4444]"}`}
                    >
                      {feedback === "hit" ? "¡CORRECTO!" : "¡ERROR!"}
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>

            {/* CONTROLES DIRECCIONALES */}
            <div className="w-full max-w-xs grid grid-cols-3 gap-2 pb-4 z-10 shrink-0">
              <div />
              <Button
                onClick={() => handleInput("up")}
                className="h-16 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <ArrowUp className="w-8 h-8" />
              </Button>
              <div />
              <Button
                onClick={() => handleInput("left")}
                className="h-16 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <ArrowLeft className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => handleInput("down")}
                className="h-16 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <ArrowDown className="w-8 h-8" />
              </Button>
              <Button
                onClick={() => handleInput("right")}
                className="h-16 bg-slate-800 hover:bg-cyan-600 border-2 border-slate-600 hover:border-cyan-400 text-white rounded-2xl transition-all active:scale-95"
              >
                <ArrowRight className="w-8 h-8" />
              </Button>
            </div>
          </>
        ) : (
          /* PANTALLAS DE INICIO / FIN */
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
            {gameState === "finished" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Transmisión Finalizada!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">{score}</p>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-red-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/50">
                  <ShieldAlert className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Comunicador Inverso"}
                </h2>
                <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                      <ArrowUp className="w-5 h-5 text-white transform rotate-180" />
                    </div>
                    <span className="text-slate-300">
                      Flecha <strong>ROJA</strong> = ¡Haz lo CONTRARIO!
                    </span>
                  </div>
                  {/* CORRECCIÓN: Ahora siempre mostramos la instrucción de la flecha verde */}
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <ArrowUp className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-300">
                      Flecha <strong>VERDE</strong> = Haz lo mismo.
                    </span>
                  </div>
                </div>
                <Button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2 h-5 w-5" /> ABRIR COMUNICADOR
                </Button>
                <p className="text-xs text-slate-500">
                  Usa los botones o las flechas de tu teclado.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
