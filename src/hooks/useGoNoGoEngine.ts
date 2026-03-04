// src/hooks/useGoNoGoEngine.ts
import { useState, useRef, useCallback, useEffect } from "react";

export type GameState = "start" | "playing" | "finished";
export type StimulusType =
  | "waiting"
  | "go"
  | "no-go"
  | "feedback-hit"
  | "feedback-crash";

export type TelemetryEvent = {
  stimulus: "go" | "no-go";
  reactionTimeMs: number;
  success: boolean;
};

interface EngineConfig {
  duration?: number;
  initialWindow?: number;
  minWindow?: number;
  speedIncrement?: number;
  onHit?: (combo: number) => void;
  onCrash?: () => void;
  onFinish?: (score: number, telemetry: TelemetryEvent[]) => void;
}

export function useGoNoGoEngine({
  duration = 60,
  initialWindow = 1500,
  minWindow = 800,
  speedIncrement = 80,
  onHit,
  onCrash,
  onFinish,
}: EngineConfig) {
  // Estados visuales y de progreso
  const [gameState, setGameState] = useState<GameState>("start");
  const [currentStimulus, setCurrentStimulus] =
    useState<StimulusType>("waiting");
  const [timeLeft, setTimeLeft] = useState(duration);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  // Referencias mutables (no causan re-renders)
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const reactionWindowRef = useRef(initialWindow);
  const speedLevelRef = useRef(1);
  const telemetryRef = useRef<TelemetryEvent[]>([]);

  const clearGameTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const scheduleNextStimulus = useCallback(() => {
    setCurrentStimulus("waiting");
    const baseDelay = Math.max(500, 1500 - speedLevelRef.current * 200);
    const finalDelay = baseDelay + Math.random() * 1000;

    clearGameTimer();
    timerRef.current = setTimeout(spawnStimulus, finalDelay);
  }, []);

  const spawnStimulus = () => {
    const isGo = Math.random() < 0.7; // 70% de probabilidad de que sea GO (estándar clínico)
    setCurrentStimulus(isGo ? "go" : "no-go");
    startTimeRef.current = Date.now();

    clearGameTimer();
    timerRef.current = setTimeout(() => {
      handleFeedback(isGo ? "crash" : "hit", !isGo, true);
    }, reactionWindowRef.current);
  };

  const handleFeedback = (
    type: "hit" | "crash",
    success: boolean,
    isTimeout: boolean = false,
  ) => {
    setCurrentStimulus(type === "hit" ? "feedback-hit" : "feedback-crash");

    const reactionTime = isTimeout
      ? reactionWindowRef.current
      : Date.now() - startTimeRef.current;

    // Guardar telemetría clínica
    telemetryRef.current.push({
      stimulus: type === "hit" && success ? "go" : "no-go", // simplificado para el log
      reactionTimeMs: reactionTime,
      success,
    });

    if (success) {
      setCombo((c) => {
        const newCombo = c + 1;
        if (onHit) onHit(newCombo);
        setScore((s) => s + 100 * Math.min(newCombo, 5));
        return newCombo;
      });
      speedLevelRef.current = Math.min(speedLevelRef.current + 0.2, 5);
      reactionWindowRef.current = Math.max(
        reactionWindowRef.current - speedIncrement,
        minWindow,
      );
    } else {
      if (onCrash) onCrash();
      setCombo(0);
      speedLevelRef.current = Math.max(1, speedLevelRef.current - 0.5);
      reactionWindowRef.current = Math.min(
        reactionWindowRef.current + 200,
        initialWindow,
      );
    }

    clearGameTimer();
    timerRef.current = setTimeout(scheduleNextStimulus, 1000);
  };

  const handleAction = () => {
    if (gameState !== "playing") return;
    if (currentStimulus !== "go" && currentStimulus !== "no-go") return;

    clearGameTimer();
    if (currentStimulus === "go") {
      handleFeedback("hit", true);
    } else if (currentStimulus === "no-go") {
      handleFeedback("crash", false);
    }
  };

  const startGame = () => {
    clearGameTimer();
    telemetryRef.current = [];
    setScore(0);
    setCombo(0);
    setTimeLeft(duration);
    speedLevelRef.current = 1;
    reactionWindowRef.current = initialWindow;
    setGameState("playing");
    scheduleNextStimulus();
  };

  const finishGame = useCallback(() => {
    clearGameTimer();
    setGameState("finished");
    setCurrentStimulus("waiting");
    if (onFinish) onFinish(score, telemetryRef.current);
  }, [score, onFinish]);

  // Cronómetro del juego
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
  }, [gameState, timeLeft, finishGame]);

  // Teclado (Barra espaciadora)
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

  // Limpieza al desmontar
  useEffect(() => {
    return () => clearGameTimer();
  }, []);

  return {
    gameState,
    currentStimulus,
    timeLeft,
    score,
    combo,
    startGame,
    handleAction,
  };
}
