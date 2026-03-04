"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

// Función auxiliar para pausas asíncronas (Piedra angular de este juego)
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface MemoryGameProps {
  config: {
    title?: string;
    instruction?: string;
    duration?: number;
    difficulty?: "easy" | "medium" | "hard";
  };
}

export default function MemoryMatrixGame({ config }: MemoryGameProps) {
  const duration = config.duration || 60;
  const difficulty = config.difficulty || "medium";

  // --- CONFIGURACIÓN DE DIFICULTAD ---
  const settings = {
    easy: { startLength: 3, maxLength: 5, reverseChance: 0, speed: 800 },
    medium: { startLength: 4, maxLength: 6, reverseChance: 0.3, speed: 600 },
    hard: { startLength: 5, maxLength: 8, reverseChance: 0.5, speed: 400 },
  }[difficulty];

  // --- AUDIO ---
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

  // --- ESTADOS VISUALES ---
  const [gameState, setGameState] = useState<"start" | "playing" | "finished">(
    "start",
  );
  const [phase, setPhase] = useState<
    "idle" | "showing" | "waiting" | "input" | "feedback"
  >("idle");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [currentSequence, setCurrentSequence] = useState<number[]>([]);
  const [isReverse, setIsReverse] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [userStepIndex, setUserStepIndex] = useState(0);
  const [securityLevel, setSecurityLevel] = useState(1);
  const [currentLengthUI, setCurrentLengthUI] = useState(settings.startLength);

  // --- REFS DE CONTROL (LA SOLUCIÓN AL BUG) ---
  // Estos valores nunca sufren de "Stale Closures", siempre están actualizados
  const gameActiveRef = useRef(false);
  const currentLengthRef = useRef(settings.startLength);

  // --- 1. GENERACIÓN DE SECUENCIA ---
  const generateSequence = useCallback((length: number) => {
    const newSeq = [];
    let lastNum = -1;
    for (let i = 0; i < length; i++) {
      let nextNum;
      do {
        nextNum = Math.floor(Math.random() * 9);
      } while (nextNum === lastNum); // Evita que el mismo botón se ilumine dos veces seguidas
      newSeq.push(nextNum);
      lastNum = nextNum;
    }
    return newSeq;
  }, []);

  // --- 2. REPRODUCCIÓN VISUAL DE SECUENCIA ---
  const playSequence = useCallback(
    async (sequence: number[], reverseModus: boolean) => {
      setPhase("showing");

      if (soundEnabled) {
        if (reverseModus) playVoiceReverse();
        else playVoiceDirect();
      }

      await sleep(1000);

      for (let i = 0; i < sequence.length; i++) {
        // Verificación clave: Si el usuario salió del juego, abortar inmediatamente
        if (!gameActiveRef.current) return;

        setActiveButton(sequence[i]);
        if (soundEnabled) playLight();

        await sleep(settings.speed);
        setActiveButton(null);
        await sleep(settings.speed / 2);
      }

      if (!gameActiveRef.current) return;

      // RETENCIÓN COGNITIVA
      setPhase("waiting");
      await sleep(1500);

      if (gameActiveRef.current) {
        setPhase("input");
      }
    },
    [
      soundEnabled,
      playVoiceReverse,
      playVoiceDirect,
      playLight,
      settings.speed,
    ],
  );

  // --- 3. GESTOR DE RONDAS ---
  const startRound = useCallback(async () => {
    if (!gameActiveRef.current) return;

    setUserStepIndex(0);
    const reverse = Math.random() < settings.reverseChance;
    setIsReverse(reverse);

    const seq = generateSequence(currentLengthRef.current);
    setCurrentSequence(seq);

    await playSequence(seq, reverse);
  }, [generateSequence, playSequence, settings.reverseChance]);

  // --- 4. INPUT DEL USUARIO ---
  const handleInput = async (index: number) => {
    if (phase !== "input" || !gameActiveRef.current) return;

    if (soundEnabled) playPress();
    setActiveButton(index);
    setTimeout(() => {
      if (gameActiveRef.current) setActiveButton(null);
    }, 200);

    const expectedSequence = isReverse
      ? [...currentSequence].reverse()
      : currentSequence;
    const expectedIndex = expectedSequence[userStepIndex];

    if (index === expectedIndex) {
      // ACIERTO PARCIAL
      const nextStep = userStepIndex + 1;
      setUserStepIndex(nextStep);

      if (nextStep === currentSequence.length) {
        // ACIERTO TOTAL DE SECUENCIA
        setPhase("feedback");
        if (soundEnabled) playGranted();

        const points = currentLengthRef.current * 100 * (isReverse ? 2 : 1);
        setScore((s) => s + points);
        setSecurityLevel((l) => l + 1);

        // Aumentar dificultad
        if (currentLengthRef.current < settings.maxLength) {
          currentLengthRef.current += 1;
          setCurrentLengthUI(currentLengthRef.current);
        }

        await sleep(1500);
        if (gameActiveRef.current) startRound();
      }
    } else {
      // ERROR
      setPhase("feedback");
      if (soundEnabled) playDenied();
      triggerShake();

      // Bajar dificultad para no frustrar
      if (currentLengthRef.current > settings.startLength) {
        currentLengthRef.current -= 1;
        setCurrentLengthUI(currentLengthRef.current);
      }

      await sleep(2000);
      if (gameActiveRef.current) startRound();
    }
  };

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

  // --- CRONÓMETRO ---
  useEffect(() => {
    if (gameState === "playing" && timeLeft <= 0) {
      finishGame();
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === "playing" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  // --- INICIO Y FIN ---
  const startGame = () => {
    if (soundEnabled) playBg();

    // Reiniciar Valores
    setScore(0);
    setTimeLeft(duration);
    currentLengthRef.current = settings.startLength;
    setCurrentLengthUI(settings.startLength);
    setSecurityLevel(1);

    // Activar Ref de Control
    gameActiveRef.current = true;
    setGameState("playing");

    // Retraso seguro antes de la primera ronda
    setTimeout(() => {
      startRound();
    }, 800);
  };

  const finishGame = () => {
    gameActiveRef.current = false;
    stopBg();
    setPhase("idle");
    setGameState("finished");
  };

  // Limpiar memoria al cambiar de página
  useEffect(() => {
    return () => {
      gameActiveRef.current = false;
      stopBg();
    };
  }, [stopBg]);

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans select-none relative">
      {/* HUD DASHBOARD */}
      <div className="bg-slate-900 border-b-4 border-slate-700 p-4 rounded-t-xl flex justify-between items-center shadow-lg z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled && gameState === "playing") playBg();
              if (soundEnabled) stopBg();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-cyan-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          <div className="text-sm font-mono text-slate-400 uppercase hidden sm:block">
            Nivel:{" "}
            <span className="text-cyan-400 font-bold">{securityLevel}</span>
          </div>
        </div>

        <div className="text-3xl font-mono font-bold text-slate-200">
          {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
        </div>

        <div className="text-right w-1/3">
          <div className="text-sm text-slate-400 uppercase hidden sm:block">
            Puntaje
          </div>
          <div className="text-2xl font-mono text-cyan-400">{score}</div>
        </div>
      </div>

      {/* VIEWPORT PRINCIPAL */}
      <div
        id="security-panel"
        className="relative min-h-[600px] w-full bg-slate-950 overflow-hidden rounded-b-xl border-x-4 border-b-4 border-slate-800 shadow-2xl flex flex-col items-center justify-center p-4"
        style={{ touchAction: "manipulation" }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {gameState === "playing" ? (
          <div className="w-full flex flex-col items-center">
            {/* INSTRUCCIÓN DINÁMICA */}
            <div className="h-16 mb-8 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {phase === "showing" && (
                  <motion.div
                    key="showing"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p
                      className={`text-2xl font-bold uppercase tracking-widest animate-pulse ${isReverse ? "text-purple-400" : "text-cyan-400"}`}
                    >
                      {isReverse ? "MEMORIZA (INVERSO)" : "MEMORIZA PATRÓN"}
                    </p>
                  </motion.div>
                )}
                {phase === "waiting" && (
                  <motion.div
                    key="waiting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-slate-500 text-xl tracking-widest flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" /> PROCESANDO...
                  </motion.div>
                )}
                {phase === "input" && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center"
                  >
                    <p
                      className={`text-2xl font-bold uppercase tracking-widest ${isReverse ? "text-purple-400 drop-shadow-[0_0_15px_#c084fc]" : "text-green-400 drop-shadow-[0_0_15px_#4ade80]"}`}
                    >
                      {isReverse ? "¡INGRESA AL REVÉS!" : "¡INGRESA CÓDIGO!"}
                    </p>
                    <div className="flex gap-2 justify-center mt-2">
                      {/* Indicadores de progreso del usuario */}
                      {Array.from({ length: currentLengthUI }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${i < userStepIndex ? "bg-green-400 shadow-[0_0_8px_#4ade80]" : "bg-slate-700"}`}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
                {phase === "feedback" && (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, scale: 1.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    {userStepIndex === currentSequence.length ? (
                      <p className="text-3xl font-bold text-green-400 tracking-widest flex items-center gap-2">
                        <Unlock className="w-8 h-8" /> ACCESO CONCEDIDO
                      </p>
                    ) : (
                      <p className="text-3xl font-bold text-red-500 tracking-widest flex items-center gap-2">
                        <ShieldAlert className="w-8 h-8" /> ACCESO DENEGADO
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* MATRIZ 3x3 (GRID) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 z-10 p-6 bg-slate-900/50 rounded-3xl border border-slate-700 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
                const isActive = activeButton === index;
                // Efecto de iluminación difiere según el modo
                const glowColor = isReverse
                  ? "shadow-[0_0_30px_#c084fc] bg-purple-500 border-purple-300"
                  : "shadow-[0_0_30px_#22d3ee] bg-cyan-400 border-cyan-200";

                return (
                  <motion.button
                    key={index}
                    whileTap={phase === "input" ? { scale: 0.9 } : {}}
                    onClick={() => handleInput(index)}
                    disabled={phase !== "input"}
                    className={`
                      w-20 h-20 sm:w-28 sm:h-28 rounded-2xl border-4 transition-all duration-150
                      ${
                        isActive
                          ? glowColor
                          : "bg-slate-800 border-slate-700 hover:border-slate-500 shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                      }
                      ${phase === "input" ? "cursor-pointer hover:bg-slate-700" : "cursor-default"}
                    `}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* PANTALLAS DE INICIO / FIN */
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center">
            {gameState === "finished" ? (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                <h2 className="text-4xl font-bold text-cyan-400">
                  ¡Hackeo Completado!
                </h2>
                <div className="bg-slate-800/80 p-6 rounded-2xl border border-cyan-500/30">
                  <p className="text-slate-400 mb-2">Puntaje Final</p>
                  <p className="text-5xl font-mono text-cyan-300">{score}</p>
                </div>
                <p className="text-sm text-slate-400">
                  Niveles de seguridad vulnerados:{" "}
                  <span className="text-cyan-400 font-bold">
                    {securityLevel - 1}
                  </span>
                </p>
                <Button
                  onClick={startGame}
                  className="bg-cyan-600 hover:bg-cyan-500 text-lg px-8 py-6 rounded-xl"
                >
                  <RotateCcw className="mr-2 h-5 w-5" /> Nueva Incursión
                </Button>
              </div>
            ) : (
              <div className="space-y-6 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-24 h-24 bg-cyan-900/30 rounded-full flex items-center justify-center mx-auto border-2 border-cyan-500/50">
                  <Grid3X3 className="w-12 h-12 text-cyan-400" />
                </div>
                <h2 className="text-3xl font-bold text-white">
                  {config.title || "Panel de Seguridad"}
                </h2>
                <div className="text-left bg-slate-800/50 p-6 rounded-xl space-y-4 border border-slate-700">
                  <p className="text-slate-300 text-lg leading-relaxed">
                    Observa la secuencia de luces y repítela para desbloquear la
                    puerta.
                  </p>
                  {settings.reverseChance > 0 && (
                    <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/50 rounded-xl">
                      <p className="text-purple-300 text-sm font-bold uppercase mb-1 tracking-wider flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Alerta de Sistema
                      </p>
                      <p className="text-slate-300 text-sm">
                        Ocasionalmente la seguridad pedirá ingresar el código{" "}
                        <strong>AL REVÉS</strong>. ¡Presta atención a la
                        instrucción de color MORADO!
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={startGame}
                  className="bg-green-600 hover:bg-green-500 text-lg px-10 py-6 rounded-xl shadow-lg w-full transform hover:scale-105 transition-all"
                >
                  <Play className="mr-2 h-5 w-5" /> HACKEAR PANEL
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
